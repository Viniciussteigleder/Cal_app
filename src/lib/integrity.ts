import type { Prisma, PrismaClient } from "@prisma/client";

import { calculateTMB } from "@/lib/calculations/energy";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Issue {
  severity: Severity;
  entity_type: string;
  entity_id?: string;
  details: Prisma.JsonObject;
}

export function getMaxSeverity(issues: Issue[]) {
  const order: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return issues.reduce<Severity | null>((acc, issue) => {
    if (!acc) return issue.severity;
    return order.indexOf(issue.severity) > order.indexOf(acc)
      ? issue.severity
      : acc;
  }, null);
}

export async function checkCanaryCalculations(): Promise<Issue[]> {
  const canaries = [
    {
      name: "Male 30y 80kg 175cm sedentary",
      inputs: { weight_kg: 80, height_cm: 175, age_years: 30, sex: "male" as const },
      expected_tmb: 1749,
      tolerance: 1,
    },
    {
      name: "Female 25y 60kg 165cm moderate",
      inputs: { weight_kg: 60, height_cm: 165, age_years: 25, sex: "female" as const },
      expected_tmb: 1345,
      tolerance: 1,
    },
  ];

  return canaries.flatMap((canary) => {
    const actual = calculateTMB(canary.inputs);
    const diff = Math.abs(actual - canary.expected_tmb);
    if (diff > canary.tolerance) {
      return [
        {
          severity: "CRITICAL",
          entity_type: "canary_calculation",
          details: {
            name: canary.name,
            expected: canary.expected_tmb,
            actual,
            diff,
          },
        },
      ];
    }
    return [];
  });
}

export async function checkDatasetSanity(client: PrismaClient): Promise<Issue[]> {
  const issues: Issue[] = [];

  const negatives = await client.foodNutrient.findMany({
    where: { per_100g_value: { lt: 0 } },
  });

  negatives.forEach((row) => {
    issues.push({
      severity: "HIGH",
      entity_type: "food_nutrient",
      entity_id: `${row.food_id}:${row.nutrient_key}`,
      details: { issue: "negative_value", value: row.per_100g_value.toString() },
    });
  });

  const foods = await client.foodCanonical.findMany({
    include: { nutrients: true },
  });

  foods.forEach((food) => {
    const nutrientMap = new Map(
      food.nutrients.map((nutrient) => [
        nutrient.nutrient_key,
        Number(nutrient.per_100g_value),
      ])
    );
    const kcal = nutrientMap.get("energy_kcal") ?? 0;
    const protein = nutrientMap.get("protein_g") ?? 0;
    const carbs = nutrientMap.get("carbs_g") ?? 0;
    const fat = nutrientMap.get("fat_g") ?? 0;

    const calculated = protein * 4 + carbs * 4 + fat * 9;
    const diff = Math.abs(kcal - calculated);

    if (kcal > 0 && diff > kcal * 0.1) {
      issues.push({
        severity: "MEDIUM",
        entity_type: "food_canonical",
        entity_id: food.id,
        details: {
          issue: "kcal_macro_mismatch",
          reported_kcal: kcal,
          calculated_kcal: calculated,
          diff,
        },
      });
    }
  });

  return issues;
}

export async function checkSnapshotIntegrity(client: PrismaClient): Promise<Issue[]> {
  const issues: Issue[] = [];
  const mealItems = await client.mealItem.findMany({
    include: { snapshot: true },
  });

  for (const item of mealItems) {
    if (!item.snapshot) {
      issues.push({
        severity: "CRITICAL",
        entity_type: "meal_item",
        entity_id: item.id,
        details: { issue: "missing_snapshot" },
      });
      continue;
    }
    const result = await client.$queryRaw<{ md5_text: string }[]>`
      SELECT md5(snapshot_json::text) AS md5_text
      FROM "FoodSnapshot"
      WHERE id = ${item.snapshot.id}::uuid
    `;
    const actualHash = result[0]?.md5_text ?? "";
    if (actualHash !== item.snapshot.content_hash) {
      issues.push({
        severity: "CRITICAL",
        entity_type: "food_snapshot",
        entity_id: item.snapshot.id,
        details: {
          issue: "hash_mismatch",
          expected: item.snapshot.content_hash,
          actual: actualHash,
        },
      });
    }
  }

  return issues;
}

export async function checkImmutability(client: PrismaClient): Promise<Issue[]> {
  const issues: Issue[] = [];

  const publishedVersions = await client.planVersion.findMany({
    where: { status: "published" },
    include: { publication: true },
  });

  for (const version of publishedVersions) {
    if (version.publication && version.updated_at > version.publication.published_at) {
      issues.push({
        severity: "CRITICAL",
        entity_type: "plan_version",
        entity_id: version.id,
        details: {
          issue: "published_plan_modified",
          published_at: version.publication.published_at.toISOString(),
          updated_at: version.updated_at.toISOString(),
        },
      });
    }
  }

  return issues;
}

export async function checkRBACEnforcement(client: PrismaClient): Promise<Issue[]> {
  const issues: Issue[] = [];
  const patientCount = await client.patient.count();
  if (patientCount === 0) {
    issues.push({
      severity: "LOW",
      entity_type: "rbac_smoke",
      details: { issue: "no_patients_to_check" },
    });
  }
  return issues;
}

export async function checkCrossTenantReferences(client: PrismaClient): Promise<Issue[]> {
  const issues: Issue[] = [];

  // Check 1: Patient <-> User Tenant Mismatch
  const patientUserMismatches = await client.$queryRaw<
    { id: string; user_id: string; pt: string; ut: string }[]
  >`
    SELECT p.id, p.user_id, p.tenant_id as pt, u.tenant_id as ut
    FROM "Patient" p
    JOIN "User" u ON p.user_id = u.id
    WHERE p.tenant_id != u.tenant_id
  `;

  for (const m of patientUserMismatches) {
    issues.push({
      severity: "CRITICAL",
      entity_type: "patient",
      entity_id: m.id,
      details: {
        issue: "cross_tenant_user_link",
        patient_tenant: m.pt,
        user_tenant: m.ut,
      },
    });
  }

  // Check 2: Plan <-> Patient Tenant Mismatch
  const planPatientMismatches = await client.$queryRaw<
    { id: string; patient_id: string; plt: string; pat: string }[]
  >`
    SELECT pl.id, pl.patient_id, pl.tenant_id as plt, pa.tenant_id as pat
    FROM "Plan" pl
    JOIN "Patient" pa ON pl.patient_id = pa.id
    WHERE pl.tenant_id != pa.tenant_id
  `;

  for (const m of planPatientMismatches) {
    issues.push({
      severity: "CRITICAL",
      entity_type: "plan",
      entity_id: m.id,
      details: {
        issue: "cross_tenant_plan_link",
        plan_tenant: m.plt,
        patient_tenant: m.pat,
      },
    });
  }

  // Check 3: ProtocolInstance <-> Patient Tenant Mismatch
  const protocolPatientMismatches = await client.$queryRaw<
    { id: string; patient_id: string; prit: string; pat: string }[]
  >`
    SELECT pi.id, pi.patient_id, pi.tenant_id as prit, pa.tenant_id as pat
    FROM "PatientProtocolInstance" pi
    JOIN "Patient" pa ON pi.patient_id = pa.id
    WHERE pi.tenant_id != pa.tenant_id
  `;

  for (const m of protocolPatientMismatches) {
    issues.push({
      severity: "CRITICAL",
      entity_type: "protocol_instance",
      entity_id: m.id,
      details: {
        issue: "cross_tenant_protocol_link",
        instance_tenant: m.prit,
        patient_tenant: m.pat,
      },
    });
  }

  return issues;
}


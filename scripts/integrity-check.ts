import { prisma } from "../src/lib/db";
import { calculateTMB } from "../src/lib/calculations/energy";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface Issue {
  severity: Severity;
  entity_type: string;
  entity_id?: string;
  details: Record<string, unknown>;
}

function getExitCode(maxSeverity: Severity | null) {
  if (!maxSeverity) return 0;
  return { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[maxSeverity];
}

function getMaxSeverity(issues: Issue[]) {
  const order: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return issues.reduce<Severity | null>((acc, issue) => {
    if (!acc) return issue.severity;
    return order.indexOf(issue.severity) > order.indexOf(acc)
      ? issue.severity
      : acc;
  }, null);
}

async function checkCanaryCalculations(): Promise<Issue[]> {
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

async function checkDatasetSanity(client = prisma): Promise<Issue[]> {
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
      food.nutrients.map((nutrient) => [nutrient.nutrient_key, Number(nutrient.per_100g_value)])
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

async function checkSnapshotIntegrity(client = prisma): Promise<Issue[]> {
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
        details: { issue: "hash_mismatch", expected: item.snapshot.content_hash, actual: actualHash },
      });
    }
  }

  return issues;
}

async function checkImmutability(client = prisma): Promise<Issue[]> {
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
          published_at: version.publication.published_at,
          updated_at: version.updated_at,
        },
      });
    }
  }

  return issues;
}

async function checkRBACEnforcement(client = prisma): Promise<Issue[]> {
  const issues: Issue[] = [];
  // Smoke checks are placeholders; proper verification lives in unit tests.
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

async function runIntegrityChecks() {
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      "SELECT set_config('app.user_id', $1, true), set_config('app.tenant_id', $2, true), set_config('app.role', $3, true), set_config('app.owner_mode', $4, true), set_config('row_security', 'on', true)",
      "00000000-0000-0000-0000-000000000999",
      "00000000-0000-0000-0000-000000000000",
      "OWNER",
      "true"
    );

    const run = await tx.integrityCheckRun.create({
      data: {
        tenant_id: "00000000-0000-0000-0000-000000000000",
        run_type: "full",
        started_at: new Date(),
        status: "running",
      },
    });

    const issues: Issue[] = [];
    issues.push(...(await checkCanaryCalculations()));
    issues.push(...(await checkDatasetSanity(tx)));
    issues.push(...(await checkSnapshotIntegrity(tx)));
    issues.push(...(await checkImmutability(tx)));
    issues.push(...(await checkRBACEnforcement(tx)));

    for (const issue of issues) {
      await tx.integrityIssue.create({
        data: {
          tenant_id: run.tenant_id,
          run_id: run.id,
          severity: issue.severity,
          entity_type: issue.entity_type,
          entity_id: issue.entity_id,
          details_json: issue.details,
        },
      });
    }

    const maxSeverity = getMaxSeverity(issues);
    await tx.integrityCheckRun.update({
      where: { id: run.id },
      data: {
        finished_at: new Date(),
        status: maxSeverity === "CRITICAL" ? "failed" : "passed",
        summary_json: {
          total_issues: issues.length,
          by_severity: issues.reduce<Record<string, number>>((acc, issue) => {
            acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
            return acc;
          }, {}),
        },
      },
    });

    const counts = issues.reduce<Record<string, number>>((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
      return acc;
    }, {});

    console.log("Integrity check completed.");
    console.log(`Total issues: ${issues.length}`);
    console.log(`By severity: ${JSON.stringify(counts)}`);

    return { maxSeverity, issues };
  });

  const exitCode = getExitCode(result.maxSeverity);
  if (exitCode > 0) {
    process.exit(exitCode);
  }
}

runIntegrityChecks()
  .catch((error) => {
    console.error(error);
    process.exit(4);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

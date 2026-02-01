import type { PatientCategoryOverride, PatientDataPolicy } from "@prisma/client";

import { prisma, type SessionClaims, withSession } from "./db";

export interface ResolveSourceInput {
  policy: PatientDataPolicy;
  overrides: PatientCategoryOverride[];
  categoryCode: string;
}

export function resolveSource({
  policy,
  overrides,
  categoryCode,
}: ResolveSourceInput) {
  const override = overrides.find(
    (item) => item.category_code === categoryCode
  );
  const allowed = Array.isArray(policy.allowed_sources)
    ? (policy.allowed_sources as string[])
    : [];
  return override?.preferred_source ?? allowed[0] ?? "TACO";
}

export async function createFoodSnapshot({
  claims,
  patientId,
  foodId,
  categoryCode,
}: {
  claims: SessionClaims;
  patientId: string;
  foodId: string;
  categoryCode: string;
}) {
  return withSession(claims, async (tx) => {
    const policy = await tx.patientDataPolicy.findFirst({
      where: { patient_id: patientId, is_active: true },
      include: { category_overrides: true },
    });

    if (!policy) {
      throw new Error("Patient data policy not found.");
    }

    const source = resolveSource({
      policy,
      overrides: policy.category_overrides,
      categoryCode,
    });

    const nutrients = await tx.foodNutrient.findMany({
      where: { food_id: foodId, source, tenant_id: claims.tenant_id },
    });

    if (nutrients.length === 0) {
      throw new Error("No nutrient data for resolved source.");
    }

    const nutrientMap = nutrients.reduce<Record<string, number>>(
      (acc, nutrient) => {
        acc[nutrient.nutrient_key] = Number(nutrient.per_100g_value);
        return acc;
      },
      {}
    );

    const snapshotJson = {
      nutrients: nutrientMap,
      source,
      per_100g: true,
    };

    return tx.foodSnapshot.create({
      data: {
        tenant_id: claims.tenant_id,
        patient_id: patientId,
        food_id: foodId,
        snapshot_json: snapshotJson,
        source,
        dataset_release_id: nutrients[0].dataset_release_id,
      },
    });
  });
}

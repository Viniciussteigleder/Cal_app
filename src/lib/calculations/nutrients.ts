import { ROUNDING_POLICY, roundTo } from "./rounding";

export interface NutrientValues {
  energy_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export type CoverageStatus = "ok" | "partial" | "missing";

export function scaleNutrients(per100g: NutrientValues, grams: number) {
  const scale = grams / 100;
  return {
    energy_kcal: roundTo(
      per100g.energy_kcal * scale,
      ROUNDING_POLICY.energy_kcal.decimals
    ),
    protein_g: roundTo(
      per100g.protein_g * scale,
      ROUNDING_POLICY.protein_g.decimals
    ),
    carbs_g: roundTo(
      per100g.carbs_g * scale,
      ROUNDING_POLICY.carbs_g.decimals
    ),
    fat_g: roundTo(
      per100g.fat_g * scale,
      ROUNDING_POLICY.fat_g.decimals
    ),
    fiber_g: roundTo(
      per100g.fiber_g * scale,
      ROUNDING_POLICY.fiber_g.decimals
    ),
  };
}

export function sumNutrients(items: NutrientValues[]) {
  return items.reduce(
    (acc, item) => ({
      energy_kcal: acc.energy_kcal + item.energy_kcal,
      protein_g: acc.protein_g + item.protein_g,
      carbs_g: acc.carbs_g + item.carbs_g,
      fat_g: acc.fat_g + item.fat_g,
      fiber_g: acc.fiber_g + item.fiber_g,
    }),
    { energy_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );
}

export function calculateCoverage(actual: NutrientValues, target: NutrientValues) {
  const percentages = {
    energy: (actual.energy_kcal / target.energy_kcal) * 100,
    protein: (actual.protein_g / target.protein_g) * 100,
    carbs: (actual.carbs_g / target.carbs_g) * 100,
    fat: (actual.fat_g / target.fat_g) * 100,
  };

  const overall =
    (percentages.energy +
      percentages.protein +
      percentages.carbs +
      percentages.fat) /
    4;

  const status: CoverageStatus =
    overall >= 90 ? "ok" : overall >= 70 ? "partial" : "missing";

  return { status, percentages };
}

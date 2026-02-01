export const ROUNDING_POLICY = {
  energy_kcal: { decimals: 0, unit: "kcal" },
  protein_g: { decimals: 1, unit: "g" },
  carbs_g: { decimals: 1, unit: "g" },
  fat_g: { decimals: 1, unit: "g" },
  fiber_g: { decimals: 1, unit: "g" },
  micronutrients: { decimals: 2, unit: "mg" },
  percentages: { decimals: 0, unit: "%" },
} as const;

export function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

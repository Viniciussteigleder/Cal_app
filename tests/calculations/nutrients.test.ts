import { describe, expect, it } from "vitest";

import {
  calculateCoverage,
  scaleNutrients,
  sumNutrients,
} from "@/lib/calculations/nutrients";

describe("Nutrient calculations", () => {
  it("scales per 100g values", () => {
    const scaled = scaleNutrients(
      {
        energy_kcal: 100.7,
        protein_g: 10.15,
        carbs_g: 20.98,
        fat_g: 5.01,
        fiber_g: 2.99,
      },
      150
    );
    expect(scaled.energy_kcal).toBe(151);
    expect(scaled.protein_g).toBe(15.2);
  });

  it("sums nutrients", () => {
    const total = sumNutrients([
      { energy_kcal: 100, protein_g: 10, carbs_g: 20, fat_g: 5, fiber_g: 2 },
      { energy_kcal: 50, protein_g: 5, carbs_g: 10, fat_g: 2, fiber_g: 1 },
    ]);
    expect(total.energy_kcal).toBe(150);
    expect(total.protein_g).toBe(15);
  });

  it("calculates coverage status", () => {
    const coverage = calculateCoverage(
      { energy_kcal: 1800, protein_g: 80, carbs_g: 200, fat_g: 50, fiber_g: 30 },
      { energy_kcal: 2000, protein_g: 90, carbs_g: 220, fat_g: 60, fiber_g: 30 }
    );
    expect(coverage.status).toBe("ok");
  });
});

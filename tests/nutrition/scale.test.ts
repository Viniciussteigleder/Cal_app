import { describe, expect, it } from "vitest";

import { scaleNutrients, sumNutrients } from "@/lib/nutrition";
import { isSameDay } from "@/lib/dates";

describe("nutrition helpers", () => {
  it("scales nutrients by grams", () => {
    const nutrients = scaleNutrients({ energy_kcal: 200, protein_g: 10 }, 50);
    expect(nutrients.energy_kcal).toBeCloseTo(100, 1);
    expect(nutrients.protein_g).toBeCloseTo(5, 1);
  });

  it("sums nutrients across maps", () => {
    const total = sumNutrients(
      { energy_kcal: 100, protein_g: 5 },
      { energy_kcal: 50, protein_g: 2 }
    );
    expect(total.energy_kcal).toBeCloseTo(150, 1);
    expect(total.protein_g).toBeCloseTo(7, 1);
  });

  it("checks same day correctly", () => {
    const date = new Date("2026-02-01T10:00:00");
    const same = new Date("2026-02-01T23:59:00");
    const different = new Date("2026-02-02T00:01:00");
    expect(isSameDay(date, same)).toBe(true);
    expect(isSameDay(date, different)).toBe(false);
  });
});

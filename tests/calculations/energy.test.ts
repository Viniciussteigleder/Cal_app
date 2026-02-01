import { describe, expect, it } from "vitest";

import {
  applyGoalAdjustment,
  calculateTMB,
  calculateTDEE,
  enforceGuardrails,
} from "@/lib/calculations/energy";

describe("Energy calculations", () => {
  it("calculates TMB for male", () => {
    const tmb = calculateTMB({
      weight_kg: 80,
      height_cm: 175,
      age_years: 30,
      sex: "male",
    });
    expect(tmb).toBe(1749);
  });

  it("calculates TDEE with activity factor", () => {
    const tdee = calculateTDEE(1500, "moderate");
    expect(tdee).toBe(2325);
  });

  it("applies goal adjustment with guardrails", () => {
    const tdee = 2000;
    expect(() => applyGoalAdjustment(tdee, "loss", -0.3)).toThrow(
      "between -25% and -5%"
    );
  });

  it("enforces guardrails requiring override note", () => {
    expect(() => enforceGuardrails(1100, "female")).toThrow(
      "override_note required"
    );
    expect(enforceGuardrails(1100, "female", "Caso clínico")).toBe(1100);
  });
});

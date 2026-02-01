import { ROUNDING_POLICY, roundTo } from "./rounding";

export type BiologicalSex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "extra_active";
export type Goal = "maintain" | "loss" | "gain";

export interface TMBInputs {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: BiologicalSex;
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export function calculateTMB(inputs: TMBInputs) {
  const { weight_kg, height_cm, age_years, sex } = inputs;
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age_years;
  const tmb = sex === "male" ? base + 5 : base - 161;
  return roundTo(tmb, ROUNDING_POLICY.energy_kcal.decimals);
}

export function calculateTDEE(tmb: number, activityLevel: ActivityLevel) {
  return roundTo(
    tmb * ACTIVITY_FACTORS[activityLevel],
    ROUNDING_POLICY.energy_kcal.decimals
  );
}

export function applyGoalAdjustment(
  tdee: number,
  goal: Goal,
  customAdjustment?: number
) {
  const defaults: Record<Goal, number> = {
    maintain: 0,
    loss: -0.15,
    gain: 0.1,
  };

  const adjustment = customAdjustment ?? defaults[goal];

  if (goal === "loss" && (adjustment < -0.25 || adjustment > -0.05)) {
    throw new Error("Loss adjustment must be between -25% and -5%");
  }
  if (goal === "gain" && (adjustment < 0.05 || adjustment > 0.2)) {
    throw new Error("Gain adjustment must be between +5% and +20%");
  }

  return roundTo(
    tdee * (1 + adjustment),
    ROUNDING_POLICY.energy_kcal.decimals
  );
}

export function enforceGuardrails(
  kcalTarget: number,
  sex: BiologicalSex,
  overrideNote?: string
) {
  const minimum = sex === "female" ? 1200 : 1500;
  if (kcalTarget < minimum && !overrideNote) {
    throw new Error("Guardrail triggered: override_note required.");
  }
  return kcalTarget;
}

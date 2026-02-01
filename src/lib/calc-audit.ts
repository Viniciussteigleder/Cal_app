import { Prisma } from "@prisma/client";
import { prisma, type SessionClaims } from "./db";
import { ROUNDING_POLICY } from "./calculations/rounding";

export type CalcType = "TMB" | "TDEE" | "MEAL_TOTAL" | "DAY_TOTAL" | "PLAN_TOTAL";

export async function logCalcAudit({
  claims,
  patient_id,
  calc_type,
  inputs_json,
  params_json,
  output_json,
  dataset_release_id,
  override_note,
}: {
  claims: SessionClaims;
  patient_id?: string;
  calc_type: CalcType;
  inputs_json: Prisma.InputJsonValue;
  params_json: Prisma.InputJsonValue;
  output_json: Prisma.InputJsonValue;
  dataset_release_id?: string;
  override_note?: string;
}) {
  return prisma.calcAudit.create({
    data: {
      tenant_id: claims.tenant_id,
      patient_id,
      calc_type,
      inputs_json,
      params_json,
      output_json,
      rounding_policy: JSON.stringify(ROUNDING_POLICY),
      units_version: "v1",
      dataset_release_id,
      created_by: claims.user_id,
      override_note,
    },
  });
}

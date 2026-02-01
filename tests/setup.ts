import { config } from "dotenv";
config(); // Load .env file

import { beforeEach, afterAll } from "vitest";

import { prisma } from "./helpers";

beforeEach(async () => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "IntegrityIssue",
      "IntegrityCheckRun",
      "CalcAudit",
      "AuditEvent",
      "PlanPublication",
      "PlanApproval",
      "PlanItem",
      "PlanVersion",
      "Plan",
      "MealItem",
      "Meal",
      "FoodSnapshot",
      "PatientCategoryOverride",
      "PatientDataPolicy",
      "ValidationReport",
      "ImportJob",
      "FoodNutrient",
      "FoodAlias",
      "FoodCanonical",
      "Protocol",
      "Consultation",
      "PatientCondition",
      "PatientProfile",
      "Patient",
      "User",
      "DatasetRelease",
      "Tenant"
    RESTART IDENTITY CASCADE;
  `);
});

afterAll(async () => {
  await prisma.$disconnect();
});

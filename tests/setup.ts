import { config } from "dotenv";
config(); // Load .env file

import { beforeAll, beforeEach, afterAll } from "vitest";

import { prisma } from "./helpers";
import { withSession } from "@/lib/db";

// Ensure auth helpers have deterministic claims in tests before any imports execute.
process.env.VITEST = "1";
process.env.OPENAI_API_KEY ||= "test";
process.env.TEST_SESSION_CLAIMS = JSON.stringify({
  user_id: "00000000-0000-0000-0000-000000009001",
  tenant_id: "00000000-0000-0000-0000-000000009002",
  role: "TENANT_ADMIN",
});

beforeAll(async () => {
  // Tests rely on RLS behavior. Some local DBs may not be baselined for Prisma Migrate (P3005),
  // so we enforce the minimum RLS schema/policies directly for the security-critical tables.
  const stmts: string[] = [
    // App DB role (used by src/lib/db.ts via SET LOCAL ROLE)
    `DO $$
     BEGIN
       IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nutriplan_app') THEN
         CREATE ROLE nutriplan_app WITH LOGIN PASSWORD 'nutriplan_app_secret' NOSUPERUSER NOCREATEDB NOCREATEROLE;
       END IF;
     END $$;`,

    `GRANT USAGE ON SCHEMA public TO nutriplan_app;`,
    `GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO nutriplan_app;`,
    `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nutriplan_app;`,
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON TABLES TO nutriplan_app;`,
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO nutriplan_app;`,
    `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO nutriplan_app;`,

    // Enable + force RLS on core tables used by tests
    `ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;`,
    `ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "User" FORCE ROW LEVEL SECURITY;`,
    `ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "Patient" FORCE ROW LEVEL SECURITY;`,
    `ALTER TABLE "FoodSnapshot" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "FoodSnapshot" FORCE ROW LEVEL SECURITY;`,

    // Tenant policies
    `DROP POLICY IF EXISTS tenant_owner_access ON "Tenant";`,
    `CREATE POLICY tenant_owner_access ON "Tenant"
       FOR ALL USING (
         current_setting('app.role', true) = 'OWNER'
         AND current_setting('app.owner_mode', true) = 'true'
       )
       WITH CHECK (
         current_setting('app.role', true) = 'OWNER'
         AND current_setting('app.owner_mode', true) = 'true'
       );`,

    `DROP POLICY IF EXISTS tenant_member_select ON "Tenant";`,
    `CREATE POLICY tenant_member_select ON "Tenant"
       FOR SELECT
       USING (
         id = current_setting('app.tenant_id', true)::uuid
         OR (
           current_setting('app.role', true) = 'OWNER'
           AND current_setting('app.owner_mode', true) = 'true'
         )
       );`,

    `DROP POLICY IF EXISTS tenant_member_update ON "Tenant";`,
    `CREATE POLICY tenant_member_update ON "Tenant"
       FOR UPDATE
       USING (
         id = current_setting('app.tenant_id', true)::uuid
         AND current_setting('app.role', true) IN ('TENANT_ADMIN', 'TEAM')
       )
       WITH CHECK (
         id = current_setting('app.tenant_id', true)::uuid
         AND current_setting('app.role', true) IN ('TENANT_ADMIN', 'TEAM')
       );`,

    // User policy
    `DROP POLICY IF EXISTS user_isolation ON "User";`,
    `CREATE POLICY user_isolation ON "User"
       FOR ALL USING (
         tenant_id = current_setting('app.tenant_id', true)::uuid
         OR (current_setting('app.role', true) = 'OWNER' AND current_setting('app.owner_mode', true) = 'true')
       );`,

    // Patient policy
    `DROP POLICY IF EXISTS patient_isolation ON "Patient";`,
    `CREATE POLICY patient_isolation ON "Patient"
       FOR ALL USING (
         tenant_id = current_setting('app.tenant_id', true)::uuid
         AND (
           current_setting('app.role', true) = 'TENANT_ADMIN'
           OR (current_setting('app.role', true) = 'TEAM'
               AND assigned_team_id = current_setting('app.user_id', true)::uuid)
           OR (current_setting('app.role', true) = 'PATIENT'
               AND user_id = current_setting('app.user_id', true)::uuid)
         )
         OR (current_setting('app.role', true) = 'OWNER'
             AND current_setting('app.owner_mode', true) = 'true')
       );`,

    // FoodSnapshot policies (immutability)
    // Important: do NOT have any UPDATE/DELETE-allowing policy on FoodSnapshot.
    // In Postgres, policies for the same command are OR'ed; a permissive FOR ALL policy would
    // override a "no_update/no_delete" policy.
    `DROP POLICY IF EXISTS default_tenant_policy_snapshot ON "FoodSnapshot";`,
    `DROP POLICY IF EXISTS food_snapshot_select ON "FoodSnapshot";`,
    `DROP POLICY IF EXISTS food_snapshot_insert ON "FoodSnapshot";`,
    `DROP POLICY IF EXISTS food_snapshot_insert_owner ON "FoodSnapshot";`,
    `DROP POLICY IF EXISTS food_snapshot_no_update ON "FoodSnapshot";`,
    `DROP POLICY IF EXISTS food_snapshot_no_delete ON "FoodSnapshot";`,

    `CREATE POLICY food_snapshot_select ON "FoodSnapshot"
       FOR SELECT USING (
         tenant_id = current_setting('app.tenant_id', true)::uuid
         OR (current_setting('app.role', true) = 'OWNER'
             AND current_setting('app.owner_mode', true) = 'true')
       );`,
    `CREATE POLICY food_snapshot_insert ON "FoodSnapshot"
       FOR INSERT WITH CHECK (
         tenant_id = current_setting('app.tenant_id', true)::uuid
       );`,
  ];

  for (const stmt of stmts) {
    // `executeRawUnsafe` doesn't allow multiple statements; run them individually.
    await prisma.$executeRawUnsafe(stmt);
  }
});

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

  // Seed the tenant/user referenced by TEST_SESSION_CLAIMS so server actions can run AIService checks.
  const claims = process.env.TEST_SESSION_CLAIMS
    ? (JSON.parse(process.env.TEST_SESSION_CLAIMS) as { user_id: string; tenant_id: string; role: string })
    : null;
  if (claims?.tenant_id && claims?.user_id) {
    await withSession(
      { user_id: "00000000-0000-0000-0000-000000009999", tenant_id: claims.tenant_id, role: "OWNER" },
      async (tx) => {
        await tx.tenant.create({
          data: { id: claims.tenant_id, name: "Test Tenant", type: "B2C", status: "active" },
        });
        await tx.user.create({
          data: {
            id: claims.user_id,
            email: "test-user@nutriplan.local",
            name: "Test User",
            role: (claims.role as any) || "TENANT_ADMIN",
            tenant_id: claims.tenant_id,
            status: "active",
          },
        });
      },
      { ownerMode: true }
    );
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

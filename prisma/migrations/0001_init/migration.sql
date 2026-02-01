CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "TenantType" AS ENUM ('B2C', 'B2B');
CREATE TYPE "TenantStatus" AS ENUM ('active', 'suspended', 'archived');
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'TENANT_ADMIN', 'TEAM', 'PATIENT');
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');
CREATE TYPE "PatientStatus" AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE "BiologicalSex" AS ENUM ('male', 'female');
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'light', 'moderate', 'very_active', 'extra_active');
CREATE TYPE "Goal" AS ENUM ('maintain', 'loss', 'gain');
CREATE TYPE "ConditionType" AS ENUM ('allergy', 'intolerance', 'disease', 'other');
CREATE TYPE "Severity" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "FoodGroup" AS ENUM ('grains', 'dairy', 'protein', 'fruits', 'vegetables', 'legumes', 'oils', 'sweets', 'beverages', 'other');
CREATE TYPE "RegionTag" AS ENUM ('BR', 'DE', 'GLOBAL');
CREATE TYPE "Region" AS ENUM ('BR', 'DE', 'MIXED', 'US');
CREATE TYPE "NutrientKey" AS ENUM ('energy_kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g');
CREATE TYPE "QualityFlag" AS ENUM ('verified', 'estimated', 'incomplete');
CREATE TYPE "ReleaseStatus" AS ENUM ('draft', 'validated', 'published', 'archived');
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE "PlanStatus" AS ENUM ('active', 'archived');
CREATE TYPE "VersionStatus" AS ENUM ('draft', 'reviewed', 'approved', 'published', 'archived');
CREATE TYPE "AuditAction" AS ENUM (
  'CREATE',
  'UPDATE',
  'DELETE_SOFT',
  'APPROVE',
  'PUBLISH',
  'ARCHIVE',
  'POLICY_CHANGE',
  'SNAPSHOT_CREATE',
  'DATASET_PUBLISH',
  'LOGIN',
  'SUPPORT_ACCESS'
);
CREATE TYPE "CalcType" AS ENUM ('TMB', 'TDEE', 'MEAL_TOTAL', 'DAY_TOTAL', 'PLAN_TOTAL');
CREATE TYPE "CheckStatus" AS ENUM ('running', 'passed', 'failed');
CREATE TYPE "IssueSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE "Tenant" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "type" "TenantType" NOT NULL,
  "status" "TenantStatus" NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "User" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "role" "UserRole" NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE RESTRICT,
  "status" "UserStatus" NOT NULL
);

CREATE TABLE "Patient" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE RESTRICT,
  "user_id" uuid REFERENCES "User"("id") ON DELETE SET NULL,
  "assigned_team_id" uuid,
  "status" "PatientStatus" NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "PatientProfile" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL UNIQUE REFERENCES "Patient"("id") ON DELETE CASCADE,
  "sex" "BiologicalSex" NOT NULL,
  "birth_date" timestamptz NOT NULL,
  "height_cm" numeric NOT NULL,
  "current_weight_kg" numeric NOT NULL,
  "target_weight_kg" numeric,
  "activity_level" "ActivityLevel" NOT NULL,
  "goal" "Goal" NOT NULL
);

CREATE TABLE "PatientCondition" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "type" "ConditionType" NOT NULL,
  "name" text NOT NULL,
  "severity" "Severity" NOT NULL,
  "notes" text
);

CREATE TABLE "Consultation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Protocol" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "FoodCanonical" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "name" text NOT NULL,
  "group" "FoodGroup" NOT NULL,
  "region_tag" "RegionTag" NOT NULL,
  "is_generic" boolean NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "FoodAlias" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "food_id" uuid NOT NULL REFERENCES "FoodCanonical"("id") ON DELETE CASCADE,
  "alias" text NOT NULL,
  "locale" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "DatasetRelease" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "region" "Region" NOT NULL,
  "source_name" text NOT NULL,
  "version_label" text NOT NULL,
  "published_at" timestamptz,
  "status" "ReleaseStatus" NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "FoodNutrient" (
  "tenant_id" uuid NOT NULL,
  "food_id" uuid NOT NULL REFERENCES "FoodCanonical"("id") ON DELETE CASCADE,
  "nutrient_key" "NutrientKey" NOT NULL,
  "per_100g_value" numeric NOT NULL,
  "unit" text NOT NULL,
  "source" text NOT NULL,
  "dataset_release_id" uuid NOT NULL REFERENCES "DatasetRelease"("id") ON DELETE CASCADE,
  "quality_flag" "QualityFlag" NOT NULL,
  PRIMARY KEY ("tenant_id", "food_id", "nutrient_key", "dataset_release_id")
);

CREATE TABLE "ImportJob" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "dataset_release_id" uuid REFERENCES "DatasetRelease"("id") ON DELETE SET NULL,
  "source_label" text NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz
);

CREATE TABLE "ValidationReport" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "dataset_release_id" uuid NOT NULL REFERENCES "DatasetRelease"("id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "details_json" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "PatientDataPolicy" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "version_number" int NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "default_region" "Region" NOT NULL,
  "allowed_sources" jsonb NOT NULL,
  "rules_json" jsonb,
  "notes" text,
  "updated_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("patient_id", "version_number")
);

CREATE TABLE "PatientCategoryOverride" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "policy_id" uuid NOT NULL REFERENCES "PatientDataPolicy"("id") ON DELETE CASCADE,
  "category_code" text NOT NULL,
  "preferred_source" text NOT NULL,
  "notes" text,
  UNIQUE ("policy_id", "category_code")
);

CREATE TABLE "FoodSnapshot" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "food_id" uuid NOT NULL REFERENCES "FoodCanonical"("id") ON DELETE CASCADE,
  "snapshot_json" jsonb NOT NULL,
  "source" text NOT NULL,
  "dataset_release_id" uuid NOT NULL REFERENCES "DatasetRelease"("id") ON DELETE RESTRICT,
  "content_hash" text GENERATED ALWAYS AS (md5(snapshot_json::text)) STORED,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Meal" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "date" timestamptz NOT NULL,
  "type" "MealType" NOT NULL,
  "totals_json" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "MealItem" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "meal_id" uuid NOT NULL REFERENCES "Meal"("id") ON DELETE CASCADE,
  "food_id" uuid NOT NULL REFERENCES "FoodCanonical"("id") ON DELETE RESTRICT,
  "grams" numeric NOT NULL,
  "snapshot_id" uuid NOT NULL REFERENCES "FoodSnapshot"("id") ON DELETE RESTRICT,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Plan" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "status" "PlanStatus" NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "PlanVersion" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "plan_id" uuid NOT NULL REFERENCES "Plan"("id") ON DELETE CASCADE,
  "version_no" int NOT NULL,
  "status" "VersionStatus" NOT NULL,
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("plan_id", "version_no")
);

CREATE TABLE "PlanItem" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "plan_version_id" uuid NOT NULL REFERENCES "PlanVersion"("id") ON DELETE CASCADE,
  "meal_type" "MealType" NOT NULL,
  "food_id" uuid NOT NULL REFERENCES "FoodCanonical"("id") ON DELETE RESTRICT,
  "grams" numeric NOT NULL,
  "snapshot_id" uuid NOT NULL REFERENCES "FoodSnapshot"("id") ON DELETE RESTRICT,
  "instructions" text
);

CREATE TABLE "PlanApproval" (
  "plan_version_id" uuid PRIMARY KEY REFERENCES "PlanVersion"("id") ON DELETE CASCADE,
  "tenant_id" uuid NOT NULL,
  "approved_by" uuid NOT NULL,
  "approved_at" timestamptz NOT NULL,
  "approval_note" text
);

CREATE TABLE "PlanPublication" (
  "plan_version_id" uuid PRIMARY KEY REFERENCES "PlanVersion"("id") ON DELETE CASCADE,
  "tenant_id" uuid NOT NULL,
  "published_by" uuid NOT NULL,
  "published_at" timestamptz NOT NULL
);

CREATE TABLE "AuditEvent" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "actor_user_id" uuid NOT NULL,
  "actor_role" "UserRole" NOT NULL,
  "action" "AuditAction" NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "before_json" jsonb,
  "after_json" jsonb,
  "reason" text,
  "request_id" uuid NOT NULL,
  "ip_hash" text,
  "user_agent" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "CalcAudit" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid,
  "calc_type" "CalcType" NOT NULL,
  "inputs_json" jsonb NOT NULL,
  "params_json" jsonb NOT NULL,
  "output_json" jsonb NOT NULL,
  "rounding_policy" text NOT NULL,
  "units_version" text NOT NULL,
  "dataset_release_id" uuid,
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "override_note" text
);

CREATE TABLE "IntegrityCheckRun" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "run_type" text NOT NULL,
  "started_at" timestamptz NOT NULL,
  "finished_at" timestamptz,
  "status" "CheckStatus" NOT NULL,
  "summary_json" jsonb
);

CREATE TABLE "IntegrityIssue" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL,
  "run_id" uuid NOT NULL REFERENCES "IntegrityCheckRun"("id") ON DELETE CASCADE,
  "severity" "IssueSeverity" NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text,
  "details_json" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "resolved_at" timestamptz
);

CREATE INDEX "idx_food_search" ON "FoodCanonical" USING GIN (to_tsvector('portuguese', name));
CREATE INDEX "idx_food_alias_search" ON "FoodAlias" USING GIN (to_tsvector('portuguese', alias));
CREATE INDEX "idx_food_nutrient_policy" ON "FoodNutrient" (food_id, dataset_release_id, nutrient_key);
CREATE INDEX "idx_patient_date" ON "Meal" (patient_id, date);
CREATE INDEX "idx_audit_event_entity" ON "AuditEvent" (tenant_id, entity_type, entity_id);
CREATE INDEX "idx_audit_event_created_at" ON "AuditEvent" (created_at);
CREATE INDEX "idx_calc_audit_tenant_patient" ON "CalcAudit" (tenant_id, patient_id);
CREATE INDEX "idx_calc_audit_created_at" ON "CalcAudit" (created_at);

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientCondition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Consultation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Protocol" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodCanonical" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodAlias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodNutrient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DatasetRelease" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImportJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ValidationReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientDataPolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientCategoryOverride" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Meal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanApproval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanPublication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalcAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrityCheckRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrityIssue" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_owner_access ON "Tenant"
  FOR ALL USING (
    current_setting('app.role', true) = 'OWNER'
    AND current_setting('app.owner_mode', true) = 'true'
  )
  WITH CHECK (
    current_setting('app.role', true) = 'OWNER'
    AND current_setting('app.owner_mode', true) = 'true'
  );

CREATE POLICY user_isolation ON "User"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER' AND current_setting('app.owner_mode', true) = 'true')
  );

CREATE POLICY patient_isolation ON "Patient"
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
  );

CREATE POLICY default_tenant_policy ON "PatientProfile"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_condition ON "PatientCondition"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_consultation ON "Consultation"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_protocol ON "Protocol"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_food ON "FoodCanonical"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_alias ON "FoodAlias"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_nutrient ON "FoodNutrient"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_dataset ON "DatasetRelease"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_import ON "ImportJob"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_validation ON "ValidationReport"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_policy ON "PatientDataPolicy"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_override ON "PatientCategoryOverride"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "PatientDataPolicy" p
      WHERE p.id = policy_id AND p.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_snapshot ON "FoodSnapshot"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_meal ON "Meal"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_meal_item ON "MealItem"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_plan ON "Plan"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_plan_version ON "PlanVersion"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_plan_item ON "PlanItem"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_plan_approval ON "PlanApproval"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_plan_pub ON "PlanPublication"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_audit ON "AuditEvent"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_calc ON "CalcAudit"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_integrity_run ON "IntegrityCheckRun"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );
CREATE POLICY default_tenant_policy_integrity_issue ON "IntegrityIssue"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

CREATE POLICY food_snapshot_no_update ON "FoodSnapshot" FOR UPDATE USING (false);
CREATE POLICY food_snapshot_no_delete ON "FoodSnapshot" FOR DELETE USING (false);

CREATE OR REPLACE FUNCTION prevent_published_plan_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'published' AND NEW.status = OLD.status THEN
    RAISE EXCEPTION 'Cannot update published plan version';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_published_plan_update_trigger
  BEFORE UPDATE ON "PlanVersion"
  FOR EACH ROW EXECUTE FUNCTION prevent_published_plan_update();

CREATE UNIQUE INDEX "uniq_patient_active_policy"
  ON "PatientDataPolicy" (patient_id)
  WHERE is_active;

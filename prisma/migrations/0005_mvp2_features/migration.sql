-- ============================================================================
-- MVP2: Protocol Engine, Recipe Library, Symptom Tracking, Plan Templates
-- ============================================================================

-- New Enums for MVP2
CREATE TYPE "BristolScale" AS ENUM ('type_1', 'type_2', 'type_3', 'type_4', 'type_5', 'type_6', 'type_7');
CREATE TYPE "SymptomType" AS ENUM ('gas', 'bloating', 'abdominal_pain', 'nausea', 'reflux', 'diarrhea', 'constipation', 'cramping', 'fatigue', 'headache', 'other');
CREATE TYPE "ProtocolType" AS ENUM ('FODMAP', 'LACTOSE', 'GLUTEN', 'CONSTIPATION', 'REFLUX', 'DIARRHEA', 'CUSTOM');
CREATE TYPE "ProtocolPhaseType" AS ENUM ('elimination', 'reintroduction', 'maintenance', 'custom');
CREATE TYPE "FoodTagAction" AS ENUM ('allowed', 'avoid', 'caution');
CREATE TYPE "SubstitutionType" AS ENUM ('isocaloric', 'isoproteic', 'low_fodmap', 'lactose_free', 'gluten_free', 'general');
CREATE TYPE "TemplateGoal" AS ENUM ('loss', 'gain', 'maintain', 'protocol_fodmap', 'protocol_lactose', 'protocol_gluten', 'custom');

-- Update Protocol table with new columns
ALTER TABLE "Protocol" ADD COLUMN "code" TEXT;
ALTER TABLE "Protocol" ADD COLUMN "is_system" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Protocol" ADD COLUMN "type" "ProtocolType";

-- Set default values for existing protocols
UPDATE "Protocol" SET code = 'LEGACY_' || id WHERE code IS NULL;
UPDATE "Protocol" SET type = 'CUSTOM' WHERE type IS NULL;

-- Now make code and type required
ALTER TABLE "Protocol" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "Protocol" ALTER COLUMN "type" SET NOT NULL;

-- Create unique constraint on protocol code per tenant
CREATE UNIQUE INDEX "Protocol_tenant_id_code_key" ON "Protocol"("tenant_id", "code");

-- Protocol Phases table
CREATE TABLE "ProtocolPhase" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "protocol_id" uuid NOT NULL REFERENCES "Protocol"("id") ON DELETE CASCADE,
    "phase_type" "ProtocolPhaseType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "default_days" INTEGER,
    "rules_json" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("protocol_id", "order")
);

-- Protocol Food Tags table
CREATE TABLE "ProtocolFoodTag" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "phase_id" uuid NOT NULL REFERENCES "ProtocolPhase"("id") ON DELETE CASCADE,
    "food_group" "FoodGroup" NOT NULL,
    "tag" TEXT NOT NULL,
    "action" "FoodTagAction" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("phase_id", "food_group", "tag")
);

-- Patient Protocol Instance table
CREATE TABLE "PatientProtocolInstance" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "patient_id" uuid NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "protocol_id" uuid NOT NULL REFERENCES "Protocol"("id") ON DELETE RESTRICT,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "ended_at" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_by" uuid NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "PatientProtocolInstance_patient_id_is_active_idx" ON "PatientProtocolInstance"("patient_id", "is_active");

-- Patient Protocol Phase table
CREATE TABLE "PatientProtocolPhase" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "instance_id" uuid NOT NULL REFERENCES "PatientProtocolInstance"("id") ON DELETE CASCADE,
    "phase_id" uuid NOT NULL REFERENCES "ProtocolPhase"("id") ON DELETE RESTRICT,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "ended_at" TIMESTAMPTZ,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "transition_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "PatientProtocolPhase_instance_id_is_current_idx" ON "PatientProtocolPhase"("instance_id", "is_current");

-- ============================================================================
-- Recipe & Substitution Library
-- ============================================================================

-- Recipe table
CREATE TABLE "Recipe" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "prep_time_min" INTEGER,
    "cook_time_min" INTEGER,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "created_by" uuid NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "Recipe_tenant_id_is_public_idx" ON "Recipe"("tenant_id", "is_public");
CREATE INDEX "Recipe_tenant_id_is_favorite_idx" ON "Recipe"("tenant_id", "is_favorite");

-- Recipe Ingredient table
CREATE TABLE "RecipeIngredient" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipe_id" uuid NOT NULL REFERENCES "Recipe"("id") ON DELETE CASCADE,
    "food_id" uuid NOT NULL REFERENCES "FoodCanonical"("id") ON DELETE RESTRICT,
    "grams" NUMERIC NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("recipe_id", "food_id")
);

-- Food Substitution table
CREATE TABLE "FoodSubstitution" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "original_food_id" uuid NOT NULL REFERENCES "FoodCanonical"("id") ON DELETE CASCADE,
    "substitute_food_id" uuid NOT NULL REFERENCES "FoodCanonical"("id") ON DELETE CASCADE,
    "substitution_type" "SubstitutionType" NOT NULL,
    "ratio" NUMERIC NOT NULL DEFAULT 1.0,
    "notes" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_by" uuid NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("tenant_id", "original_food_id", "substitute_food_id", "substitution_type")
);
CREATE INDEX "FoodSubstitution_tenant_id_substitution_type_idx" ON "FoodSubstitution"("tenant_id", "substitution_type");

-- ============================================================================
-- Symptom Logging & Tracking
-- ============================================================================

-- Symptom Log table
CREATE TABLE "SymptomLog" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "patient_id" uuid NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "logged_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "bristol_scale" "BristolScale",
    "discomfort_level" INTEGER CHECK ("discomfort_level" >= 0 AND "discomfort_level" <= 10),
    "symptoms" "SymptomType"[],
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "SymptomLog_patient_id_logged_at_idx" ON "SymptomLog"("patient_id", "logged_at");

-- Symptom Meal Correlation table
CREATE TABLE "SymptomMealCorrelation" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "symptom_log_id" uuid NOT NULL REFERENCES "SymptomLog"("id") ON DELETE CASCADE,
    "meal_id" uuid NOT NULL REFERENCES "Meal"("id") ON DELETE CASCADE,
    "correlation_score" NUMERIC,
    "notes" TEXT,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("symptom_log_id", "meal_id")
);

-- ============================================================================
-- Plan Templates
-- ============================================================================

-- Plan Template table
CREATE TABLE "PlanTemplate" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" "TemplateGoal" NOT NULL,
    "target_kcal" INTEGER,
    "macro_split" JSONB,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "created_by" uuid NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "PlanTemplate_tenant_id_is_public_idx" ON "PlanTemplate"("tenant_id", "is_public");
CREATE INDEX "PlanTemplate_tenant_id_goal_idx" ON "PlanTemplate"("tenant_id", "goal");

-- Plan Template Item table
CREATE TABLE "PlanTemplateItem" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "template_id" uuid NOT NULL REFERENCES "PlanTemplate"("id") ON DELETE CASCADE,
    "meal_type" "MealType" NOT NULL,
    "food_id" uuid REFERENCES "FoodCanonical"("id") ON DELETE SET NULL,
    "placeholder" TEXT,
    "grams" NUMERIC,
    "percentage_kcal" NUMERIC,
    "instructions" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "PlanTemplateItem_template_id_meal_type_idx" ON "PlanTemplateItem"("template_id", "meal_type");

-- Add template_id to Plan table
ALTER TABLE "Plan" ADD COLUMN "template_id" uuid REFERENCES "PlanTemplate"("id") ON DELETE SET NULL;

-- ============================================================================
-- Enable RLS on new tables
-- ============================================================================

ALTER TABLE "ProtocolPhase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProtocolFoodTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientProtocolInstance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientProtocolPhase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Recipe" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecipeIngredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodSubstitution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SymptomLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SymptomMealCorrelation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanTemplateItem" ENABLE ROW LEVEL SECURITY;

-- Force RLS on new tables
ALTER TABLE "ProtocolPhase" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ProtocolFoodTag" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PatientProtocolInstance" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PatientProtocolPhase" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Recipe" FORCE ROW LEVEL SECURITY;
ALTER TABLE "RecipeIngredient" FORCE ROW LEVEL SECURITY;
ALTER TABLE "FoodSubstitution" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SymptomLog" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SymptomMealCorrelation" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PlanTemplate" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PlanTemplateItem" FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for new tables
-- ============================================================================

-- Protocol-related policies (based on tenant_id in parent tables)
CREATE POLICY protocol_phase_policy ON "ProtocolPhase"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Protocol" p
      WHERE p.id = "ProtocolPhase".protocol_id
      AND (
        p.tenant_id = current_setting('app.tenant_id', true)::uuid
        OR (current_setting('app.role', true) = 'OWNER'
            AND current_setting('app.owner_mode', true) = 'true')
      )
    )
  );

CREATE POLICY protocol_food_tag_policy ON "ProtocolFoodTag"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "ProtocolPhase" ph
      JOIN "Protocol" p ON p.id = ph.protocol_id
      WHERE ph.id = "ProtocolFoodTag".phase_id
      AND (
        p.tenant_id = current_setting('app.tenant_id', true)::uuid
        OR (current_setting('app.role', true) = 'OWNER'
            AND current_setting('app.owner_mode', true) = 'true')
      )
    )
  );

CREATE POLICY patient_protocol_instance_policy ON "PatientProtocolInstance"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

CREATE POLICY patient_protocol_phase_policy ON "PatientProtocolPhase"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "PatientProtocolInstance" ppi
      WHERE ppi.id = "PatientProtocolPhase".instance_id
      AND (
        ppi.tenant_id = current_setting('app.tenant_id', true)::uuid
        OR (current_setting('app.role', true) = 'OWNER'
            AND current_setting('app.owner_mode', true) = 'true')
      )
    )
  );

-- Recipe policies
CREATE POLICY recipe_policy ON "Recipe"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

CREATE POLICY recipe_ingredient_policy ON "RecipeIngredient"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Recipe" r
      WHERE r.id = "RecipeIngredient".recipe_id
      AND (
        r.tenant_id = current_setting('app.tenant_id', true)::uuid
        OR (current_setting('app.role', true) = 'OWNER'
            AND current_setting('app.owner_mode', true) = 'true')
      )
    )
  );

-- Substitution policy
CREATE POLICY food_substitution_policy ON "FoodSubstitution"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

-- Symptom policies
CREATE POLICY symptom_log_policy ON "SymptomLog"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    AND (
      current_setting('app.role', true) IN ('TENANT_ADMIN', 'TEAM')
      OR (current_setting('app.role', true) = 'PATIENT'
          AND patient_id = (
            SELECT p.id FROM "Patient" p
            WHERE p.user_id = current_setting('app.user_id', true)::uuid
          ))
    )
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

CREATE POLICY symptom_meal_correlation_policy ON "SymptomMealCorrelation"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

-- Plan Template policies
CREATE POLICY plan_template_policy ON "PlanTemplate"
  FOR ALL USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

CREATE POLICY plan_template_item_policy ON "PlanTemplateItem"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "PlanTemplate" pt
      WHERE pt.id = "PlanTemplateItem".template_id
      AND (
        pt.tenant_id = current_setting('app.tenant_id', true)::uuid
        OR (current_setting('app.role', true) = 'OWNER'
            AND current_setting('app.owner_mode', true) = 'true')
      )
    )
  );

-- Grant permissions to app role
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "ProtocolPhase" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "ProtocolFoodTag" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "PatientProtocolInstance" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "PatientProtocolPhase" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "Recipe" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "RecipeIngredient" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "FoodSubstitution" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "SymptomLog" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "SymptomMealCorrelation" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "PlanTemplate" TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "PlanTemplateItem" TO nutriplan_app;

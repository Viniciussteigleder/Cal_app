-- Phase 1: Multi-Tenancy & AI Infrastructure Enhancement
-- This migration adds essential tables for subscription management, AI agents, and integrations

-- ============================================================================
-- PART 1: MULTI-TENANCY ENHANCEMENTS
-- ============================================================================

-- Add new fields to Tenant table
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subdomain" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "custom_domain" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "primary_color" TEXT DEFAULT '#10b981';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_tier" TEXT DEFAULT 'free';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_ends" TIMESTAMPTZ;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "max_patients" INTEGER DEFAULT 10;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "max_team_members" INTEGER DEFAULT 1;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "features_enabled" JSONB;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "settings" JSONB;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "ai_enabled" BOOLEAN DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "ai_credits" INTEGER DEFAULT 0;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "ai_usage_limit" INTEGER;

-- Create unique indexes for subdomain and custom_domain
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_subdomain_key" ON "Tenant"("subdomain") WHERE "subdomain" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_custom_domain_key" ON "Tenant"("custom_domain") WHERE "custom_domain" IS NOT NULL;

-- Create Team table
CREATE TABLE IF NOT EXISTS "Team" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Team_tenant_id_idx" ON "Team"("tenant_id");

-- Create TeamMember table
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_team_id_user_id_key" ON "TeamMember"("team_id", "user_id");

-- Create BillingEvent table
CREATE TABLE IF NOT EXISTS "BillingEvent" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "event_type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "description" TEXT,
    "invoice_url" TEXT,
    "payment_method" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "BillingEvent_tenant_id_created_at_idx" ON "BillingEvent"("tenant_id", "created_at");

-- Create APIKey table
CREATE TABLE IF NOT EXISTS "APIKey" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL UNIQUE,
    "permissions" JSONB NOT NULL,
    "last_used_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL REFERENCES "User"("id"),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "APIKey_tenant_id_idx" ON "APIKey"("tenant_id");

-- ============================================================================
-- PART 2: AI INFRASTRUCTURE
-- ============================================================================

-- Create AIModel table
CREATE TABLE IF NOT EXISTS "AIModel" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "model_type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "performance_metrics" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "AIModel_name_version_key" ON "AIModel"("name", "version");

-- Create AIExecution table
CREATE TABLE IF NOT EXISTS "AIExecution" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "model_id" UUID NOT NULL REFERENCES "AIModel"("id"),
    "agent_type" TEXT NOT NULL,
    "input_data" JSONB NOT NULL,
    "output_data" JSONB,
    "tokens_used" INTEGER,
    "execution_time_ms" INTEGER,
    "cost" DECIMAL(10,4),
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AIExecution_tenant_id_created_at_idx" ON "AIExecution"("tenant_id", "created_at");
CREATE INDEX IF NOT EXISTS "AIExecution_agent_type_created_at_idx" ON "AIExecution"("agent_type", "created_at");

-- Create AIFeedback table
CREATE TABLE IF NOT EXISTS "AIFeedback" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "execution_id" UUID NOT NULL REFERENCES "AIExecution"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "feedback_text" TEXT,
    "was_helpful" BOOLEAN NOT NULL,
    "corrections" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AIFeedback_execution_id_idx" ON "AIFeedback"("execution_id");

-- Create AITrainingData table
CREATE TABLE IF NOT EXISTS "AITrainingData" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "agent_type" TEXT NOT NULL,
    "input_sample" JSONB NOT NULL,
    "expected_output" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "quality_score" DECIMAL(3,2),
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AITrainingData_agent_type_is_validated_idx" ON "AITrainingData"("agent_type", "is_validated");

-- ============================================================================
-- PART 3: FIRST AI AGENTS - Food Recognition & Meal Planner
-- ============================================================================

-- Create FoodRecognition table
CREATE TABLE IF NOT EXISTS "FoodRecognition" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "image_url" TEXT NOT NULL,
    "recognized_foods" JSONB NOT NULL,
    "ai_model_version" TEXT NOT NULL,
    "confidence_score" DECIMAL(3,2) NOT NULL,
    "user_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "corrections" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "FoodRecognition_patient_id_created_at_idx" ON "FoodRecognition"("patient_id", "created_at");

-- Create AIMealPlan table
CREATE TABLE IF NOT EXISTS "AIMealPlan" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "plan_id" UUID REFERENCES "Plan"("id"),
    "generation_params" JSONB NOT NULL,
    "generated_meals" JSONB NOT NULL,
    "macro_distribution" JSONB NOT NULL,
    "estimated_cost" DECIMAL(10,2),
    "ai_reasoning" TEXT,
    "approved_by" UUID REFERENCES "User"("id"),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AIMealPlan_patient_id_created_at_idx" ON "AIMealPlan"("patient_id", "created_at");

-- Create PatientAnalysis table
CREATE TABLE IF NOT EXISTS "PatientAnalysis" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "analysis_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adherence_score" DECIMAL(5,2),
    "progress_score" DECIMAL(5,2),
    "dropout_risk" TEXT NOT NULL,
    "intervention_needed" BOOLEAN NOT NULL DEFAULT false,
    "ai_insights" JSONB,
    "recommended_actions" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "PatientAnalysis_patient_id_analysis_date_idx" ON "PatientAnalysis"("patient_id", "analysis_date");

-- ============================================================================
-- PART 4: MIDDLEWARE - Webhooks & Integrations
-- ============================================================================

-- Create Webhook table
CREATE TABLE IF NOT EXISTS "Webhook" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[] NOT NULL,
    "secret" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retry_policy" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Webhook_tenant_id_idx" ON "Webhook"("tenant_id");

-- Create WebhookDelivery table
CREATE TABLE IF NOT EXISTS "WebhookDelivery" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "webhook_id" UUID NOT NULL REFERENCES "Webhook"("id") ON DELETE CASCADE,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response_status" INTEGER,
    "response_body" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "delivered_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "WebhookDelivery_webhook_id_created_at_idx" ON "WebhookDelivery"("webhook_id", "created_at");

-- Create Integration table
CREATE TABLE IF NOT EXISTS "Integration" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "provider" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Integration_tenant_id_provider_key" ON "Integration"("tenant_id", "provider");

-- Create IntegrationSyncLog table
CREATE TABLE IF NOT EXISTS "IntegrationSyncLog" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "integration_id" UUID NOT NULL REFERENCES "Integration"("id") ON DELETE CASCADE,
    "sync_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "records_synced" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6)
);

CREATE INDEX IF NOT EXISTS "IntegrationSyncLog_integration_id_started_at_idx" ON "IntegrationSyncLog"("integration_id", "started_at");

-- ============================================================================
-- PART 5: COMPETITIVE FEATURES
-- ============================================================================

-- Create WaterIntake table
CREATE TABLE IF NOT EXISTS "WaterIntake" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "date" DATE NOT NULL,
    "amount_ml" INTEGER NOT NULL,
    "logged_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "WaterIntake_patient_id_date_idx" ON "WaterIntake"("patient_id", "date");

-- Create Exercise table
CREATE TABLE IF NOT EXISTS "Exercise" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "exercise_type" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "calories_burned" INTEGER,
    "notes" TEXT,
    "logged_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Exercise_patient_id_logged_at_idx" ON "Exercise"("patient_id", "logged_at");

-- Create MealReaction table
CREATE TABLE IF NOT EXISTS "MealReaction" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "meal_id" UUID NOT NULL REFERENCES "Meal"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "reaction_type" TEXT NOT NULL,
    "timing" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "MealReaction_meal_id_idx" ON "MealReaction"("meal_id");

-- ============================================================================
-- PART 6: SEED AI MODELS
-- ============================================================================

-- Insert default AI models
INSERT INTO "AIModel" ("name", "version", "model_type", "provider", "is_active")
VALUES 
    ('gpt-4-vision-preview', '2024-04', 'vision', 'openai', true),
    ('gpt-4-turbo-preview', '2024-04', 'llm', 'openai', true),
    ('claude-3-opus', '20240229', 'llm', 'anthropic', false),
    ('whisper-1', 'v3', 'speech_to_text', 'openai', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 7: SET DEFAULT FEATURE FLAGS
-- ============================================================================

-- Update existing tenants with default feature flags
UPDATE "Tenant" 
SET "features_enabled" = jsonb_build_object(
    'ai_agents', jsonb_build_object(
        'food_recognition', false,
        'meal_planner', false,
        'patient_analyzer', false
    ),
    'integrations', jsonb_build_object(
        'whatsapp', false,
        'google_calendar', false,
        'stripe', false
    ),
    'advanced_features', jsonb_build_object(
        'water_tracking', true,
        'exercise_tracking', true,
        'meal_reactions', true
    )
)
WHERE "features_enabled" IS NULL;

COMMENT ON TABLE "Team" IS 'Teams within a tenant for collaboration';
COMMENT ON TABLE "AIExecution" IS 'Tracks all AI agent executions for billing and monitoring';
COMMENT ON TABLE "FoodRecognition" IS 'Stores food recognition results from photos';
COMMENT ON TABLE "AIMealPlan" IS 'AI-generated meal plans';
COMMENT ON TABLE "PatientAnalysis" IS 'AI-driven patient adherence and risk analysis';

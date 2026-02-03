-- Add new enums for Planner and Forms
DO $$ BEGIN
    CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "FormType" AS ENUM ('anamnesis', 'metabolic', 'dysbiosis', 'food_frequency', 'symptoms', 'sleep', 'stress', 'digestive', 'physical_activity', 'goals', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RecipeUnitType" AS ENUM ('solid', 'liquid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create PlannerTask table
CREATE TABLE IF NOT EXISTS "PlannerTask" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannerTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PlannerTask_tenant_id_user_id_idx" ON "PlannerTask"("tenant_id", "user_id");

-- Create FormTemplate table
CREATE TABLE IF NOT EXISTS "FormTemplate" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "FormType" NOT NULL DEFAULT 'custom',
    "structure_json" JSONB NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FormTemplate_tenant_id_type_idx" ON "FormTemplate"("tenant_id", "type");

-- Create FormSubmission table
CREATE TABLE IF NOT EXISTS "FormSubmission" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "responses_json" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FormSubmission_patient_id_template_id_idx" ON "FormSubmission"("patient_id", "template_id");

-- Add enabled_modules column to Patient table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Patient" ADD COLUMN "enabled_modules" JSONB;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add Recipe calculator fields if they don't exist
DO $$ BEGIN
    ALTER TABLE "Recipe" ADD COLUMN "is_calculated" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Recipe" ADD COLUMN "unit_type" "RecipeUnitType" NOT NULL DEFAULT 'solid';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Recipe" ADD COLUMN "final_weight" DECIMAL(65,30);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Recipe" ADD COLUMN "household_measure_label" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Recipe" ADD COLUMN "household_measure_amount" DECIMAL(65,30);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Recipe" ADD COLUMN "generated_description" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "PlannerTask" ADD CONSTRAINT "PlannerTask_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "PlannerTask" ADD CONSTRAINT "PlannerTask_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transfer ownership to nutriplan_app
ALTER TABLE IF EXISTS "PlannerTask" OWNER TO nutriplan_app;
ALTER TABLE IF EXISTS "FormTemplate" OWNER TO nutriplan_app;
ALTER TABLE IF EXISTS "FormSubmission" OWNER TO nutriplan_app;

-- Create SubscriptionPlan enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "SubscriptionPlan" AS ENUM ('BASIC', 'PRO', 'PRO_MAX', 'PRO_MAX_AI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add plan column to Tenant if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Tenant" ADD COLUMN "plan" "SubscriptionPlan" NOT NULL DEFAULT 'BASIC';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add Stripe columns to Tenant if they don't exist
DO $$ BEGIN
    ALTER TABLE "Tenant" ADD COLUMN "stripe_customer_id" text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Tenant" ADD COLUMN "stripe_subscription_id" text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Tenant" ADD COLUMN "subscription_status" text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add RecipeUnitType enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "RecipeUnitType" AS ENUM ('solid', 'liquid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add FormType enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "FormType" AS ENUM ('system', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add TaskStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add TaskPriority enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE "SubscriptionPlanConfig" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "plan" "SubscriptionPlan" NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "price_cents" integer NOT NULL,
    "currency" text NOT NULL DEFAULT 'BRL',
    "interval" text NOT NULL DEFAULT 'month',
    "features" jsonb,
    "ai_credits" integer NOT NULL DEFAULT 0,
    "ai_usage_limit" integer NOT NULL DEFAULT 0,
    "patient_limit" integer,
    "stripe_product_id" text,
    "stripe_price_id" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "display_order" integer NOT NULL DEFAULT 0,
    "created_at" timestamptz(6) NOT NULL DEFAULT now(),
    "updated_at" timestamptz(6) NOT NULL DEFAULT now(),

    CONSTRAINT "SubscriptionPlanConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubscriptionPlanConfig_plan_key" ON "SubscriptionPlanConfig"("plan");

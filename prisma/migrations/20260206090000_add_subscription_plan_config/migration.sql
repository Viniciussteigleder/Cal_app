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

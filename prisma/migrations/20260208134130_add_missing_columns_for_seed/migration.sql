-- Add columns that Prisma schema + /api/setup expect but older migrations didn't create.
-- Safe to run multiple times.

-- Tenant AI + settings
DO $$ BEGIN
  ALTER TABLE "Tenant" ADD COLUMN "settings" jsonb;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Tenant" ADD COLUMN "ai_enabled" boolean NOT NULL DEFAULT true;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Tenant" ADD COLUMN "ai_credits" integer NOT NULL DEFAULT 100;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Tenant" ADD COLUMN "ai_usage_limit" integer NOT NULL DEFAULT 1000;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- User password hash (for credentials login)
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "password_hash" text;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Patient enabled modules
DO $$ BEGIN
  ALTER TABLE "Patient" ADD COLUMN "enabled_modules" jsonb;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

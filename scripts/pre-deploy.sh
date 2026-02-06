#!/bin/bash
# Pre-deployment validation script
# This script checks for common deployment issues before building

set -e  # Exit on any error

echo "🔍 Running pre-deployment checks..."

# Check for duplicate lockfiles
if [ -f "pnpm-lock.yaml" ] || [ -f "yarn.lock" ]; then
  echo "❌ ERROR: Detected pnpm/yarn lockfile. Remove to avoid Vercel package manager conflicts."
  exit 1
fi

if [ ! -f "package-lock.json" ]; then
  echo "❌ ERROR: package-lock.json missing. Run 'npm install' to generate it."
  exit 1
fi

echo "✅ Lockfile state is valid (npm)"

# Check if DATABASE_URL is set when required
if [ "$NODE_ENV" = "production" ] || [ "$VERCEL_ENV" = "production" ] || [ "$MIGRATE_ON_PREVIEW" = "true" ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required for migrations"
    exit 1
  fi
  echo "✅ DATABASE_URL is set"
else
  echo "ℹ️ DATABASE_URL not required for this environment"
fi

# Check if Prisma schema exists
if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ ERROR: prisma/schema.prisma not found"
  exit 1
fi

echo "✅ Prisma schema found"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

echo "✅ Prisma Client generated successfully"

# Validate Prisma schema
echo "🔍 Validating Prisma schema..."
npx prisma validate

echo "✅ Prisma schema is valid"

# Check if we should run migrations
if [ "$NODE_ENV" = "production" ] || [ "$VERCEL_ENV" = "production" ]; then
  env_label="production"
  should_migrate="true"
elif [ "$VERCEL_ENV" = "preview" ] && [ "$MIGRATE_ON_PREVIEW" = "true" ]; then
  env_label="preview"
  should_migrate="true"
else
  should_migrate="false"
fi

if [ "$should_migrate" = "true" ]; then
  echo "🚀 ${env_label} environment detected"
  echo "📊 Deploying database migrations..."
  npx prisma migrate deploy
  echo "✅ Migrations deployed successfully"
else
  echo "🔧 Development environment - skipping migration deployment"
fi

echo "✅ All pre-deployment checks passed!"

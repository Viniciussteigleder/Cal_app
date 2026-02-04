#!/bin/bash
# Pre-deployment validation script
# This script checks for common deployment issues before building

set -e  # Exit on any error

echo "🔍 Running pre-deployment checks..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL in your environment or .env file"
  exit 1
fi

echo "✅ DATABASE_URL is set"

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

# Check if we're in production and need to run migrations
if [ "$NODE_ENV" = "production" ] || [ "$VERCEL_ENV" = "production" ]; then
  echo "🚀 Production environment detected"
  echo "📊 Deploying database migrations..."
  npx prisma migrate deploy
  echo "✅ Migrations deployed successfully"
else
  echo "🔧 Development environment - skipping migration deployment"
fi

echo "✅ All pre-deployment checks passed!"

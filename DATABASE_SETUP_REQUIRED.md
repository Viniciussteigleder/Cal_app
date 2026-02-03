# Database Update & Troubleshooting Guide

## Current Status
The application code has been updated to include new features:
- **Planner**: `PlannerTask` model.
- **Forms**: `FormTemplate` and `FormSubmission` models.
- **Recipes**: Enhanced `Recipe` model with calculator fields.
- **Patient**: `enabled_modules` JSON field.

**The database schema has NOT been applied** due to permission errors. The application will fail if you try to use these new features.

## Check 1: Permission Denied Error
The error `ERROR: permission denied to create database` during `prisma migrate dev` usually happens because Prisma tries to create a temporary "shadow database" to validate schema changes.

**Why it happens:**
- You are using a cloud database provider (Supabase, Neon, AWS RDS) where your user user does not have `CREATEDB` privileges.
- Or, you are connecting via a connection pooler (like Supabase Transaction Pooler) that doesn't support schema operations.

## How to Fix

### Option A: Using Supabase (Recommended)
If you are using Supabase, you must use the **Direct Connection Request** for migrations, not the pooling URL.

1. Go to your Supabase Dashboard -> Project Settings -> Database.
2. Copy the **Mode: Session** connection string (port 5432).
3. Ensure your `.env` file uses this string for `DATABASE_URL`.
   ```bash
   DATABASE_URL="postgres://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
   ```
4. Run the migration again:
   ```bash
   npx prisma migrate dev --name init_features
   ```

### Option B: Disable Shadow Database (Not recommended for dev)
If you cannot grant `CREATEDB` permissions, you can try `db push` which skips the shadow database check, but this also failed with `permission denied for schema public`. This confirms your database user is restricted.

**You must grant ownership privileges to your database user:**
run this SQL in your database SQL Editor:
```sql
GRANT ALL ON SCHEMA public TO "your_db_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "your_db_user";
```

## Required Actions
Once you have fixed the permissions:
1. Run `npx prisma migrate dev --name feature_expansion`
2. Restart your development server.

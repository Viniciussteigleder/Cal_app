# Step-by-Step Guide: Fix Database Permissions (Option A)

## Overview
You need to grant permissions to the `nutriplan_app` user to create databases and modify the `public` schema in your PostgreSQL database.

## Prerequisites
- PostgreSQL installed on your Mac
- Access to the `postgres` superuser account

---

## Step 1: Connect to PostgreSQL as Superuser

Open your terminal and connect to PostgreSQL as the superuser:

```bash
psql -U postgres
```

**If you get "role postgres does not exist"**, try:
```bash
psql -U $(whoami) postgres
```

**If you need a password**, you'll be prompted to enter it.

---

## Step 2: Grant Schema Permissions

Once connected to PostgreSQL, run these commands:

```sql
-- Connect to the nutriplan database
\c nutriplan

-- Grant all privileges on the public schema
GRANT ALL PRIVILEGES ON SCHEMA public TO nutriplan_app;

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO nutriplan_app;

-- Grant create privileges on the schema
GRANT CREATE ON SCHEMA public TO nutriplan_app;

-- Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nutriplan_app;

-- Grant all privileges on all sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nutriplan_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO nutriplan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO nutriplan_app;
```

---

## Step 3: Grant Database Creation Permission

Still in the PostgreSQL prompt, run:

```sql
-- Grant CREATEDB privilege to the user
ALTER USER nutriplan_app CREATEDB;
```

---

## Step 4: Verify Permissions

Check that the permissions were granted correctly:

```sql
-- Check user privileges
\du nutriplan_app

-- Check schema privileges
\dn+ public
```

You should see `nutriplan_app` listed with appropriate permissions.

---

## Step 5: Exit PostgreSQL

```sql
\q
```

---

## Step 6: Apply Database Schema Changes

Now that permissions are fixed, apply the schema changes:

```bash
cd /Users/viniciussteigleder/Documents/Web\ apps\ -\ vide\ coding/Cal_app

# Push schema changes to database
npx prisma db push

# Generate Prisma Client with new models
npx prisma generate
```

---

## Step 7: Seed Form Templates (Optional)

Populate the 10 pre-set form templates:

```bash
npx tsx prisma/seed-forms.ts
```

---

## Step 8: Verify Everything Works

Test that the database is working:

```bash
# Open Prisma Studio to view your data
npx prisma studio
```

This will open a browser window where you can see all your tables including the new ones:
- `PlannerTask`
- `FormTemplate`
- `FormSubmission`

---

## Troubleshooting

### Issue: "psql: command not found"

PostgreSQL is not in your PATH. Find it and add to PATH:

```bash
# Find PostgreSQL installation
which postgres

# If not found, try:
find /usr/local -name psql 2>/dev/null
find /opt -name psql 2>/dev/null

# Add to PATH (example for Homebrew installation)
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
```

### Issue: "FATAL: role 'postgres' does not exist"

Your PostgreSQL installation might not have a `postgres` user. Try:

```bash
# List all database users
psql -U $(whoami) -d postgres -c "\du"

# Connect with your system user
psql -U $(whoami) -d nutriplan
```

Then run the GRANT commands from Step 2.

### Issue: "permission denied for database nutriplan"

You might need to connect as a different superuser:

```bash
# Try with your system username
psql -U $(whoami) postgres

# Then run:
ALTER DATABASE nutriplan OWNER TO nutriplan_app;
```

### Issue: Still getting permission errors after grants

Try a more aggressive approach:

```sql
-- Connect as superuser
psql -U postgres

-- Make nutriplan_app a superuser temporarily
ALTER USER nutriplan_app WITH SUPERUSER;

-- Run the migration
-- (exit psql and run: npx prisma db push)

-- Then remove superuser privilege
ALTER USER nutriplan_app WITH NOSUPERUSER;
```

---

## Alternative: Quick Fix Script

If you want to run all commands at once, save this as `fix-permissions.sql`:

```sql
\c nutriplan

GRANT ALL PRIVILEGES ON SCHEMA public TO nutriplan_app;
GRANT USAGE ON SCHEMA public TO nutriplan_app;
GRANT CREATE ON SCHEMA public TO nutriplan_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nutriplan_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nutriplan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO nutriplan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO nutriplan_app;
ALTER USER nutriplan_app CREATEDB;

\du nutriplan_app
```

Then run:
```bash
psql -U postgres -f fix-permissions.sql
```

---

## Success Indicators

You'll know it worked when:

1. ✅ `npx prisma db push` completes without errors
2. ✅ `npx prisma generate` creates new types for PlannerTask, FormTemplate, etc.
3. ✅ No TypeScript errors in your API routes
4. ✅ Prisma Studio shows the new tables
5. ✅ The Planner page can create and save tasks

---

## Next Steps After Success

1. **Restart your development server** to pick up the new Prisma Client:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Test the features**:
   - Navigate to `/studio/planner` and create a task
   - Check `/studio/forms` to see the templates
   - Try toggling patient modules in patient settings

3. **Check the database**:
   ```bash
   npx prisma studio
   ```
   You should see your created tasks in the `PlannerTask` table.

---

## Need Help?

If you encounter any issues not covered here, share the exact error message and I'll help you resolve it.

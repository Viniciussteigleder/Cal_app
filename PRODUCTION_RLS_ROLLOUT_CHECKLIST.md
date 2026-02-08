# Production RLS Rollout Checklist (Supabase Postgres + Prisma)

Decision (recommended): **use Prisma Migrate as the source of truth**, and run production on a **fresh Supabase project/database** created from migrations.

Why: your schema is still evolving and you already have a large `prisma/migrations/` history. Baselining a non-empty DB is possible, but it is slower and riskier than starting clean.

---

## 0) Preconditions (Do This First)

- Confirm the production database is a **dedicated environment** (not your dev DB).
- Confirm your app uses `scripts/vercel-build.js` (it now fails the build if `migrate deploy` fails in production).
- Make sure `SESSION_SECRET`, `DATABASE_URL`, and `DIRECT_URL` are set in Vercel.

---

## 1) Create Production DB (Preferred Path)

1. Create a new Supabase project (this becomes your production DB).
2. Set Vercel env vars for that new project:
   - `DATABASE_URL`: use the Supabase pooler URL if you want (port 6543).
   - `DIRECT_URL`: direct connection string (non-pooler) for migrations.
3. Deploy: Vercel build will run:
   - `prisma generate`
   - `prisma migrate deploy` (fatal if it fails in production)
   - `next build`

Acceptance:
- `prisma migrate deploy` succeeds in Vercel build logs.
- App boots and `/api/health` (if you have it) returns OK.

---

## 2) DB Role + RLS Enforcement

### 2.1 Create app role (recommended)

In Supabase SQL editor (run once):

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nutriplan_app') THEN
    CREATE ROLE nutriplan_app WITH LOGIN PASSWORD 'REPLACE_ME_STRONG_PASSWORD' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO nutriplan_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO nutriplan_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nutriplan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON TABLES TO nutriplan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO nutriplan_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO nutriplan_app;
```

Then set Vercel `DATABASE_URL` (or `DIRECT_URL`) to connect as `nutriplan_app`.

Notes:
- App code also tries `SET LOCAL ROLE nutriplan_app` inside `withSession()` as a safety net.

### 2.2 Verify RLS is enabled + forced

In Supabase SQL editor:

```sql
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relname in ('Tenant','User','Patient','FoodSnapshot');
```

Acceptance:
- `relrowsecurity = true`
- `relforcerowsecurity = true`

---

## 3) RLS Policies: What Must Be True

Minimum guarantees:
- A `PATIENT` can only read their own patient row.
- A `TEAM` can only read assigned patients.
- A `TENANT_ADMIN` can read all tenant patients.
- `OWNER` access requires `owner_mode=true`.
- `FoodSnapshot` is immutable (no UPDATE/DELETE).

Acceptance:
- Your security tests pass against a prod-like DB.

---

## 4) Manual “Real User” Setup For Prod Testing

### 4.1 Create a tenant

Option A: SQL editor (manual)

```sql
insert into "Tenant" (id, name, type, status)
values ('<tenant-uuid>', 'Prod Test Tenant', 'B2C', 'active');
```

### 4.2 Create a user with a bcrypt password hash

Generate hash locally:

```bash
npm run admin:hash-password -- "YourPasswordHere"
```

Then insert user in Supabase SQL editor:

```sql
insert into "User" (id, email, name, role, password_hash, tenant_id, status)
values (
  '<user-uuid>',
  'admin@yourdomain.com',
  'Prod Admin',
  'TENANT_ADMIN',
  '<bcrypt-hash-from-script>',
  '<tenant-uuid>',
  'active'
);
```

Option B: use the helper script (recommended, less error-prone)

```bash
npm run admin:create-tenant-user -- \
  --tenant-id <tenant-uuid> \
  --tenant-name "Prod Test Tenant" \
  --email admin@yourdomain.com \
  --name "Prod Admin" \
  --role TENANT_ADMIN \
  --password "YourPasswordHere"
```

Then login via your app login route.

---

## 5) “Existing DB” Baseline (Only If You Cannot Start Fresh)

If the DB is non-empty and Prisma migrate refuses to deploy:

1. Identify which migration corresponds to the DB state.
2. Mark migrations as applied:

```bash
npx prisma migrate resolve --applied 0001_init
npx prisma migrate resolve --applied 0002_snapshot_policies
...
```

3. Only after resolve matches reality, run:

```bash
npx prisma migrate deploy
```

Risk note:
- If you resolve incorrectly, Prisma will think schema is at a different version than reality.

---

## 6) Post-Rollout Smoke Tests (Do These In Prod)

1. Login as `TENANT_ADMIN` and create a patient.
2. Login as `PATIENT` and confirm you cannot access another patient.
3. Attempt to UPDATE/DELETE a `FoodSnapshot` row (should fail).
4. Run an AI route for a patient and confirm it cannot be called with another-tenant `patientId`.

---

## Files/Behavior This Checklist Assumes

- `src/lib/db.ts`: session-scoped RLS variables + `SET LOCAL ROLE nutriplan_app`.
- `scripts/vercel-build.js`: production `prisma migrate deploy` is fatal.
- `scripts/admin/hash-password.ts`, `scripts/admin/create-tenant-and-user.ts`: helpers for manual prod testing.


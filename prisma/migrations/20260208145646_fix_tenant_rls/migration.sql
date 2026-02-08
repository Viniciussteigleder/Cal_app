-- Tenant RLS was too strict (OWNER-only), which breaks legitimate tenant-scoped server operations
-- like AI credit decrements. Keep OWNER+owner_mode access, but allow tenant members to SELECT
-- their own tenant and allow TENANT_ADMIN/TEAM to UPDATE their own tenant.

-- Ensure RLS is enabled/forced (idempotent)
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;

-- Existing policy name from 0001_init: tenant_owner_access
-- Keep it, but add member access.

DROP POLICY IF EXISTS tenant_member_select ON "Tenant";
CREATE POLICY tenant_member_select ON "Tenant"
  FOR SELECT
  USING (
    id = current_setting('app.tenant_id', true)::uuid
    OR (
      current_setting('app.role', true) = 'OWNER'
      AND current_setting('app.owner_mode', true) = 'true'
    )
  );

DROP POLICY IF EXISTS tenant_member_update ON "Tenant";
CREATE POLICY tenant_member_update ON "Tenant"
  FOR UPDATE
  USING (
    id = current_setting('app.tenant_id', true)::uuid
    AND current_setting('app.role', true) IN ('TENANT_ADMIN', 'TEAM')
  )
  WITH CHECK (
    id = current_setting('app.tenant_id', true)::uuid
    AND current_setting('app.role', true) IN ('TENANT_ADMIN', 'TEAM')
  );

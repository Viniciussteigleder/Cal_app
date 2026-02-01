DROP POLICY IF EXISTS default_tenant_policy_snapshot ON "FoodSnapshot";

CREATE POLICY food_snapshot_select ON "FoodSnapshot"
  FOR SELECT USING (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

CREATE POLICY food_snapshot_insert ON "FoodSnapshot"
  FOR INSERT WITH CHECK (
    tenant_id = current_setting('app.tenant_id', true)::uuid
  );

DROP POLICY IF EXISTS food_snapshot_insert ON "FoodSnapshot";

CREATE POLICY food_snapshot_insert ON "FoodSnapshot"
  FOR INSERT WITH CHECK (
    tenant_id = current_setting('app.tenant_id', true)::uuid
    OR (current_setting('app.role', true) = 'OWNER'
        AND current_setting('app.owner_mode', true) = 'true')
  );

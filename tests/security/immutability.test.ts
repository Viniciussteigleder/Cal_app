import { describe, expect, it } from "vitest";

import { buildClaims, withTestSession } from "../helpers";

describe("Snapshot immutability", () => {
  it("prevents update and delete on food_snapshot", async () => {
    const tenantId = "00000000-0000-0000-0000-000000000011";
    const userId = "00000000-0000-0000-0000-000000000012";
    const ownerClaims = buildClaims({
      tenant_id: tenantId,
      user_id: "00000000-0000-0000-0000-000000000013",
      role: "OWNER",
    });
    const claims = buildClaims({ tenant_id: tenantId, user_id: userId, role: "TENANT_ADMIN" });

    const snapshot = await withTestSession(
      ownerClaims,
      async (tx) => {
      const tenant = await tx.tenant.create({
        data: { id: tenantId, name: "Tenant Test", type: "B2C", status: "active" },
      });
      await tx.user.create({
        data: { id: userId, email: "admin@test.com", name: "Admin", role: "TENANT_ADMIN", tenant_id: tenant.id, status: "active" },
      });
      const patient = await tx.patient.create({
        data: { tenant_id: tenant.id, status: "active" },
      });
      const dataset = await tx.datasetRelease.create({
        data: {
          id: "00000000-0000-0000-0000-000000000014",
          tenant_id: tenant.id,
          region: "BR",
          source_name: "TACO",
          version_label: "v7.1",
          status: "published",
        },
      });
      const food = await tx.foodCanonical.create({
        data: {
          id: "00000000-0000-0000-0000-000000000015",
          tenant_id: tenant.id,
          name: "Arroz branco cozido",
          group: "grains",
          region_tag: "BR",
          is_generic: true,
        },
      });
      const snapshotJson = {
        nutrients: {
          energy_kcal: 120,
          protein_g: 2.5,
          carbs_g: 28,
          fat_g: 0.3,
          fiber_g: 1.2,
        },
        source: "TACO v7.1",
        per_100g: true,
      };

      return tx.foodSnapshot.create({
        data: {
          tenant_id: tenant.id,
          patient_id: patient.id,
          food_id: food.id,
          snapshot_json: snapshotJson,
          source: "TACO",
          dataset_release_id: dataset.id,
        },
      });
      },
      { ownerMode: true }
    );

    await expect(
      withTestSession(claims, (tx) =>
        tx.foodSnapshot.update({
          where: { id: snapshot.id },
          data: { source: "BLS" },
        })
      )
    ).rejects.toThrow();

    await expect(
      withTestSession(claims, (tx) => tx.foodSnapshot.delete({ where: { id: snapshot.id } }))
    ).rejects.toThrow();
  });
});

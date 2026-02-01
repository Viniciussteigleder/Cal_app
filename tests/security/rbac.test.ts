import { describe, expect, it } from "vitest";

import { buildClaims, withTestSession } from "../helpers";

describe("RBAC enforcement", () => {
  it("PATIENT cannot read other patients", async () => {
    const tenantId = "00000000-0000-0000-0000-000000000101";
    const patientUser1 = "00000000-0000-0000-0000-000000000102";
    const patientUser2 = "00000000-0000-0000-0000-000000000103";

    const patient1 = await withTestSession(
      buildClaims({ tenant_id: tenantId, user_id: patientUser1, role: "TENANT_ADMIN" }),
      async (tx) => {
        await tx.tenant.create({
          data: { id: tenantId, name: "Tenant RBAC", type: "B2C", status: "active" },
        });
        await tx.user.create({
          data: {
            id: patientUser1,
            email: "patient1@test.com",
            name: "Paciente 1",
            role: "PATIENT",
            tenant_id: tenantId,
            status: "active",
          },
        });
        await tx.user.create({
          data: {
            id: patientUser2,
            email: "patient2@test.com",
            name: "Paciente 2",
            role: "PATIENT",
            tenant_id: tenantId,
            status: "active",
          },
        });

        const patient = await tx.patient.create({
          data: { tenant_id: tenantId, user_id: patientUser1, status: "active" },
        });
        await tx.patient.create({
          data: { tenant_id: tenantId, user_id: patientUser2, status: "active" },
        });

        return patient;
      }
    );

    const otherPatient = await withTestSession(
      buildClaims({ tenant_id: tenantId, user_id: patientUser2, role: "PATIENT" }),
      (tx) => tx.patient.findUnique({ where: { id: patient1.id } })
    );

    expect(otherPatient).toBeNull();
  });

  it("TEAM can only access assigned patients", async () => {
    const tenantId = "00000000-0000-0000-0000-000000000201";
    const teamUser = "00000000-0000-0000-0000-000000000202";

    const { assignedPatientId, otherPatientId } = await withTestSession(
      buildClaims({ tenant_id: tenantId, user_id: teamUser, role: "TENANT_ADMIN" }),
      async (tx) => {
        await tx.tenant.create({
          data: { id: tenantId, name: "Tenant Team", type: "B2C", status: "active" },
        });
        await tx.user.create({
          data: {
            id: teamUser,
            email: "team@test.com",
            name: "Equipe",
            role: "TEAM",
            tenant_id: tenantId,
            status: "active",
          },
        });
        const assigned = await tx.patient.create({
          data: {
            tenant_id: tenantId,
            status: "active",
            assigned_team_id: teamUser,
          },
        });
        const other = await tx.patient.create({
          data: {
            tenant_id: tenantId,
            status: "active",
          },
        });
        return { assignedPatientId: assigned.id, otherPatientId: other.id };
      }
    );

    const assignedRead = await withTestSession(
      buildClaims({ tenant_id: tenantId, user_id: teamUser, role: "TEAM" }),
      (tx) => tx.patient.findUnique({ where: { id: assignedPatientId } })
    );
    const otherRead = await withTestSession(
      buildClaims({ tenant_id: tenantId, user_id: teamUser, role: "TEAM" }),
      (tx) => tx.patient.findUnique({ where: { id: otherPatientId } })
    );

    expect(assignedRead).toBeTruthy();
    expect(otherRead).toBeNull();
  });

  it("OWNER access requires owner mode", async () => {
    const tenantId = "00000000-0000-0000-0000-000000000301";
    const ownerId = "00000000-0000-0000-0000-000000000302";
    const otherTenantId = "00000000-0000-0000-0000-000000000303";

    await withTestSession(
      buildClaims({ tenant_id: tenantId, user_id: ownerId, role: "OWNER" }),
      async (tx) => {
        await tx.tenant.create({
          data: { id: tenantId, name: "Tenant Owner", type: "B2C", status: "active" },
        });
        await tx.tenant.create({
          data: { id: otherTenantId, name: "Tenant Other", type: "B2C", status: "active" },
        });
        await tx.patient.create({
          data: { tenant_id: otherTenantId, status: "active" },
        });
      }
    );

    const withoutOwnerMode = await withTestSession(
      buildClaims({ tenant_id: tenantId, user_id: ownerId, role: "OWNER" }),
      (tx) => tx.patient.findMany()
    );
    expect(withoutOwnerMode).toHaveLength(0);

    const withOwnerMode = await withTestSession(
      buildClaims({ tenant_id: tenantId, user_id: ownerId, role: "OWNER" }),
      (tx) => tx.patient.findMany(),
      { ownerMode: true }
    );
    expect(withOwnerMode.length).toBeGreaterThan(0);
  });
});

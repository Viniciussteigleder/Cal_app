/**
 * Multi-tenant patient ownership guard for AI routes.
 *
 * Every AI route that accepts a `patientId` must call
 * `assertPatientBelongsToTenant` before reading or writing
 * patient data.  A failed check throws a TenantMismatchError
 * which the route should catch and return as 403.
 */

import { prisma } from '@/lib/prisma';

export class TenantMismatchError extends Error {
    constructor(patientId: string) {
        super(`Patient ${patientId} does not belong to this tenant`);
        this.name = 'TenantMismatchError';
    }
}

/**
 * Verify that `patientId` belongs to `tenantId`.
 *
 * @throws TenantMismatchError if the patient does not exist or belongs
 *         to a different tenant.
 */
export async function assertPatientBelongsToTenant(
    patientId: string,
    tenantId: string
): Promise<void> {
    const patient = await prisma.patient.findFirst({
        where: { id: patientId, tenant_id: tenantId },
        select: { id: true },
    });

    if (!patient) {
        throw new TenantMismatchError(patientId);
    }
}

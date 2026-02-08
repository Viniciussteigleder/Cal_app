/**
 * Multi-tenant patient ownership guard for AI routes.
 *
 * Every AI route that accepts a `patientId` must call
 * `assertPatientBelongsToTenant` before reading or writing
 * patient data.  A failed check throws a TenantMismatchError
 * which the route should catch and return as 403.
 */

import { prisma } from '@/lib/prisma';
import type { SessionClaims } from '@/lib/db';
import { withSession } from '@/lib/db';

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
    claims: SessionClaims
): Promise<void> {
    const patient = await withSession(claims, (tx) =>
        tx.patient.findFirst({
            where: { id: patientId, tenant_id: claims.tenant_id },
            select: { id: true },
        })
    );

    if (!patient) {
        throw new TenantMismatchError(patientId);
    }
}

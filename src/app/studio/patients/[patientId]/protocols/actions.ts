
'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';

export async function getPatientProtocols(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const instances = await prisma.patientProtocolInstance.findMany({
            where: {
                tenant_id: claims.tenant_id,
                patient_id: patientId
            },
            include: {
                protocol: true,
                // current_phase: true // Removed as it is not in schema
            },
            orderBy: { started_at: 'desc' }
        });

        return { success: true, data: instances };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed' };
    }
}

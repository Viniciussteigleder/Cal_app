'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getActiveProtocol(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const activeInstance = await prisma.patientProtocolInstance.findFirst({
        where: {
            patient_id: patientId,
            is_active: true
        },
        include: {
            // Relation to 'Protocol' model?
            // Checking schema: PatientProtocolInstance has protocol_id. 
            // Relations might not be defined in Prisma schema explicitly.
            // I'll fetch protocol separately if relation is missing.
        }
    });

    if (!activeInstance) return { success: true, data: null };

    // Manual fetch if relation missing
    const protocol = await prisma.protocol.findUnique({
        where: { id: activeInstance.protocol_id }
    });

    return { success: true, data: { ...activeInstance, protocol } };
}

export async function assignProtocol(patientId: string, protocolId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // Deactivate current
        await prisma.patientProtocolInstance.updateMany({
            where: { patient_id: patientId, is_active: true },
            data: { is_active: false, ended_at: new Date() }
        });

        // Activate new
        const instance = await prisma.patientProtocolInstance.create({
            data: {
                tenant_id: claims.tenant_id,
                patient_id: patientId,
                protocol_id: protocolId,
                created_by: claims.user_id,
                is_active: true
            }
        });

        revalidatePath(`/studio/patients/${patientId}/plano-alimentar`);
        return { success: true, data: instance };
    } catch (error) {
        console.error("Assign Protocol Error:", error);
        return { success: false, error: "Failed to assign protocol" };
    }
}

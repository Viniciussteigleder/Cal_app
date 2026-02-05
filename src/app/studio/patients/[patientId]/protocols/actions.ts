
'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
                protocol: {
                    include: {
                        // Assuming phases are defined in ProtocolPhase model related to Protocol
                        // If specific relation name exists, use it. Based on schema:
                        // ProtocolPhase has protocol_id. We need the reverse relation in Protocol.
                        // Searching schema line 100: Protocol model items...
                        // It seems 'phases' relation is missing in Protocol model definition in the viewed snippet?
                        // Wait, I saw `model ProtocolPhase` with `protocol_id`. Implicit relation might be named `phases`.
                        // I will assume `phases` exists or I might need to check strict naming.
                        // Let's assume there isn't one explicitly named in the snippet I saw, but usually it is. 
                        // To be safe I will fetch phases separately if needed, but `include` is better.
                    }
                }
            },
            orderBy: { started_at: 'desc' }
        });

        // Manually fetch phases and current status for each instance to ensure data integrity
        const enrichedInstances = await Promise.all(instances.map(async (instance) => {
            const phases = await prisma.protocolPhase.findMany({
                where: { protocol_id: instance.protocol_id },
                orderBy: { order: 'asc' }
            });

            const currentPhaseEntry = await prisma.patientProtocolPhase.findFirst({
                where: { instance_id: instance.id, is_current: true }
            });

            return {
                ...instance,
                protocol: {
                    ...instance.protocol,
                    phases
                },
                currentPhaseEntry
            };
        }));

        return { success: true, data: enrichedInstances };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed' };
    }
}

export async function assignProtocol(patientId: string, protocolId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // 1. Create Instance
        const instance = await prisma.patientProtocolInstance.create({
            data: {
                tenant_id: claims.tenant_id,
                patient_id: patientId,
                protocol_id: protocolId,
                created_by: claims.user_id,
                is_active: true
            }
        });

        // 2. Find First Phase
        const firstPhase = await prisma.protocolPhase.findFirst({
            where: { protocol_id: protocolId },
            orderBy: { order: 'asc' }
        });

        // 3. Start First Phase if exists
        if (firstPhase) {
            await prisma.patientProtocolPhase.create({
                data: {
                    instance_id: instance.id,
                    phase_id: firstPhase.id,
                    is_current: true
                }
            });
        }

        revalidatePath(`/studio/patients/${patientId}/protocols`);
        return { success: true, data: instance };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed to assign protocol' };
    }
}

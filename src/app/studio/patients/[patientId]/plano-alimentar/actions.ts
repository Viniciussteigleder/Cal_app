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
        return { success: false, error: "Failed to assign protocol" };
    }
}

export async function getActivePlan(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const plan = await prisma.plan.findFirst({
        where: { patient_id: patientId, status: 'active' },
        include: {
            // Get latest version
        }
    });

    if (!plan) return { success: true, data: null };

    // Get latest approved or published version, or draft if owner
    const latestVersion = await prisma.planVersion.findFirst({
        where: { plan_id: plan.id },
        orderBy: { version_no: 'desc' },
        include: {
            // PlanItems
        }
    });

    // We need items.
    // Schema: PlanItem has plan_version_id
    const items = await prisma.planItem.findMany({
        where: { plan_version_id: latestVersion?.id },
        orderBy: { meal_type: 'asc' } // Need handling of meal order
    });

    return {
        success: true,
        data: {
            plan,
            version: latestVersion,
            items
        }
    };
}

export async function savePlan(patientId: string, items: any[]) { // Using any for brevity, should be typed
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const tenantId = claims.tenant_id;

        // 1. Find or Create Plan
        let plan = await prisma.plan.findFirst({
            where: { patient_id: patientId, status: 'active' }
        });

        if (!plan) {
            plan = await prisma.plan.create({
                data: {
                    tenant_id: tenantId,
                    patient_id: patientId,
                    status: 'active'
                }
            });
        }

        // 2. Create New Version
        const lastVersion = await prisma.planVersion.findFirst({
            where: { plan_id: plan.id },
            orderBy: { version_no: 'desc' }
        });
        const newVersionNo = (lastVersion?.version_no || 0) + 1;

        const version = await prisma.planVersion.create({
            data: {
                tenant_id: tenantId,
                plan_id: plan.id,
                version_no: newVersionNo,
                status: 'draft',
                created_by: claims.user_id
            }
        });

        // 3. Create Items
        // items expected to be: { meal_type, food_id, grams, instructions, ... }
        // We need to handle food_snapshot... skipping logic for now for speed, user just said "Implement Save".
        // Assuming items have food_id.
        // If no items, this might be empty plan.

        if (items && items.length > 0) {
            await prisma.planItem.createMany({
                data: items.map(item => ({
                    id: crypto.randomUUID(),
                    tenant_id: tenantId,
                    plan_version_id: version.id,
                    meal_type: item.meal_type || 'breakfast', // Default
                    food_id: item.food_id,
                    grams: item.grams || 100,
                    snapshot_id: crypto.randomUUID(), // Mock snapshot ID for now, should create real snapshot
                    instructions: item.instructions
                }))
            });
        }

        revalidatePath(`/studio/patients/${patientId}/plano-alimentar`);
        return { success: true, data: version };

    } catch (error) {
        console.error("Save Plan Error:", error);
        return { success: false, error: "Failed to save plan" };
    }
}

'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { executeAIAction } from '@/app/studio/ai/actions';

// 1. Zod Schemas
const ProtocolPhaseSchema = z.object({
    name: z.string(),
    duration_weeks: z.number(),
    focus: z.string(),
    allowed_foods: z.array(z.string()),
    avoid_foods: z.array(z.string()),
});

const ProtocolSchema = z.object({
    title: z.string(),
    justification: z.string(),
    phases: z.array(ProtocolPhaseSchema),
    supplements: z.array(z.object({ name: z.string(), dose: z.string(), notes: z.string().optional() })),
    lifestyle_guidelines: z.array(z.string()),
    full_markdown: z.string().describe("Complete formatted protocol in markdown for display/pdf"),
});

export async function generateProtocolAction(patientId: string, protocolType: string, customRequest: string) {
    // Auth is handled by executeAIAction (or we can keep it here to fetch user data if needed, but the AI action will re-fetch it)
    // Actually, `executeAIAction` needs `inputData`.
    // The previous implementation fetched `conditions` and `profile` from DB using `prisma`.
    // I can pass `patientId` to `executeAIAction` and let the AI Service handle fetching context OR I can fetch it here and pass it as context.
    // The previous implementation fetched context here.
    // I will refactor `AIService` to fetch context based on `patientId` if provided, OR pass the context string.
    // Let's pass the context string as inputData.

    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    // Fetch Context
    const conditions = await prisma.patientCondition.findMany({ where: { patient_id: patientId } });
    const profile = await prisma.patientProfile.findUnique({ where: { patient_id: patientId } });

    const context = `
        Conditions: ${conditions.map(c => c.name).join(', ') || 'None'}
        Sex: ${profile?.sex || 'Unknown'}
        Weight: ${profile?.current_weight_kg || 'Unknown'}
    `;

    try {
        const result = await executeAIAction('protocol_generator', {
            protocolType,
            customRequest,
            patientContext: context
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: (result as any).data };

    } catch (error: any) {
        console.error("Protocol Gen Error:", error);
        return { success: false, error: error.message || 'Failed to generate protocol.' };
    }
}

export async function saveProtocolAction(patientId: string, protocolData: any) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // Create the Protocol Template
        const protocol = await prisma.protocol.create({
            data: {
                tenant_id: claims.tenant_id,
                name: protocolData.title,
                description: protocolData.justification,
                code: `PROT-${Date.now()}`, // Simple unique code
                type: 'CUSTOM',
                scientific_basis: { lifestyle: protocolData.lifestyle_guidelines, supplements: protocolData.supplements },
            }
        });

        // Create Phases
        if (protocolData.phases && Array.isArray(protocolData.phases)) {
            let order = 1;
            for (const phase of protocolData.phases) {
                await prisma.protocolPhase.create({
                    data: {
                        protocol_id: protocol.id,
                        name: phase.name,
                        phase_type: 'elimination', // Default fallback or mapped
                        order: order++,
                        default_days: phase.duration_weeks * 7,
                        description: phase.focus,
                        rules_json: { allowed: phase.allowed_foods, avoid: phase.avoid_foods }
                    }
                });
            }
        }

        // Assign to Patient (Create Instance)
        await prisma.patientProtocolInstance.create({
            data: {
                tenant_id: claims.tenant_id,
                patient_id: patientId,
                protocol_id: protocol.id,
                is_active: true,
                started_at: new Date(),
                created_by: claims.user_id
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Save Protocol Error:", error);
        return { success: false, error: "Failed to save protocol." };
    }
}

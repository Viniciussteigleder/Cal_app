
'use server';

import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { recordAiUsage } from '@/lib/ai/usage';
import { getSupabaseClaims } from '@/lib/auth';
import { getAgentConfig } from '@/lib/ai-config';

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
        // 2. Dynamic Config
        // Note: Assuming 'protocol_generator' is the agent ID in valid config list
        const config = await getAgentConfig('protocol_generator'); // Will fallback to default if not in DB

        // 3. AI Execution
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });

        const { object, usage } = await generateObject({
            model: openai(config.model),
            schema: ProtocolSchema,
            temperature: config.temperature,
            system: config.systemPrompt || "You are an expert clinical nutritionist.",
            messages: [{
                role: 'user',
                content: `Create a ${protocolType} protocol.
                Context: ${context}
                Request: ${customRequest}
                
                Provide structured phases and a full markdown version.`
            }]
        });

        // 4. Billing
        await recordAiUsage({
            tenantId: claims.tenant_id,
            nutritionistId: claims.user_id,
            patientId,
            agentType: 'protocol_generator',
            creditsUsed: 2,
            costUsd: (usage.totalTokens || 0) * (10 / 1000000),
            costBrl: (usage.totalTokens || 0) * (10 / 1000000) * 5.5,
            metadata: { protocolType }
        });

        // Return the full object so the client can display markdown AND save structured data
        return { success: true, data: object };

    } catch (error) {
        console.error("Protocol Gen Error:", error);
        return { success: false, error: 'Failed to generate protocol.' };
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

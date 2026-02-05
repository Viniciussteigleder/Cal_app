
'use server';

import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { recordAiUsage } from '@/lib/ai/usage';
import { getSupabaseClaims } from '@/lib/auth';
import { getAgentConfig } from '@/lib/ai-config';

const AnalysisSchema = z.object({
    adherence_score: z.number().describe("0-100 score of plan adherence"),
    progress_score: z.number().describe("0-100 score of goal progress"),
    dropout_risk: z.enum(['low', 'medium', 'high', 'critical']),
    intervention_needed: z.boolean(),
    suspected_deficiencies: z.array(z.string()).describe("Potential micronutrient deficiencies based on logs"),
    dietary_patterns: z.string().describe("Summary of observed eating habits and timing"),
    clinical_reasoning: z.string().describe("Deep clinical analysis of causal relationships between intake and symptoms"),
    insights: z.array(z.string()).describe("Key observations about patient behavior"),
    recommended_actions: z.array(z.object({
        action: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
        description: z.string()
    }))
});

export async function analyzePatientAction(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // Fetch Patient Logs (Last 30 days)
        const logs = await prisma.dailyLogEntry.findMany({
            where: {
                tenant_id: claims.tenant_id,
                patient_id: patientId,
                timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            take: 100,
            orderBy: { timestamp: 'desc' }
        });

        // Config
        const config = await getAgentConfig('patient_analyzer');
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });

        const { object, usage } = await generateObject({
            model: openai(config.model),
            schema: AnalysisSchema,
            temperature: config.temperature,
            system: config.systemPrompt || "You are a senior clinical nutritionist acting as a 'Clinical Copilot'.",
            messages: [{
                role: 'user',
                content: `Analyze these patient logs for:
                1. Adherence to unknown plan (infer from consistency)
                2. Potential micronutrient deficiencies based on food choices
                3. Correlation between food intake and reported symptoms (if any)
                4. Behavioral patterns (binge eating, skipping meals, etc.)

                Logs: ${JSON.stringify(logs.map((l: any) => ({ type: l.entry_type, date: l.timestamp, content: l.content })))}
                `
            }]
        });

        // Billing
        await recordAiUsage({
            tenantId: claims.tenant_id,
            nutritionistId: claims.user_id,
            patientId,
            agentType: 'patient_analyzer',
            creditsUsed: 3,
            costUsd: (usage.totalTokens || 0) * (15 / 1000000),
            costBrl: (usage.totalTokens || 0) * (15 / 1000000) * 5.5
        });

        return { success: true, data: object };

    } catch (error) {
        console.error("Patient Analysis Error:", error);
        return { success: false, error: "Analysis failed" };
    }
}

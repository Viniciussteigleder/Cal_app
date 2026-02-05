
'use server';

import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { recordAiUsage } from '@/lib/ai/usage';
import { getSupabaseClaims } from '@/lib/auth';
import { getAgentConfig } from '@/lib/ai-config';

// 1. Zod Schemas
const SymptomCorrelationSchema = z.object({
    correlation_type: z.enum(['temporal', 'food_trigger', 'lifestyle', 'pattern']),
    description: z.string(),
    confidence_score: z.number().min(0).max(100),
    supporting_evidence: z.array(z.string()),
});

const SymptomAnalysisResultSchema = z.object({
    correlations: z.array(SymptomCorrelationSchema),
    summary: z.string().describe("Executive summary of findings in markdown"),
    suggested_actions: z.array(z.string()),
    severity_trend: z.enum(['improving', 'worsening', 'stable', 'fluctuating']),
});

export async function runSymptomCorrelation(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    // Fetch Data
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30);

    const symptoms = await prisma.symptomLog.findMany({
        where: { patient_id: patientId, logged_at: { gte: dateLimit } },
        orderBy: { logged_at: 'asc' }
    });

    const notes = await prisma.patientLogEntry.findMany({
        where: { patient_id: patientId, timestamp: { gte: dateLimit } },
        orderBy: { timestamp: 'asc' }
    });

    if (symptoms.length < 3) {
        return { success: false, error: 'Dados insuficientes (Mínimo 3 registros).' };
    }

    try {
        // 2. Dynamic Config
        const config = await getAgentConfig('symptom_correlator');

        // 3. AI Execution
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });

        const { object, usage } = await generateObject({
            model: openai(config.model),
            schema: SymptomAnalysisResultSchema,
            temperature: config.temperature,
            system: config.systemPrompt,
            messages: [{
                role: 'user',
                content: `Analyze these patient logs for correlations.
                Symptoms: ${JSON.stringify(symptoms.map(s => ({ d: s.logged_at, s: s.symptoms, v: s.discomfort_level })))}
                Notes: ${JSON.stringify(notes.map(n => ({ d: n.timestamp, t: n.entry_type, c: n.content })))}
                `
            }]
        });

        // 4. Billing
        await recordAiUsage({
            tenantId: claims.tenant_id,
            nutritionistId: claims.user_id,
            patientId,
            agentType: 'symptom_correlator',
            creditsUsed: 1,
            costUsd: (usage.totalTokens || 0) * (5 / 1000000), // Approx text cost
            costBrl: (usage.totalTokens || 0) * (5 / 1000000) * 5.5,
            metadata: { symptomsCount: symptoms.length }
        });

        // Return structured data serialized (or formatted text if UI expects string)
        // Looking at the client component (SymptomCorrelatorClient), it expects `string | null` for `result`.
        // Ideally we update the client to accept the object, but for now let's return the summary + formatted correlations.

        let markdownOutput = object.summary + "\n\n### Correlações Identificadas:\n";
        object.correlations.forEach(c => {
            markdownOutput += `- **${c.correlation_type} (${c.confidence_score}%)**: ${c.description}\n`;
        });

        return { success: true, data: markdownOutput };

    } catch (error) {
        console.error("Symptom Correlation Error:", error);
        return { success: false, error: 'Falha na análise de IA.' };
    }
}

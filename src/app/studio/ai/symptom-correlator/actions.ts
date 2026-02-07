'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { executeAIAction } from '@/app/studio/ai/actions';

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
        const result = await executeAIAction('symptom_correlator', {
            symptomsData: symptoms.map(s => ({ d: s.logged_at, s: s.symptoms, v: s.discomfort_level })),
            notesData: notes.map(n => ({ d: n.timestamp, t: n.entry_type, c: n.content }))
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        const data = (result as any).data;
        // Format as expected by client (string)
        // The prompt returns { correlations: [], summary: "", ... }
        let markdownOutput = (data.summary || "Análise concluída.") + "\n\n### Correlações Identificadas:\n";

        if (data.correlations && Array.isArray(data.correlations)) {
            data.correlations.forEach((c: any) => {
                markdownOutput += `- **${c.correlation_type} (${c.confidence_score}%)**: ${c.description}\n`;
            });
        }

        return { success: true, data: markdownOutput };

    } catch (error: any) {
        console.error("Symptom Correlation Error:", error);
        return { success: false, error: error.message || 'Falha na análise de IA.' };
    }
}

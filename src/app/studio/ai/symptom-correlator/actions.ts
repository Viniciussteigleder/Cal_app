'use server';

import { prisma } from '@/lib/prisma';
import { generateChatCompletion } from '@/lib/openai';
import { recordAiUsage } from '@/lib/ai/usage';
import { getSupabaseClaims } from '@/lib/auth';

export async function runSymptomCorrelation(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    // Fetch last 30 days data
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30);

    const symptoms = await prisma.symptomLog.findMany({
        where: { patient_id: patientId, logged_at: { gte: dateLimit } },
        orderBy: { logged_at: 'asc' }
    });

    const notes = await prisma.patientLogEntry.findMany({
        where: {
            patient_id: patientId,
            timestamp: { gte: dateLimit }
        },
        orderBy: { timestamp: 'asc' }
    });

    if (symptoms.length < 3) {
        return { success: false, error: 'Dados insuficientes. É necessário pelo menos 3 registros de sintomas para análise.' };
    }

    // Prepare Prompt
    const systemPrompt = "Você é um detetive médico nutricional especializado em identificar gatilhos alimentares e padrões de sintomas. Seja analítico e baseie-se apenas nos dados fornecidos.";
    const userPrompt = `
        Analise os seguintes dados de um paciente nos últimos 30 dias para identificar correlações entre alimentação/eventos e sintomas.

        REGISTROS DE SINTOMAS:
        ${JSON.stringify(symptoms.map(s => ({
        date: s.logged_at,
        symptoms: s.symptoms,
        severity: s.discomfort_level,
        notes: s.notes
    })), null, 2)}

        DIÁRIO / NOTAS CLÍNICAS:
        ${JSON.stringify(notes.map(n => ({
        date: n.timestamp,
        type: n.entry_type,
        content: n.content
    })), null, 2)}

        TAREFA:
        1. Identifique correlações temporais (ex: sintoma X ocorre Y horas após refeição Z).
        2. Destaque possíveis gatilhos alimentares.
        3. Identifique padrões de horário ou dia da semana.
        4. Sugira uma estratégia de eliminação ou teste.

        Formate a resposta em Markdown claro e estruturado.
    `;

    // Mock Cost Estimation
    const costUsd = 0.04;
    const costBrl = costUsd * 5.50;

    try {
        const { content } = await generateChatCompletion(systemPrompt, userPrompt);

        await recordAiUsage({
            tenantId: claims.tenant_id,
            nutritionistId: claims.user_id,
            patientId,
            agentType: 'symptom_correlator',
            creditsUsed: 1,
            costUsd,
            costBrl,
            metadata: { result_length: content?.length }
        });

        return { success: true, data: content };

    } catch (error) {
        console.error("Symptom Correlation Error:", error);
        return { success: false, error: 'Falha ao processar análise de IA.' };
    }
}

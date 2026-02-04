'use server';

import { prisma } from '@/lib/prisma';
import { generateChatCompletion } from '@/lib/openai';
import { recordAiUsage } from '@/lib/ai/usage';
import { getSupabaseClaims } from '@/lib/auth';

export async function generateProtocolAction(patientId: string, protocolType: string, customRequest: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    // Fetch Context
    const conditions = await prisma.patientCondition.findMany({ where: { patient_id: patientId } });
    const profile = await prisma.patientProfile.findUnique({ where: { patient_id: patientId } });

    const context = `
        Condições Clínicas: ${conditions.map(c => c.name).join(', ') || 'Nenhuma registrada'}
        Sexo: ${profile?.sex || 'Não informado'}
        Peso: ${profile?.current_weight_kg ? Number(profile.current_weight_kg) + 'kg' : 'Não informado'}
        Objetivo: ${profile?.goal || 'Geral'}
    `;

    const systemPrompt = "Você é um nutricionista funcional expert em desenvolvimento de protocolos clínicos personalizados. Você cria planos práticos, seguros e baseados em ciência.";

    const userPrompt = `
        Crie um protocolo nutricional detalhado para o seguinte paciente.

        CONTEXTO:
        ${context}

        TIPO DE PROTOCOLO SOLICITADO: ${protocolType}
        OBSERVAÇÕES DO PROFISSIONAL: ${customRequest || "Nenhuma"}

        ESTRUTURA DA RESPOSTA (Use Markdown):
        # [Nome do Protocolo]
        
        ## 1. Justificativa e Objetivos
        Explique por que este protocolo é adequado para o paciente e quais os resultados esperados.

        ## 2. Estrutura de Fases
        Detallhe as fases (ex: Eliminação, Reintrodução, Manutenção), incluindo a duração sugerida de cada uma.

        ## 3. Guia Alimentar
        Crie uma tabela ou listas claras de:
        - ✅ ALIMENTOS PRIORITÁRIOS
        - ⚠️ MODERAR
        - 🚫 EVITAR

        ## 4. Sugestão de Suplementação
        (Se aplicável, com dosagens conservadoras e aviso de supervisão médica).

        ## 5. Exemplo de Cardápio (Dia Tipo - Fase 1)
        - Café da Manhã
        - Almoço
        - Lanche
        - Jantar

        ## 6. Orientações Gerais
        Hidratação, sono e manejo de estresse.
    `;

    // Cost estimation (higher complexity)
    const costUsd = 0.08;
    const costBrl = costUsd * 5.50;

    try {
        const { content } = await generateChatCompletion(systemPrompt, userPrompt);

        await recordAiUsage({
            tenantId: claims.tenant_id,
            nutritionistId: claims.user_id,
            patientId,
            agentType: 'protocol_generator',
            creditsUsed: 2, // Higher cost
            costUsd,
            costBrl,
            metadata: { protocol_type: protocolType }
        });

        return { success: true, data: content };

    } catch (error) {
        console.error("Protocol Generation Error:", error);
        return { success: false, error: 'Falha na geração do protocolo.' };
    }
}

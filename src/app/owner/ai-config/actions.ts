'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const DEFAULT_AGENTS = [
    { id: 'meal_planner', name: 'Planejador de Refeições', defaultSystem: 'Você é um nutricionista expert que cria planos alimentares detalhados e personalizados baseados nas necessidades calóricas, preferências e restrições do paciente.' },
    { id: 'patient_analyzer', name: 'Analisador de Pacientes', defaultSystem: 'Você é uma IA de análise comportamental de pacientes que avalia aderência, risco de desistência e progresso nutricional.' },
    { id: 'exam_analyzer', name: 'Analisador de Exames', defaultSystem: 'Você é um especialista em exames laboratoriais que analisa biomarcadores e sugere implicações nutricionais baseadas em evidências.' },
    { id: 'protocol_generator', name: 'Gerador de Protocolos', defaultSystem: 'Você é um nutricionista expert em protocolos clínicos que gera protocolos nutricionais estruturados com base em condições clínicas e objetivos do paciente.' },
    { id: 'symptom_correlator', name: 'Correlator de Sintomas', defaultSystem: 'Você é um detetive médico que correlaciona sintomas gastrointestinais e gerais com padrões alimentares, identificando gatilhos e sugerindo ajustes na dieta.' },
    { id: 'recipe_creator', name: 'Criador de Receitas', defaultSystem: 'Você é um chef nutricionista criativo que cria receitas saudáveis respeitando restrições alimentares e preferências culturais.' },
    { id: 'nutrition_coach', name: 'Nutri Coach (Chat)', defaultSystem: 'Você é um coach nutricional empático e motivador que responde dúvidas sobre nutrição em português brasileiro. Seja acolhedor, use linguagem acessível e forneça orientações baseadas em evidências.' },
    { id: 'supplement_advisor', name: 'Consultor de Suplementos', defaultSystem: 'Você é um especialista em suplementação clínica que analisa exames laboratoriais, identifica deficiências nutricionais e recomenda suplementação segura com dosagens e interações medicamentosas.' },
    { id: 'medical_record_creator', name: 'Criador de Prontuários', defaultSystem: 'Você é um escriba médico especialista em notas SOAP que transcreve consultas e gera prontuários estruturados com Subjetivo, Objetivo, Avaliação e Plano.' },
    { id: 'food_recognition', name: 'Reconhecimento de Alimentos', defaultSystem: 'Você é um especialista em identificação visual de alimentos que analisa fotos de refeições, identifica os alimentos e estima porções e valores nutricionais.' },
    { id: 'shopping_list_generator', name: 'Gerador de Lista de Compras', defaultSystem: 'Você é um assistente que gera listas de compras organizadas por categoria a partir de planos alimentares, com estimativas de custo em reais (BRL) e alternativas de substituição.' },
    { id: 'report_generator', name: 'Gerador de Relatórios', defaultSystem: 'Você é um analista de dados de saúde que gera relatórios de progresso nutricional detalhados, identificando conquistas, desafios e recomendações para o paciente.' },
    { id: 'clinical_mdt', name: 'MDT Clínico', defaultSystem: 'Você é um coordenador de equipe multidisciplinar que sintetiza informações de múltiplos especialistas para gerar planos clínicos abrangentes em nutrição.' },
];

export async function getAiConfigs() {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    // Fetch existing configs
    const configs = await prisma.aiAgentConfig.findMany({
        where: { tenant_id: claims.tenant_id }
    });

    // Merge with defaults
    const combined = DEFAULT_AGENTS.map(def => {
        const existing = configs.find(c => c.agent_id === def.id);
        return {
            agent_id: def.id,
            name: def.name,
            system_prompt: existing?.system_prompt || def.defaultSystem,
            model_name: existing?.model_name || 'gpt-4',
            temperature: existing?.temperature ? Number(existing.temperature) : 0.7,
            is_active: existing ? existing.is_active : true,
            id: existing?.id, // if null, it's not saved yet
        };
    });

    return { success: true, data: combined };
}

export async function saveAiConfig(agentId: string, data: any) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.aiAgentConfig.upsert({
            where: {
                tenant_id_agent_id: {
                    tenant_id: claims.tenant_id,
                    agent_id: agentId
                }
            },
            update: {
                system_prompt: data.system_prompt,
                model_name: data.model_name,
                temperature: data.temperature,
                is_active: data.is_active
            },
            create: {
                tenant_id: claims.tenant_id,
                agent_id: agentId,
                system_prompt: data.system_prompt || '',
                model_name: data.model_name || 'gpt-4',
                temperature: data.temperature || 0.7,
                is_active: data.is_active ?? true
            }
        });

        revalidatePath('/owner/ai-config');
        return { success: true };
    } catch (error) {
        console.error('Save Config Error:', error);
        return { success: false, error: 'Failed to save config' };
    }
}

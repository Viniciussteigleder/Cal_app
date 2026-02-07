'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const DEFAULT_AGENTS = [
    { id: 'meal_planner', name: 'Planejador de Refeições', defaultSystem: 'Você é um nutricionista expert que cria planos alimentares detalhados...' },
    { id: 'patient_analyzer', name: 'Analisador de Pacientes', defaultSystem: 'Você é uma IA de análise comportamental de pacientes...' },
    { id: 'exam_analyzer', name: 'Analisador de Exames', defaultSystem: 'Você é um especialista em exames laboratoriais...' },
    { id: 'protocol_generator', name: 'Gerador de Protocolos', defaultSystem: 'Você é um nutricionista expert em protocolos clínicos...' },
    { id: 'symptom_correlator', name: 'Correlator de Sintomas', defaultSystem: 'Você é um detetive médico que correlaciona sintomas com dieta...' },
    { id: 'recipe_creator', name: 'Criador de Receitas', defaultSystem: 'Você é um chef nutricionista criativo...' },
    { id: 'nutrition_coach', name: 'Nutri Coach (Chat)', defaultSystem: 'Você é um coach nutricional empático e motivador...' },
    { id: 'supplement_advisor', name: 'Consultor de Suplementos', defaultSystem: 'Você é um especialista em suplementação esportiva e clínica...' },
    { id: 'medical_record_creator', name: 'Criador de Prontuários', defaultSystem: 'Você é um escriba médico especialista em SOAP...' },
    { id: 'food_recognition', name: 'Reconhecimento de Alimentos', defaultSystem: 'Você é um especialista em visão computacional para alimentos...' },
    { id: 'shopping_list_generator', name: 'Gerador de Lista de Compras', defaultSystem: 'Você é um assistente de compras organizado...' },
    { id: 'macro_balancer', name: 'Balanceador de Macros', defaultSystem: 'Você é um nutricionista especialista em cálculo de macronutrientes...' },
    { id: 'report_generator', name: 'Gerador de Relatórios', defaultSystem: 'Você é um analista de dados clínicos que cria relatórios detalhados...' },
    { id: 'appointment_scheduler', name: 'Agendador de Consultas', defaultSystem: 'Você é um assistente administrativo eficiente...' },
    { id: 'content_educator', name: 'Educador de Conteúdo', defaultSystem: 'Você é um professor de nutrição didático e claro...' },
    { id: 'clinical_mdt', name: 'MDT Clínico', defaultSystem: 'Você é o NutriPlan Nutrition Collab...' },
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

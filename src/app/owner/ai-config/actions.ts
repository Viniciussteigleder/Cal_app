'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const DEFAULT_AGENTS = [
    { id: 'protocol_generator', name: 'Gerador de Protocolos', defaultSystem: 'Você é um nutricionista expert...' },
    { id: 'symptom_correlator', name: 'Correlator de Sintomas', defaultSystem: 'Você é um detetive médico...' },
    { id: 'recipe_generator', name: 'Gerador de Receitas', defaultSystem: 'Você é um chef nutricionista...' },
    { id: 'exam_analyzer', name: 'Analisador de Exames', defaultSystem: 'Você é um especialista em exames laboratoriais...' },
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


import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';

export type AgentConfig = {
    systemPrompt: string;
    model: string;
    temperature: number;
};

// Default configurations to fall back on
const DEFAULTS: Record<string, AgentConfig> = {
    exam_analyzer: {
        systemPrompt: `Você é um especialista em análises clínicas e nutrição de precisão.
Sua tarefa é analisar exames laboratoriais e fornecer interpretações detalhadas, 
identificando biomarcadores fora do padrão e sugerindo correções nutricionais específicas.
Responda sempre em JSON estrito seguindo o schema solicitado.`,
        model: 'gpt-4o',
        temperature: 0.2,
    },
    meal_planner: {
        systemPrompt: `Você é um nutricionista expert focado em planejamento alimentar personalizado.`,
        model: 'gpt-4o',
        temperature: 0.7,
    },
    symptom_correlator: {
        systemPrompt: `Você é um detetive médico especializado em identificar padrões entre dieta e sintomas.`,
        model: 'gpt-4o',
        temperature: 0.5,
    }
};

/**
 * Retrieves the AI configuration for a specific agent.
 * Prioritizes Database config > Default config.
 */
export async function getAgentConfig(agentId: string): Promise<AgentConfig> {
    // 1. Try to get tenant context
    const claims = await getSupabaseClaims();

    // if no tenant (e.g. background job), use defaults
    if (!claims?.tenant_id) {
        return DEFAULTS[agentId] || {
            systemPrompt: 'You are a helpful AI assistant.',
            model: 'gpt-3.5-turbo',
            temperature: 0.7
        };
    }

    // 2. Fetch from DB
    const dbConfig = await prisma.aiAgentConfig.findUnique({
        where: {
            tenant_id_agent_id: {
                tenant_id: claims.tenant_id,
                agent_id: agentId,
            },
        },
    });

    // 3. Merge with defaults
    const defaultConf = DEFAULTS[agentId] || {
        systemPrompt: 'You are a helpful AI assistant.',
        model: 'gpt-4o',
        temperature: 0.7
    };

    if (!dbConfig || !dbConfig.is_active) {
        return defaultConf;
    }

    return {
        systemPrompt: dbConfig.system_prompt || defaultConf.systemPrompt,
        model: dbConfig.model_name || defaultConf.model,
        temperature: dbConfig.temperature ? Number(dbConfig.temperature) : defaultConf.temperature,
    };
}

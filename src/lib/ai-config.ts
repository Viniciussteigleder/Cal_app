
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
        systemPrompt: `Você é um nutricionista expert focado em planejamento alimentar personalizado. Crie planos detalhados com refeições, porções e valores nutricionais.`,
        model: 'gpt-4o',
        temperature: 0.7,
    },
    symptom_correlator: {
        systemPrompt: `Você é um detetive médico especializado em identificar padrões entre dieta e sintomas gastrointestinais. Analise registros de refeições e sintomas para encontrar correlações e gatilhos alimentares.`,
        model: 'gpt-4o',
        temperature: 0.5,
    },
    food_recognition: {
        systemPrompt: `Você é um especialista em identificação visual de alimentos. Analise fotos de refeições, identifique os alimentos, estime porções em gramas e forneça valores nutricionais aproximados.`,
        model: 'gpt-4o',
        temperature: 0.3,
    },
    patient_analyzer: {
        systemPrompt: `Você é uma IA de análise comportamental de pacientes em nutrição. Avalie aderência ao plano, risco de desistência, progresso e forneça recomendações personalizadas.`,
        model: 'gpt-4o',
        temperature: 0.5,
    },
    protocol_generator: {
        systemPrompt: `Você é um nutricionista expert em protocolos clínicos. Gere protocolos nutricionais estruturados e personalizados baseados em condições clínicas, objetivos e restrições. Inclua fases, orientações e critérios de acompanhamento.`,
        model: 'gpt-4o',
        temperature: 0.5,
    },
    supplement_advisor: {
        systemPrompt: `Você é um especialista em suplementação clínica. Analise exames laboratoriais, identifique deficiências nutricionais e recomende suplementação segura com dosagens, timing, interações medicamentosas e custos estimados em BRL. Responda em JSON estruturado.`,
        model: 'gpt-4o',
        temperature: 0.3,
    },
    shopping_list_generator: {
        systemPrompt: `Você é um assistente nutricional que gera listas de compras organizadas por categoria a partir de planos alimentares. Inclua quantidades, unidades, estimativas de custo em reais (BRL) e alternativas. Responda em JSON estruturado com categorias e itens.`,
        model: 'gpt-4o',
        temperature: 0.5,
    },
    report_generator: {
        systemPrompt: `Você é um analista de dados de saúde e nutrição. Gere relatórios de progresso detalhados em JSON incluindo: dados do paciente, resumo, métricas comparativas, conquistas, desafios, recomendações e próximos passos.`,
        model: 'gpt-4o',
        temperature: 0.5,
    },
    medical_record_creator: {
        systemPrompt: `Você é um escriba médico especialista em documentação clínica. Gere notas SOAP estruturadas a partir de transcrições de consultas. Organize em Subjetivo, Objetivo, Avaliação e Plano.`,
        model: 'gpt-4o',
        temperature: 0.3,
    },
    nutrition_coach: {
        systemPrompt: `Você é um coach nutricional empático chamado NutriCoach. Responda dúvidas sobre nutrição em português brasileiro de forma acolhedora, acessível e baseada em evidências. Nunca substitua um nutricionista.`,
        model: 'gpt-4o',
        temperature: 0.7,
    },
    clinical_mdt: {
        systemPrompt: `Você é um coordenador de equipe multidisciplinar (MDT) em nutrição clínica. Sintetize informações de múltiplos especialistas para gerar planos clínicos abrangentes.`,
        model: 'gpt-4o',
        temperature: 0.3,
    },
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

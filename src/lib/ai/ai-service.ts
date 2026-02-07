/**
 * AI Service Integration Framework
 *
 * Unified interface for all AI agents with execution tracking,
 * credit billing, usage limits, and error handling.
 */

import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AIAgentType =
    | 'food_recognition'
    | 'meal_planner'
    | 'patient_analyzer'
    | 'exam_analyzer'
    | 'medical_record_creator'
    | 'protocol_generator'
    | 'symptom_correlator'
    | 'recipe_creator'
    | 'nutrition_coach'
    | 'supplement_advisor'
    | 'shopping_list_generator'
    | 'macro_balancer'
    | 'report_generator'
    | 'appointment_scheduler'
    | 'content_educator';

export interface AIExecutionInput {
    tenantId: string;
    agentType: AIAgentType;
    inputData: Record<string, any>;
    userId?: string;
}

export interface AIExecutionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    executionId: string;
    tokensUsed?: number;
    cost?: number;
    creditsUsed?: number;
    executionTimeMs: number;
}

export interface AgentRuntimeConfig {
    modelName: string;
    systemPrompt: string;
    temperature: number;
    isActive: boolean;
}

/** Credit cost per agent type */
const AGENT_CREDIT_COSTS: Record<AIAgentType, number> = {
    food_recognition: 2,
    meal_planner: 5,
    patient_analyzer: 4,
    exam_analyzer: 6,
    medical_record_creator: 3,
    protocol_generator: 5,
    symptom_correlator: 4,
    recipe_creator: 3,
    nutrition_coach: 1,
    supplement_advisor: 4,
    shopping_list_generator: 2,
    macro_balancer: 2,
    report_generator: 5,
    appointment_scheduler: 1,
    content_educator: 1,
};

/** Cost per 1k tokens by model family */
const MODEL_COST_PER_1K: Record<string, number> = {
    'gpt-4-turbo-preview': 0.01,
    'gpt-4o': 0.005,
    'gpt-4-vision-preview': 0.01,
    'gpt-3.5-turbo': 0.001,
    'whisper-1': 0.006,
    'claude-3-5-sonnet': 0.003,
};

function getCostPer1k(model: string): number {
    for (const [key, cost] of Object.entries(MODEL_COST_PER_1K)) {
        if (model.includes(key)) return cost;
    }
    return 0.005; // default
}

// ============================================================================
// AI SERVICE CLASS
// ============================================================================

export class AIService {
    private openai: OpenAI | null = null;
    private anthropic: Anthropic | null = null;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        if (process.env.ANTHROPIC_API_KEY) {
            this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        }
    }

    /** Check if at least one AI provider is configured */
    hasProvider(): boolean {
        return !!(this.openai || this.anthropic);
    }

    private requireOpenAI(): OpenAI {
        if (!this.openai) throw new Error('OpenAI não configurado. Defina OPENAI_API_KEY.');
        return this.openai;
    }

    /**
     * Execute an AI agent with automatic tracking and billing
     */
    async execute<T = any>(input: AIExecutionInput): Promise<AIExecutionResult<T>> {
        const startTime = Date.now();
        let executionId: string | null = null;
        const creditCost = AGENT_CREDIT_COSTS[input.agentType] ?? 1;

        try {
            if (!this.hasProvider()) {
                throw new Error('Nenhum provedor de IA configurado. Defina OPENAI_API_KEY ou ANTHROPIC_API_KEY.');
            }

            // Check tenant AI credits and usage limit
            const tenant = await prisma.tenant.findUnique({
                where: { id: input.tenantId },
                select: { ai_enabled: true, ai_credits: true, ai_usage_limit: true },
            });

            if (!tenant?.ai_enabled) {
                throw new Error('Recursos de IA não estão habilitados para este tenant.');
            }
            if (tenant.ai_credits < creditCost) {
                throw new Error(`Créditos insuficientes. Necessário: ${creditCost}, disponível: ${tenant.ai_credits}.`);
            }

            // Check monthly usage limit
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            const monthlyUsage = await prisma.aIExecution.count({
                where: { tenant_id: input.tenantId, created_at: { gte: monthStart }, status: 'completed' },
            });
            if (monthlyUsage >= tenant.ai_usage_limit) {
                throw new Error(`Limite mensal de ${tenant.ai_usage_limit} execuções atingido.`);
            }

            // Get agent configuration
            const config = await this.getAgentConfig(input.tenantId, input.agentType);
            if (!config.isActive) {
                throw new Error('Este agente está desabilitado pelo administrador.');
            }

            // Create execution record
            const execution = await prisma.aIExecution.create({
                data: {
                    tenant_id: input.tenantId,
                    model_id: config.modelName,
                    agent_type: input.agentType,
                    input_data: input.inputData,
                    status: 'running',
                },
            });
            executionId = execution.id;

            // Execute the agent
            const result = await this.executeAgent(input.agentType, input.inputData, config);

            const cost = result.tokensUsed ? (result.tokensUsed / 1000) * getCostPer1k(config.modelName) : 0;
            const executionTimeMs = Date.now() - startTime;

            // Update execution + deduct credits in parallel
            await Promise.all([
                prisma.aIExecution.update({
                    where: { id: executionId },
                    data: {
                        output_data: result.data,
                        tokens_used: result.tokensUsed,
                        execution_time_ms: executionTimeMs,
                        cost,
                        status: 'completed',
                    },
                }),
                prisma.tenant.update({
                    where: { id: input.tenantId },
                    data: { ai_credits: { decrement: creditCost } },
                }),
                // Log credit transaction
                prisma.aiCreditTransaction.create({
                    data: {
                        tenant_id: input.tenantId,
                        nutritionist_id: input.userId,
                        agent_type: input.agentType,
                        credits_used: creditCost,
                        cost_usd: cost,
                        cost_brl: cost * 5.5,
                        metadata: { executionId, tokensUsed: result.tokensUsed },
                    },
                }).catch(() => { /* non-blocking */ }),
            ]);

            return {
                success: true,
                data: result.data,
                executionId,
                tokensUsed: result.tokensUsed,
                cost,
                creditsUsed: creditCost,
                executionTimeMs,
            };
        } catch (error) {
            const executionTimeMs = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

            if (executionId) {
                await prisma.aIExecution.update({
                    where: { id: executionId },
                    data: { status: 'failed', error_message: errorMessage, execution_time_ms: executionTimeMs },
                }).catch(() => { });
            }

            return {
                success: false,
                error: errorMessage,
                executionId: executionId || 'unknown',
                executionTimeMs,
            };
        }
    }

    /**
     * Get the effective configuration for an agent (DB -> defaults cascade)
     */
    private async getAgentConfig(tenantId: string, agentType: AIAgentType): Promise<AgentRuntimeConfig> {
        const dbConfig = await prisma.aiAgentConfig.findUnique({
            where: { tenant_id_agent_id: { tenant_id: tenantId, agent_id: agentType } },
        }).catch(() => null);

        const defaults: Record<string, AgentRuntimeConfig> = {
            food_recognition: {
                modelName: 'gpt-4-vision-preview', systemPrompt: PROMPTS.food_recognition, temperature: 0.3, isActive: true,
            },
            meal_planner: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.meal_planner, temperature: 0.7, isActive: true,
            },
            patient_analyzer: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.patient_analyzer, temperature: 0.5, isActive: true,
            },
            medical_record_creator: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.medical_record_creator, temperature: 0.3, isActive: true,
            },
            exam_analyzer: {
                modelName: 'gpt-4-vision-preview', systemPrompt: PROMPTS.exam_analyzer, temperature: 0.2, isActive: true,
            },
            protocol_generator: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.protocol_generator, temperature: 0.6, isActive: true,
            },
            symptom_correlator: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.symptom_correlator, temperature: 0.4, isActive: true,
            },
            recipe_creator: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.recipe_creator, temperature: 0.8, isActive: true,
            },
            nutrition_coach: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.nutrition_coach, temperature: 0.7, isActive: true,
            },
            supplement_advisor: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.supplement_advisor, temperature: 0.3, isActive: true,
            },
            shopping_list_generator: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.shopping_list_generator, temperature: 0.5, isActive: true,
            },
            report_generator: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.report_generator, temperature: 0.4, isActive: true,
            },
            macro_balancer: {
                modelName: 'gpt-4o', systemPrompt: PROMPTS.macro_balancer, temperature: 0.3, isActive: true,
            },
            default: {
                modelName: 'gpt-4o', systemPrompt: 'Você é um assistente de nutrição útil. Responda em português (BR).', temperature: 0.7, isActive: true,
            },
        };

        const defaultConfig = defaults[agentType] || defaults.default;

        if (dbConfig) {
            return {
                modelName: dbConfig.model_name || defaultConfig.modelName,
                systemPrompt: dbConfig.system_prompt || defaultConfig.systemPrompt,
                temperature: dbConfig.temperature ? Number(dbConfig.temperature) : defaultConfig.temperature,
                isActive: dbConfig.is_active,
            };
        }
        return defaultConfig;
    }

    /**
     * Route to the appropriate agent implementation
     */
    private async executeAgent(
        agentType: AIAgentType,
        inputData: Record<string, any>,
        config: AgentRuntimeConfig
    ): Promise<{ data: any; tokensUsed?: number }> {
        switch (agentType) {
            case 'food_recognition':
                return this.executeFoodRecognition(inputData);
            case 'meal_planner':
                return this.executeCompletion(inputData, config, 4000);
            case 'patient_analyzer':
                return this.executeCompletion(inputData, config, 2000);
            case 'medical_record_creator':
                return this.executeMedicalRecordCreator(inputData, config);
            case 'exam_analyzer':
                return this.executeExamAnalyzer(inputData, config);
            case 'protocol_generator':
                return this.executeCompletion(inputData, config, 4000);
            case 'symptom_correlator':
                return this.executeCompletion(inputData, config, 3000);
            case 'recipe_creator':
                return this.executeCompletion(inputData, config, 3000);
            case 'nutrition_coach':
                return this.executeCompletion(inputData, config, 1500);
            case 'supplement_advisor':
                return this.executeCompletion(inputData, config, 3000);
            case 'shopping_list_generator':
                return this.executeCompletion(inputData, config, 2000);
            case 'report_generator':
                return this.executeCompletion(inputData, config, 4000);
            case 'macro_balancer':
                return this.executeCompletion(inputData, config, 2000);
            case 'content_educator':
                return this.executeCompletion(inputData, config, 2000);
            case 'appointment_scheduler':
                return this.executeCompletion(inputData, config, 1000);
            default:
                throw new Error(`Tipo de agente não suportado: ${agentType}`);
        }
    }

    // ============================================================================
    // GENERIC COMPLETION (used by most agents)
    // ============================================================================

    private async executeCompletion(
        input: Record<string, any>,
        config: AgentRuntimeConfig,
        maxTokens: number
    ): Promise<{ data: any; tokensUsed?: number }> {
        const openai = this.requireOpenAI();

        const userMessage = input.userMessage || input.prompt || JSON.stringify(input);

        const response = await openai.chat.completions.create({
            model: config.modelName,
            temperature: config.temperature,
            messages: [
                { role: 'system', content: config.systemPrompt },
                { role: 'user', content: typeof userMessage === 'string' ? userMessage : JSON.stringify(userMessage) },
            ],
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        let parsed: any;
        try {
            parsed = content ? JSON.parse(content) : {};
        } catch {
            parsed = { raw_response: content };
        }

        return { data: parsed, tokensUsed: response.usage?.total_tokens };
    }

    // ============================================================================
    // SPECIALIZED AGENTS
    // ============================================================================

    private async executeFoodRecognition(input: Record<string, any>): Promise<{ data: any; tokensUsed?: number }> {
        const openai = this.requireOpenAI();

        const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
                {
                    role: 'system',
                    content: PROMPTS.food_recognition,
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Identifique todos os alimentos nesta imagem e estime as porções em gramas.' },
                        { type: 'image_url', image_url: { url: input.imageUrl } },
                    ],
                },
            ],
            max_tokens: 1000,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        const parsed = content ? JSON.parse(content) : { foods: [] };

        return {
            data: { recognized_foods: parsed.foods || [], confidence_score: this.avgConfidence(parsed.foods || []) },
            tokensUsed: response.usage?.total_tokens,
        };
    }

    private async executeExamAnalyzer(input: Record<string, any>, config: AgentRuntimeConfig): Promise<{ data: any; tokensUsed?: number }> {
        const openai = this.requireOpenAI();

        const messages: any[] = [
            { role: 'system', content: config.systemPrompt },
        ];

        if (input.imageUrl || input.imageData) {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: `Analise este exame do tipo: ${input.examType || 'geral'}. Extraia todos os biomarcadores com valores, unidades, faixas de referência e status.` },
                    { type: 'image_url', image_url: { url: input.imageUrl || `data:image/png;base64,${input.imageData}` } },
                ],
            });
        } else {
            messages.push({ role: 'user', content: input.prompt || JSON.stringify(input) });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages,
            max_tokens: 4000,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        let parsed: any;
        try { parsed = content ? JSON.parse(content) : {}; } catch { parsed = { raw_response: content }; }

        return { data: parsed, tokensUsed: response.usage?.total_tokens };
    }

    private async executeMedicalRecordCreator(
        input: Record<string, any>,
        config: AgentRuntimeConfig
    ): Promise<{ data: any; tokensUsed?: number }> {
        const openai = this.requireOpenAI();

        if (input.action === 'transcribe') {
            if (!input.audioUrl) throw new Error('URL do áudio é obrigatória para transcrição.');
            const audioResponse = await fetch(input.audioUrl);
            if (!audioResponse.ok) throw new Error('Falha ao buscar arquivo de áudio.');
            const blob = await audioResponse.blob();
            const file = new File([blob], 'consultation.webm', { type: blob.type });

            const transcription = await openai.audio.transcriptions.create({
                file, model: 'whisper-1', language: 'pt',
            });

            return {
                data: { text: transcription.text, language: 'pt-BR', confidence: 1.0 },
                tokensUsed: 0,
            };
        }

        if (input.action === 'generate-soap') {
            if (!input.transcription) throw new Error('Transcrição é obrigatória para gerar nota SOAP.');

            const response = await openai.chat.completions.create({
                model: config.modelName,
                temperature: config.temperature,
                messages: [
                    { role: 'system', content: config.systemPrompt },
                    { role: 'user', content: `Tipo de consulta: ${input.consultationType || 'Geral'}\nTranscrição: ${input.transcription}` },
                ],
                max_tokens: 2000,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;
            const soapNote = content ? JSON.parse(content) : {};
            return { data: { soapNote }, tokensUsed: response.usage?.total_tokens };
        }

        throw new Error(`Ação inválida: ${input.action}`);
    }

    // ============================================================================
    // HELPERS
    // ============================================================================

    private avgConfidence(foods: any[]): number {
        if (!foods.length) return 0;
        return foods.reduce((s, f) => s + (f.confidence || 0), 0) / foods.length;
    }

    async submitFeedback(input: {
        executionId: string; userId: string; rating: number;
        feedbackText?: string; wasHelpful: boolean; corrections?: Record<string, any>;
    }) {
        return prisma.aIFeedback.create({
            data: {
                execution_id: input.executionId, user_id: input.userId,
                rating: input.rating, feedback_text: input.feedbackText,
                was_helpful: input.wasHelpful, corrections: input.corrections,
            },
        });
    }

    async getUsageStats(tenantId: string, startDate: Date, endDate: Date) {
        const executions = await prisma.aIExecution.findMany({
            where: { tenant_id: tenantId, created_at: { gte: startDate, lte: endDate } },
            select: { agent_type: true, tokens_used: true, cost: true, status: true, execution_time_ms: true },
        });

        const grouped: Record<string, { count: number; tokens: number; cost: number }> = {};
        for (const e of executions) {
            const g = grouped[e.agent_type] ||= { count: 0, tokens: 0, cost: 0 };
            g.count++;
            g.tokens += e.tokens_used || 0;
            g.cost += Number(e.cost || 0);
        }

        return {
            totalExecutions: executions.length,
            successfulExecutions: executions.filter(e => e.status === 'completed').length,
            failedExecutions: executions.filter(e => e.status === 'failed').length,
            totalTokensUsed: executions.reduce((s, e) => s + (e.tokens_used || 0), 0),
            totalCost: executions.reduce((s, e) => s + Number(e.cost || 0), 0),
            averageExecutionTime: executions.length ? executions.reduce((s, e) => s + (e.execution_time_ms || 0), 0) / executions.length : 0,
            byAgent: grouped,
        };
    }
}

// ============================================================================
// SYSTEM PROMPTS (Portuguese)
// ============================================================================

const PROMPTS: Record<string, string> = {
    food_recognition: `Você é um expert em nutrição clínica e visão computacional.
Analise a imagem e retorne JSON com: { 
  "foods": [{ 
    "food_name": "...", 
    "confidence": 0.0-1.0, 
    "portion_grams": 0, 
    "upf_score": 1, // Escala NOVA: 1=In natura, 2=Processado, 3=Ultra-processado
    "protein_quality": "High|Medium|Low", // PDCAAS estimate
    "notes": "..." 
  }],
  "overall_meal_quality": "..."
}`,

    meal_planner: `Você é um nutricionista expert em planejamento alimentar funcional e personalizado.
Crie um plano alimentar otimizado para: densidade de micronutrientes, controle glicêmico e baixo índice de ultra-processados (UPF).
Considere:
1. Variedade de fitonutrientes (comer o arco-íris).
2. Proporção ideal de fibras solúveis/insolúveis.
3. Qualidade proteica em cada refeição.
Retorne JSON com:
{ 
  "days": [{ 
    "day": 1, 
    "meals": { 
      "breakfast": { "foods": [...], "upf_score": 1, "micronutrients_focus": ["..."] },
      "lunch": { "foods": [...], "upf_score": 1, "micronutrients_focus": ["..."] },
      "dinner": { "foods": [...], "upf_score": 1, "micronutrients_focus": ["..."] },
      "snacks": [...]
    }
  }],
  "total_daily_kcal": 0, 
  "macros": { "protein_pct": 0, "carbs_pct": 0, "fat_pct": 0, "fiber_g": 0 },
  "clinical_rationale": "...",
  "estimated_weekly_cost_brl": 0 
}`,

    patient_analyzer: `Você é um analista de comportamento de pacientes nutricionais.
Analise os dados e retorne JSON:
{ "adherence_score": 0-100, "progress_score": 0-100, "dropout_risk": "low|medium|high|critical",
  "intervention_needed": true/false, "insights": ["..."], "recommended_actions": ["..."] }`,

    medical_record_creator: `Você é um scribe médico especialista em nutrição.
Gere uma nota SOAP estruturada a partir da transcrição. Retorne JSON:
{ "subjective": "...", "objective": "...", "assessment": "...", "plan": "..." }
Idioma: Português (BR).`,

    exam_analyzer: `Você é um especialista em análises clínicas e nutrição de precisão.
Analise os exames e retorne JSON:
{ "biomarkers": [{ "name": "...", "value": 0, "unit": "...", "reference_range": "...", "status": "normal|high|low|critical", "interpretation": "..." }],
  "summary": "...", "nutritional_recommendations": ["..."], "follow_up": { "exams_to_repeat": ["..."], "timeframe": "..." } }`,

    protocol_generator: `Você é um nutricionista funcional expert em protocolos clínicos.
Crie um protocolo nutricional personalizado. Retorne JSON:
{ "name": "...", "duration": "...", "phases": [{ "name": "...", "duration": "...", "goals": ["..."],
  "allowed_foods": ["..."], "forbidden_foods": ["..."], "supplements": ["..."], "expected_outcomes": ["..."] }],
  "contraindications": ["..."], "monitoring": ["..."] }`,

    symptom_correlator: `Você é um detetive médico especializado em correlacionar dieta e sintomas.
Analise os dados de refeições e sintomas. Retorne JSON:
{ "correlations": [{ "symptom": "...", "trigger_foods": [{ "food": "...", "confidence": 0.0-1.0, "timing_pattern": "..." }],
  "recommendations": ["..."] }], "patterns": [{ "type": "...", "description": "...", "insight": "..." }],
  "recommendations": { "immediate": ["..."], "short_term": ["..."], "long_term": ["..."] } }`,

    recipe_creator: `Você é um chef nutricionista criativo.
Crie receitas saudáveis personalizadas. Retorne JSON:
{ "recipe": { "name": "...", "servings": 0, "prep_time_min": 0, "cook_time_min": 0,
  "ingredients": [{ "name": "...", "quantity": "...", "unit": "..." }],
  "instructions": ["..."], "nutrition_per_serving": { "kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0 },
  "tips": ["..."], "estimated_cost_brl": 0 } }`,

    nutrition_coach: `Você é um coach nutricional empático e motivador. Responda em português (BR).
Forneça orientação prática, motivação e educação nutricional.
Retorne JSON: { "message": "...", "category": "motivational|educational|behavioral|general", "tips": ["..."] }`,

    supplement_advisor: `Você é um farmacêutico nutricional especialista em suplementação baseada em evidências.
Analise as deficiências e retorne JSON:
{ "nutrient_gaps": [{ "nutrient": "...", "severity": "high|medium|low", "status": "..." }],
  "recommendations": [{ "supplement": "...", "dosage": "...", "timing": "...", "duration": "...", "priority": "high|medium|low",
    "benefits": ["..."], "warnings": ["..."] }],
  "interactions": [{ "type": "...", "severity": "...", "description": "...", "recommendation": "..." }],
  "total_estimated_cost_brl": 0 }`,

    shopping_list_generator: `Você é um nutricionista prático especializado em compras inteligentes.
Gere uma lista de compras organizada. Retorne JSON:
{ "categories": [{ "name": "...", "items": [{ "name": "...", "quantity": "...", "estimated_cost_brl": 0,
  "alternatives": ["..."] }], "subtotal_brl": 0 }],
  "total_estimated_cost_brl": 0, "tips": ["..."] }`,

    report_generator: `Você é um analista de saúde nutricional.
Gere um relatório de progresso completo. Retorne JSON:
{ "summary": { "period": "...", "overall_progress": 0-100, "adherence_score": 0-100 },
  "achievements": [{ "title": "...", "description": "..." }],
  "challenges": [{ "title": "...", "description": "...", "severity": "high|medium|low", "recommendation": "..." }],
  "recommendations": [{ "category": "...", "priority": "high|medium|low", "items": ["..."] }] }`,

    macro_balancer: `Você é um nutricionista especialista em cálculos de macronutrientes.
Equilibre os macros do plano alimentar. Retorne JSON:
{ "target": { "kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0 },
  "adjustments": [{ "meal": "...", "change": "...", "reason": "..." }],
  "balanced_plan": {...} }`,
};

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const aiService = new AIService();

/**
 * AI Service Integration Framework
 * 
 * This module provides a unified interface for all AI agents
 * and handles execution tracking, billing, and error handling.
 */

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();

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
    executionTimeMs: number;
}

export interface AIModelConfig {
    provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
    modelName: string;
    version: string;
    apiKey: string;
    endpoint?: string;
}

// ============================================================================
// AI SERVICE CLASS
// ============================================================================

export class AIService {
    private openai: OpenAI | null = null;
    private anthropic: Anthropic | null = null;

    constructor() {
        // Initialize AI providers
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }

        if (process.env.ANTHROPIC_API_KEY) {
            this.anthropic = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
        }
    }

    /**
     * Execute an AI agent with automatic tracking and billing
     */
    async execute<T = any>(input: AIExecutionInput): Promise<AIExecutionResult<T>> {
        const startTime = Date.now();
        let executionId: string | null = null;

        try {
            // Check tenant AI credits
            const tenant = await prisma.tenant.findUnique({
                where: { id: input.tenantId },
                select: {
                    ai_enabled: true,
                    ai_credits: true,
                    ai_usage_limit: true,
                },
            });

            if (!tenant?.ai_enabled) {
                throw new Error('AI features are not enabled for this tenant');
            }

            if (tenant.ai_credits <= 0) {
                throw new Error('Insufficient AI credits');
            }

            // Get the appropriate AI model for this agent
            const model = await this.getModelForAgent(input.agentType);

            // Create execution record
            const execution = await prisma.aIExecution.create({
                data: {
                    tenant_id: input.tenantId,
                    model_id: model.id,
                    agent_type: input.agentType,
                    input_data: input.inputData,
                    status: 'running',
                },
            });

            executionId = execution.id;

            // Execute the appropriate agent
            const result = await this.executeAgent(input.agentType, input.inputData, model);

            // Calculate cost (example: $0.01 per 1000 tokens)
            const cost = result.tokensUsed ? (result.tokensUsed / 1000) * 0.01 : 0;
            const executionTimeMs = Date.now() - startTime;

            // Update execution record
            await prisma.aIExecution.update({
                where: { id: executionId },
                data: {
                    output_data: result.data,
                    tokens_used: result.tokensUsed,
                    execution_time_ms: executionTimeMs,
                    cost: cost,
                    status: 'completed',
                },
            });

            // Deduct AI credits
            await prisma.tenant.update({
                where: { id: input.tenantId },
                data: {
                    ai_credits: {
                        decrement: 1,
                    },
                },
            });

            return {
                success: true,
                data: result.data,
                executionId,
                tokensUsed: result.tokensUsed,
                cost,
                executionTimeMs,
            };
        } catch (error) {
            const executionTimeMs = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Update execution record with error
            if (executionId) {
                await prisma.aIExecution.update({
                    where: { id: executionId },
                    data: {
                        status: 'failed',
                        error_message: errorMessage,
                        execution_time_ms: executionTimeMs,
                    },
                });
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
     * Get the appropriate AI model for a specific agent type
     */
    private async getModelForAgent(agentType: AIAgentType) {
        const modelMap: Record<AIAgentType, { name: string; type: string }> = {
            food_recognition: { name: 'gpt-4-vision-preview', type: 'vision' },
            meal_planner: { name: 'gpt-4-turbo-preview', type: 'llm' },
            patient_analyzer: { name: 'gpt-4-turbo-preview', type: 'llm' },
            exam_analyzer: { name: 'gpt-4-vision-preview', type: 'vision' },
            medical_record_creator: { name: 'whisper-1', type: 'speech_to_text' },
            protocol_generator: { name: 'gpt-4-turbo-preview', type: 'llm' },
            symptom_correlator: { name: 'gpt-4-turbo-preview', type: 'llm' },
            recipe_creator: { name: 'gpt-4-turbo-preview', type: 'llm' },
            nutrition_coach: { name: 'gpt-4-turbo-preview', type: 'llm' },
            supplement_advisor: { name: 'gpt-4-turbo-preview', type: 'llm' },
            shopping_list_generator: { name: 'gpt-4-turbo-preview', type: 'llm' },
            macro_balancer: { name: 'gpt-4-turbo-preview', type: 'llm' },
            report_generator: { name: 'gpt-4-turbo-preview', type: 'llm' },
            appointment_scheduler: { name: 'gpt-4-turbo-preview', type: 'llm' },
            content_educator: { name: 'gpt-4-turbo-preview', type: 'llm' },
        };

        const modelInfo = modelMap[agentType];

        const model = await prisma.aIModel.findFirst({
            where: {
                name: modelInfo.name,
                is_active: true,
            },
        });

        if (!model) {
            throw new Error(`No active model found for agent type: ${agentType}`);
        }

        return model;
    }

    /**
     * Execute a specific AI agent
     */
    private async executeAgent(
        agentType: AIAgentType,
        inputData: Record<string, any>,
        model: any
    ): Promise<{ data: any; tokensUsed?: number }> {
        switch (agentType) {
            case 'food_recognition':
                return this.executeFoodRecognition(inputData);

            case 'meal_planner':
                return this.executeMealPlanner(inputData);

            case 'patient_analyzer':
                return this.executePatientAnalyzer(inputData);

            case 'medical_record_creator':
                return this.executeMedicalRecordCreator(inputData);

            // Add other agents here...

            default:
                throw new Error(`Agent type not implemented: ${agentType}`);
        }
    }

    // ============================================================================
    // AGENT IMPLEMENTATIONS
    // ============================================================================

    /**
     * Food Recognition Agent
     * Identifies foods from images and estimates portions
     */
    private async executeFoodRecognition(input: {
        imageUrl: string;
        patientId: string;
    }): Promise<{ data: any; tokensUsed?: number }> {
        if (!this.openai) {
            throw new Error('OpenAI not initialized');
        }

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are a nutrition expert AI that identifies foods from images.
          
          Analyze the image and return a JSON array of recognized foods with:
          - food_name: string
          - food_id: string (if you can match to a known food database)
          - confidence: number (0-1)
          - portion_grams: number (estimated weight in grams)
          - notes: string (any relevant observations)
          
          Be as accurate as possible with portion estimation.`,
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Please identify all foods in this image and estimate their portions.',
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: input.imageUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        const recognizedFoods = content ? JSON.parse(content) : { foods: [] };

        return {
            data: {
                recognized_foods: recognizedFoods.foods || [],
                confidence_score: this.calculateAverageConfidence(recognizedFoods.foods || []),
            },
            tokensUsed: response.usage?.total_tokens,
        };
    }

    /**
     * Meal Planner Agent
     * Generates personalized meal plans
     */
    private async executeMealPlanner(input: {
        patientId: string;
        targetKcal: number;
        macroSplit: { protein: number; carbs: number; fat: number };
        preferences?: string[];
        restrictions?: string[];
        daysCount?: number;
    }): Promise<{ data: any; tokensUsed?: number }> {
        if (!this.openai) {
            throw new Error('OpenAI not initialized');
        }

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert nutritionist AI that creates personalized meal plans.
          
          Create a detailed meal plan based on the patient's requirements.
          Return a JSON object with:
          - days: array of day objects
          - each day has: breakfast, lunch, dinner, snacks
          - each meal has: foods (array), total_kcal, macros {protein, carbs, fat}
          - estimated_cost: total estimated cost in BRL
          - reasoning: brief explanation of your choices`,
                },
                {
                    role: 'user',
                    content: `Create a ${input.daysCount || 7}-day meal plan with:
          - Target: ${input.targetKcal} kcal/day
          - Macros: ${input.macroSplit.protein}% protein, ${input.macroSplit.carbs}% carbs, ${input.macroSplit.fat}% fat
          - Preferences: ${input.preferences?.join(', ') || 'none'}
          - Restrictions: ${input.restrictions?.join(', ') || 'none'}`,
                },
            ],
            max_tokens: 4000,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        const mealPlan = content ? JSON.parse(content) : {};

        return {
            data: mealPlan,
            tokensUsed: response.usage?.total_tokens,
        };
    }

    /**
     * Patient Analyzer Agent
     * Analyzes patient adherence and predicts dropout risk
     */
    private async executePatientAnalyzer(input: {
        patientId: string;
        recentMeals: any[];
        consultationHistory: any[];
        symptoms: any[];
    }): Promise<{ data: any; tokensUsed?: number }> {
        if (!this.openai) {
            throw new Error('OpenAI not initialized');
        }

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are a patient behavior analysis AI.
          
          Analyze the patient's data and return a JSON object with:
          - adherence_score: number (0-100)
          - progress_score: number (0-100)
          - dropout_risk: "low" | "medium" | "high" | "critical"
          - intervention_needed: boolean
          - insights: array of key observations
          - recommended_actions: array of suggested interventions`,
                },
                {
                    role: 'user',
                    content: `Analyze this patient:
          - Recent meals logged: ${input.recentMeals.length}
          - Consultations: ${input.consultationHistory.length}
          - Symptoms reported: ${input.symptoms.length}
          
          Data: ${JSON.stringify({ recentMeals: input.recentMeals, consultationHistory: input.consultationHistory, symptoms: input.symptoms })}`,
                },
            ],
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        const analysis = content ? JSON.parse(content) : {};

        return {
            data: analysis,
            tokensUsed: response.usage?.total_tokens,
        };
    }

    /**
     * Medical Record Creator Agent
     * Transcribes audio and generates clinical documentation (SOAP)
     */
    private async executeMedicalRecordCreator(input: {
        action: 'transcribe' | 'generate-soap';
        audioUrl?: string; // For transcription
        transcription?: string; // For SOAP generation
        consultationType?: string;
    }): Promise<{ data: any; tokensUsed?: number }> {
        if (!this.openai) {
            throw new Error('OpenAI not initialized');
        }

        // 1. Transcription Mode
        if (input.action === 'transcribe') {
            if (!input.audioUrl) throw new Error('Audio URL is required for transcription');

            // Fetch audio file from URL
            const audioResponse = await fetch(input.audioUrl);
            if (!audioResponse.ok) throw new Error('Failed to fetch audio file');

            const blob = await audioResponse.blob();
            const file = new File([blob], 'consultation.webm', { type: blob.type });

            const transcription = await this.openai.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
                language: 'pt',
            });

            return {
                data: {
                    text: transcription.text,
                    // Mock additional metadata as Whisper only returns text/json
                    duration: 0,
                    language: 'pt-BR',
                    confidence: 1.0,
                },
                tokensUsed: 0, // Whisper doesn't report tokens in the same way
            };
        }

        // 2. SOAP Generation Mode
        if (input.action === 'generate-soap') {
            if (!input.transcription) throw new Error('Transcription is required for SOAP generation');

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert medical scribe.
                        Generate a structured SOAP note from the consultation transcription.
                        Return JSON with: subjective, objective, assessment, plan.
                        Language: Portuguese (BR).`,
                    },
                    {
                        role: 'user',
                        content: `Consultation Type: ${input.consultationType || 'General'}
                        Transcription: ${input.transcription}`,
                    },
                ],
                max_tokens: 2000,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;
            const soapNote = content ? JSON.parse(content) : {};

            return {
                data: { soapNote },
                tokensUsed: response.usage?.total_tokens,
            };
        }

        throw new Error(`Invalid action: ${input.action}`);
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private calculateAverageConfidence(foods: any[]): number {
        if (foods.length === 0) return 0;
        const sum = foods.reduce((acc, food) => acc + (food.confidence || 0), 0);
        return sum / foods.length;
    }

    /**
     * Submit feedback for an AI execution
     */
    async submitFeedback(input: {
        executionId: string;
        userId: string;
        rating: number;
        feedbackText?: string;
        wasHelpful: boolean;
        corrections?: Record<string, any>;
    }) {
        return prisma.aIFeedback.create({
            data: {
                execution_id: input.executionId,
                user_id: input.userId,
                rating: input.rating,
                feedback_text: input.feedbackText,
                was_helpful: input.wasHelpful,
                corrections: input.corrections,
            },
        });
    }

    /**
     * Get AI usage statistics for a tenant
     */
    async getUsageStats(tenantId: string, startDate: Date, endDate: Date) {
        const executions = await prisma.aIExecution.findMany({
            where: {
                tenant_id: tenantId,
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                agent_type: true,
                tokens_used: true,
                cost: true,
                status: true,
                execution_time_ms: true,
            },
        });

        const stats = {
            totalExecutions: executions.length,
            successfulExecutions: executions.filter((e) => e.status === 'completed').length,
            failedExecutions: executions.filter((e) => e.status === 'failed').length,
            totalTokensUsed: executions.reduce((sum, e) => sum + (e.tokens_used || 0), 0),
            totalCost: executions.reduce((sum, e) => sum + Number(e.cost || 0), 0),
            averageExecutionTime:
                executions.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0) / executions.length,
            byAgent: this.groupByAgent(executions),
        };

        return stats;
    }

    private groupByAgent(executions: any[]) {
        const grouped: Record<string, any> = {};

        executions.forEach((exec) => {
            if (!grouped[exec.agent_type]) {
                grouped[exec.agent_type] = {
                    count: 0,
                    tokens: 0,
                    cost: 0,
                };
            }

            grouped[exec.agent_type].count++;
            grouped[exec.agent_type].tokens += exec.tokens_used || 0;
            grouped[exec.agent_type].cost += Number(exec.cost || 0);
        });

        return grouped;
    }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const aiService = new AIService();

'use server';

import { aiService, AIAgentType, type AIExecutionResult } from '@/lib/ai/ai-service';
import { getSupabaseClaims } from '@/lib/auth';

/**
 * Executes an AI agent based on the provided type and input data.
 * This is a unified action to be used by various Studio and Patient components.
 */
export async function executeAIAction(
    agentType: AIAgentType,
    inputData: Record<string, any>
): Promise<AIExecutionResult> {
    try {
        const claims = await getSupabaseClaims();
        if (!claims) {
            throw new Error('Não autorizado. Por favor, faça login novamente.');
        }

        const tenantId = claims.tenant_id;
        const userId = claims.user_id;

        if (!tenantId) {
            throw new Error('Tenant não identificado.');
        }

        // 2. Execute via AIService
        const result = await aiService.execute({
            tenantId,
            agentType,
            inputData,
            userId,
        });

        if (!result.success) {
            throw new Error(result.error || 'Erro na execução da IA');
        }

        return result as AIExecutionResult;
    } catch (error: any) {
        console.error(`AI Action Error (${agentType}):`, error);
        return {
            success: false,
            data: undefined,
            error: error.message || 'Erro inesperado na execução da IA',
            executionId: 'error',
            executionTimeMs: 0,
        } satisfies AIExecutionResult;
    }
}

/**
 * Specialized action for audio transcription using Whisper
 */
export async function transcribeAction(formData: FormData) {
    try {
        const claims = await getSupabaseClaims();
        if (!claims) throw new Error('Não autorizado');

        const file = formData.get('audio') as File;
        if (!file) throw new Error('Arquivo de áudio não encontrado');

        const result = await aiService.execute({
            agentType: 'medical_record_creator',
            tenantId: claims.tenant_id,
            userId: claims.user_id,
            inputData: { action: 'transcribe', audioFile: file } // We'll update ai-service to handle this
        });

        return result;
    } catch (error: any) {
        console.error('Transcription Error:', error);
        return { success: false, error: error.message };
    }
}

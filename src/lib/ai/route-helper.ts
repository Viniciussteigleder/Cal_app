/**
 * Shared helper for AI API routes.
 * Handles auth, builds aiService input, and formats response.
 */

import { NextResponse } from 'next/server';
import { getRequestClaims } from '@/lib/claims';
import { aiService, type AIAgentType } from '@/lib/ai/ai-service';

/** Map known AI error messages to proper HTTP status codes */
function getErrorStatus(errorMessage: string): number {
    if (errorMessage.includes('Créditos insuficientes')) return 402;
    if (errorMessage.includes('Limite mensal')) return 429;
    if (errorMessage.includes('não estão habilitados')) return 403;
    if (errorMessage.includes('desabilitado pelo administrador')) return 403;
    if (errorMessage.includes('Nenhum provedor de IA configurado')) return 503;
    return 500;
}

export async function executeAIRoute(
    agentType: AIAgentType,
    inputData: Record<string, any>,
    options?: { allowUnauthenticated?: boolean }
) {
    const claims = await getRequestClaims();

    if (!claims && !options?.allowUnauthenticated) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!claims?.tenant_id) {
        return NextResponse.json({ error: 'Tenant não identificado' }, { status: 401 });
    }

    const tenantId = claims.tenant_id;
    const userId = claims.user_id;

    const result = await aiService.execute({
        tenantId,
        agentType,
        userId,
        inputData,
    });

    if (!result.success) {
        const status = getErrorStatus(result.error || '');
        return NextResponse.json(
            { error: result.error, executionId: result.executionId },
            { status }
        );
    }

    return NextResponse.json({
        success: true,
        data: result.data,
        executionId: result.executionId,
        creditsUsed: result.creditsUsed,
        tokensUsed: result.tokensUsed,
        timestamp: new Date().toISOString(),
    });
}

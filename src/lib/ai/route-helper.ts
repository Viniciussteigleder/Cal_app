/**
 * Shared helper for AI API routes.
 * Handles auth, builds aiService input, and formats response.
 */

import { NextResponse } from 'next/server';
import { getRequestClaims } from '@/lib/claims';
import { aiService, type AIAgentType } from '@/lib/ai/ai-service';

export async function executeAIRoute(
    agentType: AIAgentType,
    inputData: Record<string, any>,
    options?: { allowUnauthenticated?: boolean }
) {
    const claims = await getRequestClaims();

    if (!claims && !options?.allowUnauthenticated) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const tenantId = claims?.tenant_id || 'demo-tenant';
    const userId = claims?.user_id;

    const result = await aiService.execute({
        tenantId,
        agentType,
        userId,
        inputData,
    });

    if (!result.success) {
        return NextResponse.json(
            { error: result.error, executionId: result.executionId },
            { status: 500 }
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

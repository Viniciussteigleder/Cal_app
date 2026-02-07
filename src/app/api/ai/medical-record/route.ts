import { NextRequest, NextResponse } from 'next/server';
import { getRequestClaims } from '@/lib/claims';
import { aiService } from '@/lib/ai/ai-service';

export async function POST(request: NextRequest) {
    try {
        const claims = await getRequestClaims();
        if (!claims) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { action, audioUrl, transcription, consultationType, patientId } = body;

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        const result = await aiService.execute({
            tenantId: claims.tenant_id,
            agentType: 'medical_record_creator',
            userId: claims.user_id,
            inputData: {
                action,
                audioUrl,
                transcription,
                consultationType,
            },
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, executionId: result.executionId },
                { status: 500 }
            );
        }

        if (action === 'transcribe') {
            return NextResponse.json({
                success: true,
                transcription: result.data,
                creditsUsed: result.creditsUsed,
                executionId: result.executionId,
            });
        }

        if (action === 'generate-soap') {
            return NextResponse.json({
                success: true,
                soapNote: result.data?.soapNote || result.data,
                creditsUsed: result.creditsUsed,
                executionId: result.executionId,
            });
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            creditsUsed: result.creditsUsed,
            executionId: result.executionId,
        });
    } catch (error) {
        console.error('Error in medical record creator:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { patientId, goal, conditions, restrictions, duration } = body;

        if (!goal) {
            return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
        }

        // Safely handle conditions/restrictions - ensure arrays before .join()
        const safeConditions = Array.isArray(conditions) ? conditions : [];
        const safeRestrictions = Array.isArray(restrictions) ? restrictions : [];

        const prompt = [
            `Objetivo: ${goal}`,
            safeConditions.length ? `Condições clínicas: ${safeConditions.join(', ')}` : null,
            safeRestrictions.length ? `Restrições alimentares: ${safeRestrictions.join(', ')}` : null,
            duration ? `Duração desejada: ${duration}` : null,
        ].filter(Boolean).join('\n');

        return executeAIRoute('protocol_generator', {
            userMessage: prompt,
            patientId,
            goal,
            conditions: safeConditions,
            restrictions: safeRestrictions,
            duration,
        });
    } catch (error) {
        console.error('Protocol generator error:', error);
        return NextResponse.json(
            { error: 'Falha ao gerar protocolo' },
            { status: 500 }
        );
    }
}

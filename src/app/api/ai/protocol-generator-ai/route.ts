import { NextRequest } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { patientId, goal, conditions, restrictions, duration } = body;

    if (!goal) {
        return Response.json({ error: 'Goal is required' }, { status: 400 });
    }

    const prompt = [
        `Objetivo: ${goal}`,
        conditions?.length ? `Condições clínicas: ${conditions.join(', ')}` : null,
        restrictions?.length ? `Restrições alimentares: ${restrictions.join(', ')}` : null,
        duration ? `Duração desejada: ${duration}` : null,
    ].filter(Boolean).join('\n');

    return executeAIRoute('protocol_generator', {
        userMessage: prompt,
        patientId,
        goal,
        conditions: conditions || [],
        restrictions: restrictions || [],
        duration,
    });
}

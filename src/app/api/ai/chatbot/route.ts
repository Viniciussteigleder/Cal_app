import { NextRequest } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { message, history, patientId } = body;

    if (!message) {
        return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build context from conversation history
    const conversationContext = (history || [])
        .slice(-10)
        .map((h: any) => `${h.role === 'user' ? 'Paciente' : 'Nutricionista'}: ${h.content}`)
        .join('\n');

    const prompt = conversationContext
        ? `Histórico da conversa:\n${conversationContext}\n\nNova mensagem do paciente: ${message}`
        : message;

    return executeAIRoute('nutrition_coach', {
        userMessage: prompt,
        patientId,
    });
}

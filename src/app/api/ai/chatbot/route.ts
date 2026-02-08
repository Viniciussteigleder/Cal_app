import { NextRequest, NextResponse } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, history, patientId } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Cap message size to prevent abuse
        const MAX_MESSAGE_LENGTH = 5_000;
        const cappedMessage = message.slice(0, MAX_MESSAGE_LENGTH);

        // Safely handle history - validate array and items before accessing .role/.content
        const safeHistory = Array.isArray(history) ? history : [];
        const MAX_HISTORY_ITEMS = 10;
        const MAX_CONTENT_LENGTH = 2_000;
        const conversationContext = safeHistory
            .slice(-MAX_HISTORY_ITEMS)
            .filter((h: any) => h && typeof h.role === 'string' && typeof h.content === 'string')
            .map((h: any) => `${h.role === 'user' ? 'Paciente' : 'Nutricionista'}: ${String(h.content).slice(0, MAX_CONTENT_LENGTH)}`)
            .join('\n');

        const prompt = conversationContext
            ? `Histórico da conversa:\n${conversationContext}\n\nNova mensagem do paciente: ${cappedMessage}`
            : cappedMessage;

        return executeAIRoute('nutrition_coach', {
            userMessage: prompt,
            patientId,
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        return NextResponse.json(
            { error: 'Falha ao processar mensagem' },
            { status: 500 }
        );
    }
}

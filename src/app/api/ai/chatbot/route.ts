import { NextRequest, NextResponse } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, history, patientId } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Safely handle history - validate array and items before accessing .role/.content
        const safeHistory = Array.isArray(history) ? history : [];
        const conversationContext = safeHistory
            .slice(-10)
            .filter((h: any) => h && typeof h.role === 'string' && typeof h.content === 'string')
            .map((h: any) => `${h.role === 'user' ? 'Paciente' : 'Nutricionista'}: ${h.content}`)
            .join('\n');

        const prompt = conversationContext
            ? `Histórico da conversa:\n${conversationContext}\n\nNova mensagem do paciente: ${message}`
            : message;

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

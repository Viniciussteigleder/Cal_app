import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getSupabaseClaims } from '@/lib/auth';
import { aiService } from '@/lib/ai/ai-service';

import { prisma } from '@/lib/prisma';

export const maxDuration = 30; // 30 seconds max duration

export async function POST(req: Request) {
    try {
        const claims = await getSupabaseClaims();
        if (!claims) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];

        // Get config for nutrition coach
        const config = await aiService.getAgentConfig(claims.tenant_id, 'nutrition_coach');

        const result = streamText({
            model: openai(config.modelName || 'gpt-4-turbo'),
            messages,
            system: config.systemPrompt || "Você é um nutricionista clínico sênior atuando como 'Coach Nutricional'. Seja motivador, empático e informativo.",
            temperature: config.temperature || 0.7,
            onFinish: async ({ usage, text }) => {
                try {
                    const creditCost = 1; // Nutrition Coach cost
                    const totalTokens = usage?.totalTokens || 0;
                    const cost = (totalTokens / 1000) * 0.005; // Approx cost

                    await prisma.$transaction([
                        // Create execution record
                        prisma.aIExecution.create({
                            data: {
                                tenant_id: claims.tenant_id,
                                model_id: config.modelName || 'gpt-4-turbo',
                                agent_type: 'nutrition_coach',
                                input_data: { messages: messages.slice(-1) },
                                output_data: { text },
                                status: 'completed',
                                tokens_used: totalTokens,
                                cost,
                                execution_time_ms: 0, // Not easily trackable in stream callback
                            },
                        }),
                        // Deduct credits
                        prisma.tenant.update({
                            where: { id: claims.tenant_id },
                            data: { ai_credits: { decrement: creditCost } },
                        }),
                        // Log transaction
                        prisma.aiCreditTransaction.create({
                            data: {
                                tenant_id: claims.tenant_id,
                                nutritionist_id: claims.user_id,
                                agent_type: 'nutrition_coach',
                                credits_used: creditCost,
                                cost_usd: cost,
                                cost_brl: cost * 5.5,
                                metadata: { tokensUsed: totalTokens },
                            },
                        })
                    ]);
                } catch (error) {
                    console.error('Error logging AI usage:', error);
                }
            }
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error('Coach API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

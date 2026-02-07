/**
 * OpenAI Integration Helper
 * 
 * This file provides utilities for integrating with OpenAI APIs.
 * Replace mock implementations with real OpenAI calls.
 * 
 * Installation:
 * npm install openai
 * 
 * Environment Variables Required:
 * OPENAI_API_KEY=your_openai_api_key
 */

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

/**
 * Generate chat completion using GPT-4
 */
export async function generateChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }
) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY is not set. Returning mock response.');
            return {
                content: 'Mock AI response - OPENAI_API_KEY missing',
                usage: {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0,
                },
            };
        }

        const completion = await openai.chat.completions.create({
            model: options?.model || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: options?.temperature || 0.7,
            max_tokens: options?.maxTokens || 2000,
        });

        return {
            content: completion.choices[0].message.content,
            usage: completion.usage,
        };
    } catch (error) {
        console.error('Error in OpenAI chat completion:', error);
        throw error;
    }
}

/**
 * Transcribe audio using Whisper AI
 */
export async function transcribeAudio(audioFile: File) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY is not set. Returning mock transcription.');
            return { text: 'Mock transcription - OPENAI_API_KEY missing' };
        }

        // OpenAI SDK expects a specific format for file uploads in Node environment
        // standard File object might need conversion to ReadStream or similar if on Node server
        // But since we are likely using Next.js Server Actions, FormData File is usually compatible or we pass it directly
        // However, OpenAI SDK often prefers `fs.createReadStream` or a Blob with name.

        // Handling File from FormData (which is often a Blob with name)
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'pt', // Portuguese
        });

        return {
            text: transcription.text,
        };
    } catch (error) {
        console.error('Error in Whisper transcription:', error);
        throw error;
    }
}

/**
 * Analyze image using GPT-4 Vision
 */
export async function analyzeImage(
    imageData: string, // base64 or URL
    prompt: string,
    options?: {
        model?: string;
        maxTokens?: number;
    }
) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY is not set. Returning mock vision analysis.');
            return {
                content: 'Mock vision analysis - OPENAI_API_KEY missing',
                usage: {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0,
                },
            };
        }

        const response = await openai.chat.completions.create({
            model: options?.model || 'gpt-4o', // Using gpt-4o as it's better/faster for vision now
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageData,
                            },
                        },
                    ],
                },
            ],
            max_tokens: options?.maxTokens || 4000,
        });

        return {
            content: response.choices[0].message.content,
            usage: response.usage,
        };
    } catch (error) {
        console.error('Error in GPT-4 Vision analysis:', error);
        throw error;
    }
}

/**
 * Calculate AI credits cost based on token usage
 */
export function calculateCreditsCost(tokens: number): number {
    // Example pricing: 1 credit = 100 tokens
    // Adjust based on your pricing model
    return Math.ceil(tokens / 100);
}

/**
 * Generate embeddings for semantic search
 */
export async function generateEmbeddings(text: string) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY is not set. Returning mock embeddings.');
            return {
                embedding: new Array(1536).fill(0).map(() => Math.random()),
                usage: {
                    prompt_tokens: 0,
                    total_tokens: 0,
                },
            };
        }

        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });

        return {
            embedding: response.data[0].embedding,
            usage: response.usage,
        };
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw error;
    }
}

/**
 * Stream chat completion (for real-time responses)
 */
export async function streamChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    onChunk: (chunk: string) => void
) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY is not set. Returning mock streaming.');
            const mockResponse = 'Mock streaming response - OPENAI_API_KEY missing';
            for (const char of mockResponse) {
                await new Promise(resolve => setTimeout(resolve, 50));
                onChunk(char);
            }
            return;
        }

        const stream = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                onChunk(content);
            }
        }
    } catch (error) {
        console.error('Error in streaming chat:', error);
        throw error;
    }
}

/**
 * Prompt templates for different AI agents
 */
export const PROMPT_TEMPLATES = {
    mealPlanner: (patientData: any) => `
Você é um nutricionista especialista com 20 anos de experiência.

Paciente: ${patientData.name}
Condições: ${patientData.conditions?.join(', ') || 'Nenhuma'}
Alergias: ${patientData.allergies?.join(', ') || 'Nenhuma'}
Meta calórica: ${patientData.targetCalories} kcal
Distribuição de macros: ${patientData.macros?.protein}% proteína, ${patientData.macros?.carbs}% carboidratos, ${patientData.macros?.fat}% gordura

Crie um plano alimentar de ${patientData.days || 1} dia(s) que:
1. Respeite todas as restrições alimentares
2. Seja culturalmente apropriado para o Brasil
3. Use ingredientes facilmente encontrados
4. Seja variado e saboroso
5. Atinja as metas nutricionais

Para cada refeição, forneça:
- Nome do prato
- Ingredientes com quantidades exatas
- Modo de preparo simplificado
- Informações nutricionais completas
`,

    patientAnalyzer: (patientData: any) => `
Analise este paciente sob 4 perspectivas de especialistas:

Dados do Paciente:
${JSON.stringify(patientData, null, 2)}

Forneça análises de:
1. Médico Clínico (sinais vitais, riscos, comorbidades)
2. Nutricionista (padrões alimentares, deficiências, aderência)
3. Psicólogo (comportamento alimentar, motivação, barreiras)
4. Médico Funcional (saúde intestinal, inflamação, hormônios)

Para cada perspectiva, inclua:
- Observações principais
- Preocupações
- Recomendações específicas
`,

    supplementAdvisor: (patientData: any) => `
Analise as necessidades de suplementação deste paciente:

Dados: ${JSON.stringify(patientData, null, 2)}

Forneça:
1. Análise de gaps nutricionais
2. Suplementos recomendados com dosagens
3. Timing de consumo
4. Interações e contraindicações
5. Duração do protocolo
6. Monitoramento necessário
`,

    chatbot: (context: any, userMessage: string) => `
Você é um coach de nutrição empático e motivador.

Contexto do paciente: ${JSON.stringify(context, null, 2)}

Mensagem do usuário: ${userMessage}

Responda de forma:
- Empática e encorajadora
- Baseada em evidências
- Prática e acionável
- Culturalmente apropriada para o Brasil
`,
};

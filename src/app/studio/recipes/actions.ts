'use server';

import { prisma } from '@/lib/prisma';
import { generateChatCompletion } from '@/lib/openai';
import { recordAiUsage } from '@/lib/ai/usage';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { getAgentConfig } from '@/lib/ai-config';

export async function getRecipes() {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const recipes = await prisma.recipe.findMany({
        where: { tenant_id: claims.tenant_id },
        orderBy: { created_at: 'desc' },
        take: 50
    });

    return { success: true, data: recipes };
}

export async function createRecipe(data: any) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const recipe = await prisma.recipe.create({
            data: {
                ...data, // name, instructions, etc.
                tenant_id: claims.tenant_id,
                created_by: claims.user_id,
                is_calculated: false // simplified
            }
        });
        revalidatePath('/studio/recipes');
        return { success: true, data: recipe };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed to create recipe' };
    }
}

const RecipeSchema = z.object({
    name: z.string(),
    description: z.string(),
    instructions: z.string(),
    ingredients_list: z.array(z.string()).describe("List of ingredients with quantities"),
    prep_time_min: z.number(),
    cook_time_min: z.number(),
    servings: z.number(),
    nutrition_preview: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
    }),
});

export async function generateAiRecipe(userRequest: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // 1. Config
        const config = await getAgentConfig('recipe_creator');

        // 2. OpenAI
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });

        // 3. Generate
        const { object, usage } = await generateObject({
            model: openai(config.model),
            schema: RecipeSchema,
            temperature: config.temperature,
            system: config.systemPrompt || "Você é um chef nutricionista criativo.",
            messages: [{
                role: 'user',
                content: `Crie uma receita para: "${userRequest}". 
                Inclua lista de ingredientes, passo a passo e tabela nutricional.`
            }]
        });

        // 4. Save
        const recipe = await prisma.recipe.create({
            data: {
                tenant_id: claims.tenant_id,
                created_by: claims.user_id,
                name: object.name,
                description: object.description,
                instructions: object.instructions,
                // Convert array back to text for simple storage, or store as JSON if schema supported it. 
                // Current schema has `ingredients_text` string.
                ingredients_text: object.ingredients_list.join('\n'),
                prep_time_min: object.prep_time_min,
                cook_time_min: object.cook_time_min,
                servings: object.servings,
                nutrition_preview: object.nutrition_preview,
                is_calculated: false
            }
        });

        // 5. Billing
        await recordAiUsage({
            tenantId: claims.tenant_id,
            nutritionistId: claims.user_id,
            agentType: 'recipe_creator',
            creditsUsed: 1,
            costUsd: (usage.totalTokens || 0) * (5 / 1000000),
            costBrl: (usage.totalTokens || 0) * (5 / 1000000) * 5.5,
            metadata: { request: userRequest }
        });

        revalidatePath('/studio/recipes');
        return { success: true, data: recipe };

    } catch (error) {
        console.error("AI Recipe Error:", error);
        return { success: false, error: "Falha ao gerar receita com IA" };
    }
}

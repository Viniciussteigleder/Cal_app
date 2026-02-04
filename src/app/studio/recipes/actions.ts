'use server';

import { prisma } from '@/lib/prisma';
import { generateChatCompletion } from '@/lib/openai';
import { recordAiUsage } from '@/lib/ai/usage';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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

export async function generateAiRecipe(userRequest: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const systemPrompt = "Você é um chef nutricionista. Crie receitas saudáveis e práticas. Responda APENAS com JSON válido.";
    const userPrompt = `
        Crie uma receita baseada neste pedido: "${userRequest}"
        
        Sua resposta deve ser um OBJETO JSON com este formato:
        {
            "name": "Nome do Prato",
            "description": "Breve descrição atraente",
            "instructions": "Passo 1... Passo 2...",
            "ingredients_text": "- 2 ovos\n- 1 xícara de aveia...",
            "prep_time_min": 10,
            "cook_time_min": 20,
            "servings": 2,
            "nutrition_preview": {
                "calories": 350,
                "protein": 20,
                "carbs": 40,
                "fat": 15
            }
        }
    `;

    try {
        const { content } = await generateChatCompletion(systemPrompt, userPrompt);

        // Parse JSON safely
        // Sometimes GPT wraps in markdown code blocks, strip them.
        const cleanJson = content?.replace(/```json/g, '').replace(/```/g, '').trim();
        const recipeData = JSON.parse(cleanJson || '{}');

        // Verify minimal fields
        if (!recipeData.name || !recipeData.instructions) {
            return { success: false, error: "AI output invalid" };
        }

        // Save to DB
        const recipe = await prisma.recipe.create({
            data: {
                tenant_id: claims.tenant_id,
                created_by: claims.user_id,
                name: recipeData.name,
                description: recipeData.description,
                instructions: recipeData.instructions,
                ingredients_text: recipeData.ingredients_text,
                prep_time_min: recipeData.prep_time_min,
                cook_time_min: recipeData.cook_time_min,
                servings: recipeData.servings || 1,
                nutrition_preview: recipeData.nutrition_preview || {},
                is_calculated: false
            }
        });

        // Record Usage
        await recordAiUsage({
            tenantId: claims.tenant_id,
            nutritionistId: claims.user_id,
            agentType: 'recipe_generator',
            creditsUsed: 1,
            costUsd: 0.04,
            costBrl: 0.20
        });

        revalidatePath('/studio/recipes');
        return { success: true, data: recipe };

    } catch (error) {
        console.error("AI Recipe Error:", error);
        return { success: false, error: "Failed to generate recipe" };
    }
}

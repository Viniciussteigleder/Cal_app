'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { executeAIAction } from '@/app/studio/ai/actions';

export async function generateShoppingListAction(patientId: string, mealPlanId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // Fetch Plan and Items
        const plan = await prisma.plan.findUnique({
            where: { id: mealPlanId },
        });

        // Wait, Plan has patient_id.
        if (!plan) throw new Error('Plano alimentar não encontrado');

        // Get latest active/approved version
        const version = await prisma.planVersion.findFirst({
            where: { plan_id: mealPlanId, status: 'published' }, // or approved
            orderBy: { created_at: 'desc' }
        });

        if (!version) throw new Error('Versão do plano não encontrada');

        const items = await prisma.planItem.findMany({
            where: { plan_version_id: version.id },
        });

        // Fetch snapshots or foods
        const foodIds = items.map(i => i.food_id);
        const foods = await prisma.foodCanonical.findMany({
            where: { id: { in: foodIds } }
        });

        const foodMap = new Map(foods.map(f => [f.id, f.name]));

        const itemList = items.map(i => ({
            food: foodMap.get(i.food_id) || 'Alimento desconhecido',
            grams: Number(i.grams),
            meal: i.meal_type
        }));

        const context = `
            Gere uma lista de compras para o seguinte plano alimentar:
            Items: ${JSON.stringify(itemList)}
            
            Organize por categorias (Hortifruti, Carnes, etc.).
            Estime custos em BRL.
            Sugira alternativas se apropriado.
        `;

        const result = await executeAIAction('shopping_list_generator', {
            prompt: context
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: (result as any).data };

    } catch (error: any) {
        console.error("Shopping List Gen Error:", error);
        return { success: false, error: error.message || 'Falha ao gerar lista de compras.' };
    }
}

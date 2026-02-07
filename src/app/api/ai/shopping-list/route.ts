import { NextRequest } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { mealPlanId, patientId } = body;

    if (!mealPlanId && !patientId) {
        return Response.json(
            { error: 'Meal plan ID or patient ID is required' },
            { status: 400 }
        );
    }

    // Try to fetch plan template context from DB
    let planContext = '';
    if (mealPlanId) {
        const template = await prisma.planTemplate.findUnique({
            where: { id: mealPlanId },
            select: { name: true, target_kcal: true, macro_split: true, goal: true, description: true },
        });
        if (template) {
            planContext = [
                `Plano: "${template.name}"`,
                template.target_kcal ? `Calorias alvo: ${template.target_kcal} kcal` : null,
                template.goal ? `Objetivo: ${template.goal}` : null,
                template.macro_split ? `Macros: ${JSON.stringify(template.macro_split)}` : null,
                template.description || null,
            ].filter(Boolean).join('\n');
        }
    }

    const prompt = planContext
        ? `Gere uma lista de compras semanal baseada neste plano alimentar:\n${planContext}`
        : `Gere uma lista de compras semanal saudável e balanceada para um paciente. Inclua categorias organizadas com estimativas de custo em BRL.`;

    return executeAIRoute('shopping_list_generator', {
        userMessage: prompt,
        mealPlanId,
        patientId,
    });
}

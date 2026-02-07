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

    // Try to fetch the actual meal plan from DB
    let mealPlanContext = '';
    if (mealPlanId) {
        const mealPlan = await prisma.mealPlan.findUnique({
            where: { id: mealPlanId },
            select: { plan_data: true, target_calories: true, name: true },
        });
        if (mealPlan) {
            mealPlanContext = `Plano alimentar "${mealPlan.name}" (${mealPlan.target_calories} kcal):\n${JSON.stringify(mealPlan.plan_data)}`;
        }
    }

    const prompt = mealPlanContext
        ? `Gere uma lista de compras semanal baseada neste plano alimentar:\n${mealPlanContext}`
        : `Gere uma lista de compras semanal saudável e balanceada para um paciente. Inclua categorias organizadas com estimativas de custo em BRL.`;

    return executeAIRoute('shopping_list_generator', {
        userMessage: prompt,
        mealPlanId,
        patientId,
    });
}

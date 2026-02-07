'use server';

import { executeAIAction } from '@/app/studio/ai/actions';

export async function generateMealPlanAction(inputData: any) {
    try {
        const result = await executeAIAction('meal_planner', {
            ...inputData
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: (result as any).data };
    } catch (error: any) {
        console.error("Meal Planner Error:", error);
        return { success: false, error: error.message || 'Failed to generate meal plan.' };
    }
}

'use server';

import { executeAIAction } from '@/app/studio/ai/actions';

export async function recognizeFoodAction(imageUrl: string) {
    try {
        const result = await executeAIAction('food_recognition', {
            imageUrl
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: (result as any).data };
    } catch (error: any) {
        console.error("Food Recognition Error:", error);
        return { success: false, error: error.message || 'Failed to analyze food.' };
    }
}

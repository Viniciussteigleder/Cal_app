import { renderToStream } from '@react-pdf/renderer';
import { MealPlanPDF, type MealPlanProps } from './meal-plan-pdf';

export async function generateMealPlanPDFStream(data: MealPlanProps) {
    return await renderToStream(MealPlanPDF(data));
}

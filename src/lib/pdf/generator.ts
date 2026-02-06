import { createElement } from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { MealPlanPDF } from './meal-plan-pdf';

export async function generateMealPlanPDFStream(data: {
    patientName: string;
    nutritionistName: string;
    date: string;
    planData: any;
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await renderToStream(createElement(MealPlanPDF, data) as any);
}

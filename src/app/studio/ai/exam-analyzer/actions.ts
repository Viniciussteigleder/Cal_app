'use server';

import { z } from 'zod';
import { executeAIAction } from '@/app/studio/ai/actions';

export async function analyzeExamAction(formData: FormData) {
    // Auth is handled by executeAIAction


    const file = formData.get('file') as File;
    const examType = formData.get('examType') as string;
    const examDate = formData.get('examDate') as string;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = file.type;
        const dataUrl = `data:${mimeType};base64,${base64Image}`; // Wait, AIService expects 'imageData' as base64 or 'imageUrl'. 
        // In Step 155, AIService executeExamAnalyzer logic:
        // if (input.imageUrl || input.imageData) { ... 
        // { type: 'image_url', image_url: { url: input.imageUrl || `data:image/png;base64,${input.imageData}` } }
        // So if I pass 'imageData' it assumes PNG base64? 
        // Wait, `data:image/png;base64,${input.imageData}`. If input.imageData is full data URL it will break.
        // It prepends prefix. So input.imageData should be raw base64.
        // But my mimetype might not be png. 
        // Let's pass `imageUrl` as the full data URL.

        const result = await executeAIAction('exam_analyzer', {
            imageUrl: `data:${mimeType};base64,${base64Image}`,
            examType,
            examDate
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: result.data };

    } catch (error: any) {
        console.error('Exam Analysis Error:', error);
        return { success: false, error: error.message || 'Failed to analyze exam.' };
    }
}
const BiomarkerSchema = z.object({
    name: z.string().describe('Name of the biomarker (e.g., "Glicose", "Colesterol HDL")'),
    value: z.number().describe('Measured numeric value'),
    unit: z.string().describe('Unit of measurement (e.g., "mg/dL")'),
    referenceRange: z.string().describe('The reference range provided in the exam'),
    status: z.enum(['normal', 'low', 'high', 'critical']).describe('Clinical status of the value'),
});

const NutritionalImplicationsSchema = z.object({
    dietaryAdjustments: z.array(z.string()).describe('Specific dietary changes recommended'),
    supplementSuggestions: z.array(z.string()).describe('Supplements that might help'),
});

const ExamAnalysisSchema = z.object({
    examType: z.string().describe('Type of exam identified (e.g., "Hemograma Completo")'),
    examDate: z.string().describe('Date of the exam if found, else current date (YYYY-MM-DD)'),
    biomarkers: z.array(BiomarkerSchema).describe('List of extracted biomarkers'),
    aiSummary: z.string().describe('A concise clinical summary of the findings'),
    concerns: z.array(z.string()).describe('List of health concerns identified'),
    recommendations: z.array(z.string()).describe('General health recommendations'),
    nutritionalImplications: NutritionalImplicationsSchema,
});

export type ExamAnalysisResult = z.infer<typeof ExamAnalysisSchema>;

/**
 * Server Action to analyze an exam image using OpenAI Vision
 */


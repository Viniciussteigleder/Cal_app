
'use server';

import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getAgentConfig } from '@/lib/ai-config';

// Define the output schema using Zod
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
export async function analyzeExamAction(formData: FormData) {
    const file = formData.get('file') as File;
    const examType = formData.get('examType') as string;
    const examDate = formData.get('examDate') as string;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    try {
        // 1. Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = file.type;
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        // 2. Get Configuration
        const config = await getAgentConfig('exam_analyzer');

        // 3. Initialize OpenAI Client
        const openai = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy',
        });

        // 4. Call AI with Structured Output
        const { object } = await generateObject({
            model: openai(config.model), // e.g., 'gpt-4o'
            schema: ExamAnalysisSchema,
            temperature: config.temperature,
            system: config.systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Analyze this medical exam image. Expected exam type: ${examType}. Date context: ${examDate}. Extract all visible values and provide nutritional analysis.` },
                        { type: 'image', image: dataUrl },
                    ],
                },
            ],
        });

        return { success: true, data: object };

    } catch (error) {
        console.error('Exam Analysis Error:', error);
        return { success: false, error: 'Failed to analyze exam. Please ensure the image is clear.' };
    }
}

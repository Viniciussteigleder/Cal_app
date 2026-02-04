'use server';

import { generateChatCompletion } from '@/lib/openai';
import { CLINICAL_MDT_SYSTEM_PROMPT } from '@/lib/ai/prompts/clinical-mdt';

export interface ClinicalMDTInputs {
    templateName: string;
    clinicalSetting: string;
    intakeJson: string; // JSON string of patient data
    attachmentsNotes: string;
    medsSupps: string;
    constraints: {
        timeBudgetCookingCulture: string;
        eatingOut: string;
        language: string;
        readingLevel: string;
    };
    careKitRules: string;
}

export async function runClinicalMDT(inputs: ClinicalMDTInputs) {
    const userPrompt = `
INPUTS:
1) Case Template: ${inputs.templateName}
2) Clinical Setting: ${inputs.clinicalSetting}
3) Intake JSON: ${inputs.intakeJson}
4) Attachments summary: ${inputs.attachmentsNotes}
5) Meds/Supplements: ${inputs.medsSupps}
6) Constraints: ${inputs.constraints.timeBudgetCookingCulture} + ${inputs.constraints.eatingOut} + ${inputs.constraints.language} + ${inputs.constraints.readingLevel}
7) Care Kit Rules: ${inputs.careKitRules}

Please execute the workflow and provide the required outputs.
`;

    try {
        const response = await generateChatCompletion(
            CLINICAL_MDT_SYSTEM_PROMPT,
            userPrompt,
            {
                model: 'gpt-4o',
                temperature: 0.2, // Lower temperature for more clinical/precise output
                maxTokens: 4000
            }
        );

        return {
            success: true,
            data: response.content,
            usage: response.usage
        };
    } catch (error) {
        console.error('Error in runClinicalMDT:', error);
        return {
            success: false,
            error: 'Failed to generate plan'
        };
    }
}

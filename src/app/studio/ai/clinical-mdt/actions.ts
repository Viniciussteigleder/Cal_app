import { executeAIAction } from '@/app/studio/ai/actions';

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
        const result = await executeAIAction('clinical_mdt', {
            ...inputs
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        // The AI output is likely string content because the prompt asks for text blocks (UI cards + Note)
        // Check if data is string or object. executeAIAction returns data from generateText (str) or generateObject (obj).
        // If clinical_mdt uses generateText in AIService (default), it's a string.
        // But AIService likely needs to be updated to handle 'clinical_mdt' explicitly if we want structured output,
        // OR rely on default behavior which returns `text`.

        const validResult = result as any; // Cast to avoid TS errors with dynamic execution result

        return {
            success: true,
            data: validResult.data || validResult.text || validResult.output_data,
        };
    } catch (error: any) {
        console.error('Error in runClinicalMDT:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate plan'
        };
    }
}

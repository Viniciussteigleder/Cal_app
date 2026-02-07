
'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { executeAIAction } from '@/app/studio/ai/actions';



export async function analyzePatientAction(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // Fetch Patient Logs (Last 30 days)
        const logs = await prisma.dailyLogEntry.findMany({
            where: {
                tenant_id: claims.tenant_id,
                patient_id: patientId,
                timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            take: 100,
            orderBy: { timestamp: 'desc' }
        });

        // Delegate to AI Service via centralized action
        const result = await executeAIAction('patient_analyzer', {
            prompt: `Analise estes registros de paciente: ${JSON.stringify(logs.map((l: any) => ({ type: l.entry_type, date: l.timestamp, content: l.content })))}`
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: result.data };

    } catch (error: any) {
        console.error("Patient Analysis Error:", error);
        return { success: false, error: error.message || "Analysis failed" };
    }
}

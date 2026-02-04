'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getDailyLogs(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const logs = await prisma.dailyLogEntry.findMany({
            where: { patient_id: patientId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        // Optional: Consolidate with legacy SymptomLogs if needed in future
        // For now, return unified logs
        return { success: true, data: logs };
    } catch (error) {
        console.error("Fetch Log Error:", error);
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function createDailyLog(patientId: string, data: any) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const log = await prisma.dailyLogEntry.create({
            data: {
                tenant_id: claims.tenant_id,
                patient_id: patientId,
                entry_type: data.entry_type,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
                content: data.content,
                media_urls: data.media_urls || []
            }
        });

        revalidatePath(`/studio/patients/${patientId}/log`);
        return { success: true, data: log };
    } catch (error) {
        console.error("Create Log Error:", error);
        return { success: false, error: "Failed to create entry" };
    }
}

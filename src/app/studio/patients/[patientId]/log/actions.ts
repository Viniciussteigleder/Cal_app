'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const LogContentSchema = z.union([
    z.object({ type: z.string(), description: z.string().optional() }), // Meal
    z.object({ amount: z.number(), unit: z.string() }), // Water
    z.object({ symptoms: z.array(z.string()), severity: z.number(), note: z.string().optional() }), // Symptom
    z.object({ activity: z.string(), duration_min: z.string().or(z.number()) }), // Exercise
    z.object({ text: z.string() }) // Note
]);

const CreateLogSchema = z.object({
    entry_type: z.string(),
    timestamp: z.string().or(z.date()),
    content: LogContentSchema,
    media_urls: z.array(z.string()).optional()
});

export async function getDailyLogs(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const logs = await prisma.dailyLogEntry.findMany({
            where: { patient_id: patientId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        return { success: true, data: logs };
    } catch (error) {
        console.error("Fetch Log Error:", error);
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function createDailyLog(patientId: string, rawData: any) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const validation = CreateLogSchema.safeParse(rawData);
    if (!validation.success) {
        console.error("Validation Error:", validation.error);
        return { success: false, error: "Invalid data format" };
    }

    const data = validation.data;

    try {
        const log = await prisma.dailyLogEntry.create({
            data: {
                tenant_id: claims.tenant_id,
                patient_id: patientId,
                entry_type: data.entry_type,
                timestamp: new Date(data.timestamp),
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

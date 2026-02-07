'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSupabaseClaims } from '@/lib/auth';
import { transcribeAudio, generateChatCompletion } from '@/lib/openai';

export type EntryType = 'consultation' | 'call' | 'question' | 'note';

export interface ProntuarioEntry {
    id: string;
    entryType: EntryType;
    timestamp: Date;
    content: any;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function getProntuarioEntries(
    patientId: string,
    filters?: {
        search?: string;
        types?: EntryType[];
        dateFrom?: Date;
        dateTo?: Date;
    }
) {
    try {
        const where: any = {
            patient_id: patientId,
            deleted_at: null,
        };

        if (filters?.types && filters.types.length > 0) {
            where.entry_type = { in: filters.types };
        }

        if (filters?.dateFrom) {
            where.timestamp = { ...where.timestamp, gte: filters.dateFrom };
        }

        if (filters?.dateTo) {
            where.timestamp = { ...where.timestamp, lte: filters.dateTo };
        }

        const entries = await prisma.patientLogEntry.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: 50,
        });

        return { success: true, data: entries };
    } catch (error) {
        console.error('Error fetching prontuario entries:', error);
        return { success: false, error: 'Failed to fetch entries' };
    }
}

export async function createProntuarioEntry(
    patientId: string,
    data: {
        entryType: EntryType;
        content: any;
        timestamp?: Date;
    }
) {
    try {
        const claims = await getSupabaseClaims();
        if (!claims) return { success: false, error: 'Unauthorized' };

        const userId = claims.user_id;

        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: { tenant_id: true }
        });

        if (!patient) return { success: false, error: 'Patient not found' };

        if (patient.tenant_id !== claims.tenant_id) {
            console.warn(`Tenant mismatch: User ${claims.tenant_id} trying to add entry for Patient ${patient.tenant_id}`);
        }

        const entry = await prisma.patientLogEntry.create({
            data: {
                tenant_id: patient.tenant_id as string,
                patient_id: patientId,
                entry_type: data.entryType,
                timestamp: data.timestamp || new Date(),
                content: data.content,
                created_by: userId,
            },
        });

        revalidatePath(`/studio/patients/${patientId}/prontuario`);
        return { success: true, data: entry };
    } catch (error) {
        console.error('Error creating prontuario entry:', error);
        return { success: false, error: 'Failed to create entry' };
    }
}

export async function deleteProntuarioEntry(id: string, patientId: string) {
    try {
        await prisma.patientLogEntry.update({
            where: { id },
            data: { deleted_at: new Date() },
        });

        revalidatePath(`/studio/patients/${patientId}/prontuario`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting prontuario entry:', error);
        return { success: false, error: 'Failed to delete entry' };
    }
}

export async function toggleProntuarioTask(entryId: string, patientId: string, taskIndex: number, done: boolean) {
    try {
        const entry = await prisma.patientLogEntry.findUnique({ where: { id: entryId } });
        if (!entry) return { success: false, error: 'Entry not found' };

        const content = entry.content as any;
        if (!content.tasks || !Array.isArray(content.tasks)) {
            return { success: false, error: 'No tasks found' };
        }

        if (content.tasks[taskIndex]) {
            content.tasks[taskIndex].done = done;
        }

        await prisma.patientLogEntry.update({
            where: { id: entryId },
            data: { content }
        });

        revalidatePath(`/studio/patients/${patientId}/prontuario`);
        return { success: true };
    } catch (error) {
        console.error('Error toggling task:', error);
        return { success: false, error: 'Failed' };
    }
}

// 1. Refactor to use unified AI Service
import { aiService } from '@/lib/ai/ai-service';

export async function processConsultationAudio(formData: FormData) {
    try {
        const claims = await getSupabaseClaims();
        if (!claims) throw new Error('Unauthorized');

        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Execute AI Agent for Transcription & SOAP Note
        const result = await aiService.execute({
            agentType: 'medical_record_creator',
            tenantId: claims.tenant_id,
            userId: claims.user_id,
            inputData: {
                action: 'transcribe',
                audioFile: file
            }
        });

        if (!result.success) {
            throw new Error(result.error || 'Failed to process audio via AI Service');
        }

        return {
            success: true,
            data: {
                transcription: result.data.transcription || "Transcrição não disponível", // Fallback if agent behavior varies
                summary: result.data.soapNote ? JSON.stringify(result.data.soapNote, null, 2) : "Resumo não disponível", // Adapting response structure
            }
        };

    } catch (error: any) {
        console.error('Error processing audio:', error);
        return { success: false, error: error.message || 'Failed to process audio' };
    }
}

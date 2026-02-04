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

export async function processConsultationAudio(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // 1. Transcribe
        const { text } = await transcribeAudio(file);
        if (!text) {
            return { success: false, error: 'Transcription failed' };
        }

        // 2. Summarize
        const summaryPrompt = `
      Analise a seguinte transcrição de uma consulta nutricional:
      "${text}"
      
      Gere um resumo clínico estruturado contendo:
      - Queixas principais
      - Hábitos alimentares relatados
      - Histórico clínico/sintomas
      - Metas do paciente
      
      Mantenha o tom profissional e objetivo.
    `;

        const { content: summary } = await generateChatCompletion(
            "Você é um assistente de IA especializado em nutrição clínica. Seu objetivo é ajudar nutricionistas a resumir consultas.",
            summaryPrompt
        );

        return {
            success: true,
            data: {
                transcription: text,
                summary: summary || 'Não foi possível gerar o resumo.',
            }
        };
    } catch (error) {
        console.error('Error processing audio:', error);
        return { success: false, error: 'Failed to process audio' };
    }
}

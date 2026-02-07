'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { executeAIAction } from '@/app/studio/ai/actions';

export async function recommendSupplementsAction(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // Fetch Context
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        const profile = await prisma.patientProfile.findUnique({ where: { patient_id: patientId } });
        const conditions = await prisma.patientCondition.findMany({ where: { patient_id: patientId } });

        if (!profile) throw new Error('Perfil do paciente não encontrado');

        const age = new Date().getFullYear() - new Date(profile.birth_date).getFullYear();
        const conditionList = conditions.map(c => c.name).join(', ') || 'Nenhuma';

        const context = `
            Paciente: Idade ${age}, Sexo ${profile.sex}.
            Objetivo: ${profile.goal}
            Condições Clínicas: ${conditionList}
            Atividade Física: ${profile.activity_level}
            
            Analise lacunas nutricionais prováveis e recomende suplementação baseada em evidência.
            Foque em segurança e eficácia.
            Verifique interações com condições listadas.
        `;

        const result = await executeAIAction('supplement_advisor', {
            prompt: context
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: (result as any).data };

    } catch (error: any) {
        console.error("Supplement Advisor Error:", error);
        return { success: false, error: error.message || 'Falha na análise de suplementação.' };
    }
}

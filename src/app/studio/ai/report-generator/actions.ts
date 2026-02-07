'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { executeAIAction } from '@/app/studio/ai/actions';

export async function generateReportAction(patientId: string, period: string, reportType: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // Fetch Patient Profile
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: { user: true }
        });
        const profile = await prisma.patientProfile.findUnique({ where: { patient_id: patientId } });

        if (!patient || !profile) throw new Error('Paciente não encontrado');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(period || '30'));

        // Fetch Logs (Meals, Symptoms, Measurements)
        const logs = await prisma.dailyLogEntry.findMany({
            where: {
                patient_id: patientId,
                timestamp: { gte: startDate, lte: endDate }
            },
            orderBy: { timestamp: 'asc' }
        });

        // Basic stats aggregation
        const totalLogs = logs.length;
        const mealsLogged = logs.filter(l => l.entry_type === 'meal').length;
        const firstWeight = logs.find(l => l.entry_type === 'measurement' && (l.content as any).weight)?.content as any;
        const lastWeight = [...logs].reverse().find(l => l.entry_type === 'measurement' && (l.content as any).weight)?.content as any;

        const weightChange = (firstWeight?.weight && lastWeight?.weight)
            ? Number(lastWeight.weight) - Number(firstWeight.weight)
            : 0;

        // Construct Context
        const context = `
            Paciente: ${patient.user?.name || 'Desconhecido'}
            Idade: ${new Date().getFullYear() - new Date(profile.birth_date).getFullYear()} anos
            Meta: ${profile.goal}
            Período: Últimos ${period} dias
            Total Registros: ${totalLogs}
            Refeições Registradas: ${mealsLogged}
            Variação de Peso: ${weightChange.toFixed(1)} kg
            Tipo de Relatório: ${reportType}
            
            Registros Detalhados (Amostra):
            ${JSON.stringify(logs.map(l => ({
            type: l.entry_type,
            date: l.timestamp.toISOString().split('T')[0],
            summary: JSON.stringify(l.content).slice(0, 100) // Truncate content 
        })).slice(0, 50))} 
        `;

        const result = await executeAIAction('report_generator', {
            prompt: context
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: (result as any).data };

    } catch (error: any) {
        console.error("Report Generation Error:", error);
        return { success: false, error: error.message || 'Falha ao gerar relatório.' };
    }
}

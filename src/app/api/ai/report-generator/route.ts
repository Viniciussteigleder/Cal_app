import { NextRequest } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { patientId, period, reportType } = body;

    if (!patientId) {
        return Response.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Gather real patient data from DB
    const daysBack = period === '30 dias' ? 30 : period === '60 dias' ? 60 : 90;
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const [patient, dailyLogs, anthropometry] = await Promise.all([
        prisma.patient.findUnique({
            where: { id: patientId },
            select: { full_name: true, date_of_birth: true, goals: true },
        }),
        prisma.dailyLogEntry.findMany({
            where: { patient_id: patientId, log_date: { gte: since } },
            orderBy: { log_date: 'asc' },
            select: { log_date: true, weight_kg: true, water_ml: true, energy_level: true, sleep_hours: true, notes: true },
        }),
        prisma.anthropometryRecord.findMany({
            where: { patient_id: patientId, measured_at: { gte: since } },
            orderBy: { measured_at: 'asc' },
            select: { measured_at: true, weight_kg: true, body_fat_pct: true, muscle_mass_kg: true, waist_cm: true, hip_cm: true, bmi: true },
        }),
    ]);

    const prompt = [
        `Gere um relatório de progresso ${reportType || 'completo'} para o paciente.`,
        `Período: ${period || '90 dias'}`,
        patient ? `Paciente: ${patient.full_name}` : null,
        patient?.goals ? `Objetivos: ${JSON.stringify(patient.goals)}` : null,
        dailyLogs.length ? `Registros diários (${dailyLogs.length} dias): ${JSON.stringify(dailyLogs.slice(-30))}` : 'Sem registros diários.',
        anthropometry.length ? `Antropometria (${anthropometry.length} medições): ${JSON.stringify(anthropometry)}` : 'Sem dados antropométricos.',
    ].filter(Boolean).join('\n');

    return executeAIRoute('report_generator', {
        userMessage: prompt,
        patientId,
        period: period || '90 dias',
        reportType,
    });
}

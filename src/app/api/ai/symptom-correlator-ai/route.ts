import { NextRequest } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { patientId, startDate, endDate, period } = body;

    if (!patientId) {
        return Response.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Calculate date range
    const daysBack = period === '7 dias' ? 7 : period === '14 dias' ? 14 : 30;
    const since = startDate ? new Date(startDate) : new Date(Date.now() - daysBack * 86400000);
    const until = endDate ? new Date(endDate) : new Date();

    // Fetch real symptom and meal data from DB
    const [dailyLogs, mealPhotos] = await Promise.all([
        prisma.dailyLogEntry.findMany({
            where: { patient_id: patientId, log_date: { gte: since, lte: until } },
            orderBy: { log_date: 'asc' },
            select: { log_date: true, notes: true, energy_level: true, symptoms: true, mood: true },
        }),
        prisma.mealPhoto.findMany({
            where: { patient_id: patientId, photo_date: { gte: since, lte: until } },
            orderBy: { photo_date: 'asc' },
            select: { photo_date: true, meal_type: true, ai_analysis: true, notes: true },
        }),
    ]);

    const dataContext = [
        dailyLogs.length
            ? `Registros diários (${dailyLogs.length} dias):\n${JSON.stringify(dailyLogs)}`
            : 'Sem registros diários disponíveis.',
        mealPhotos.length
            ? `Fotos de refeições com análise AI (${mealPhotos.length}):\n${JSON.stringify(mealPhotos)}`
            : 'Sem fotos de refeições disponíveis.',
    ].join('\n\n');

    const prompt = `Correlacione sintomas com padrões alimentares do paciente no período de ${period || '30 dias'}.\n\n${dataContext}`;

    return executeAIRoute('symptom_correlator', {
        userMessage: prompt,
        patientId,
        period: period || '30 dias',
    });
}

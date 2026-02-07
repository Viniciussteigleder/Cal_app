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

    // Fetch real symptom and meal data from DB using correct field names
    const [dailyLogs, symptomLogs, mealPhotos] = await Promise.all([
        prisma.dailyLogEntry.findMany({
            where: { patient_id: patientId, timestamp: { gte: since, lte: until } },
            orderBy: { timestamp: 'asc' },
            select: { timestamp: true, entry_type: true, content: true },
        }),
        prisma.symptomLog.findMany({
            where: { patient_id: patientId, logged_at: { gte: since, lte: until } },
            orderBy: { logged_at: 'asc' },
            select: { logged_at: true, symptoms: true, discomfort_level: true, bristol_scale: true, notes: true },
        }),
        prisma.mealPhoto.findMany({
            where: { patient_id: patientId, captured_at: { gte: since, lte: until } },
            orderBy: { captured_at: 'asc' },
            select: { captured_at: true, ai_analysis: true },
        }),
    ]);

    const dataContext = [
        dailyLogs.length
            ? `Registros diários (${dailyLogs.length} entradas):\n${JSON.stringify(dailyLogs)}`
            : 'Sem registros diários disponíveis.',
        symptomLogs.length
            ? `Registros de sintomas (${symptomLogs.length} entradas):\n${JSON.stringify(symptomLogs)}`
            : 'Sem registros de sintomas disponíveis.',
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

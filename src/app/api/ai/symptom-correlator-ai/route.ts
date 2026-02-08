import { NextRequest, NextResponse } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';
import { getRequestClaims } from '@/lib/claims';
import { prisma } from '@/lib/prisma';
import { assertPatientBelongsToTenant, TenantMismatchError } from '@/lib/ai/tenant-guard';

export async function POST(request: NextRequest) {
    try {
        // Auth check BEFORE any DB queries
        const claims = await getRequestClaims();
        if (!claims) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { patientId, startDate, endDate, period } = body;

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        // Verify patient belongs to this tenant
        await assertPatientBelongsToTenant(patientId, claims.tenant_id);

        const daysBack = period === '7 dias' ? 7 : period === '14 dias' ? 14 : 30;
        const since = startDate ? new Date(startDate) : new Date(Date.now() - daysBack * 86400000);
        const until = endDate ? new Date(endDate) : new Date();

        const [dailyLogs, symptomLogs, mealPhotos] = await Promise.all([
            prisma.dailyLogEntry.findMany({
                where: { patient_id: patientId, tenant_id: claims.tenant_id, timestamp: { gte: since, lte: until } },
                orderBy: { timestamp: 'asc' },
                take: 100,
                select: { timestamp: true, entry_type: true, content: true },
            }),
            prisma.symptomLog.findMany({
                where: { patient_id: patientId, tenant_id: claims.tenant_id, logged_at: { gte: since, lte: until } },
                orderBy: { logged_at: 'asc' },
                take: 100,
                select: { logged_at: true, symptoms: true, discomfort_level: true, bristol_scale: true, notes: true },
            }),
            prisma.mealPhoto.findMany({
                where: { patient_id: patientId, tenant_id: claims.tenant_id, captured_at: { gte: since, lte: until } },
                orderBy: { captured_at: 'asc' },
                take: 50,
                select: { captured_at: true, ai_analysis: true },
            }),
        ]);

        // Trim data to prevent token overflow in prompts
        const dataContext = [
            dailyLogs.length
                ? `Registros diários (${dailyLogs.length} entradas):\n${JSON.stringify(dailyLogs.slice(-30))}`
                : 'Sem registros diários disponíveis.',
            symptomLogs.length
                ? `Registros de sintomas (${symptomLogs.length} entradas):\n${JSON.stringify(symptomLogs.slice(-30))}`
                : 'Sem registros de sintomas disponíveis.',
            mealPhotos.length
                ? `Fotos de refeições com análise AI (${mealPhotos.length}):\n${JSON.stringify(mealPhotos.slice(-20))}`
                : 'Sem fotos de refeições disponíveis.',
        ].join('\n\n');

        const prompt = `Correlacione sintomas com padrões alimentares do paciente no período de ${period || '30 dias'}.\n\n${dataContext}`;

        return executeAIRoute('symptom_correlator', {
            userMessage: prompt,
            patientId,
            period: period || '30 dias',
        });
    } catch (error) {
        if (error instanceof TenantMismatchError) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        console.error('Symptom correlator error:', error);
        return NextResponse.json(
            { error: 'Falha ao correlacionar sintomas' },
            { status: 500 }
        );
    }
}

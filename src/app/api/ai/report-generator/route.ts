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
        const { patientId, period, reportType } = body;

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        // Verify patient belongs to this tenant
        await assertPatientBelongsToTenant(patientId, claims.tenant_id);

        const daysBack = period === '30 dias' ? 30 : period === '60 dias' ? 60 : 90;
        const since = new Date();
        since.setDate(since.getDate() - daysBack);

        const [patient, profile, dailyLogs, anthropometry] = await Promise.all([
            prisma.patient.findFirst({
                where: { id: patientId, tenant_id: claims.tenant_id },
                include: { user: true },
            }),
            prisma.patientProfile.findFirst({
                where: { patient_id: patientId, tenant_id: claims.tenant_id },
                select: { birth_date: true, goal: true, current_weight_kg: true, target_weight_kg: true },
            }),
            prisma.dailyLogEntry.findMany({
                where: { patient_id: patientId, tenant_id: claims.tenant_id, timestamp: { gte: since } },
                orderBy: { timestamp: 'asc' },
                take: 100,
                select: { timestamp: true, entry_type: true, content: true },
            }),
            prisma.anthropometryRecord.findMany({
                where: { patient_id: patientId, tenant_id: claims.tenant_id, measured_at: { gte: since } },
                orderBy: { measured_at: 'asc' },
                select: { measured_at: true, weight_kg: true, height_cm: true, measurements: true },
            }),
        ]);

        const patientName = patient?.user?.name || 'Paciente';

        const prompt = [
            `Gere um relatório de progresso ${reportType || 'completo'} para o paciente.`,
            `Período: ${period || '90 dias'}`,
            `Paciente: ${patientName}`,
            profile?.goal ? `Objetivo: ${profile.goal}` : null,
            profile?.current_weight_kg ? `Peso atual: ${profile.current_weight_kg} kg` : null,
            profile?.target_weight_kg ? `Peso alvo: ${profile.target_weight_kg} kg` : null,
            dailyLogs.length
                ? `Registros diários (${dailyLogs.length} entradas): ${JSON.stringify(dailyLogs.slice(-30))}`
                : 'Sem registros diários.',
            anthropometry.length
                ? `Antropometria (${anthropometry.length} medições): ${JSON.stringify(anthropometry)}`
                : 'Sem dados antropométricos.',
        ].filter(Boolean).join('\n');

        return executeAIRoute('report_generator', {
            userMessage: prompt,
            patientId,
            period: period || '90 dias',
            reportType,
        });
    } catch (error) {
        if (error instanceof TenantMismatchError) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        console.error('Report generator error:', error);
        return NextResponse.json(
            { error: 'Falha ao gerar relatório' },
            { status: 500 }
        );
    }
}

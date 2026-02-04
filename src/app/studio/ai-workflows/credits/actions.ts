'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';

export async function getAiCreditsOverview() {
    try {
        const claims = await getSupabaseClaims();
        if (!claims) return { success: false, error: "Unauthorized" };

        const tenantId = claims.tenant_id;

        const totalAggregation = await prisma.aiCreditTransaction.aggregate({
            where: { tenant_id: tenantId },
            _sum: { credits_used: true, cost_brl: true }
        });

        const byAgent = await prisma.aiCreditTransaction.groupBy({
            by: ['agent_type'],
            where: { tenant_id: tenantId },
            _sum: { credits_used: true, cost_brl: true },
            orderBy: { _sum: { credits_used: 'desc' } }
        });

        const byPatient = await prisma.aiCreditTransaction.groupBy({
            by: ['patient_id'],
            where: { tenant_id: tenantId, patient_id: { not: null } },
            _sum: { credits_used: true, cost_brl: true },
            take: 10,
            orderBy: { _sum: { credits_used: 'desc' } }
        });

        // Resolve patient names
        const patientSummaries = await Promise.all(byPatient.map(async (item) => {
            if (!item.patient_id) return null;

            // Try to resolve name through Patient -> User
            const patient = await prisma.patient.findUnique({
                where: { id: item.patient_id }
            });

            let name = 'Paciente Desconhecido';
            if (patient && patient.user_id) {
                const user = await prisma.user.findUnique({
                    where: { id: patient.user_id }
                });
                if (user) name = user.name;
            } else {
                name = `Paciente ${item.patient_id.substring(0, 6)}`;
            }

            return {
                patientId: item.patient_id,
                name,
                credits: item._sum.credits_used || 0,
                cost: item._sum.cost_brl || 0
            };
        }));

        // History (Last 30 days)
        const historyData = await prisma.aiCreditTransaction.findMany({
            where: {
                tenant_id: tenantId,
                created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            orderBy: { created_at: 'asc' }
        });

        // Group history by date (client or server side is fine, doing here for ease)
        const historyMap = new Map<string, number>();
        historyData.forEach(tx => {
            const date = new Date(tx.created_at).toISOString().split('T')[0];
            const current = historyMap.get(date) || 0;
            historyMap.set(date, current + Number(tx.credits_used));
        });

        const history = Array.from(historyMap.entries()).map(([date, credits]) => ({
            date, credits
        })).sort((a, b) => a.date.localeCompare(b.date));


        return {
            success: true,
            data: {
                totalCredits: totalAggregation._sum.credits_used || 0,
                totalCostBrl: totalAggregation._sum.cost_brl || 0,
                byAgent: byAgent.map(a => ({
                    agent: a.agent_type,
                    credits: a._sum.credits_used || 0,
                    cost: a._sum.cost_brl || 0
                })),
                byPatient: patientSummaries.filter(Boolean),
                history
            }
        };

    } catch (error) {
        console.error("Error fetching AI credits:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}

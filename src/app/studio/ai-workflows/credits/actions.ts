
'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';

export async function getAiCreditStats() {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const transactions = await prisma.aiCreditTransaction.findMany({
            where: { tenant_id: claims.tenant_id },
            orderBy: { created_at: 'desc' },
            take: 100
        });

        // Aggregations
        const totalCredits = await prisma.aiCreditTransaction.aggregate({
            where: { tenant_id: claims.tenant_id },
            _sum: { credits_used: true, cost_brl: true }
        });

        const byAgent = await prisma.aiCreditTransaction.groupBy({
            by: ['agent_type'],
            where: { tenant_id: claims.tenant_id },
            _sum: { credits_used: true },
        });

        return {
            success: true,
            data: {
                transactions,
                totals: {
                    credits: totalCredits._sum.credits_used || 0,
                    brl: totalCredits._sum.cost_brl || 0
                },
                breakdown: byAgent.map(group => ({
                    agent: group.agent_type,
                    credits: group._sum.credits_used || 0
                }))
            }
        };

    } catch (error) {
        console.error("Fetch Credits Error:", error);
        return { success: false, error: "Failed to fetch credit stats" };
    }
}

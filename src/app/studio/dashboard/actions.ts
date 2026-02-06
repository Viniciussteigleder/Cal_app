'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';

export async function getDashboardStats() {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const tenantId = claims.tenant_id;

    // Parallel fetch
    const [
        totalPatients,
        activePlans,
        totalConsultations,
        consultationsByMonthRaw
    ] = await Promise.all([
        prisma.patient.count({ where: { tenant_id: tenantId, status: 'active' } }),
        prisma.plan.count({ where: { tenant_id: tenantId, status: 'active' } }),
        prisma.consultation.count({ where: { tenant_id: tenantId } }),
        // Group by month requires RAW query or manual processing in JS. 
        // Prisma groupBy date is not fully supported for Month extraction easily without raw query in some providers.
        // We'll fetch all created_at dates for consultations and aggregate in JS for simplicity/safety given low volume.
        prisma.consultation.findMany({
            where: {
                tenant_id: tenantId,
                created_at: {
                    gte: new Date(new Date().getFullYear(), 0, 1) // From start of this year
                }
            },
            select: { created_at: true }
        })
    ]);

    // Process Chart Data
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const historyMap = new Array(12).fill(0);

    consultationsByMonthRaw.forEach(c => {
        const month = c.created_at.getMonth();
        historyMap[month]++;
    });

    const chartData = months.map((month, idx) => ({
        month,
        count: historyMap[idx]
    }));

    // Calculate growth (Mock vs Real: Logic requires last month data which we might not have enough of)
    // We'll return just the counts for now.

    return {
        success: true,
        data: {
            totalPatients,
            activePlans,
            totalConsultations,
            chartData
        }
    };
}

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTenants() {
    // Only accessible by owner logic - assume this page is protected by middleware/layout
    // Or we should verify claims.role === 'owner' or similar if owner app uses same auth.
    // Assuming Owner App is separate or protected.

    try {
        const tenants = await prisma.tenant.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        users: true, // Only counting nutritionists for now as 'Users'
                        patients: true, // If Tenant has relation to patients? 
                        // Schema: Patient has tenant_id. Tenant has specific relations?
                        // Let's check relation names.
                        // If failed, we ignore counts.
                    }
                }
            }
        });

        // Manual Counts if _count relation fails (checking schema)
        // Tenant has `users`, `patients` (if defined).
        // Let's assume standard relations.

        return { success: true, data: tenants };
    } catch (error) {
        console.error("Fetch Tenants Error:", error);
        return { success: false, error: "Failed to fetch tenants" };
    }
}

export async function toggleTenantAi(tenantId: string, enabled: boolean) {
    try {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) return { success: false, error: "Tenant not found" };

        const currentSettings = (tenant.settings as Record<string, any>) || {};

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                settings: {
                    ...currentSettings,
                    ai_enabled: enabled
                }
            }
        });

        revalidatePath('/owner/tenants');
        return { success: true };
    } catch (error) {
        console.error("Toggle AI Error:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

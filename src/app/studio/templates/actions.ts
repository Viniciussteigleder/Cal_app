'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getTemplates() {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const templates = await prisma.formTemplate.findMany({
        where: { tenant_id: claims.tenant_id },
        orderBy: { created_at: 'desc' }
    });

    return { success: true, data: templates };
}

export async function createTemplate(data: { title: string, type: string, structure_json: any }) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const template = await prisma.formTemplate.create({
            data: {
                tenant_id: claims.tenant_id,
                title: data.title,
                type: data.type as any, // assuming type safety is managed elsewhere
                structure_json: data.structure_json,
                is_system: false
            }
        });
        revalidatePath('/studio/templates');
        return { success: true, data: template };
    } catch (error) {
        console.error("Create Template Error:", error);
        return { success: false, error: 'Failed to create template' };
    }
}

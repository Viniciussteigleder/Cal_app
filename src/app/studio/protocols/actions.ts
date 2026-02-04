'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getProtocols() {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const protocols = await prisma.protocol.findMany({
        where: { tenant_id: claims.tenant_id },
        orderBy: { name: 'asc' }
    });

    return { success: true, data: protocols };
}

export async function getProtocol(id: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const protocol = await prisma.protocol.findUnique({
        where: { id },
    });

    return { success: true, data: protocol };
}

export async function createProtocol(data: any) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    const protocol = await prisma.protocol.create({
        data: {
            ...data,
            tenant_id: claims.tenant_id,
            code: data.name.toLowerCase().replace(/ /g, '-'), // simple slug
            type: 'standard' // assumes enum exists/matches
        }
    });

    revalidatePath('/studio/protocols');
    return { success: true, data: protocol };
}

export async function updateProtocol(id: string, data: any) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    await prisma.protocol.update({
        where: { id },
        data
    });

    revalidatePath('/studio/protocols');
    return { success: true };
}

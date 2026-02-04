'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';

export async function getCurrentPatientId() {
    const claims = await getSupabaseClaims();
    if (!claims || claims.role !== 'PATIENT') return null;

    const patient = await prisma.patient.findFirst({
        where: { user_id: claims.user_id }
    });

    return patient?.id;
}

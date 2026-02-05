
'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';

export async function getPatient(patientId: string) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
        });

        if (!patient) return { success: false, error: 'Patient not found' };

        // Fetch related data
        const profile = await prisma.patientProfile.findUnique({
            where: { patient_id: patientId }
        });

        const conditions = await prisma.patientCondition.findMany({
            where: { patient_id: patientId }
        });

        // Basic user info if linked (assumes we can fetch user name via another way if separate, 
        // but here we might just have `name` on Patient model? No, Patient only has user_id.
        // Wait, schema shows Patient has `user_id` but no `name`?
        // Ah, `User` has `name`. We need to join.

        let name = "Paciente";
        if (patient.user_id) {
            const user = await prisma.user.findUnique({ where: { id: patient.user_id } });
            if (user) name = user.name;
        }

        return {
            success: true,
            data: {
                ...patient,
                name,
                profile,
                conditions
            }
        };

    } catch (error) {
        console.error("Fetch Patient Error:", error);
        return { success: false, error: "Failed to fetch patient" };
    }
}

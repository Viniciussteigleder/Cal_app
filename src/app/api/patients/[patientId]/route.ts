import { NextResponse } from 'next/server';
import { getSupabaseClaims } from '@/lib/auth';
import { withSession } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ patientId: string }> }
) {
    try {
        const claims = await getSupabaseClaims();
        if (!claims) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { patientId } = await params;

        const patient = await withSession(claims, (tx) =>
            tx.patient.findUnique({
                where: { id: patientId },
                include: { user: true },
            })
        );

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // Map to the shape expected by PatientContext
        return NextResponse.json({
            id: patient.id,
            name: patient.user?.name ?? 'Paciente',
            email: patient.user?.email ?? null,
            phone: null,
            status: patient.status,
            lastUpdate: patient.created_at,
            // lastInteraction: patient.last_interaction, // If exists in schema
        });

    } catch (error) {
        console.error('Error fetching patient:', error);
        return NextResponse.json({ error: 'Internal User Error' }, { status: 500 });
    }
}

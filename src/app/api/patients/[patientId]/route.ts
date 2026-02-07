import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSupabaseClaims } from '@/lib/auth';

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

        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                tenant_id: true,
                created_at: true,
                updated_at: true,
                // Add other fields if needed for context
            },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        if (patient.tenant_id !== claims.tenant_id) {
            console.warn(`Tenant mismatch in API: User ${claims.tenant_id} -> Patient ${patient.tenant_id}`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Map to the shape expected by PatientContext
        return NextResponse.json({
            id: patient.id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            status: patient.status,
            lastUpdate: patient.updated_at,
            // lastInteraction: patient.last_interaction, // If exists in schema
        });

    } catch (error) {
        console.error('Error fetching patient:', error);
        return NextResponse.json({ error: 'Internal User Error' }, { status: 500 });
    }
}

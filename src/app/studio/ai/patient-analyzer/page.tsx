
import React from 'react';
import { prisma } from '@/lib/prisma';
import { PatientAnalyzerClient } from './PatientAnalyzerClient';

export const dynamic = 'force-dynamic';

export default async function PatientAnalyzerPage() {
    // Reuse the same logic as SymptomCorrelator to fetch patients
    const patients = await prisma.patient.findMany({
        take: 100,
        orderBy: { created_at: 'desc' }
    });

    const userIds = patients.map(p => p.user_id).filter(Boolean) as string[];

    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true }
    });

    const patientList = patients.map(p => {
        const user = users.find(u => u.id === p.user_id);
        return {
            id: p.id,
            name: user?.name || `Paciente ${p.id.substring(0, 8)}`
        };
    });

    return (
        <PatientAnalyzerClient patients={patientList} />
    );
}

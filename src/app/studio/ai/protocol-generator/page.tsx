import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProtocolGeneratorClient } from './ProtocolGeneratorClient';

export const dynamic = 'force-dynamic';

export default async function ProtocolGeneratorPage() {
    // Fetch patients and map names
    const patients = await prisma.patient.findMany({
        take: 100,
        orderBy: { created_at: 'desc' }
    });

    const userIds = patients.map(p => p.user_id).filter(Boolean) as string[];

    // Fetch user details
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gerador de Protocolos Clínicos</h1>
                <p className="text-muted-foreground">Crie estratégias nutricionais complexas em segundos.</p>
            </div>

            <ProtocolGeneratorClient patients={patientList} />
        </div>
    );
}

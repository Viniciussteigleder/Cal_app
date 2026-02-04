import React from 'react';
import { getActiveProtocol } from './actions';
import { getProtocols } from '@/app/studio/protocols/actions';
import { DietPlanView } from './DietPlanView';

export default async function DietPlanPage({
    params,
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;

    const activeRes = await getActiveProtocol(patientId);
    const protocolsRes = await getProtocols();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Plano Alimentar & Protocolos</h1>
                <p className="text-muted-foreground">Gerencie a estratégia nutricional ativa do paciente.</p>
            </div>

            <DietPlanView
                patientId={patientId}
                activeProtocol={activeRes.success ? activeRes.data : null}
                availableProtocols={protocolsRes.success ? protocolsRes.data : []}
            />
        </div>
    );
}

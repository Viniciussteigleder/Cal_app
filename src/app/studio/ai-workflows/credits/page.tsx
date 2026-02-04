import React from 'react';
import { getAiCreditsOverview } from './actions';
import { CreditsDashboardView } from './CreditsDashboardView';

export default async function AiCreditsPage() {
    const { success, data, error } = await getAiCreditsOverview();

    if (!success) {
        return (
            <div className="p-8 text-center text-destructive">
                <h2 className="text-lg font-bold">Erro ao carregar dados</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Custos e Créditos de IA</h1>
                <p className="text-muted-foreground">Monitore o consumo detalhado dos agentes de IA.</p>
            </div>

            <CreditsDashboardView data={data} />
        </div>
    );
}

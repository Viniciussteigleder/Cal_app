import React from 'react';
import { getAiConfigs } from './actions';
import { AiConfigList } from './AiConfigList';

export default async function AiConfigPage() {
    const { success, data } = await getAiConfigs();

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuração dos Agentes de IA</h1>
                <p className="text-muted-foreground mt-2">Personalize o comportamento, prompts e modelos de cada agente do sistema.</p>
            </div>

            <AiConfigList agents={data || []} />
        </div>
    );
}

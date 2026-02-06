import React from 'react';
import { getExamUploads, getConsolidatedResults } from './actions';
import { ExamsListView } from './ExamsListView';
import { ConsolidatedHistory } from './ConsolidatedHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function ExamesPage({
    params,
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;

    const [uploadsRes, consolidatedRes] = await Promise.all([
        getExamUploads(patientId),
        getConsolidatedResults(patientId)
    ]);

    const uploads = uploadsRes.data || [];
    const consolidated = consolidatedRes.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Exames Laboratoriais</h1>
                <p className="text-muted-foreground">
                    Gerencie resultados, análise tendências e visualize o histórico do paciente.
                </p>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Uploads</TabsTrigger>
                    <TabsTrigger value="history">Histórico Consolidado</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <ExamsListView uploads={uploads} patientId={patientId} />
                </TabsContent>

                <TabsContent value="history">
                    <ConsolidatedHistory data={consolidated} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

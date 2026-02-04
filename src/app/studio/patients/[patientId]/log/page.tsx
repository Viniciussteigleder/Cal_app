import React from 'react';
import { getDailyLogs } from './actions';
import { DailyLogTimeline } from './DailyLogTimeline';
import { getRecipes } from '@/app/studio/recipes/actions';

export default async function DailyLogPage({
    params,
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;
    const { success, data } = await getDailyLogs(patientId);

    // Fetch recipes for Meal selection
    const recipesRes = await getRecipes();
    const recipes = recipesRes.success ? recipesRes.data : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Diário do Paciente</h1>
                <p className="text-muted-foreground">Monitore a rotina, alimentação e sintomas em tempo real.</p>
            </div>

            <DailyLogTimeline
                initialLogs={data || []}
                patientId={patientId}
                recipes={recipes || []}
            />
        </div>
    );
}

import React from 'react';
import { getCurrentPatientId } from './actions';

export const dynamic = 'force-dynamic';
import { getDailyLogs } from '@/app/studio/patients/[patientId]/log/actions';
import { getRecipes } from '@/app/studio/recipes/actions';
import { DailyLogTimeline } from '@/app/studio/patients/[patientId]/log/DailyLogTimeline';
import { redirect } from 'next/navigation';

export default async function PatientLogPage() {
  const patientId = await getCurrentPatientId();

  if (!patientId) {
    // Handle case where user is logged in but has no patient record linked
    // For MVP, redirect or show error
    return <div className="p-8 text-center text-muted-foreground">Perfil de paciente não encontrado.</div>;
  }

  // Reuse the fetch logic from Studio actions
  const logsRes = await getDailyLogs(patientId);
  const recipesRes = await getRecipes();

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Diário</h1>
        <p className="text-muted-foreground">O que você comeu ou sentiu hoje?</p>
      </div>

      <DailyLogTimeline
        initialLogs={logsRes.success ? logsRes.data : []}
        patientId={patientId}
        recipes={recipesRes.success ? recipesRes.data : []}
      />
    </div>
  );
}

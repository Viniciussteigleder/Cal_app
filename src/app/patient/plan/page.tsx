
// Actually, sticking to Server Component for data fetching is better in Next.js 13+.
// But original file was "use client". I'll switch to Server Component to fetch data, and a Client Component for the "Week Navigation" if kept.
// Simplification: Fetch data in page (server) and pass to a PlanView (client).

import React from 'react';
import DashboardLayout from "@/components/layout/dashboard-layout";

export const dynamic = 'force-dynamic';
import { getCurrentPatientId } from '@/app/patient/log/actions';
import { getActiveProtocol } from '@/app/studio/patients/[patientId]/plano-alimentar/actions';
import { PlanView } from './PlanView';
import { redirect } from 'next/navigation';

export default async function PlanPage() {
  const patientId = await getCurrentPatientId();
  if (!patientId) {
    return <div className="p-8">Perfil não encontrado.</div>;
  }

  const { data: activeProtocol } = await getActiveProtocol(patientId);

  // If activeProtocol exists, activeProtocol.protocol has the details.

  return (
    <DashboardLayout role="patient">
      <PlanView activeProtocol={activeProtocol} />
    </DashboardLayout>
  );
}

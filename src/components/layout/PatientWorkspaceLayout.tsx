'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { ContextBar, PatientBanner } from '@/components/layout/ContextBar';
import { PatientWorkspaceSidebar } from '@/components/layout/PatientWorkspaceSidebar';
import { QuickAccessPanel } from '@/components/layout/QuickAccessPanel';
import { PatientContextProvider, usePatientContext } from '@/contexts/PatientContext';
import DevSessionBridge from '@/components/dev-session-bridge';

interface PatientWorkspaceLayoutProps {
    children: React.ReactNode;
}

/**
 * PatientWorkspaceLayout — Modo Paciente (Workspace)
 *
 * Architecture:
 *   ┌──────────────────────────────────────┐
 *   │           AppHeader                  │
 *   ├──────────────────────────────────────┤
 *   │     ContextBar (Paciente ativo)      │
 *   ├──────────────────────────────────────┤
 *   │   PatientBanner (critical screens)   │
 *   ├──────┬───────────────────────────────┤
 *   │      │                               │
 *   │ Work │         Main Content          │
 *   │ space│                               │
 *   │ Side │                               │
 *   └──────┴───────────────────────────────┘
 */
export function PatientWorkspaceLayout({ children }: PatientWorkspaceLayoutProps) {
    const params = useParams();
    const patientId = params.patientId as string;
    const [quickAccessOpen, setQuickAccessOpen] = useState(false);

    return (
        <PatientContextProvider>
            <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <DevSessionBridge role="TENANT_ADMIN" />

                {/* Header */}
                <AppHeader onQuickAccessToggle={() => setQuickAccessOpen(!quickAccessOpen)} />

                {/* Context Bar */}
                <ContextBar />

                {/* Quick Access Panel */}
                <QuickAccessPanel
                    open={quickAccessOpen}
                    onClose={() => setQuickAccessOpen(false)}
                />

                {/* Patient Banner for critical views */}
                <PatientBannerWrapper />

                {/* Body: Sidebar + Content */}
                <div className="flex flex-1 overflow-hidden">
                    <PatientWorkspaceSidebar patientId={patientId} />
                    <main className="flex-1 overflow-auto p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </PatientContextProvider>
    );
}

function PatientBannerWrapper() {
    const { patient } = usePatientContext();
    if (!patient) return null;
    return <PatientBanner patientName={patient.name} />;
}

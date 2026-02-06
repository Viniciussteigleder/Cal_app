'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PatientContextProvider } from '@/contexts/PatientContext';
import { PatientWorkspaceSidebar } from '@/components/layout/PatientWorkspaceSidebar';
import { ContextBar, PatientBanner } from '@/components/layout/ContextBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { QuickAccessPanel } from '@/components/layout/QuickAccessPanel';
import DevSessionBridge from '@/components/dev-session-bridge';

function PatientBannerInner() {
    // This is imported from ContextBar.tsx and uses usePatientContext
    // Needs to be inside PatientContextProvider
    return null; // Banner is optional per-page; handled via ContextBar
}

export default function PatientWorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const patientId = params.patientId as string;
    const [quickAccessOpen, setQuickAccessOpen] = React.useState(false);

    return (
        <PatientContextProvider>
            <div className="flex flex-col h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <DevSessionBridge role="TENANT_ADMIN" />

                {/* Header */}
                <AppHeader onQuickAccessToggle={() => setQuickAccessOpen(!quickAccessOpen)} />

                {/* Context Bar (Patient Mode) */}
                <ContextBar />

                {/* Quick Access Panel */}
                <QuickAccessPanel
                    open={quickAccessOpen}
                    onClose={() => setQuickAccessOpen(false)}
                />

                {/* Body: Workspace Sidebar + Content */}
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

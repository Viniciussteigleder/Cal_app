'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { ContextBar } from '@/components/layout/ContextBar';
import { GlobalSidebar } from '@/components/layout/GlobalSidebar';
import { QuickAccessPanel } from '@/components/layout/QuickAccessPanel';
import { PatientContextProvider } from '@/contexts/PatientContext';
import DevSessionBridge from '@/components/dev-session-bridge';

interface NutriLayoutProps {
    children: React.ReactNode;
}

/**
 * NutriLayout — Modo Global (Clínica)
 *
 * Architecture:
 *   ┌──────────────────────────────────────┐
 *   │           AppHeader                  │
 *   ├──────────────────────────────────────┤
 *   │           ContextBar (Clínica)       │
 *   ├──────┬───────────────────────────────┤
 *   │      │                               │
 *   │ Side │         Main Content          │
 *   │  bar │                               │
 *   │      │                               │
 *   └──────┴───────────────────────────────┘
 */
export function NutriLayout({ children }: NutriLayoutProps) {
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

                {/* Body: Sidebar + Content */}
                <div className="flex flex-1 overflow-hidden">
                    <GlobalSidebar />
                    <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </PatientContextProvider>
    );
}

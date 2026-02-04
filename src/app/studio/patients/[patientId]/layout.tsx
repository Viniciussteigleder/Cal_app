'use client';

import React from 'react';
import { PatientContextProvider } from '@/contexts/PatientContext';
import { StudioSidebar } from '@/components/layout/StudioSidebar';
import { PatientContextHeader } from '@/components/layout/PatientContextHeader';
import { useParams } from 'next/navigation';

export default function PatientStudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const patientId = params.patientId as string;

    return (
        <PatientContextProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Sidebar Navigation */}
                <StudioSidebar patientId={patientId} currentPhase={1} />

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Patient Context Header */}
                    <PatientContextHeader />

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </PatientContextProvider>
    );
}

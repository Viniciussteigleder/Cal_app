
import React from 'react';
import { LetterheadForm } from './LetterheadForm';
import { getLetterheadSettings } from './actions';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { FileText } from 'lucide-react';

export default async function LetterheadSettingsPage() {
    const { data: settings } = await getLetterheadSettings();

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FileText className="h-8 w-8 text-primary" />
                            Document Settings
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Configure your letterhead for exported documents (PDFs)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <LetterheadForm
                            initialSettings={settings || { enabled: false, primaryColor: '#000000' }}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

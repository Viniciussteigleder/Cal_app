import React from 'react';
import { getProntuarioEntries, EntryType } from './actions';
import { getTemplates } from '@/app/studio/templates/actions';
import { TimelineView } from './TimelineView';
import { ProntuarioActions } from './ProntuarioActions';
import { ProntuarioFilters } from './ProntuarioFilters';

export default async function ProntuarioPage({
    params,
    searchParams,
}: {
    params: Promise<{ patientId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { patientId } = await params;
    const resolvedSearchParams = await searchParams;

    // Parse filters
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;

    // Parse types (comma separated string expected from ProntuarioFilters)
    const rawTypes = resolvedSearchParams.types;
    let types: EntryType[] | undefined = undefined;

    if (typeof rawTypes === 'string') {
        types = rawTypes.split(',') as EntryType[];
    } else if (Array.isArray(rawTypes)) {
        types = rawTypes as EntryType[];
    }

    // Fetch data
    const { data: entries } = await getProntuarioEntries(patientId, { search, types });
    const { data: templates } = await getTemplates();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Prontuário</h1>
                    <p className="text-muted-foreground">
                        Histórico clínico e anotações do paciente.
                    </p>
                </div>
                <ProntuarioActions templates={templates || []} />
            </div>

            {/* Filters */}
            <ProntuarioFilters />

            {/* Timeline Content */}
            <TimelineView initialEntries={entries || []} patientId={patientId} />
        </div>
    );
}

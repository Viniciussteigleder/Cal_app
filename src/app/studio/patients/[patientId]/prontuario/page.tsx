import React from 'react';
import { ActionBar, ActionItem } from '@/components/actions/ActionBar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { getProntuarioEntries, EntryType } from './actions';
import { TimelineView } from './TimelineView';

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
    // const typeParams = typeof resolvedSearchParams.type === 'string' ? [resolvedSearchParams.type] : Array.isArray(resolvedSearchParams.type) ? resolvedSearchParams.type : [];

    // Fetch data
    const { data: entries } = await getProntuarioEntries(patientId, { search });

    // Define actions (passed to client component via a wrapper or handle in client)
    // Since ActionBar is a client component, we can instantiate it here with non-interactive props, 
    // but interaction usually requires a client wrapper or passing handlers. 
    // For 'add', we likely want to open a modal. 
    // We'll leave the ActionBar in a Client Component wrapper if it needs complex state, 
    // or simple links/server actions.
    // For P1 MVP, let's keep it simple: Add Button opens a Client Component Modal.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Prontuário</h1>
                    <p className="text-muted-foreground">
                        Histórico clínico e anotações do paciente.
                    </p>
                </div>

                {/* We'll implement the "New Entry" logic in a client component wrapper or separate button */}
                {/* For now, just a placeholder or simple client wrapper */}
                <ProntuarioActions />
            </div>

            {/* Search and Filter Bar */}
            <Card>
                <CardContent className="p-4">
                    <form className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="search"
                                type="search"
                                placeholder="Buscar no prontuário..."
                                className="pl-8"
                                defaultValue={search}
                            />
                        </div>
                        {/* Filter buttons would go here */}
                        <button type="submit" className="hidden" />
                    </form>
                </CardContent>
            </Card>

            {/* Timeline Content */}
            <TimelineView initialEntries={entries || []} patientId={patientId} />
        </div>
    );
}

// Simple Client Component for Actions
import { ProntuarioActions } from './ProntuarioActions';

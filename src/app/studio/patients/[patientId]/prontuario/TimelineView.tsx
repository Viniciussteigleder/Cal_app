'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal, FileText, Phone, HelpCircle, MessageSquare } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteProntuarioEntry } from './actions';
import { toast } from 'sonner';
import { ProntuarioEntry, EntryType } from './actions';

interface TimelineViewProps {
    initialEntries: any[]; // Using any for now to match Prisma return type
    patientId: string;
}

const EntryIcon = ({ type }: { type: EntryType }) => {
    switch (type) {
        case 'consultation': return <FileText className="h-4 w-4" />;
        case 'call': return <Phone className="h-4 w-4" />;
        case 'question': return <HelpCircle className="h-4 w-4" />;
        case 'note': return <MessageSquare className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
};

const EntryColor = ({ type }: { type: EntryType }) => {
    switch (type) {
        case 'consultation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'call': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'question': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'note': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const EntryLabel = ({ type }: { type: EntryType }) => {
    switch (type) {
        case 'consultation': return 'Consulta';
        case 'call': return 'Ligação';
        case 'question': return 'Dúvida';
        case 'note': return 'Nota';
        default: return 'Entrada';
    }
};

export function TimelineView({ initialEntries, patientId }: TimelineViewProps) {
    const [entries, setEntries] = useState(initialEntries);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta entrada?')) return;

        const result = await deleteProntuarioEntry(id, patientId);
        if (result.success) {
            setEntries(entries.filter(e => e.id !== id));
            toast.success("Entrada excluída com sucesso");
        } else {
            toast.error("Erro ao excluir entrada");
        }
    };

    if (entries.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                <p>Nenhum registro encontrado. Crie a primeira anotação!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {entries.map((entry) => (
                <Card key={entry.id}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                {format(new Date(entry.timestamp), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${EntryColor({ type: entry.entry_type as EntryType })}`}>
                                            <EntryIcon type={entry.entry_type as EntryType} />
                                            <EntryLabel type={entry.entry_type as EntryType} />
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {format(new Date(entry.timestamp), "HH:mm")}
                                        </span>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Opções</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => console.log('Edit', entry.id)}>
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(entry.id)}
                                            >
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mt-2 space-y-2">
                                    <div className="text-sm whitespace-pre-wrap">
                                        {typeof entry.content === 'object' && entry.content !== null
                                            ? (entry.content as any).text || JSON.stringify(entry.content)
                                            : String(entry.content)
                                        }
                                    </div>

                                    {entry.entry_type === 'consultation' && (entry.content as any)?.summary && (
                                        <div className="mt-4 border-t pt-4">
                                            <h4 className="mb-2 text-sm font-semibold">Resumo (IA)</h4>
                                            <ul className="list-disc pl-4 text-sm text-muted-foreground">
                                                <li>Resumo disponível (implementação de renderização em breve)</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

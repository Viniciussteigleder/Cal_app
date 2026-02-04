'use client';

import React from 'react';
import { usePatientContext } from '@/contexts/PatientContext';
import { User, Clock, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function PatientContextHeader() {
    const { patient, isLoading } = usePatientContext();

    if (isLoading) {
        return (
            <div className="border-b bg-card px-6 py-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return null;
    }

    return (
        <div className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Patient Info */}
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">{patient.name}</h2>
                            <span className="text-sm text-muted-foreground">
                                (ID: {patient.id.slice(0, 8)})
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {patient.lastUpdate && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>
                                        Última atualização:{' '}
                                        {formatDistanceToNow(new Date(patient.lastUpdate), {
                                            addSuffix: true,
                                            locale: ptBR,
                                        })}
                                    </span>
                                </div>
                            )}

                            {patient.lastInteraction && (
                                <div className="flex items-center gap-1">
                                    <Activity className="h-3.5 w-3.5" />
                                    <span>
                                        Última interação:{' '}
                                        {formatDistanceToNow(new Date(patient.lastInteraction), {
                                            addSuffix: true,
                                            locale: ptBR,
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                    {/* TODO: Add quick action buttons */}
                    {/* <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagem
          </Button> */}
                </div>
            </div>
        </div>
    );
}

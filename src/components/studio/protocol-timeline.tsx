"use client";

import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProtocolPhase {
    id: string;
    name: string;
    duration_weeks: number;
    description?: string;
}

interface ProtocolInstance {
    id: string;
    started_at: Date;
    current_phase_index: number; // calculated or stored
    protocol: {
        name: string;
        phases?: ProtocolPhase[]; // Assuming we will add phases to schema or mock them for now
    };
}

export function ProtocolTimeline({ instance }: { instance: ProtocolInstance }) {
    // Mock phases if not present in schema yet
    const phases = instance.protocol.phases || [
        { id: '1', name: 'Eliminação', duration_weeks: 4, description: 'Remoção de gatilhos inflamatórios' },
        { id: '2', name: 'Reintrodução', duration_weeks: 2, description: 'Teste de tolerância gradual' },
        { id: '3', name: 'Manutenção', duration_weeks: 8, description: 'Estilo de vida sustentável' }
    ];

    const currentPhase = Math.min(instance.current_phase_index || 0, phases.length - 1);

    return (
        <div className="relative space-y-8 pl-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {phases.map((phase, idx) => {
                const isCompleted = idx < currentPhase;
                const isCurrent = idx === currentPhase;
                const isFuture = idx > currentPhase;

                return (
                    <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                        {/* Icon / Dot logic */}
                        <div className={cn(
                            "absolute -left-10 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shadow-sm transition-all duration-500",
                            isCompleted ? "bg-emerald-500 text-white" :
                                isCurrent ? "bg-amber-500 text-white scale-110 ring-4 ring-amber-100 dark:ring-amber-900/30" :
                                    "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        )}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                isCurrent ? <Clock className="w-5 h-5 animate-pulse" /> :
                                    <Circle className="w-4 h-4" />}
                        </div>

                        {/* Content Card */}
                        <div className={cn(
                            "w-full md:w-[calc(50%-2rem)] p-4 rounded-2xl border shadow-sm transition-all",
                            isCurrent ? "bg-white dark:bg-slate-950 border-amber-200 ring-1 ring-amber-500/20" :
                                isCompleted ? "bg-emerald-50/50 border-emerald-100 opacity-80" :
                                    "bg-slate-50 dark:bg-slate-900 border-transparent opacity-60 grayscale-[0.5]"
                        )}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={cn("font-bold text-base", isCurrent ? "text-amber-700" : isCompleted ? "text-emerald-700" : "text-muted-foreground")}>
                                    {phase.name}
                                </h3>
                                <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded-md border text-muted-foreground">
                                    {phase.duration_weeks} sem
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>

                            {isCurrent && (
                                <div className="mt-4 flex items-center text-xs font-medium text-amber-600">
                                    <span className="relative flex h-2 w-2 mr-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                    Fase Atual - Iniciada em {format(new Date(instance.started_at), 'dd/MM/yy')}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    FileText,
    TestTube,
    Ruler,
    Calculator,
    UtensilsCrossed,
    FileEdit,
    MoreHorizontal,
    ChevronLeft,
    ScrollText,
} from 'lucide-react';

interface Module {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    phase: number; // 1 = MVP, 2 = Phase 2, 3 = Phase 3
    badge?: string;
}

interface StudioSidebarProps {
    patientId: string;
    currentPhase?: number; // Default to 1 (MVP)
}

export function StudioSidebar({ patientId, currentPhase = 1 }: StudioSidebarProps) {
    const pathname = usePathname();

    const modules: Module[] = [
        {
            id: 'prontuario',
            label: 'Prontuário',
            icon: FileText,
            href: `/studio/patients/${patientId}/prontuario`,
            phase: 1,
        },
        {
            id: 'exames',
            label: 'Exames',
            icon: TestTube,
            href: `/studio/patients/${patientId}/exames`,
            phase: 1,
        },
        {
            id: 'log',
            label: 'Diário',
            icon: ScrollText,
            href: `/studio/patients/${patientId}/log`,
            phase: 1,
            badge: 'Novo',
        },
        {
            id: 'antropometria',
            label: 'Antropometria',
            icon: Ruler,
            href: `/studio/patients/${patientId}/antropometria`,
            phase: 2,
            badge: 'Em breve',
        },
        {
            id: 'calculo-energetico',
            label: 'Cálculo Energético',
            icon: Calculator,
            href: `/studio/patients/${patientId}/calculo-energetico`,
            phase: 2,
            badge: 'Em breve',
        },
        {
            id: 'plano-alimentar',
            label: 'Plano Alimentar',
            icon: UtensilsCrossed,
            href: `/studio/patients/${patientId}/plano-alimentar`,
            phase: 3,
            badge: 'Em breve',
        },
        {
            id: 'prescricao',
            label: 'Prescrição',
            icon: FileEdit,
            href: `/studio/patients/${patientId}/prescricao`,
            phase: 3,
            badge: 'Em breve',
        },
        {
            id: 'extras',
            label: 'Extras',
            icon: MoreHorizontal,
            href: `/studio/patients/${patientId}/extras`,
            phase: 3,
            badge: 'Em breve',
        },
    ];

    // Filter modules based on current phase
    const enabledModules = modules.filter((m) => m.phase <= currentPhase);
    const disabledModules = modules.filter((m) => m.phase > currentPhase);

    const isActive = (href: string) => pathname?.startsWith(href);

    return (
        <aside className="flex h-full w-64 flex-col border-r bg-card">
            {/* Back to Patients */}
            <div className="border-b p-4">
                <Link
                    href="/studio/patients"
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Voltar para Pacientes</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {/* Enabled Modules */}
                {enabledModules.map((module) => {
                    const Icon = module.icon;
                    const active = isActive(module.href);

                    return (
                        <Link
                            key={module.id}
                            href={module.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="flex-1">{module.label}</span>
                            {module.badge && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                    {module.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Disabled Modules (Coming Soon) */}
                {disabledModules.length > 0 && (
                    <>
                        <div className="my-4 border-t" />
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                            Em Desenvolvimento
                        </div>
                        {disabledModules.map((module) => {
                            const Icon = module.icon;

                            return (
                                <div
                                    key={module.id}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
                                    title={`Disponível na Fase ${module.phase}`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="flex-1">{module.label}</span>
                                    {module.badge && (
                                        <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs">
                                            {module.badge}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Phase Indicator */}
            <div className="border-t p-4">
                <div className="rounded-lg bg-muted p-3 text-xs">
                    <div className="font-semibold">Fase Atual: MVP (Fase 1)</div>
                    <div className="mt-1 text-muted-foreground">
                        Prontuário e Exames disponíveis
                    </div>
                </div>
            </div>
        </aside>
    );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    TestTube2,
    Ruler,
    Calculator,
    UtensilsCrossed,
    Pill,
    FolderOpen,
    MessageSquare,
    ChevronLeft,
    Play,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientContext } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';

interface WorkspaceModule {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    aiActions?: string[];
}

function getModules(patientId: string): WorkspaceModule[] {
    const base = `/studio/pacientes/${patientId}`;
    return [
        {
            id: 'resumo',
            label: 'Resumo',
            icon: LayoutDashboard,
            href: `${base}/resumo`,
            aiActions: ['Resumo clínico', 'Checklist de revisão'],
        },
        {
            id: 'prontuario',
            label: 'Prontuário',
            icon: FileText,
            href: `${base}/prontuario`,
            aiActions: ['Resumir prontuário', 'Gerar evolução', 'Transcrever consulta'],
        },
        {
            id: 'exames',
            label: 'Exames',
            icon: TestTube2,
            href: `${base}/exames`,
            aiActions: ['Extrair dados do PDF', 'Interpretar exames', 'Gráficos evolutivos'],
        },
        {
            id: 'antropometria',
            label: 'Antropometria',
            icon: Ruler,
            href: `${base}/antropometria`,
            aiActions: ['Extrair bioimpedância', 'Insights de tendência'],
        },
        {
            id: 'calculo-energetico',
            label: 'Cálc. Energético',
            icon: Calculator,
            href: `${base}/calculo-energetico`,
            aiActions: ['Sugerir fatores', 'Gerar cenários'],
        },
        {
            id: 'plano-alimentar',
            label: 'Plano Alimentar',
            icon: UtensilsCrossed,
            href: `${base}/plano-alimentar`,
            aiActions: ['Gerar plano', 'Variações', 'Substituições'],
        },
        {
            id: 'prescricao',
            label: 'Prescrição',
            icon: Pill,
            href: `${base}/prescricao`,
            aiActions: ['Sugerir prescrição', 'Checagem de conflitos'],
        },
        {
            id: 'documentos',
            label: 'Documentos',
            icon: FolderOpen,
            href: `${base}/documentos`,
            aiActions: ['Gerar orientações', 'Reescrever linguagem'],
        },
        {
            id: 'mensagens',
            label: 'Mensagens',
            icon: MessageSquare,
            href: `${base}/mensagens`,
            aiActions: ['Sugerir mensagem'],
        },
    ];
}

interface PatientWorkspaceSidebarProps {
    patientId: string;
}

export function PatientWorkspaceSidebar({ patientId }: PatientWorkspaceSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { patient } = usePatientContext();
    const modules = getModules(patientId);

    const isActive = (href: string) => {
        return pathname.startsWith(href);
    };

    return (
        <aside
            className="hidden md:flex md:flex-col h-full w-[240px] border-r border-border bg-card shrink-0"
            aria-label="Navegação do paciente"
        >
            {/* Back to Patients */}
            <div className="p-3 border-b border-border/50">
                <Link
                    href="/studio/pacientes"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Voltar para Pacientes</span>
                </Link>
            </div>

            {/* Patient Name */}
            <div className="px-3 py-3 border-b border-border/50">
                <p className="text-sm font-semibold truncate">{patient?.name || 'Paciente'}</p>
                {patient?.status && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Status: {patient.status}
                    </p>
                )}
            </div>

            {/* Start Consultation CTA */}
            <div className="p-3 border-b border-border/50">
                <Button
                    onClick={() => router.push(`/studio/pacientes/${patientId}/consulta/iniciar`)}
                    className="w-full gap-2 h-9 text-xs font-semibold"
                    size="sm"
                >
                    <Play className="h-3.5 w-3.5" />
                    Iniciar Consulta
                </Button>
            </div>

            {/* Module Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                {modules.map((mod) => {
                    const Icon = mod.icon;
                    const active = isActive(mod.href);
                    const hasAI = mod.aiActions && mod.aiActions.length > 0;

                    return (
                        <Link
                            key={mod.id}
                            href={mod.href}
                            className={cn(
                                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                active
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            aria-current={active ? "page" : undefined}
                        >
                            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground" : "")} />
                            <span className="flex-1 truncate">{mod.label}</span>
                            {hasAI && (
                                <Sparkles className={cn(
                                    "h-3 w-3 shrink-0",
                                    active
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground/40 group-hover:text-primary/50"
                                )} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer - Workspace mode indicator */}
            <div className="border-t p-3">
                <div className="rounded-lg bg-primary/5 p-2.5 text-[10px]">
                    <span className="font-semibold text-primary">Modo Paciente</span>
                    <p className="mt-0.5 text-muted-foreground">Workspace clínico ativo</p>
                </div>
            </div>
        </aside>
    );
}

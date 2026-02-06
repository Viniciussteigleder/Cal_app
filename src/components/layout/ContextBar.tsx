'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    ChevronRight,
    User,
    ArrowLeftRight,
    LogOut as ExitIcon,
    Lock,
    Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientContext, type Patient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContextBarProps {
    locked?: boolean;
}

export function ContextBar({ locked = false }: ContextBarProps) {
    const { patient, isLoading } = usePatientContext();
    const pathname = usePathname();
    const router = useRouter();

    const isPatientMode = !!patient;

    // Generate breadcrumbs from pathname
    const breadcrumbs = generateBreadcrumbs(pathname, patient);

    return (
        <div className={cn(
            "flex items-center justify-between gap-4 border-b px-4 md:px-6 py-2 text-sm",
            locked
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                : isPatientMode
                    ? "bg-primary/5 border-primary/10"
                    : "bg-muted/30 border-border/50"
        )}>
            {/* Left: Context + Breadcrumbs */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Context Label */}
                <Badge
                    variant={isPatientMode ? "default" : "secondary"}
                    className={cn(
                        "shrink-0 text-[10px] font-semibold uppercase tracking-wider",
                        isPatientMode && "bg-primary/90"
                    )}
                >
                    {isPatientMode ? 'Paciente' : 'Clínica'}
                </Badge>

                {/* Locked indicator */}
                {locked && (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 shrink-0">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Bloqueado</span>
                    </div>
                )}

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1 text-muted-foreground min-w-0 overflow-hidden" aria-label="Breadcrumbs">
                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={crumb.href || i}>
                            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />}
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="truncate text-xs hover:text-foreground transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="truncate text-xs text-foreground font-medium">
                                    {crumb.label}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            </div>

            {/* Right: Patient actions or Select Patient */}
            <div className="flex items-center gap-2 shrink-0">
                {isPatientMode ? (
                    <>
                        {/* Patient mini-card */}
                        <div className="hidden md:flex items-center gap-2 text-xs">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground max-w-[160px] truncate">
                                {patient?.name}
                            </span>
                            {patient?.lastUpdate && (
                                <span className="text-muted-foreground hidden lg:inline">
                                    <Calendar className="inline h-3 w-3 mr-0.5" />
                                    Ult.: {new Date(patient.lastUpdate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                </span>
                            )}
                        </div>

                        {/* Switch patient */}
                        {!locked && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => router.push('/studio/pacientes')}
                                aria-label="Trocar paciente"
                            >
                                <ArrowLeftRight className="h-3 w-3" />
                                <span className="hidden sm:inline">Trocar</span>
                            </Button>
                        )}

                        {/* Exit patient mode */}
                        {!locked && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 text-muted-foreground"
                                onClick={() => router.push('/studio/visao-geral')}
                                aria-label="Sair do paciente"
                            >
                                <ExitIcon className="h-3 w-3" />
                                <span className="hidden sm:inline">Sair</span>
                            </Button>
                        )}
                    </>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => router.push('/studio/pacientes')}
                    >
                        <User className="h-3 w-3" />
                        Selecionar paciente
                    </Button>
                )}
            </div>
        </div>
    );
}

// Patient Banner - persistent reminder on critical screens
export function PatientBanner({ patientName }: { patientName: string }) {
    return (
        <div className="bg-primary/5 border-b border-primary/10 px-4 md:px-6 py-1.5 text-center text-xs text-primary font-medium">
            Você está trabalhando em: <strong>{patientName}</strong>
        </div>
    );
}

// Breadcrumb generation
interface Breadcrumb {
    label: string;
    href?: string;
}

const ROUTE_LABELS: Record<string, string> = {
    'studio': 'NutriPlan',
    'visao-geral': 'Visão Geral',
    'agenda': 'Agenda',
    'pacientes': 'Pacientes',
    'materiais': 'Materiais',
    'relatorios': 'Relatórios',
    'financeiro': 'Financeiro',
    'configuracoes': 'Configurações',
    'dashboard': 'Painel',
    'calendario': 'Calendário',
    'tarefas': 'Tarefas',
    'retornos': 'Retornos',
    'historico': 'Histórico',
    'resumo': 'Resumo',
    'prontuario': 'Prontuário',
    'consultas': 'Consultas',
    'evolucao': 'Evolução',
    'anexos': 'Anexos',
    'transcricoes': 'Transcrições',
    'exames': 'Exames',
    'adicionar': 'Adicionar',
    'resultados': 'Resultados',
    'notas': 'Notas',
    'sugestoes': 'Sugestões',
    'antropometria': 'Antropometria',
    'medidas': 'Medidas',
    'bioimpedancia': 'Bioimpedância',
    'metas': 'Metas',
    'calculo-energetico': 'Cálculo Energético',
    'parametros': 'Parâmetros',
    'cenarios': 'Cenários',
    'macros': 'Macros',
    'plano-alimentar': 'Plano Alimentar',
    'atual': 'Atual',
    'montar': 'Montar',
    'aplicar-modelo': 'Aplicar Modelo',
    'lista-compras': 'Lista de Compras',
    'publicar': 'Publicar',
    'versoes': 'Versões',
    'prescricao': 'Prescrição',
    'itens': 'Itens',
    'dosagens': 'Dosagens',
    'alertas': 'Alertas',
    'documento': 'Documento',
    'assinar-enviar': 'Assinar & Enviar',
    'documentos': 'Documentos',
    'gerar': 'Gerar',
    'assinar': 'Assinar',
    'enviar': 'Enviar',
    'mensagens': 'Mensagens',
    'consulta': 'Consulta',
    'iniciar': 'Iniciar',
    'planos': 'Planos',
    'receitas': 'Receitas',
    'protocolos': 'Protocolos',
    'formularios': 'Formulários',
    'laminas': 'Lâminas',
    'clinica': 'Clínica',
    'programas': 'Programas',
    'exportacoes': 'Exportações',
    'auditoria': 'Auditoria',
    'faturamento': 'Faturamento',
    'pagamentos': 'Pagamentos',
    'assinaturas': 'Assinaturas',
    'custos': 'Custos',
    'perfil': 'Perfil',
    'equipe': 'Equipe',
    'integracoes': 'Integrações',
    'assinatura-digital': 'Assinatura Digital',
    'politicas-logs': 'Políticas & Logs',
    'ia-governanca': 'IA Governança',
    'link': 'Link',
    'segmentos': 'Segmentos',
    'onboarding': 'Onboarding',
    'easy-patient': 'Easy Patient',
    'novo': 'Novo',
    'indicadores': 'Indicadores',
    'overview': 'Visão Geral',
    'log': 'Diário & Sinais',
    'patients': 'Pacientes',
};

function generateBreadcrumbs(pathname: string, patient: Patient | null): Breadcrumb[] {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: Breadcrumb[] = [];

    let path = '';
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        path += '/' + seg;

        // Skip the 'studio' prefix, we show it as the first crumb
        if (i === 0 && seg === 'studio') {
            continue;
        }

        // If this is a patient ID (UUID-like), show patient name instead
        if (seg.match(/^[a-f0-9-]{8,}$/i) && patient) {
            crumbs.push({
                label: patient.name,
                href: i < segments.length - 1 ? path : undefined,
            });
            continue;
        }

        const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
        crumbs.push({
            label,
            href: i < segments.length - 1 ? path : undefined,
        });
    }

    return crumbs;
}

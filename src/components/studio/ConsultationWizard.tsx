'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ClipboardCheck,
    MessageSquare,
    UtensilsCrossed,
    CheckCircle2,
    ChevronRight,
    SkipForward,
    ExternalLink,
    Sparkles,
    Clock,
    FileText,
    Mic,
    Brain,
    Pill,
    Send,
    CalendarPlus,
    FileDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePatientContext } from '@/contexts/PatientContext';

type WizardStep = 'pre' | 'durante' | 'plano' | 'fechamento';

interface StepConfig {
    id: WizardStep;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const STEPS: StepConfig[] = [
    {
        id: 'pre',
        label: 'Pré-consulta',
        icon: ClipboardCheck,
        description: 'Revisar histórico, pendências e preparar a consulta',
    },
    {
        id: 'durante',
        label: 'Durante',
        icon: MessageSquare,
        description: 'Anotações, transcrição e registro da consulta',
    },
    {
        id: 'plano',
        label: 'Plano & Prescrição',
        icon: UtensilsCrossed,
        description: 'Plano alimentar, prescrição e ajustes',
    },
    {
        id: 'fechamento',
        label: 'Fechamento',
        icon: CheckCircle2,
        description: 'Documentos, envio e agendamento de retorno',
    },
];

interface ConsultationWizardProps {
    patientId: string;
    initialStep?: WizardStep;
}

export function ConsultationWizard({
    patientId,
    initialStep = 'pre',
}: ConsultationWizardProps) {
    const router = useRouter();
    const { patient } = usePatientContext();
    const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
    const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());

    const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

    const markComplete = (step: WizardStep) => {
        setCompletedSteps((prev) => new Set([...prev, step]));
    };

    const goToNext = () => {
        markComplete(currentStep);
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
            setCurrentStep(STEPS[nextIndex].id);
        }
    };

    const goToStep = (step: WizardStep) => {
        setCurrentStep(step);
    };

    const openTab = (path: string) => {
        router.push(`/studio/pacientes/${patientId}/${path}`);
    };

    return (
        <div className="space-y-6">
            {/* Step Progress Bar */}
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl">
                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.id === currentStep;
                    const isCompleted = completedSteps.has(step.id);

                    return (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => goToStep(step.id)}
                                className={cn(
                                    "flex items-center gap-2 flex-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-all",
                                    isActive
                                        ? "bg-background shadow-sm text-foreground"
                                        : isCompleted
                                            ? "text-primary hover:bg-background/50"
                                            : "text-muted-foreground hover:bg-background/30"
                                )}
                            >
                                <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : isCompleted
                                            ? "bg-primary/20 text-primary"
                                            : "bg-muted text-muted-foreground"
                                )}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className="hidden lg:inline truncate">{step.label}</span>
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {currentStep === 'pre' && (
                    <PreConsultaStep
                        patientId={patientId}
                        patientName={patient?.name || 'Paciente'}
                        onNext={goToNext}
                        onOpenTab={openTab}
                    />
                )}
                {currentStep === 'durante' && (
                    <DuranteStep
                        patientId={patientId}
                        onNext={goToNext}
                        onOpenTab={openTab}
                    />
                )}
                {currentStep === 'plano' && (
                    <PlanoStep
                        patientId={patientId}
                        onNext={goToNext}
                        onOpenTab={openTab}
                    />
                )}
                {currentStep === 'fechamento' && (
                    <FechamentoStep
                        patientId={patientId}
                        onOpenTab={openTab}
                    />
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground"
                    onClick={goToNext}
                    disabled={currentStepIndex >= STEPS.length - 1}
                >
                    <SkipForward className="h-3.5 w-3.5" />
                    Pular Etapa
                </Button>
                <div className="flex items-center gap-2">
                    {currentStepIndex < STEPS.length - 1 && (
                        <Button onClick={goToNext} size="sm" className="gap-1.5 text-xs">
                            Próxima Etapa
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Step 1: Pré-consulta ---
function PreConsultaStep({
    patientId,
    patientName,
    onNext,
    onOpenTab,
}: {
    patientId: string;
    patientName: string;
    onNext: () => void;
    onOpenTab: (path: string) => void;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Patient Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Resumo do Paciente</CardTitle>
                    <CardDescription>Dados recentes e pendências</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                        Dados do paciente serão carregados aqui: últimas medidas, condições ativas, e metas.
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => onOpenTab('resumo')}
                    >
                        <ExternalLink className="h-3 w-3" />
                        Abrir Resumo Completo
                    </Button>
                </CardContent>
            </Card>

            {/* Pending Items */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Pendências</CardTitle>
                    <CardDescription>Itens que requerem atenção</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                        Exames, medidas e documentos pendentes aparecerão aqui.
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => onOpenTab('exames')}>
                            <ExternalLink className="h-3 w-3" />
                            Exames
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => onOpenTab('prontuario')}>
                            <ExternalLink className="h-3 w-3" />
                            Prontuário
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* AI Actions */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <CardTitle className="text-sm">Ações IA</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <AIActionButton label="Gerar Pré-resumo" icon={Brain} />
                        <AIActionButton label="Sugerir Perguntas" icon={MessageSquare} />
                        <AIActionButton label="Sinalizar Riscos" icon={ClipboardCheck} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Step 2: Durante ---
function DuranteStep({
    patientId,
    onNext,
    onOpenTab,
}: {
    patientId: string;
    onNext: () => void;
    onOpenTab: (path: string) => void;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Structured Notes */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Anotações Estruturadas</CardTitle>
                    <CardDescription>ADIME / SOAP — registro da consulta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                        {['Avaliação (A)', 'Diagnóstico (D)', 'Intervenção (I)', 'Monitoramento (M/E)'].map((section) => (
                            <div key={section} className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{section}</label>
                                <textarea
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder={`Registrar ${section.toLowerCase()}...`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Clock className="h-3 w-3" />
                            Timer
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onOpenTab('prontuario')}>
                            <ExternalLink className="h-3 w-3" />
                            Abrir Prontuário
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* AI Actions */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <CardTitle className="text-sm">Ações IA</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <AIActionButton label="Transcrever" icon={Mic} />
                        <AIActionButton label="Organizar Notas" icon={FileText} />
                        <AIActionButton label="Gerar Evolução (Rascunho)" icon={Brain} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Step 3: Plano & Prescrição ---
function PlanoStep({
    patientId,
    onNext,
    onOpenTab,
}: {
    patientId: string;
    onNext: () => void;
    onOpenTab: (path: string) => void;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Meal Plan */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Plano Alimentar</CardTitle>
                    <CardDescription>Acesso rápido ao plano e comparação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                        O plano atual e anterior estarão disponíveis para comparação aqui.
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => onOpenTab('plano-alimentar')}
                    >
                        <ExternalLink className="h-3 w-3" />
                        Abrir Plano Alimentar
                    </Button>
                </CardContent>
            </Card>

            {/* Prescription */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Prescrição</CardTitle>
                    <CardDescription>Suplementos e dosagens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                        Prescrição atual e sugestões estarão disponíveis aqui.
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => onOpenTab('prescricao')}
                    >
                        <ExternalLink className="h-3 w-3" />
                        Abrir Prescrição
                    </Button>
                </CardContent>
            </Card>

            {/* AI Actions */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <CardTitle className="text-sm">Ações IA</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <AIActionButton label="Gerar Plano (Rascunho)" icon={UtensilsCrossed} />
                        <AIActionButton label="Gerar Variações" icon={Brain} />
                        <AIActionButton label="Sugerir Prescrição" icon={Pill} />
                        <AIActionButton label="Checagem de Conflitos" icon={ClipboardCheck} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Step 4: Fechamento ---
function FechamentoStep({
    patientId,
    onOpenTab,
}: {
    patientId: string;
    onOpenTab: (path: string) => void;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Checklist */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Checklist de Fechamento</CardTitle>
                    <CardDescription>Verifique antes de encerrar a consulta</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[
                            { label: 'Documento de orientações gerado', icon: FileText },
                            { label: 'Documento assinado', icon: CheckCircle2 },
                            { label: 'Enviado ao paciente', icon: Send },
                            { label: 'Retorno agendado', icon: CalendarPlus },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <label key={item.label} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input type="checkbox" className="rounded border-border" />
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{item.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ações Finais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" onClick={() => onOpenTab('documentos/gerar')}>
                        <FileDown className="h-3.5 w-3.5" />
                        Gerar PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" onClick={() => onOpenTab('documentos/assinar')}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Assinar & Enviar
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Agendar Retorno
                    </Button>
                </CardContent>
            </Card>

            {/* AI Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <CardTitle className="text-sm">Ações IA</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <AIActionButton label="Gerar Orientações" icon={FileText} />
                        <AIActionButton label="Resumo Final" icon={Brain} />
                        <AIActionButton label="Mensagem Sugerida" icon={MessageSquare} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Reusable AI Action Button ---
function AIActionButton({
    label,
    icon: Icon,
    cost,
    onClick,
}: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    cost?: string;
    onClick?: () => void;
}) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="gap-1.5 text-xs border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-violet-700 dark:text-violet-300"
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {cost && (
                <span className="text-[9px] text-muted-foreground ml-1">~{cost}</span>
            )}
        </Button>
    );
}

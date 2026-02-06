'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { usePatientContext } from '@/contexts/PatientContext';

interface PatientConfirmationModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    onSwitchPatient?: () => void;
    actionLabel: string;
    actionDescription?: string;
}

/**
 * Guardrail 1 — Patient confirmation for critical actions.
 *
 * Shown before: applying content to prontuário, signing documents,
 * sending via WhatsApp, publishing plans, saving final prescriptions.
 */
export function PatientConfirmationModal({
    open,
    onConfirm,
    onCancel,
    onSwitchPatient,
    actionLabel,
    actionDescription,
}: PatientConfirmationModalProps) {
    const { patient } = usePatientContext();

    if (!patient) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <DialogTitle>Confirmar Paciente</DialogTitle>
                    </div>
                    <DialogDescription>
                        {actionDescription || 'Verifique se o paciente correto está selecionado antes de prosseguir.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Patient Card */}
                <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-base font-semibold truncate">{patient.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span>ID: {patient.id.slice(0, 8)}</span>
                                {patient.email && <span>{patient.email}</span>}
                            </div>
                            {patient.lastUpdate && (
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Última consulta: {new Date(patient.lastUpdate).toLocaleDateString('pt-BR')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warning text */}
                <p className="text-sm text-muted-foreground">
                    Esta ação será registrada no prontuário de{' '}
                    <strong className="text-foreground">{patient.name}</strong>.
                </p>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onCancel} className="text-sm">
                        Cancelar
                    </Button>
                    {onSwitchPatient && (
                        <Button
                            variant="outline"
                            onClick={onSwitchPatient}
                            className="gap-1.5 text-sm"
                        >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                            Trocar Paciente
                        </Button>
                    )}
                    <Button onClick={onConfirm} className="text-sm">
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Guardrail 2 — AI Draft wrapper.
 * Wraps AI-generated output with draft status and action buttons.
 */
interface AIDraftWrapperProps {
    children: React.ReactNode;
    onApply: () => void;
    onEdit: () => void;
    onViewSources?: () => void;
    label?: string;
    cost?: string;
}

export function AIDraftWrapper({
    children,
    onApply,
    onEdit,
    onViewSources,
    label = 'Rascunho gerado por IA',
    cost,
}: AIDraftWrapperProps) {
    return (
        <div className="rounded-lg border-2 border-dashed border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-950/10">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-200/50 dark:border-violet-800/50">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">IA</span>
                    </div>
                    <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                        {label}
                    </span>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        Rascunho
                    </span>
                </div>
                {cost && (
                    <span className="text-[10px] text-muted-foreground">
                        ~{cost}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">{children}</div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-violet-200/50 dark:border-violet-800/50">
                <div>
                    {onViewSources && (
                        <button
                            onClick={onViewSources}
                            className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline"
                        >
                            Ver fontes usadas
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onEdit} className="h-7 text-xs">
                        Editar
                    </Button>
                    <Button size="sm" onClick={onApply} className="h-7 text-xs">
                        Aplicar
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Guardrail 3 — Safe switch modal.
 * Shown when user tries to switch patient with unsaved changes.
 */
interface SafeSwitchModalProps {
    open: boolean;
    onSaveDraft: () => void;
    onDiscard: () => void;
    onCancel: () => void;
}

export function SafeSwitchModal({
    open,
    onSaveDraft,
    onDiscard,
    onCancel,
}: SafeSwitchModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Alterações não salvas</DialogTitle>
                    <DialogDescription>
                        Você tem edições em andamento. O que deseja fazer?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button onClick={onSaveDraft} className="w-full">
                        Salvar Rascunho
                    </Button>
                    <Button variant="outline" onClick={onDiscard} className="w-full">
                        Descartar Alterações
                    </Button>
                    <Button variant="ghost" onClick={onCancel} className="w-full text-sm">
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

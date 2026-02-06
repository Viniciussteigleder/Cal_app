'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Calculator,
    Mic,
    UtensilsCrossed,
    FileText,
    FileEdit,
    Search,
    Play,
    X,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuickAction {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    action?: () => void;
    isAI?: boolean;
}

interface QuickAccessPanelProps {
    open: boolean;
    onClose: () => void;
}

export function QuickAccessPanel({ open, onClose }: QuickAccessPanelProps) {
    const router = useRouter();

    const quickActions: QuickAction[] = [
        {
            id: 'calcular-energia',
            label: 'Calcular Energia',
            description: 'Cálculo energético rápido sem paciente',
            icon: Calculator,
            href: '/studio/calculations',
        },
        {
            id: 'transcricao',
            label: 'Transcrição ao Vivo',
            description: 'Transcrever e depois atribuir a paciente',
            icon: Mic,
            isAI: true,
        },
        {
            id: 'criar-receita',
            label: 'Criar Receita (IA)',
            description: 'Gera receita e salva em Materiais',
            icon: UtensilsCrossed,
            href: '/studio/materiais/receitas',
            isAI: true,
        },
        {
            id: 'criar-plano',
            label: 'Criar Plano-Modelo (IA)',
            description: 'Gera modelo de plano alimentar',
            icon: FileText,
            href: '/studio/materiais/planos',
            isAI: true,
        },
        {
            id: 'gerar-documento',
            label: 'Gerar Documento',
            description: 'Template de documento como rascunho',
            icon: FileEdit,
            href: '/studio/materiais/documentos',
        },
        {
            id: 'buscar-paciente',
            label: 'Buscar Paciente',
            description: 'Localizar paciente pelo nome ou ID',
            icon: Search,
            href: '/studio/pacientes',
        },
        {
            id: 'iniciar-consulta',
            label: 'Iniciar Consulta',
            description: 'Selecionar paciente e iniciar consulta',
            icon: Play,
            href: '/studio/pacientes',
        },
    ];

    const handleAction = (action: QuickAction) => {
        if (action.href) {
            router.push(action.href);
        }
        if (action.action) {
            action.action();
        }
        onClose();
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="fixed right-4 top-16 z-50 w-80 rounded-xl border bg-popover shadow-xl animate-in slide-in-from-top-2 fade-in-0 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="text-sm font-semibold">Acesso Rápido</h3>
                    <button
                        onClick={onClose}
                        className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
                        aria-label="Fechar acesso rápido"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Actions */}
                <div className="p-2 space-y-0.5 max-h-[60vh] overflow-y-auto">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.id}
                                onClick={() => handleAction(action)}
                                className="flex items-start gap-3 w-full rounded-lg px-3 py-2.5 text-left hover:bg-muted transition-colors group"
                            >
                                <div className={cn(
                                    "mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                    action.isAI
                                        ? "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-medium group-hover:text-foreground">
                                            {action.label}
                                        </span>
                                        {action.isAI && (
                                            <Sparkles className="h-3 w-3 text-violet-500" />
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                                        {action.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer note */}
                <div className="px-4 py-2.5 border-t text-[10px] text-muted-foreground">
                    Ações no modo global geram <strong>rascunhos</strong>. Atribua a um paciente para aplicar.
                </div>
            </div>
        </>
    );
}

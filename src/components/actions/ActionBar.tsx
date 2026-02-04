'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Edit2,
    Trash2,
    Upload,
    Download,
    Share2,
    History,
    FileText,
    Save,
    X,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ActionType =
    | 'add'
    | 'edit'
    | 'delete'
    | 'upload'
    | 'export'
    | 'share'
    | 'audit'
    | 'save'
    | 'cancel'
    | 'custom';

export interface ActionItem {
    type: ActionType;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    icon?: React.ReactNode;
    requiresConfirmation?: boolean;
    confirmationTitle?: string;
    confirmationDescription?: string;
}

interface ActionBarProps {
    actions: ActionItem[];
    className?: string;
}

export function ActionBar({ actions, className }: ActionBarProps) {
    const getIcon = (type: ActionType, customIcon?: React.ReactNode) => {
        if (customIcon) return customIcon;

        switch (type) {
            case 'add': return <Plus className="mr-2 h-4 w-4" />;
            case 'edit': return <Edit2 className="mr-2 h-4 w-4" />;
            case 'delete': return <Trash2 className="mr-2 h-4 w-4" />;
            case 'upload': return <Upload className="mr-2 h-4 w-4" />;
            case 'export': return <Download className="mr-2 h-4 w-4" />;
            case 'share': return <Share2 className="mr-2 h-4 w-4" />;
            case 'audit': return <History className="mr-2 h-4 w-4" />;
            case 'save': return <Save className="mr-2 h-4 w-4" />;
            case 'cancel': return <X className="mr-2 h-4 w-4" />;
            case 'custom': return <FileText className="mr-2 h-4 w-4" />;
            default: return null;
        }
    };

    const getDefaultVariant = (type: ActionType) => {
        switch (type) {
            case 'delete': return 'destructive';
            case 'save': return 'default';
            case 'add': return 'default';
            case 'cancel': return 'ghost';
            default: return 'outline';
        }
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <TooltipProvider>
                {actions.map((action, index) => {
                    const variant = action.variant || getDefaultVariant(action.type);
                    const icon = getIcon(action.type, action.icon);

                    if (action.requiresConfirmation) {
                        return (
                            <AlertDialog key={`${action.type}-${index}`}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Button variant={variant} disabled={action.disabled || action.loading}>
                                                {action.loading ? (
                                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : icon}
                                                {action.label}
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{action.label}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {action.confirmationTitle || 'Tem certeza?'}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {action.confirmationDescription || 'Esta ação não pode ser desfeita.'}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={action.onClick}
                                            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                                        >
                                            Confirmar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        );
                    }

                    return (
                        <Button
                            key={`${action.type}-${index}`}
                            variant={variant}
                            onClick={action.onClick}
                            disabled={action.disabled || action.loading}
                        >
                            {action.loading ? (
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : icon}
                            {action.label}
                        </Button>
                    );
                })}
            </TooltipProvider>
        </div>
    );
}

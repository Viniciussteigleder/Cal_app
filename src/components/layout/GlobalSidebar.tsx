'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Users,
    FolderOpen,
    BarChart3,
    DollarSign,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ListTodo,
    Brain,
    Sparkles,
    FileText,
    UtensilsCrossed,
    ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    children?: NavItem[];
    badge?: string;
}

const GLOBAL_NAV: NavItem[] = [
    {
        id: 'visao-geral',
        label: 'Visão Geral',
        icon: LayoutDashboard,
        href: '/studio/dashboard',
    },
    {
        id: 'agenda',
        label: 'Agenda',
        icon: Calendar,
        href: '/studio/planner',
        children: [{ id: 'planner', label: 'Planner', icon: ListTodo, href: '/studio/planner' }],
    },
    {
        id: 'pacientes',
        label: 'Pacientes',
        icon: Users,
        href: '/studio/patients',
    },
    {
        id: 'materiais',
        label: 'Materiais',
        icon: FolderOpen,
        href: '/studio/templates',
        children: [
            { id: 'templates', label: 'Templates', icon: FileText, href: '/studio/templates' },
            { id: 'protocolos', label: 'Protocolos', icon: ClipboardList, href: '/studio/protocols' },
            { id: 'receitas', label: 'Receitas', icon: UtensilsCrossed, href: '/studio/recipes' },
            { id: 'documentos', label: 'Documentos', icon: FileText, href: '/studio/document-templates' },
            { id: 'diario', label: 'Diário (Visual)', icon: FileText, href: '/studio/diary' },
        ],
    },
    {
        id: 'ai',
        label: 'IA',
        icon: Sparkles,
        href: '/studio/ai',
    },
    {
        id: 'relatorios',
        label: 'Relatórios',
        icon: BarChart3,
        href: '/studio/relatorios',
    },
    {
        id: 'financeiro',
        label: 'Financeiro',
        icon: DollarSign,
        href: '/studio/financeiro',
    },
    {
        id: 'configuracoes',
        label: 'Configurações',
        icon: Settings,
        href: '/studio/settings/ai-agents',
        children: [
            { id: 'ai-agents', label: 'AI Agents', icon: Brain, href: '/studio/settings/ai-agents' },
            { id: 'ai-providers', label: 'Provedores', icon: Brain, href: '/studio/settings/ai-providers' },
            { id: 'letterhead', label: 'Papel Timbrado', icon: FileText, href: '/studio/settings/letterhead' },
            { id: 'logs', label: 'Logs', icon: FileText, href: '/studio/logs' },
        ],
    },
];

export function GlobalSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
        // Auto-expand the section that matches the current path
        const active = GLOBAL_NAV.find(
            (item) => pathname.startsWith(item.href)
        );
        return new Set(active ? [active.id] : ['visao-geral']);
    });

    const toggleSection = (id: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const isActive = (href: string) => {
        if (href === '/studio/dashboard' && pathname === '/studio/dashboard') return true;
        if (href === '/studio/patients' && pathname === '/studio/patients') return true;
        return pathname === href;
    };

    const isSectionActive = (item: NavItem) => {
        return pathname.startsWith(item.href);
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "hidden md:flex md:flex-col h-screen border-r border-border bg-card transition-all duration-300 shrink-0",
                    collapsed ? "w-[60px]" : "w-[260px]"
                )}
                aria-label="Navegação principal"
            >
                {/* Collapse/Expand Toggle */}
                <div className="flex items-center justify-end p-2 border-b border-border/50">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
                        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2 px-2">
                    {GLOBAL_NAV.map((item) => {
                        const Icon = item.icon;
                        const sectionActive = isSectionActive(item);
                        const isExpanded = expandedSections.has(item.id);

                        if (collapsed) {
                            return (
                                <Tooltip key={item.id}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center justify-center h-10 w-full rounded-lg mb-1 transition-colors",
                                                sectionActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                            aria-label={item.label}
                                            aria-current={sectionActive ? "page" : undefined}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="font-medium">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return (
                            <div key={item.id} className="mb-0.5">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(item.id)}
                                    className={cn(
                                        "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        sectionActive
                                            ? "text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                    aria-expanded={isExpanded}
                                >
                                    <Icon className={cn("h-4.5 w-4.5 shrink-0", sectionActive && "text-primary")} />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.children && (
                                        <ChevronDown className={cn(
                                            "h-3.5 w-3.5 shrink-0 transition-transform text-muted-foreground/60",
                                            isExpanded && "rotate-180"
                                        )} />
                                    )}
                                </button>

                                {/* Sub-items */}
                                {item.children && isExpanded && (
                                    <div className="ml-4 pl-3 border-l border-border/50 mt-0.5 mb-1 space-y-0.5">
                                        {item.children.map((child) => {
                                            const active = isActive(child.href);
                                            return (
                                                <Link
                                                    key={child.id}
                                                    href={child.href}
                                                    className={cn(
                                                        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                                                        active
                                                            ? "bg-primary/10 text-primary"
                                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    )}
                                                    aria-current={active ? "page" : undefined}
                                                >
                                                    <span>{child.label}</span>
                                                    {child.badge && (
                                                        <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary font-semibold">
                                                            {child.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                {!collapsed && (
                    <div className="border-t p-3">
                        <div className="rounded-lg bg-muted/50 p-2.5 text-[10px] text-muted-foreground">
                            <span className="font-semibold text-primary">Modo Clínica</span>
                            <p className="mt-0.5">Gestão, agenda e materiais</p>
                        </div>
                    </div>
                )}
            </aside>
        </TooltipProvider>
    );
}

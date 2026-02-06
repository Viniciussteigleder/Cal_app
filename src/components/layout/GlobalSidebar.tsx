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
    Bell,
    Gauge,
    CalendarDays,
    ListTodo,
    RotateCcw,
    History,
    LinkIcon,
    UserPlus,
    Tags,
    Smartphone,
    FileText,
    UtensilsCrossed,
    BookOpen,
    ClipboardList,
    Image,
    FileEdit,
    Building2,
    TrendingUp,
    Download,
    ShieldCheck,
    Receipt,
    CreditCard,
    Package,
    Coins,
    UserCircle,
    UsersRound,
    Plug,
    Stamp,
    ScrollText,
    Brain,
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
        href: '/studio/visao-geral',
        children: [
            { id: 'painel', label: 'Painel', icon: Gauge, href: '/studio/visao-geral' },
            { id: 'alertas', label: 'Alertas & Pendências', icon: Bell, href: '/studio/visao-geral/alertas' },
            { id: 'indicadores', label: 'Indicadores', icon: TrendingUp, href: '/studio/visao-geral/indicadores' },
        ],
    },
    {
        id: 'agenda',
        label: 'Agenda',
        icon: Calendar,
        href: '/studio/agenda',
        children: [
            { id: 'calendario', label: 'Calendário', icon: CalendarDays, href: '/studio/agenda/calendario' },
            { id: 'tarefas', label: 'Tarefas', icon: ListTodo, href: '/studio/agenda/tarefas' },
            { id: 'retornos', label: 'Retornos', icon: RotateCcw, href: '/studio/agenda/retornos' },
            { id: 'ag-historico', label: 'Histórico', icon: History, href: '/studio/agenda/historico' },
            { id: 'link', label: 'Link de Agendamento', icon: LinkIcon, href: '/studio/agenda/link' },
        ],
    },
    {
        id: 'pacientes',
        label: 'Pacientes',
        icon: Users,
        href: '/studio/pacientes',
        children: [
            { id: 'lista', label: 'Lista de Pacientes', icon: Users, href: '/studio/pacientes' },
            { id: 'novo', label: 'Novo Paciente', icon: UserPlus, href: '/studio/pacientes/novo' },
            { id: 'segmentos', label: 'Segmentos & Tags', icon: Tags, href: '/studio/pacientes/segmentos' },
            { id: 'onboarding', label: 'Onboarding', icon: ClipboardList, href: '/studio/pacientes/onboarding' },
            { id: 'easy-patient', label: 'Easy Patient (App)', icon: Smartphone, href: '/studio/pacientes/easy-patient' },
        ],
    },
    {
        id: 'materiais',
        label: 'Materiais',
        icon: FolderOpen,
        href: '/studio/materiais',
        children: [
            { id: 'planos', label: 'Planos (Modelos)', icon: FileText, href: '/studio/materiais/planos' },
            { id: 'receitas', label: 'Receitas', icon: UtensilsCrossed, href: '/studio/materiais/receitas' },
            { id: 'protocolos', label: 'Protocolos', icon: BookOpen, href: '/studio/materiais/protocolos' },
            { id: 'formularios', label: 'Formulários', icon: ClipboardList, href: '/studio/materiais/formularios' },
            { id: 'laminas', label: 'Lâminas Educativas', icon: Image, href: '/studio/materiais/laminas' },
            { id: 'mat-documentos', label: 'Modelos de Documentos', icon: FileEdit, href: '/studio/materiais/documentos' },
        ],
    },
    {
        id: 'relatorios',
        label: 'Relatórios',
        icon: BarChart3,
        href: '/studio/relatorios',
        children: [
            { id: 'clinica', label: 'Relatórios da Clínica', icon: Building2, href: '/studio/relatorios/clinica' },
            { id: 'programas', label: 'Por Programa', icon: TrendingUp, href: '/studio/relatorios/programas' },
            { id: 'exportacoes', label: 'Exportações', icon: Download, href: '/studio/relatorios/exportacoes' },
            { id: 'rel-auditoria', label: 'Auditoria & Qualidade', icon: ShieldCheck, href: '/studio/relatorios/auditoria' },
        ],
    },
    {
        id: 'financeiro',
        label: 'Financeiro',
        icon: DollarSign,
        href: '/studio/financeiro',
        children: [
            { id: 'faturamento', label: 'Faturamento', icon: Receipt, href: '/studio/financeiro/faturamento' },
            { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard, href: '/studio/financeiro/pagamentos' },
            { id: 'assinaturas', label: 'Planos & Assinaturas', icon: Package, href: '/studio/financeiro/assinaturas' },
            { id: 'custos', label: 'Custos (incl. IA)', icon: Coins, href: '/studio/financeiro/custos' },
        ],
    },
    {
        id: 'configuracoes',
        label: 'Configurações',
        icon: Settings,
        href: '/studio/configuracoes',
        children: [
            { id: 'perfil', label: 'Perfil & Preferências', icon: UserCircle, href: '/studio/configuracoes/perfil' },
            { id: 'equipe', label: 'Equipe & Permissões', icon: UsersRound, href: '/studio/configuracoes/equipe' },
            { id: 'integracoes', label: 'Integrações', icon: Plug, href: '/studio/configuracoes/integracoes' },
            { id: 'assinatura-digital', label: 'Assinatura Digital', icon: Stamp, href: '/studio/configuracoes/assinatura-digital' },
            { id: 'politicas-logs', label: 'Políticas & Logs', icon: ScrollText, href: '/studio/configuracoes/politicas-logs' },
            { id: 'ia-governanca', label: 'IA (Governança)', icon: Brain, href: '/studio/configuracoes/ia-governanca' },
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
        if (href === '/studio/visao-geral' && pathname === '/studio/visao-geral') return true;
        if (href === '/studio/pacientes' && pathname === '/studio/pacientes') return true;
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

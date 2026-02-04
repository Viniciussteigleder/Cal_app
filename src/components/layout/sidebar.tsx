"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Utensils,
    Calendar,
    TrendingUp,
    Activity,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    Snowflake,
    Users,
    FileText,
    BookOpen,
    ClipboardList,
    Building2,
    Database,
    ShieldCheck,
    MessageSquare,
    Brain,
    Sparkles,
    Droplet,
    Dumbbell,
    Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { useUser } from "@/components/user-provider";

interface SidebarProps {
    role: "patient" | "nutritionist" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useUser();

    const patientLinks = [
        { href: "/patient/today", label: "Hoje", icon: Home },
        { href: "/patient/capture", label: "Registrar", icon: Utensils },
        { href: "/patient/plan", label: "Meu Plano", icon: Calendar },
        { href: "/patient/progress", label: "Progresso", icon: TrendingUp },
        { href: "/patient/water", label: "Hidratação", icon: Droplet },
        { href: "/patient/exercise", label: "Exercícios", icon: Dumbbell },
        { href: "/patient/symptoms", label: "Sintomas", icon: Activity },
        { href: "/patient/chat", label: "Chat", icon: MessageSquare },
    ];

    const nutritionistLinks = [
        { href: "/studio/dashboard", label: "Dashboard", icon: Home },
        { href: "/studio/patients", label: "Pacientes", icon: Users },
        { href: "/studio/ai", label: "IA Features", icon: Sparkles },
        { href: "/studio/ai-workflows", label: "AI Workflows", icon: Brain },
        { href: "/studio/ai/clinical-mdt", label: "MDT Clínico", icon: Stethoscope },
        { href: "/studio/chat", label: "Chat IA", icon: MessageSquare },
        { href: "/studio/protocols", label: "Protocolos", icon: FileText },
        { href: "/studio/recipes", label: "Receitas", icon: BookOpen },
        { href: "/studio/templates", label: "Templates", icon: ClipboardList },
    ];

    const adminLinks = [
        { href: "/owner/tenants", label: "Clínicas", icon: Building2 },
        { href: "/owner/users", label: "Usuários", icon: Users },
        { href: "/owner/ai", label: "Gestão IA", icon: Brain },
        { href: "/owner/datasets", label: "Datasets", icon: Database },
        { href: "/owner/integrity", label: "Integridade", icon: ShieldCheck },
    ];

    const links = role === "patient" ? patientLinks : role === "admin" ? adminLinks : nutritionistLinks;

    return (
        <TooltipProvider>
            <aside
                className={cn(
                    "hidden border-r border-border bg-card transition-all duration-300 md:flex md:flex-col sticky top-0 h-screen overflow-y-auto",
                    collapsed ? "w-[72px]" : "w-[280px]"
                )}
                aria-label="Main navigation"
            >
                <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
                    <div className={cn("flex items-center gap-2 font-bold text-xl text-primary transition-opacity", collapsed ? "opacity-0 w-0 hidden" : "opacity-100")} aria-label="NutriPlan home">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">NP</div>
                        <span>NutriPlan</span>
                    </div>
                    {collapsed && (
                        <div className="mx-auto h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold" aria-label="NutriPlan">N</div>
                    )}
                    {/* Collapse button - shows when expanded */}
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto"
                            onClick={() => setCollapsed(true)}
                            title="Recolher menu"
                            aria-label="Collapse navigation sidebar"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                    {/* Expand button - shows when collapsed */}
                    {collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto"
                            onClick={() => setCollapsed(false)}
                            title="Expandir menu"
                            aria-label="Expand navigation sidebar"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex-1 py-6 flex flex-col gap-1 px-3">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    collapsed && "justify-center px-2"
                                )}
                                aria-label={link.label}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
                                {!collapsed && <span>{link.label}</span>}
                                {isActive && !collapsed && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-white/50" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-t border-border p-3 flex flex-col gap-1">
                    {/* Feature Toggles (Simple Mode & Dark Mode) */}
                    <div className={cn("px-3 py-2 space-y-3 mb-2", collapsed && "px-0 items-center flex flex-col")}>
                        {!collapsed && <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-2">Preferências</p>}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className={cn("h-4 w-4 text-muted-foreground", !collapsed && "mr-0")} />
                                {!collapsed && <label htmlFor="simple-mode" className="text-xs font-medium text-foreground">Modo Simples</label>}
                            </div>
                            {!collapsed && (
                                <Switch
                                    id="simple-mode"
                                    className="scale-75"
                                    aria-label="Toggle simple mode"
                                    onCheckedChange={(checked) => {
                                        localStorage.setItem('simple-mode', checked ? 'true' : 'false');
                                        window.dispatchEvent(new Event('storage'));
                                    }}
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Snowflake className={cn("h-4 w-4 text-muted-foreground", !collapsed && "mr-0")} />
                                {!collapsed && <label htmlFor="dark-mode" className="text-xs font-medium text-foreground">Modo Escuro</label>}
                            </div>
                            {!collapsed && (
                                <Switch
                                    id="dark-mode"
                                    className="scale-75"
                                    aria-label="Toggle dark mode"
                                    onCheckedChange={(checked) => {
                                        document.documentElement.classList.toggle('dark', checked);
                                        localStorage.setItem('dark-mode', checked ? 'true' : 'false');
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <Link
                        href={role === "patient" ? "/patient/settings" : "/studio/settings"}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
                            collapsed && "justify-center px-2"
                        )}
                        aria-label="Settings"
                    >
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        {!collapsed && <span>Configurações</span>}
                    </Link>
                    <button
                        onClick={logout}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-all w-full",
                            collapsed && "justify-center px-2"
                        )}
                        aria-label="Logout"
                    >
                        <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                        {!collapsed && <span>Sair</span>}
                    </button>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn("mt-4 flex items-center gap-3 px-1 cursor-help", collapsed && "justify-center")}>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {user?.name?.charAt(0) || "U"}
                                </div>
                                {!collapsed && (
                                    <div className="overflow-hidden flex-1">
                                        <p className="truncate text-sm font-medium">{user?.name || "Usuário"}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {user?.role === "PATIENT" ? "Paciente" :
                                                user?.role === "OWNER" ? "Administrador" : "Nutricionista"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <div className="text-xs">
                                <p className="font-semibold">{user?.name || "Usuário"}</p>
                                <p className="text-muted-foreground">
                                    {user?.role === "PATIENT" ? "Paciente" :
                                        user?.role === "OWNER" ? "Administrador" : "Nutricionista"}
                                </p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </aside>
        </TooltipProvider>
    );
}

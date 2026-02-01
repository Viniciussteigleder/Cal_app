"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Utensils,
    Calendar,
    TrendingUp,
    Activity,
    MessageSquare,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
    role: "patient" | "nutritionist" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const patientLinks = [
        { href: "/patient/dashboard", label: "Início", icon: Home },
        { href: "/patient/diary", label: "Diário Alimentar", icon: Utensils },
        { href: "/patient/plan", label: "Meu Plano", icon: Calendar },
        { href: "/patient/progress", label: "Progresso", icon: TrendingUp },
        { href: "/patient/symptoms", label: "Sintomas", icon: Activity },
    ];

    const nutritionistLinks = [
        { href: "/studio/dashboard", label: "Dashboard", icon: Home }, // Using Home for consistency in this example
        { href: "/studio/patients", label: "Pacientes", icon: User },
        // Add other links per brief
    ];

    const links = role === "patient" ? patientLinks : nutritionistLinks;

    return (
        <aside
            className={cn(
                "hidden border-r border-border bg-white transition-all duration-300 md:flex md:flex-col sticky top-0 h-screen overflow-y-auto",
                collapsed ? "w-[72px]" : "w-[280px]"
            )}
        >
            <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
                <div className={cn("flex items-center gap-2 font-bold text-xl text-primary transition-opacity", collapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">NP</div>
                    <span>NutriPlan</span>
                </div>
                {collapsed && (
                    <div className="mx-auto h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">N</div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("ml-auto hidden", !collapsed && "flex")}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
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
                                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500")} />
                            {!collapsed && <span>{link.label}</span>}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1 h-1 rounded-full bg-white/50" />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="border-t border-border p-3 flex flex-col gap-1">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-slate-50 hover:text-foreground transition-all",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <Settings className="h-5 w-5 text-slate-500" />
                    {!collapsed && <span>Configurações</span>}
                </Link>
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-slate-50 hover:text-destructive transition-all",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <LogOut className="h-5 w-5 text-slate-500 hover:text-destructive" />
                    {!collapsed && <span>Sair</span>}
                </Link>

                <div className={cn("mt-4 flex items-center gap-3 px-1", collapsed && "justify-center")}>
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium">Maria Sola</p>
                            <p className="truncate text-xs text-muted-foreground">Paciente</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

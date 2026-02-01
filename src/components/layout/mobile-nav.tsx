"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Calendar,
    TrendingUp,
    Menu,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
    role: "patient" | "nutritionist";
}

export function MobileNav({ role }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-center justify-between border-t border-border bg-card px-6 pb-safe shadow-elevated md:hidden">
            <Link
                href="/patient/dashboard"
                className={cn("flex flex-col items-center gap-1", pathname === "/patient/dashboard" ? "text-primary" : "text-muted-foreground")}
            >
                <Home className="h-6 w-6" />
                <span className={cn("text-[10px] font-medium", pathname === "/patient/dashboard" ? "font-bold" : "")}>Início</span>
            </Link>

            <Link
                href="/patient/plan"
                className={cn("flex flex-col items-center gap-1", pathname.includes("plan") ? "text-primary" : "text-muted-foreground")}
            >
                <Calendar className="h-6 w-6" />
                <span className="text-[10px] font-medium">Plano</span>
            </Link>

            <div className="-mt-8">
                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95">
                    <Plus className="h-8 w-8" />
                </button>
            </div>

            <Link
                href="/patient/progress"
                className={cn("flex flex-col items-center gap-1", pathname.includes("progress") ? "text-primary" : "text-muted-foreground")}
            >
                <TrendingUp className="h-6 w-6" />
                <span className="text-[10px] font-medium">Progresso</span>
            </Link>

            <button
                className="flex flex-col items-center gap-1 text-muted-foreground"
            >
                <Menu className="h-6 w-6" />
                <span className="text-[10px] font-medium">Mais</span>
            </button>
        </div>
    );
}

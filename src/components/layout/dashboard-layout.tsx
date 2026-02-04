import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import DevSessionBridge from "@/components/dev-session-bridge";

interface DashboardLayoutProps {
    children: React.ReactNode;
    role?: "patient" | "nutritionist" | "admin";
}

export default function DashboardLayout({ children, role = "patient" }: DashboardLayoutProps) {
    const devRole = role === "admin" ? "OWNER" : role === "nutritionist" ? "TENANT_ADMIN" : "PATIENT";
    return (
        <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Skip to content link for keyboard navigation (WCAG 2.1) */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
                Pular para o conteúdo principal
            </a>
            <DevSessionBridge role={devRole} />
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col min-h-screen pb-[72px] md:pb-0">
                <main id="main-content" className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
            <MobileNav role={role === "admin" ? "nutritionist" : role} />
        </div>
    );
}

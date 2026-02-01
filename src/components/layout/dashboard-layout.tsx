import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

interface DashboardLayoutProps {
    children: React.ReactNode;
    role?: "patient" | "nutritionist" | "admin";
}

export default function DashboardLayout({ children, role = "patient" }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/60 via-slate-50 to-white">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col min-h-screen pb-[72px] md:pb-0">
                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
            <MobileNav role={role === "admin" ? "nutritionist" : role} />
        </div>
    );
}

import Link from "next/link";

import { cn } from "@/lib/utils";
import DevSessionBridge from "@/components/dev-session-bridge";

interface NavItem {
  href: string;
  label: string;
}

interface PortalShellProps {
  title: string;
  subtitle: string;
  nav: NavItem[];
  devRole: "OWNER" | "TENANT_ADMIN" | "TEAM" | "PATIENT";
  children: React.ReactNode;
}

export function PortalShell({
  title,
  subtitle,
  nav,
  children,
  devRole,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DevSessionBridge role={devRole} />
      <header className="border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              NutriPlan
            </p>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <nav className="flex flex-wrap gap-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border border-border/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

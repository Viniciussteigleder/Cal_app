import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireNutritionist } from "@/lib/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function statusTone(status?: string | null) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
    case "past_due":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
    case "canceled":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300";
  }
}

export default async function FinanceiroPage() {
  const session = await requireNutritionist();

  const [tenant, patientCount] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: {
        id: true,
        name: true,
        plan: true,
        subscription_status: true,
        stripe_customer_id: true,
        stripe_subscription_id: true,
        ai_enabled: true,
        ai_credits: true,
        ai_usage_limit: true,
      },
    }),
    prisma.patient.count({
      where: { tenant_id: session.tenantId, status: "active" },
    }),
  ]);

  const cfg = tenant
    ? await prisma.subscriptionPlanConfig.findUnique({
        where: { plan: tenant.plan },
        select: {
          name: true,
          description: true,
          ai_credits: true,
          ai_usage_limit: true,
          patient_limit: true,
        },
      })
    : null;

  if (!tenant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Assinatura, uso e limites do tenant.</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Tenant não encontrado para a sessão atual.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assinatura, limites e consumo de IA para <span className="font-medium">{tenant.name}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/studio/ai-workflows/credits">
            <Button variant="outline">Ver Créditos de IA</Button>
          </Link>
          <Link href="/studio/settings/ai-agents">
            <Button>Configurar IA</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Plano</CardTitle>
            <CardDescription>Configuração do tenant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plano</span>
              <span className="text-sm font-semibold">{cfg?.name ?? tenant.plan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={statusTone(tenant.subscription_status)} variant="secondary">
                {tenant.subscription_status ?? "unknown"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {cfg?.description ?? "Sem descrição de plano configurada."}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Limite de Pacientes</CardTitle>
            <CardDescription>Ativos no tenant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ativos</span>
              <span className="text-sm font-semibold">{patientCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Limite (plano)</span>
              <span className="text-sm font-semibold">{cfg?.patient_limit ?? "Ilimitado"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">IA</CardTitle>
            <CardDescription>Créditos e uso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ativa</span>
              <span className="text-sm font-semibold">{tenant.ai_enabled ? "Sim" : "Não"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Créditos</span>
              <span className="text-sm font-semibold">{tenant.ai_credits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Limite (uso)</span>
              <span className="text-sm font-semibold">{tenant.ai_usage_limit}</span>
            </div>
            {cfg && (
              <div className="text-xs text-muted-foreground">
                Incluído no plano: {cfg.ai_credits} créditos, limite {cfg.ai_usage_limit}.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stripe (IDs)</CardTitle>
          <CardDescription>Referências para suporte e reconciliação.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">stripe_customer_id</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">{tenant.stripe_customer_id ?? "-"}</code>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">stripe_subscription_id</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">{tenant.stripe_subscription_id ?? "-"}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

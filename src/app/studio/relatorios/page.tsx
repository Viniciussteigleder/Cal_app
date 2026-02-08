import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireNutritionist } from "@/lib/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function StudioReportsPage() {
  const session = await requireNutritionist();

  const today = new Date();
  const start7 = new Date(today);
  start7.setDate(start7.getDate() - 7);

  const [patientsActive, consultations7d, meals7d, symptoms7d, lastIntegrityRun, lastAudit] =
    await Promise.all([
      prisma.patient.count({
        where: { tenant_id: session.tenantId, status: "active" },
      }),
      prisma.consultation.count({
        where: { tenant_id: session.tenantId, created_at: { gte: start7 } },
      }),
      prisma.meal.count({
        where: { tenant_id: session.tenantId, date: { gte: start7 } },
      }),
      prisma.symptomLog.count({
        where: { tenant_id: session.tenantId, logged_at: { gte: start7 } },
      }),
      prisma.integrityCheckRun.findFirst({
        where: { tenant_id: session.tenantId },
        orderBy: { started_at: "desc" },
        select: { status: true, started_at: true, finished_at: true },
      }),
      prisma.auditEvent.findFirst({
        where: { tenant_id: session.tenantId },
        orderBy: { created_at: "desc" },
        select: { action: true, entity_type: true, entity_id: true, created_at: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Indicadores rápidos (últimos 7 dias) e status de integridade.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/studio/ai-workflows/credits">
            <Button variant="outline">Custos IA</Button>
          </Link>
          <Link href="/studio/dashboard">
            <Button>Voltar ao Painel</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pacientes Ativos</CardTitle>
            <CardDescription>Agora</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{patientsActive}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Consultas</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{consultations7d}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Refeições Logadas</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{meals7d}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sintomas</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{symptoms7d}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Integridade</CardTitle>
            <CardDescription>Última execução registrada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary">{lastIntegrityRun?.status ?? "sem execuções"}</Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Início</span>
              <span>{lastIntegrityRun?.started_at ? new Date(lastIntegrityRun.started_at).toLocaleString("pt-BR") : "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Fim</span>
              <span>{lastIntegrityRun?.finished_at ? new Date(lastIntegrityRun.finished_at).toLocaleString("pt-BR") : "-"}</span>
            </div>
            <div className="pt-2">
              <Link href="/owner/integrity">
                <Button variant="outline" className="w-full">
                  Ver detalhes (Owner)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>Último evento capturado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ação</span>
              <span className="font-medium">{lastAudit?.action ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Entidade</span>
              <span className="font-medium">{lastAudit ? `${lastAudit.entity_type}:${lastAudit.entity_id}` : "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Quando</span>
              <span>{lastAudit?.created_at ? new Date(lastAudit.created_at).toLocaleString("pt-BR") : "-"}</span>
            </div>
            <div className="pt-2">
              <Link href="/studio/logs">
                <Button variant="outline" className="w-full">
                  Ver logs (Auditoria)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

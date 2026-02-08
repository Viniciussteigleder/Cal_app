import { prisma } from "@/lib/prisma";
import { requireNutritionist } from "@/lib/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function StudioLogsPage() {
  const session = await requireNutritionist();

  const events = await prisma.auditEvent.findMany({
    where: { tenant_id: session.tenantId },
    orderBy: { created_at: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Logs de Auditoria</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Últimos 100 eventos (tenant atual).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
          <CardDescription>Rastreabilidade de alterações e ações do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Request</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                      Nenhum evento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{e.action}</TableCell>
                      <TableCell className="text-sm">
                        <span className="text-muted-foreground">{e.entity_type}</span>
                        {e.entity_id ? <span className="text-muted-foreground">:</span> : null}
                        {e.entity_id ? <span className="font-mono text-xs">{e.entity_id}</span> : null}
                      </TableCell>
                      <TableCell className="text-sm font-mono">{e.actor_user_id}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{e.request_id}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


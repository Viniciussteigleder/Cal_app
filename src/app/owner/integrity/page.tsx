"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";

interface IntegrityRun {
  id: string;
  started_at: string;
  status: "running" | "passed" | "failed";
  summary_json?: { total_issues?: number };
}

export default function OwnerIntegrityPage() {
  const [runs, setRuns] = useState<IntegrityRun[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const response = await fetch("/api/owner/integrity");
    if (!response.ok) return;
    const payload = await response.json();
    setRuns(payload.runs ?? []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, []);

  const handleRun = async () => {
    setLoading(true);
    await trackEvent("integrity_run_start");
    await fetch("/api/owner/integrity/run", { method: "POST" });
    await refresh();
    setLoading(false);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Verificações de integridade</CardTitle>
          <p className="text-sm text-muted-foreground">
            Execute canários, validações de snapshots e checagens de RLS.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={handleRun} disabled={loading}>
            {loading ? "Executando..." : "Executar checagens"}
          </Button>
          <Button variant="outline" onClick={refresh}>
            Atualizar histórico
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas execuções</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma execução recente.</p>
          ) : (
            runs.map((run) => (
              <div key={run.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(run.started_at).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total de issues: {run.summary_json?.total_issues ?? 0}
                  </p>
                </div>
                <Badge variant={run.status === "failed" ? "destructive" : "secondary"}>
                  {run.status === "failed" ? "Falhou" : "OK"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

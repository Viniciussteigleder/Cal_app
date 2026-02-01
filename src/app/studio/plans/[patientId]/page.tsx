"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlanVersion {
  id: string;
  version_no: number;
  status: "draft" | "reviewed" | "approved" | "published" | "archived";
  publication?: { published_at: string } | null;
}

export default function StudioPlansPage() {
  const params = useParams<{ patientId: string }>();
  const [planId, setPlanId] = useState<string | null>(null);
  const [version, setVersion] = useState<PlanVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/studio/plans?patientId=${params.patientId}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Erro ao carregar plano.");
      }
      setPlanId(payload.id);
      setVersion(payload.latestVersion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [params.patientId]);

  const publishPlan = async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/studio/plans/${planId}/publish`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Não foi possível publicar.");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Versionamento de planos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Toda alteração cria uma nova versão. Planos publicados são imutáveis.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {version ? (
            <>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge>Versão {version.version_no}</Badge>
                <Badge variant={version.status === "published" ? "secondary" : "outline"}>
                  {version.status === "published" ? "Publicado" : "Rascunho"}
                </Badge>
                {version.publication?.published_at && (
                  <Badge variant="outline">
                    Publicado em {new Date(version.publication.published_at).toLocaleDateString("pt-BR")}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" disabled>
                  Duplicar versão
                </Button>
                <Button variant="ghost" disabled>
                  Arquivar versão
                </Button>
                <Button onClick={publishPlan} disabled={loading || version.status === "published"}>
                  {loading ? "Publicando..." : "Publicar versão"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading ? "Carregando plano..." : "Nenhuma versão encontrada."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

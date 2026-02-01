import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PatientPlanPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Plano publicado</CardTitle>
          <p className="text-sm text-muted-foreground">
            Este plano foi aprovado em 12 de janeiro de 2026 pelo seu
            nutricionista.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Versão 3</Badge>
            <Badge variant="secondary">Publicado</Badge>
            <Badge variant="outline">Fonte: TACO v7.1</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Café da manhã
              </p>
              <p className="mt-2 text-sm">Iogurte natural (170g)</p>
              <p className="text-sm">Frutas vermelhas (80g)</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Almoço
              </p>
              <p className="mt-2 text-sm">Arroz branco cozido (150g)</p>
              <p className="text-sm">Feijão preto cozido (100g)</p>
              <p className="text-sm">Frango grelhado (120g)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

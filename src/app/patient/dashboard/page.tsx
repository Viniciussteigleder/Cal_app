import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PatientDashboardPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo do dia</CardTitle>
          <p className="text-sm text-muted-foreground">
            Seus dados são atualizados em tempo real conforme você registra
            refeições.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Meta energética</p>
            <p className="text-2xl font-semibold">1.850 kcal</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Consumido hoje</p>
            <p className="text-2xl font-semibold">1.120 kcal</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant="secondary">Dentro do planejado</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Macronutrientes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Proteínas
            </p>
            <p className="text-xl font-semibold">62g / 95g</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Carboidratos
            </p>
            <p className="text-xl font-semibold">130g / 210g</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Gorduras
            </p>
            <p className="text-xl font-semibold">32g / 55g</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

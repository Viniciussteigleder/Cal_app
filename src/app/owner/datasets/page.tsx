import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerDatasetsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Releases de datasets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>TACO v7.1</Badge>
            <Badge variant="secondary">Publicado</Badge>
            <Badge variant="outline">BR</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>Nova importação</Button>
            <Button variant="outline">Validar release</Button>
            <Button variant="ghost">Publicar</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Validações automáticas: negativos, inconsistências kcal/macros e
            outliers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

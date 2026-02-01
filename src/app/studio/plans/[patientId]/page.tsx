import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudioPlansPage() {
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
          <div className="flex flex-wrap gap-3">
            <Badge>Versão 3</Badge>
            <Badge variant="secondary">Publicado</Badge>
            <Badge variant="outline">Aprovado em 12/01/2026</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Duplicar versão</Button>
            <Button variant="ghost">Arquivar versão</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function StudioPoliciesPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Política de dados do paciente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Uma política ativa por paciente, com versionamento automático.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Região padrão</label>
            <Input placeholder="BR" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Fontes permitidas</label>
            <Input placeholder="TACO, TBCA" />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-medium">Exceções por categoria</label>
            <Textarea placeholder="Ex.: laticínios -> BLS" />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button variant="outline">Salvar nova versão</Button>
            <Button>Ativar política</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

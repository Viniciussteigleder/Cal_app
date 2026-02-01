import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ConsultationWizardPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Consulta guiada · Etapa 1 de 5</CardTitle>
          <p className="text-sm text-muted-foreground">
            Atualize dados corporais e nível de atividade.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Peso atual (kg)</label>
            <Input type="number" placeholder="68" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Altura (cm)</label>
            <Input type="number" placeholder="165" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Atividade</label>
            <Input placeholder="Moderadamente ativo (1.55)" />
          </div>
          <div className="grid gap-2 md:col-span-3">
            <label className="text-sm font-medium">Rotina e observações</label>
            <Textarea placeholder="Sono, estresse, horário das refeições." />
          </div>
          <div className="md:col-span-3 flex gap-3">
            <Button variant="outline">Salvar rascunho</Button>
            <Button>Próxima etapa</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etapa 2: Política de dados</CardTitle>
          <p className="text-sm text-muted-foreground">
            Essa configuração define qual base será usada em cada cálculo.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm">
            Região padrão: BR · Fontes: TACO, TBCA
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm">
            Exceções por categoria: grãos → TACO, laticínios → BLS
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

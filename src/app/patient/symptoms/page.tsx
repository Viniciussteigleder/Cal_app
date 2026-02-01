import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PatientSymptomsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar sintomas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esses dados ajudam seu nutricionista a entender padrões. Não
            substituem avaliação médica.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Escala de Bristol (1-7)</label>
            <Input type="number" min={1} max={7} placeholder="4" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Intensidade (0-10)</label>
            <Input type="number" min={0} max={10} placeholder="2" />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-medium">
              Sintomas observados
            </label>
            <Textarea placeholder="Ex.: gases leves após almoço." />
          </div>
          <div className="md:col-span-2">
            <Button>Salvar registro</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

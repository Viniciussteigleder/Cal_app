import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PatientDetailPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Prontuário do paciente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Dados clínicos básicos, condições e histórico de consultas.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Dados básicos
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Nome: Maria Silva</li>
              <li>Sexo biológico: Feminino</li>
              <li>Altura: 165 cm</li>
              <li>Peso atual: 68 kg</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Condições e observações
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Intolerância à lactose (leve)</li>
              <li>Observação: ansiedade em períodos de pico</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

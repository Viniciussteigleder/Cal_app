import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users } from "lucide-react";

const SYSTEM_PROTOCOLS = [
  {
    id: "1",
    code: "FODMAP",
    name: "Protocolo FODMAP",
    type: "FODMAP",
    description: "Protocolo de eliminação e reintrodução para síndrome do intestino irritável",
    phases: [
      { name: "Eliminação", days: 21 },
      { name: "Reintrodução", days: 42 },
      { name: "Manutenção", days: null },
    ],
    activePatients: 12,
  },
  {
    id: "2",
    code: "LACTOSE",
    name: "Protocolo Lactose",
    type: "LACTOSE",
    description: "Protocolo para intolerância à lactose com graus de restrição configuráveis",
    phases: [
      { name: "Eliminação Total", days: 14 },
      { name: "Reintrodução Gradual", days: 28 },
      { name: "Manutenção", days: null },
    ],
    activePatients: 8,
  },
  {
    id: "3",
    code: "GLUTEN",
    name: "Protocolo Glúten",
    type: "GLUTEN",
    description: "Protocolo para sensibilidade ao glúten não celíaca",
    phases: [
      { name: "Eliminação", days: 21 },
      { name: "Teste de Provocação", days: 7 },
      { name: "Manutenção", days: null },
    ],
    activePatients: 5,
  },
  {
    id: "4",
    code: "CONSTIPATION",
    name: "Protocolo Constipação",
    type: "CONSTIPATION",
    description: "Aumento gradual de fibras e hidratação",
    phases: [
      { name: "Avaliação", days: 7 },
      { name: "Aumento de Fibras", days: 14 },
      { name: "Manutenção", days: null },
    ],
    activePatients: 15,
  },
  {
    id: "5",
    code: "REFLUX",
    name: "Protocolo Refluxo",
    type: "REFLUX",
    description: "Identificação e eliminação de alimentos gatilho para DRGE",
    phases: [
      { name: "Eliminação de Triggers", days: 14 },
      { name: "Reintrodução Cautelosa", days: 21 },
      { name: "Manutenção", days: null },
    ],
    activePatients: 7,
  },
];

function ProtocolCard({ protocol }: { protocol: typeof SYSTEM_PROTOCOLS[0] }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{protocol.name}</CardTitle>
            <CardDescription className="mt-1">{protocol.description}</CardDescription>
          </div>
          <Badge variant="secondary">{protocol.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Fases do Protocolo</h4>
            <div className="flex flex-wrap gap-2">
              {protocol.phases.map((phase, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {phase.name} {phase.days ? `(${phase.days}d)` : ""}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{protocol.activePatients} pacientes ativos</span>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProtocolsPage() {
  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Catálogo de Protocolos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Protocolos disponíveis para aplicação em pacientes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Protocolo Personalizado
        </Button>
      </div>

      {/* Protocol Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SYSTEM_PROTOCOLS.map((protocol) => (
          <ProtocolCard key={protocol.id} protocol={protocol} />
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Como funcionam os protocolos?</h3>
              <p className="text-sm text-blue-700 mt-1">
                Protocolos são guias estruturados para restrições e reintroduções alimentares.
                Cada protocolo define fases com duração e regras específicas para cada grupo alimentar.
                Ao atribuir um protocolo a um paciente, o sistema validará automaticamente os planos
                alimentares contra as regras da fase atual.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

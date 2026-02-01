import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Copy, FileEdit, Trash2, Target, TrendingDown, TrendingUp, Minus } from "lucide-react";

const SAMPLE_TEMPLATES = [
  {
    id: "1",
    name: "Emagrecimento Moderado",
    description: "Déficit calórico de 15% com foco em preservação de massa magra",
    goal: "loss" as const,
    targetKcal: 1800,
    macroSplit: { protein: 30, carbs: 40, fat: 30 },
    isPublic: true,
    isSystem: true,
    tags: ["deficit", "high_protein"],
    mealsCount: 5,
  },
  {
    id: "2",
    name: "Hipertrofia Muscular",
    description: "Superávit calórico de 10% com alto teor proteico",
    goal: "gain" as const,
    targetKcal: 2800,
    macroSplit: { protein: 35, carbs: 45, fat: 20 },
    isPublic: true,
    isSystem: true,
    tags: ["superavit", "high_protein", "muscle_gain"],
    mealsCount: 6,
  },
  {
    id: "3",
    name: "Manutenção Equilibrada",
    description: "Plano para manutenção de peso com alimentação balanceada",
    goal: "maintain" as const,
    targetKcal: 2200,
    macroSplit: { protein: 25, carbs: 50, fat: 25 },
    isPublic: true,
    isSystem: true,
    tags: ["balanced", "maintenance"],
    mealsCount: 4,
  },
  {
    id: "4",
    name: "Low FODMAP - Eliminação",
    description: "Template para fase de eliminação do protocolo FODMAP",
    goal: "protocol_fodmap" as const,
    targetKcal: null,
    macroSplit: { protein: 25, carbs: 45, fat: 30 },
    isPublic: true,
    isSystem: true,
    tags: ["low_fodmap", "elimination"],
    mealsCount: 4,
  },
  {
    id: "5",
    name: "Sem Lactose Personalizado",
    description: "Template adaptado para intolerância à lactose",
    goal: "protocol_lactose" as const,
    targetKcal: 2000,
    macroSplit: { protein: 28, carbs: 47, fat: 25 },
    isPublic: false,
    isSystem: false,
    tags: ["lactose_free", "custom"],
    mealsCount: 5,
  },
];

const GOAL_CONFIG = {
  loss: { icon: TrendingDown, label: "Emagrecimento", color: "text-orange-600 bg-orange-50" },
  gain: { icon: TrendingUp, label: "Ganho de Massa", color: "text-green-600 bg-green-50" },
  maintain: { icon: Minus, label: "Manutenção", color: "text-blue-600 bg-blue-50" },
  protocol_fodmap: { icon: Target, label: "FODMAP", color: "text-purple-600 bg-purple-50" },
  protocol_lactose: { icon: Target, label: "Sem Lactose", color: "text-pink-600 bg-pink-50" },
  protocol_gluten: { icon: Target, label: "Sem Glúten", color: "text-amber-600 bg-amber-50" },
  custom: { icon: FileEdit, label: "Personalizado", color: "text-gray-600 bg-gray-50" },
};

function TemplateCard({ template }: { template: typeof SAMPLE_TEMPLATES[0] }) {
  const goalConfig = GOAL_CONFIG[template.goal];
  const GoalIcon = goalConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-md ${goalConfig.color}`}>
                <GoalIcon className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </div>
            <CardDescription className="mt-1">{template.description}</CardDescription>
          </div>
          {template.isSystem && (
            <Badge variant="secondary" className="text-xs">Sistema</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Macro Split */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Distribuição de Macros</div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500"
                style={{ width: `${template.macroSplit.protein}%` }}
                title={`Proteína: ${template.macroSplit.protein}%`}
              />
              <div
                className="bg-amber-500"
                style={{ width: `${template.macroSplit.carbs}%` }}
                title={`Carboidratos: ${template.macroSplit.carbs}%`}
              />
              <div
                className="bg-green-500"
                style={{ width: `${template.macroSplit.fat}%` }}
                title={`Gordura: ${template.macroSplit.fat}%`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-blue-600">P: {template.macroSplit.protein}%</span>
              <span className="text-amber-600">C: {template.macroSplit.carbs}%</span>
              <span className="text-green-600">G: {template.macroSplit.fat}%</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {template.targetKcal ? `${template.targetKcal} kcal` : "Baseado no paciente"}
            </span>
            <span className="text-muted-foreground">
              {template.mealsCount} refeições
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag.replace("_", " ")}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Copy className="h-4 w-4 mr-1" />
              Duplicar
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <FileEdit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            {!template.isSystem && (
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Templates Disponíveis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Use templates para acelerar a criação de planos alimentares
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Template
        </Button>
      </div>

      {/* Filter by Goal */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Todos
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Emagrecimento
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Ganho de Massa
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Manutenção
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Protocolos
        </Badge>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* Help Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Como usar templates?</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Escolha um template base que corresponda ao objetivo do paciente</li>
            <li>Use "Duplicar" para criar uma versão personalizada</li>
            <li>Ao criar um plano, selecione o template para pré-preencher as refeições</li>
            <li>Ajuste as porções e alimentos conforme necessário</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

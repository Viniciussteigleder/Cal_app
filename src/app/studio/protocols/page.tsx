'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, Star, TrendingUp, CheckCircle, AlertCircle, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    critiqueScore: 48,
    strengths: ["Baseado em evidências científicas", "Fases bem definidas", "Alta taxa de sucesso"],
    improvements: ["Poderia ter mais opções de alimentos", "Fase de manutenção precisa de mais detalhes"],
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
    critiqueScore: 45,
    strengths: ["Flexível e adaptável", "Reintrodução gradual bem estruturada"],
    improvements: ["Necessita mais orientações sobre produtos sem lactose", "Fase de eliminação poderia ser mais curta"],
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
    critiqueScore: 42,
    strengths: ["Teste de provocação bem definido", "Duração adequada"],
    improvements: ["Precisa de mais alternativas sem glúten", "Orientações sobre contaminação cruzada"],
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
    critiqueScore: 46,
    strengths: ["Abordagem gradual", "Foco em hidratação", "Fácil de seguir"],
    improvements: ["Poderia incluir exercícios", "Mais variedade de fontes de fibras"],
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
    critiqueScore: 44,
    strengths: ["Identifica gatilhos individuais", "Reintrodução cautelosa"],
    improvements: ["Lista de triggers poderia ser mais completa", "Orientações sobre horários de refeição"],
  },
];

function ProtocolCard({ protocol }: { protocol: typeof SYSTEM_PROTOCOLS[0] }) {
  const [showCritique, setShowCritique] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 45) return "text-emerald-600";
    if (score >= 40) return "text-blue-600";
    return "text-amber-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 45) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
    if (score >= 40) return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{protocol.name}</CardTitle>
              <Badge className={getScoreBadgeColor(protocol.critiqueScore)}>
                <Star className="w-3 h-3 mr-1" />
                {protocol.critiqueScore}/50
              </Badge>
            </div>
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

          {/* Critique Section */}
          {showCritique && (
            <div className="border-t pt-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Pontos Fortes
                  </h4>
                </div>
                <ul className="space-y-1">
                  {protocol.strengths.map((strength, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Melhorias Sugeridas
                  </h4>
                </div>
                <ul className="space-y-1">
                  {protocol.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{protocol.activePatients} pacientes ativos</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCritique(!showCritique)}
              >
                <Brain className="h-4 w-4 mr-1" />
                {showCritique ? 'Ocultar' : 'Crítica IA'}
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Detalhes
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProtocolsPage() {
  return (
    <DashboardLayout role="nutritionist">
      <div className="space-y-6">
        {/* Header with actions */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Catálogo de Protocolos
          </h1>
          <p className="text-muted-foreground mt-1">
            Protocolos disponíveis para aplicação em pacientes com avaliação de IA
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Protocolos</p>
                  <p className="text-2xl font-bold">{SYSTEM_PROTOCOLS.length}</p>
                </div>
                <FileText className="w-8 h-8 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
                  <p className="text-2xl font-bold">
                    {SYSTEM_PROTOCOLS.reduce((sum, p) => sum + p.activePatients, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pontuação Média</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {(SYSTEM_PROTOCOLS.reduce((sum, p) => sum + p.critiqueScore, 0) / SYSTEM_PROTOCOLS.length).toFixed(1)}/50
                  </p>
                </div>
                <Star className="w-8 h-8 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
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
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Sistema de Crítica com IA (50 Pontos)</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Cada protocolo é avaliado por IA em 50 critérios incluindo: evidência científica,
                  clareza das instruções, variedade de alimentos, adequação das fases, facilidade de
                  adesão, e resultados clínicos. Clique em "Crítica IA" para ver pontos fortes e
                  melhorias sugeridas para cada protocolo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

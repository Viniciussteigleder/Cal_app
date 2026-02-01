import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";

const BRISTOL_SCALE = [
  { value: 1, label: "Tipo 1", description: "Fezes em bolinhas duras e separadas", status: "warning" },
  { value: 2, label: "Tipo 2", description: "Fezes em formato de salsicha com grumos", status: "warning" },
  { value: 3, label: "Tipo 3", description: "Fezes em formato de salsicha com fissuras", status: "normal" },
  { value: 4, label: "Tipo 4", description: "Fezes macias e lisas em formato de salsicha", status: "ideal" },
  { value: 5, label: "Tipo 5", description: "Fezes em pedaços macios com bordas definidas", status: "normal" },
  { value: 6, label: "Tipo 6", description: "Fezes com consistência pastosa", status: "warning" },
  { value: 7, label: "Tipo 7", description: "Fezes aquosas sem pedaços sólidos", status: "warning" },
];

const SYMPTOM_OPTIONS = [
  { id: "gas", label: "Gases" },
  { id: "bloating", label: "Inchaço" },
  { id: "abdominal_pain", label: "Dor Abdominal" },
  { id: "nausea", label: "Náusea" },
  { id: "reflux", label: "Refluxo" },
  { id: "diarrhea", label: "Diarreia" },
  { id: "constipation", label: "Constipação" },
  { id: "cramping", label: "Cólicas" },
  { id: "fatigue", label: "Fadiga" },
  { id: "headache", label: "Dor de Cabeça" },
];

const RECENT_LOGS = [
  {
    id: "1",
    date: "Hoje, 14:30",
    bristol: 4,
    discomfort: 2,
    symptoms: ["gas"],
    notes: "Gases leves após almoço",
  },
  {
    id: "2",
    date: "Ontem, 08:15",
    bristol: 3,
    discomfort: 1,
    symptoms: [],
    notes: "",
  },
  {
    id: "3",
    date: "30/01, 19:00",
    bristol: 5,
    discomfort: 4,
    symptoms: ["bloating", "abdominal_pain"],
    notes: "Inchaço após jantar com salada",
  },
];

const CORRELATION_INSIGHTS = [
  {
    type: "warning",
    message: "Sintomas de gases aparecem mais frequentemente após refeições com feijão",
    confidence: 75,
  },
  {
    type: "info",
    message: "Seu padrão intestinal está dentro do normal esta semana",
    confidence: 90,
  },
];

export default function PatientSymptomsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo Registro</CardTitle>
            <CardDescription>
              Esses dados ajudam seu nutricionista a entender padrões. Não substituem avaliação médica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bristol Scale */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Escala de Bristol</label>
              <div className="grid grid-cols-7 gap-1">
                {BRISTOL_SCALE.map((type) => (
                  <button
                    key={type.value}
                    className={`p-2 rounded-lg border text-center hover:bg-muted transition-colors ${
                      type.status === "ideal" ? "border-green-500 bg-green-50" : ""
                    }`}
                    title={type.description}
                  >
                    <div className="font-semibold text-sm">{type.value}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {type.status === "ideal" ? "Ideal" : ""}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Tipo 3-4 são considerados ideais. Clique para ver a descrição.
              </p>
            </div>

            {/* Discomfort Level */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Nível de Desconforto
                <span className="ml-2 text-muted-foreground font-normal">(0 = nenhum, 10 = muito intenso)</span>
              </label>
              <div className="flex gap-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    className={`flex-1 p-2 rounded border text-sm hover:bg-muted transition-colors ${
                      i === 0 ? "border-green-500" : i >= 7 ? "border-red-500" : ""
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Sintomas Observados</label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((symptom) => (
                  <Badge
                    key={symptom.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary transition-colors py-1.5 px-3"
                  >
                    {symptom.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações Adicionais</label>
              <Textarea
                placeholder="Descreva detalhes adicionais, como horário, alimentos suspeitos, etc."
                rows={3}
              />
            </div>

            {/* Link to meal */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Associar a uma Refeição (opcional)</label>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="">Selecione uma refeição recente</option>
                <option value="1">Hoje - Almoço (12:30)</option>
                <option value="2">Hoje - Café da Manhã (07:30)</option>
                <option value="3">Ontem - Jantar (19:00)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Associar sintomas a refeições ajuda a identificar gatilhos alimentares.
              </p>
            </div>

            <Button className="w-full">Salvar Registro</Button>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registros Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_LOGS.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{log.date}</div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="secondary">Bristol: {log.bristol}</Badge>
                      <Badge variant="secondary">Desconforto: {log.discomfort}</Badge>
                    </div>
                    {log.symptoms.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {log.symptoms.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {SYMPTOM_OPTIONS.find((o) => o.id === s)?.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {log.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights
            </CardTitle>
            <CardDescription>
              Padrões identificados nos seus registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CORRELATION_INSIGHTS.map((insight, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  insight.type === "warning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
                } border`}
              >
                <div className="flex gap-2">
                  {insight.type === "warning" ? (
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm">{insight.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confiança: {insight.confidence}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Estes insights são baseados em padrões dos seus registros. Consulte seu nutricionista para orientação.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">5</div>
                <div className="text-xs text-muted-foreground">Registros</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">3.8</div>
                <div className="text-xs text-muted-foreground">Bristol Médio</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">2.4</div>
                <div className="text-xs text-muted-foreground">Desconforto Médio</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">2</div>
                <div className="text-xs text-muted-foreground">Correlações</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Por que registrar sintomas?</h3>
            <p className="text-sm text-muted-foreground">
              Registrar sintomas regularmente ajuda seu nutricionista a:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Identificar alimentos gatilho</li>
              <li>Avaliar a eficácia do plano alimentar</li>
              <li>Ajustar protocolos de eliminação</li>
              <li>Monitorar sua evolução</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, TrendingUp, CheckCircle2, MessageCircle } from "lucide-react";
import { useState } from "react";

const BRISTOL_SCALE = [
  { value: 1, label: "Tipo 1", description: "Fezes em bolinhas duras e separadas", status: "warning" },
  { value: 2, label: "Tipo 2", description: "Fezes em formato de salsicha com grumos", status: "warning" },
  { value: 3, label: "Tipo 3", description: "Fezes em formato de salsicha com fissuras", status: "normal" },
  { value: 4, label: "Tipo 4", description: "Fezes macias e lisas em formato de salsicha", status: "ideal" },
  { value: 5, label: "Tipo 5", description: "Fezes em pedaços macios com bordas definidas", status: "normal" },
  { value: 6, label: "Tipo 6", description: "Fezes com consistência pastosa", status: "warning" },
  { value: 7, label: "Tipo 7", description: "Fezes aquosas sem pedaços sólidos", status: "warning" },
];

const SYMPTOM_CATEGORIES = {
  gastrointestinal: {
    label: "Gastrointestinal",
    options: [
      { id: "gas", label: "Gases" },
      { id: "bloating", label: "Inchaço/Distensão" },
      { id: "abdominal_pain", label: "Dor Abdominal" },
      { id: "reflux", label: "Refluxo/Azia" },
      { id: "nausea", label: "Náusea" },
      { id: "diarrhea", label: "Diarreia" },
      { id: "constipation", label: "Constipação" },
    ]
  },
  histamine_systemic: { // Critical for Histamine Intolerance
    label: "Sistêmico / Histamínico",
    options: [
      { id: "flushing", label: "Vermelhidão (Flushing)" },
      { id: "itching", label: "Coceira/Prurido" },
      { id: "hives", label: "Urticária" },
      { id: "rhinitis", label: "Coriza/Espirros" },
      { id: "tachycardia", label: "Taquicardia/Palpitações" },
      { id: "migraine", label: "Enxaqueca" },
      { id: "brain_fog", label: "Nevoeiro Mental" },
      { id: "fatigue", label: "Fadiga Súbita" },
    ]
  }
};

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
    discomfort: 8,
    symptoms: ["bloating", "migraine", "tachycardia"],
    notes: "Crise forte após jantar (sobras de ontem)",
  },
];

const CORRELATION_INSIGHTS = [
  {
    type: "warning",
    message: "Alta correlação: Taquicardia aparece 45min após ingerir sobras/reaquecidos.",
    confidence: 85,
  },
  {
    type: "warning",
    message: "Gases frequentes associados ao consumo de feijão.",
    confidence: 75,
  },
  {
    type: "info",
    message: "Padrão Bristol melhorou nos últimos 3 dias.",
    confidence: 90,
  },
];

export default function PatientSymptomsPage() {
  const [selectedDiscomfort, setSelectedDiscomfort] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // WhatsApp SOS Logic
  const handleSOS = () => {
    const symptomLabels = selectedSymptoms.map(id => {
      // Find label across categories
      const cat = Object.values(SYMPTOM_CATEGORIES).find(c => c.options.find(o => o.id === id));
      return cat?.options.find(o => o.id === id)?.label;
    }).join(", ");

    const text = `*SOS NutriPlan* %0A%0A🚨 *Paciente reportando alto desconforto* %0AEscala de Dor: ${selectedDiscomfort}/10 %0ASintomas: ${symptomLabels || "Não especificado"} %0AObs: ${notes} %0A%0A_Enviado via App_`;

    // In a real app, this would use the nutritionist's number. Demo placeholder.
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <DashboardLayout role="patient">
      <div className="grid gap-6 lg:grid-cols-3 animate-in fade-in duration-500">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-card">
            <CardHeader>
              <CardTitle>Novo Registro de Sintomas</CardTitle>
              <CardDescription>
                Monitore reações gastrointestinais e sistêmicas (histamínicas).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Bristol Scale */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex justify-between">
                  Escala de Bristol
                  <span className="text-xs text-muted-foreground font-normal">Como estava suas fezes?</span>
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {BRISTOL_SCALE.map((type) => (
                    <button
                      key={type.value}
                      className={`p-2 rounded-lg border text-center hover:bg-muted transition-all active:scale-95 ${type.status === "ideal" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-border"
                        }`}
                      title={type.description}
                    >
                      <div className="font-semibold text-sm">{type.value}</div>
                      <div className="text-[10px] text-muted-foreground hidden sm:block">
                        {type.status === "ideal" ? "Ideal" : ""}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discomfort Level */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex justify-between">
                  Nível de Desconforto Geral
                  <span className="text-xs text-muted-foreground font-normal">0 = Bem, 10 = Emergência</span>
                </label>
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDiscomfort(i)}
                      className={`flex-1 min-w-[32px] p-2 rounded border text-sm hover:bg-muted transition-all ${selectedDiscomfort === i
                        ? (i < 4 ? "bg-emerald-50 dark:bg-emerald-950/200 text-white border-emerald-600" : i < 7 ? "bg-amber-500 text-white border-amber-600" : "bg-red-500 text-white border-red-600")
                        : "border-border"
                        }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms by Category */}
              <div className="space-y-5">
                {Object.entries(SYMPTOM_CATEGORIES).map(([key, category]) => (
                  <div key={key} className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      {key === 'histamine_systemic' && <AlertCircle className="w-3 h-3 text-red-500" />}
                      {category.label}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {category.options.map((symptom) => {
                        const isSelected = selectedSymptoms.includes(symptom.id);
                        return (
                          <Badge
                            key={symptom.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer transition-all py-1.5 px-3 select-none ${isSelected
                              ? (key === 'histamine_systemic' ? "bg-red-100 dark:bg-red-950/20 text-red-700 hover:bg-red-200 border-red-200" : "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 hover:bg-emerald-200 border-emerald-200 dark:border-emerald-900/30")
                              : "hover:bg-muted border-border text-muted-foreground"
                              }`}
                            onClick={() => toggleSymptom(symptom.id)}
                          >
                            {symptom.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Começou 20min depois de comer salada de atum..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Link to meal */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Gatilho Suspeito (Refeição)</label>
                <select className="w-full p-2 border border-border rounded-md text-sm bg-card h-10">
                  <option value="">Selecione uma refeição recente...</option>
                  <option value="1">Hoje - Almoço (12:30) - Arroz, Feijão...</option>
                  <option value="2">Hoje - Café da Manhã (07:30) - Ovos, Mamão</option>
                  <option value="3">Ontem - Jantar (19:00) - Sopa de Legumes</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <Button className="flex-1 bg-slate-900 hover:bg-slate-800">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Salvar Registro
                </Button>

                {selectedDiscomfort >= 7 && (
                  <Button
                    variant="destructive"
                    className="animate-pulse shadow-lg shadow-red-200"
                    onClick={handleSOS}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    SOS Nutri
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Logs (Simplified for Demo) */}
          <Card className="border-none shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {RECENT_LOGS.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-slate-100 flex items-start justify-between bg-muted/40/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{log.date}</span>
                        {log.discomfort >= 7 && <Badge variant="destructive" className="text-[10px] h-5 px-1">Crise</Badge>}
                      </div>

                      <div className="flex flex-wrap gap-1 text-xs">
                        <Badge variant="secondary" className="bg-card border text-muted-foreground">Bristol {log.bristol}</Badge>
                        <Badge variant="secondary" className="bg-card border text-muted-foreground">Dor: {log.discomfort}</Badge>
                        {log.symptoms.map((s) => {
                          // Quick lookup for label
                          const label = Object.values(SYMPTOM_CATEGORIES).flatMap(c => c.options).find(o => o.id === s)?.label;
                          return label ? <Badge key={s} variant="outline" className="bg-card">{label}</Badge> : null;
                        })}
                      </div>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{log.notes}"</p>
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
          <Card className="border-none shadow-card bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Análise de Padrões
              </CardTitle>
              <CardDescription className="text-slate-400">
                O que o NutriPlan aprendeu sobre você:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {CORRELATION_INSIGHTS.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${insight.type === "warning" ? "bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-sm" : "bg-emerald-50 dark:bg-emerald-950/200/10 border-emerald-500/20"
                    } border`}
                >
                  <div className="flex gap-2">
                    {insight.type === "warning" ? (
                      <AlertCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm leading-relaxed ${insight.type === "warning" ? "text-slate-700" : "text-slate-200"}`}>{insight.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
                        Confiança: {insight.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t border-slate-800 pt-4">
              <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-slate-800 text-xs">
                Ver relatório completo
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

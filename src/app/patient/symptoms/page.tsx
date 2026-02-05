'use client';

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, AlertCircle, TrendingUp, CheckCircle2, MessageCircle, Info, Activity, ArrowRight, Zap, CloudFog, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { cn } from "@/lib/utils";

const BRISTOL_SCALE = [
  { value: 1, label: "Tipo 1", description: "Bolinhas duras", status: "warning", emoji: "🟤" },
  { value: 2, label: "Tipo 2", description: "Formato de salsicha, grumosa", status: "warning", emoji: "🍢" }, // Abstract
  { value: 3, label: "Tipo 3", description: "Salsicha com fissuras", status: "normal", emoji: "🥒" }, // Abstract
  { value: 4, label: "Tipo 4", description: "Lisa e macia (Ideal)", status: "ideal", emoji: "🍌" },
  { value: 5, label: "Tipo 5", description: "Pedaços macios", status: "normal", emoji: "🍪" },
  { value: 6, label: "Tipo 6", description: "Pastosa", status: "warning", emoji: "🥣" },
  { value: 7, label: "Tipo 7", description: "Aquosa", status: "warning", emoji: "💧" },
];

const SYMPTOM_CATEGORIES = {
  gastrointestinal: {
    label: "Intestino & Digestão",
    icon: <Activity className="w-4 h-4 text-emerald-500" />,
    options: [
      { id: "gas", label: "Gases" },
      { id: "bloating", label: "Inchaço" },
      { id: "abdominal_pain", label: "Dor Abd." },
      { id: "reflux", label: "Refluxo" },
      { id: "nausea", label: "Náusea" },
      { id: "diarrhea", label: "Diarreia" },
      { id: "constipation", label: "Constipação" },
    ]
  },
  histamine_systemic: { // Critical for Histamine Intolerance
    label: "Reações (Histamina)",
    icon: <Zap className="w-4 h-4 text-orange-500" />,
    options: [
      { id: "flushing", label: "Vermelhidão" },
      { id: "itching", label: "Coceira" },
      { id: "hives", label: "Urticária" },
      { id: "rhinitis", label: "Coriza" },
      { id: "tachycardia", label: "Taquicardia" },
      { id: "migraine", label: "Enxaqueca" },
      { id: "brain_fog", label: "Nevoeiro" },
      { id: "fatigue", label: "Fadiga" },
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
];

const CORRELATION_INSIGHTS = [
  {
    type: "warning",
    message: "Alta correlação: Taquicardia x Sobras de comida.",
    confidence: 85,
  },
  {
    type: "info",
    message: "Seu padrão intestinal melhorou nos últimos 3 dias.",
    confidence: 90,
  },
];

export default function PatientSymptomsPage() {
  const [selectedDiscomfort, setSelectedDiscomfort] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedBristol, setSelectedBristol] = useState<number | null>(null);
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
    <TooltipProvider>
      <DashboardLayout role="patient">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">

          {/* Header */}
          <div className="space-y-1 px-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Diário de Sintomas</h1>
            <p className="text-muted-foreground font-medium">Monitore suas reações para descobrirmos a causa.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">

            {/* Left Column: Logger Form */}
            <div className="lg:col-span-2 space-y-6">

              {/* 1. Feeling / Discomfort */}
              <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider ml-1">Como você se sente?</h2>
                <Card className="p-6 border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem]">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between text-sm font-medium px-2">
                      <span className={cn("text-emerald-600 transition-all", selectedDiscomfort <= 3 && "font-bold scale-110")}>Super Bem</span>
                      <span className={cn("text-amber-600 transition-all", selectedDiscomfort > 3 && selectedDiscomfort < 7 && "font-bold scale-110")}>Incômodo</span>
                      <span className={cn("text-red-600 transition-all", selectedDiscomfort >= 7 && "font-bold scale-110")}>Emergência</span>
                    </div>

                    {/* Custom Slider UI */}
                    <div className="relative h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center px-2 cursor-pointer touch-none">
                      {/* Background Track Gradient */}
                      <div className="absolute inset-x-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 opacity-30" />

                      {Array.from({ length: 11 }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedDiscomfort(i)}
                          className={cn(
                            "flex-1 h-full relative z-10 flex items-center justify-center text-sm font-bold transition-all rounded-xl",
                            selectedDiscomfort === i
                              ? "bg-white dark:bg-slate-700 shadow-md scale-110 text-foreground ring-2 ring-primary/20"
                              : "text-muted-foreground hover:bg-white/50"
                          )}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </section>

              {/* 2. Bristol Scale (Visual) */}
              <section className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Escala de Bristol</h2>
                  <Tooltip>
                    <TooltipTrigger><Info className="w-4 h-4 text-muted-foreground/50" /></TooltipTrigger>
                    <TooltipContent>Classificação visual das fezes para saúde intestinal.</TooltipContent>
                  </Tooltip>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {BRISTOL_SCALE.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedBristol(type.value)}
                      className={cn(
                        "relative p-4 rounded-2xl border text-left transition-all active:scale-[0.98] hover:shadow-md",
                        selectedBristol === type.value
                          ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 dark:bg-emerald-950/30"
                          : "bg-card border-border hover:border-emerald-200"
                      )}
                    >
                      <div className="text-2xl mb-2">{type.emoji}</div>
                      <div className="font-bold text-sm text-foreground">{type.label}</div>
                      <div className="text-xs text-muted-foreground leading-tight mt-0.5">{type.description}</div>
                      {selectedBristol === type.value && (
                        <div className="absolute top-3 right-3 text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* 3. Symptoms Tags */}
              <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider ml-1">Sintomas Específicos</h2>
                <Card className="p-6 border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem]">
                  <div className="space-y-6">
                    {Object.entries(SYMPTOM_CATEGORIES).map(([key, category]) => (
                      <div key={key}>
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                          {category.icon}
                          {category.label}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.options.map((symptom) => {
                            const isSelected = selectedSymptoms.includes(symptom.id);
                            return (
                              <button
                                key={symptom.id}
                                onClick={() => toggleSymptom(symptom.id)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-sm font-medium transition-all select-none border",
                                  isSelected
                                    ? (key === 'histamine_systemic'
                                      ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900")
                                    : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400"
                                )}
                              >
                                {symptom.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>

              {/* 4. Notes & Submit */}
              <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider ml-1">Observações</h2>
                <Textarea
                  placeholder="O que você comeu antes? Algum evento estressante?"
                  className="rounded-2xl border-slate-200 dark:border-slate-800 resize-none min-h-[100px] text-base p-4 shadow-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </section>

              <div className="pt-4 flex flex-col md:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 h-14 rounded-2xl text-lg font-bold bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]"
                >
                  Registrar Diário
                </Button>
                {selectedDiscomfort >= 7 && (
                  <Button
                    variant="destructive"
                    onClick={handleSOS}
                    className="h-14 rounded-2xl px-8 font-bold animate-pulse"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    SOS Nutri
                  </Button>
                )}
              </div>
              <MedicalDisclaimer variant="minimal" className="mt-4" />

            </div>

            {/* Right Column: Insights & Hints */}
            <div className="space-y-6">
              {/* AI Insights Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-950 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                    <Zap className="w-5 h-5 fill-indigo-500 text-indigo-500" />
                    Insights do NutriPlan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  {CORRELATION_INSIGHTS.map((insight, idx) => (
                    <div key={idx} className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{insight.message}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${insight.confidence}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{insight.confidence}% conf.</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Logs Quick View */}
              <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-base text-muted-foreground uppercase tracking-wider">Últimos Registros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {RECENT_LOGS.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className={cn(
                        "w-2 h-12 rounded-full",
                        log.discomfort < 4 ? "bg-emerald-500" : log.discomfort < 7 ? "bg-amber-500" : "bg-red-500"
                      )} />
                      <div>
                        <p className="text-sm font-bold text-foreground">{log.date}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Bristol {log.bristol} • Dor {log.discomfort}/10
                        </p>
                        {log.symptoms.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {log.symptoms.map(s => (
                              <Badge key={s} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                {SYMPTOM_CATEGORIES.gastrointestinal.options.find(o => o.id === s)?.label || s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="link" className="w-full text-muted-foreground text-xs h-auto p-0 pt-2">
                    Ver histórico completo <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}

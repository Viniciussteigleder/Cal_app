"use client";

import { useState } from "react";
import { analyzePatientAction } from "@/app/studio/ai/patient-analyzer/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Bot, Brain, AlertTriangle, CheckCircle2, TrendingUp, Microscope } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClinicalCopilotProps {
    patientId: string;
}

export function ClinicalCopilot({ patientId }: ClinicalCopilotProps) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const result = await analyzePatientAction(patientId);
            if (result.success) {
                setAnalysis(result.data);
                toast.success("Análise Clínica concluída!");
            } else {
                toast.error("Falha na análise: " + result.error);
            }
        } catch (error) {
            toast.error("Erro inesperado ao conectar com o NutriMind Agent.");
        } finally {
            setLoading(false);
        }
    };

    if (analysis) {
        return (
            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-background overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                <CardHeader className="border-b border-indigo-100 dark:border-indigo-900/50 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-indigo-950 dark:text-indigo-100">Relatório Clínico NutriMind</CardTitle>
                                <CardDescription>Análise baseada nos últimos 30 dias de registros</CardDescription>
                            </div>
                        </div>
                        <Badge variant={analysis.dropout_risk === 'high' ? 'destructive' : 'outline'} className="uppercase">
                            Risco de Abandono: {analysis.dropout_risk}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Adesão Estimada</span>
                                <span>{analysis.adherence_score}%</span>
                            </div>
                            <Progress value={analysis.adherence_score} className="h-2 bg-indigo-100 dark:bg-indigo-950" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Progresso Clínico</span>
                                <span>{analysis.progress_score}%</span>
                            </div>
                            <Progress value={analysis.progress_score} className="h-2 bg-indigo-100 dark:bg-indigo-950" />
                        </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-white/60 dark:bg-slate-900/50 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30 text-sm leading-relaxed">
                        <p className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-2">
                            <Microscope className="w-4 h-4" /> Raciocínio Clínico
                        </p>
                        <p className="text-muted-foreground">{analysis.clinical_reasoning}</p>
                    </div>

                    {/* Deficiencies & Patterns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Possíveis Deficiências</h4>
                            {analysis.suspected_deficiencies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {analysis.suspected_deficiencies.map((def: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">{def}</Badge>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Nenhuma detectada</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Padrão Alimentar</h4>
                            <p className="text-sm text-foreground">{analysis.dietary_patterns}</p>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Plano de Ação Sugerido
                        </h4>
                        <div className="space-y-2">
                            {analysis.recommended_actions.map((action: any, idx: number) => (
                                <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                                        action.priority === 'high' ? 'bg-red-500' : action.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                    )} />
                                    <div>
                                        <p className="font-semibold text-sm">{action.action}</p>
                                        <p className="text-xs text-muted-foreground">{action.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => setAnalysis(null)} className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        Nova Análise
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group" onClick={!loading ? handleAnalyze : undefined}>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Bot className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                    <p className="text-base font-bold text-primary">Análise Clínica NutriMind™</p>
                    <p className="text-xs text-muted-foreground">
                        {loading ? "O Agente está analisando padrões..." : "Clique para gerar insights profundos sobre adesão e sintomas."}
                    </p>
                </div>
                {!loading && (
                    <Button size="sm" className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        Analisar
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

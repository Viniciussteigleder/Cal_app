'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calculator,
    Database,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    Info
} from "lucide-react";
import { useState } from "react";

// Sample calculation log data
const CALCULATION_LOGS = [
    {
        id: 1,
        patient: "Ana Silva",
        type: "Histamine Load",
        timestamp: "2026-02-01 14:30",
        result: 85,
        status: "critical",
        details: {
            formula: "HistamineLoad = Σ(food.histamineScore × quantity × freshnessPenalty)",
            inputs: [
                { food: "Frango (Sobras 24h)", histamineScore: 6, quantity: 200, freshnessPenalty: 1.5, subtotal: 18 },
                { food: "Tomate", histamineScore: 4, quantity: 100, freshnessPenalty: 1.0, subtotal: 4 },
                { food: "Queijo Curado", histamineScore: 9, quantity: 50, freshnessPenalty: 1.0, subtotal: 4.5 },
            ],
            threshold: 80,
            source: "SIGHI (Swiss Interest Group Histamine Intolerance) Database v3.2, 2024",
            confidence: 92
        }
    },
    {
        id: 2,
        patient: "Carla Executiva",
        type: "Symptom Correlation",
        timestamp: "2026-02-01 12:15",
        result: "Bloating ↔ Feijão",
        status: "warning",
        details: {
            formula: "Pearson Correlation (r) + Time Window Analysis",
            analysis: {
                totalMeals: 87,
                mealsWithFeijao: 12,
                bloatingEvents: 14,
                bloatingAfterFeijao: 10,
                timeWindow: "30-120 minutes",
                correlation: 0.83,
                pValue: 0.02,
                interpretation: "Alta correlação (r=0.83) com significância estatística (p=0.02 < 0.05)"
            },
            source: "Patient log data (30 dias), Statistical analysis: Scipy v1.11",
            confidence: 87
        }
    },
    {
        id: 3,
        patient: "Beto Atleta",
        type: "Cálculo TDEE",
        timestamp: "2026-02-01 09:00",
        result: 2847,
        status: "normal",
        details: {
            formula: "TDEE = TMB × Fator de Atividade + Ajuste de Objetivo",
            inputs: {
                weight: 82,
                height: 178,
                age: 28,
                sex: "M",
                tmb: 1876,
                activityFactor: 1.55,
                objective: "maintenance",
                adjustment: 0
            },
            calculation: "1876 × 1.55 + 0 = 2908 kcal/dia",
            source: "Fórmula Mifflin-St Jeor (validada clinicamente)",
            confidence: 95
        }
    }
];

export default function CalculationLogPage() {
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedLog(expandedLog === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Cálculos (AI Transparency)</h1>
                <p className="text-slate-500 mt-1">
                    Veja exatamente como cada cálculo foi feito, com fórmulas, fontes e nível de confiança.
                </p>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="histamine">Histamina</TabsTrigger>
                    <TabsTrigger value="correlation">Correlações</TabsTrigger>
                    <TabsTrigger value="calculations">Cálculos Nutricionais</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                    {CALCULATION_LOGS.map((log) => (
                        <Card
                            key={log.id}
                            className={`border-l-4 ${log.status === 'critical' ? 'border-l-red-500' :
                                log.status === 'warning' ? 'border-l-amber-500' :
                                    'border-l-emerald-500'
                                }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CardTitle className="text-lg">{log.patient}</CardTitle>
                                            <Badge
                                                variant={log.status === 'critical' ? 'destructive' : log.status === 'warning' ? 'default' : 'secondary'}
                                                className={log.status === 'warning' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                                            >
                                                {log.type}
                                            </Badge>
                                        </div>
                                        <CardDescription className="flex items-center gap-2">
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{log.timestamp}</span>
                                            {typeof log.result === 'number' && (
                                                <span className="text-sm font-semibold">
                                                    Resultado: {log.result}{log.type.includes('TDEE') ? ' kcal' : '%'}
                                                </span>
                                            )}
                                            {typeof log.result === 'string' && (
                                                <span className="text-sm font-semibold">{log.result}</span>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpand(log.id)}
                                        className="flex items-center gap-1"
                                    >
                                        {expandedLog === log.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        Detalhes
                                    </Button>
                                </div>
                            </CardHeader>

                            {expandedLog === log.id && (
                                <CardContent className="pt-0 space-y-4 border-t border-slate-100 mt-3 pt-4">
                                    {/* Formula */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calculator className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-semibold text-slate-700">Fórmula Utilizada</span>
                                        </div>
                                        <code className="text-sm text-slate-600 font-mono block">
                                            {log.details.formula}
                                        </code>
                                    </div>

                                    {/* Inputs & Calculation Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-semibold text-slate-700">Dados de Entrada</span>
                                        </div>

                                        {log.type === "Histamine Load" && Array.isArray(log.details.inputs) && (
                                            <div className="space-y-2">
                                                {log.details.inputs.map((input: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-100 text-sm">
                                                        <span className="font-medium text-slate-700">{input.food}</span>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span>Score: {input.histamineScore}/10</span>
                                                            <span>Qtd: {input.quantity}g</span>
                                                            <span>Frescor: ×{input.freshnessPenalty}</span>
                                                            <span className="font-semibold text-slate-700">= {input.subtotal} pts</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-200 font-semibold">
                                                    <span className="text-slate-700">Total da Refeição:</span>
                                                    <span className="text-purple-700">{log.result}% do limite diário ({log.details.threshold} pts)</span>
                                                </div>
                                            </div>
                                        )}

                                        {log.type === "Symptom Correlation" && log.details.analysis && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-white rounded border border-slate-100">
                                                    <div className="text-xs text-slate-500">Total de Refeições</div>
                                                    <div className="text-2xl font-bold text-slate-900">{log.details.analysis.totalMeals}</div>
                                                </div>
                                                <div className="p-3 bg-white rounded border border-slate-100">
                                                    <div className="text-xs text-slate-500">Refeições com Feijão</div>
                                                    <div className="text-2xl font-bold text-slate-900">{log.details.analysis.mealsWithFeijao}</div>
                                                </div>
                                                <div className="p-3 bg-white rounded border border-slate-100">
                                                    <div className="text-xs text-slate-500">Total de Inchaço</div>
                                                    <div className="text-2xl font-bold text-slate-900">{log.details.analysis.bloatingEvents}</div>
                                                </div>
                                                <div className="p-3 bg-amber-50 rounded border border-amber-200">
                                                    <div className="text-xs text-amber-600">Inchaço APÓS Feijão</div>
                                                    <div className="text-2xl font-bold text-amber-700">{log.details.analysis.bloatingAfterFeijao}</div>
                                                </div>
                                                <div className="col-span-2 p-3 bg-blue-50 rounded border border-blue-200">
                                                    <div className="text-xs text-blue-600 mb-1">Interpretação Estatística</div>
                                                    <div className="text-sm text-blue-900">{log.details.analysis.interpretation}</div>
                                                </div>
                                            </div>
                                        )}

                                        {log.type === "Cálculo TDEE" && log.details.inputs && (
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-4 gap-2 text-sm">
                                                    <div className="p-2 bg-white rounded border">
                                                        <div className="text-[10px] text-slate-500">Peso</div>
                                                        <div className="font-semibold">{(log.details.inputs as any).weight} kg</div>
                                                    </div>
                                                    <div className="p-2 bg-white rounded border">
                                                        <div className="text-[10px] text-slate-500">Altura</div>
                                                        <div className="font-semibold">{(log.details.inputs as any).height} cm</div>
                                                    </div>
                                                    <div className="p-2 bg-white rounded border">
                                                        <div className="text-[10px] text-slate-500">Idade</div>
                                                        <div className="font-semibold">{(log.details.inputs as any).age} anos</div>
                                                    </div>
                                                    <div className="p-2 bg-white rounded border">
                                                        <div className="text-[10px] text-slate-500">Sexo</div>
                                                        <div className="font-semibold">{(log.details.inputs as any).sex}</div>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-sm">
                                                    <div className="text-emerald-700 font-mono">{log.details.calculation}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Data Source */}
                                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                                        <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-xs font-semibold text-blue-700 mb-1">Fonte dos Dados</div>
                                            <div className="text-sm text-blue-900">{log.details.source}</div>
                                            {log.type === "Histamine Load" && (
                                                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-blue-600 mt-1">
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    Ver base de dados SIGHI
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confidence */}
                                    <div className="flex items-center justify-between p-3 bg-slate-100 rounded">
                                        <div className="flex items-center gap-2">
                                            {log.details.confidence >= 80 ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            )}
                                            <span className="text-sm font-medium text-slate-700">Nível de Confiança</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${log.details.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${log.details.confidence}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-lg font-bold text-slate-900">{log.details.confidence}%</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            Aceitar & Adicionar ao Resumo
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 text-slate-600">
                                            Descartar como Falso Positivo
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="histamine">
                    <div className="text-center py-12 text-slate-500">
                        Filtro aplicado: Apenas cálculos de Carga Histamínica
                    </div>
                </TabsContent>

                <TabsContent value="correlation">
                    <div className="text-center py-12 text-slate-500">
                        Filtro aplicado: Apenas Correlações de Sintomas
                    </div>
                </TabsContent>

                <TabsContent value="calculations">
                    <div className="text-center py-12 text-slate-500">
                        Filtro aplicado: Apenas Cálculos Nutricionais (TMB/TDEE)
                    </div>
                </TabsContent>
            </Tabs>

            {/* Info Banner */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-slate-700">
                            <span className="font-semibold">Sobre a Transparência de IA:</span> Este registro mostra cada decisão automatizada do sistema.
                            Você pode aceitar, rejeitar ou solicitar mais dados para qualquer cálculo. Todas as fórmulas seguem padrões clínicos validados.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Brain, TrendingUp, AlertTriangle, Calendar, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface FoodSymptomCorrelation {
    food: string;
    symptom: string;
    correlation: number;
    occurrences: number;
    avgTimeLag: number;
    confidence: 'high' | 'medium' | 'low';
}

interface SymptomPattern {
    symptom: string;
    frequency: number;
    avgSeverity: number;
    timeOfDay: string;
    triggers: string[];
}

interface AnalysisResult {
    patientId: string;
    patientName: string;
    analysisDate: string;
    periodDays: number;
    correlations: FoodSymptomCorrelation[];
    patterns: SymptomPattern[];
    recommendations: string[];
    eliminationSuggestions: string[];
}

// Mock data
const mockAnalysis: AnalysisResult = {
    patientId: '1',
    patientName: 'Maria Silva',
    analysisDate: '2026-02-03',
    periodDays: 30,
    correlations: [
        {
            food: 'Laticínios',
            symptom: 'Inchaço',
            correlation: 0.89,
            occurrences: 12,
            avgTimeLag: 45,
            confidence: 'high',
        },
        {
            food: 'Trigo',
            symptom: 'Fadiga',
            correlation: 0.76,
            occurrences: 8,
            avgTimeLag: 120,
            confidence: 'high',
        },
        {
            food: 'Cebola',
            symptom: 'Gases',
            correlation: 0.82,
            occurrences: 10,
            avgTimeLag: 60,
            confidence: 'high',
        },
        {
            food: 'Café',
            symptom: 'Ansiedade',
            correlation: 0.65,
            occurrences: 6,
            avgTimeLag: 30,
            confidence: 'medium',
        },
        {
            food: 'Feijão',
            symptom: 'Desconforto Abdominal',
            correlation: 0.58,
            occurrences: 5,
            avgTimeLag: 90,
            confidence: 'medium',
        },
    ],
    patterns: [
        {
            symptom: 'Inchaço',
            frequency: 15,
            avgSeverity: 3.2,
            timeOfDay: 'Tarde (14h-18h)',
            triggers: ['Laticínios', 'Cebola'],
        },
        {
            symptom: 'Fadiga',
            frequency: 10,
            avgSeverity: 2.8,
            timeOfDay: 'Manhã (10h-12h)',
            triggers: ['Trigo', 'Açúcar'],
        },
        {
            symptom: 'Gases',
            frequency: 12,
            avgSeverity: 2.5,
            timeOfDay: 'Noite (19h-22h)',
            triggers: ['Cebola', 'Feijão', 'Brócolis'],
        },
    ],
    recommendations: [
        'Considere eliminar laticínios por 2-3 semanas para avaliar melhora no inchaço',
        'Teste substituir trigo por alternativas sem glúten para verificar impacto na fadiga',
        'Reduza consumo de alimentos FODMAP alto (cebola, alho) que mostram correlação com gases',
        'Monitore consumo de café e seus efeitos na ansiedade',
    ],
    eliminationSuggestions: [
        'Laticínios (correlação 89% com inchaço)',
        'Trigo (correlação 76% com fadiga)',
        'Cebola (correlação 82% com gases)',
    ],
};

export default function SymptomCorrelatorPage() {
    const [selectedPatient, setSelectedPatient] = useState('1');
    const [analysisPerio, setAnalysisPeriod] = useState('30');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleRunAnalysis = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            toast.success('Análise de correlação concluída!');
            setIsAnalyzing(false);
        }, 2000);
    };

    const getCorrelationColor = (correlation: number) => {
        if (correlation >= 0.7) return 'text-red-600';
        if (correlation >= 0.5) return 'text-amber-600';
        return 'text-blue-600';
    };

    const getCorrelationBadge = (confidence: string) => {
        const config = {
            high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
            low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        };
        const labels = {
            high: 'Alta Confiança',
            medium: 'Média Confiança',
            low: 'Baixa Confiança',
        };
        return (
            <Badge className={config[confidence as keyof typeof config]}>
                {labels[confidence as keyof typeof labels]}
            </Badge>
        );
    };

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Brain className="h-8 w-8 text-primary" />
                        Correlacionador de Sintomas com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Identifique padrões e correlações entre alimentos e sintomas automaticamente
                    </p>
                </div>

                {/* Analysis Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configurar Análise</CardTitle>
                        <CardDescription>
                            Selecione o paciente e período para análise de correlações
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Paciente</label>
                                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Maria Silva</SelectItem>
                                        <SelectItem value="2">João Santos</SelectItem>
                                        <SelectItem value="3">Ana Costa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Período de Análise</label>
                                <Select value={analysisPerio} onValueChange={setAnalysisPeriod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                                        <SelectItem value="14">Últimos 14 dias</SelectItem>
                                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                                        <SelectItem value="60">Últimos 60 dias</SelectItem>
                                        <SelectItem value="90">Últimos 90 dias</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    onClick={handleRunAnalysis}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Brain className="h-4 w-4 mr-2 animate-spin" />
                                            Analisando...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4 mr-2" />
                                            Executar Análise
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                                        Análise com IA Avançada
                                    </h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        Nossa IA analisa registros diários para identificar correlações estatísticas entre
                                        alimentos consumidos e sintomas relatados, considerando tempo de latência e frequência.
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                        Custo: 30 créditos (R$ 0,60)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Results */}
                <Tabs defaultValue="correlations" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="correlations">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Correlações
                        </TabsTrigger>
                        <TabsTrigger value="patterns">
                            <Calendar className="w-4 h-4 mr-2" />
                            Padrões
                        </TabsTrigger>
                        <TabsTrigger value="recommendations">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Recomendações
                        </TabsTrigger>
                    </TabsList>

                    {/* Correlations Tab */}
                    <TabsContent value="correlations" className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Correlações Alimento-Sintoma</h2>
                            <Badge variant="outline">
                                {mockAnalysis.correlations.length} correlações encontradas
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {mockAnalysis.correlations.map((corr, idx) => (
                                <Card key={idx} className="overflow-hidden">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{corr.food}</h3>
                                                    <span className="text-muted-foreground">→</span>
                                                    <h3 className="text-lg font-semibold text-red-600">{corr.symptom}</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {corr.occurrences} ocorrências • Tempo médio: {corr.avgTimeLag} minutos
                                                </p>
                                            </div>
                                            {getCorrelationBadge(corr.confidence)}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">Força da Correlação</span>
                                                    <span className={`text-sm font-bold ${getCorrelationColor(corr.correlation)}`}>
                                                        {(corr.correlation * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={corr.correlation * 100}
                                                    className="h-2"
                                                />
                                            </div>

                                            <div className="flex gap-2 pt-3 border-t">
                                                {corr.correlation >= 0.7 ? (
                                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="font-medium">Gatilho provável - considere eliminação</span>
                                                    </div>
                                                ) : corr.correlation >= 0.5 ? (
                                                    <div className="flex items-center gap-2 text-sm text-amber-600">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="font-medium">Possível gatilho - monitorar</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span className="font-medium">Correlação fraca - mais dados necessários</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Patterns Tab */}
                    <TabsContent value="patterns" className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Padrões de Sintomas</h2>
                            <Badge variant="outline">
                                {mockAnalysis.patterns.length} padrões identificados
                            </Badge>
                        </div>

                        <div className="grid gap-4">
                            {mockAnalysis.patterns.map((pattern, idx) => (
                                <Card key={idx}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{pattern.symptom}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {pattern.frequency} ocorrências • Severidade média: {pattern.avgSeverity.toFixed(1)}/5
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline">{pattern.timeOfDay}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium mb-2">Gatilhos Identificados:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {pattern.triggers.map((trigger, tIdx) => (
                                                        <Badge key={tIdx} variant="outline" className="bg-red-50 dark:bg-red-950/20">
                                                            {trigger}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">Severidade Média</span>
                                                    <span className="text-sm font-bold">{pattern.avgSeverity.toFixed(1)}/5</span>
                                                </div>
                                                <Progress value={(pattern.avgSeverity / 5) * 100} className="h-2" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Recommendations Tab */}
                    <TabsContent value="recommendations" className="space-y-6 mt-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Recomendações Baseadas em IA</h2>
                            <div className="space-y-3">
                                {mockAnalysis.recommendations.map((rec, idx) => (
                                    <div
                                        key={idx}
                                        className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg"
                                    >
                                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-emerald-900 dark:text-emerald-100">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Sugestões de Eliminação</h2>
                            <div className="space-y-3">
                                {mockAnalysis.eliminationSuggestions.map((sugg, idx) => (
                                    <div
                                        key={idx}
                                        className="flex gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg"
                                    >
                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-900 dark:text-red-100">{sugg}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
                                            Protocolo de Eliminação Sugerido
                                        </h4>
                                        <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                                            <li>1. Elimine os alimentos sugeridos por 2-3 semanas</li>
                                            <li>2. Monitore sintomas diariamente durante a eliminação</li>
                                            <li>3. Reintroduza um alimento por vez, aguardando 3 dias entre cada</li>
                                            <li>4. Registre qualquer sintoma durante a reintrodução</li>
                                            <li>5. Mantenha afastados os alimentos que causarem sintomas</li>
                                        </ol>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

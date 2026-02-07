'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { FileText, Brain, Download, TrendingUp, TrendingDown, Activity, Target, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';

interface ProgressMetric {
    name: string;
    initial: number;
    current: number;
    target: number;
    unit: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
}

interface Report {
    patient: {
        name: string;
        age: number;
        startDate: string;
        duration: number;
    };
    summary: {
        adherence: number;
        mealsLogged: number;
        weightLoss: number;
        goalProgress: number;
    };
    metrics: ProgressMetric[];
    achievements: string[];
    challenges: string[];
    recommendations: string[];
    nextSteps: string[];
}

export default function ReportGeneratorPage() {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [reportPeriod, setReportPeriod] = useState('');
    const [reportType, setReportType] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState<Report | null>(null);

    const generateReport = async () => {
        setIsGenerating(true);

        try {
            const periodMap: Record<string, string> = { '7': '7 dias', '30': '30 dias', '90': '90 dias' };

            const response = await fetch('/api/ai/report-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: selectedPatient,
                    period: periodMap[reportPeriod] || '90 dias',
                    reportType,
                }),
            });

            if (!response.ok) throw new Error('Falha ao gerar relatório');

            const result = await response.json();
            const aiData = result.data || {};

            const generatedReport: Report = {
                patient: {
                    name: aiData.patient?.name || 'Paciente',
                    age: aiData.patient?.age || 0,
                    startDate: aiData.patient?.startDate || aiData.summary?.period || new Date().toISOString().slice(0, 10),
                    duration: Number(reportPeriod) || 90,
                },
                summary: {
                    adherence: aiData.summary?.adherence_score ?? aiData.summary?.adherence ?? 0,
                    mealsLogged: aiData.summary?.meals_logged ?? aiData.summary?.mealsLogged ?? 0,
                    weightLoss: Math.abs(aiData.summary?.weight_change ?? aiData.summary?.weightLoss ?? 0),
                    goalProgress: aiData.summary?.overall_progress ?? aiData.summary?.goalProgress ?? 0,
                },
                metrics: (aiData.metrics || []).map((m: any) => ({
                    name: m.name || m.metric,
                    initial: m.initial ?? m.start_value ?? 0,
                    current: m.current ?? m.end_value ?? 0,
                    target: m.target ?? m.goal_value ?? 0,
                    unit: m.unit || '',
                    change: m.change ?? ((m.current ?? 0) - (m.initial ?? 0)),
                    trend: m.trend || ((m.change ?? 0) > 0 ? 'up' : (m.change ?? 0) < 0 ? 'down' : 'stable'),
                })),
                achievements: (aiData.achievements || []).map((a: any) => typeof a === 'string' ? a : a.description || a.title || ''),
                challenges: (aiData.challenges || []).map((c: any) => typeof c === 'string' ? c : `${c.title}${c.recommendation ? ' - ' + c.recommendation : ''}`),
                recommendations: (aiData.recommendations || []).flatMap((r: any) => {
                    if (typeof r === 'string') return [r];
                    if (r.items) return r.items as string[];
                    return [r.description || r.title || ''];
                }),
                nextSteps: aiData.next_steps || aiData.nextSteps || [],
            };

            setReport(generatedReport);
            toast.success(`Relatório gerado com sucesso! (${result.creditsUsed || 0} créditos)`);
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Erro ao gerar relatório. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const exportPDF = () => {
        toast.success('Relatório exportado para PDF!');
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-600" />;
        return <Activity className="h-4 w-4 text-gray-600" />;
    };

    const getChangeColor = (change: number, metricName: string) => {
        // For weight, body fat, waist - negative is good
        if (['Peso', 'IMC', 'Circunferência Abdominal', 'Gordura Corporal'].includes(metricName)) {
            return change < 0 ? 'text-green-600' : 'text-red-600';
        }
        // For muscle mass - positive is good
        return change > 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="h-8 w-8 text-primary" />
                        Gerador de Relatórios com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Relatórios completos de progresso com visualizações e narrativas
                    </p>
                </div>

                <MedicalDisclaimer />

                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuração do Relatório</CardTitle>
                        <CardDescription>Selecione o paciente, período e tipo de relatório</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Paciente</label>
                                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Maria Silva</SelectItem>
                                        <SelectItem value="2">João Santos</SelectItem>
                                        <SelectItem value="3">Ana Costa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Período</label>
                                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                                        <SelectItem value="90">Últimos 90 dias</SelectItem>
                                        <SelectItem value="custom">Personalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Relatório</label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="progress">Progresso Completo</SelectItem>
                                        <SelectItem value="nutrition">Análise Nutricional</SelectItem>
                                        <SelectItem value="adherence">Aderência</SelectItem>
                                        <SelectItem value="medical">Médico</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    onClick={generateReport}
                                    disabled={isGenerating || !selectedPatient || !reportPeriod || !reportType}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Brain className="h-4 w-4 mr-2 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4 mr-2" />
                                            Gerar Relatório
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
                                        Relatórios Inteligentes com IA
                                    </h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        Nossa IA analisa todos os dados do paciente e gera relatórios completos com
                                        visualizações, narrativas personalizadas e recomendações baseadas em evidências.
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                        Custo: 35 créditos (R$ 0,70)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {report && (
                    <>
                        {/* Report Header */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">Relatório de Progresso</CardTitle>
                                        <CardDescription className="mt-2">
                                            {report.patient.name} • {report.patient.age} anos • {report.patient.duration} dias de tratamento
                                        </CardDescription>
                                    </div>
                                    <Button onClick={exportPDF} className="bg-blue-600 hover:bg-blue-700">
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar PDF
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                            <Target className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Aderência</p>
                                            <p className="text-2xl font-bold text-emerald-600">{report.summary.adherence}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Refeições Registradas</p>
                                            <p className="text-2xl font-bold">{report.summary.mealsLogged}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                            <TrendingDown className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Perda de Peso</p>
                                            <p className="text-2xl font-bold text-green-600">-{report.summary.weightLoss}kg</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                            <Award className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Progresso da Meta</p>
                                            <p className="text-2xl font-bold text-purple-600">{report.summary.goalProgress}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="metrics" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="metrics">Métricas</TabsTrigger>
                                <TabsTrigger value="achievements">Conquistas</TabsTrigger>
                                <TabsTrigger value="challenges">Desafios</TabsTrigger>
                                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                            </TabsList>

                            {/* Metrics Tab */}
                            <TabsContent value="metrics" className="space-y-4 mt-6">
                                <h2 className="text-xl font-semibold">Evolução das Métricas</h2>
                                <div className="space-y-4">
                                    {report.metrics.map((metric, idx) => (
                                        <Card key={idx}>
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-semibold">{metric.name}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Inicial: {metric.initial}{metric.unit} → Atual: {metric.current}{metric.unit} → Meta: {metric.target}{metric.unit}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getTrendIcon(metric.trend)}
                                                            <span className={`text-lg font-bold ${getChangeColor(metric.change, metric.name)}`}>
                                                                {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium">Progresso até a meta</span>
                                                            <span className="font-bold">
                                                                {Math.round(((metric.initial - metric.current) / (metric.initial - metric.target)) * 100)}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={((metric.initial - metric.current) / (metric.initial - metric.target)) * 100}
                                                            className="h-2"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Achievements Tab */}
                            <TabsContent value="achievements" className="space-y-4 mt-6">
                                <h2 className="text-xl font-semibold">Conquistas e Marcos</h2>
                                <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
                                    <CardContent className="pt-6">
                                        <ul className="space-y-3">
                                            {report.achievements.map((achievement, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <Award className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-emerald-900 dark:text-emerald-100">{achievement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Challenges Tab */}
                            <TabsContent value="challenges" className="space-y-4 mt-6">
                                <h2 className="text-xl font-semibold">Desafios Identificados</h2>
                                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                                    <CardContent className="pt-6">
                                        <ul className="space-y-3">
                                            {report.challenges.map((challenge, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <Activity className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-amber-900 dark:text-amber-100">{challenge}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Recommendations Tab */}
                            <TabsContent value="recommendations" className="space-y-4 mt-6">
                                <h2 className="text-xl font-semibold">Recomendações e Próximos Passos</h2>

                                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recomendações da IA</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {report.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-blue-900 dark:text-blue-100">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Próximos Passos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {report.nextSteps.map((step, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-emerald-600">{idx + 1}</span>
                                                    </div>
                                                    <span className="text-sm">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

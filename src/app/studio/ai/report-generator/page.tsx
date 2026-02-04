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

    const generateReport = () => {
        setIsGenerating(true);

        setTimeout(() => {
            const mockReport: Report = {
                patient: {
                    name: 'Maria Silva',
                    age: 39,
                    startDate: '2025-12-01',
                    duration: 90,
                },
                summary: {
                    adherence: 87,
                    mealsLogged: 245,
                    weightLoss: 10.3,
                    goalProgress: 65,
                },
                metrics: [
                    { name: 'Peso', initial: 78.5, current: 68.2, target: 68.0, unit: 'kg', change: -10.3, trend: 'down' },
                    { name: 'IMC', initial: 28.5, current: 24.8, target: 24.0, unit: '', change: -3.7, trend: 'down' },
                    { name: 'Circunferência Abdominal', initial: 92, current: 78, target: 75, unit: 'cm', change: -14, trend: 'down' },
                    { name: 'Gordura Corporal', initial: 32, current: 25, target: 22, unit: '%', change: -7, trend: 'down' },
                    { name: 'Massa Muscular', initial: 48, current: 51, target: 52, unit: 'kg', change: 3, trend: 'up' },
                ],
                achievements: [
                    'Atingiu 87% de aderência ao plano alimentar - acima da meta de 80%',
                    'Perdeu 10.3kg em 90 dias - ritmo saudável de 1.1kg/semana',
                    'Reduziu circunferência abdominal em 14cm',
                    'Aumentou massa muscular em 3kg',
                    'Registrou refeições consistentemente por 7 dias seguidos (recorde pessoal)',
                    'Sintomas de SII reduziram em 70%',
                ],
                challenges: [
                    'Dificuldade em manter hidratação adequada (média de 1.5L/dia, meta 2.5L)',
                    'Consumo de proteína abaixo da meta em 15% dos dias',
                    'Picos de compulsão alimentar aos finais de semana (2-3x/mês)',
                    'Sono irregular afetando recuperação e controle de apetite',
                ],
                recommendations: [
                    'Manter protocolo FODMAP fase 2 por mais 4 semanas',
                    'Aumentar ingestão de água - usar alarmes no celular como lembrete',
                    'Incluir mais fontes de proteína nos lanches da tarde',
                    'Trabalhar estratégias comportamentais para finais de semana com psicólogo',
                    'Estabelecer rotina de sono mais consistente (22h-6h)',
                    'Iniciar reintrodução gradual de laticínios com baixa lactose',
                ],
                nextSteps: [
                    'Consulta de acompanhamento em 15/02/2026',
                    'Solicitar novos exames laboratoriais (hemograma, perfil lipídico, vitamina D)',
                    'Ajustar meta calórica para fase de manutenção',
                    'Introduzir treino de força 3x/semana',
                    'Agendar sessão com psicólogo nutricional',
                ],
            };

            setReport(mockReport);
            setIsGenerating(false);
            toast.success('Relatório gerado com sucesso!');
        }, 2500);
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

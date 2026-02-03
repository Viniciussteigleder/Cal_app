'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Pill, Brain, AlertTriangle, CheckCircle, TrendingUp, Info, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface NutrientGap {
    nutrient: string;
    current: number;
    target: number;
    unit: string;
    status: 'critical' | 'low' | 'adequate' | 'high';
    percentage: number;
}

interface SupplementRecommendation {
    name: string;
    dosage: string;
    timing: string;
    duration: string;
    benefits: string[];
    warnings: string[];
    interactions: string[];
    estimatedCost: string;
    priority: 'high' | 'medium' | 'low';
}

export default function SupplementAdvisorPage() {
    const [selectedPatient, setSelectedPatient] = useState('1');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    // Mock nutrient gaps data
    const nutrientGaps: NutrientGap[] = [
        { nutrient: 'Vitamina D', current: 18, target: 30, unit: 'ng/mL', status: 'low', percentage: 60 },
        { nutrient: 'Vitamina B12', current: 180, target: 400, unit: 'pg/mL', status: 'low', percentage: 45 },
        { nutrient: 'Ferro', current: 25, target: 70, unit: 'ng/mL', status: 'critical', percentage: 36 },
        { nutrient: 'Magnésio', current: 1.8, target: 2.2, unit: 'mg/dL', status: 'low', percentage: 82 },
        { nutrient: 'Ômega-3', current: 4.5, target: 8, unit: '%', status: 'low', percentage: 56 },
        { nutrient: 'Zinco', current: 85, target: 100, unit: 'μg/dL', status: 'adequate', percentage: 85 },
    ];

    // Mock supplement recommendations
    const recommendations: SupplementRecommendation[] = [
        {
            name: 'Vitamina D3',
            dosage: '2.000 UI/dia',
            timing: 'Junto com refeição que contenha gordura (almoço ou jantar)',
            duration: '3 meses, depois reavaliar',
            benefits: [
                'Melhora absorção de cálcio',
                'Fortalece sistema imunológico',
                'Reduz risco de osteoporose',
                'Melhora humor e energia',
            ],
            warnings: [
                'Não exceder 4.000 UI/dia sem supervisão médica',
                'Monitorar níveis sanguíneos a cada 3 meses',
            ],
            interactions: [
                'Pode interagir com medicamentos para pressão alta',
                'Aumenta absorção de cálcio - cuidado com hipercalcemia',
            ],
            estimatedCost: 'R$ 25-40/mês',
            priority: 'high',
        },
        {
            name: 'Complexo B (com B12 metilada)',
            dosage: '1 cápsula/dia (B12: 1.000 mcg)',
            timing: 'Pela manhã, em jejum ou com café da manhã',
            duration: '6 meses, depois reavaliar',
            benefits: [
                'Melhora energia e disposição',
                'Suporta metabolismo energético',
                'Importante para saúde neurológica',
                'Reduz fadiga',
            ],
            warnings: [
                'Pode deixar urina amarelada (normal)',
                'Vegetarianos/veganos precisam de suplementação contínua',
            ],
            interactions: [
                'Pode reduzir eficácia de alguns antibióticos',
                'Interage com metformina (diabetes)',
            ],
            estimatedCost: 'R$ 30-50/mês',
            priority: 'high',
        },
        {
            name: 'Ferro Quelado + Vitamina C',
            dosage: '30 mg de ferro elementar/dia',
            timing: 'Em jejum ou 2h após refeições, com suco de laranja',
            duration: '3 meses, depois reavaliar',
            benefits: [
                'Corrige anemia ferropriva',
                'Melhora energia e disposição',
                'Reduz fadiga',
                'Melhora concentração',
            ],
            warnings: [
                'Pode causar constipação intestinal',
                'Pode causar náusea - tomar com alimento se necessário',
                'Fezes podem ficar escuras (normal)',
            ],
            interactions: [
                'Não tomar junto com cálcio ou laticínios',
                'Não tomar junto com chá ou café',
                'Interage com antibióticos - espaçar 2h',
            ],
            estimatedCost: 'R$ 35-55/mês',
            priority: 'high',
        },
        {
            name: 'Magnésio Dimalato',
            dosage: '300-400 mg/dia',
            timing: 'À noite, antes de dormir',
            duration: 'Uso contínuo',
            benefits: [
                'Melhora qualidade do sono',
                'Reduz cãibras musculares',
                'Ajuda no relaxamento',
                'Suporta saúde cardiovascular',
            ],
            warnings: [
                'Pode causar diarreia em doses altas',
                'Começar com dose menor e aumentar gradualmente',
            ],
            interactions: [
                'Pode interagir com antibióticos',
                'Reduz absorção de alguns medicamentos',
            ],
            estimatedCost: 'R$ 40-60/mês',
            priority: 'medium',
        },
        {
            name: 'Ômega-3 (EPA/DHA)',
            dosage: '1.000-2.000 mg/dia (EPA+DHA)',
            timing: 'Junto com refeições',
            duration: 'Uso contínuo',
            benefits: [
                'Reduz inflamação',
                'Melhora saúde cardiovascular',
                'Suporta função cerebral',
                'Melhora perfil lipídico',
            ],
            warnings: [
                'Escolher marca com certificação de pureza',
                'Pode causar "arroto de peixe" - congelar cápsulas ajuda',
            ],
            interactions: [
                'Pode aumentar risco de sangramento com anticoagulantes',
                'Cuidado se tomar aspirina regularmente',
            ],
            estimatedCost: 'R$ 60-100/mês',
            priority: 'medium',
        },
    ];

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisComplete(true);
            toast.success('Análise de nutrientes concluída!');
        }, 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical':
                return 'text-red-600';
            case 'low':
                return 'text-amber-600';
            case 'adequate':
                return 'text-green-600';
            case 'high':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            low: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
            adequate: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            high: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        };
        const labels = {
            critical: 'Crítico',
            low: 'Baixo',
            adequate: 'Adequado',
            high: 'Alto',
        };
        return (
            <Badge className={config[status as keyof typeof config]}>
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const config = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-amber-100 text-amber-800',
            low: 'bg-blue-100 text-blue-800',
        };
        const labels = {
            high: 'Alta Prioridade',
            medium: 'Média Prioridade',
            low: 'Baixa Prioridade',
        };
        return (
            <Badge className={config[priority as keyof typeof config]}>
                {labels[priority as keyof typeof labels]}
            </Badge>
        );
    };

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Pill className="h-8 w-8 text-primary" />
                        Consultor de Suplementos com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Análise de deficiências nutricionais e recomendações personalizadas
                    </p>
                </div>

                {/* Patient Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Selecionar Paciente</CardTitle>
                        <CardDescription>Escolha o paciente para análise de suplementação</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="flex items-end">
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    onClick={handleAnalyze}
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
                                            Analisar Nutrientes
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
                                        Análise Inteligente de Nutrientes
                                    </h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        Nossa IA analisa exames laboratoriais, diário alimentar e sintomas para
                                        identificar deficiências nutricionais e recomendar suplementação personalizada.
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                        Custo: 25 créditos (R$ 0,50)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {analysisComplete && (
                    <>
                        {/* Tabs */}
                        <Tabs defaultValue="gaps" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="gaps">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Deficiências
                                </TabsTrigger>
                                <TabsTrigger value="recommendations">
                                    <Pill className="w-4 h-4 mr-2" />
                                    Recomendações
                                </TabsTrigger>
                                <TabsTrigger value="interactions">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Interações
                                </TabsTrigger>
                            </TabsList>

                            {/* Nutrient Gaps Tab */}
                            <TabsContent value="gaps" className="space-y-4 mt-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Análise de Nutrientes</h2>
                                    <Badge variant="outline">
                                        {nutrientGaps.filter(g => g.status === 'critical' || g.status === 'low').length} deficiências encontradas
                                    </Badge>
                                </div>

                                <div className="grid gap-4">
                                    {nutrientGaps.map((gap, idx) => (
                                        <Card key={idx}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{gap.nutrient}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Atual: {gap.current} {gap.unit} • Meta: {gap.target} {gap.unit}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(gap.status)}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">Nível Atual</span>
                                                        <span className={`font-bold ${getStatusColor(gap.status)}`}>
                                                            {gap.percentage}%
                                                        </span>
                                                    </div>
                                                    <Progress value={gap.percentage} className="h-2" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Recommendations Tab */}
                            <TabsContent value="recommendations" className="space-y-4 mt-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Recomendações de Suplementos</h2>
                                    <Badge variant="outline">
                                        {recommendations.length} suplementos recomendados
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    {recommendations.map((rec, idx) => (
                                        <Card key={idx} className="overflow-hidden">
                                            <CardHeader className="bg-muted/50">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{rec.name}</CardTitle>
                                                        <CardDescription className="mt-1">
                                                            {rec.dosage} • {rec.timing}
                                                        </CardDescription>
                                                    </div>
                                                    {getPriorityBadge(rec.priority)}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                                {/* Dosage & Timing */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Duração</p>
                                                        <p className="text-sm text-muted-foreground">{rec.duration}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4" />
                                                            Custo Estimado
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">{rec.estimatedCost}</p>
                                                    </div>
                                                </div>

                                                {/* Benefits */}
                                                <div>
                                                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        Benefícios
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {rec.benefits.map((benefit, bIdx) => (
                                                            <li key={bIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                <span className="text-green-600 mt-0.5">✓</span>
                                                                <span>{benefit}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Warnings */}
                                                <div>
                                                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                        Avisos Importantes
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {rec.warnings.map((warning, wIdx) => (
                                                            <li key={wIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                <span className="text-amber-600 mt-0.5">⚠</span>
                                                                <span>{warning}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Interactions */}
                                                {rec.interactions.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                                            <Info className="h-4 w-4 text-blue-600" />
                                                            Interações
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {rec.interactions.map((interaction, iIdx) => (
                                                                <li key={iIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                    <span className="text-blue-600 mt-0.5">ℹ</span>
                                                                    <span>{interaction}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Interactions Tab */}
                            <TabsContent value="interactions" className="space-y-4 mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Matriz de Interações</CardTitle>
                                        <CardDescription>
                                            Interações entre suplementos e medicamentos
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                                                <div className="flex gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-amber-900 dark:text-amber-100 text-sm mb-2">
                                                            Atenção: Interações Importantes
                                                        </h4>
                                                        <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                                                            <li>• Ferro não deve ser tomado junto com cálcio ou laticínios</li>
                                                            <li>• Magnésio pode reduzir absorção de alguns antibióticos</li>
                                                            <li>• Ômega-3 pode aumentar risco de sangramento com anticoagulantes</li>
                                                            <li>• Vitamina D aumenta absorção de cálcio - monitorar níveis</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                                <div className="flex gap-3">
                                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
                                                            Recomendações de Horários
                                                        </h4>
                                                        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                                                            <li>• <strong>Manhã (jejum):</strong> Complexo B, Ferro</li>
                                                            <li>• <strong>Almoço:</strong> Vitamina D, Ômega-3</li>
                                                            <li>• <strong>Jantar:</strong> Ômega-3 (se não tomou no almoço)</li>
                                                            <li>• <strong>Noite:</strong> Magnésio (melhora sono)</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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

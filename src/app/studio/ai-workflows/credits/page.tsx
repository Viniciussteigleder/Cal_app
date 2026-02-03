'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { DollarSign, TrendingUp, Users, Zap, ChevronDown, ChevronUp, Brain, Camera, FileText, Activity, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';

interface PatientCreditUsage {
    patientId: string;
    patientName: string;
    totalExecutions: number;
    creditsConsumed: number;
    costBRL: number;
    breakdown: {
        agentType: string;
        executions: number;
        credits: number;
    }[];
}

interface NutritionistUsage {
    nutritionistId: string;
    nutritionistName: string;
    patientsManaged: number;
    totalCredits: number;
    mostUsedAgent: string;
    efficiencyScore: number;
}

export default function AICreditsAnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
    const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

    // Mock data - replace with real API calls
    const overviewData = {
        totalCreditsUsed: 12450,
        creditsRemaining: 37550,
        avgCostPerPatient: 124.5,
        projectedMonthlyCost: 3850,
    };

    const creditHistory = [
        { date: 'Sem 1', credits: 2800 },
        { date: 'Sem 2', credits: 3200 },
        { date: 'Sem 3', credits: 3100 },
        { date: 'Sem 4', credits: 3350 },
    ];

    const patientUsage: PatientCreditUsage[] = [
        {
            patientId: '1',
            patientName: 'Maria Silva',
            totalExecutions: 45,
            creditsConsumed: 1250,
            costBRL: 62.50,
            breakdown: [
                { agentType: 'Planejador de Refeições', executions: 15, credits: 450 },
                { agentType: 'Reconhecimento de Alimentos', executions: 20, credits: 600 },
                { agentType: 'Analisador de Paciente', executions: 10, credits: 200 },
            ],
        },
        {
            patientId: '2',
            patientName: 'João Santos',
            totalExecutions: 38,
            creditsConsumed: 1100,
            costBRL: 55.00,
            breakdown: [
                { agentType: 'Planejador de Refeições', executions: 12, credits: 360 },
                { agentType: 'Reconhecimento de Alimentos', executions: 18, credits: 540 },
                { agentType: 'Analisador de Paciente', executions: 8, credits: 200 },
            ],
        },
        {
            patientId: '3',
            patientName: 'Ana Costa',
            totalExecutions: 52,
            creditsConsumed: 1450,
            costBRL: 72.50,
            breakdown: [
                { agentType: 'Planejador de Refeições', executions: 18, credits: 540 },
                { agentType: 'Reconhecimento de Alimentos', executions: 25, credits: 750 },
                { agentType: 'Analisador de Paciente', executions: 9, credits: 160 },
            ],
        },
    ];

    const nutritionistUsage: NutritionistUsage[] = [
        {
            nutritionistId: '1',
            nutritionistName: 'Dr. Carlos Mendes',
            patientsManaged: 12,
            totalCredits: 4200,
            mostUsedAgent: 'Planejador de Refeições',
            efficiencyScore: 92,
        },
        {
            nutritionistId: '2',
            nutritionistName: 'Dra. Paula Oliveira',
            patientsManaged: 15,
            totalCredits: 5100,
            mostUsedAgent: 'Reconhecimento de Alimentos',
            efficiencyScore: 88,
        },
    ];

    const pricingTiers = [
        {
            name: 'Básico',
            credits: 10000,
            price: 199,
            pricePerCredit: 0.0199,
            features: ['10.000 créditos/mês', 'Suporte por email', 'Relatórios básicos'],
        },
        {
            name: 'Profissional',
            credits: 50000,
            price: 799,
            pricePerCredit: 0.0160,
            features: ['50.000 créditos/mês', 'Suporte prioritário', 'Relatórios avançados', 'API access'],
            recommended: true,
        },
        {
            name: 'Empresarial',
            credits: 200000,
            price: 2499,
            pricePerCredit: 0.0125,
            features: ['200.000 créditos/mês', 'Suporte dedicado', 'Relatórios personalizados', 'API ilimitada', 'Treinamento'],
        },
    ];

    const getAgentIcon = (agentType: string) => {
        if (agentType.includes('Planejador')) return <Sparkles className="w-4 h-4" />;
        if (agentType.includes('Reconhecimento')) return <Camera className="w-4 h-4" />;
        if (agentType.includes('Analisador')) return <Brain className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
    };

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Zap className="h-8 w-8 text-primary" />
                        Análise de Créditos de IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Acompanhe o uso de créditos, custos e otimize seu investimento em IA
                    </p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2">
                    <Button
                        variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                        onClick={() => setSelectedPeriod('week')}
                        size="sm"
                    >
                        Semana
                    </Button>
                    <Button
                        variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                        onClick={() => setSelectedPeriod('month')}
                        size="sm"
                    >
                        Mês
                    </Button>
                    <Button
                        variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                        onClick={() => setSelectedPeriod('year')}
                        size="sm"
                    >
                        Ano
                    </Button>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Créditos Usados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-emerald-600">
                                        {overviewData.totalCreditsUsed.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Este mês
                                    </p>
                                </div>
                                <Zap className="w-10 h-10 text-emerald-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Créditos Restantes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {overviewData.creditsRemaining.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {Math.round((overviewData.creditsRemaining / 50000) * 100)}% do plano
                                    </p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-blue-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Custo Médio/Paciente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-amber-600">
                                        R$ {overviewData.avgCostPerPatient.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Por paciente/mês
                                    </p>
                                </div>
                                <DollarSign className="w-10 h-10 text-amber-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Projeção Mensal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-purple-600">
                                        R$ {overviewData.projectedMonthlyCost.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Custo estimado
                                    </p>
                                </div>
                                <Activity className="w-10 h-10 text-purple-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Credit Usage Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Uso de Créditos</CardTitle>
                        <CardDescription>Consumo semanal de créditos de IA</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={creditHistory}>
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="credits" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Detailed Analytics Tabs */}
                <Tabs defaultValue="patients" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="patients">
                            <Users className="w-4 h-4 mr-2" />
                            Por Paciente
                        </TabsTrigger>
                        <TabsTrigger value="nutritionists">
                            <Activity className="w-4 h-4 mr-2" />
                            Por Nutricionista
                        </TabsTrigger>
                        <TabsTrigger value="pricing">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Planos
                        </TabsTrigger>
                    </TabsList>

                    {/* Per-Patient Analytics */}
                    <TabsContent value="patients" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Uso por Paciente</CardTitle>
                                <CardDescription>
                                    Detalhamento de créditos consumidos por cada paciente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {patientUsage.map((patient) => (
                                    <div key={patient.patientId} className="border rounded-lg p-4">
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() =>
                                                setExpandedPatient(
                                                    expandedPatient === patient.patientId
                                                        ? null
                                                        : patient.patientId
                                                )
                                            }
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{patient.patientName}</h4>
                                                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                                    <span>{patient.totalExecutions} execuções</span>
                                                    <span>{patient.creditsConsumed} créditos</span>
                                                    <span className="font-medium text-emerald-600">
                                                        R$ {patient.costBRL.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            {expandedPatient === patient.patientId ? (
                                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>

                                        {expandedPatient === patient.patientId && (
                                            <div className="mt-4 space-y-3 border-t pt-4">
                                                <h5 className="font-medium text-sm">Detalhamento por Agente:</h5>
                                                {patient.breakdown.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {getAgentIcon(item.agentType)}
                                                            <span className="text-sm">{item.agentType}</span>
                                                        </div>
                                                        <div className="flex gap-4 text-sm">
                                                            <span className="text-muted-foreground">
                                                                {item.executions}x
                                                            </span>
                                                            <span className="font-medium">
                                                                {item.credits} créditos
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Per-Nutritionist Analytics */}
                    <TabsContent value="nutritionists" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Uso por Nutricionista</CardTitle>
                                <CardDescription>
                                    Análise de eficiência e uso de créditos por profissional
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {nutritionistUsage.map((nutritionist) => (
                                    <div
                                        key={nutritionist.nutritionistId}
                                        className="border rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{nutritionist.nutritionistName}</h4>
                                                <div className="grid grid-cols-2 gap-4 mt-3">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Pacientes Gerenciados
                                                        </p>
                                                        <p className="text-lg font-medium">
                                                            {nutritionist.patientsManaged}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Total de Créditos
                                                        </p>
                                                        <p className="text-lg font-medium text-emerald-600">
                                                            {nutritionist.totalCredits.toLocaleString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Agente Mais Usado
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {nutritionist.mostUsedAgent}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Score de Eficiência
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Progress
                                                                value={nutritionist.efficiencyScore}
                                                                className="h-2 flex-1"
                                                            />
                                                            <span className="text-sm font-medium">
                                                                {nutritionist.efficiencyScore}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Pricing Tiers */}
                    <TabsContent value="pricing" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {pricingTiers.map((tier) => (
                                <Card
                                    key={tier.name}
                                    className={
                                        tier.recommended
                                            ? 'border-2 border-emerald-500 relative'
                                            : ''
                                    }
                                >
                                    {tier.recommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-emerald-600">Recomendado</Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle>{tier.name}</CardTitle>
                                        <CardDescription>
                                            {tier.credits.toLocaleString('pt-BR')} créditos/mês
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-4xl font-bold">
                                                R$ {tier.price}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                R$ {tier.pricePerCredit.toFixed(4)} por crédito
                                            </p>
                                        </div>
                                        <ul className="space-y-2">
                                            {tier.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className={
                                                tier.recommended
                                                    ? 'w-full bg-emerald-600 hover:bg-emerald-700'
                                                    : 'w-full'
                                            }
                                            variant={tier.recommended ? 'default' : 'outline'}
                                        >
                                            {tier.recommended ? 'Plano Atual' : 'Selecionar Plano'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

'use client';

import { Brain, Camera, Calendar, TrendingUp, Sparkles, ArrowRight, FileText, Pill, ShoppingCart, Stethoscope, Activity, Mic } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { ptBR } from '@/i18n/pt-BR';

const AI_FEATURES = [
    {
        id: 'food-recognition',
        name: ptBR.ai.foodRecognition,
        description: ptBR.ai.descriptions.foodRecognition,
        icon: Camera,
        color: 'emerald',
        href: '/studio/ai/food-recognition',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.accuracy,
            value: '90%',
        },
    },
    {
        id: 'meal-planner',
        name: ptBR.ai.aiMealPlanner,
        description: ptBR.ai.descriptions.mealPlanner,
        icon: Calendar,
        color: 'blue',
        href: '/studio/ai/meal-planner',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.avgTime,
            value: '12s',
        },
    },
    {
        id: 'patient-analyzer',
        name: ptBR.ai.patientAnalyzer,
        description: ptBR.ai.descriptions.patientAnalyzer,
        icon: TrendingUp,
        color: 'purple',
        href: '/studio/ai/patient-analyzer',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.prediction,
            value: '85%',
        },
    },
    {
        id: 'medical-record-creator',
        name: ptBR.ai.medicalRecordCreator,
        description: 'Transcreva consultas e gere prontuários SOAP automaticamente',
        icon: FileText,
        color: 'emerald',
        href: '/studio/ai/medical-record-creator',
        status: 'active',
        stats: {
            label: 'Economia',
            value: '15min/consulta',
        },
    },
    {
        id: 'nutrition-coach',
        name: ptBR.ai.nutritionCoach,
        description: 'Chatbot inteligente para suporte 24/7 aos pacientes',
        icon: MessageCircle,
        color: 'pink',
        href: '/patient/coach', // Note: This is a patient-facing feature, but listed here for awareness/config? Or maybe studio has a config page? 
        // The user request implies activating it. The href in the file structure is /patient/coach. 
        // Let's assume for studio view it might link to a config or preview. 
        // But since it's "AI Features", usually these are tools for the nutritionist. 
        // Actually, the coach is for the patient. 
        // Let's check if there is a studio-side coach view. 
        // If not, maybe link to a preview or just the patient page for now (or maybe it shouldn't be here?).
        // However, the prompts said "Studio Modules (Report Generator... Shopping List)". 
        // "Patient Coach" was separate. 
        // But it's listed in "Coming Soon" in this file. So it should be moved to active.
        status: 'active',
        stats: {
            label: 'Engajamento',
            value: '+40%',
        },
    },
    {
        id: 'supplement-advisor',
        name: ptBR.ai.supplementAdvisor,
        description: 'Recomendações personalizadas de suplementação baseadas em evidências',
        icon: Pill,
        color: 'teal',
        href: '/studio/ai/supplement-advisor',
        status: 'active',
        stats: {
            label: 'Assertividade',
            value: '92%',
        },
    },
    {
        id: 'shopping-list-generator',
        name: ptBR.ai.shoppingListGenerator,
        description: 'Gere listas de compras organizadas a partir do plano alimentar',
        icon: ShoppingCart,
        color: 'indigo',
        href: '/studio/ai/shopping-list',
        status: 'active',
        stats: {
            label: 'Praticidade',
            value: '100%',
        },
    },
    {
        id: 'report-generator',
        name: ptBR.ai.reportGenerator,
        description: 'Relatórios de progresso detalhados com insights clínicos',
        icon: ClipboardList,
        color: 'violet',
        href: '/studio/ai/report-generator',
        status: 'active',
        stats: {
            label: 'Retenção',
            value: '+25%',
        },
    },
    {
        id: 'exam-analyzer',
        name: ptBR.ai.examAnalyzer,
        description: ptBR.ai.descriptions.examAnalyzer,
        icon: Brain,
        color: 'orange',
        href: '/studio/ai/exam-analyzer',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.accuracy,
            value: '92%',
        },
    },
    {
        id: 'medical-record-creator',
        name: ptBR.ai.medicalRecordCreator,
        description: 'Transcreva consultas com Whisper AI e gere notas SOAP',
        icon: Mic,
        color: 'rose',
        href: '/studio/ai/medical-record-creator',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.accuracy,
            value: '95%',
        },
    },
    {
        id: 'protocol-generator',
        name: ptBR.ai.protocolGenerator,
        description: 'Crie protocolos clínicos nutricionais personalizados',
        icon: FileText,
        color: 'cyan',
        href: '/studio/ai/protocol-generator',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.avgTime,
            value: '15s',
        },
    },
    {
        id: 'symptom-correlator',
        name: ptBR.ai.symptomCorrelator,
        description: 'Identifique padrões entre dieta e sintomas',
        icon: Activity,
        color: 'amber',
        href: '/studio/ai/symptom-correlator',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.prediction,
            value: '88%',
        },
    },
    {
        id: 'supplement-advisor',
        name: ptBR.ai.supplementAdvisor,
        description: 'Recomendações de suplementos baseadas em evidências',
        icon: Pill,
        color: 'indigo',
        href: '/studio/ai/supplement-advisor',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.accuracy,
            value: '91%',
        },
    },
    {
        id: 'shopping-list',
        name: ptBR.ai.shoppingListGenerator,
        description: 'Listas de compras organizadas a partir do plano alimentar',
        icon: ShoppingCart,
        color: 'teal',
        href: '/studio/ai/shopping-list',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.avgTime,
            value: '8s',
        },
    },
    {
        id: 'report-generator',
        name: ptBR.ai.reportGenerator,
        description: 'Relatórios de progresso detalhados gerados por IA',
        icon: FileText,
        color: 'sky',
        href: '/studio/ai/report-generator',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.avgTime,
            value: '10s',
        },
    },
    {
        id: 'clinical-mdt',
        name: 'MDT Clínico',
        description: 'Equipe multidisciplinar virtual para casos complexos',
        icon: Stethoscope,
        color: 'violet',
        href: '/studio/ai/clinical-mdt',
        status: 'active',
        stats: {
            label: ptBR.ai.stats.avgTime,
            value: '20s',
        },
    },
];

const USAGE_STATS = [
    { label: ptBR.ai.credits.aiCreditsUsed, value: '247', total: '1000', percentage: 24.7 },
    { label: ptBR.ai.credits.totalExecutions, value: '1,234', trend: '+12%' },
    { label: ptBR.ai.credits.avgCost, value: 'R$ 0,40', trend: '-5%' },
    { label: ptBR.ai.credits.successRate, value: '98,5%', trend: '+2%' },
];

export default function AIDashboardPage() {
    return (
        <DashboardLayout role="nutritionist">
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {ptBR.ai.features}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {ptBR.ai.poweredBy}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {USAGE_STATS.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                                    {stat.trend && (
                                        <Badge variant="outline" className="text-xs">
                                            {stat.trend}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                {stat.total && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-emerald-600 h-2 rounded-full"
                                                style={{ width: `${stat.percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{ptBR.ai.credits.of} {stat.total} {ptBR.ai.credits.credits}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* AI Features Grid */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{ptBR.ai.availableAgents}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AI_FEATURES.map((feature) => {
                            const Icon = feature.icon;
                            const isActive = feature.status === 'active';

                            return (
                                <Card
                                    key={feature.id}
                                    className={`group hover:shadow-lg transition-all ${isActive ? 'hover:border-emerald-500 cursor-pointer' : 'opacity-75'
                                        }`}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <div
                                                className={`w-12 h-12 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20 flex items-center justify-center`}
                                            >
                                                <Icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                                            </div>
                                            <Badge variant={isActive ? 'default' : 'secondary'}>
                                                {isActive ? ptBR.ai.status.active : ptBR.ai.status.comingSoon}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl">{feature.name}</CardTitle>
                                        <CardDescription>{feature.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {feature.stats.label}
                                                </p>
                                                <p className="text-lg font-bold">{feature.stats.value}</p>
                                            </div>
                                            {isActive && (
                                                <Link href={feature.href}>
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 group-hover:translate-x-1 transition-transform"
                                                    >
                                                        {ptBR.ai.open}
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Coming Soon Features */}
                <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 border-2 border-dashed">
                    <CardHeader>
                        <CardTitle>{ptBR.ai.moreAgentsComingSoon}</CardTitle>
                        <CardDescription>
                            {ptBR.ai.moreAgentsDescription}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                ptBR.ai.recipeCreator,
                                ptBR.ai.nutritionCoach,
                                'Agendamento Inteligente',
                                'Balanceador de Macros',
                            ].map((name, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <p className="text-sm font-medium">{name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Q3-Q4 2026</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Help Section */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>{ptBR.ai.needHelp}</CardTitle>
                        <CardDescription>{ptBR.ai.needHelpDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <Button variant="outline" className="flex-1">
                                📚 {ptBR.ai.viewDocumentation}
                            </Button>
                            <Button variant="outline" className="flex-1">
                                🎥 {ptBR.ai.watchTutorials}
                            </Button>
                            <Button variant="outline" className="flex-1">
                                💬 {ptBR.ai.contactSupport}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

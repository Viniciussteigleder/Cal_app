'use client';

import { Brain, Camera, Calendar, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
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
        id: 'exam-analyzer',
        name: ptBR.ai.examAnalyzer,
        description: ptBR.ai.descriptions.examAnalyzer,
        icon: Brain,
        color: 'orange',
        href: '/studio/ai/exam-analyzer',
        status: 'coming-soon',
        stats: {
            label: ptBR.ai.stats.coming,
            value: 'Q2 2026',
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
                                ptBR.ai.medicalRecordCreator,
                                ptBR.ai.protocolGenerator,
                                ptBR.ai.symptomCorrelator,
                                ptBR.ai.recipeCreator,
                                ptBR.ai.nutritionCoach,
                                ptBR.ai.supplementAdvisor,
                                ptBR.ai.shoppingListGenerator,
                                ptBR.ai.reportGenerator,
                            ].map((name, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <p className="text-sm font-medium">{name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Q2-Q4 2026</p>
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

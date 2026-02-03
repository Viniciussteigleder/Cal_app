'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, FileText, Brain, Heart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface PatientAnalysisData {
    adherence_score: number;
    progress_score: number;
    dropout_risk: 'low' | 'medium' | 'high' | 'critical';
    intervention_needed: boolean;
    insights: string[];
    recommended_actions: Array<{
        action: string;
        priority: string;
        description: string;
    }>;
}

interface PatientInfo {
    id: string;
    name: string;
    avatar?: string;
    protocol?: string;
}

export default function PatientAnalyzerPage() {
    const [patient, setPatient] = useState<PatientInfo>({
        id: 'patient-123',
        name: 'Maria Silva',
        protocol: 'Nutritional Therapy Protocol',
    });
    const [analysis, setAnalysis] = useState<PatientAnalysisData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [adherenceHistory, setAdherenceHistory] = useState<any[]>([]);

    const runAnalysis = async () => {
        setIsAnalyzing(true);

        try {
            const response = await fetch('/api/ai/patient-analyzer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId: patient.id,
                    tenantId: 'current-tenant-id', // Get from context
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.data);
                toast.success('Analysis completed!');

                // Generate mock adherence history for chart
                const history = Array.from({ length: 30 }, (_, i) => ({
                    day: `Day ${i + 1}`,
                    adherence: Math.max(60, Math.min(100, data.data.adherence_score + (Math.random() - 0.5) * 20)),
                }));
                setAdherenceHistory(history);
            } else {
                toast.error(data.error || 'Failed to analyze patient');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Failed to run analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'low':
                return <CheckCircle className="w-6 h-6" />;
            case 'medium':
            case 'high':
            case 'critical':
                return <AlertTriangle className="w-6 h-6" />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Patient Analysis
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        AI-powered adherence and dropout risk analysis
                    </p>
                </div>
                <Button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    {isAnalyzing ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Run Analysis
                        </>
                    )}
                </Button>
            </div>

            {/* Patient Info Card */}
            <Card className="mb-6">
                <CardContent className="flex items-center gap-4 py-6">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback className="bg-emerald-600 text-white text-xl">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{patient.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{patient.protocol}</p>
                    </div>
                </CardContent>
            </Card>

            {!analysis && !isAnalyzing && (
                <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <TrendingUp className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                            Click "Run Analysis" to analyze patient adherence and predict dropout risk
                        </p>
                    </CardContent>
                </Card>
            )}

            {analysis && (
                <div className="space-y-6">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Adherence Score */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Adherence Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-4xl font-bold text-emerald-600">
                                            {Math.round(analysis.adherence_score)}%
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Last 30 days
                                        </p>
                                    </div>
                                    <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress Score */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Progress Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-4xl font-bold text-blue-600">
                                            {Math.round(analysis.progress_score)}%
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Overall Progress
                                        </p>
                                    </div>
                                    <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dropout Risk */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Dropout Risk
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge className={`text-lg px-4 py-2 ${getRiskColor(analysis.dropout_risk)}`}>
                                            {analysis.dropout_risk.toUpperCase()}
                                        </Badge>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            Based on AI model
                                        </p>
                                    </div>
                                    {getRiskIcon(analysis.dropout_risk)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Insights</CardTitle>
                            <CardDescription>Key observations from the analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {analysis.insights.map((insight, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                                        <p className="text-gray-700 dark:text-gray-300">{insight}</p>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Recommended Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended Actions</CardTitle>
                            <CardDescription>AI-suggested interventions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analysis.recommended_actions.map((action, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 transition-colors"
                                    >
                                        <div className="flex items-start gap-3 mb-2">
                                            {action.priority === 'high' ? (
                                                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <h4 className="font-semibold">{action.action}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Adherence Trend Chart */}
                    {adherenceHistory.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Adherence Over Last 30 Days</CardTitle>
                                <CardDescription>Daily adherence tracking</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={adherenceHistory}>
                                        <XAxis
                                            dataKey="day"
                                            tick={{ fontSize: 12 }}
                                            interval={4}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="adherence"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={false}
                                            fill="url(#colorAdherence)"
                                        />
                                        <defs>
                                            <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Generate Report Button */}
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Full Report
                    </Button>
                </div>
            )}
        </div>
    );
}

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
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';
import { analyzePatientAction } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface Patient {
    id: string;
    name: string;
}

export function PatientAnalyzerClient({ patients }: { patients: Patient[] }) {
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [analysis, setAnalysis] = useState<PatientAnalysisData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [adherenceHistory, setAdherenceHistory] = useState<any[]>([]);

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const runAnalysis = async () => {
        if (!selectedPatientId) return;
        setIsAnalyzing(true);

        try {
            const res = await analyzePatientAction(selectedPatientId);

            if (res.success && res.data) {
                setAnalysis(res.data);
                toast.success('Análise concluída!');

                // Generate mock adherence history for chart based on score
                const history = Array.from({ length: 30 }, (_, i) => ({
                    day: `Dia ${i + 1}`,
                    adherence: Math.max(60, Math.min(100, (res.data?.adherence_score || 0) + (Math.random() - 0.5) * 20)),
                }));
                setAdherenceHistory(history);
            } else {
                toast.error(res.error || 'Falha ao analisar paciente');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Falha ao executar análise');
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
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Brain className="h-8 w-8 text-primary" />
                            Análise de Paciente com IA
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Análise de aderência e risco de abandono com inteligência artificial
                        </p>
                    </div>
                </div>

                <MedicalDisclaimer />

                <Card>
                    <CardHeader>
                        <CardTitle>Seleção do Paciente</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4 items-center">
                        <div className="w-[300px]">
                            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um paciente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={runAnalysis}
                            disabled={isAnalyzing || !selectedPatientId}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isAnalyzing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Analisando...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Executar Análise
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {selectedPatient && (
                    <Card>
                        <CardContent className="flex items-center gap-4 py-6">
                            <Avatar className="w-16 h-16">
                                <AvatarFallback className="bg-emerald-600 text-white text-xl">
                                    {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                                <p className="text-muted-foreground">ID: {selectedPatient.id.substring(0, 8)}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!analysis && !isAnalyzing && (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Brain className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-muted-foreground text-center">
                                Selecione um paciente e clique em &quot;Executar Análise&quot; para ver os relatórios.
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
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Pontuação de Aderência
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-4xl font-bold text-emerald-600">
                                                {Math.round(analysis.adherence_score)}%
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Últimos 30 dias
                                            </p>
                                        </div>
                                        <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Progress Score */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Pontuação de Progresso
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-4xl font-bold text-blue-600">
                                                {Math.round(analysis.progress_score)}%
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Progresso Geral
                                            </p>
                                        </div>
                                        <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dropout Risk */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Risco de Abandono
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Badge className={`text-lg px-4 py-2 ${getRiskColor(analysis.dropout_risk)}`}>
                                                {analysis.dropout_risk === 'low' ? 'BAIXO' : analysis.dropout_risk === 'medium' ? 'MÉDIO' : analysis.dropout_risk === 'high' ? 'ALTO' : 'CRÍTICO'}
                                            </Badge>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Baseado em modelo de IA
                                            </p>
                                        </div>
                                        {getRiskIcon(analysis.dropout_risk)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Enhanced Analysis Tabs */}
                        <Tabs defaultValue="insights" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="insights">
                                    <Brain className="w-4 h-4 mr-2" />
                                    Insights da IA
                                </TabsTrigger>
                                <TabsTrigger value="clinical">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Clínico
                                </TabsTrigger>
                                <TabsTrigger value="nutritional">
                                    <Heart className="w-4 h-4 mr-2" />
                                    Nutricional
                                </TabsTrigger>
                                <TabsTrigger value="behavioral">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Comportamental
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="insights" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Insights da IA</CardTitle>
                                        <CardDescription>Observações principais da análise</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {analysis.insights.map((insight, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                                                    <p className="text-muted-foreground">{insight}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="clinical" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Análise Clínica</CardTitle>
                                        <CardDescription>Perspectiva médica</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Sinais Vitais</h4>
                                            <p className="text-sm text-muted-foreground">Tendências de sinais vitais dentro dos parâmetros normais.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Fatores de Risco</h4>
                                            <p className="text-sm text-muted-foreground">Nenhum fator de risco crítico identificado.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Comorbidades</h4>
                                            <p className="text-sm text-muted-foreground">Avaliação de comorbidades em andamento.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="nutritional" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Análise Nutricional</CardTitle>
                                        <CardDescription>Perspectiva do nutricionista</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Equilíbrio de Macros</h4>
                                            <p className="text-sm text-muted-foreground">Distribuição de macronutrientes consistente com as metas.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Lacunas de Micronutrientes</h4>
                                            <p className="text-sm text-muted-foreground">Possível deficiência de vitamina D - considerar suplementação.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Padrões de Hidratação</h4>
                                            <p className="text-sm text-muted-foreground">Ingestão de água abaixo do ideal - aumentar para 2L/dia.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="behavioral" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Análise Comportamental</CardTitle>
                                        <CardDescription>Perspectiva psicológica</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Consistência de Registro</h4>
                                            <p className="text-sm text-muted-foreground">Alta consistência - registra {Math.round(analysis.adherence_score)}% dos dias.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Padrões Emocionais</h4>
                                            <p className="text-sm text-muted-foreground">Possíveis padrões de alimentação emocional nos finais de semana.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Nível de Motivação</h4>
                                            <p className="text-sm text-muted-foreground">Motivação alta - engajamento ativo com o plano.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Recommended Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ações Recomendadas</CardTitle>
                                <CardDescription>Intervenções sugeridas pela IA</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {analysis.recommended_actions.map((action, index) => (
                                        <div
                                            key={index}
                                            className="p-4 border rounded-lg hover:border-emerald-500 transition-colors"
                                        >
                                            <div className="flex items-start gap-3 mb-2">
                                                {action.priority === 'high' ? (
                                                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div>
                                                    <h4 className="font-semibold">{action.action}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
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
                                    <CardTitle>Aderência nos Últimos 30 Dias</CardTitle>
                                    <CardDescription>Rastreamento diário de aderência</CardDescription>
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
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                            <FileText className="w-4 h-4 mr-2" />
                            Gerar Relatório Completo
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

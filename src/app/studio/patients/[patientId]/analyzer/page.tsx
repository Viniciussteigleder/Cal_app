'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BrainCircuit, Activity, AlertTriangle, CheckCircle2, TrendingUp, FileText } from 'lucide-react';
import { runClinicalAnalysisAction } from './actions';
import { toast } from 'sonner';

export default function ClinicalAnalyzerPage({ params }: { params: { patientId: string } }) {
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState("30");
    const [analysis, setAnalysis] = useState<any>(null);

    const handleRunAnalysis = async () => {
        setLoading(true);
        try {
            const result = await runClinicalAnalysisAction(params.patientId, parseInt(period));
            if (result.success) {
                setAnalysis(result.analysis);
                toast.success("Análise clínica concluída com sucesso.");
            } else {
                toast.error(result.error || "Erro ao executar análise.");
            }
        } catch (error) {
            toast.error("Erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clinical Copilot</h1>
                    <p className="text-slate-500 mt-1">Inteligência Artificial para análise profunda de comportamento e riscos.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Últimos 7 dias</SelectItem>
                            <SelectItem value="14">Últimos 14 dias</SelectItem>
                            <SelectItem value="30">Últimos 30 dias</SelectItem>
                            <SelectItem value="60">Últimos 60 dias</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleRunAnalysis}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando Dados...</>
                        ) : (
                            <><BrainCircuit className="mr-2 h-4 w-4" /> Executar Análise Completa</>
                        )}
                    </Button>
                </div>
            </div>

            {!analysis && !loading && (
                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-16 w-16 bg-indigo-100/50 rounded-full flex items-center justify-center mb-6">
                            <BrainCircuit className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Nenhuma análise gerada ainda</h3>
                        <p className="text-slate-500 max-w-sm mt-2">
                            Selecione um período e clique em "Executar Análise" para que a IA processe os dados de refeições, sintomas e evolução do paciente.
                        </p>
                    </CardContent>
                </Card>
            )}

            {analysis && (
                <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Adesão (Score)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-slate-900">{analysis.adherence_score ?? 'N/A'}%</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Progresso (Score)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-slate-900">{analysis.progress_score ?? 'N/A'}%</div>
                            </CardContent>
                        </Card>

                        <Card className={`border-l-4 shadow-sm ${analysis.dropout_risk === 'high' || analysis.dropout_risk === 'critical' ? 'border-l-red-500 bg-red-50/10' :
                                analysis.dropout_risk === 'medium' ? 'border-l-yellow-500 bg-yellow-50/10' : 'border-l-emerald-500 bg-emerald-50/10'
                            }`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Risco de Abandono</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold capitalize ${analysis.dropout_risk === 'high' || analysis.dropout_risk === 'critical' ? 'text-red-600' :
                                        analysis.dropout_risk === 'medium' ? 'text-yellow-600' : 'text-emerald-600'
                                    }`}>
                                    {analysis.dropout_risk ?? 'Desconhecido'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={`${analysis.intervention_needed ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'} shadow-sm`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium bg-transparent uppercase tracking-wide opacity-80">Intervenção</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    {analysis.intervention_needed ? (
                                        <><AlertTriangle className="h-6 w-6 text-red-600" /><span className="text-lg font-bold text-red-700">Necessária</span></>
                                    ) : (
                                        <><CheckCircle2 className="h-6 w-6 text-emerald-600" /><span className="text-lg font-bold text-emerald-700">Não Necessária</span></>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Clinical Reasoning */}
                        <Card className="shadow-lg shadow-indigo-900/5">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-indigo-500" />
                                    <CardTitle>Raciocínio Clínico</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                    {analysis.clinical_reasoning || "Nenhum raciocínio clínico gerado."}
                                </div>

                                {analysis.suspected_deficiencies?.length > 0 && (
                                    <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <h4 className="flex items-center gap-2 font-semibold text-amber-800 mb-2">
                                            <AlertTriangle className="h-4 w-4" /> Deficiências Suspeitas
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.suspected_deficiencies.map((def: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-amber-100 text-amber-900 text-xs font-medium rounded-md border border-amber-200">
                                                    {def}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions Plan */}
                        <Card className="shadow-lg shadow-emerald-900/5">
                            <CardHeader className="bg-emerald-50/30 border-b">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    <CardTitle>Plano de Ação Sugerido</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {analysis.recommended_actions?.map((action: any, i: number) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${action.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                                    action.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                                                }`} />
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{action.action}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Insights */}
                    {analysis.insights?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <CardTitle>Insights Adicionais</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {analysis.insights.map((insight: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-slate-600">
                                            <span className="text-blue-500 font-bold">•</span>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

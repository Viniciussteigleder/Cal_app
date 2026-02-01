'use client';

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    Activity,
    MessageCircle,
    ArrowRight,
    Flame,
    Clock,
    CheckCircle2,
    Zap,
    TrendingUp,
    Filter
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Simulation Data: "Week 2" Clinical Reality
const CLINICAL_ALERTS = [
    {
        id: 1,
        patient: "Carla Executiva",
        type: "SOS",
        level: "critical", // Red
        message: "SOS: Dor Nível 8 (Inchaço), Taquicardia.",
        trigger: "Almoço de Negócios (Restaurante)",
        timestamp: "14:30 (Há 15min)",
        actionRequired: "Contactar paciente",
    },
    {
        id: 2,
        patient: "Ana Histamina",
        type: "Histamine Spike",
        level: "warning", // Amber
        message: "Registrou 'Sobras de Frango' + Enxaqueca.",
        trigger: "Jantar (Ontem)",
        timestamp: "09:00",
        actionRequired: "Revisar protocolo",
    },
    {
        id: 3,
        patient: "Felipe Estudante",
        type: "Symptom",
        level: "watch", // Blue
        message: "Nevoeiro Mental persistente (3 dias).",
        trigger: "Kombucha (Fermentado)",
        timestamp: "10:15",
        actionRequired: "Monitorar",
    },
];

const HISTAMINE_BUCKET_STATUS = [
    { patient: "Ana Silva", load: 85, trend: "up", status: "Critical" },
    { patient: "Beto Atleta", load: 45, trend: "stable", status: "Stable" },
    { patient: "Carla Exec", load: 92, trend: "up", status: "Overload" },
    { patient: "Dona Elza", load: 20, trend: "down", status: "Great" },
];

export default function StudioDashboard() {
    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-8 animate-in fade-in duration-500">

                {/* Header: Clinical Command Center */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Painel Clínico</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Controle (Disbiose)</h1>
                        <p className="text-slate-500 max-w-xl text-sm mt-1">
                            Monitoramento em tempo real de carga histamínica e integridade da barreira intestinal.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-slate-200">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                            + Nova Consulta
                        </Button>
                    </div>
                </div>

                {/* TOP ROW: Vital Signals Triage */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Sinais Vitais do Consultório (Hoje)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* CARD 1: SOS ALERTS (The "Emergency" Bucket) */}
                        <Card className="border-l-4 border-l-red-500 shadow-sm md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-red-900 flex justify-between items-center text-base">
                                    <span>🚨 Alertas Prioritários (Ação Imediata)</span>
                                    <Badge variant="destructive" className="animate-pulse">3 Novos</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                {CLINICAL_ALERTS.map((alert) => (
                                    <div key={alert.id} className="group flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex gap-3">
                                            <div className={`mt-1 h-2 w-2 rounded-full ${alert.level === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-slate-800">{alert.patient}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">{alert.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium">{alert.message}</p>
                                                <p className="text-xs text-slate-400">Gatilho: {alert.trigger}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 bg-green-50 text-green-700 hover:bg-green-100">
                                                            <MessageCircle className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Abrir WhatsApp</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* CARD 2: HISTAMINE BUCKET LOAD (The "Trends" Bucket) */}
                        <Card className="bg-slate-900 text-white border-none shadow-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    Carga Histamínica
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-xs">
                                    Pacientes próximos do limiar de tolerância.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {HISTAMINE_BUCKET_STATUS.map((stat, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-slate-300">{stat.patient}</span>
                                            <span className={`font-bold ${stat.load > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {stat.status} ({stat.load}%)
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${stat.load > 80 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${stat.load}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="link" className="text-xs text-slate-400 w-full mt-2 hover:text-white">
                                    Ver análise completa da coorte
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* BOTTOM ROW: Deep Dive & Patterns */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Correlações Descobertas (IA)
                    </h2>
                    <Card className="border-slate-100 shadow-sm">
                        <div className="divide-y divide-slate-100">
                            <div className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Zap className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-medium text-slate-900">Padrão Identificado: Ana Silva</h4>
                                        <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-100">Alta Confiança (92%)</Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Correlação forte detectada entre consumo de <span className="font-semibold text-slate-900">Alimentos Reaquecidos (Sobras)</span> e episódios de <span className="font-semibold text-slate-900">Enxaqueca</span>.
                                        O intervalo médio é de 45-60 min.
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <Button size="sm" variant="outline" className="text-xs h-7">Ver Logs Originais</Button>
                                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs h-7">Sugerir Protocolo "Low Histamine"</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-medium text-slate-900">Feedback: Beto Atleta</h4>
                                        <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100">Feedback Positivo</Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Paciente relatou 0 desconforto pós-treino após substituir Whey Protein por Proteína de Arroz, conforme sugerido semana passada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>
        </DashboardLayout>
    );
}

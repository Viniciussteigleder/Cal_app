'use client';

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    MessageCircle,
    ArrowRight,
    Flame,
    Clock,
    Zap,
    TrendingUp,
    Filter,
    BarChart3
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
    },
    {
        id: 2,
        patient: "Ana Histamina",
        type: "Histamine Spike",
        level: "warning", // Amber
        message: "Registrou 'Sobras de Frango' + Enxaqueca.",
        trigger: "Jantar (Ontem)",
        timestamp: "09:00",
    },
    {
        id: 3,
        patient: "Felipe Estudante",
        type: "Symptom",
        level: "watch", // Blue
        message: "Nevoeiro Mental persistente (3 dias).",
        trigger: "Kombucha (Fermentado)",
        timestamp: "10:15",
    },
];

const HISTAMINE_BUCKET_STATUS = [
    { patient: "Ana Silva", load: 85, trend: "up", status: "Critical" },
    { patient: "Beto Atleta", load: 45, trend: "stable", status: "Stable" },
    { patient: "Carla Exec", load: 92, trend: "up", status: "Overload" },
    { patient: "Dona Elza", load: 20, trend: "down", status: "Great" },
];

// Mock Data for History Chart
const CONSULTATION_HISTORY = [
    { month: "Jan", count: 42 },
    { month: "Fev", count: 45 },
    { month: "Mar", count: 48 },
    { month: "Abr", count: 51 },
    { month: "Mai", count: 49 },
    { month: "Jun", count: 53 },
    { month: "Jul", count: 58 },
    { month: "Ago", count: 62 },
    { month: "Set", count: 65 },
    { month: "Out", count: 61 },
    { month: "Nov", count: 68 },
    { month: "Dez", count: 72 },
];
// Average of last 12 months mock
const AVERAGE_COUNT = 56;

function ConsultationHistoryChart() {
    const maxVal = Math.max(...CONSULTATION_HISTORY.map(d => d.count)) * 1.2;

    return (
        <div className="w-full h-48 flex items-end justify-between gap-2 pt-6 relative">
            {/* Average Line */}
            <div
                className="absolute w-full border-t-2 border-slate-700 dark:border-slate-400 border-dashed flex items-center"
                style={{ bottom: `${(AVERAGE_COUNT / maxVal) * 100}%` }}
            >
                <span className="text-[10px] bg-card px-1 absolute -right-0 -top-2.5 text-muted-foreground font-medium border rounded shadow-sm">
                    Média 12m: {AVERAGE_COUNT}
                </span>
            </div>

            {CONSULTATION_HISTORY.map((item, idx) => {
                const heightPct = (item.count / maxVal) * 100;
                return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group relative">
                        <div
                            className="w-full bg-emerald-200 dark:bg-emerald-900/40 rounded-t-sm group-hover:bg-emerald-400 dark:group-hover:bg-emerald-600 transition-colors relative"
                            style={{ height: `${heightPct}%` }}
                        >
                            {/* Value Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap font-bold">
                                {item.count} pacientes
                            </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">{item.month}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default function StudioDashboard() {
    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-8 animate-in fade-in duration-500 pb-10">

                {/* Header: Clinical Command Center */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Painel Clínico</span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Centro de Controle</h1>
                        <p className="text-muted-foreground max-w-xl text-sm mt-1">
                            Monitoramento em tempo real de carga histamínica e integridade da barreira intestinal.
                        </p>
                    </div>
                </div>

                {/* SECTION: Business Overview (Chart) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="col-span-1 lg:col-span-2 shadow-sm border-none bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950/50">
                        <CardHeader className="pb-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">Histórico de Consultas</CardTitle>
                                    <CardDescription>Crescimento mensal de pacientes atendidos.</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-background">Jan - Dez 2025</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ConsultationHistoryChart />
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 flex flex-col justify-center bg-emerald-600 text-white border-none shadow-xl shadow-emerald-900/20">
                        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div className="text-5xl font-bold tracking-tighter">72</div>
                                <div className="text-emerald-100 text-sm font-medium uppercase tracking-wide mt-1">Pacientes este mês</div>
                            </div>
                            <div className="w-full h-px bg-emerald-500/50 my-2" />
                            <div className="flex justify-between w-full px-4 text-sm text-emerald-50">
                                <span>Média 12m:</span>
                                <span className="font-bold">56</span>
                            </div>
                            <div className="flex justify-between w-full px-4 text-sm text-emerald-50">
                                <span>Crescimento:</span>
                                <span className="font-bold">+12%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* TOP ROW: Vital Signals Triage */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Sinais Vitais do Consultório (Hoje)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* CARD 1: SOS ALERTS (The "Emergency" Bucket) */}
                        <Card className="border-l-4 border-l-red-500 shadow-sm md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-red-900 dark:text-red-400 flex justify-between items-center text-base">
                                    <span>🚨 Alertas Prioritários (Ação Imediata)</span>
                                    <Badge variant="destructive" className="animate-pulse">3 Novos</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                {CLINICAL_ALERTS.map((alert) => (
                                    <div key={alert.id} className="group flex items-start justify-between p-3 rounded-lg bg-muted/30 border border-border bg-card hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex gap-3">
                                            <div className={`mt-1 h-2 w-2 rounded-full ${alert.level === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-foreground">{alert.patient}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono bg-muted px-1 rounded">{alert.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground font-medium">{alert.message}</p>
                                                <p className="text-xs text-slate-400">Gatilho: {alert.trigger}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 bg-green-50 dark:bg-green-950/20 text-green-700 hover:bg-green-100">
                                                            <MessageCircle className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Abrir WhatsApp</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* CARD 2: HISTAMINE BUCKET LOAD (The "Trends" Bucket) */}
                        <Card className="bg-slate-900 dark:bg-slate-800 text-white border-none shadow-card">
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
                                    Ver análise completa
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* BOTTOM ROW: Deep Dive & Patterns */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Correlações Descobertas (IA)
                    </h2>
                    <Card className="border-border shadow-sm">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="p-4 flex items-start gap-4 hover:bg-muted/30/50 transition-colors cursor-pointer">
                                <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                    <Zap className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-medium text-foreground">Padrão Identificado: Ana Silva</h4>
                                        <Badge variant="outline" className="text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-100">Alta Confiança (92%)</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Correlação forte detectada entre consumo de <span className="font-semibold text-foreground">Alimentos Reaquecidos (Sobras)</span> e episódios de <span className="font-semibold text-foreground">Enxaqueca</span>.
                                        O intervalo médio é de 45-60 min.
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <Button size="sm" variant="outline" className="text-xs h-7">Ver Logs Originais</Button>
                                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs h-7 text-white">Sugerir Protocolo &quot;Low Histamine&quot;</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex items-start gap-4 hover:bg-muted/30/50 transition-colors cursor-pointer">
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-medium text-foreground">Feedback: Beto Atleta</h4>
                                        <Badge variant="outline" className="text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-100">Feedback Positivo</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
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

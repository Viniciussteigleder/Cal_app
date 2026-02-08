"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Weight, Activity, Droplets, Zap, TrendingDown, Ruler } from "lucide-react";

export default function ProgressPage() {
    return (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Meu Progresso</h1>
                        <p className="text-muted-foreground text-sm">Visualizando últimos 30 dias</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-card">Exportar Relatório</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                            + Registrar Peso
                        </Button>
                    </div>
                </header>

                {/* Big Chart Area (Mocked with CSS/SVG) */}
                <Card className="border-none shadow-card bg-card p-6 relative overflow-hidden">
                    <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg text-foreground flex items-center gap-2">
                                <Weight className="h-5 w-5 text-emerald-500" />
                                Evolução de Peso
                            </CardTitle>
                            <p className="text-3xl font-bold text-foreground mt-2">72.4 kg <span className="text-sm font-medium text-emerald-600 ml-2">-1.2kg</span></p>
                        </div>
                        <div className="flex gap-1 bg-muted p-1 rounded-lg">
                            <button className="px-3 py-1 rounded bg-card shadow-sm text-xs font-bold text-foreground">1M</button>
                            <button className="px-3 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground">3M</button>
                            <button className="px-3 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground">6M</button>
                        </div>
                    </CardHeader>

                    {/* Mock Chart Visualization */}
                    <div className="h-64 w-full bg-muted/30 rounded-xl relative flex items-end justify-between px-4 pb-0 pt-10 overflow-hidden border border-slate-100">
                        {/* Grid Lines */}
                        <div className="absolute inset-x-0 top-1/4 h-px bg-border border-dashed border-b" />
                        <div className="absolute inset-x-0 top-2/4 h-px bg-border border-dashed border-b" />
                        <div className="absolute inset-x-0 top-3/4 h-px bg-border border-dashed border-b" />

                        {/* Data Trend Line (SVG) */}
                        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                            <path
                                d="M0,180 C50,170 100,165 150,190 C200,215 250,150 300,140 C350,130 400,145 450,110 C500,75 550,90 600,105 C650,120 700,80 800,60 L800,250 L0,250 Z"
                                fill="url(#gradient)"
                                opacity="0.2"
                            />
                            <path
                                d="M0,180 C50,170 100,165 150,190 C200,215 250,150 300,140 C350,130 400,145 450,110 C500,75 550,90 600,105 C650,120 700,80 800,60"
                                stroke="#10B981"
                                strokeWidth="3"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Data Points (Tooltips implied) */}
                        {[74.0, 73.8, 73.5, 73.9, 73.2, 73.0, 72.4].map((val, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center group cursor-pointer pb-4">
                                <div className="w-3 h-3 bg-card border-2 border-emerald-500 rounded-full group-hover:scale-125 transition-transform shadow-sm mb-2" />
                                <span className="text-[10px] text-muted-foreground font-medium group-hover:text-emerald-600 absolute -bottom-0 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {val} kg
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-card bg-emerald-900 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                                Consistência
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold">12</span>
                                <span className="text-emerald-200 mb-1 font-medium">dias seguidos</span>
                            </div>
                            <p className="text-sm text-emerald-100/80">
                                Você está no <span className="text-white font-bold">top 5%</span> dos pacientes mais consistentes este mês. Continue assim!
                            </p>
                            <div className="mt-6 flex gap-1">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i} className={`flex-1 h-8 rounded-sm ${i >= 12 ? "bg-emerald-800" : "bg-emerald-500"}`} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-card bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Adesão por Refeição</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: "Café da Manhã", val: 95, color: "bg-emerald-500" },
                                { label: "Almoço", val: 88, color: "bg-emerald-400" },
                                { label: "Jantar", val: 72, color: "bg-amber-400" },
                                { label: "Lanches", val: 60, color: "bg-amber-500" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-foreground">{item.label}</span>
                                        <span className="text-muted-foreground">{item.val}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Metrics Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Droplets className="h-5 w-5 text-blue-500" />
                                </div>
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">+15%</span>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Hidratação Média</h3>
                            <p className="text-2xl font-bold text-foreground">2.8L <span className="text-sm text-muted-foreground font-normal">/ dia</span></p>
                            <p className="text-xs text-muted-foreground mt-2">Meta: 3.0L • 93% alcançado</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                </div>
                                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">↑</span>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Energia Média</h3>
                            <p className="text-2xl font-bold text-foreground">7.2 <span className="text-sm text-muted-foreground font-normal">/ 10</span></p>
                            <p className="text-xs text-muted-foreground mt-2">Melhorou 22% vs. mês passado</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Activity className="h-5 w-5 text-purple-500" />
                                </div>
                                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">-35%</span>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Sintomas</h3>
                            <p className="text-2xl font-bold text-foreground">3 <span className="text-sm text-muted-foreground font-normal">/ semana</span></p>
                            <p className="text-xs text-muted-foreground mt-2">Redução significativa</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Body Measurements */}
                <Card className="border-none shadow-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                            <Ruler className="h-5 w-5 text-foreground" />
                            <CardTitle className="text-lg text-foreground">Medidas Corporais</CardTitle>
                        </div>
                        <Button variant="outline" size="sm">+ Adicionar Medição</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { label: "Cintura", current: "82 cm", previous: "85 cm", change: "-3 cm", positive: true },
                                { label: "Quadril", current: "95 cm", previous: "97 cm", change: "-2 cm", positive: true },
                                { label: "% Gordura", current: "22%", previous: "24%", change: "-2%", positive: true },
                                { label: "Massa Magra", current: "56.4 kg", previous: "55.8 kg", change: "+0.6 kg", positive: true },
                            ].map((measurement) => (
                                <div key={measurement.label} className="space-y-2">
                                    <p className="text-sm text-muted-foreground">{measurement.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold text-foreground">{measurement.current}</p>
                                        <div className="flex items-center gap-1">
                                            {measurement.positive ? (
                                                <TrendingDown className="h-3 w-3 text-emerald-500" />
                                            ) : (
                                                <TrendingUp className="h-3 w-3 text-red-500" />
                                            )}
                                            <span className={`text-xs font-medium ${measurement.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {measurement.change}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Anterior: {measurement.previous}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
    );
}

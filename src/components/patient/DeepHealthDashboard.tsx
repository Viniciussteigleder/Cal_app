"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Zap, ShieldCheck, Heart, Info, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeepHealthData {
    upfDistribution: {
        inNatura: number;    // NOVA 1
        processed: number;   // NOVA 2 & 3
        ultraProcessed: number; // NOVA 4
    };
    micronutrientDensity: number; // 0-10 score
    proteinQuality: "High" | "Medium" | "Low";
    inflammatoryScore: number; // 0-100 (lower is better)
}

interface DeepHealthDashboardProps {
    data?: DeepHealthData;
    className?: string;
}

const defaultData: DeepHealthData = {
    upfDistribution: {
        inNatura: 70,
        processed: 20,
        ultraProcessed: 10,
    },
    micronutrientDensity: 8.5,
    proteinQuality: "High",
    inflammatoryScore: 18,
};

export function DeepHealthDashboard({ data = defaultData, className }: DeepHealthDashboardProps) {
    return (
        <TooltipProvider>
            <Card className={cn(
                "relative overflow-hidden border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 rounded-[2rem] p-6 md:p-8",
                className
            )}>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl" />

                <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Brain className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    Inteligência Clínica
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <Sparkles className="h-3 w-3" /> DEPTH-AI ATIVA
                                </div>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 cursor-help">
                                    <Info className="h-4 w-4" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p className="text-xs">Esta análise utiliza IA para processar a qualidade intrínseca dos alimentos, indo além das calorias vazias.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* UPF / NOVA Scale Distribution */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight">Carga de Processados</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-bold border-emerald-100 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    Escala NOVA
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${data.upfDistribution.inNatura}%` }}
                                        title="In natura / Minimamente processados"
                                    />
                                    <div
                                        className="h-full bg-amber-400 transition-all duration-1000 ease-out"
                                        style={{ width: `${data.upfDistribution.processed}%` }}
                                        title="Processados / Ingredientes culinários"
                                    />
                                    <div
                                        className="h-full bg-rose-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${data.upfDistribution.ultraProcessed}%` }}
                                        title="Ultraprocessados"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        In Natura
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                        Processado
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                        Ultra
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                {data.upfDistribution.ultraProcessed > 20
                                    ? "Atenção: A carga de ultraprocessados está elevada, o que pode favorecer inflamação sistêmica."
                                    : "Excelente: Sua dieta é baseada majoritariamente em alimentos reais."}
                            </p>
                        </div>

                        {/* Micro Density & Protein Quality */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 transition-all duration-500">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Densidade</p>
                                    <p className="text-sm font-bold text-slate-500">Micronutrientes</p>
                                </div>
                                <div className="mt-4 flex items-end gap-1">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{data.micronutrientDensity}</span>
                                    <span className="text-xs font-bold text-slate-400 mb-1.5">/10</span>
                                </div>
                                <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                        style={{ width: `${data.micronutrientDensity * 10}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col justify-between p-5 rounded-3xl bg-emerald-600 dark:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 group hover:scale-[1.02] transition-all duration-500">
                                <div>
                                    <Zap className="h-5 w-5 text-emerald-200 mb-2" />
                                    <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Proteína</p>
                                    <p className="text-sm font-bold text-white">Biodisponibilidade</p>
                                </div>
                                <div className="mt-4">
                                    <span className="text-2xl font-black">{data.proteinQuality === "High" ? "ALTA" : data.proteinQuality === "Medium" ? "MÉDIA" : "BAIXA"}</span>
                                    <p className="text-[10px] text-emerald-200 font-medium">PDCAAS Optima</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Insights */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                                <Heart className="h-4 w-4 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">Score Inflamatório</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-rose-500"
                                            style={{ width: `${data.inflammatoryScore}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-rose-600">{data.inflammatoryScore}%</span>
                                </div>
                            </div>
                        </div>

                        <Badge variant="ghost" className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-default">
                            <TrendingUp className="h-3 w-3" /> Tendência Positiva (+8%)
                        </Badge>
                    </div>
                </div>
            </Card>
        </TooltipProvider>
    );
}

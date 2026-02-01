import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, ScanBarcode } from "lucide-react";

export default function DiaryPage() {
    return (
        <DashboardLayout role="patient">
            <div className="max-w-3xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Diário Alimentar</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">Hoje, 24 Jan</span>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                <section className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-xs text-slate-500 block">Kcal</span>
                            <span className="text-lg font-bold text-slate-900">1245</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-xs text-slate-500 block">Prot</span>
                            <span className="text-lg font-bold text-[hsl(var(--macro-protein))]">65g</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-xs text-slate-500 block">Carb</span>
                            <span className="text-lg font-bold text-[hsl(var(--macro-carb))]">120g</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-xs text-slate-500 block">Gord</span>
                            <span className="text-lg font-bold text-[hsl(var(--macro-fat))]">45g</span>
                        </div>
                    </div>
                </section>

                {/* Meal Sections */}
                {["Café da Manhã", "Almoço", "Lanche", "Jantar"].map((meal) => (
                    <Card key={meal} className="p-4 border-none shadow-card bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800">{meal}</h3>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                                + Adicionar
                            </Button>
                        </div>

                        {meal === "Café da Manhã" ? (
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">🥚</div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">Ovos Mexidos</p>
                                    <p className="text-xs text-slate-500">2 unidades grandes</p>
                                </div>
                                <span className="text-xs font-bold text-slate-600">180 kcal</span>
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <p className="text-xs text-slate-400 italic">Nada registrado ainda</p>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
}

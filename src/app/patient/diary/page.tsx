import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, ScanBarcode } from "lucide-react";

export default function DiaryPage() {
    return (
        <DashboardLayout role="patient">
            <div className="max-w-3xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Diário Alimentar</h1>
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
                        <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
                            <span className="text-xs text-muted-foreground block">Kcal</span>
                            <span className="text-lg font-bold text-foreground">1245</span>
                        </div>
                        <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
                            <span className="text-xs text-muted-foreground block">Prot</span>
                            <span className="text-lg font-bold text-[hsl(var(--macro-protein))]">65g</span>
                        </div>
                        <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
                            <span className="text-xs text-muted-foreground block">Carb</span>
                            <span className="text-lg font-bold text-[hsl(var(--macro-carb))]">120g</span>
                        </div>
                        <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
                            <span className="text-xs text-muted-foreground block">Gord</span>
                            <span className="text-lg font-bold text-[hsl(var(--macro-fat))]">45g</span>
                        </div>
                    </div>
                </section>

                {/* Meal Sections */}
                {["Café da Manhã", "Almoço", "Lanche", "Jantar"].map((meal) => (
                    <Card key={meal} className="p-4 border-none shadow-card bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-foreground">{meal}</h3>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                                + Adicionar
                            </Button>
                        </div>

                        {meal === "Café da Manhã" ? (
                            <div className="flex items-center gap-3 p-2 hover:bg-muted/40 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">🥚</div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Ovos Mexidos</p>
                                    <p className="text-xs text-muted-foreground">2 unidades grandes</p>
                                </div>
                                <span className="text-xs font-bold text-slate-600">180 kcal</span>
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <p className="text-xs text-muted-foreground italic">Nada registrado ainda</p>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, ArrowRight, Flame, Droplets, Moon, Check, Search, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";

interface DashboardData {
  profile: { name: string; currentWeight: number; targetWeight: number | null; goal: string } | null;
  today: { calories: number; protein: number; carbs: number; fat: number; mealsLogged: number };
  goals: { calories: number; protein: number; carbs: number; fat: number };
  consistency: { daysThisWeek: number; streak: number };
}

interface FoodItem {
  id: string;
  name: string;
  nutrients: { calories: number; protein: number; carbs: number; fat: number };
  histamineRisk: "low" | "medium" | "high";
}

export default function PatientDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<Array<{ food: FoodItem; grams: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  useEffect(() => {
    const checkSimpleMode = () => {
      setIsSimpleMode(localStorage.getItem('simple-mode') === 'true');
    };
    checkSimpleMode();
    window.addEventListener('storage', checkSimpleMode);
    return () => window.removeEventListener('storage', checkSimpleMode);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch("/api/patient/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const searchFoods = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.foods || []);
      }
    } catch (error) {
      console.error("Error searching foods:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchFoods(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFood = (food: FoodItem) => {
    const existing = selectedFoods.find(sf => sf.food.id === food.id);
    if (existing) {
      setSelectedFoods(selectedFoods.filter(sf => sf.food.id !== food.id));
    } else {
      setSelectedFoods([...selectedFoods, { food, grams: 100 }]);
    }
  };

  const handleLogMeal = async () => {
    if (selectedFoods.length === 0) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/patient/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lunch",
          items: selectedFoods.map(sf => ({
            foodId: sf.food.id,
            grams: sf.grams,
          })),
        }),
      });

      if (response.ok) {
        const totalCal = selectedFoods.reduce((acc, sf) =>
          acc + (sf.food.nutrients.calories * sf.grams / 100), 0
        );

        toast.success(`Refeição registrada!`, {
          description: `+${Math.round(totalCal)} kcal adicionadas ao seu diário.`
        });

        setIsLogging(false);
        setSelectedFoods([]);
        setSearchQuery("");
        setSearchResults([]);
        fetchDashboardData();
      } else {
        throw new Error("Failed to save meal");
      }
    } catch (error) {
      toast.error("Erro ao salvar refeição", {
        description: "Tente novamente em alguns instantes."
      });
      console.error("Error saving meal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const calories = dashboardData?.today.calories || 0;
  const proteins = dashboardData?.today.protein || 0;
  const carbs = dashboardData?.today.carbs || 0;
  const goalCalories = dashboardData?.goals.calories || 2000;
  const goalProtein = dashboardData?.goals.protein || 120;
  const goalCarbs = dashboardData?.goals.carbs || 200;
  const userName = dashboardData?.profile?.name?.split(" ")[0] || "Usuário";
  const streak = dashboardData?.consistency.streak || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (isLoading) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="flex flex-col gap-8 max-w-md mx-auto md:max-w-4xl relative animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{getGreeting()}, {userName}</h1>
            <p className="text-muted-foreground text-sm font-medium">Hoje é um ótimo dia para bater sua meta!</p>
          </div>
          {!isSimpleMode && streak > 0 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-br from-emerald-50 to-white text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-top-2 shadow-sm dark:from-emerald-950/40 dark:to-emerald-900/10 dark:border-emerald-900/50 dark:text-emerald-400">
              <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600 dark:text-emerald-500 dark:fill-emerald-500" />
              <span className="text-xs font-bold">{streak} dias</span>
            </div>
          )}
        </header>

        {/* Main Stats Card */}
        <Card className={cn(
          "p-6 shadow-sm border-border bg-card relative overflow-hidden transition-all duration-500",
          isSimpleMode ? 'max-w-sm mx-auto' : ''
        )}>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {!isSimpleMode ? (
              <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-300">
                <CircularProgress
                  value={calories}
                  max={goalCalories}
                  size="lg"
                  label={calories.toString()}
                  sublabel="kcal"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 rounded-full backdrop-blur-[2px]">
                  <span className="text-xs font-bold text-primary">Ver Macros</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-foreground tabular-nums tracking-tight">{calories}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Kcal consumidas</span>
                <Badge className="mt-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none dark:bg-emerald-900/40 dark:text-emerald-400">
                  {calories <= goalCalories ? "Dentro da meta" : "Acima da meta"}
                </Badge>
              </div>
            )}

            {!isSimpleMode && (
              <div className="flex-1 w-full space-y-6">
                {/* Protein Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground">Proteína</span>
                    <span className="text-muted-foreground font-medium">{proteins}g <span className="text-muted-foreground/50">/ {goalProtein}g</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[hsl(var(--macro-protein))] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((proteins / goalProtein) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbs Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground">Carboidrato</span>
                    <span className="text-muted-foreground font-medium">{carbs}g <span className="text-muted-foreground/50">/ {goalCarbs}g</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[hsl(var(--macro-carb))] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((carbs / goalCarbs) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Next Meal & Hydration */}
        <div className={`grid grid-cols-1 ${isSimpleMode ? '' : 'md:grid-cols-2'} gap-6`}>

          {/* Section: Next Meal */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Sua Próxima Refeição</h2>
              {!isSimpleMode && (
                <Button variant="link" className="text-primary h-auto p-0 text-sm font-semibold hover:no-underline hover:opacity-80">
                  Ver plano completo
                </Button>
              )}
            </div>

            <Card className="group relative overflow-hidden border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-muted-foreground/20">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400">
                    <Moon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground leading-tight">Jantar Sugerido</h3>
                    {!isSimpleMode && (
                      <p className="text-sm font-medium text-muted-foreground mt-0.5">
                        Horário ideal: <span className="text-foreground">19:00</span>
                      </p>
                    )}
                  </div>
                </div>

                {!isSimpleMode && (
                  <Badge variant="secondary" className="bg-muted/50 text-muted-foreground font-mono tracking-tight border-border">
                    450 kcal
                  </Badge>
                )}
              </div>

              {!isSimpleMode && (
                <div className="mb-5 rounded-xl bg-muted/30 p-3 border border-border/50 flex items-center gap-3 transition-colors group-hover:border-border">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-background shadow-sm flex items-center justify-center text-lg filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all border border-border/50">
                    🍗
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-0.5">Recomendação</p>
                    <p className="text-sm font-semibold text-foreground">Filé de Frango Grelhado</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" aria-label="Adicionar sugestão rapidamente">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button
                onClick={() => {
                  trackEvent("meal_log_start", { source: "dashboard" });
                  setIsLogging(true);
                }}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Registrar Refeição
                <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
              </Button>
            </Card>
          </section>

          {/* Section: Hydration */}
          {!isSimpleMode && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Hidratação</h2>
              <Card className="p-6 bg-blue-50/50 border-blue-100 shadow-sm flex flex-col items-center justify-center gap-4 h-[calc(100%-2.5rem)] dark:bg-blue-950/10 dark:border-blue-900/20 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-400/20 transition-all duration-700" />

                <div className="relative z-10">
                  <Droplets className="w-16 h-16 text-blue-500 fill-blue-500/20 dark:text-blue-400" strokeWidth={1.5} />
                  <div className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900">
                    +250ml
                  </div>
                </div>
                <div className="text-center z-10">
                  <p className="text-3xl font-black text-foreground tabular-nums">1.25L</p>
                  <p className="text-sm text-muted-foreground font-medium">de 2.5L diários</p>
                </div>

                <Button variant="ghost" size="sm" className="w-full mt-2 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30">
                  Beber Copo (250ml)
                </Button>
              </Card>
            </section>
          )}
        </div>

        {/* LOGGING MODAL */}
        {isLogging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
                <div>
                  <h3 className="font-bold text-xl text-foreground">Registrar Refeição</h3>
                  <p className="text-xs text-muted-foreground">Busque e adicione alimentos ao seu diário</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setIsLogging(false); setSearchQuery(""); setSearchResults([]); }} className="h-9 w-9 rounded-full bg-background border border-border hover:bg-muted text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alimento (ex: frango, arroz...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Food Selection List */}
              <div className="p-4 max-h-[40vh] overflow-y-auto space-y-3">
                {searchResults.length > 0 ? (
                  <>
                    <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider px-1">Resultados</p>
                    {searchResults.map((food) => {
                      const isSelected = selectedFoods.some(sf => sf.food.id === food.id);
                      return (
                        <button
                          key={food.id}
                          onClick={() => toggleFood(food)}
                          className={cn(
                            "w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 group text-left",
                            isSelected
                              ? "bg-emerald-50/80 border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,1)] dark:bg-emerald-950/30 dark:border-emerald-500/50"
                              : "bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/30"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <span className="text-lg">🍽️</span>
                            </div>
                            <div>
                              <p className={cn("font-bold text-sm", isSelected ? "text-emerald-900 dark:text-emerald-100" : "text-foreground")}>
                                {food.name}
                              </p>
                              <div className="flex items-center gap-2">
                                {food.histamineRisk === "high" && (
                                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">⚠️ Evitar</Badge>
                                )}
                                {food.histamineRisk === "medium" && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700">Moderar</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {isSelected && (
                              <div className="mb-1 flex justify-end">
                                <div className="bg-emerald-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </div>
                              </div>
                            )}
                            <span className="block font-bold text-muted-foreground text-sm tabular-nums">{food.nutrients.calories}</span>
                            <span className="text-[10px] text-muted-foreground/70">kcal</span>
                          </div>
                        </button>
                      );
                    })}
                  </>
                ) : searchQuery.length >= 2 && !isSearching ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nenhum alimento encontrado</p>
                    <p className="text-xs mt-1">Tente outro termo de busca</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Digite para buscar alimentos</p>
                  </div>
                )}
              </div>

              {/* Selected Foods Summary */}
              {selectedFoods.length > 0 && (
                <div className="p-4 border-t border-border bg-muted/10">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Selecionados ({selectedFoods.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFoods.map(sf => (
                      <Badge key={sf.food.id} variant="secondary" className="flex items-center gap-1">
                        {sf.food.name}
                        <button onClick={() => toggleFood(sf.food)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer / Action */}
              <div className="p-5 border-t border-border bg-muted/20">
                <Button
                  onClick={handleLogMeal}
                  disabled={selectedFoods.length === 0 || isSaving}
                  className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : selectedFoods.length === 0 ? (
                    "Selecione alimentos"
                  ) : (
                    `Registrar ${selectedFoods.length} ${selectedFoods.length === 1 ? 'alimento' : 'alimentos'}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

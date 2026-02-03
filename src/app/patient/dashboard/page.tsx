"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, ArrowRight, Flame, Droplets, Moon, Check, Search, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { SkeletonDashboard, SkeletonFoodList } from "@/components/ui/skeleton";
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

  // Quick actions state
  const [recentMeals, setRecentMeals] = useState<Array<{ id: string; name: string; foods: Array<{ food: FoodItem; grams: number }>; calories: number }>>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<Array<{ id: string; name: string; foods: Array<{ food: FoodItem; grams: number }>; calories: number }>>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);

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

  const loadRecentMeals = useCallback(async () => {
    // TODO: Fetch from API
    // Mock data for demonstration
    const mockRecent = [
      {
        id: '1',
        name: 'Café da Manhã de Ontem',
        foods: [
          { food: { id: '1', name: 'Pão Integral', nutrients: { calories: 250, protein: 8, carbs: 45, fat: 3 }, histamineRisk: 'low' as const }, grams: 100 },
          { food: { id: '2', name: 'Ovo Cozido', nutrients: { calories: 155, protein: 13, carbs: 1, fat: 11 }, histamineRisk: 'low' as const }, grams: 100 },
        ],
        calories: 405,
      },
    ];

    const mockFavorites = [
      {
        id: '2',
        name: 'Meu Almoço Padrão',
        foods: [
          { food: { id: '3', name: 'Arroz Integral', nutrients: { calories: 370, protein: 7, carbs: 77, fat: 3 }, histamineRisk: 'low' as const }, grams: 150 },
          { food: { id: '4', name: 'Frango Grelhado', nutrients: { calories: 165, protein: 31, carbs: 0, fat: 4 }, histamineRisk: 'low' as const }, grams: 150 },
        ],
        calories: 802,
      },
    ];

    setRecentMeals(mockRecent);
    setFavoriteMeals(mockFavorites);
  }, []);

  const quickLogMeal = async (meal: { id: string; name: string; foods: Array<{ food: FoodItem; grams: number }>; calories: number }) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/patient/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lunch",
          items: meal.foods.map(f => ({
            foodId: f.food.id,
            grams: f.grams,
          })),
        }),
      });

      if (response.ok) {
        toast.success(`${meal.name} registrado!`, {
          description: `+${Math.round(meal.calories)} kcal adicionadas ao seu diário.`
        });
        fetchDashboardData();
      } else {
        throw new Error("Failed to save meal");
      }
    } catch (error) {
      toast.error("Erro ao salvar refeição");
      console.error("Error saving meal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    loadRecentMeals();
  }, [fetchDashboardData, loadRecentMeals]);

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

  const updatePortion = (foodId: string, grams: number) => {
    setSelectedFoods(selectedFoods.map(sf =>
      sf.food.id === foodId ? { ...sf, grams: Math.max(1, Math.min(grams, 9999)) } : sf
    ));
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
        <SkeletonDashboard />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="flex flex-col gap-8 max-w-md mx-auto md:max-w-4xl relative animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">{getGreeting()}, {userName}</h1>
            <p className="text-base text-muted-foreground font-medium">Hoje é um ótimo dia para bater sua meta!</p>
          </div>
          {!isSimpleMode && streak > 0 && (
            <div
              className="flex items-center gap-2 bg-gradient-to-br from-emerald-50 to-white text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-top-2 shadow-sm dark:from-emerald-950/40 dark:to-emerald-900/10 dark:border-emerald-900/50 dark:text-emerald-400"
              role="status"
              aria-label={`Sequência de ${streak} dias consecutivos`}
            >
              <Flame className="w-5 h-5 text-emerald-600 fill-emerald-600 dark:text-emerald-500 dark:fill-emerald-500" aria-hidden="true" />
              <span className="text-sm font-bold">{streak} dias</span>
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
                  <span className="text-sm font-bold text-primary">Ver Nutrientes</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-foreground tabular-nums tracking-tight">{calories}</span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">Kcal consumidas</span>
                {calories <= goalCalories ? (
                  <Badge className="mt-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none dark:bg-emerald-900/40 dark:text-emerald-400 text-sm px-3 py-1">
                    ✓ No caminho certo
                  </Badge>
                ) : (
                  <Badge className="mt-4 bg-amber-100 text-amber-700 hover:bg-amber-200 border-none dark:bg-amber-900/40 dark:text-amber-400 text-sm px-3 py-1">
                    ⚠️ Acima da meta
                  </Badge>
                )}
              </div>
            )}

            {!isSimpleMode && (
              <div className="flex-1 w-full space-y-6">
                {/* Protein Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Proteína</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{proteins}g <span className="text-muted-foreground">/ {goalProtein}g</span></span>
                      <span className="text-sm font-bold text-muted-foreground tabular-nums">{Math.round((proteins / goalProtein) * 100)}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={proteins} aria-valuemin={0} aria-valuemax={goalProtein} aria-label={`Proteína: ${proteins} de ${goalProtein} gramas`}>
                    <div
                      className="h-full bg-[hsl(var(--macro-protein))] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((proteins / goalProtein) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbs Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Carboidrato</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{carbs}g <span className="text-muted-foreground">/ {goalCarbs}g</span></span>
                      <span className="text-sm font-bold text-muted-foreground tabular-nums">{Math.round((carbs / goalCarbs) * 100)}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={carbs} aria-valuemin={0} aria-valuemax={goalCarbs} aria-label={`Carboidrato: ${carbs} de ${goalCarbs} gramas`}>
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
              <h2 className="text-2xl font-bold text-foreground">Sua Próxima Refeição</h2>
              {!isSimpleMode && (
                <Button
                  variant="link"
                  className="text-primary h-auto p-0 text-base font-semibold hover:no-underline hover:opacity-80 focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label="Ver plano completo de refeições de hoje"
                >
                  Ver plano completo →
                </Button>
              )}
            </div>

            <Card className="group relative overflow-hidden border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-muted-foreground/20">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400"
                    aria-hidden="true"
                  >
                    <Moon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight">Jantar Sugerido</h3>
                    {!isSimpleMode && (
                      <p className="text-base font-medium text-muted-foreground mt-1">
                        Horário ideal: <span className="text-foreground">19:00</span>
                      </p>
                    )}
                  </div>
                </div>

                {!isSimpleMode && (
                  <Badge variant="secondary" className="bg-muted/50 text-foreground font-mono tracking-tight border-border text-sm px-3 py-1">
                    450 kcal
                  </Badge>
                )}
              </div>

              {!isSimpleMode && (
                <div className="mb-5 rounded-xl bg-muted/30 p-4 border border-border/50 flex items-center gap-3 transition-colors group-hover:border-border">
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-background shadow-sm flex items-center justify-center text-2xl filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all border border-border/50" aria-hidden="true">
                    🍗
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Recomendação</p>
                    <p className="text-base font-semibold text-foreground">Filé de Frango Grelhado</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    aria-label="Adicionar filé de frango grelhado rapidamente"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
              )}

              <Button
                onClick={() => {
                  trackEvent("meal_log_start", { source: "dashboard" });
                  setIsLogging(true);
                }}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Abrir modal para registrar refeição"
              >
                Registrar Refeição
                <ArrowRight className="ml-2 h-5 w-5 opacity-70" aria-hidden="true" />
              </Button>
            </Card>
          </section>

          {/* Section: Hydration */}
          {!isSimpleMode && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Hidratação</h2>
              <Card className="p-6 bg-blue-50/50 border-blue-100 shadow-sm flex flex-col items-center justify-center gap-5 h-[calc(100%-3rem)] dark:bg-blue-950/10 dark:border-blue-900/20 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-400/20 transition-all duration-700" aria-hidden="true" />

                <div className="relative z-10">
                  <Droplets className="w-20 h-20 text-blue-500 fill-blue-500/20 dark:text-blue-400" strokeWidth={1.5} aria-hidden="true" />
                  <div className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900">
                    +250ml
                  </div>
                </div>
                <div className="text-center z-10">
                  <p className="text-4xl font-black text-foreground tabular-nums">1.25L</p>
                  <p className="text-base text-muted-foreground font-medium mt-1">de 2.5L diários</p>
                  <div className="mt-2">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">50% da meta</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-12 mt-2 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30 text-base font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Registrar copo de água de 250 mililitros"
                >
                  Beber Copo (250ml)
                </Button>
              </Card>
            </section>
          )}
        </div>

        {/* LOGGING MODAL - Accessible */}
        {isLogging && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="meal-modal-title"
            aria-describedby="meal-modal-description"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsLogging(false);
                setSearchQuery("");
                setSearchResults([]);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsLogging(false);
                setSearchQuery("");
                setSearchResults([]);
              }
            }}
          >
            <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
                <div>
                  <h3 id="meal-modal-title" className="font-bold text-2xl text-foreground">Registrar Refeição</h3>
                  <p id="meal-modal-description" className="text-sm text-muted-foreground mt-1">Busque e adicione alimentos ao seu diário</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setIsLogging(false); setSearchQuery(""); setSearchResults([]); }}
                  className="h-10 w-10 rounded-full bg-background border border-border hover:bg-muted text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Fechar modal de registro de refeição"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <label htmlFor="food-search" className="sr-only">Buscar alimento</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    id="food-search"
                    type="search"
                    placeholder="Buscar alimento (ex: frango, arroz...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base focus:ring-2 focus:ring-primary"
                    aria-describedby="search-help"
                    autoComplete="off"
                    autoFocus
                  />
                  <span id="search-help" className="sr-only">
                    Digite pelo menos 2 caracteres para buscar alimentos
                  </span>
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-muted-foreground" aria-label="Buscando alimentos..." />
                  )}
                </div>
              </div>

              {/* Quick Actions - Recent & Favorites */}
              {showQuickActions && (recentMeals.length > 0 || favoriteMeals.length > 0) && searchQuery.length === 0 && (
                <div className="p-4 border-b border-border bg-muted/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Ações Rápidas</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickActions(false)}
                      className="h-8 text-xs"
                    >
                      Ocultar
                    </Button>
                  </div>

                  {recentMeals.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Refeições Recentes</p>
                      {recentMeals.map((meal) => (
                        <button
                          key={meal.id}
                          onClick={() => quickLogMeal(meal)}
                          disabled={isSaving}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center" aria-hidden="true">
                              <span className="text-xl">🔄</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{meal.name}</p>
                              <p className="text-xs text-muted-foreground">{meal.foods.length} alimento{meal.foods.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{meal.calories}</p>
                            <p className="text-xs text-muted-foreground">kcal</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {favoriteMeals.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Favoritos</p>
                      {favoriteMeals.map((meal) => (
                        <button
                          key={meal.id}
                          onClick={() => quickLogMeal(meal)}
                          disabled={isSaving}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center" aria-hidden="true">
                              <span className="text-xl">⭐</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{meal.name}</p>
                              <p className="text-xs text-muted-foreground">{meal.foods.length} alimento{meal.foods.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{meal.calories}</p>
                            <p className="text-xs text-muted-foreground">kcal</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!showQuickActions && searchQuery.length === 0 && (
                <div className="p-2 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickActions(true)}
                    className="w-full text-xs"
                  >
                    Mostrar Ações Rápidas
                  </Button>
                </div>
              )}

              {/* Food Selection List */}
              <div
                className="p-4 max-h-[60dvh] md:max-h-[40vh] overflow-y-auto space-y-3"
                role="region"
                aria-live="polite"
                aria-label="Resultados da busca"
              >
                {searchResults.length > 0 ? (
                  <>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider px-1" aria-live="polite">
                      {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    <div role="list" className="space-y-3">
                      {searchResults.map((food) => {
                        const isSelected = selectedFoods.some(sf => sf.food.id === food.id);
                        return (
                          <button
                            key={food.id}
                            onClick={() => toggleFood(food)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleFood(food);
                              }
                            }}
                            role="listitem"
                            aria-pressed={isSelected}
                            aria-label={`${food.name}, ${food.nutrients.calories} calorias por 100 gramas${isSelected ? ', selecionado' : ''}`}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                              isSelected
                                ? "bg-emerald-50/80 border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,1)] dark:bg-emerald-950/30 dark:border-emerald-500/50"
                                : "bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/30"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center" aria-hidden="true">
                                <span className="text-2xl">🍽️</span>
                              </div>
                              <div>
                                <p className={cn("font-bold text-base", isSelected ? "text-emerald-900 dark:text-emerald-100" : "text-foreground")}>
                                  {food.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-muted-foreground">por 100g</p>
                                  {food.histamineRisk === "high" && (
                                    <Badge variant="destructive" className="text-xs px-2 py-0.5">Alto histamina</Badge>
                                  )}
                                  {food.histamineRisk === "medium" && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Médio</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {isSelected && (
                                <div className="mb-1 flex justify-end">
                                  <div className="bg-emerald-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center" aria-hidden="true">
                                    <Check className="w-4 h-4" />
                                  </div>
                                </div>
                              )}
                              <span className="block font-bold text-foreground text-base tabular-nums">{food.nutrients.calories}</span>
                              <span className="text-xs text-muted-foreground">kcal</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : isSearching ? (
                  <SkeletonFoodList />
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-12 text-muted-foreground" role="status">
                    <p className="text-base font-medium">Nenhum alimento encontrado</p>
                    <p className="text-sm mt-2">Tente outro termo de busca</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground" role="status">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                    <p className="text-base">Digite para buscar alimentos</p>
                    <p className="text-sm mt-1">Mínimo 2 caracteres</p>
                  </div>
                )}
              </div>

              {/* Selected Foods Summary with Portion Editing */}
              {selectedFoods.length > 0 && (
                <div className="p-4 border-t border-border bg-muted/10" role="region" aria-label="Alimentos selecionados">
                  <p className="text-sm font-bold text-foreground mb-3">
                    Selecionados ({selectedFoods.length}) • {Math.round(selectedFoods.reduce((acc, sf) => acc + (sf.food.nutrients.calories * sf.grams / 100), 0))} kcal
                  </p>
                  <div className="space-y-2">
                    {selectedFoods.map(sf => (
                      <div
                        key={sf.food.id}
                        className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">{sf.food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(sf.food.nutrients.calories * sf.grams / 100)} kcal
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={sf.grams}
                              onChange={(e) => updatePortion(sf.food.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-9 text-center text-sm"
                              min="1"
                              max="9999"
                              aria-label={`Porção de ${sf.food.name} em gramas`}
                            />
                            <span className="text-xs text-muted-foreground">g</span>
                          </div>
                          <button
                            onClick={() => toggleFood(sf.food)}
                            className="h-9 w-9 flex items-center justify-center hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-destructive"
                            aria-label={`Remover ${sf.food.name}`}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer / Action */}
              <div className="p-5 border-t border-border bg-muted/20">
                <Button
                  onClick={handleLogMeal}
                  disabled={selectedFoods.length === 0 || isSaving}
                  className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={selectedFoods.length > 0 ? `Adicionar ${selectedFoods.length} alimento${selectedFoods.length !== 1 ? 's' : ''} com ${Math.round(selectedFoods.reduce((acc, sf) => acc + sf.food.nutrients.calories, 0))} calorias` : "Selecione alimentos para adicionar"}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
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

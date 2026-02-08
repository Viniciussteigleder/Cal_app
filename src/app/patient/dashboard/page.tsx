"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, ArrowRight, Flame, Droplets, Moon, Check, Search, Loader2, Utensils, Activity, ChevronRight, Zap, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { SkeletonDashboard, SkeletonFoodList } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";
import { DeepHealthDashboard } from "@/components/patient/DeepHealthDashboard";

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
    return <SkeletonDashboard />;
  }

  return (
      <div className="flex flex-col gap-8 max-w-md mx-auto md:max-w-5xl relative animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

        {/* Header - Premium Personalization */}
        <header className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-400 dark:to-teal-200 tracking-tighter">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-medium">
              Vamos nutrir seu corpo hoje?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground/50 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Hero Card - Glassmorphism & Gradient */}
        <Card className="relative overflow-hidden border-0 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/20 rounded-[2rem]">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 opacity-100 dark:from-emerald-600 dark:to-teal-800" />

          {/* Abstract Decorations */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl" />

          <div className="relative z-10 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">

              {/* Left Column: Calories */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-1">Restante Hoje</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl md:text-7xl font-black tracking-tighter shadow-sm text-white drop-shadow-sm">
                    {goalCalories - calories}
                  </span>
                  <span className="text-xl font-medium text-emerald-100/80">kcal</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-[200px] h-2 bg-black/20 rounded-full mt-4 overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${Math.min((calories / goalCalories) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-emerald-50/70 text-xs mt-2 font-medium">
                  {Math.round((calories / goalCalories) * 100)}% da meta diária
                </p>
              </div>

              {/* Divider (Desktop) */}
              <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

              {/* Right Column: Macros */}
              <div className="grid grid-cols-3 gap-6 w-full md:w-auto">
                <div className="flex flex-col items-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <span className="text-xs font-bold text-emerald-100 mb-1">Proteína</span>
                  <span className="text-2xl font-bold">{proteins}g</span>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                    <div className="h-full bg-white/90 rounded-full" style={{ width: `${Math.min((proteins / goalProtein) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <span className="text-xs font-bold text-emerald-100 mb-1">Carbo</span>
                  <span className="text-2xl font-bold">{carbs}g</span>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                    <div className="h-full bg-white/90 rounded-full" style={{ width: `${Math.min((carbs / goalCarbs) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <span className="text-xs font-bold text-emerald-100 mb-1">Gordura</span>
                  <span className="text-2xl font-bold">45g</span>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                    <div className="h-full bg-white/90 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Clinical Deep Health Intelligence */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              Saúde em Profundidade
            </h2>
            <Link href="/patient/progress" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">
              Ver histórico completo
            </Link>
          </div>
          <DeepHealthDashboard />
        </section>

        {/* Daily Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* 1. Meal Card */}
          <button
            onClick={() => setIsLogging(true)}
            className="group relative flex flex-col justify-between p-5 h-48 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all active:scale-[0.98] text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500">
                <Plus className="w-6 h-6" />
              </div>
            </div>
            <div>
              <span className="inline-block p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 mb-3">
                <Utensils className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Registrar<br />Refeição
              </h3>
            </div>
            <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
              Adicionar agora <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>

          {/* 2. Hydration Card */}
          <Card className="group relative flex flex-col justify-between p-5 h-48 rounded-[1.5rem] bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-950 border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md transition-all">
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl" />

            <div className="flex justify-between items-start">
              <span className="inline-block p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Droplets className="w-5 h-5" />
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                1.25L / 2.5L
              </Badge>
            </div>

            <div className="relative z-10 text-center space-y-2">
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums">1.25 L</p>
              <Button size="sm" className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                + 250ml
              </Button>
            </div>
          </Card>

          {/* 3. Symptoms Quick Log */}
          <Link href="/patient/symptoms" className="group relative flex flex-col justify-between p-5 h-48 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all active:scale-[0.98] text-left">
            <div>
              <span className="inline-block p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mb-3">
                <Activity className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Como você<br />está agora?
              </h3>
            </div>
            <div className="flex items-center -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-950 flex items-center justify-center text-xs">
                  {i === 1 ? '😊' : i === 2 ? '😐' : '🤢'}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                +
              </div>
            </div>
          </Link>

          {/* 4. Streak Card */}
          <Card className="flex flex-col justify-between p-5 h-48 rounded-[1.5rem] bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <span className="text-emerald-100 font-bold uppercase text-xs tracking-wider">Sequência</span>
              </div>
              <p className="text-4xl font-black text-white">{streak} dias</p>
            </div>

            <div className="relative z-10 space-y-2">
              <p className="text-sm text-slate-300">Você está indo super bem!</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(day => (
                  <div key={day} className={`h-1.5 flex-1 rounded-full ${day <= streak % 5 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          </Card>
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
          >
            <div className="bg-background w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
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
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    id="food-search"
                    type="search"
                    placeholder="Buscar alimento (ex: frango, arroz...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-14 rounded-xl text-lg focus:ring-2 focus:ring-primary border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                    autoComplete="off"
                    autoFocus
                  />
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
                      {recentMeals.map((meal) => (
                        <button
                          key={meal.id}
                          onClick={() => quickLogMeal(meal)}
                          disabled={isSaving}
                          className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-200">
                              <Check className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground">{meal.name}</p>
                              <p className="text-xs text-muted-foreground">{meal.calories} kcal • {meal.foods.length} itens</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Food Selection List */}
              <div
                className="p-4 max-h-[50dvh] overflow-y-auto space-y-3"
              >
                {searchResults.length > 0 ? (
                  <div role="list" className="space-y-3">
                    {searchResults.map((food) => {
                      const isSelected = selectedFoods.some(sf => sf.food.id === food.id);
                      return (
                        <button
                          key={food.id}
                          onClick={() => toggleFood(food)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group text-left",
                            isSelected
                              ? "bg-emerald-50/80 border-emerald-500 shadow-sm dark:bg-emerald-950/30"
                              : "bg-card border-border hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", isSelected ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted")}>
                              🍽️
                            </div>
                            <div>
                              <p className={cn("font-bold text-base", isSelected ? "text-emerald-900 dark:text-emerald-100" : "text-foreground")}>
                                {food.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">{food.nutrients.calories} kcal <span className="text-xs opacity-70">/ 100g</span></p>
                                {food.histamineRisk === "high" && (
                                  <Badge variant="destructive" className="text-[10px] px-2 h-5">Histamina Alta</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-sm animate-in zoom-in">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : !isSearching && searchQuery.length >= 2 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhum alimento encontrado</p>
                  </div>
                )}
              </div>

              {/* Selected Foods / Submit */}
              {selectedFoods.length > 0 && (
                <div className="p-4 border-t border-border bg-muted/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Selecionados ({selectedFoods.length})</span>
                    <span className="text-lg font-black text-emerald-600">
                      {Math.round(selectedFoods.reduce((acc, sf) => acc + (sf.food.nutrients.calories * sf.grams / 100), 0))} kcal
                    </span>
                  </div>

                  {/* Compact Selected List */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 snap-x">
                    {selectedFoods.map(sf => (
                      <div key={sf.food.id} className="snap-start shrink-0 flex items-center gap-2 pl-3 pr-2 py-2 bg-white dark:bg-slate-900 rounded-lg border border-border shadow-sm">
                        <span className="text-sm font-medium truncate max-w-[100px]">{sf.food.name}</span>
                        <div className="flex items-center gap-1 bg-muted rounded px-1.5 py-0.5">
                          <input
                            type="number"
                            value={sf.grams}
                            onChange={(e) => updatePortion(sf.food.id, parseInt(e.target.value) || 0)}
                            className="w-8 bg-transparent text-right text-xs font-bold focus:outline-none"
                          />
                          <span className="text-[10px] text-muted-foreground">g</span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => toggleFood(sf.food)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleLogMeal}
                    disabled={isSaving}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      `Confirmar Refeição`
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
  );
}

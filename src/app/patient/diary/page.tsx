"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface DiaryItem {
  id: string;
  food: { id: string; name: string };
  grams: number;
  nutrients: Record<string, number>;
}

interface DiaryMeal {
  id: string;
  type: MealType;
  date: string;
  items: DiaryItem[];
  totals: Record<string, number>;
}

interface DiaryResponse {
  date: string;
  editable: boolean;
  meals: DiaryMeal[];
  totals: Record<string, number>;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Café da Manhã",
  lunch: "Almoço",
  snack: "Lanche",
  dinner: "Jantar",
};

export default function DiaryPage() {
  const [dayOffset, setDayOffset] = useState(0);
  const [data, setData] = useState<DiaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickAdd, setQuickAdd] = useState<MealType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedFood, setSelectedFood] = useState<{ id: string; name: string } | null>(
    null
  );
  const [grams, setGrams] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date;
  }, [dayOffset]);

  const formattedDate = useMemo(() => {
    const day = targetDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
    const prefix = dayOffset === 0 ? "Hoje" : dayOffset === -1 ? "Ontem" : "";
    const full = targetDate.toLocaleDateString("pt-BR");
    return prefix ? `${prefix}, ${day} • ${full}` : full;
  }, [dayOffset, targetDate]);

  const mealList = useMemo(() => {
    return (Object.keys(MEAL_LABELS) as MealType[]).map((type) => {
      const existing = data?.meals.find((meal) => meal.type === type);
      return (
        existing ?? {
          id: `${type}-${data?.date ?? targetDate.toISOString()}`,
          type,
          date: targetDate.toISOString(),
          items: [],
          totals: {},
        }
      );
    });
  }, [data, targetDate]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/patient/diary?date=${targetDate.toISOString().slice(0, 10)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Erro ao carregar diário.");
        }
        return res.json();
      })
      .then((payload: DiaryResponse) => {
        setData(payload);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [targetDate]);

  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/patient/foods?q=${encodeURIComponent(searchTerm)}&limit=6`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((payload) => {
        setSuggestions(payload.results ?? []);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [searchTerm]);

  const handleAddItem = async () => {
    if (!selectedFood || !grams || !quickAdd) return;
    const numericGrams = Number.parseFloat(grams.replace(",", ".").match(/\d+([.,]\d+)?/)?.[0] ?? "");
    if (Number.isNaN(numericGrams) || numericGrams <= 0) {
      setError("Quantidade inválida. Use um valor em gramas (ex: 150 g).");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const response = await fetch("/api/patient/meal-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: targetDate.toISOString().slice(0, 10),
          mealType: quickAdd,
          foodId: selectedFood.id,
          grams: numericGrams,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Não foi possível salvar este item.");
      }
      await trackEvent("meal_log_quick_add", {
        meal_type: quickAdd,
        grams: numericGrams,
      });
      setSearchTerm("");
      setSelectedFood(null);
      setGrams("");
      setQuickAdd(null);
      setLoading(true);
      const refresh = await fetch(
        `/api/patient/diary?date=${targetDate.toISOString().slice(0, 10)}`
      );
      const payload = await refresh.json();
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setAdding(false);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diário Alimentar</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe suas refeições do dia e mantenha o histórico completo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDayOffset((prev) => prev - 1)}
              aria-label="Dia anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">{formattedDate}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDayOffset((prev) => prev + 1)}
              aria-label="Próximo dia"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {loading && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            Carregando diário...
          </div>
        )}
        {data && !data.editable && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Este diário está em modo somente leitura após o dia encerrar.
          </div>
        )}

        <section className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
              <span className="text-xs text-muted-foreground block">Kcal</span>
              <span className="text-lg font-bold text-foreground">
                {Math.round(data?.totals?.energy_kcal ?? 0)}
              </span>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
              <span className="text-xs text-muted-foreground block">Prot</span>
              <span className="text-lg font-bold text-[hsl(var(--macro-protein))]">
                {Math.round(data?.totals?.protein_g ?? 0)}g
              </span>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
              <span className="text-xs text-muted-foreground block">Carb</span>
              <span className="text-lg font-bold text-[hsl(var(--macro-carb))]">
                {Math.round(data?.totals?.carbs_g ?? 0)}g
              </span>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
              <span className="text-xs text-muted-foreground block">Gord</span>
              <span className="text-lg font-bold text-[hsl(var(--macro-fat))]">
                {Math.round(data?.totals?.fat_g ?? 0)}g
              </span>
            </div>
          </div>
        </section>

        {mealList.map((meal) => (
          <Card key={meal.id} className="p-4 border border-border shadow-card bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">{MEAL_LABELS[meal.type]}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-muted/60 text-muted-foreground">
                  {Math.round(meal.totals.energy_kcal ?? 0)} kcal
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary-dark"
                  onClick={() => setQuickAdd(meal.type)}
                  disabled={!data?.editable}
                >
                  + Adicionar
                </Button>
              </div>
            </div>

            {quickAdd === meal.type && (
              <div className="mb-4 rounded-xl border border-border bg-muted/20 p-3 space-y-3">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Adicionar rápido
                  </label>
                  <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto] items-end">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar alimento (ex: arroz integral)"
                        className="pl-9"
                        value={searchTerm}
                        onChange={(event) => {
                          setSearchTerm(event.target.value);
                          setSelectedFood(null);
                        }}
                      />
                      {suggestions.length > 0 && !selectedFood && (
                        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-border bg-card shadow-lg">
                          {suggestions.map((suggestion) => (
                            <button
                              type="button"
                              key={suggestion.id}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50"
                              onClick={() => {
                                setSelectedFood(suggestion);
                                setSearchTerm(suggestion.name);
                                setSuggestions([]);
                              }}
                            >
                              {suggestion.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input
                      placeholder="Quantidade (g)"
                      value={grams}
                      onChange={(event) => setGrams(event.target.value)}
                    />
                    <Button
                      onClick={handleAddItem}
                      disabled={!selectedFood || !grams || adding}
                    >
                      {adding ? "Salvando..." : "Adicionar ao diário"}
                    </Button>
                  </div>
                  <Link
                    href={`/patient/log?date=${targetDate.toISOString().slice(0, 10)}&meal=${meal.type}`}
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={() => trackEvent("meal_log_start", { source: "diary" })}
                  >
                    Ver detalhes do registro completo
                  </Link>
                </div>
              </div>
            )}

            {meal.items.length > 0 ? (
              <div className="space-y-2">
                {meal.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-transparent hover:border-border hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.food.name}</p>
                      <p className="text-xs text-muted-foreground">{item.grams} g</p>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">
                      {Math.round(item.nutrients.energy_kcal ?? 0)} kcal
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs text-muted-foreground italic">
                  Ainda não há itens nesta refeição. Toque em “Adicionar” para registrar.
                </p>
              </div>
            )}
          </Card>
        ))}

        {!loading && data && data.meals.every((meal) => meal.items.length === 0) && (
          <div className="text-center text-sm text-muted-foreground">
            Nenhuma refeição encontrada para este dia.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

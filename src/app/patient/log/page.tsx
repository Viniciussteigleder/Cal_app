"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Download,
  Mic,
  ScanBarcode,
  X,
  Search,
  ChevronRight,
  History,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodSuggestion {
  id: string;
  name: string;
  alias?: string;
}

interface DiaryMealItem {
  id: string;
  food: { id: string; name: string };
  grams: number;
  nutrients: Record<string, number>;
}

interface DiaryResponse {
  date: string;
  editable: boolean;
  meals: Array<{
    id: string;
    type: MealType;
    items: DiaryMealItem[];
    totals: Record<string, number>;
  }>;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Café da Manhã",
  lunch: "Almoço",
  snack: "Lanche",
  dinner: "Jantar",
};

function PatientLogContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const rawMealParam = searchParams.get("meal");
  const mealParam = (["breakfast", "lunch", "snack", "dinner"].includes(rawMealParam ?? "")
    ? rawMealParam
    : "lunch") as MealType;

  const [mealType, setMealType] = useState<MealType>(mealParam);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [selectedFood, setSelectedFood] = useState<FoodSuggestion | null>(null);
  const [grams, setGrams] = useState("");
  const [diary, setDiary] = useState<DiaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DiaryMealItem | null>(null);
  const [undoItem, setUndoItem] = useState<{ item: DiaryMealItem; mealType: MealType } | null>(null);
  const [favorites, setFavorites] = useState<FoodSuggestion[]>([]);
  const [recent, setRecent] = useState<FoodSuggestion[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStart, setExportStart] = useState(dateParam);
  const [exportEnd, setExportEnd] = useState(dateParam);

  const currentMeal = useMemo(() => {
    return diary?.meals.find((meal) => meal.type === mealType);
  }, [diary, mealType]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/patient/diary?date=${dateParam}`)
      .then((res) => res.json())
      .then((payload) => setDiary(payload))
      .finally(() => setLoading(false));
  }, [dateParam]);

  useEffect(() => {
    trackEvent("meal_log_open", { source: "log" });
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      setActiveSuggestion(0);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      trackEvent("meal_log_search", { query_length: searchTerm.length });
    }, 400);
    fetch(`/api/patient/foods?q=${encodeURIComponent(searchTerm)}&limit=6`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((payload) => {
        setSuggestions(payload.results ?? []);
        setActiveSuggestion(0);
      })
      .catch(() => undefined);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetch("/api/patient/foods")
      .then((res) => res.json())
      .then((payload) => {
        setFavorites(payload.favorites ?? []);
        setRecent(payload.recent ?? []);
      })
      .catch(() => undefined);
  }, []);

  const refreshDiary = async () => {
    const response = await fetch(`/api/patient/diary?date=${dateParam}`);
    const payload = await response.json();
    setDiary(payload);
  };

  const handleAddItem = async () => {
    if (!selectedFood || !grams) return;
    const numericGrams = Number.parseFloat(grams.replace(",", ".").match(/\d+([.,]\d+)?/)?.[0] ?? "");
    if (Number.isNaN(numericGrams) || numericGrams <= 0) {
      toast.error("Quantidade inválida.", {
        description: "Informe um valor em gramas (ex: 150 g).",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/patient/meal-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateParam,
          mealType,
          foodId: selectedFood.id,
          grams: numericGrams,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Não foi possível salvar.");
      }
      await trackEvent("meal_log_add_item", {
        meal_type: mealType,
        grams: numericGrams,
      });
      setSearchTerm("");
      setSelectedFood(null);
      setGrams("");
      await refreshDiary();
      toast.success("Item adicionado ao diário.");
    } catch (err) {
      toast.error("Não foi possível salvar.", {
        description: err instanceof Error ? err.message : "Verifique a quantidade e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item: DiaryMealItem) => {
    setItemToDelete(item);
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await fetch(`/api/patient/meal-items/${itemToDelete.id}`, {
        method: "DELETE",
      });
      await trackEvent("meal_log_remove_item", { food_id: itemToDelete.food.id });
      setUndoItem({ item: itemToDelete, mealType });
      await refreshDiary();
      toast.success("Item removido.", {
        description: "Você pode desfazer esta ação.",
      });
    } finally {
      setShowConfirmDelete(false);
      setItemToDelete(null);
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!undoItem) return;
    setLoading(true);
    await fetch("/api/patient/meal-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateParam,
        mealType: undoItem.mealType,
        foodId: undoItem.item.food.id,
        grams: undoItem.item.grams,
      }),
    });
    await trackEvent("meal_log_undo", { food_id: undoItem.item.food.id });
    await refreshDiary();
    setUndoItem(null);
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      if (exportStart > exportEnd) {
        toast.error("Período inválido.", {
          description: "A data inicial deve ser anterior à data final.",
        });
        return;
      }
      await trackEvent("csv_export_start", { start: exportStart, end: exportEnd });
      const response = await fetch(
        `/api/patient/export?start=${exportStart}&end=${exportEnd}`
      );
      if (!response.ok) {
        throw new Error("Não foi possível exportar o CSV.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "diario_nutriplan.csv";
      link.click();
      window.URL.revokeObjectURL(url);
      await trackEvent("csv_export_success", {
        start: exportStart,
        end: exportEnd,
      });
      toast.success("Diário exportado com sucesso (CSV).");
      setExportOpen(false);
    } catch (err) {
      await trackEvent("csv_export_error");
      toast.error("Não foi possível exportar.", {
        description: err instanceof Error ? err.message : "Tente novamente mais tarde.",
      });
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="grid gap-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Registro de Refeição</h1>
            <p className="text-sm text-muted-foreground">
              Leva menos de 1 minuto. Comece por um item.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <div className="flex border border-border rounded-lg overflow-hidden h-9">
              <Button variant="ghost" size="icon" className="h-full rounded-none border-r" aria-label="Entrada por voz">
                <Mic className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-full rounded-none" aria-label="Ler código de barras">
                <ScanBarcode className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {undoItem && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm flex items-center justify-between">
            <span>Item removido. Deseja desfazer?</span>
            <Button variant="outline" size="sm" onClick={handleUndo}>
              Desfazer
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-4 space-y-2">
                <CardTitle className="text-lg">O que você comeu?</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MEAL_LABELS).map(([value, label]) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={mealType === value ? "default" : "outline"}
                      onClick={() => setMealType(value as MealType)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                  <div className="grid gap-2 relative">
                    <label className="text-sm font-medium">Alimento / Ingrediente</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar alimento (ex: arroz integral)"
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedFood(null);
                      }}
                      onKeyDown={(event) => {
                        if (suggestions.length === 0) return;
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
                        }
                        if (event.key === "ArrowUp") {
                          event.preventDefault();
                          setActiveSuggestion((prev) => Math.max(prev - 1, 0));
                        }
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const choice = suggestions[activeSuggestion];
                          if (choice) {
                            setSelectedFood(choice);
                            setSearchTerm(choice.name);
                            setSuggestions([]);
                          }
                        }
                        if (event.key === "Escape") {
                          setSuggestions([]);
                        }
                      }}
                    />
                  </div>
                  {suggestions.length > 0 && !selectedFood && (
                    <div
                      role="listbox"
                      className="absolute top-full left-0 right-0 z-10 bg-card border border-border rounded-md shadow-lg mt-1 overflow-hidden"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.id}
                          role="option"
                          aria-selected={index === activeSuggestion}
                          className={`px-4 py-2 cursor-pointer text-sm border-b last:border-0 border-border text-left w-full ${
                            index === activeSuggestion ? "bg-muted/50" : "hover:bg-muted/50"
                          }`}
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
                  {searchTerm && suggestions.length === 0 && !selectedFood && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-card border border-border rounded-md shadow-lg mt-1 p-3 text-sm text-muted-foreground">
                      Nenhum resultado. Tente outro termo ou adicione um item manual.
                    </div>
                  )}
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Quantidade</label>
                    <Input
                      type="text"
                      placeholder="Quantidade e unidade (ex: 150 g)"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-info" />
                    <label className="text-sm font-bold text-foreground">
                      Condições relacionadas ao preparo (opcional)
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: "leftovers", label: "Sobra (24h+)" },
                      { id: "fermented", label: "Fermentado" },
                      { id: "processed", label: "Processado" },
                      { id: "reheated", label: "Reaquecido" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Switch id={item.id} />
                        <Label htmlFor={item.id} className="cursor-pointer text-sm font-medium text-muted-foreground">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full h-11"
                  disabled={loading || !selectedFood || !grams || !diary?.editable}
                  onClick={handleAddItem}
                >
                  {loading ? "Salvando..." : "Adicionar ao diário"}
                </Button>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">Composição do Prato</h3>
                    <span className="text-xs text-muted-foreground">
                      Refeição Total:{" "}
                      <span className="font-bold text-foreground">
                        {Math.round(currentMeal?.totals.energy_kcal ?? 0)} kcal
                      </span>
                    </span>
                  </div>
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[45%]">Item</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Kcal</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentMeal?.items.length ? (
                        currentMeal.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-foreground">{item.food.name}</TableCell>
                            <TableCell>{item.grams} g</TableCell>
                            <TableCell>{Math.round(item.nutrients.energy_kcal ?? 0)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                aria-label={`Remover ${item.food.name}`}
                                onClick={() => confirmDelete(item)}
                                disabled={!diary?.editable}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                            Nenhum item ainda. Use a busca acima para adicionar.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {!diary?.editable && (
                    <p className="text-xs text-muted-foreground">
                      Este registro é somente leitura após o dia encerrar.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning" />
                  Lançamento rápido (favoritos)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {favorites.length > 0 ? (
                  favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors border border-transparent hover:border-border"
                      onClick={() => {
                        setSelectedFood(fav);
                        setSearchTerm(fav.name);
                      }}
                    >
                      <div className="text-sm font-medium text-foreground">{fav.name}</div>
                      <Button variant="ghost" size="sm" className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Seus itens mais frequentes vão aparecer aqui.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border shadow-card">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="w-4 h-4 text-info" />
                  Adicionados recentemente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {recent.length > 0 ? (
                  recent.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 hover:bg-muted/40 rounded-lg cursor-pointer border border-transparent hover:border-border transition-all"
                      onClick={() => {
                        setSelectedFood(item);
                        setSearchTerm(item.name);
                      }}
                    >
                      <div className="text-sm font-medium text-foreground">{item.name}</div>
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-none">
                        Recente
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Seus últimos itens vão aparecer aqui.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="bg-info/10 border border-info/20 rounded-2xl p-6 text-info-foreground shadow-sm">
              <h4 className="font-bold text-lg mb-2 text-foreground">Dica do app</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para acompanhar melhor suas refeições, registre logo após comer. Se tiver dúvidas sobre
                ajustes na dieta, converse com sua nutricionista.
              </p>
            </div>
          </div>
        </div>

        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Você tem certeza que deseja remover este item da sua refeição atual?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={executeDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exportar diário (CSV)</DialogTitle>
              <DialogDescription>
                O arquivo pode conter dados pessoais. Escolha o período antes de exportar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="export-start">Data inicial</Label>
                <Input
                  id="export-start"
                  type="date"
                  value={exportStart}
                  onChange={(event) => setExportStart(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="export-end">Data final</Label>
                <Input
                  id="export-end"
                  type="date"
                  value={exportEnd}
                  onChange={(event) => setExportEnd(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setExportOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExport}>Exportar CSV</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function PatientLogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12">Carregando...</div>}>
      <PatientLogContent />
    </Suspense>
  );
}

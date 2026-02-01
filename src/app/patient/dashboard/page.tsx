"use client";

import { useState } from "react";
import { Plus, X, ArrowRight, Flame, Utensils, Droplets } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";

// Mock Data for "Simulated Database"
const FOOD_DATABASE = [
  { id: 1, name: "Filé de Frango", portion: "100g", cal: 165, icon: "🍗" },
  { id: 2, name: "Arroz Integral", portion: "100g", cal: 110, icon: "🍚" },
  { id: 3, name: "Ovos Cozidos", portion: "2 un", cal: 140, icon: "🥚" },
  { id: 4, name: "Banana Prata", portion: "1 un", cal: 90, icon: "🍌" },
];

export default function PatientDashboard() {
  const [calories, setCalories] = useState(1245);
  const [proteins, setProteins] = useState(65);
  const [isLogging, setIsLogging] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);

  const toggleFood = (id: number) => {
    if (selectedFoods.includes(id)) {
      setSelectedFoods(selectedFoods.filter(fid => fid !== id));
    } else {
      setSelectedFoods([...selectedFoods, id]);
    }
  };

  const handleLogMeal = () => {
    // Calculate totals from selected
    const totalCalAdded = selectedFoods.reduce((acc, id) => {
      const food = FOOD_DATABASE.find(f => f.id === id);
      return acc + (food?.cal || 0);
    }, 0);

    // Apply strict "Animation" Logic
    setCalories(prev => prev + totalCalAdded);
    setIsLogging(false);
    setSelectedFoods([]);

    // Simulate Toast (Console for now, visual feedback is the ring update)
    console.log(`Logged ${totalCalAdded} kcal`);
  };

  return (
    <DashboardLayout role="patient">
      <div className="flex flex-col gap-8 max-w-md mx-auto md:max-w-4xl relative">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Boa tarde, Maria</h1>
            <p className="text-slate-500 text-sm">Vamos manter o foco hoje?</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-100 animate-in fade-in slide-in-from-top-2">
            <Flame className="w-4 h-4 fill-amber-600" />
            <span className="text-xs font-bold">12 dias</span>
          </div>
        </header>

        {/* Main Stats */}
        <Card className="p-6 shadow-card border-none bg-white relative overflow-hidden transition-all duration-500">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Animated Ring */}
            <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-300">
              <CircularProgress
                value={calories}
                max={2000}
                size="lg"
                label={calories.toString()}
                sublabel="kcal"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full backdrop-blur-[2px]">
                <span className="text-xs font-bold text-primary">Ver Detalhes</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Proteína</span>
                  <span className="text-slate-500">{proteins}g / 120g</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[hsl(var(--macro-protein))] rounded-full transition-all duration-1000"
                    style={{ width: `${(proteins / 120) * 100}%` }}
                  />
                </div>
              </div>
              {/* Other macros static for demo */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Carboidrato</span>
                  <span className="text-slate-500">120g / 200g</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[hsl(var(--macro-carb))] w-[60%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Meal & Hydration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Próxima Refeição</h2>
              <Button variant="ghost" className="text-primary hover:text-primary-dark h-auto p-0 text-sm font-semibold">
                Ver plano completo
              </Button>
            </div>

            <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <span className="text-lg">🌙</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Jantar</h3>
                    <p className="text-xs text-slate-500 font-medium">Recomendado para 19:00</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                  450 kcal
                </Badge>
              </div>

              {/* Visual Recommendation ONLY */}
              <div className="space-y-3 opacity-60">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 bg-slate-200 rounded-md shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Sugestão: Frango</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsLogging(true)}
                className="w-full mt-4 bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-lg h-10 active:scale-95 transition-all"
              >
                Registrar Refeição
              </Button>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Hidratação</h2>
            <Card className="p-6 bg-blue-50/50 border-blue-100 shadow-none flex flex-col items-center justify-center gap-4 h-[calc(100%-2.5rem)]">
              <div className="relative">
                <Droplets className="w-16 h-16 text-blue-400" />
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  +250ml
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">1.25L</p>
                <p className="text-sm text-slate-500">de 2.5L diários</p>
              </div>
            </Card>
          </section>
        </div>

        {/* LOGGING MODAL / DRAWER SIMULATION */}
        {isLogging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-900">O que você comeu?</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsLogging(false)} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sugestões Recentes</p>
                {FOOD_DATABASE.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => toggleFood(food.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedFoods.includes(food.id)
                        ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                        : "bg-white border-slate-100 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{food.icon}</span>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 text-sm">{food.name}</p>
                        <p className="text-xs text-slate-500">{food.portion}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-slate-700 text-sm">{food.cal}</span>
                      <span className="text-[10px] text-slate-400">kcal</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <Button
                  onClick={handleLogMeal}
                  disabled={selectedFoods.length === 0}
                  className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-emerald-200"
                >
                  Adicionar {selectedFoods.length > 0 && `(${selectedFoods.reduce((acc, id) => acc + (FOOD_DATABASE.find(f => f.id === id)?.cal || 0), 0)} kcal)`}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

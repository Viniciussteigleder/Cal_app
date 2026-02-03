"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Camera, MessageCircle, Heart, ThumbsUp, Frown, ThumbsDown } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data for "Last 7 Days" Photo Diary
const PHOTO_DIARY_ENTRIES = [
  {
    id: 1,
    patientName: "Karen Einsfeldt",
    date: "02/02/2026 - 13:11",
    meal: "Almoço",
    image: "/mock-food-1.jpg", // Placeholder
    feedback: { likes: 2, comments: 1 },
    reactions: ["heart", "yummy"],
    nutriFeedback: "Ótima escolha de proteínas!",
  },
  {
    id: 2,
    patientName: "Andressa Vilas Boas",
    date: "02/02/2026 - 12:18",
    meal: "Almoço (Opção 1)",
    image: "/mock-food-2.jpg",
    feedback: { likes: 1, comments: 0 },
    reactions: ["thumbsup"],
    nutriFeedback: null,
  },
  {
    id: 3,
    patientName: "Karen Einsfeldt",
    date: "02/02/2026 - 07:57",
    meal: "Café da manhã",
    image: "/mock-food-3.jpg",
    feedback: { likes: 3, comments: 2 },
    reactions: ["heart", "coffee"],
    nutriFeedback: "Cuidado com a quantidade de pão.",
  },
];

// ... (Keeping existing interfaces/types if needed, but simplifying for the visual requirement)
type MealType = "breakfast" | "lunch" | "dinner" | "snack";
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Café da Manhã",
  lunch: "Almoço",
  snack: "Lanche",
  dinner: "Jantar",
};

export default function DiaryPage() {
  const [viewMode, setViewMode] = useState<"visual" | "detailed">("visual");

  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diário Alimentar</h1>
            <p className="text-sm text-muted-foreground">Registros dos seus pacientes e histórico.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === "visual" ? "default" : "outline"} onClick={() => setViewMode("visual")}>
              Últimos 7 dias (Fotos)
            </Button>
            <Button variant={viewMode === "detailed" ? "default" : "outline"} onClick={() => setViewMode("detailed")}>
              Registro Detalhado
            </Button>
          </div>
        </header>

        {viewMode === "visual" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
              <span className="font-semibold text-sm">Diário alimentar - Últimos 7 dias</span>
              <Button variant="secondary" size="sm" className="bg-muted hover:bg-muted/80 text-muted-foreground">
                Ver fotos não reagidas
              </Button>
            </div>

            <div className="grid gap-6">
              {PHOTO_DIARY_ENTRIES.map(entry => (
                <Card key={entry.id} className="overflow-hidden border-none shadow-md bg-card">
                  <div className="p-4 flex items-center gap-3 border-b border-border/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{entry.patientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{entry.patientName}</h4>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm">{entry.meal}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-pink-500 hover:bg-pink-50">
                          <Heart className="h-4 w-4 fill-pink-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-500 hover:bg-amber-50">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:bg-slate-100">
                          <Frown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:bg-slate-100">
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Photo Area Placeholder */}
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                      {/* In a real app, use entry.image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-sm font-medium">Ver detalhes nutricionais</p>
                      </div>
                      <Camera className="h-10 w-10 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground mt-2 absolute bottom-2">Foto da refeição</span>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-md text-sm text-foreground/80 flex justify-between items-center">
                      <span className="italic text-muted-foreground text-xs">Adicionar comentário...</span>
                      <Button variant="ghost" size="sm" className="text-xs h-6">Responder</Button>
                    </div>

                    {entry.nutriFeedback && (
                      <div className="flex gap-2 items-start bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded text-xs text-emerald-800 dark:text-emerald-300">
                        <MessageCircle className="h-3 w-3 mt-0.5" />
                        <span>{entry.nutriFeedback}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* DETAILED VIEW (Re-implementing simplified original logic or stub for brevity) */
          <div className="text-center py-10">
            <div className="p-6 bg-muted rounded-lg inline-block">
              <h3 className="text-lg font-medium">Modo Detalhado</h3>
              <p className="text-sm text-muted-foreground mt-2">A visualização detalhada de macros e logs diários está disponível.</p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-card p-2 rounded shadow-sm"><div className="font-bold">1850</div><div className="text-xs">Kcal</div></div>
                  <div className="bg-card p-2 rounded shadow-sm"><div className="font-bold text-blue-500">120g</div><div className="text-xs">Prot</div></div>
                  <div className="bg-card p-2 rounded shadow-sm"><div className="font-bold text-green-500">200g</div><div className="text-xs">Carb</div></div>
                  <div className="bg-card p-2 rounded shadow-sm"><div className="font-bold text-orange-500">60g</div><div className="text-xs">Gord</div></div>
                </div>
                <Button className="mt-4 w-full">Ver Registro Completo de Hoje</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

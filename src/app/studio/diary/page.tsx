"use client";

import { useState } from "react";
import { Camera, MessageCircle, Heart, ThumbsUp, Frown, ThumbsDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock Data for "Last 7 Days" Photo Diary (nutritionist view)
const PHOTO_DIARY_ENTRIES = [
  {
    id: 1,
    patientName: "Karen Einsfeldt",
    date: "02/02/2026 - 13:11",
    meal: "Almoço",
    nutriFeedback: "Ótima escolha de proteínas!",
  },
  {
    id: 2,
    patientName: "Andressa Vilas Boas",
    date: "02/02/2026 - 12:18",
    meal: "Almoço (Opção 1)",
    nutriFeedback: null,
  },
  {
    id: 3,
    patientName: "Karen Einsfeldt",
    date: "02/02/2026 - 07:57",
    meal: "Café da manhã",
    nutriFeedback: "Cuidado com a quantidade de pão.",
  },
];

export default function StudioDiaryPage() {
  const [viewMode, setViewMode] = useState<"visual" | "detailed">("visual");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diário Alimentar (Visual)</h1>
          <p className="text-sm text-muted-foreground">
            Triagem rápida de fotos e feedback por paciente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "visual" ? "default" : "outline"}
            onClick={() => setViewMode("visual")}
          >
            Últimos 7 dias (Fotos)
          </Button>
          <Button
            variant={viewMode === "detailed" ? "default" : "outline"}
            onClick={() => setViewMode("detailed")}
          >
            Registro Detalhado
          </Button>
        </div>
      </header>

      {viewMode === "visual" ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <span className="font-semibold text-sm">Últimos 7 dias</span>
            <Button variant="secondary" size="sm" className="bg-muted hover:bg-muted/80 text-muted-foreground">
              Ver fotos não reagidas
            </Button>
          </div>

          <div className="grid gap-6">
            {PHOTO_DIARY_ENTRIES.map((entry) => (
              <Card key={entry.id} className="overflow-hidden border-none shadow-md bg-card">
                <div className="p-4 flex items-center gap-3 border-b border-border/50">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{entry.patientName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold">{entry.patientName}</h2>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-bold text-sm">{entry.meal}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-pink-600 hover:bg-pink-50"
                        aria-label="Reagir com gostei"
                      >
                        <Heart className="h-5 w-5 fill-pink-600" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-amber-600 hover:bg-amber-50"
                        aria-label="Reagir com positivo"
                      >
                        <ThumbsUp className="h-5 w-5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-500 hover:bg-slate-100"
                        aria-label="Reagir com neutro"
                      >
                        <Frown className="h-5 w-5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-500 hover:bg-slate-100"
                        aria-label="Reagir com negativo"
                      >
                        <ThumbsDown className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  {/* Photo Area Placeholder */}
                  <div
                    className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label="Abrir detalhes da foto da refeição"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">Ver detalhes nutricionais</p>
                    </div>
                    <Camera className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground mt-2 absolute bottom-2">Foto da refeição</span>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-md text-sm text-foreground/80 flex justify-between items-center gap-3">
                    <span className="italic text-muted-foreground text-xs">Adicionar comentário...</span>
                    <Button variant="ghost" size="sm" className="text-xs h-9 px-3">
                      Responder
                    </Button>
                  </div>

                  {entry.nutriFeedback && (
                    <div className="flex gap-2 items-start bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded text-xs text-emerald-800 dark:text-emerald-300">
                      <MessageCircle className="h-3 w-3 mt-0.5" aria-hidden="true" />
                      <span>{entry.nutriFeedback}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="p-6 bg-muted rounded-lg inline-block">
            <h2 className="text-lg font-medium">Modo Detalhado</h2>
            <p className="text-sm text-muted-foreground mt-2">
              A visualização detalhada de macros e logs diários entra aqui.
            </p>
            <Button className="mt-4 w-full">Ver registro completo</Button>
          </div>
        </div>
      )}
    </div>
  );
}


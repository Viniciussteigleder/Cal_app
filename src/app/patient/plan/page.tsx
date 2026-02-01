import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlanPage() {
  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Plano</h1>
            <p className="text-sm text-muted-foreground">Versão 2.1 • Atualizado por Dr. Silva</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <Card className="p-6 border-none shadow-card bg-emerald-900 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-lg font-bold mb-2">Objetivo Atual: Hipertrofia</h2>
            <div className="flex gap-4 text-emerald-100 text-sm">
              <span>🎯 2.400 kcal/dia</span>
              <span>💧 3.0L água</span>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-emerald-800/50 skew-x-12 transform origin-bottom" />
        </Card>

        {/* Days of Week - Horizontal Scroll on Mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"].map((day, i) => (
            <button
              key={day}
              className={`flex-1 min-w-[60px] flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${i === 0
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
            >
              <span className="text-[10px] font-bold">{day}</span>
              <span className="text-lg font-bold">{24 + i}</span>
            </button>
          ))}
        </div>

        <section className="space-y-4">
          {["Café da Manhã (08:00)", "Colação (10:30)", "Almoço (13:00)"].map((meal, index) => (
            <Card key={index} className="overflow-hidden border-border shadow-sm hover:shadow-card transition-shadow">
              <div className="bg-muted/40 p-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-muted-foreground text-sm">{meal}</h3>
                <Badge variant="secondary" className="bg-card border-border font-normal">
                  Opção 1
                </Badge>
              </div>
              <div className="p-4 space-y-3">
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Pão 100% Integral</span>
                    <span className="text-muted-foreground font-mono text-xs bg-muted px-2 py-1 rounded">2 fatias</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Ovos Mexidos</span>
                    <span className="text-muted-foreground font-mono text-xs bg-muted px-2 py-1 rounded">2 un</span>
                  </li>
                </ul>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}

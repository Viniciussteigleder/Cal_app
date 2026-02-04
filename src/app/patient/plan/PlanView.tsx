'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type DayOfWeek = "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB" | "DOM";

export function PlanView({ activeProtocol }: { activeProtocol: any }) {
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    // Get current week's dates
    const getCurrentWeekDates = () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const monday = new Date(today);
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // Adjust to Monday

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    };

    const weekDates = getCurrentWeekDates();

    const navigateDay = (direction: "prev" | "next") => {
        if (direction === "prev" && selectedDayIndex > 0) {
            setSelectedDayIndex(selectedDayIndex - 1);
        } else if (direction === "next" && selectedDayIndex < 6) {
            setSelectedDayIndex(selectedDayIndex + 1);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Meu Plano</h1>
                    <p className="text-sm text-muted-foreground">
                        {activeProtocol ? `Estratégia Ativa: ${activeProtocol.protocol.name}` : 'Nenhum plano ativo'}
                    </p>
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

            {activeProtocol?.protocol ? (
                <>
                    <Card className="p-6 border-none shadow-card bg-emerald-900 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-lg font-bold mb-2">{activeProtocol.protocol.name}</h2>
                            <div className="flex gap-4 text-emerald-100 text-sm">
                                <span>📅 Iniciado em {new Date(activeProtocol.started_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-emerald-800/50 skew-x-12 transform origin-bottom" />
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Diretrizes e Cardápio
                        </h3>

                        <Card className="p-6 bg-card border shadow-sm">
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                {activeProtocol.protocol.description}
                            </div>
                        </Card>

                        {activeProtocol.protocol.warnings && activeProtocol.protocol.warnings.length > 0 && (
                            <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
                                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Avisos Importantes</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                                    {activeProtocol.protocol.warnings.map((w: string, i: number) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">Seu nutricionista ainda não disponibilizou um plano alimentar.</p>
                </div>
            )}
        </div>
    );
}

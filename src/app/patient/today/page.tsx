"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Plus,
  Utensils,
  Activity,
  Pill,
  Droplets,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { MOCK_MEALS_TODAY, MOCK_SYMPTOM_LOGS } from "@/lib/mock-data";

interface TimelineItem {
  id: string;
  type: "meal" | "symptom" | "medication" | "water" | "checkin";
  time: string;
  title: string;
  subtitle?: string;
  status?: "completed" | "pending" | "alert";
  data?: Record<string, unknown>;
}

export default function TodayPage() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [waterIntake, setWaterIntake] = useState(5); // 5 glasses = 1.25L

  function getMealTypeName(type: string) {
    const names: Record<string, string> = {
      breakfast: "Café da manhã",
      morning_snack: "Lanche da manhã",
      lunch: "Almoço",
      afternoon_snack: "Lanche da tarde",
      dinner: "Jantar",
      supper: "Ceia",
    };
    return names[type] || type;
  }

  useEffect(() => {
    // Build timeline from mock data
    const items: TimelineItem[] = [];

    // Add meals
    MOCK_MEALS_TODAY.forEach((meal) => {
      items.push({
        id: meal.id,
        type: "meal",
        time: meal.time,
        title: getMealTypeName(meal.type),
        subtitle: `${meal.items.length} itens • ${meal.totalCalories} kcal`,
        status: "completed",
        data: meal,
      });
    });

    // Add symptom logs
    MOCK_SYMPTOM_LOGS.forEach((log) => {
      items.push({
        id: log.id,
        type: "symptom",
        time: new Date(log.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        title: "Sintoma registrado",
        subtitle: log.symptoms.join(", "),
        status: log.discomfortLevel >= 7 ? "alert" : "completed",
        data: log,
      });
    });

    // Add pending check-in
    const now = new Date();
    const lastMeal = MOCK_MEALS_TODAY[MOCK_MEALS_TODAY.length - 1];
    if (lastMeal) {
      const [hours, minutes] = lastMeal.time.split(":").map(Number);
      const mealTime = new Date();
      mealTime.setHours(hours, minutes, 0, 0);
      const twoHoursLater = new Date(mealTime.getTime() + 2 * 60 * 60 * 1000);

      if (now >= mealTime && now < twoHoursLater) {
        items.push({
          id: "checkin-pending",
          type: "checkin",
          time: twoHoursLater.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          title: "Check-in pós-refeição",
          subtitle: "Como você está se sentindo após o almoço?",
          status: "pending",
        });
      }
    }

    // Add upcoming meal
    const upcomingMeals = [
      { type: "dinner", time: "19:00", suggestion: "Jantar sugerido" },
    ];

    const currentHour = now.getHours();
    upcomingMeals.forEach((meal) => {
      const [h] = meal.time.split(":").map(Number);
      if (h > currentHour) {
        items.push({
          id: `upcoming-${meal.type}`,
          type: "meal",
          time: meal.time,
          title: meal.suggestion,
          subtitle: "Confira seu plano alimentar",
          status: "pending",
        });
      }
    });

    // Sort by time
    items.sort((a, b) => {
      const [aH, aM] = a.time.split(":").map(Number);
      const [bH, bM] = b.time.split(":").map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });

  setTimelineItems(items);
}, []);

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "meal":
        return <Utensils className="h-5 w-5" />;
      case "symptom":
        return <Activity className="h-5 w-5" />;
      case "medication":
        return <Pill className="h-5 w-5" />;
      case "water":
        return <Droplets className="h-5 w-5" />;
      case "checkin":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "alert":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const addWater = () => {
    setWaterIntake((prev) => prev + 1);
  };

  return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hoje</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Dia {12} de registro
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/patient/capture">
            <Button
              variant="default"
              className="w-full h-20 flex flex-col gap-1 bg-primary hover:bg-primary/90"
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs">Refeição</span>
            </Button>
          </Link>
          <Link href="/patient/symptoms">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-1"
            >
              <Activity className="h-6 w-6" />
              <span className="text-xs">Sintoma</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-1"
            onClick={addWater}
          >
            <Droplets className="h-6 w-6 text-blue-500" />
            <span className="text-xs">Água</span>
          </Button>
          <Link href="/patient/chat">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-1"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs">Chat</span>
            </Button>
          </Link>
        </div>

        {/* Water Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200 dark:from-blue-950/30 dark:to-blue-900/10 dark:border-blue-900/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Hidratação</p>
                  <p className="text-sm text-muted-foreground">
                    {(waterIntake * 0.25).toFixed(2)}L de 2.5L
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-6 rounded-full ${
                        i < waterIntake ? "bg-blue-500" : "bg-blue-200 dark:bg-blue-900"
                      }`}
                    />
                  ))}
                </div>
                <Button size="sm" variant="ghost" onClick={addWater}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Lembretes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-card rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Check-in pós-almoço</p>
                  <p className="text-xs text-muted-foreground">
                    Como você está se sentindo?
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Responder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineItems.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.status === "completed"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : item.status === "alert"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        getTimelineIcon(item.type)
                      )}
                    </div>
                    {index < timelineItems.length - 1 && (
                      <div className="w-0.5 h-full bg-border min-h-[40px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-sm text-muted-foreground">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.time}
                        </span>
                        {item.status === "pending" && (
                          <Button size="sm" variant="ghost">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded content for meals */}
                    {item.type === "meal" && item.status === "completed" && item.data && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {(item.data as { items: Array<{ name: string }> }).items?.map(
                            (food: { name: string }, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {food.name}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insight */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-900/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  Insight do dia
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Você está mantendo uma boa consistência de registros!
                  Seus sintomas diminuíram 30% nas últimas 2 semanas desde que
                  começou a evitar laticínios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

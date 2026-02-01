import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

// Mock insights data
const MOCK_INSIGHTS = [
  {
    type: "success" as const,
    title: "Ótima consistência!",
    description: "Você registrou refeições em 5 dos últimos 7 dias. Continue assim!",
    priority: 1,
  },
  {
    type: "tip" as const,
    title: "Aumente a proteína",
    description:
      "Para seu objetivo de perda de peso, consumir mais proteína ajuda a manter a massa muscular e aumentar a saciedade.",
    priority: 2,
  },
  {
    type: "success" as const,
    title: "Sintomas controlados",
    description:
      "Seus níveis de desconforto estão baixos. Seu plano alimentar parece estar funcionando bem!",
    priority: 2,
  },
  {
    type: "info" as const,
    title: "Protocolo Low FODMAP ativo",
    description: "Você está seguindo o protocolo Low FODMAP. Lembre-se de seguir as orientações específicas para esta fase.",
    priority: 2,
  },
  {
    type: "tip" as const,
    title: "Dica do dia",
    description:
      "Beba água ao longo do dia. A hidratação adequada ajuda na digestão e no bem-estar geral.",
    priority: 4,
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId") || session.patientId;

    if (!patientId) {
      return NextResponse.json(
        { error: "ID do paciente é obrigatório" },
        { status: 400 }
      );
    }

    // Try database first
    try {
      const { prisma } = await import("@/lib/prisma");

      // Get patient data
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          user: true,
          profile: true,
          protocol_instances: {
            where: { is_active: true },
            include: { protocol: true },
          },
        },
      });

      if (!patient) {
        return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
      }

      // Get recent meals
      const recentMeals = await prisma.meal.findMany({
        where: { patient_id: patientId },
        include: {
          items: { include: { snapshot: true } },
        },
        orderBy: { date: "desc" },
        take: 30,
      });

      // Get recent symptoms
      const recentSymptoms = await prisma.symptomLog.findMany({
        where: { patient_id: patientId },
        orderBy: { logged_at: "desc" },
        take: 30,
      });

      // Calculate nutrition averages
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let mealCount = 0;

      for (const meal of recentMeals) {
        for (const item of meal.items) {
          const snapshot = item.snapshot.snapshot_json as {
            nutrients?: {
              energy_kcal?: number;
              protein_g?: number;
              carbs_g?: number;
              fat_g?: number;
            };
          };
          const grams = Number(item.grams);
          const multiplier = grams / 100;

          totalCalories += (snapshot.nutrients?.energy_kcal || 0) * multiplier;
          totalProtein += (snapshot.nutrients?.protein_g || 0) * multiplier;
          totalCarbs += (snapshot.nutrients?.carbs_g || 0) * multiplier;
          totalFat += (snapshot.nutrients?.fat_g || 0) * multiplier;
        }
        mealCount++;
      }

      const avgCaloriesPerMeal = mealCount > 0 ? totalCalories / mealCount : 0;
      const avgProteinPerMeal = mealCount > 0 ? totalProtein / mealCount : 0;

      // Calculate symptom trends
      const avgDiscomfort =
        recentSymptoms.length > 0
          ? recentSymptoms.reduce(
              (acc, s) => acc + (s.discomfort_level || 0),
              0
            ) / recentSymptoms.length
          : 0;

      const bristolDistribution: Record<string, number> = {};
      for (const symptom of recentSymptoms) {
        if (symptom.bristol_scale) {
          bristolDistribution[symptom.bristol_scale] =
            (bristolDistribution[symptom.bristol_scale] || 0) + 1;
        }
      }

      // Generate personalized insights
      const insights: Array<{
        type: "success" | "warning" | "info" | "tip";
        title: string;
        description: string;
        priority: number;
      }> = [];

      // Consistency insight
      const uniqueDays = new Set(
        recentMeals.map((m) => new Date(m.date).toDateString())
      ).size;
      if (uniqueDays >= 5) {
        insights.push({
          type: "success",
          title: "Ótima consistência!",
          description: `Você registrou refeições em ${uniqueDays} dos últimos 7 dias. Continue assim!`,
          priority: 1,
        });
      } else if (uniqueDays < 3) {
        insights.push({
          type: "tip",
          title: "Melhore sua consistência",
          description:
            "Registrar refeições regularmente ajuda a identificar padrões. Tente registrar pelo menos 1 refeição por dia.",
          priority: 2,
        });
      }

      // Protein insight
      if (patient.profile?.goal === "loss" && avgProteinPerMeal < 20) {
        insights.push({
          type: "tip",
          title: "Aumente a proteína",
          description:
            "Para seu objetivo de perda de peso, consumir mais proteína ajuda a manter a massa muscular e aumentar a saciedade.",
          priority: 2,
        });
      }

      // Symptom trend insight
      if (avgDiscomfort > 5) {
        insights.push({
          type: "warning",
          title: "Desconforto frequente",
          description: `Sua média de desconforto é ${avgDiscomfort.toFixed(1)}/10. Considere conversar com seu nutricionista sobre ajustes na dieta.`,
          priority: 1,
        });
      } else if (avgDiscomfort < 3 && recentSymptoms.length > 5) {
        insights.push({
          type: "success",
          title: "Sintomas controlados",
          description:
            "Seus níveis de desconforto estão baixos. Seu plano alimentar parece estar funcionando bem!",
          priority: 2,
        });
      }

      // Bristol scale insight
      const type4Count = bristolDistribution["type_4"] || 0;
      const totalBristol = Object.values(bristolDistribution).reduce(
        (a, b) => a + b,
        0
      );
      if (totalBristol > 5 && type4Count / totalBristol > 0.5) {
        insights.push({
          type: "success",
          title: "Trânsito intestinal saudável",
          description:
            "A maioria dos seus registros indica um trânsito intestinal ideal (Tipo 4).",
          priority: 3,
        });
      }

      // Protocol-specific insights
      if (patient.protocol_instances.length > 0) {
        const protocol = patient.protocol_instances[0].protocol;
        insights.push({
          type: "info",
          title: `Protocolo ${protocol.name} ativo`,
          description: `Você está seguindo o protocolo ${protocol.name}. Lembre-se de seguir as orientações específicas para esta fase.`,
          priority: 2,
        });
      }

      // Hydration tip (general)
      insights.push({
        type: "tip",
        title: "Dica do dia",
        description:
          "Beba água ao longo do dia. A hidratação adequada ajuda na digestão e no bem-estar geral.",
        priority: 4,
      });

      // Sort by priority
      insights.sort((a, b) => a.priority - b.priority);

      return NextResponse.json({
        patient: {
          name: patient.user?.name || "Desconhecido",
          goal: patient.profile?.goal || "maintain",
        },
        nutrition: {
          avgCaloriesPerMeal: Math.round(avgCaloriesPerMeal),
          avgProteinPerMeal: Math.round(avgProteinPerMeal),
          totalMealsLogged: mealCount,
          daysWithMeals: uniqueDays,
        },
        symptoms: {
          avgDiscomfort: Math.round(avgDiscomfort * 10) / 10,
          totalLogged: recentSymptoms.length,
          bristolDistribution,
        },
        insights,
      });
    } catch (dbError) {
      console.log("Banco de dados não disponível, usando dados de demonstração");
    }

    // Return mock data if database not available
    return NextResponse.json({
      patient: {
        name: "Maria Silva",
        goal: "loss",
      },
      nutrition: {
        avgCaloriesPerMeal: 450,
        avgProteinPerMeal: 28,
        totalMealsLogged: 12,
        daysWithMeals: 5,
      },
      symptoms: {
        avgDiscomfort: 2.5,
        totalLogged: 8,
        bristolDistribution: {
          type_3: 2,
          type_4: 5,
          type_5: 1,
        },
      },
      insights: MOCK_INSIGHTS,
    });
  } catch (error) {
    console.error("Erro nos insights de IA:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

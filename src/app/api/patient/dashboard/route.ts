import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { MOCK_DASHBOARD_DATA } from "@/lib/mock-data";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Try database first
    try {
      const { prisma } = await import("@/lib/prisma");

      if (session.patientId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get patient profile
        const profile = await prisma.patientProfile.findUnique({
          where: { patient_id: session.patientId },
        });

        // Get today's meals with items
        const todayMeals = await prisma.meal.findMany({
          where: {
            patient_id: session.patientId,
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
          include: {
            items: {
              include: {
                snapshot: true,
              },
            },
          },
        });

        // Calculate today's totals
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        for (const meal of todayMeals) {
          for (const item of meal.items) {
            const nutrients = item.snapshot.snapshot_json as {
              nutrients: {
                energy_kcal: number;
                protein_g: number;
                carbs_g: number;
                fat_g: number;
              };
            };
            const grams = Number(item.grams);
            const multiplier = grams / 100;

            totalCalories += nutrients.nutrients.energy_kcal * multiplier;
            totalProtein += nutrients.nutrients.protein_g * multiplier;
            totalCarbs += nutrients.nutrients.carbs_g * multiplier;
            totalFat += nutrients.nutrients.fat_g * multiplier;
          }
        }

        // Calculate goals based on profile
        const targetCalories = profile ? calculateTDEE(profile) : 2000;
        const macroSplit = { protein: 0.25, carbs: 0.45, fat: 0.30 };

        // Get consistency streak
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);

        const weekMeals = await prisma.meal.groupBy({
          by: ["date"],
          where: {
            patient_id: session.patientId,
            date: { gte: weekStart },
          },
        });

        return NextResponse.json({
          profile: profile ? {
            name: session.name,
            currentWeight: Number(profile.current_weight_kg),
            targetWeight: profile.target_weight_kg ? Number(profile.target_weight_kg) : null,
            goal: profile.goal,
          } : null,
          today: {
            calories: Math.round(totalCalories),
            protein: Math.round(totalProtein),
            carbs: Math.round(totalCarbs),
            fat: Math.round(totalFat),
            mealsLogged: todayMeals.length,
          },
          goals: {
            calories: Math.round(targetCalories),
            protein: Math.round((targetCalories * macroSplit.protein) / 4),
            carbs: Math.round((targetCalories * macroSplit.carbs) / 4),
            fat: Math.round((targetCalories * macroSplit.fat) / 9),
          },
          consistency: {
            daysThisWeek: weekMeals.length,
            streak: weekMeals.length,
          },
        });
      }
    } catch (dbError) {
      console.log("Banco de dados não disponível, usando dados de demonstração");
    }

    // Return mock data if database not available
    return NextResponse.json({
      profile: {
        name: session.name || MOCK_DASHBOARD_DATA.profile.name,
        currentWeight: MOCK_DASHBOARD_DATA.profile.currentWeight,
        targetWeight: MOCK_DASHBOARD_DATA.profile.targetWeight,
        goal: MOCK_DASHBOARD_DATA.profile.goal,
      },
      today: MOCK_DASHBOARD_DATA.today,
      goals: MOCK_DASHBOARD_DATA.goals,
      consistency: MOCK_DASHBOARD_DATA.consistency,
    });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

function calculateTDEE(profile: {
  sex: string;
  birth_date: Date;
  height_cm: unknown;
  current_weight_kg: unknown;
  activity_level: string;
  goal: string;
}): number {
  const weight = Number(profile.current_weight_kg);
  const height = Number(profile.height_cm);
  const age = Math.floor(
    (Date.now() - new Date(profile.birth_date).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );

  // Fórmula Mifflin-St Jeor
  let bmr: number;
  if (profile.sex === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Multiplicador de atividade
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[profile.activity_level] || 1.55);

  // Ajuste por objetivo
  if (profile.goal === "loss") {
    return tdee * 0.85; // 15% déficit
  } else if (profile.goal === "gain") {
    return tdee * 1.15; // 15% superávit
  }

  return tdee;
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "PATIENT" || !session.patientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Get recent symptom logs
    const recentSymptoms = await prisma.symptomLog.findMany({
      where: { patient_id: session.patientId },
      orderBy: { logged_at: "desc" },
      take: 5,
    });

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

    const consistencyDays = weekMeals.length;

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
      recentSymptoms: recentSymptoms.map((s) => ({
        id: s.id,
        date: s.logged_at,
        discomfortLevel: s.discomfort_level,
        bristolScale: s.bristol_scale,
        symptoms: s.symptoms,
      })),
      consistency: {
        daysThisWeek: consistencyDays,
        streak: consistencyDays,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

  // Mifflin-St Jeor formula
  let bmr: number;
  if (profile.sex === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[profile.activity_level] || 1.55);

  // Goal adjustment
  if (profile.goal === "loss") {
    return tdee * 0.85; // 15% deficit
  } else if (profile.goal === "gain") {
    return tdee * 1.15; // 15% surplus
  }

  return tdee;
}

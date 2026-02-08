import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

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

        // Calculate Deep Health Metrics
        const upfCounts = { inNatura: 0, processed: 0, ultraProcessed: 0, total: 0 };
        let totalProteinQuality = 0;
        let proteinGramsWithQuality = 0;
        let totalUpfScore = 0;

        for (const meal of todayMeals) {
          for (const item of meal.items) {
            const snapshot = item.snapshot.snapshot_json as {
              upf_category?: number;
              protein_quality?: number;
              nutrients: { protein_g: number };
            };
            const grams = Number(item.grams);

            // UPF Distribution
            const nova = snapshot.upf_category || 1; // Default to 1 if missing
            if (nova === 1) upfCounts.inNatura += grams;
            else if (nova === 4) upfCounts.ultraProcessed += grams;
            else upfCounts.processed += grams;
            upfCounts.total += grams;

            // Protein Quality (Weighted by protein content)
            if (snapshot.protein_quality) {
              const protein = (snapshot.nutrients.protein_g || 0) * (grams / 100);
              if (protein > 0) {
                totalProteinQuality += snapshot.protein_quality * protein;
                proteinGramsWithQuality += protein;
              }
            }

            totalUpfScore += nova * grams;
          }
        }

        const avgNova = upfCounts.total > 0 ? totalUpfScore / upfCounts.total : 1;

        // Calculate percentages
        const upfDistribution = {
          inNatura: upfCounts.total > 0 ? Math.round((upfCounts.inNatura / upfCounts.total) * 100) : 0,
          processed: upfCounts.total > 0 ? Math.round((upfCounts.processed / upfCounts.total) * 100) : 0,
          ultraProcessed: upfCounts.total > 0 ? Math.round((upfCounts.ultraProcessed / upfCounts.total) * 100) : 0,
        };

        // Heuristic Scores
        // Density: Inversely related to NOVA and positively to variety (mocked variety as consistent high)
        const micronutrientDensity = Math.min(10, Math.max(0, 10 - (avgNova * 1.5) + (totalProtein / targetCalories * 100)));

        // Protein Quality
        const avgPDCAAS = proteinGramsWithQuality > 0 ? totalProteinQuality / proteinGramsWithQuality : 1;
        const proteinQuality = avgPDCAAS >= 0.9 ? "High" : avgPDCAAS >= 0.7 ? "Medium" : "Low";

        // Inflammatory Score (0-100, lower is better)
        // Heavily weighted by Ultra Processed % and total Sugar (assumed from carbs surplus/NOVA)
        const inflammatoryScore = Math.min(100, Math.round(
          (upfDistribution.ultraProcessed * 0.8) + (avgNova * 5)
        ));

        const deepHealth = {
          upfDistribution,
          micronutrientDensity: Number(micronutrientDensity.toFixed(1)),
          proteinQuality,
          inflammatoryScore
        };

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
          deepHealth, // Added new field
        });
      }

    // No patient profile yet - return empty dashboard
    return NextResponse.json({
      profile: { name: session.name, currentWeight: 0, targetWeight: null, goal: "maintain" },
      today: { calories: 0, protein: 0, carbs: 0, fat: 0, mealsLogged: 0 },
      goals: { calories: 2000, protein: 125, carbs: 225, fat: 67 },
      consistency: { daysThisWeek: 0, streak: 0 },
      deepHealth: null,
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

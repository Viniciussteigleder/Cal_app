import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

// AI-powered symptom-meal correlation analysis
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    // For patients, only show their own correlations
    const targetPatientId =
      session.role === "PATIENT" ? session.patientId : patientId;

    if (!targetPatientId) {
      return NextResponse.json(
        { error: "Patient ID required" },
        { status: 400 }
      );
    }

    // Get symptom logs (without broken `correlations` include)
    const symptomLogs = await prisma.symptomLog.findMany({
      where: { patient_id: targetPatientId },
      orderBy: { logged_at: "desc" },
      take: 50,
    });

    // Get all meals for this patient
    const meals = await prisma.meal.findMany({
      where: { patient_id: targetPatientId },
      orderBy: { date: "desc" },
      take: 100,
    });

    // Get meal items and snapshots as separate queries
    const mealIds = meals.map((m) => m.id);
    const mealItems = mealIds.length > 0
      ? await prisma.mealItem.findMany({
          where: { meal_id: { in: mealIds } },
        })
      : [];

    const snapshotIds = [...new Set(mealItems.map((i) => i.snapshot_id))];
    const snapshots = snapshotIds.length > 0
      ? await prisma.foodSnapshot.findMany({
          where: { id: { in: snapshotIds } },
        })
      : [];
    const snapshotMap = new Map(snapshots.map((s) => [s.id, s]));

    // Group items by meal for easy lookup
    const itemsByMeal = new Map<string, Array<{ food_name: string }>>();
    for (const item of mealItems) {
      const snapshot = snapshotMap.get(item.snapshot_id);
      const snapshotData = snapshot?.snapshot_json as { name?: string } | null;
      const foodName = snapshotData?.name || "Unknown";

      const list = itemsByMeal.get(item.meal_id) || [];
      list.push({ food_name: foodName });
      itemsByMeal.set(item.meal_id, list);
    }

    // Analyze patterns
    const foodSymptomCounts: Record<
      string,
      { total: number; symptomCount: number; avgDiscomfort: number }
    > = {};

    for (const symptom of symptomLogs) {
      if (!symptom.discomfort_level || symptom.discomfort_level < 3) continue;

      // Find meals within 2-8 hours before symptom
      const symptomTime = new Date(symptom.logged_at).getTime();
      const relevantMeals = meals.filter((m) => {
        const mealTime = new Date(m.date).getTime();
        const hoursDiff = (symptomTime - mealTime) / (1000 * 60 * 60);
        return hoursDiff >= 2 && hoursDiff <= 8;
      });

      for (const meal of relevantMeals) {
        const foods = itemsByMeal.get(meal.id) || [];
        for (const food of foods) {
          const foodName = food.food_name;

          if (!foodSymptomCounts[foodName]) {
            foodSymptomCounts[foodName] = {
              total: 0,
              symptomCount: 0,
              avgDiscomfort: 0,
            };
          }

          foodSymptomCounts[foodName].symptomCount++;
          foodSymptomCounts[foodName].avgDiscomfort +=
            symptom.discomfort_level || 0;
        }
      }
    }

    // Count total occurrences of each food
    for (const meal of meals) {
      const foods = itemsByMeal.get(meal.id) || [];
      for (const food of foods) {
        const foodName = food.food_name;

        if (!foodSymptomCounts[foodName]) {
          foodSymptomCounts[foodName] = {
            total: 0,
            symptomCount: 0,
            avgDiscomfort: 0,
          };
        }
        foodSymptomCounts[foodName].total++;
      }
    }

    // Calculate correlation scores
    const correlations = Object.entries(foodSymptomCounts)
      .filter(([, data]) => data.total >= 3 && data.symptomCount >= 2)
      .map(([food, data]) => {
        const correlationRatio = data.symptomCount / data.total;
        const avgDiscomfort = data.avgDiscomfort / data.symptomCount;
        const confidence = Math.min(
          0.95,
          correlationRatio * 0.5 + (avgDiscomfort / 10) * 0.3 + Math.min(data.total / 20, 0.2)
        );

        return {
          food,
          totalOccurrences: data.total,
          symptomOccurrences: data.symptomCount,
          correlationRatio: Math.round(correlationRatio * 100),
          avgDiscomfort: Math.round(avgDiscomfort * 10) / 10,
          confidence: Math.round(confidence * 100),
          riskLevel:
            correlationRatio > 0.6 ? "high" : correlationRatio > 0.3 ? "medium" : "low",
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    // Identify symptom patterns
    const symptomPatterns: Record<string, number> = {};
    for (const log of symptomLogs) {
      for (const symptom of log.symptoms) {
        symptomPatterns[symptom] = (symptomPatterns[symptom] || 0) + 1;
      }
    }

    const topSymptoms = Object.entries(symptomPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({
        symptom,
        count,
        percentage: Math.round((count / symptomLogs.length) * 100),
      }));

    // Time-based patterns
    const hourlyPatterns = Array(24).fill(0);
    for (const log of symptomLogs) {
      const hour = new Date(log.logged_at).getHours();
      hourlyPatterns[hour]++;
    }

    const peakHours = hourlyPatterns
      .map((count: number, hour: number) => ({ hour, count }))
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
      .slice(0, 3)
      .map((h: { hour: number; count: number }) => ({
        hour: h.hour,
        label: `${h.hour}:00 - ${h.hour + 1}:00`,
        count: h.count,
      }));

    return NextResponse.json({
      summary: {
        totalSymptomLogs: symptomLogs.length,
        totalMeals: meals.length,
        avgDiscomfort:
          symptomLogs.length > 0
            ? Math.round(
                (symptomLogs.reduce(
                  (acc, s) => acc + (s.discomfort_level || 0),
                  0
                ) /
                  symptomLogs.length) *
                  10
              ) / 10
            : 0,
        highRiskFoods: correlations.filter((c) => c.riskLevel === "high").length,
      },
      correlations,
      topSymptoms,
      peakHours,
      insights: generateInsights(correlations, topSymptoms),
    });
  } catch (error) {
    console.error("AI correlations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateInsights(
  correlations: Array<{ food: string; confidence: number; riskLevel: string }>,
  topSymptoms: Array<{ symptom: string; percentage: number }>
): string[] {
  const insights: string[] = [];

  const highRiskFoods = correlations.filter((c) => c.riskLevel === "high");
  if (highRiskFoods.length > 0) {
    insights.push(
      `${highRiskFoods.length} alimento(s) com alta correlação com sintomas: ${highRiskFoods
        .map((f) => f.food)
        .join(", ")}`
    );
  }

  if (topSymptoms.length > 0 && topSymptoms[0].percentage > 50) {
    insights.push(
      `O sintoma mais frequente é "${topSymptoms[0].symptom}" (${topSymptoms[0].percentage}% dos registros)`
    );
  }

  const fodmapFoods = correlations.filter(
    (c) =>
      c.food.toLowerCase().includes("feijão") ||
      c.food.toLowerCase().includes("lentilha") ||
      c.food.toLowerCase().includes("grão") ||
      c.food.toLowerCase().includes("cebola") ||
      c.food.toLowerCase().includes("alho")
  );

  if (fodmapFoods.length > 0) {
    insights.push(
      "Padrão sugestivo de sensibilidade a FODMAPs detectado. Considerar protocolo de eliminação."
    );
  }

  const histamineFoods = correlations.filter(
    (c) =>
      c.food.toLowerCase().includes("queijo") ||
      c.food.toLowerCase().includes("iogurte") ||
      c.food.toLowerCase().includes("tomate") ||
      c.food.toLowerCase().includes("fermentado")
  );

  if (histamineFoods.length > 0) {
    insights.push(
      "Possível sensibilidade à histamina identificada. Avaliar alimentos fermentados e envelhecidos."
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Continue registrando refeições e sintomas para melhorar a precisão das análises."
    );
  }

  return insights;
}

// Trigger correlation analysis for a specific symptom log
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symptomLogId } = await request.json();

    const symptomLog = await prisma.symptomLog.findUnique({
      where: { id: symptomLogId },
    });

    if (!symptomLog) {
      return NextResponse.json(
        { error: "Symptom log not found" },
        { status: 404 }
      );
    }

    // Find meals in the 2-8 hour window before symptom
    const symptomTime = new Date(symptomLog.logged_at).getTime();
    const windowStart = new Date(symptomTime - 8 * 60 * 60 * 1000);
    const windowEnd = new Date(symptomTime - 2 * 60 * 60 * 1000);

    const relevantMeals = await prisma.meal.findMany({
      where: {
        patient_id: symptomLog.patient_id,
        date: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
    });

    // Create correlations
    const createdCorrelations = [];
    for (const meal of relevantMeals) {
      const hoursDiff =
        (symptomTime - new Date(meal.date).getTime()) / (1000 * 60 * 60);

      // Calculate correlation score based on time proximity and discomfort level
      let baseScore = 0.5;
      if (hoursDiff >= 3 && hoursDiff <= 5) {
        baseScore = 0.8; // Peak digestion window
      } else if (hoursDiff >= 2 && hoursDiff <= 6) {
        baseScore = 0.7;
      }

      // Adjust based on discomfort level
      const discomfortMultiplier = symptomLog.discomfort_level
        ? symptomLog.discomfort_level / 10
        : 0.5;
      const correlationScore = Math.min(0.95, baseScore * (0.7 + discomfortMultiplier * 0.3));

      const correlation = await prisma.symptomMealCorrelation.upsert({
        where: {
          symptom_log_id_meal_id: {
            symptom_log_id: symptomLogId,
            meal_id: meal.id,
          },
        },
        update: {
          correlation_score: correlationScore,
          is_flagged: symptomLog.discomfort_level
            ? symptomLog.discomfort_level >= 7
            : false,
        },
        create: {
          tenant_id: symptomLog.tenant_id,
          symptom_log_id: symptomLogId,
          meal_id: meal.id,
          correlation_score: correlationScore,
          is_flagged: symptomLog.discomfort_level
            ? symptomLog.discomfort_level >= 7
            : false,
        },
      });

      createdCorrelations.push(correlation);
    }

    return NextResponse.json({
      success: true,
      correlationsCreated: createdCorrelations.length,
    });
  } catch (error) {
    console.error("Correlation analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

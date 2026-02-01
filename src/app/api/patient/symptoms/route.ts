import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { MOCK_SYMPTOM_LOGS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PATIENT" || !session.patientId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30");

    // Try database first
    try {
      const { prisma } = await import("@/lib/prisma");

      const symptoms = await prisma.symptomLog.findMany({
        where: { patient_id: session.patientId },
        include: {
          correlations: {
            include: {
              meal: {
                include: {
                  items: {
                    include: {
                      snapshot: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { logged_at: "desc" },
        take: limit,
      });

      const formattedSymptoms = symptoms.map((s) => ({
        id: s.id,
        date: s.logged_at,
        bristolScale: s.bristol_scale,
        discomfortLevel: s.discomfort_level,
        symptoms: s.symptoms,
        notes: s.notes,
        correlations: s.correlations.map((c) => ({
          mealId: c.meal_id,
          mealType: c.meal.type,
          mealDate: c.meal.date,
          correlationScore: c.correlation_score ? Number(c.correlation_score) : null,
          isFlagged: c.is_flagged,
          foods: c.meal.items.map((item) => {
            const snapshot = item.snapshot.snapshot_json as { name?: string };
            return snapshot.name || "Desconhecido";
          }),
        })),
      }));

      return NextResponse.json({ symptoms: formattedSymptoms });
    } catch (dbError) {
      console.log("Banco de dados não disponível, usando dados de demonstração");
    }

    // Return mock data if database not available
    return NextResponse.json({
      symptoms: MOCK_SYMPTOM_LOGS.map(s => ({
        id: s.id,
        date: new Date(s.date),
        bristolScale: s.bristolScale,
        discomfortLevel: s.discomfortLevel,
        symptoms: s.symptoms,
        notes: s.notes,
        correlations: s.linkedMealId ? [{
          mealId: s.linkedMealId,
          mealType: "lunch",
          mealDate: new Date(),
          correlationScore: 0.75,
          isFlagged: s.discomfortLevel >= 7,
          foods: ["Arroz", "Feijão", "Frango"],
        }] : [],
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar sintomas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PATIENT" || !session.patientId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { bristolScale, discomfortLevel, symptoms, notes, linkedMealId } =
      await request.json();

    // Try database first
    try {
      const { prisma } = await import("@/lib/prisma");

      // Create symptom log
      const symptomLog = await prisma.symptomLog.create({
        data: {
          tenant_id: session.tenantId,
          patient_id: session.patientId,
          bristol_scale: bristolScale || null,
          discomfort_level: discomfortLevel ?? null,
          symptoms: symptoms || [],
          notes: notes || null,
        },
      });

      // If a meal is linked, create correlation
      if (linkedMealId) {
        // Calculate correlation score based on time proximity
        const meal = await prisma.meal.findUnique({
          where: { id: linkedMealId },
        });

        if (meal) {
          const hoursSinceMeal =
            (Date.now() - new Date(meal.date).getTime()) / (1000 * 60 * 60);

          // Higher score for meals within 2-6 hours (typical digestion window)
          let correlationScore = 0.5;
          if (hoursSinceMeal >= 2 && hoursSinceMeal <= 6) {
            correlationScore = 0.8;
          } else if (hoursSinceMeal < 2) {
            correlationScore = 0.6;
          } else if (hoursSinceMeal <= 12) {
            correlationScore = 0.4;
          } else {
            correlationScore = 0.2;
          }

          await prisma.symptomMealCorrelation.create({
            data: {
              tenant_id: session.tenantId,
              symptom_log_id: symptomLog.id,
              meal_id: linkedMealId,
              correlation_score: correlationScore,
              is_flagged: discomfortLevel >= 7,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        symptomLogId: symptomLog.id,
        isSOS: discomfortLevel >= 8,
      });
    } catch (dbError) {
      console.log("Banco de dados não disponível, simulando registro de sintomas");
    }

    // Mock response for demo mode
    return NextResponse.json({
      success: true,
      symptomLogId: `demo-symptom-${Date.now()}`,
      isSOS: discomfortLevel >= 8,
      message: "Sintoma registrado (modo demonstração)",
    });
  } catch (error) {
    console.error("Erro ao criar registro de sintomas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

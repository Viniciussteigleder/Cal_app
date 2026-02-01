import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { MOCK_MEALS_TODAY } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PATIENT" || !session.patientId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Try database first
    try {
      const { prisma } = await import("@/lib/prisma");

      let dateFilter = {};
      if (dateStr) {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        dateFilter = {
          date: {
            gte: date,
            lt: nextDay,
          },
        };
      }

      const meals = await prisma.meal.findMany({
        where: {
          patient_id: session.patientId,
          ...dateFilter,
        },
        include: {
          items: {
            include: {
              snapshot: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: limit,
      });

      const formattedMeals = meals.map((meal) => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        const items = meal.items.map((item) => {
          const snapshotData = item.snapshot.snapshot_json as {
            nutrients: {
              energy_kcal: number;
              protein_g: number;
              carbs_g: number;
              fat_g: number;
            };
          };
          const grams = Number(item.grams);
          const multiplier = grams / 100;

          const itemCalories = snapshotData.nutrients.energy_kcal * multiplier;
          const itemProtein = snapshotData.nutrients.protein_g * multiplier;
          const itemCarbs = snapshotData.nutrients.carbs_g * multiplier;
          const itemFat = snapshotData.nutrients.fat_g * multiplier;

          totalCalories += itemCalories;
          totalProtein += itemProtein;
          totalCarbs += itemCarbs;
          totalFat += itemFat;

          return {
            id: item.id,
            foodId: item.food_id,
            grams: grams,
            calories: Math.round(itemCalories),
            protein: Math.round(itemProtein),
            carbs: Math.round(itemCarbs),
            fat: Math.round(itemFat),
          };
        });

        return {
          id: meal.id,
          date: meal.date,
          type: meal.type,
          items,
          totals: {
            calories: Math.round(totalCalories),
            protein: Math.round(totalProtein),
            carbs: Math.round(totalCarbs),
            fat: Math.round(totalFat),
          },
        };
      });

      return NextResponse.json({ meals: formattedMeals });
    } catch (dbError) {
      console.log("Banco de dados não disponível, usando dados de demonstração");
    }

    // Return mock data if database not available
    return NextResponse.json({
      meals: MOCK_MEALS_TODAY.map(meal => ({
        id: meal.id,
        date: new Date(),
        type: meal.type,
        items: meal.items.map(item => ({
          id: `item-${item.foodId}`,
          foodId: item.foodId,
          grams: item.grams,
          calories: item.calories,
          protein: Math.round(item.calories * 0.2 / 4),
          carbs: Math.round(item.calories * 0.5 / 4),
          fat: Math.round(item.calories * 0.3 / 9),
        })),
        totals: {
          calories: meal.totalCalories,
          protein: Math.round(meal.totalCalories * 0.2 / 4),
          carbs: Math.round(meal.totalCalories * 0.5 / 4),
          fat: Math.round(meal.totalCalories * 0.3 / 9),
        },
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar refeições:", error);
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

    const { type, items, date } = await request.json();

    if (!type || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Tipo e itens são obrigatórios" },
        { status: 400 }
      );
    }

    // Try database first
    try {
      const { prisma } = await import("@/lib/prisma");

      // Get the dataset release for this tenant
      const datasetRelease = await prisma.datasetRelease.findFirst({
        where: {
          tenant_id: session.tenantId,
          status: "published",
        },
        orderBy: { published_at: "desc" },
      });

      if (!datasetRelease) {
        return NextResponse.json(
          { error: "Nenhum dataset publicado encontrado" },
          { status: 400 }
        );
      }

      // Create the meal
      const meal = await prisma.meal.create({
        data: {
          tenant_id: session.tenantId,
          patient_id: session.patientId,
          date: date ? new Date(date) : new Date(),
          type: type,
        },
      });

      // Create meal items with snapshots
      for (const item of items) {
        // Get food and nutrients
        const food = await prisma.foodCanonical.findUnique({
          where: { id: item.foodId },
          include: {
            nutrients: {
              where: { dataset_release_id: datasetRelease.id },
            },
          },
        });

        if (!food) continue;

        // Build nutrient snapshot
        const nutrients: Record<string, number> = {};
        for (const n of food.nutrients) {
          nutrients[n.nutrient_key] = Number(n.per_100g_value);
        }

        // Create snapshot
        const snapshot = await prisma.foodSnapshot.create({
          data: {
            tenant_id: session.tenantId,
            patient_id: session.patientId,
            food_id: food.id,
            snapshot_json: {
              name: food.name,
              nutrients,
              source: datasetRelease.source_name,
              per_100g: true,
            },
            source: datasetRelease.source_name,
            dataset_release_id: datasetRelease.id,
          },
        });

        // Create meal item
        await prisma.mealItem.create({
          data: {
            tenant_id: session.tenantId,
            meal_id: meal.id,
            food_id: food.id,
            grams: item.grams,
            snapshot_id: snapshot.id,
          },
        });
      }

      return NextResponse.json({
        success: true,
        mealId: meal.id,
      });
    } catch (dbError) {
      console.log("Banco de dados não disponível, simulando criação de refeição");
    }

    // Mock response for demo mode
    return NextResponse.json({
      success: true,
      mealId: `demo-meal-${Date.now()}`,
      message: "Refeição registrada (modo demonstração)",
    });
  } catch (error) {
    console.error("Erro ao criar refeição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

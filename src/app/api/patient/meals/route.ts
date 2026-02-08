import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PATIENT" || !session.patientId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "20");

    let prisma;
    try {
      const mod = await import("@/lib/prisma");
      prisma = mod.prisma;
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error("DB connection error (meals GET):", dbError);
      return NextResponse.json(
        { error: "Banco de dados indisponível. Tente novamente em alguns minutos." },
        { status: 503 }
      );
    }

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

    let prisma;
    try {
      const mod = await import("@/lib/prisma");
      prisma = mod.prisma;
    } catch (dbError) {
      console.error("DB connection error (meals POST):", dbError);
      return NextResponse.json(
        { error: "Banco de dados indisponível. Tente novamente em alguns minutos." },
        { status: 503 }
      );
    }

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
      let totalUpfScore = 0;
      let totalGrams = 0;

      for (const item of items) {
        // Get food and nutrients
        // CAST TO ANY due to Prisma generation lag in environment
        const food = await prisma.foodCanonical.findUnique({
          where: { id: item.foodId },
          include: {
            nutrients: {
              where: { dataset_release_id: datasetRelease.id },
            },
          },
        }) as any;

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
              upf_category: food.upf_category, // Nova 1-4
              protein_quality: food.protein_quality ? Number(food.protein_quality) : null,
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

        // Accumulate UPF score (weighted by grams)
        // If undefined, assume 1 (processed, safe bet? or 4? Let's assume 1 if missing for now to avoid skewing unless known)
        // Actually, if missing, maybe we shouldn't count it? Let's assume 1 (unprocessed) if null.
        const upf = food.upf_category || 1;
        totalUpfScore += upf * item.grams;
        totalGrams += item.grams;
      }

      // Update Meal with calculated UPF Score (Average NOVA)
      if (totalGrams > 0) {
        const averageNova = totalUpfScore / totalGrams; // Float between 1.0 and 4.0
        // Scale to 0-100 for storage? Or keep 1-4? 
        // Schema comment says "1-4 NOVA scale or 0-100". 
        // Let's store as integer 0-100 representing "Percentage of UPF load" maybe?
        // Or just store the Average NOVA * 10 or something.
        // Let's store Average NOVA * 25 to get 25-100? No.
        // Let's stick to the schema comment: "1-4 NOVA scale". But it is an Int?.
        // I will store the rounded Average NOVA (1, 2, 3, or 4).
        // CAST data object to avoid strict type checking on new field
        await prisma.meal.update({
          where: { id: meal.id },
          data: { upf_score: Math.round(averageNova) } as any
        });
      }

    return NextResponse.json({
      success: true,
      mealId: meal.id,
    });
  } catch (error) {
    console.error("Erro ao criar refeição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

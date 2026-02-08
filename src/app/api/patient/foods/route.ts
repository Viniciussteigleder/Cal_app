import { NextResponse } from "next/server";

import { getScopedPatient, requireClaims, withSession } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const claims = await requireClaims();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const patientId = searchParams.get("patientId");
    const limit = Number(searchParams.get("limit") ?? 10);
    const data = await withSession(claims, async (tx) => {
      const patient = await getScopedPatient(tx, claims, patientId);

      const foods = query
        ? await tx.foodCanonical.findMany({
            where: {
              tenant_id: claims.tenant_id,
              name: { contains: query, mode: "insensitive" },
            },
            take: limit,
          })
        : [];

      // Get food aliases
      const aliases = query
        ? await tx.foodAlias.findMany({
            where: {
              tenant_id: claims.tenant_id,
              alias: { contains: query, mode: "insensitive" },
            },
            take: limit,
          })
        : [];

      // Get canonical foods for aliases
      const aliasedFoodIds = aliases.map((a) => a.food_id);
      const aliasedFoods = await tx.foodCanonical.findMany({
        where: { id: { in: aliasedFoodIds } },
      });
      const aliasedFoodMap = new Map(aliasedFoods.map(f => [f.id, f]));

      // Get recent items - query manually without includes
      const recentMeals = await tx.meal.findMany({
        where: { patient_id: patient.id, tenant_id: claims.tenant_id },
        orderBy: { date: "desc" },
        take: 10,
      });

      const recentMealIds = recentMeals.map(m => m.id);
      const recentItems = await tx.mealItem.findMany({
        where: { meal_id: { in: recentMealIds }, tenant_id: claims.tenant_id },
        orderBy: { created_at: "desc" },
        take: 5,
      });

      // Get snapshots for recent items
      const snapshotIds = recentItems.map(item => item.snapshot_id);
      const snapshots = await tx.foodSnapshot.findMany({
        where: { id: { in: snapshotIds } },
      });
      const snapshotMap = new Map(snapshots.map(s => [s.id, s]));

      // Get foods for snapshots
      const foodIds = snapshots.map(s => s.food_id);
      const recentFoods = await tx.foodCanonical.findMany({
        where: { id: { in: foodIds } },
      });
      const foodMap = new Map(recentFoods.map(f => [f.id, f]));

      const recent = recentItems.map((item) => {
        const snapshot = snapshotMap.get(item.snapshot_id);
        const food = snapshot ? foodMap.get(snapshot.food_id) : null;
        return food ? {
          id: food.id,
          name: food.name,
        } : null;
      }).filter((item): item is { id: string; name: string } => item !== null);

      // Get favorites
      const favorites = await tx.mealItem.groupBy({
        by: ["food_id"],
        where: { tenant_id: claims.tenant_id, meal: { patient_id: patient.id } },
        _count: { food_id: true },
        orderBy: { _count: { food_id: "desc" } },
        take: 5,
      });

      const favoriteFoods = await tx.foodCanonical.findMany({
        where: { id: { in: favorites.map((fav) => fav.food_id) } },
      });

      const favoriteLookup = new Map(favoriteFoods.map((food) => [food.id, food.name]));

      const combined = [
        ...foods.map((food) => ({ id: food.id, name: food.name })),
        ...aliases.map((alias) => {
          const food = aliasedFoodMap.get(alias.food_id);
          return food ? {
            id: food.id,
            name: food.name,
            alias: alias.alias,
          } : null;
        }).filter((item): item is { id: string; name: string; alias: string } => item !== null),
      ];
      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());

      return {
        results: unique,
        recent,
        favorites: favorites.map((fav) => ({
          id: fav.food_id,
          name: favoriteLookup.get(fav.food_id) ?? "Alimento",
        })),
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/patient/foods:", error);
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

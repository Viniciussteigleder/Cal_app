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

      const aliases = query
        ? await tx.foodAlias.findMany({
            where: {
              tenant_id: claims.tenant_id,
              alias: { contains: query, mode: "insensitive" },
            },
            include: { food: true },
            take: limit,
          })
        : [];

      const recentItems = await tx.mealItem.findMany({
        where: { tenant_id: claims.tenant_id, meal: { patient_id: patient.id } },
        include: { snapshot: { include: { food: true } } },
        orderBy: { created_at: "desc" },
        take: 5,
      });

      const recent = recentItems.map((item) => ({
        id: item.snapshot.food.id,
        name: item.snapshot.food.name,
      }));

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
        ...aliases.map((alias) => ({
          id: alias.food.id,
          name: alias.food.name,
          alias: alias.alias,
        })),
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
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

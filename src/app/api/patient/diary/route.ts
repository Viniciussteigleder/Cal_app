import { NextResponse } from "next/server";

import { createFoodSnapshot } from "@/lib/snapshots";
import { scaleNutrients, sumNutrients } from "@/lib/nutrition";
import { ApiError, getDayRange, getScopedPatient, isSameDay, parseDateInput, requireClaims, withSession } from "@/lib/api-helpers";
import { can } from "@/lib/rbac";

function serializeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const claims = await requireClaims();
    const { searchParams } = new URL(request.url);
    const date = parseDateInput(searchParams.get("date"));
    const patientId = searchParams.get("patientId");
    const { payload, editable } = await withSession(claims, async (tx) => {
      const patient = await getScopedPatient(tx, claims, patientId);
      const { start, end } = getDayRange(date);

      const meals = await tx.meal.findMany({
        where: {
          patient_id: patient.id,
          tenant_id: claims.tenant_id,
          date: { gte: start, lte: end },
        },
        include: {
          items: {
            include: { snapshot: { include: { food: true } } },
            orderBy: { created_at: "asc" },
          },
        },
        orderBy: { date: "asc" },
      });

      const mealPayload = meals.map((meal) => {
        const items = meal.items.map((item) => {
          const per100g = (item.snapshot.snapshot_json as { nutrients?: Record<string, number> })
            .nutrients ?? {};
          const nutrients = scaleNutrients(per100g, Number(item.grams));
          return {
            id: item.id,
            food: { id: item.snapshot.food.id, name: item.snapshot.food.name },
            grams: Number(item.grams),
            nutrients,
          };
        });
        const totals = sumNutrients(...items.map((item) => item.nutrients));
        return {
          id: meal.id,
          type: meal.type,
          date: meal.date.toISOString(),
          items,
          totals,
        };
      });

      const dayTotals = sumNutrients(...mealPayload.map((meal) => meal.totals));
      return { payload: { meals: mealPayload, totals: dayTotals }, editable: serializeDate(date) === serializeDate(new Date()) };
    });

    return NextResponse.json({
      date: serializeDate(date),
      editable,
      meals: payload.meals,
      totals: payload.totals,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const claims = await requireClaims();
    const body = await request.json();
    const {
      date,
      mealType,
      foodId,
      grams,
      patientId,
    } = body as {
      date: string;
      mealType: "breakfast" | "lunch" | "dinner" | "snack";
      foodId: string;
      grams: number;
      patientId?: string;
    };

    const result = await withSession(claims, async (tx) => {
      if (claims.role !== "PATIENT" && !can(claims.role, "update", "patient")) {
        throw new ApiError("Acesso negado.", 403);
      }
      const targetDate = parseDateInput(date);
      if (claims.role === "PATIENT" && !isSameDay(targetDate, new Date())) {
        throw new ApiError("Este registro é somente leitura após o dia encerrar.", 403);
      }
      if (!Number.isFinite(grams) || grams <= 0) {
        throw new ApiError("Quantidade inválida.", 400);
      }
      const patient = await getScopedPatient(tx, claims, patientId);
      const { start, end } = getDayRange(targetDate);

      const food = await tx.foodCanonical.findFirst({
        where: { id: foodId, tenant_id: claims.tenant_id },
      });
      if (!food) {
        throw new ApiError("Alimento não encontrado.", 404);
      }

      const snapshot = await createFoodSnapshot({
        claims,
        patientId: patient.id,
        foodId: food.id,
        categoryCode: food.group,
      });

      const meal =
        (await tx.meal.findFirst({
          where: {
            patient_id: patient.id,
            tenant_id: claims.tenant_id,
            type: mealType,
            date: { gte: start, lte: end },
          },
        })) ??
        (await tx.meal.create({
          data: {
            tenant_id: claims.tenant_id,
            patient_id: patient.id,
            date: targetDate,
            type: mealType,
          },
        }));

      const mealItem = await tx.mealItem.create({
        data: {
          tenant_id: claims.tenant_id,
          meal_id: meal.id,
          food_id: food.id,
          grams,
          snapshot_id: snapshot.id,
        },
        include: { snapshot: true },
      });

      const nutrients =
        (mealItem.snapshot.snapshot_json as { nutrients?: Record<string, number> }).nutrients ??
        {};
      const itemTotals = scaleNutrients(nutrients, Number(mealItem.grams));

      return {
        id: mealItem.id,
        mealId: meal.id,
        food: { id: food.id, name: food.name },
        grams: Number(mealItem.grams),
        nutrients: itemTotals,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

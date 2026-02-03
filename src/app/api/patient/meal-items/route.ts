import { NextResponse } from "next/server";

import { ApiError, getDayRange, isSameDay, parseDateInput, getScopedPatient, requireClaims, withSession } from "@/lib/api-helpers";
import { can } from "@/lib/rbac";
import { createFoodSnapshot } from "@/lib/snapshots";
import { scaleNutrients } from "@/lib/nutrition";

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

      const { start, end } = getDayRange(targetDate);
      const meal = await tx.meal.findFirst({
        where: {
          patient_id: patient.id,
          tenant_id: claims.tenant_id,
          type: mealType,
          date: { gte: start, lte: end },
        },
      });

      const mealRecord =
        meal ??
        (await tx.meal.create({
          data: {
            tenant_id: claims.tenant_id,
            patient_id: patient.id,
            date: targetDate,
            type: mealType,
          },
        }));

      const item = await tx.mealItem.create({
        data: {
          tenant_id: claims.tenant_id,
          meal_id: mealRecord.id,
          food_id: food.id,
          grams,
          snapshot_id: snapshot.id,
        },
        include: { snapshot: true },
      });

      const nutrients =
        (item.snapshot.snapshot_json as { nutrients?: Record<string, number> }).nutrients ?? {};

      return {
        id: item.id,
        mealId: mealRecord.id,
        food: { id: food.id, name: food.name },
        grams: Number(item.grams),
        nutrients: scaleNutrients(nutrients, Number(item.grams)),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

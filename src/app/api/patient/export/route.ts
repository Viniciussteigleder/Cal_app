import { NextResponse } from "next/server";

import { getDayRange, getScopedPatient, parseDateInput, requireClaims, withSession } from "@/lib/api-helpers";
import { can } from "@/lib/rbac";
import { scaleNutrients } from "@/lib/nutrition";

function csvEscape(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

export async function GET(request: Request) {
  try {
    const claims = await requireClaims();
    if (!can(claims.role, "export", "patient")) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const startDate = parseDateInput(searchParams.get("start"));
    const endDate = parseDateInput(searchParams.get("end"));
    if (startDate > endDate) {
      return NextResponse.json({ error: "Período inválido." }, { status: 400 });
    }
    const patientId = searchParams.get("patientId");
    const data = await withSession(claims, async (tx) => {
      const patient = await getScopedPatient(tx, claims, patientId);
      const { start } = getDayRange(startDate);
      const { end } = getDayRange(endDate);

      const meals = await tx.meal.findMany({
        where: {
          tenant_id: claims.tenant_id,
          patient_id: patient.id,
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

      return meals;
    });

    const rows: string[] = [];
    rows.push(
      [
        "data",
        "refeicao",
        "alimento",
        "gramas",
        "kcal",
        "proteina_g",
        "carbo_g",
        "gordura_g",
      ].join(",")
    );

    data.forEach((meal) => {
      meal.items.forEach((item) => {
        const nutrients =
          (item.snapshot.snapshot_json as { nutrients?: Record<string, number> }).nutrients ?? {};
        const totals = scaleNutrients(nutrients, Number(item.grams));
        rows.push(
          [
            meal.date.toISOString().slice(0, 10),
            meal.type,
            csvEscape(item.snapshot.food.name),
            Number(item.grams).toFixed(0),
            (totals.energy_kcal ?? 0).toFixed(0),
            (totals.protein_g ?? 0).toFixed(1),
            (totals.carbs_g ?? 0).toFixed(1),
            (totals.fat_g ?? 0).toFixed(1),
          ].join(",")
        );
      });
    });

    const csv = rows.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=diario_nutriplan.csv",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

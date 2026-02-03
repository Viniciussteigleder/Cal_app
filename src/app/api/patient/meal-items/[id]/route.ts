import { NextResponse } from "next/server";

import { ApiError, getScopedPatient, isSameDay, requireClaims, withSession } from "@/lib/api-helpers";
import { can } from "@/lib/rbac";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const claims = await requireClaims();
    const { id } = await params;
    await withSession(claims, async (tx) => {
      if (claims.role !== "PATIENT" && !can(claims.role, "update", "patient")) {
        throw new ApiError("Acesso negado.", 403);
      }
      const item = await tx.mealItem.findFirst({
        where: { id, tenant_id: claims.tenant_id },
        include: { meal: true },
      });

      if (!item) {
        throw new ApiError("Item não encontrado.", 404);
      }

      if (claims.role === "PATIENT") {
        const patient = await getScopedPatient(tx, claims);
        if (item.meal.patient_id !== patient.id) {
          throw new ApiError("Acesso negado.", 403);
        }
        if (!isSameDay(item.meal.date, new Date())) {
          throw new ApiError("Este registro é somente leitura após o dia encerrar.", 403);
        }
      }

      await tx.mealItem.delete({ where: { id: item.id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

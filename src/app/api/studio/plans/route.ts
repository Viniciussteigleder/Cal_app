import { NextResponse } from "next/server";

import { requireClaims, withSession } from "@/lib/api-helpers";
import { can } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const claims = await requireClaims();
    if (!can(claims.role, "read", "plan")) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    if (!patientId) {
      return NextResponse.json({ error: "Paciente obrigatório." }, { status: 400 });
    }

    const plan = await withSession(claims, async (tx) => {
      return tx.plan.findFirst({
        where: { patient_id: patientId, tenant_id: claims.tenant_id },
        include: {
          versions: {
            orderBy: { version_no: "desc" },
            take: 1,
            include: { publication: true },
          },
        },
      });
    });

    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      id: plan.id,
      status: plan.status,
      latestVersion: plan.versions[0],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

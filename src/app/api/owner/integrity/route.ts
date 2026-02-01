import { NextResponse } from "next/server";

import { requireClaims, requireOwner, withSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const claims = await requireClaims();
    requireOwner(claims);

    const runs = await withSession(
      claims,
      async (tx) => {
        return tx.integrityCheckRun.findMany({
          where: { tenant_id: claims.tenant_id },
          orderBy: { started_at: "desc" },
          take: 5,
          include: { issues: true },
        });
      },
      { ownerMode: true }
    );

    return NextResponse.json({ runs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

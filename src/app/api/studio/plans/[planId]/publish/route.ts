import { NextRequest, NextResponse } from "next/server";

import { requireClaims, withSession } from "@/lib/api-helpers";
import { can } from "@/lib/rbac";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const claims = await requireClaims();
    if (!can(claims.role, "publish", "plan")) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const plan = await withSession(claims, async (tx) => {
      return tx.plan.findFirst({
        where: { id: planId, tenant_id: claims.tenant_id },
        include: { versions: { orderBy: { version_no: "desc" }, take: 1 } },
      });
    });

    if (!plan || plan.versions.length === 0) {
      return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
    }

    const version = plan.versions[0];
    if (version.status === "published") {
      return NextResponse.json({ error: "Versão já publicada." }, { status: 400 });
    }

    const publishedAt = new Date();

    const updated = await withSession(claims, async (tx) => {
      return tx.planVersion.update({
        where: { id: version.id },
        data: {
          status: "published",
          approval: {
            create: {
              tenant_id: claims.tenant_id,
              approved_by: claims.user_id,
              approved_at: publishedAt,
            },
          },
          publication: {
            create: {
              tenant_id: claims.tenant_id,
              published_by: claims.user_id,
              published_at: publishedAt,
            },
          },
        },
      });
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

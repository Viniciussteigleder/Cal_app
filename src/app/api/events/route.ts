import { NextResponse } from "next/server";

import { requireClaims, withSession } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const claims = await requireClaims();
    const body = await request.json();
    const { name, properties } = body as { name: string; properties?: Record<string, unknown> };

    if (!name) {
      return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
    }

    await withSession(claims, async (tx) => {
      await tx.auditEvent.create({
        data: {
          tenant_id: claims.tenant_id,
          actor_user_id: claims.user_id,
          actor_role: claims.role,
          action: "CREATE",
          entity_type: "analytics_event",
          entity_id: crypto.randomUUID(),
          after_json: { name, properties },
          request_id: crypto.randomUUID(),
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

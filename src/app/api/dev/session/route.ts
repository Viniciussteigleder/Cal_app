import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Indisponível." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const role = (searchParams.get("role") ?? process.env.DEV_ROLE ?? "PATIENT").toUpperCase();
  const userId = process.env.DEV_USER_ID;
  const tenantId = process.env.DEV_TENANT_ID;

  if (!userId || !tenantId) {
    return NextResponse.json(
      { error: "Configure DEV_USER_ID e DEV_TENANT_ID para autologin." },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true, role });
  response.cookies.set("np_user_id", userId);
  response.cookies.set("np_tenant_id", tenantId);
  response.cookies.set("np_role", role);
  return response;
}

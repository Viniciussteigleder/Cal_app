import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { createSessionCookieValue, type SessionPayload } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SESSION_SECRET) {
      return NextResponse.json(
        {
          error:
            "Configuração do servidor incompleta. Defina SESSION_SECRET no Vercel e faça um novo deploy.",
        },
        { status: 503 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const { prisma } = await import("@/lib/prisma");

    let user:
      | (Awaited<ReturnType<typeof prisma.user.findUnique>> & {
          patient?: { id: string } | null;
        })
      | null = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { patient: true },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      const detail = dbError instanceof Error ? dbError.message : "";
      const isPaused = detail.includes("P1001") || detail.includes("Can't reach");
      return NextResponse.json(
        {
          error: isPaused
            ? "Banco de dados não alcançável. O projeto Supabase pode estar pausado — acesse supabase.com/dashboard para reativar."
            : "Banco de dados indisponível. Verifique DATABASE_URL no Vercel (use URL do pooler Supabase, porta 6543). Acesse /api/health para diagnóstico.",
        },
        { status: 503 }
      );
    }

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    const isValid = await compare(cleanPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    const sessionData: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenant_id,
      patientId: user.patient?.id || null,
    };

    const cookieStore = await cookies();
    cookieStore.set("np_session", createSessionCookieValue(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    let redirect = "/patient/dashboard";
    if (user.role === "OWNER") {
      redirect = "/owner/tenants";
    } else if (user.role === "TENANT_ADMIN" || user.role === "TEAM") {
      redirect = "/studio/dashboard";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirect,
    });
  } catch (error) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json(
      { error: `Erro no login: ${message}` },
      { status: 500 }
    );
  }
}


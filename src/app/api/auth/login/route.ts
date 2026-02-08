import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { createSessionCookieValue, type SessionPayload } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { patient: true },
    });

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
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

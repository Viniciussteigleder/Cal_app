import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { createSessionCookieValue, type SessionPayload } from "@/lib/session";

// Allowed admin emails - keeping this as an extra layer of security if desired, 
// but primarily we should rely on User Role in DB.
const ALLOWED_ADMINS = ["vinicius.steigleder@gmail.com"];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // 1. Optional: Check allowlist
    if (!ALLOWED_ADMINS.includes(normalizedEmail)) {
      console.log(`Unauthorized admin login attempt (email not in allowlist): ${normalizedEmail}`);
      // We can return 403 or just 401 to hide existence
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    // 2. Verify against Database
    try {
      const { prisma } = await import("@/lib/prisma");

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 401 }
        );
      }

      // Check Password
      let isValid = false;
      if (user.password_hash) {
        isValid = await compare(password, user.password_hash);
      }

      if (!isValid) {
        return NextResponse.json(
          { error: "Senha incorreta" },
          { status: 401 }
        );
      }

      // Check Role
      if (user.role !== "OWNER") {
        return NextResponse.json(
          { error: "Acesso não autorizado: permissões insuficientes" },
          { status: 403 }
        );
      }

      // Create Session
      const sessionData: SessionPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: "OWNER",
        tenantId: user.tenant_id,
        patientId: null,
        isAdmin: true,
      };

      const cookieStore = await cookies();
      cookieStore.set("np_session", createSessionCookieValue(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "OWNER",
        },
        redirect: "/owner/tenants",
      });

    } catch (dbError) {
      console.error("Database error during admin login:", dbError);
      return NextResponse.json(
        { error: "Erro no servidor de autenticação" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

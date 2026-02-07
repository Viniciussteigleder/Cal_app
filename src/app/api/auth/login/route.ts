import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { MOCK_USERS } from "@/lib/mock-data";
import { createSessionCookieValue, type SessionPayload } from "@/lib/session";

// Demo password from environment variable - ONLY for mock users or dev environment specific fallback if needed
function getDemoPassword(): string | null {
  return process.env.DEMO_PASSWORD || null;
}

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

    console.log(`Login attempt for: ${normalizedEmail}`);

    // 1. Try database lookup first (Real Auth)
    try {
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { patient: true },
      });

      if (user) {
        let isValid = false;

        if (user.password_hash) {
          isValid = await compare(cleanPassword, user.password_hash);
        }

        if (isValid) {
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
        }

        return NextResponse.json(
          { error: "Email ou senha incorretos" },
          { status: 401 }
        );
      }
    } catch (dbError) {
      console.log("Database authentication failed or unavailable:", dbError);
    }

    // 2. Check Mock Users (Fallback only when explicitly enabled)
    const isDemoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

    if (isDemoEnabled) {
      const demoPassword = getDemoPassword();
      if (!demoPassword) {
        return NextResponse.json(
          { error: "Demo login is disabled" },
          { status: 403 }
        );
      }
      const mockUser = MOCK_USERS[normalizedEmail as keyof typeof MOCK_USERS];

      if (mockUser && cleanPassword === demoPassword) {
        // Set session cookie with mock user data
        const userRole = mockUser.role as string;
        const sessionData: SessionPayload = {
          userId: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: userRole,
          tenantId: mockUser.tenantId,
          patientId: mockUser.patientId,
        };

        const cookieStore = await cookies();
        cookieStore.set("np_session", createSessionCookieValue(sessionData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        });

        // Determine redirect path
        let redirect = "/patient/dashboard";
        if (userRole === "OWNER") {
          redirect = "/owner/tenants";
        } else if (userRole === "TENANT_ADMIN" || userRole === "TEAM") {
          redirect = "/studio/dashboard";
        }

        return NextResponse.json({
          success: true,
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
          },
          redirect,
        });
      }
    }

    return NextResponse.json(
      { error: "Email ou senha incorretos" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

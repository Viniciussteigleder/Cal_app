import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MOCK_USERS } from "@/lib/mock-data";

// Demo password from environment variable (defaults to demo123 for testing)
function getDemoPassword(): string {
  return process.env.DEMO_PASSWORD || "demo123";
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

    const normalizedEmail = email.toLowerCase();
    const demoPassword = getDemoPassword();

    // Check if it's a demo user from mock data
    const mockUser = MOCK_USERS[normalizedEmail as keyof typeof MOCK_USERS];

    if (mockUser && password === demoPassword) {
      // Set session cookie with mock user data
      const userRole = mockUser.role as string;
      const sessionData = {
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: userRole,
        tenantId: mockUser.tenantId,
        patientId: mockUser.patientId,
      };

      const cookieStore = await cookies();
      cookieStore.set("np_session", JSON.stringify(sessionData), {
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

    // Try database lookup if available
    try {
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { patient: true },
      });

      if (user && password === demoPassword) {
        const sessionData = {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenant_id,
          patientId: user.patient?.id || null,
        };

        const cookieStore = await cookies();
        cookieStore.set("np_session", JSON.stringify(sessionData), {
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
    } catch (dbError) {
      console.log("Database not available, using mock data only");
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

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Allowed admin emails - hardcoded for security
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

    // Check if email is in allowed admins list
    if (!ALLOWED_ADMINS.includes(normalizedEmail)) {
      console.log(`Unauthorized admin login attempt: ${normalizedEmail}`);
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    // For production, you'd verify against a real auth system
    // For now, accept the demo password or a specific admin password
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.DEMO_PASSWORD || "admin123";

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    // Try to find existing admin user in database
    try {
      const { prisma } = await import("@/lib/prisma");

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user) {
        // Set session cookie with existing user
        const sessionData = {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: "OWNER",
          tenantId: user.tenant_id,
          patientId: null,
          isAdmin: true,
        };

        const cookieStore = await cookies();
        cookieStore.set("np_session", JSON.stringify(sessionData), {
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
      }
    } catch (dbError) {
      console.log("Database not available for admin lookup");
    }

    // Use mock admin session if database unavailable or user not found
    console.log("Using mock admin session for:", normalizedEmail);

    const sessionData = {
      userId: "admin-001",
      email: normalizedEmail,
      name: "Admin",
      role: "OWNER",
      tenantId: "admin-tenant",
      patientId: null,
      isAdmin: true,
    };

    const cookieStore = await cookies();
    cookieStore.set("np_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: "admin-001",
        email: normalizedEmail,
        name: "Admin",
        role: "OWNER",
      },
      redirect: "/owner/tenants",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, goal, birthYear, weight, height } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Try to check if user exists in database
    try {
      const { prisma } = await import("@/lib/prisma");

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Este email já está cadastrado" },
          { status: 409 }
        );
      }
    } catch {
      // Database not available, continue with mock signup
      console.log("Database check skipped, proceeding with signup");
    }

    // Create session for new user (using mock data for now)
    // In production, this would create real database records
    const mockUserId = `user-${Date.now()}`;
    const mockPatientId = `patient-${Date.now()}`;

    const sessionData = {
      userId: mockUserId,
      email: email.toLowerCase(),
      name,
      role: "PATIENT",
      tenantId: "demo-tenant-001",
      patientId: mockPatientId,
      // Store onboarding data in session for later use
      onboarding: {
        goal: goal || "maintain",
        birthYear,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseInt(height) : null,
      },
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
        id: mockUserId,
        email: email.toLowerCase(),
        name,
        role: "PATIENT",
      },
      redirect: "/patient/dashboard",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}

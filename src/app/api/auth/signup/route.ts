import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, goal, birthYear, weight, height, gender } = body;

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

    // Import prisma dynamically or use global
    const { prisma } = await import("@/lib/prisma");

    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user within a transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create a new Tenant for this user (B2C)
      const tenant = await tx.tenant.create({
        data: {
          name: `${name} workspace`, // Better default name
          type: "B2C",
          status: "active", // Verify enum value in schema (active is correct)
        },
      });

      // 2. Create User linked to Tenant
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name,
          password_hash: hashedPassword,
          role: "PATIENT",
          tenant_id: tenant.id,
          status: "active",
        },
      });

      // 3. Create Patient record
      const patient = await tx.patient.create({
        data: {
          tenant_id: tenant.id,
          user_id: user.id,
          status: "active",
        },
      });

      // 4. Create Patient Profile
      await tx.patientProfile.create({
        data: {
          tenant_id: tenant.id,
          patient_id: patient.id,
          sex: gender === "female" ? "female" : "male", // specific mapping
          birth_date: new Date(Number(birthYear) || 1990, 0, 1),
          height_cm: Number(height) || 170,
          current_weight_kg: Number(weight) || 70,
          activity_level: "moderate", // Default
          goal: goal || "maintain",
        },
      });

      return { user, tenant, patient };
    });

    // Create session
    const sessionData = {
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      tenantId: result.tenant.id,
      patientId: result.patient.id,
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
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
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

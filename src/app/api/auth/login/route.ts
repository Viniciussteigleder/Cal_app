import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Demo users configuration - passwords from environment variables
const DEMO_USERS: Record<string, { role: string }> = {
  "patient@demo.nutriplan.com": { role: "PATIENT" },
  "nutri@demo.nutriplan.com": { role: "TENANT_ADMIN" },
  "owner@demo.nutriplan.com": { role: "OWNER" },
};

// Get demo password from environment (defaults to empty string if not set)
function getDemoPassword(): string {
  return process.env.DEMO_PASSWORD || "";
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

    // Check demo users first
    const demoUser = DEMO_USERS[normalizedEmail];
    const demoPassword = getDemoPassword();

    if (demoUser && demoPassword && password === demoPassword) {
      // Find or create demo user in database
      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { patient: true },
      });

      if (!user) {
        // Get or create a tenant for demo users
        let tenant = await prisma.tenant.findFirst({
          where: { name: "Demo Clinic" },
        });

        if (!tenant) {
          tenant = await prisma.tenant.create({
            data: {
              name: "Demo Clinic",
              type: "B2C",
              status: "active",
            },
          });
        }

        // Create the demo user
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: getDemoUserName(email),
            role: demoUser.role as "OWNER" | "TENANT_ADMIN" | "TEAM" | "PATIENT",
            tenant_id: tenant.id,
            status: "active",
          },
          include: { patient: true },
        });

        // If patient, create patient record
        if (demoUser.role === "PATIENT") {
          await prisma.patient.create({
            data: {
              tenant_id: tenant.id,
              user_id: user.id,
              status: "active",
              profile: {
                create: {
                  tenant_id: tenant.id,
                  sex: "female",
                  birth_date: new Date("1990-05-15"),
                  height_cm: 165,
                  current_weight_kg: 68,
                  target_weight_kg: 63,
                  activity_level: "moderate",
                  goal: "loss",
                },
              },
            },
          });
        }
      }

      // Set session cookie
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
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      // Determine redirect path
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

    // Check database for existing users
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { patient: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // For database users, verify password
    // In production, implement proper password hashing with bcrypt
    // For now, check against DEMO_PASSWORD for seeded users
    if (demoPassword && password !== demoPassword) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

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
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

function getDemoUserName(email: string): string {
  if (email.includes("patient")) return "Maria Demo";
  if (email.includes("nutri")) return "Dr. Carlos Demo";
  if (email.includes("owner")) return "Admin Demo";
  return "Demo User";
}

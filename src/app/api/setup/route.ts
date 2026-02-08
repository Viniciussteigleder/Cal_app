import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

const DEFAULT_PASSWORD = "Nutri@2026";

const SEED_USERS = [
  { email: "owner@nutriplan.com", name: "Owner Admin", role: "OWNER" as const },
  { email: "nutri@nutriplan.com", name: "Dr. Carlos Nutricionista", role: "TENANT_ADMIN" as const },
  { email: "equipe@nutriplan.com", name: "Ana Assistente", role: "TEAM" as const },
  { email: "nutri-b@nutriplan.com", name: "Dra. Fernanda Lima", role: "TENANT_ADMIN" as const },
];

const SEED_PATIENTS = [
  { email: "maria@nutriplan.com", name: "Maria Silva", clinic: "A" },
  { email: "joao@nutriplan.com", name: "João Pereira", clinic: "A" },
  { email: "ana@nutriplan.com", name: "Ana Souza", clinic: "A" },
  { email: "lena@nutriplan.com", name: "Lena Fischer", clinic: "B" },
  { email: "paul@nutriplan.com", name: "Paul Schmidt", clinic: "B" },
];

export async function POST(request: NextRequest) {
  try {
    // Protect with a setup key from env or query param
    const { searchParams } = new URL(request.url);
    const setupKey = searchParams.get("key");
    const expectedKey = process.env.SETUP_KEY || process.env.SESSION_SECRET;

    if (!setupKey || setupKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized. Provide ?key=YOUR_SESSION_SECRET" },
        { status: 401 }
      );
    }

    const { prisma } = await import("@/lib/prisma");

    // Check if already seeded
    const existingOwner = await prisma.user.findUnique({
      where: { email: "owner@nutriplan.com" },
    });

    if (existingOwner) {
      return NextResponse.json({
        message: "Database already seeded. Users exist.",
        users: [
          "owner@nutriplan.com (OWNER)",
          "nutri@nutriplan.com (NUTRITIONIST)",
          "ana@nutriplan.com (PATIENT)",
          "maria@nutriplan.com (PATIENT)",
        ],
        password: DEFAULT_PASSWORD,
      });
    }

    const passwordHash = await hash(DEFAULT_PASSWORD, 10);

    // Create tenants
    const tenantA = await prisma.tenant.create({
      data: { name: "Clínica NutriVida", type: "B2C", status: "active" },
    });
    const tenantB = await prisma.tenant.create({
      data: { name: "Clínica Saúde Digestiva", type: "B2C", status: "active" },
    });

    const tenantMap: Record<string, string> = {
      "owner@nutriplan.com": tenantA.id,
      "nutri@nutriplan.com": tenantA.id,
      "equipe@nutriplan.com": tenantA.id,
      "nutri-b@nutriplan.com": tenantB.id,
    };

    // Create staff users
    for (const u of SEED_USERS) {
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role,
          password_hash: passwordHash,
          tenant_id: tenantMap[u.email],
          status: "active",
        },
      });
    }

    // Create patient users
    for (const p of SEED_PATIENTS) {
      const tenantId = p.clinic === "A" ? tenantA.id : tenantB.id;

      const user = await prisma.user.create({
        data: {
          email: p.email,
          name: p.name,
          role: "PATIENT",
          password_hash: passwordHash,
          tenant_id: tenantId,
          status: "active",
        },
      });

      await prisma.patient.create({
        data: {
          tenant_id: tenantId,
          user_id: user.id,
          status: "active",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      password: DEFAULT_PASSWORD,
      users: [
        { email: "owner@nutriplan.com", role: "OWNER", redirect: "/owner/tenants" },
        { email: "nutri@nutriplan.com", role: "NUTRITIONIST", redirect: "/studio/dashboard" },
        { email: "ana@nutriplan.com", role: "PATIENT", redirect: "/patient/dashboard" },
        { email: "maria@nutriplan.com", role: "PATIENT", redirect: "/patient/dashboard" },
        { email: "joao@nutriplan.com", role: "PATIENT", redirect: "/patient/dashboard" },
      ],
    });
  } catch (error) {
    console.error("Setup error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Setup failed", detail: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

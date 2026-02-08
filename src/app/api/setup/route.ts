import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

export const runtime = "nodejs";

function getSetupKey(): string | null {
  // Prefer a dedicated setup key; fallback to SESSION_SECRET for backwards compatibility.
  return process.env.SETUP_KEY || process.env.SESSION_SECRET || null;
}

async function runSetup() {
  const defaultPassword = process.env.DEFAULT_PASSWORD || "Nutri@2026";
  const passwordHash = await hash(defaultPassword, 10);

  const { prisma } = await import("@/lib/prisma");

  // Stable IDs so repeated calls are idempotent.
  const TENANT_A_ID = "00000000-0000-0000-0000-000000000001";
  const TENANT_B_ID = "00000000-0000-0000-0000-000000000002";
  const OWNER_ID = "00000000-0000-0000-0000-000000000010";
  const NUTRI_ID = "00000000-0000-0000-0000-000000000011";
  const TEAM_ID = "00000000-0000-0000-0000-000000000012";
  const NUTRI_B_ID = "00000000-0000-0000-0000-000000000013";

  const tenantA = await prisma.tenant.upsert({
    where: { id: TENANT_A_ID },
    create: { id: TENANT_A_ID, name: "Clínica NutriVida", type: "B2C", status: "active" },
    update: { name: "Clínica NutriVida", type: "B2C", status: "active" },
  });
  const tenantB = await prisma.tenant.upsert({
    where: { id: TENANT_B_ID },
    create: { id: TENANT_B_ID, name: "Clínica Saúde Digestiva", type: "B2C", status: "active" },
    update: { name: "Clínica Saúde Digestiva", type: "B2C", status: "active" },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@nutriplan.com" },
    create: {
      id: OWNER_ID,
      email: "owner@nutriplan.com",
      name: "Owner Admin",
      role: "OWNER",
      tenant_id: tenantA.id,
      status: "active",
      password_hash: passwordHash,
    },
    update: {
      name: "Owner Admin",
      role: "OWNER",
      tenant_id: tenantA.id,
      status: "active",
      password_hash: passwordHash,
    },
  });

  const nutri = await prisma.user.upsert({
    where: { email: "nutri@nutriplan.com" },
    create: {
      id: NUTRI_ID,
      email: "nutri@nutriplan.com",
      name: "Dr. Carlos Nutricionista",
      role: "TENANT_ADMIN",
      tenant_id: tenantA.id,
      status: "active",
      password_hash: passwordHash,
    },
    update: {
      name: "Dr. Carlos Nutricionista",
      role: "TENANT_ADMIN",
      tenant_id: tenantA.id,
      status: "active",
      password_hash: passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "equipe@nutriplan.com" },
    create: {
      id: TEAM_ID,
      email: "equipe@nutriplan.com",
      name: "Ana Assistente",
      role: "TEAM",
      tenant_id: tenantA.id,
      status: "active",
      password_hash: passwordHash,
    },
    update: {
      name: "Ana Assistente",
      role: "TEAM",
      tenant_id: tenantA.id,
      status: "active",
      password_hash: passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "nutri-b@nutriplan.com" },
    create: {
      id: NUTRI_B_ID,
      email: "nutri-b@nutriplan.com",
      name: "Dra. Fernanda Lima",
      role: "TENANT_ADMIN",
      tenant_id: tenantB.id,
      status: "active",
      password_hash: passwordHash,
    },
    update: {
      name: "Dra. Fernanda Lima",
      role: "TENANT_ADMIN",
      tenant_id: tenantB.id,
      status: "active",
      password_hash: passwordHash,
    },
  });

  const patientSeeds = [
    { email: "maria@nutriplan.com", name: "Maria Silva", tenantId: tenantA.id },
    { email: "joao@nutriplan.com", name: "João Pereira", tenantId: tenantA.id },
    { email: "ana@nutriplan.com", name: "Ana Souza", tenantId: tenantA.id },
    { email: "lena@nutriplan.com", name: "Lena Fischer", tenantId: tenantB.id },
    { email: "paul@nutriplan.com", name: "Paul Schmidt", tenantId: tenantB.id },
  ] as const;

  const seededPatients: Array<{ email: string; patientId: string }> = [];

  for (const p of patientSeeds) {
    const u = await prisma.user.upsert({
      where: { email: p.email },
      create: {
        email: p.email,
        name: p.name,
        role: "PATIENT",
        tenant_id: p.tenantId,
        status: "active",
        password_hash: passwordHash,
      },
      update: {
        name: p.name,
        role: "PATIENT",
        tenant_id: p.tenantId,
        status: "active",
        password_hash: passwordHash,
      },
    });

    const patient = await prisma.patient.upsert({
      where: { user_id: u.id },
      create: {
        tenant_id: p.tenantId,
        user_id: u.id,
        assigned_team_id: p.tenantId === tenantA.id ? nutri.id : null,
        status: "active",
      },
      update: {
        tenant_id: p.tenantId,
        assigned_team_id: p.tenantId === tenantA.id ? nutri.id : null,
        status: "active",
      },
    });

    seededPatients.push({ email: u.email, patientId: patient.id });

    // Ensure at least Ana has a profile so the patient dashboard can show real values.
    if (u.email === "ana@nutriplan.com") {
      await prisma.patientProfile.upsert({
        where: { patient_id: patient.id },
        create: {
          tenant_id: p.tenantId,
          patient_id: patient.id,
          sex: "female",
          birth_date: new Date("1996-06-18"),
          height_cm: 165,
          current_weight_kg: 68,
          target_weight_kg: 63,
          activity_level: "moderate",
          goal: "loss",
        },
        update: {
          tenant_id: p.tenantId,
          sex: "female",
          birth_date: new Date("1996-06-18"),
          height_cm: 165,
          current_weight_kg: 68,
          target_weight_kg: 63,
          activity_level: "moderate",
          goal: "loss",
        },
      });
    }
  }

  return {
    defaultPassword,
    tenants: [tenantA.id, tenantB.id],
    users: {
      owner: owner.email,
      nutri: nutri.email,
      ana: "ana@nutriplan.com",
    },
    seededPatients,
  };
}

async function handleSetup(request: NextRequest) {
  const setupKey = getSetupKey();
  if (!setupKey) {
    return NextResponse.json(
      {
        error:
          "SETUP_KEY (ou SESSION_SECRET) não configurado. Defina a variável no Vercel antes de usar /api/setup.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key || key !== setupKey) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const result = await runSetup();
    return NextResponse.json({
      ok: true,
      message: "Setup completed",
      password: result.defaultPassword,
      users: result.users,
      tenants: result.tenants,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Falha ao configurar banco de dados",
        details: message,
        hint: "Verifique DATABASE_URL (e DIRECT_URL, se necessário) e rode novamente /api/setup.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleSetup(request);
}

export async function POST(request: NextRequest) {
  return handleSetup(request);
}


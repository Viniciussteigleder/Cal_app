import { PrismaClient, SubscriptionPlan } from "@prisma/client";
import { hash } from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

type PatientSeed = {
  email: string;
  name: string;
  planLabel: "PRO" | "PRO MAX" | "PRO MAX AI" | "GRATIS";
  profile: {
    sex: "male" | "female";
    birthDate: Date;
    heightCm: number;
    currentWeightKg: number;
    targetWeightKg: number;
    activity: "sedentary" | "light" | "moderate" | "very_active" | "extra_active";
    goal: "maintain" | "loss" | "gain";
  };
  conditions?: Array<{ type: "allergy" | "intolerance" | "disease" | "other"; name: string; severity: "low" | "medium" | "high"; notes?: string }>;
  symptomWindows?: Array<{ daysAgo: number; symptoms: string[]; discomfort?: number; notes?: string }>;
};

const patients: PatientSeed[] = [
  {
    email: "ana@demo.com",
    name: "Ana",
    planLabel: "PRO",
    profile: {
      sex: "female",
      birthDate: new Date("1993-04-15"),
      heightCm: 165,
      currentWeightKg: 64,
      targetWeightKg: 60,
      activity: "moderate",
      goal: "loss",
    },
    conditions: [
      { type: "disease", name: "Disbiose intestinal", severity: "medium" },
      { type: "intolerance", name: "Intolerância à histamina", severity: "medium" },
      { type: "allergy", name: "Alergias alimentares", severity: "low" },
    ],
    symptomWindows: [
      { daysAgo: 90, symptoms: ["bloating", "gas", "abdominal_pain"], discomfort: 6, notes: "Início do quadro de disbiose" },
      { daysAgo: 60, symptoms: ["bloating", "fatigue"], discomfort: 5, notes: "Reação a alimentos ricos em histamina" },
      { daysAgo: 30, symptoms: ["bloating", "headache"], discomfort: 4, notes: "Episódios controlados após protocolo" },
    ],
  },
  {
    email: "maria@demo.com",
    name: "Maria",
    planLabel: "PRO MAX",
    profile: {
      sex: "female",
      birthDate: new Date("1988-09-10"),
      heightCm: 168,
      currentWeightKg: 70,
      targetWeightKg: 64,
      activity: "light",
      goal: "loss",
    },
  },
  {
    email: "luana@demo.com",
    name: "Luana",
    planLabel: "PRO MAX AI",
    profile: {
      sex: "female",
      birthDate: new Date("1996-12-01"),
      heightCm: 170,
      currentWeightKg: 66,
      targetWeightKg: 63,
      activity: "moderate",
      goal: "maintain",
    },
  },
  {
    email: "joana@demo.com",
    name: "Joana",
    planLabel: "GRATIS",
    profile: {
      sex: "female",
      birthDate: new Date("1999-06-20"),
      heightCm: 160,
      currentWeightKg: 58,
      targetWeightKg: 58,
      activity: "light",
      goal: "maintain",
    },
  },
];

async function upsertPatient(tenantId: string, passwordHash: string, seed: PatientSeed) {
  const user = await prisma.user.upsert({
    where: { email: seed.email },
    update: {
      name: seed.name,
      password_hash: passwordHash,
      tenant_id: tenantId,
      role: "PATIENT",
      status: "active",
    },
    create: {
      email: seed.email,
      name: seed.name,
      role: "PATIENT",
      tenant_id: tenantId,
      password_hash: passwordHash,
      status: "active",
    },
  });

  const patient = await prisma.patient.upsert({
    where: { user_id: user.id },
    update: {
      tenant_id: tenantId,
      status: "active",
      enabled_modules: { plan: seed.planLabel },
    },
    create: {
      tenant_id: tenantId,
      user_id: user.id,
      status: "active",
      enabled_modules: { plan: seed.planLabel },
    },
  });

  await prisma.patientProfile.upsert({
    where: { patient_id: patient.id },
    update: {
      current_weight_kg: seed.profile.currentWeightKg,
      target_weight_kg: seed.profile.targetWeightKg,
      activity_level: seed.profile.activity as any,
    },
    create: {
      tenant_id: tenantId,
      patient_id: patient.id,
      sex: seed.profile.sex as any,
      birth_date: seed.profile.birthDate,
      height_cm: seed.profile.heightCm,
      current_weight_kg: seed.profile.currentWeightKg,
      target_weight_kg: seed.profile.targetWeightKg,
      activity_level: seed.profile.activity as any,
      goal: seed.profile.goal as any,
    },
  });

  if (seed.conditions) {
    for (const condition of seed.conditions) {
      const existing = await prisma.patientCondition.findFirst({
        where: { patient_id: patient.id, name: condition.name },
      });
      if (!existing) {
        await prisma.patientCondition.create({
          data: {
            tenant_id: tenantId,
            patient_id: patient.id,
            type: condition.type as any,
            name: condition.name,
            severity: condition.severity as any,
            notes: condition.notes,
          },
        });
      }
    }
  }

  if (seed.symptomWindows) {
    for (const window of seed.symptomWindows) {
      const loggedAt = daysAgo(window.daysAgo);
      const already = await prisma.symptomLog.findFirst({
        where: { patient_id: patient.id, logged_at: loggedAt },
      });
      if (!already) {
        await prisma.symptomLog.create({
          data: {
            tenant_id: tenantId,
            patient_id: patient.id,
            logged_at: loggedAt,
            symptoms: window.symptoms as any,
            discomfort_level: window.discomfort ?? null,
            notes: window.notes,
          },
        });
      }
    }
  }

  return patient;
}

function daysAgo(total: number) {
  const d = new Date();
  d.setDate(d.getDate() - total);
  d.setHours(12, 0, 0, 0);
  return d;
}

async function main() {
  const passwordHash = await hash("demo123", 10);

  const tenant =
    (await prisma.tenant.findFirst({ where: { name: "NutriPlan Demo Clinic" } })) ??
    (await prisma.tenant.create({
      data: {
        name: "NutriPlan Demo Clinic",
        type: "B2C",
        status: "active",
        plan: SubscriptionPlan.PRO_MAX_AI,
      },
    }));

  console.log(`Tenant ready: ${tenant.id}`);

  // Ensure owner/nutri account
  const nutriUser = await prisma.user.upsert({
    where: { email: "nutri@demo.com" },
    update: {
      name: "Nutri Demo",
      role: "TENANT_ADMIN",
      tenant_id: tenant.id,
      password_hash: passwordHash,
      status: "active",
    },
    create: {
      email: "nutri@demo.com",
      name: "Nutri Demo",
      role: "TENANT_ADMIN",
      tenant_id: tenant.id,
      password_hash: passwordHash,
      status: "active",
    },
  });

  console.log(`Admin user ready: ${nutriUser.email}`);

  for (const seed of patients) {
    const patient = await upsertPatient(tenant.id, passwordHash, seed);
    console.log(`Patient ready: ${seed.email} (${patient.id})`);
  }

  console.log("✅ Requested demo data populated.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

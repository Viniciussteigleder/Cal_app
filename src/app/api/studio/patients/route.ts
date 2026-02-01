import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { MOCK_PATIENTS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TENANT_ADMIN" && session.role !== "TEAM")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "active";

    // Try database first
    try {
      const { prisma } = await import("@/lib/prisma");

      const patients = await prisma.patient.findMany({
        where: {
          tenant_id: session.tenantId,
          status: status as "active" | "inactive" | "archived",
          user: search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : undefined,
        },
        include: {
          user: true,
          profile: true,
          plans: {
            where: { status: "active" },
            take: 1,
          },
          protocol_instances: {
            where: { is_active: true },
            include: {
              protocol: true,
              phases: {
                where: { is_current: true },
                include: { phase: true },
              },
            },
          },
          symptom_logs: {
            orderBy: { logged_at: "desc" },
            take: 1,
          },
          meals: {
            orderBy: { date: "desc" },
            take: 1,
          },
        },
        orderBy: { created_at: "desc" },
      });

      const formattedPatients = patients.map((p) => ({
        id: p.id,
        userId: p.user_id,
        name: p.user?.name || "Desconhecido",
        email: p.user?.email || "",
        status: p.status,
        createdAt: p.created_at,
        profile: p.profile
          ? {
              sex: p.profile.sex,
              age: Math.floor(
                (Date.now() - new Date(p.profile.birth_date).getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000)
              ),
              currentWeight: Number(p.profile.current_weight_kg),
              targetWeight: p.profile.target_weight_kg
                ? Number(p.profile.target_weight_kg)
                : null,
              goal: p.profile.goal,
              activityLevel: p.profile.activity_level,
            }
          : null,
        hasActivePlan: p.plans.length > 0,
        activeProtocol: p.protocol_instances[0]
          ? {
              name: p.protocol_instances[0].protocol.name,
              type: p.protocol_instances[0].protocol.type,
              currentPhase:
                p.protocol_instances[0].phases[0]?.phase.name || "Desconhecido",
            }
          : null,
        lastSymptom: p.symptom_logs[0]
          ? {
              date: p.symptom_logs[0].logged_at,
              discomfortLevel: p.symptom_logs[0].discomfort_level,
            }
          : null,
        lastMeal: p.meals[0]
          ? {
              date: p.meals[0].date,
              type: p.meals[0].type,
            }
          : null,
      }));

      return NextResponse.json({ patients: formattedPatients });
    } catch (dbError) {
      console.log("Banco de dados não disponível, usando dados de demonstração");
    }

    // Return mock data if database not available
    let filteredPatients = MOCK_PATIENTS;

    if (status !== "all") {
      filteredPatients = filteredPatients.filter(p => p.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = filteredPatients.filter(
        p => p.name.toLowerCase().includes(searchLower) ||
             p.email.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      patients: filteredPatients.map(p => ({
        id: p.id,
        userId: `user-${p.id}`,
        name: p.name,
        email: p.email,
        status: p.status,
        createdAt: new Date(p.lastConsultation),
        profile: {
          sex: "female",
          age: 32,
          currentWeight: 68,
          targetWeight: 63,
          goal: "loss",
          activityLevel: "moderate",
        },
        hasActivePlan: p.activePlan !== null,
        activeProtocol: p.activePlan ? {
          name: p.activePlan,
          type: "elimination",
          currentPhase: "Fase 1",
        } : null,
        lastSymptom: p.alerts.length > 0 ? {
          date: new Date(),
          discomfortLevel: 5,
        } : null,
        lastMeal: {
          date: new Date(),
          type: "lunch",
        },
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

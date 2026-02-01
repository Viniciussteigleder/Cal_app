import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TENANT_ADMIN" && session.role !== "TEAM")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all patients for this tenant
    const patients = await prisma.patient.findMany({
      where: {
        tenant_id: session.tenantId,
        status: "active",
      },
      include: {
        user: true,
        profile: true,
        symptom_logs: {
          orderBy: { logged_at: "desc" },
          take: 10,
        },
        meals: {
          orderBy: { date: "desc" },
          take: 7,
          include: {
            items: {
              include: { snapshot: true },
            },
          },
        },
      },
    });

    // Calculate alerts and insights
    const alerts: Array<{
      type: "critical" | "warning" | "watch";
      patientId: string;
      patientName: string;
      message: string;
      timestamp: Date;
    }> = [];

    const patientInsights: Array<{
      id: string;
      name: string;
      email: string;
      lastActivity: Date | null;
      consistencyScore: number;
      histamineLoad: number;
      recentDiscomfort: number | null;
      status: "good" | "warning" | "critical";
    }> = [];

    for (const patient of patients) {
      const recentSymptoms = patient.symptom_logs;
      const recentMeals = patient.meals;

      // Check for high discomfort alerts
      const highDiscomfort = recentSymptoms.find(
        (s) => s.discomfort_level && s.discomfort_level >= 8
      );
      if (highDiscomfort) {
        alerts.push({
          type: "critical",
          patientId: patient.id,
          patientName: patient.user?.name || "Unknown",
          message: `Nível de desconforto ${highDiscomfort.discomfort_level}/10 registrado`,
          timestamp: highDiscomfort.logged_at,
        });
      }

      // Check for warning-level discomfort
      const warningDiscomfort = recentSymptoms.find(
        (s) => s.discomfort_level && s.discomfort_level >= 6 && s.discomfort_level < 8
      );
      if (warningDiscomfort && !highDiscomfort) {
        alerts.push({
          type: "warning",
          patientId: patient.id,
          patientName: patient.user?.name || "Unknown",
          message: `Desconforto moderado (${warningDiscomfort.discomfort_level}/10)`,
          timestamp: warningDiscomfort.logged_at,
        });
      }

      // Calculate consistency score (meals logged in last 7 days)
      const uniqueDays = new Set(
        recentMeals.map((m) => new Date(m.date).toDateString())
      ).size;
      const consistencyScore = Math.round((uniqueDays / 7) * 100);

      // Calculate histamine load (simplified)
      let histamineLoad = 0;
      for (const meal of recentMeals) {
        for (const item of meal.items) {
          const snapshot = item.snapshot.snapshot_json as { name?: string };
          const foodName = (snapshot.name || "").toLowerCase();
          if (
            foodName.includes("queijo") ||
            foodName.includes("vinho") ||
            foodName.includes("iogurte")
          ) {
            histamineLoad += 15;
          } else if (
            foodName.includes("tomate") ||
            foodName.includes("banana")
          ) {
            histamineLoad += 8;
          }
        }
      }

      // Determine status
      let status: "good" | "warning" | "critical" = "good";
      const latestDiscomfort = recentSymptoms[0]?.discomfort_level;
      if (latestDiscomfort && latestDiscomfort >= 8) {
        status = "critical";
      } else if (latestDiscomfort && latestDiscomfort >= 5) {
        status = "warning";
      } else if (histamineLoad > 50) {
        status = "warning";
      }

      patientInsights.push({
        id: patient.id,
        name: patient.user?.name || "Unknown",
        email: patient.user?.email || "",
        lastActivity:
          recentMeals[0]?.date || recentSymptoms[0]?.logged_at || null,
        consistencyScore,
        histamineLoad: Math.min(histamineLoad, 100),
        recentDiscomfort: latestDiscomfort || null,
        status,
      });
    }

    // Get AI-detected correlations
    const correlations = await prisma.symptomMealCorrelation.findMany({
      where: {
        tenant_id: session.tenantId,
        correlation_score: { gte: 0.7 },
      },
      include: {
        symptom_log: {
          include: { patient: { include: { user: true } } },
        },
        meal: {
          include: {
            items: { include: { snapshot: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    const aiInsights = correlations.map((c) => {
      const foods = c.meal.items.map((item) => {
        const snapshot = item.snapshot.snapshot_json as { name?: string };
        return snapshot.name || "Unknown";
      });

      return {
        id: c.id,
        patientName: c.symptom_log.patient.user?.name || "Unknown",
        patientId: c.symptom_log.patient_id,
        foods,
        symptoms: c.symptom_log.symptoms,
        confidence: Number(c.correlation_score) * 100,
        date: c.created_at,
      };
    });

    // Sort alerts by severity
    alerts.sort((a, b) => {
      const priority = { critical: 0, warning: 1, watch: 2 };
      return priority[a.type] - priority[b.type];
    });

    return NextResponse.json({
      summary: {
        totalPatients: patients.length,
        activeToday: patientInsights.filter(
          (p) =>
            p.lastActivity &&
            new Date(p.lastActivity).toDateString() === new Date().toDateString()
        ).length,
        criticalAlerts: alerts.filter((a) => a.type === "critical").length,
        warningAlerts: alerts.filter((a) => a.type === "warning").length,
      },
      alerts: alerts.slice(0, 10),
      patients: patientInsights,
      aiInsights,
    });
  } catch (error) {
    console.error("Studio dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

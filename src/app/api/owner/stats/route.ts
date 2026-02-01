import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true,
        patients: {
          include: {
            meals: {
              orderBy: { date: "desc" },
              take: 1,
            },
            symptom_logs: {
              orderBy: { logged_at: "desc" },
              take: 1,
            },
          },
        },
        datasets: {
          where: { status: "published" },
        },
      },
    });

    const tenantStats = tenants.map((tenant) => {
      const activePatients = tenant.patients.filter(
        (p) => p.status === "active"
      ).length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeToday = tenant.patients.filter((p) => {
        const lastMeal = p.meals[0];
        const lastSymptom = p.symptom_logs[0];
        const lastActivity = lastMeal?.date || lastSymptom?.logged_at;
        return lastActivity && new Date(lastActivity) >= today;
      }).length;

      return {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type,
        status: tenant.status,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: tenant.users.length,
          nutritionists: tenant.users.filter(
            (u) => u.role === "TENANT_ADMIN" || u.role === "TEAM"
          ).length,
          patients: tenant.users.filter((u) => u.role === "PATIENT").length,
          activePatients,
          activeToday,
          publishedDatasets: tenant.datasets.length,
        },
      };
    });

    // Global stats
    const totalUsers = await prisma.user.count();
    const totalPatients = await prisma.patient.count({
      where: { status: "active" },
    });
    const totalMeals = await prisma.meal.count();
    const totalSymptomLogs = await prisma.symptomLog.count();

    // Today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealsToday = await prisma.meal.count({
      where: { date: { gte: today } },
    });

    const symptomsToday = await prisma.symptomLog.count({
      where: { logged_at: { gte: today } },
    });

    return NextResponse.json({
      global: {
        totalTenants: tenants.length,
        activeTenants: tenants.filter((t) => t.status === "active").length,
        totalUsers,
        totalPatients,
        totalMeals,
        totalSymptomLogs,
        mealsToday,
        symptomsToday,
      },
      tenants: tenantStats,
    });
  } catch (error) {
    console.error("Owner stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

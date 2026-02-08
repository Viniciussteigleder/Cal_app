import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { assertPatientBelongsToTenant, TenantMismatchError } from "@/lib/ai/tenant-guard";
import { withSession, type SessionClaims } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant não identificado" }, { status: 401 });
    }

    const claims: SessionClaims = {
      user_id: session.userId,
      tenant_id: tenantId,
      role: session.role,
    };

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId") || session.patientId;

    if (!patientId) {
      return NextResponse.json(
        { error: "ID do paciente é obrigatório" },
        { status: 400 }
      );
    }

    // Verify patient belongs to this tenant
    await assertPatientBelongsToTenant(patientId, claims);

    const { patient, profile, protocolInstances, recentMeals, mealItems, recentSymptoms, snapshots } =
      await withSession(claims, async (tx) => {
        const [patient, profile, protocolInstances] = await Promise.all([
          tx.patient.findFirst({
            where: { id: patientId, tenant_id: tenantId },
            include: { user: true },
          }),
          tx.patientProfile.findFirst({
            where: { patient_id: patientId, tenant_id: tenantId },
          }),
          tx.patientProtocolInstance.findMany({
            where: { patient_id: patientId, tenant_id: tenantId, is_active: true },
            include: { protocol: true },
            take: 5,
          }),
        ]);

        const recentMeals = await tx.meal.findMany({
          where: { patient_id: patientId, tenant_id: tenantId },
          orderBy: { date: "desc" },
          take: 30,
        });

        const mealIds = recentMeals.map((m) => m.id);
        const mealItems =
          mealIds.length > 0
            ? await tx.mealItem.findMany({
                where: { meal_id: { in: mealIds }, tenant_id: tenantId },
              })
            : [];
        const recentSymptoms = await tx.symptomLog.findMany({
          where: { patient_id: patientId, tenant_id: tenantId },
          orderBy: { logged_at: "desc" },
          take: 30,
        });

        const snapshotIds = [...new Set(mealItems.map((i) => i.snapshot_id))];
        const snapshots =
          snapshotIds.length > 0
            ? await tx.foodSnapshot.findMany({
                where: { id: { in: snapshotIds }, tenant_id: tenantId },
              })
            : [];

        return { patient, profile, protocolInstances, recentMeals, mealItems, recentSymptoms, snapshots };
      });

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
    }

    // Data fetched inside withSession above for RLS safety.
    const snapshotMap = new Map(snapshots.map((s) => [s.id, s]));

    // Calculate nutrition averages
    let totalCalories = 0;
    let totalProtein = 0;
    let mealCount = 0;

    for (const meal of recentMeals) {
      const itemsForMeal = mealItems.filter((item) => item.meal_id === meal.id);
      if (!itemsForMeal.length) continue;

      for (const item of itemsForMeal) {
        if (!item.snapshot_id) continue;
        const snapshot = snapshotMap.get(item.snapshot_id);
        if (!snapshot) continue;

        const snapshotData = snapshot.snapshot_json as any;
        const nutrients = (snapshotData?.nutrients ?? {}) as Record<string, number>;
        const grams = item.grams.toNumber();
        const multiplier = grams / 100; // nutrients are per-100g snapshots
        totalCalories += (nutrients.energy_kcal || 0) * multiplier;
        totalProtein += (nutrients.protein_g || 0) * multiplier;
      }

      mealCount++;
    }

    const avgCaloriesPerMeal = mealCount > 0 ? totalCalories / mealCount : 0;
    const avgProteinPerMeal = mealCount > 0 ? totalProtein / mealCount : 0;

    // Calculate symptom trends
    const avgDiscomfort =
      recentSymptoms.length > 0
        ? recentSymptoms.reduce(
            (acc, s) => acc + (s.discomfort_level || 0),
            0
          ) / recentSymptoms.length
        : 0;

    const bristolDistribution: Record<string, number> = {};
    for (const symptom of recentSymptoms) {
      if (symptom.bristol_scale) {
        bristolDistribution[symptom.bristol_scale] =
          (bristolDistribution[symptom.bristol_scale] || 0) + 1;
      }
    }

    // Generate personalized insights
    const insights: Array<{
      type: "success" | "warning" | "info" | "tip";
      title: string;
      description: string;
      priority: number;
    }> = [];

    // Consistency insight
    const uniqueDays = new Set(
      recentMeals.map((m) => new Date(m.date).toDateString())
    ).size;
    if (uniqueDays >= 5) {
      insights.push({
        type: "success",
        title: "Ótima consistência!",
        description: `Você registrou refeições em ${uniqueDays} dos últimos 7 dias. Continue assim!`,
        priority: 1,
      });
    } else if (uniqueDays < 3) {
      insights.push({
        type: "tip",
        title: "Melhore sua consistência",
        description:
          "Registrar refeições regularmente ajuda a identificar padrões. Tente registrar pelo menos 1 refeição por dia.",
        priority: 2,
      });
    }

    // Protein insight
    if (profile?.goal === "loss" && avgProteinPerMeal < 20) {
      insights.push({
        type: "tip",
        title: "Aumente a proteína",
        description:
          "Para seu objetivo de perda de peso, consumir mais proteína ajuda a manter a massa muscular e aumentar a saciedade.",
        priority: 2,
      });
    }

    // Symptom trend insight
    if (avgDiscomfort > 5) {
      insights.push({
        type: "warning",
        title: "Desconforto frequente",
        description: `Sua média de desconforto é ${avgDiscomfort.toFixed(1)}/10. Considere conversar com seu nutricionista sobre ajustes na dieta.`,
        priority: 1,
      });
    } else if (avgDiscomfort < 3 && recentSymptoms.length > 5) {
      insights.push({
        type: "success",
        title: "Sintomas controlados",
        description:
          "Seus níveis de desconforto estão baixos. Seu plano alimentar parece estar funcionando bem!",
        priority: 2,
      });
    }

    // Bristol scale insight
    const type4Count = bristolDistribution["type_4"] || 0;
    const totalBristol = Object.values(bristolDistribution).reduce(
      (a, b) => a + b,
      0
    );
    if (totalBristol > 5 && type4Count / totalBristol > 0.5) {
      insights.push({
        type: "success",
        title: "Trânsito intestinal saudável",
        description:
          "A maioria dos seus registros indica um trânsito intestinal ideal (Tipo 4).",
        priority: 3,
      });
    }

    // Protocol-specific insights
    if (protocolInstances.length > 0) {
      const protocol = protocolInstances[0].protocol;
      insights.push({
        type: "info",
        title: `Protocolo ${protocol.name} ativo`,
        description: `Você está seguindo o protocolo ${protocol.name}. Lembre-se de seguir as orientações específicas para esta fase.`,
        priority: 2,
      });
    }

    // Hydration tip (general)
    insights.push({
      type: "tip",
      title: "Dica do dia",
      description:
        "Beba água ao longo do dia. A hidratação adequada ajuda na digestão e no bem-estar geral.",
      priority: 4,
    });

    // Sort by priority
    insights.sort((a, b) => a.priority - b.priority);

    return NextResponse.json({
      patient: {
        name: patient.user?.name || "Desconhecido",
        goal: profile?.goal || "maintain",
      },
      nutrition: {
        avgCaloriesPerMeal: Math.round(avgCaloriesPerMeal),
        avgProteinPerMeal: Math.round(avgProteinPerMeal),
        totalMealsLogged: mealCount,
        daysWithMeals: uniqueDays,
      },
      symptoms: {
        avgDiscomfort: Math.round(avgDiscomfort * 10) / 10,
        totalLogged: recentSymptoms.length,
        bristolDistribution,
      },
      insights,
    });
  } catch (error) {
    if (error instanceof TenantMismatchError) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("Erro ao acessar banco de dados para insights:", error);
    return NextResponse.json(
      { error: "Não foi possível acessar os dados do paciente. Tente novamente mais tarde." },
      { status: 503 }
    );
  }
}

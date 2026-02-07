'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { executeAIAction } from '@/app/studio/ai/actions';

export async function getPatientContext(patientId: string, days: number = 30) {
    const claims = await getSupabaseClaims();
    if (!claims) throw new Error('Unauthorized');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // 1. Fetch Patient Profile & Metadata
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { user: true }
    });
    const profile = await prisma.patientProfile.findUnique({ where: { patient_id: patientId } });

    if (!patient || !profile) throw new Error('Paciente não encontrado');

    // 2. Fetch Logs (Meals, Symptoms, Measurements)
    const logs = await prisma.dailyLogEntry.findMany({
        where: {
            patient_id: patientId,
            timestamp: { gte: startDate, lte: endDate }
        },
        orderBy: { timestamp: 'desc' },
        take: 100 // Limit for context size
    });

    // 3. Fetch Meals with Deep Health Metrics (UPF, etc)
    const meals = await prisma.meal.findMany({
        where: {
            patient_id: patientId,
            date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'desc' },
        include: {
            items: {
                include: { snapshot: true }
            }
        }
    });

    // 4. Calculate Key Metrics
    const totalMeals = meals.length;
    let upfTotalScore = 0;
    let proteinQualityHigh = 0;
    let proteinQualityTotal = 0;

    meals.forEach((meal: any) => {
        if (meal.upf_score) upfTotalScore += meal.upf_score; // 1-4
        meal.items.forEach((item: any) => {
            const snapshot = item.snapshot.snapshot_json as any;
            if (snapshot.protein_quality && snapshot.protein_quality > 0.8) proteinQualityHigh++;
            if (snapshot.protein_quality) proteinQualityTotal++;
        });
    });

    const avgUpf = totalMeals > 0 ? (upfTotalScore / totalMeals).toFixed(2) : "N/A";
    const proteinQualityRatio = proteinQualityTotal > 0 ? ((proteinQualityHigh / proteinQualityTotal) * 100).toFixed(0) + '%' : "N/A";

    // 5. Build AI Context
    const context = {
        patient: {
            name: patient.user?.name,
            age: new Date().getFullYear() - new Date(profile.birth_date).getFullYear(),
            goal: profile.goal,
            sex: profile.sex
        },
        period: `Last ${days} days`,
        metrics: {
            adherence_rate: totalMeals > 0 ? "High" : "Low", // Simple heuristic for now
            avg_upf_score: avgUpf, // NOVA 1-4
            protein_quality_high_ratio: proteinQualityRatio,
            total_logs: logs.length
        },
        logs_sample: logs.map(l => ({
            type: l.entry_type,
            date: l.timestamp.toISOString().split('T')[0],
            content: l.content
        })).slice(0, 20), // Truncate for token limit
        meals_sample: (meals as any[]).map(m => ({
            date: m.date.toISOString().split('T')[0],
            type: m.type,
            upf_score: m.upf_score,
            items: m.items.map((i: any) => (i.snapshot.snapshot_json as any).name).join(', ')
        })).slice(0, 10)
    };

    return context;
}

export async function runClinicalAnalysisAction(patientId: string, days: number = 30) {
    try {
        const context = await getPatientContext(patientId, days);

        // Call the 'patient_analyzer' agent (Expert Clinical Copilot)
        const result = await executeAIAction('patient_analyzer', {
            patient_context: JSON.stringify(context)
        });

        if (!result.success) throw new Error(result.error);

        return { success: true, analysis: (result as any).data }; // Expecting JSON structure from AI
    } catch (error: any) {
        console.error("Clinical Analysis Error:", error);
        return { success: false, error: error.message || 'Falha na análise clínica.' };
    }
}

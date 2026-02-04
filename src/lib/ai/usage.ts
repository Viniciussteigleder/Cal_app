import { prisma } from '@/lib/prisma';

export async function recordAiUsage(data: {
    tenantId: string;
    nutritionistId?: string;
    patientId?: string;
    agentType: string;
    creditsUsed: number;
    costUsd: number;
    costBrl: number;
    metadata?: any;
}) {
    try {
        await prisma.aiCreditTransaction.create({
            data: {
                tenant_id: data.tenantId,
                nutritionist_id: data.nutritionistId,
                patient_id: data.patientId,
                agent_type: data.agentType,
                credits_used: data.creditsUsed,
                cost_usd: data.costUsd,
                cost_brl: data.costBrl,
                metadata: data.metadata || {}
            }
        });
        return true;
    } catch (error) {
        console.error("Failed to record AI usage:", error);
        return false; // Don't block the main flow
    }
}

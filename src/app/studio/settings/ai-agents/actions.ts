'use server';

import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getAgentConfigs() {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        const configs = await prisma.aiAgentConfig.findMany({
            where: { tenant_id: claims.tenant_id }
        });

        // Map database fields to the UI shape if needed, or just return them
        // DB: agent_id, model_provider, model_name, system_prompt, user_template, etc.
        // UI expects: id, name, type, provider, model, etc.

        return { success: true, data: configs };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed' };
    }
}

export async function saveAgentConfig(config: any) {
    const claims = await getSupabaseClaims();
    if (!claims) return { success: false, error: 'Unauthorized' };

    try {
        // Upsert based on tenant_id + agent_id
        const upserted = await prisma.aiAgentConfig.upsert({
            where: {
                tenant_id_agent_id: {
                    tenant_id: claims.tenant_id,
                    agent_id: config.id // acting as the unique slug in DB
                }
            },
            create: {
                tenant_id: claims.tenant_id,
                agent_id: config.id,
                model_provider: config.provider,
                model_name: config.model,
                system_prompt: config.systemPrompt,
                user_template: config.userPromptTemplate,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                is_active: config.isActive
            },
            update: {
                model_provider: config.provider,
                model_name: config.model,
                system_prompt: config.systemPrompt,
                user_template: config.userPromptTemplate,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                is_active: config.isActive,
                updated_at: new Date()
            }
        });

        revalidatePath('/studio/settings/ai-agents');
        return { success: true, data: upserted };
    } catch (e) {
        console.error("Save Agent Error:", e);
        return { success: false, error: 'Failed to save config' };
    }
}

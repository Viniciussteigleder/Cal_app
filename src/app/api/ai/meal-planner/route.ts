import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getAgentConfig } from '@/lib/ai-config';
import { prisma } from '@/lib/prisma';
import { assertPatientBelongsToTenant, TenantMismatchError } from '@/lib/ai/tenant-guard';

// 1. Define Zod Schemas
const MacroSchema = z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
});

const MealFoodSchema = z.object({
    name: z.string(),
    amount: z.string(),
    unit: z.string().optional(),
});

const MealSchema = z.object({
    name: z.string(),
    foods: z.array(MealFoodSchema),
    total_kcal: z.number(),
    macros: MacroSchema,
    instructions: z.string().optional(),
});

const DayPlanSchema = z.object({
    day: z.number(),
    breakfast: MealSchema,
    lunch: MealSchema,
    dinner: MealSchema,
    snacks: z.array(MealSchema),
});

const MealPlanResponseSchema = z.object({
    days: z.array(DayPlanSchema),
    estimated_cost: z.number().describe("Estimated total cost in BRL"),
    reasoning: z.string().describe("Explanation of why this plan was chosen"),
});

/**
 * POST /api/ai/meal-planner
 *
 * Generate a personalized meal plan using AI (Unified Architecture)
 */
export async function POST(request: NextRequest) {
    let execution: { id: string } | null = null;
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const claims = user.app_metadata;
        const tenantId = claims.tenant_id as string;

        if (!tenantId) {
            return NextResponse.json({ error: 'No tenant found for user' }, { status: 400 });
        }

        // Parse Body
        const body = await request.json();
        const {
            patientId,
            targetKcal,
            macroSplit,
            preferences = [],
            restrictions = [],
            daysCount = 7,
        } = body;

        // Verify patient belongs to this tenant
        if (patientId) {
            await assertPatientBelongsToTenant(patientId, tenantId);
        }

        // 2. Get Dynamic Config
        const agentConfig = await getAgentConfig('meal_planner');

        // 3. Initialize OpenAI
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'Provedor de IA não configurado' }, { status: 503 });
        }

        const openai = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Track execution start
        const startTime = Date.now();
        execution = await prisma.aIExecution.create({
            data: {
                tenant_id: tenantId,
                model_id: agentConfig.model,
                agent_type: 'meal_planner',
                input_data: { patientId, targetKcal, macroSplit, preferences, restrictions, daysCount },
                status: 'running',
            },
        });

        // 4. Generate Object (Safe!)
        const { object, usage } = await generateObject({
            model: openai(agentConfig.model),
            schema: MealPlanResponseSchema,
            temperature: agentConfig.temperature,
            system: agentConfig.systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: `Create a ${daysCount}-day meal plan.
                    Target: ${targetKcal} kcal.
                    Macros: ${JSON.stringify(macroSplit)}.
                    Preferences: ${preferences.join(', ')}.
                    Restrictions: ${restrictions.join(', ')}.
                    Patient ID: ${patientId}.

                    Ensure variety and cultural appropriateness for Brazil.`
                }
            ]
        });

        const executionTimeMs = Date.now() - startTime;
        const tokensUsed = usage.totalTokens || 0;
        const cost = (tokensUsed / 1000) * 0.005; // gpt-4o pricing
        const creditCost = 5; // meal_planner costs 5 credits

        // 5. Track execution completion + deduct credits atomically
        await prisma.$transaction([
            prisma.aIExecution.update({
                where: { id: execution.id },
                data: {
                    output_data: object as any,
                    tokens_used: tokensUsed,
                    execution_time_ms: executionTimeMs,
                    cost,
                    status: 'completed',
                },
            }),
            prisma.tenant.update({
                where: { id: tenantId },
                data: { ai_credits: { decrement: creditCost } },
            }),
            prisma.aiCreditTransaction.create({
                data: {
                    tenant_id: tenantId,
                    nutritionist_id: user.id,
                    patient_id: patientId,
                    agent_type: 'meal_planner',
                    credits_used: creditCost,
                    cost_usd: cost,
                    cost_brl: cost * 5.0,
                    metadata: { executionId: execution.id, tokensUsed, daysCount, targetKcal },
                },
            }),
        ]);

        // 6. Save to DB (Legacy support via Supabase)
        const { data: mealPlanRecord, error: dbError } = await supabase
            .from('AIMealPlan')
            .insert({
                tenant_id: tenantId,
                patient_id: patientId,
                generation_params: {
                    targetKcal,
                    macroSplit,
                    preferences,
                    restrictions,
                    daysCount,
                },
                generated_meals: object.days,
                macro_distribution: macroSplit,
                estimated_cost: object.estimated_cost,
                ai_reasoning: object.reasoning,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Error saving meal plan:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: object,
            mealPlanId: mealPlanRecord?.id,
            executionId: execution.id,
            creditsUsed: creditCost,
        });

    } catch (error) {
        if (error instanceof TenantMismatchError) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        console.error('Unified Meal Planner Error:', error);
        // Mark execution as failed if it was created
        if (execution?.id) {
            await prisma.aIExecution.update({
                where: { id: execution.id },
                data: { status: 'failed', error_message: error instanceof Error ? error.message : 'Unknown error' },
            }).catch(() => {});
        }
        return NextResponse.json(
            { error: 'Failed to generate meal plan' },
            { status: 500 }
        );
    }
}

// Keep GET for compatibility
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tenantId = user.app_metadata?.tenant_id as string;
        if (!tenantId) return NextResponse.json({ error: 'No tenant found' }, { status: 400 });

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        if (!patientId) return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });

        // Verify patient belongs to this tenant
        await assertPatientBelongsToTenant(patientId, tenantId);

        const { data, error } = await supabase
            .from('AIMealPlan')
            .select('*')
            .eq('patient_id', patientId)
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        if (error instanceof TenantMismatchError) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

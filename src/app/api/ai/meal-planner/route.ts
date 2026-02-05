
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getAgentConfig } from '@/lib/ai-config';
import { recordAiUsage } from '@/lib/ai/usage';

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

        // 2. Get Dynamic Config
        const agentConfig = await getAgentConfig('meal_planner');

        // 3. Initialize OpenAI
        const openai = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy',
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

        // 5. Track Usage
        await recordAiUsage({
            tenantId: tenantId,
            nutritionistId: user.id,
            patientId: patientId,
            agentType: 'meal_planner',
            creditsUsed: 1,
            costUsd: (usage.totalTokens || 0) * (10 / 1000000),
            costBrl: (usage.totalTokens || 0) * (10 / 1000000) * 5.5,
            metadata: { daysCount, targetKcal }
        });

        // 6. Save to DB (Legacy support)
        // We still save to AIMealPlan table for record keeping
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
        });

    } catch (error) {
        console.error('Unified Meal Planner Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate meal plan' },
            { status: 500 }
        );
    }
}

// Keep GET for compatibility
export async function GET(request: NextRequest) {
    // ... existing GET implementation logic or import from a shared helper
    // For simplicity, just rewriting the essential parts logic here as the previous file had it.
    // In a real refactor, move GET logic to a separate handler or keep it if I'm only modifying POST.
    // I will assume I need to rewrite it since I'm overwriting the file.

    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        if (!patientId) return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });

        const { data, error } = await supabase
            .from('AIMealPlan')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

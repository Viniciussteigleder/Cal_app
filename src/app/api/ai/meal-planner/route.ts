import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { aiService } from '@/lib/ai/ai-service';

/**
 * POST /api/ai/meal-planner
 * 
 * Generate a personalized meal plan using AI
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const {
            patientId,
            tenantId,
            targetKcal,
            macroSplit,
            preferences,
            restrictions,
            daysCount = 7,
        } = body;

        if (!patientId || !tenantId || !targetKcal || !macroSplit) {
            return NextResponse.json(
                { error: 'Missing required fields: patientId, tenantId, targetKcal, macroSplit' },
                { status: 400 }
            );
        }

        // Validate macro split adds up to 100
        const total = macroSplit.protein + macroSplit.carbs + macroSplit.fat;
        if (Math.abs(total - 100) > 0.1) {
            return NextResponse.json(
                { error: 'Macro split must add up to 100%' },
                { status: 400 }
            );
        }

        // Execute AI agent
        const result = await aiService.execute({
            tenantId,
            agentType: 'meal_planner',
            inputData: {
                patientId,
                targetKcal,
                macroSplit,
                preferences,
                restrictions,
                daysCount,
            },
            userId: user.id,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        // Save meal plan to database
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
                generated_meals: result.data.days || [],
                macro_distribution: macroSplit,
                estimated_cost: result.data.estimated_cost,
                ai_reasoning: result.data.reasoning,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Error saving meal plan:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            executionId: result.executionId,
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            mealPlanId: mealPlanRecord?.id,
        });
    } catch (error) {
        console.error('Meal planner error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ai/meal-planner
 * 
 * Get all AI-generated meal plans for a patient
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        if (!patientId) {
            return NextResponse.json(
                { error: 'Missing patientId parameter' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('AIMealPlan')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Get meal plans error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

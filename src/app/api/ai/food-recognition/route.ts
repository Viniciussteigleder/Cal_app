import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { aiService } from '@/lib/ai/ai-service';

/**
 * POST /api/ai/food-recognition
 * 
 * Recognize foods from an uploaded image
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
        const { imageUrl, patientId } = body;
        // Derive tenantId from auth, not request body (security)
        const tenantId = user.app_metadata?.tenant_id as string;

        if (!imageUrl || !patientId) {
            return NextResponse.json(
                { error: 'Missing required fields: imageUrl, patientId' },
                { status: 400 }
            );
        }

        if (!tenantId) {
            return NextResponse.json(
                { error: 'No tenant found for user' },
                { status: 400 }
            );
        }

        // Execute AI agent
        const result = await aiService.execute({
            tenantId,
            agentType: 'food_recognition',
            inputData: {
                imageUrl,
                patientId,
            },
            userId: user.id,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        // Save recognition result to database
        const { data: recognitionRecord, error: dbError } = await supabase
            .from('FoodRecognition')
            .insert({
                tenant_id: tenantId,
                patient_id: patientId,
                image_url: imageUrl,
                recognized_foods: result.data.recognized_foods,
                ai_model_version: 'gpt-4o',
                confidence_score: result.data.confidence_score,
                user_confirmed: false,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Error saving recognition result:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            executionId: result.executionId,
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            recognitionId: recognitionRecord?.id,
        });
    } catch (error) {
        console.error('Food recognition error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


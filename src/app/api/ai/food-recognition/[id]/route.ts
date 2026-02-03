import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * PATCH /api/ai/food-recognition/[id]
 *
 * Confirm or correct a food recognition result
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Await params in Next.js 16
        const { id } = await params;

        const body = await request.json();
        const { confirmed, corrections } = body;

        // Update recognition record
        const { data, error } = await supabase
            .from('FoodRecognition')
            .update({
                user_confirmed: confirmed,
                corrections: corrections,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Update recognition error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

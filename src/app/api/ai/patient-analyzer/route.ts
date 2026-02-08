import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { aiService } from '@/lib/ai/ai-service';
import { assertPatientBelongsToTenant, TenantMismatchError } from '@/lib/ai/tenant-guard';
import { withSession, type SessionClaims } from '@/lib/db';

/**
 * POST /api/ai/patient-analyzer
 * 
 * Analyze patient adherence and predict dropout risk
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
        const { patientId } = body;
        // Derive tenantId from auth, not request body (security)
        const tenantId = user.app_metadata?.tenant_id as string;

        if (!patientId) {
            return NextResponse.json(
                { error: 'Missing required field: patientId' },
                { status: 400 }
            );
        }

        if (!tenantId) {
            return NextResponse.json(
                { error: 'No tenant found for user' },
                { status: 400 }
            );
        }

        // Verify patient belongs to this tenant
        const role = (user.app_metadata?.role ?? 'TENANT_ADMIN') as SessionClaims['role'];
        const claims: SessionClaims = { user_id: user.id, tenant_id: tenantId, role };
        await assertPatientBelongsToTenant(patientId, claims);

        // Gather patient data for analysis (scoped by tenant_id)
        const [recentMeals, consultations, symptoms] = await withSession(claims, (tx) =>
            Promise.all([
                tx.meal.findMany({
                    where: { patient_id: patientId, tenant_id: tenantId },
                    orderBy: { date: 'desc' },
                    take: 30,
                    select: {
                        id: true,
                        date: true,
                        type: true,
                        totals_json: true,
                    },
                }),
                tx.consultation.findMany({
                    where: { patient_id: patientId, tenant_id: tenantId },
                    orderBy: { created_at: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        status: true,
                        created_at: true,
                    },
                }),
                tx.symptomLog.findMany({
                    where: { patient_id: patientId, tenant_id: tenantId },
                    orderBy: { logged_at: 'desc' },
                    take: 20,
                    select: {
                        id: true,
                        logged_at: true,
                        symptoms: true,
                        discomfort_level: true,
                    },
                }),
            ])
        );

        // Execute AI agent
        const result = await aiService.execute({
            tenantId,
            agentType: 'patient_analyzer',
            inputData: {
                patientId,
                recentMeals,
                consultationHistory: consultations,
                symptoms,
            },
            userId: user.id,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        // Save analysis to database
        const { data: analysisRecord, error: dbError } = await supabase
            .from('PatientAnalysis')
            .insert({
                tenant_id: tenantId,
                patient_id: patientId,
                adherence_score: result.data.adherence_score,
                progress_score: result.data.progress_score,
                dropout_risk: result.data.dropout_risk,
                intervention_needed: result.data.intervention_needed,
                ai_insights: result.data.insights,
                recommended_actions: result.data.recommended_actions,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Error saving analysis:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            executionId: result.executionId,
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            analysisId: analysisRecord?.id,
        });
    } catch (error) {
        if (error instanceof TenantMismatchError) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        console.error('Patient analyzer error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ai/patient-analyzer
 * 
 * Get patient analysis history
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

        const tenantId = user.app_metadata?.tenant_id as string;
        if (!tenantId) {
            return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        if (!patientId) {
            return NextResponse.json(
                { error: 'Missing patientId parameter' },
                { status: 400 }
            );
        }

        // Verify patient belongs to this tenant
        const role = (user.app_metadata?.role ?? 'TENANT_ADMIN') as SessionClaims['role'];
        await assertPatientBelongsToTenant(patientId, { user_id: user.id, tenant_id: tenantId, role });

        const { data, error } = await supabase
            .from('PatientAnalysis')
            .select('*')
            .eq('patient_id', patientId)
            .eq('tenant_id', tenantId)
            .order('analysis_date', { ascending: false })
            .limit(10);

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        if (error instanceof TenantMismatchError) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        console.error('Get patient analyses error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

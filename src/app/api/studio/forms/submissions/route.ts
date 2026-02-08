import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { tenant_id: true },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const searchParams = request.nextUrl.searchParams;
        const patientId = searchParams.get('patient_id');
        const templateId = searchParams.get('template_id');

        const where: any = {};

        if (patientId) {
            where.patient_id = patientId;
        }

        if (templateId) {
            where.template_id = templateId;
        }

        const submissions = await prisma.formSubmission.findMany({
            where,
            include: {
                template: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                    },
                },
                patient: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                submitted_at: 'desc',
            },
        });

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error("Error fetching form submissions:", error);
        return NextResponse.json(
            { error: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { template_id, patient_id, responses_json } = body;

        if (!template_id || !patient_id || !responses_json) {
            return NextResponse.json(
                { error: "Template ID, Patient ID, and responses are required" },
                { status: 400 }
            );
        }

        const submission = await prisma.formSubmission.create({
            data: {
                template_id,
                patient_id,
                responses_json,
            },
            include: {
                template: true,
                patient: {
                    include: {
                        profile: true,
                    },
                },
            },
        });

        return NextResponse.json({ submission }, { status: 201 });
    } catch (error) {
        console.error("Error creating form submission:", error);
        return NextResponse.json(
            { error: "Failed to create submission" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { tenant_id: true },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const { enabled_modules } = body;

        if (!enabled_modules || typeof enabled_modules !== 'object') {
            return NextResponse.json(
                { error: "Invalid enabled_modules format" },
                { status: 400 }
            );
        }

        // Verify patient belongs to tenant
        const patient = await prisma.patient.findFirst({
            where: {
                id,
                tenant_id: dbUser.tenant_id,
            },
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: {
                enabled_modules,
            },
            include: {
                profile: true,
            },
        });

        return NextResponse.json({ patient: updatedPatient });
    } catch (error) {
        console.error("Error updating patient modules:", error);
        return NextResponse.json(
            { error: "Failed to update patient modules" },
            { status: 500 }
        );
    }
}

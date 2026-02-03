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

        const templates = await prisma.formTemplate.findMany({
            where: {
                tenant_id: dbUser.tenant_id,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json({ templates });
    } catch (error) {
        console.error("Error fetching form templates:", error);
        return NextResponse.json(
            { error: "Failed to fetch templates" },
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

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { tenant_id: true },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const { title, type, structure_json, is_system } = body;

        if (!title || !structure_json) {
            return NextResponse.json(
                { error: "Title and structure are required" },
                { status: 400 }
            );
        }

        const template = await prisma.formTemplate.create({
            data: {
                tenant_id: dbUser.tenant_id,
                title,
                type: type || 'custom',
                structure_json,
                is_system: is_system || false,
            },
        });

        return NextResponse.json({ template }, { status: 201 });
    } catch (error) {
        console.error("Error creating form template:", error);
        return NextResponse.json(
            { error: "Failed to create template" },
            { status: 500 }
        );
    }
}

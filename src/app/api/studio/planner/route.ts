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

        // Get user's tenant
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { tenant_id: true },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch planner tasks
        const tasks = await prisma.plannerTask.findMany({
            where: {
                tenant_id: dbUser.tenant_id,
                user_id: user.id,
            },
            orderBy: [
                { priority: 'desc' },
                { created_at: 'desc' },
            ],
        });

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error("Error fetching planner tasks:", error);
        return NextResponse.json(
            { error: "Failed to fetch tasks" },
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
        const { title, description, priority, due_date, status } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const task = await prisma.plannerTask.create({
            data: {
                tenant_id: dbUser.tenant_id,
                user_id: user.id,
                title,
                description: description || null,
                priority: priority || 'medium',
                status: status || 'todo',
                due_date: due_date ? new Date(due_date) : null,
            },
        });

        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        console.error("Error creating planner task:", error);
        return NextResponse.json(
            { error: "Failed to create task" },
            { status: 500 }
        );
    }
}

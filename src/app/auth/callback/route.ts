import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionCookieValue, type SessionPayload } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/patient/dashboard";

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            const sbUser = data.user;

            // Sync with our application database
            let user = await prisma.user.findUnique({
                where: { email: sbUser.email },
                include: { patient: true }
            });

            // If user doesn't exist in our DB but authenticated via Google, 
            // we should ideally create them. For now, let's at least check.
            if (!user) {
                console.log(`User ${sbUser.email} authenticated via Google but not found in app DB. Creating...`);
                // Simple auto-onboarding for Google users
                user = await prisma.$transaction(async (tx) => {
                    const tenant = await tx.tenant.create({
                        data: {
                            name: `${sbUser.user_metadata.full_name || sbUser.email} Workspace`,
                            type: "B2C",
                            status: "active",
                        },
                    });

                    const newUser = await tx.user.create({
                        data: {
                            email: sbUser.email!,
                            name: sbUser.user_metadata.full_name || sbUser.email!.split('@')[0],
                            role: "PATIENT", // Default role
                            tenant_id: tenant.id,
                            status: "active",
                        },
                    });

                    await tx.patient.create({
                        data: {
                            tenant_id: tenant.id,
                            user_id: newUser.id,
                            status: "active",
                        },
                    });

                    return await tx.user.findUnique({
                        where: { id: newUser.id },
                        include: { patient: true }
                    });
                }) as any;
            }

            if (user) {
                // Create the application session cookie (np_session)
                const sessionData: SessionPayload = {
                    userId: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as any,
                    tenantId: user.tenant_id,
                    patientId: (user as any).patient?.id || null,
                };

                const cookieStore = await cookies();
                cookieStore.set("np_session", createSessionCookieValue(sessionData), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 7,
                    path: "/",
                });

                // Determine redirect based on role if not specified
                let redirectPath = next;
                if (!searchParams.get("next")) {
                    if (user.role === "OWNER") redirectPath = "/owner/tenants";
                    else if (user.role === "TENANT_ADMIN" || user.role === "TEAM") redirectPath = "/studio/dashboard";
                }

                return NextResponse.redirect(`${origin}${redirectPath}`);
            }
        } else {
            console.error("Auth callback error:", error);
        }
    }

    // return the user to an error page with instructions
    const errorUrl = new URL(`${origin}/login`);
    errorUrl.searchParams.set("error", "auth");
    errorUrl.searchParams.set("message", "Unable to exchange external code. Please check your Google Auth configuration in Supabase.");
    return NextResponse.redirect(errorUrl.toString());
}

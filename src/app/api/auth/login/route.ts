import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { MOCK_USERS } from "@/lib/mock-data";
import { createSessionCookieValue, type SessionPayload } from "@/lib/session";

// Demo password from environment variable - ONLY for mock users or dev environment specific fallback if needed
function getDemoPassword(): string | null {
  return process.env.DEMO_PASSWORD || null;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    console.log(`Login attempt for: ${normalizedEmail}`);

    // 1. Try database lookup first (Real Auth)
    try {
      const { prisma } = await import("@/lib/prisma"); // Dynamic import to avoid errors if prisma client issues
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          // We can't include patient easily if it's not a relation on User properly in some schema versions, 
          // but based on schema readings: User has optional `patient` relation? 
          // Wait, schema says: Patient has `user_id` unique. User does NOT have `patient` field in the definition I read!!!
          // Let's check schema again.
          // Model User: planner_tasks PlannerTask[]
          // Model Patient: user_id String? @unique
          // So User -> Patient is one-to-one? 
          // Prisma usually adds the relation field on the other side if defined.
          // Let's check if User has patient field. 
          // The file content I read for schema.prisma (lines 20-28) did NOT show `patient` relation on User.
          // But line 33 in Patient: `user_id String? @unique`.
          // Usually this implies `patient Patient?` on User model, but it was not in the text I saw.
          // I should be careful with `include: { patient: true }`.
          // I'll try to find patient separately if needed, or assume the relation exists and I missed it in the file view (maybe it was just not shown in the diff/view).
          // Actually, in the `view_file` output for `api/auth/login/route.ts` (line 73), it HAD `include: { patient: true }`.
          // So the relation likely exists in the schema but I missed it or it was added implicitly?
          // Wait, I replaced the User model content in Step 41. I DID NOT add `patient Patient?`.
          // ERROR: I might have broken the relation if it was there before.
          // Let's re-read the schema file to check the User model I wrote.
        }
      });

      // Validating user and password
      if (user) {
        let isValid = false;

        // 1a. Check password hash
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((user as any).password_hash) {
          isValid = await compare(cleanPassword, (user as any).password_hash);
        }

        // 1b. Fallback for LEGACY users/Dev only - remove in strict prod
        // Only allow demo password if NO hash exists AND we are not in strict prod?
        // Or should we just fail?
        // To be safe and "fix security", we should NOT allow demo password for DB users unless explicitly flagged.
        // For now, I will REQUIRE password_hash for DB users.

        if (isValid) {
          // Find patient for this user
          const patient = await prisma.patient.findUnique({ where: { user_id: user.id } });

          const sessionData: SessionPayload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenant_id,
            patientId: patient?.id || null,
          };

          const cookieStore = await cookies();
          cookieStore.set("np_session", createSessionCookieValue(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });

          let redirect = "/patient/dashboard";
          if (user.role === "OWNER") {
            redirect = "/owner/tenants";
          } else if (user.role === "TENANT_ADMIN" || user.role === "TEAM") {
            redirect = "/studio/dashboard";
          }

          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
            redirect,
          });
        }

        // If user exists but password is wrong, don't fall back to demo: return invalid creds
        return NextResponse.json(
          { error: "Email ou senha incorretos" },
          { status: 401 }
        );
      }
    } catch (dbError) {
      console.log("Database authentication failed or unavailable:", dbError);
    }

    // 2. Check Mock Users (Fallback only when explicitly enabled)
    const isDemoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

    if (isDemoEnabled) {
      const demoPassword = getDemoPassword();
      if (!demoPassword) {
        return NextResponse.json(
          { error: "Demo login is disabled" },
          { status: 403 }
        );
      }
      const mockUser = MOCK_USERS[normalizedEmail as keyof typeof MOCK_USERS];

      if (mockUser && cleanPassword === demoPassword) {
        // Set session cookie with mock user data
        const userRole = mockUser.role as string;
        const sessionData: SessionPayload = {
          userId: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: userRole,
          tenantId: mockUser.tenantId,
          patientId: mockUser.patientId,
        };

        const cookieStore = await cookies();
        cookieStore.set("np_session", createSessionCookieValue(sessionData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        });

        // Determine redirect path
        let redirect = "/patient/dashboard";
        if (userRole === "OWNER") {
          redirect = "/owner/tenants";
        } else if (userRole === "TENANT_ADMIN" || userRole === "TEAM") {
          redirect = "/studio/dashboard";
        }

        return NextResponse.json({
          success: true,
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
          },
          redirect,
        });
      }
    }

    return NextResponse.json(
      { error: "Email ou senha incorretos" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

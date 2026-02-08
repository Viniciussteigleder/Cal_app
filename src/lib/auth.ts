import { createSupabaseServerClient } from "./supabase/server";
import type { SessionClaims } from "./db";
import { cookies } from "next/headers";
import { verifySessionCookieValue } from "./session";

export async function getSupabaseClaims(): Promise<SessionClaims | null> {
  // Test harness hook: allow unit tests to run server actions without Next request context.
  if ((process.env.VITEST || process.env.NODE_ENV === "test") && process.env.TEST_SESSION_CLAIMS) {
    try {
      const parsed = JSON.parse(process.env.TEST_SESSION_CLAIMS) as SessionClaims;
      if (parsed?.user_id && parsed?.tenant_id && parsed?.role) return parsed;
    } catch {
      // ignore
    }
  }

  // 1. Check Mock/Demo Session FIRST (Avoids Supabase init crash if envs are missing)
  let sessionCookie: { value: string } | undefined;
  try {
    const cookieStore = await cookies();
    sessionCookie = cookieStore.get("np_session");
  } catch {
    // `cookies()` throws outside request scope (e.g. unit tests). Continue to Supabase.
  }

  if (sessionCookie) {
    try {
      const session = verifySessionCookieValue(sessionCookie.value);
      if (!session) return null;
      // Support both structure formats (flat or nested user)
      const userId = session.userId || (session as any).user?.id;
      const tenantId = session.tenantId;
      const role = session.role;

      if (userId && tenantId && role) {
        return {
          user_id: userId,
          tenant_id: tenantId,
          role: role
        };
      }
    } catch {
      // Invalid session, ignore
    }
  }

  // 2. Try Supabase Auth (Real) - Only if URL is valid
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project")) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    const claims = data.session.user.app_metadata ?? {};
    const tenant_id = claims.tenant_id as string | undefined;
    const role = claims.role as SessionClaims["role"] | undefined;

    if (tenant_id && role) {
      return {
        user_id: data.session.user.id,
        tenant_id,
        role,
      };
    }
  }

  return null;
}

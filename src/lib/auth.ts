import { createSupabaseServerClient } from "./supabase/server";
import type { SessionClaims } from "./db";
import { cookies } from "next/headers";

export async function getSupabaseClaims(): Promise<SessionClaims | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

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

  // Fallback: Check Mock Session (Dev/Demo Only)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('np_session');

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.user?.id && session.tenantId && session.role) {
        return {
          user_id: session.user.id,
          tenant_id: session.tenantId,
          role: session.role
        };
      }
    } catch {
      // Invalid json, ignore
    }
  }

  return null;
}

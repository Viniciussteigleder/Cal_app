import { createSupabaseServerClient } from "./supabase/server";
import type { SessionClaims } from "./db";

export async function getSupabaseClaims(): Promise<SessionClaims | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  const claims = data.session.user.app_metadata ?? {};
  const tenant_id = claims.tenant_id as string | undefined;
  const role = claims.role as SessionClaims["role"] | undefined;

  if (!tenant_id || !role) {
    return null;
  }

  return {
    user_id: data.session.user.id,
    tenant_id,
    role,
  };
}

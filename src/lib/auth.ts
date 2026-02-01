import { createSupabaseServerClient } from "./supabase/server";
import type { SessionClaims } from "./db";

export async function getSupabaseClaims(): Promise<SessionClaims | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  const { user } = data.session;
  const tenant_id = (user.app_metadata?.tenant_id ?? user.user_metadata?.tenant_id) as
    | string
    | undefined;
  const role = (user.app_metadata?.role ?? user.user_metadata?.role) as
    | SessionClaims["role"]
    | undefined;

  if (!tenant_id || !role) {
    return null;
  }

  return {
    user_id: user.id,
    tenant_id,
    role,
  };
}

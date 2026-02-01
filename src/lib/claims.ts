import { getSupabaseClaims } from "./auth";
import { getSessionClaims } from "./session";
import type { SessionClaims } from "./db";

export async function getRequestClaims(): Promise<SessionClaims | null> {
  const supabaseClaims = await getSupabaseClaims();
  if (supabaseClaims) {
    return supabaseClaims;
  }

  return getSessionClaims();
}

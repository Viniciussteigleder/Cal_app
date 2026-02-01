import { cookies, headers } from "next/headers";

import type { SessionClaims } from "./db";

const CLAIMS_COOKIE_KEYS = {
  user_id: "np_user_id",
  tenant_id: "np_tenant_id",
  role: "np_role",
} as const;

export function getSessionClaims(): SessionClaims | null {
  const cookieStore = cookies();
  const headerStore = headers();

  const user_id =
    cookieStore.get(CLAIMS_COOKIE_KEYS.user_id)?.value ??
    headerStore.get("x-user-id") ??
    "";
  const tenant_id =
    cookieStore.get(CLAIMS_COOKIE_KEYS.tenant_id)?.value ??
    headerStore.get("x-tenant-id") ??
    "";
  const role =
    (cookieStore.get(CLAIMS_COOKIE_KEYS.role)?.value ??
      headerStore.get("x-role")) as SessionClaims["role"];

  if (!user_id || !tenant_id || !role) {
    return null;
  }

  return { user_id, tenant_id, role };
}

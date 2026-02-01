import { PrismaClient } from "@prisma/client";

import { withSession, type SessionClaims, prisma } from "@/lib/db";

export { prisma };

export function buildClaims(params: Partial<SessionClaims> = {}): SessionClaims {
  return {
    user_id: params.user_id ?? "00000000-0000-0000-0000-000000000001",
    tenant_id: params.tenant_id ?? "00000000-0000-0000-0000-000000000001",
    role: params.role ?? "TENANT_ADMIN",
  };
}

export async function withTestSession<T>(
  claims: SessionClaims,
  fn: (client: PrismaClient) => Promise<T>,
  options?: { ownerMode?: boolean }
) {
  return withSession(claims, fn, options);
}

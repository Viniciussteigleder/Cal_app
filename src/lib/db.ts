import { PrismaClient } from "@prisma/client";
import { prisma as singletonPrisma } from "@/lib/prisma";

// Re-export the singleton prisma client to avoid duplicate connections
export const prisma = singletonPrisma;

export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface SessionClaims {
  user_id: string;
  tenant_id: string;
  role: "OWNER" | "TENANT_ADMIN" | "TEAM" | "PATIENT";
}

export async function withSession<T>(
  claims: SessionClaims,
  fn: (client: PrismaClient) => Promise<T>,
  options?: { ownerMode?: boolean }
) {
  return prisma.$transaction(async (tx) => {
    // Enforce RLS even when DATABASE_URL connects as a superuser/table owner.
    // In production, prefer connecting as `nutriplan_app` directly; this is a safety net.
    await tx
      .$executeRawUnsafe("SET LOCAL ROLE nutriplan_app")
      .catch(() => {
        // Role may not exist in early dev/test DBs; migrations should create it.
      });

    await tx.$executeRawUnsafe(
      "SELECT set_config('app.user_id', $1, true), set_config('app.tenant_id', $2, true), set_config('app.role', $3, true), set_config('app.owner_mode', $4, true), set_config('row_security', 'on', true)",
      claims.user_id,
      claims.tenant_id,
      claims.role,
      options?.ownerMode ? "true" : "false"
    );
    return fn(tx as PrismaClient);
  });
}

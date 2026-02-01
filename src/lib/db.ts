import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

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
    await tx.$executeRawUnsafe(
      "SELECT set_config('app.user_id', $1, true), set_config('app.tenant_id', $2, true), set_config('app.role', $3, true), set_config('app.owner_mode', $4, true)",
      claims.user_id,
      claims.tenant_id,
      claims.role,
      options?.ownerMode ? "true" : "false"
    );
    return fn(tx as PrismaClient);
  });
}

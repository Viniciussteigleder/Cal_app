import { prisma, type SessionClaims } from "./db";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE_SOFT"
  | "APPROVE"
  | "PUBLISH"
  | "ARCHIVE"
  | "POLICY_CHANGE"
  | "SNAPSHOT_CREATE"
  | "DATASET_PUBLISH"
  | "LOGIN"
  | "SUPPORT_ACCESS";

export async function logAuditEvent({
  claims,
  action,
  entity_type,
  entity_id,
  before_json,
  after_json,
  reason,
  request_id,
  ip_hash,
  user_agent,
}: {
  claims: SessionClaims;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  before_json?: unknown;
  after_json?: unknown;
  reason?: string;
  request_id: string;
  ip_hash?: string;
  user_agent?: string;
}) {
  return prisma.auditEvent.create({
    data: {
      tenant_id: claims.tenant_id,
      actor_user_id: claims.user_id,
      actor_role: claims.role,
      action,
      entity_type,
      entity_id,
      before_json: before_json ?? undefined,
      after_json: after_json ?? undefined,
      reason: reason ?? undefined,
      request_id,
      ip_hash: ip_hash ?? undefined,
      user_agent: user_agent ?? undefined,
    },
  });
}

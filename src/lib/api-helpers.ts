import type { PrismaClient } from "@prisma/client";

import { prisma, withSession, type SessionClaims } from "@/lib/db";
import { getRequestClaims } from "@/lib/claims";
import { can } from "@/lib/rbac";
import { isSameDay } from "@/lib/dates";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function requireClaims() {
  const claims = await getRequestClaims();
  if (!claims) {
    throw new ApiError("Sessão inválida.", 401);
  }
  return claims;
}

export async function getScopedPatient(
  client: PrismaClient,
  claims: SessionClaims,
  patientId?: string | null
) {
  if (claims.role === "PATIENT") {
    const patient = await client.patient.findFirst({
      where: { user_id: claims.user_id, tenant_id: claims.tenant_id },
    });
    if (!patient) {
      throw new ApiError("Paciente não encontrado.", 404);
    }
    return patient;
  }

  if (!patientId) {
    throw new ApiError("Paciente obrigatório.", 400);
  }

  if (!can(claims.role, "read", "patient")) {
    throw new ApiError("Acesso negado.", 403);
  }

  const patient = await client.patient.findFirst({
    where: { id: patientId, tenant_id: claims.tenant_id },
  });

  if (!patient) {
    throw new ApiError("Paciente não encontrado.", 404);
  }

  return patient;
}

export function parseDateInput(rawDate: string | null, fallback = new Date()) {
  if (!rawDate) return fallback;
  const normalized = new Date(`${rawDate}T00:00:00`);
  if (Number.isNaN(normalized.getTime())) {
    throw new ApiError("Data inválida.", 400);
  }
  return normalized;
}

export function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function requireOwner(claims: SessionClaims) {
  if (claims.role !== "OWNER") {
    throw new ApiError("Acesso restrito ao owner.", 403);
  }
}

export { prisma };
export { withSession };
export { isSameDay };

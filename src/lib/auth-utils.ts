import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: "OWNER" | "TENANT_ADMIN" | "TEAM" | "PATIENT";
  tenantId: string;
  patientId: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("np_session");

    if (!sessionCookie?.value) {
      return null;
    }

    return JSON.parse(sessionCookie.value) as SessionUser;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: SessionUser["role"][]): Promise<SessionUser> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    redirect("/login");
  }
  return session;
}

export async function requirePatient(): Promise<SessionUser & { patientId: string }> {
  const session = await requireRole(["PATIENT"]);
  if (!session.patientId) {
    redirect("/login");
  }
  return session as SessionUser & { patientId: string };
}

export async function requireNutritionist(): Promise<SessionUser> {
  return requireRole(["TENANT_ADMIN", "TEAM"]);
}

export async function requireOwner(): Promise<SessionUser> {
  return requireRole(["OWNER"]);
}

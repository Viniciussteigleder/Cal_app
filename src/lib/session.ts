import { createHmac, timingSafeEqual } from "crypto";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "OWNER" | "TENANT_ADMIN" | "TEAM" | "PATIENT";
  tenantId: string;
  patientId: string | null;
  isAdmin?: boolean;
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(payloadBase64: string, secret: string) {
  return createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

export function createSessionCookieValue(payload: SessionPayload): string {
  const secret = getSecret();
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = signValue(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifySessionCookieValue(value?: string): SessionPayload | null {
  if (!value) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = signValue(encoded, secret);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  try {
    return JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
  } catch {
    return null;
  }
}

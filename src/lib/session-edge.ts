export interface SessionPayloadEdge {
  userId: string;
  email: string;
  name: string;
  role: "OWNER" | "TENANT_ADMIN" | "TEAM" | "PATIENT";
  tenantId: string;
  patientId: string | null;
  isAdmin?: boolean;
}

function base64UrlToUint8Array(base64Url: string) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToString(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export async function verifySessionCookieValueEdge(value?: string): Promise<SessionPayloadEdge | null> {
  if (!value) return null;
  // Use bracket access to avoid build-time inlining in Edge bundles.
  const secret = process.env["SESSION_SECRET"];
  if (!secret) return null;

  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded))
  );
  const provided = base64UrlToUint8Array(signature);

  if (!constantTimeEqual(expected, provided)) return null;

  try {
    const payloadJson = uint8ArrayToString(base64UrlToUint8Array(encoded));
    return JSON.parse(payloadJson) as SessionPayloadEdge;
  } catch {
    return null;
  }
}

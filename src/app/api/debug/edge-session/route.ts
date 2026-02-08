import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function base64UrlToUint8Array(base64Url: string) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a[i] ^ b[i];
  return result === 0;
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("np_session")?.value;
  const secret = process.env["SESSION_SECRET"];

  if (!cookie) {
    return NextResponse.json(
      { ok: false, has_cookie: false, has_secret: !!secret, verified: false },
      { status: 200 }
    );
  }

  const [encoded, signature] = cookie.split(".");
  if (!encoded || !signature) {
    return NextResponse.json(
      { ok: false, has_cookie: true, has_secret: !!secret, verified: false, reason: "bad_format" },
      { status: 200 }
    );
  }

  if (!secret) {
    return NextResponse.json(
      { ok: false, has_cookie: true, has_secret: false, verified: false, reason: "missing_secret" },
      { status: 200 }
    );
  }

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
  const verified = constantTimeEqual(expected, provided);

  return NextResponse.json(
    {
      ok: true,
      has_cookie: true,
      has_secret: true,
      verified,
      // Do not return payload/secret/signature details in prod.
    },
    { status: 200 }
  );
}


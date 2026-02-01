import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/owner")) {
    response.headers.set("x-owner-mode", "true");
  }

  if (process.env.DEV_AUTOLOGIN === "true" && process.env.NODE_ENV !== "production") {
    const hasSession =
      request.cookies.get("np_user_id") &&
      request.cookies.get("np_tenant_id") &&
      request.cookies.get("np_role");
    if (!hasSession) {
      const userId = process.env.DEV_USER_ID ?? "";
      const tenantId = process.env.DEV_TENANT_ID ?? "";
      const role = process.env.DEV_ROLE ?? "";
      if (userId && tenantId && role) {
        response.cookies.set("np_user_id", userId);
        response.cookies.set("np_tenant_id", tenantId);
        response.cookies.set("np_role", role);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/owner/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/owner")) {
    response.headers.set("x-owner-mode", "true");
  }

  return response;
}

export const config = {
  matcher: ["/owner/:path*"],
};

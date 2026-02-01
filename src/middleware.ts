import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/patient", "/studio", "/owner"];

// Routes that should redirect to dashboard if already logged in
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("np_session");

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If trying to access protected route without session, redirect to login
  if (isProtectedRoute && !sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth route with session, redirect to appropriate dashboard
  if (isAuthRoute && sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      let redirectPath = "/patient/dashboard";

      if (session.role === "OWNER") {
        redirectPath = "/owner/tenants";
      } else if (session.role === "TENANT_ADMIN" || session.role === "TEAM") {
        redirectPath = "/studio/dashboard";
      }

      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch {
      // Invalid session, continue to login
    }
  }

  // Role-based access control
  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);

      // Patient can only access /patient routes
      if (pathname.startsWith("/patient") && session.role !== "PATIENT") {
        return NextResponse.redirect(
          new URL(
            session.role === "OWNER" ? "/owner/tenants" : "/studio/dashboard",
            request.url
          )
        );
      }

      // Studio routes require TENANT_ADMIN or TEAM role
      if (
        pathname.startsWith("/studio") &&
        session.role !== "TENANT_ADMIN" &&
        session.role !== "TEAM"
      ) {
        return NextResponse.redirect(
          new URL(
            session.role === "OWNER" ? "/owner/tenants" : "/patient/dashboard",
            request.url
          )
        );
      }

      // Owner routes require OWNER role
      if (pathname.startsWith("/owner") && session.role !== "OWNER") {
        return NextResponse.redirect(
          new URL(
            session.role === "PATIENT" ? "/patient/dashboard" : "/studio/dashboard",
            request.url
          )
        );
      }
    } catch {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const response = NextResponse.next();

  // Add owner mode header for owner routes
  if (pathname.startsWith("/owner")) {
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
  matcher: [
    "/patient/:path*",
    "/studio/:path*",
    "/owner/:path*",
    "/login",
  ],
};

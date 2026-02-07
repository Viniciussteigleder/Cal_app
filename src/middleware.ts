import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { verifySessionCookieValueEdge } from '@/lib/session-edge';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiting storage (in production, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null;
const limiter = redis
  ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
  })
  : null;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let rateLimitHeaders: Record<string, string> | null = null;
  const isPublicAuthPath =
    pathname === '/login' ||
    pathname === '/owner/login' ||
    pathname.startsWith('/auth/callback');

  const applySecurityHeaders = (res: NextResponse) => {
    res.headers.set('X-DNS-Prefetch-Control', 'on');
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    res.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );
  };

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    if (limiter) {
      const { success, reset, remaining } = await limiter.limit(ip);
      rateLimitHeaders = {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      };

      if (!success) {
        const limited = new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );
        applySecurityHeaders(limited);
        return limited;
      }
    } else {
      const now = Date.now();
      let limit = rateLimit.get(ip);
      if (!limit || now > limit.resetTime) {
        limit = { count: 0, resetTime: now + 60000 };
        rateLimit.set(ip, limit);
      }
      if (limit.count > 100) {
        const limited = new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );
        applySecurityHeaders(limited);
        return limited;
      }
      limit.count++;
    }
  }

  // Clean up old rate limit entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    const now = Date.now();
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetTime) {
        rateLimit.delete(key);
      }
    }
  }

  // Role-based gate for owner/studio/patient portals and owner APIs
  const isOwnerPath = pathname.startsWith('/owner') || pathname.startsWith('/api/owner');
  const isStudioPath = pathname.startsWith('/studio');
  const isPatientPath = pathname.startsWith('/patient');

  if (!isPublicAuthPath && (isOwnerPath || isStudioPath || isPatientPath)) {
    const session = await verifySessionCookieValueEdge(request.cookies.get('np_session')?.value);
    if (!session) {
      if (pathname.startsWith('/api/')) {
        const unauthorized = new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
        applySecurityHeaders(unauthorized);
        return unauthorized;
      }
      const url = request.nextUrl.clone();
      // Redirect to specific login pages based on path
      if (isOwnerPath) {
        url.pathname = '/owner/login';
      } else {
        url.pathname = '/login';
      }
      const redirect = NextResponse.redirect(url);
      applySecurityHeaders(redirect);
      return redirect;
    }

    if (isOwnerPath && session.role !== 'OWNER') {
      const url = request.nextUrl.clone();
      url.pathname = '/owner/login';
      const redirect = NextResponse.redirect(url);
      applySecurityHeaders(redirect);
      return redirect;
    }

    if (isStudioPath && !['TENANT_ADMIN', 'TEAM', 'OWNER'].includes(session.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const redirect = NextResponse.redirect(url);
      applySecurityHeaders(redirect);
      return redirect;
    }

    if (isPatientPath && session.role !== 'PATIENT') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const redirect = NextResponse.redirect(url);
      applySecurityHeaders(redirect);
      return redirect;
    }
  }

  // Refresh Supabase session
  const response = await updateSession(request);
  if (rateLimitHeaders) {
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }
  }
  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

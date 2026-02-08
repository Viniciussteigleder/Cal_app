import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL.substring(0, 20)}...`
        : "NOT SET",
      DIRECT_URL: process.env.DIRECT_URL ? "SET" : "NOT SET",
      SESSION_SECRET: process.env.SESSION_SECRET ? "SET" : "NOT SET",
      VERCEL_ENV: process.env.VERCEL_ENV || "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    },
    database: "not tested",
  };

  // Test database connectivity
  try {
    const { prisma } = await import("@/lib/prisma");
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    const latency = Date.now() - start;
    checks.database = {
      status: "connected",
      latency_ms: latency,
      result,
    };

    // Check if users exist
    const userCount = await prisma.user.count();
    checks.users = {
      count: userCount,
      seeded: userCount > 0,
      hint: userCount === 0 ? "Run POST /api/setup?key=YOUR_SESSION_SECRET to seed users" : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    checks.database = {
      status: "error",
      error: message,
      hints: [
        "Ensure DATABASE_URL is set in Vercel Environment Variables",
        "For Supabase: use the connection pooler URL (port 6543) with ?pgbouncer=true",
        "Set DIRECT_URL to the direct connection (port 5432) for migrations",
        "Check if your Supabase project is paused (free tier pauses after inactivity)",
      ],
    };
  }

  const isHealthy = typeof checks.database === "object" &&
    (checks.database as Record<string, unknown>).status === "connected";

  return NextResponse.json(checks, { status: isHealthy ? 200 : 503 });
}

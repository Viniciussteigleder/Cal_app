import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function analyzeDatabaseUrl(): Record<string, unknown> {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    return {
      status: "NOT SET",
      action: "Set DATABASE_URL in Vercel → Settings → Environment Variables",
      supabase_instructions: {
        step1: "Go to Supabase Dashboard → Project Settings → Database",
        step2: "Under 'Connection string', select 'URI'",
        step3: "Copy the 'Transaction (pooler)' URL — it uses port 6543",
        step4: "Paste into Vercel as DATABASE_URL",
        step5: "Also copy the 'Session (direct)' URL (port 5432) as DIRECT_URL",
        example_format:
          "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres",
      },
    };
  }

  try {
    const url = new URL(raw);
    const host = url.hostname;
    const port = url.port || "5432";
    const isSupabase = host.includes("supabase.com");
    const isPooler = host.includes("pooler.supabase.com");
    const hasPgBouncer = url.searchParams.get("pgbouncer") === "true";
    const hasSsl = url.searchParams.has("sslmode");
    const hasConnLimit = url.searchParams.has("connection_limit");

    const warnings: string[] = [];

    if (isSupabase && !isPooler) {
      warnings.push(
        "Host does not use the pooler. For Vercel serverless, use the Transaction pooler URL from Supabase (host: aws-0-*.pooler.supabase.com, port: 6543)"
      );
    }

    if (isPooler && port !== "6543") {
      warnings.push(
        `Port is ${port} but the transaction pooler uses 6543. Check your connection string.`
      );
    }

    if (isSupabase && port === "6543" && !hasPgBouncer) {
      warnings.push(
        "Using pooler port 6543 but missing ?pgbouncer=true — will be auto-added by prisma.ts"
      );
    }

    if (isSupabase && !hasSsl) {
      warnings.push(
        "Missing ?sslmode=require — will be auto-added by prisma.ts"
      );
    }

    if (process.env.VERCEL && !hasConnLimit) {
      warnings.push(
        "Missing ?connection_limit=1 for serverless — will be auto-added by prisma.ts"
      );
    }

    return {
      status: "SET",
      host,
      port,
      is_supabase: isSupabase,
      uses_pooler: isPooler,
      has_pgbouncer: hasPgBouncer,
      has_ssl: hasSsl,
      has_connection_limit: hasConnLimit,
      warnings: warnings.length > 0 ? warnings : null,
      preview: `${url.protocol}//${url.username}@${host}:${port}${url.pathname}`,
    };
  } catch {
    return {
      status: "INVALID FORMAT",
      preview: raw.substring(0, 30) + "...",
      action: "DATABASE_URL must be a valid PostgreSQL connection string",
    };
  }
}

export async function GET() {
  const dbAnalysis = analyzeDatabaseUrl();

  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    runtime: {
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV || "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    },
    env: {
      DATABASE_URL: dbAnalysis,
      DIRECT_URL: process.env.DIRECT_URL ? "SET" : "NOT SET",
      SESSION_SECRET: process.env.SESSION_SECRET ? "SET" : "NOT SET",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? (process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
          ? "PLACEHOLDER (not configured)"
          : "SET")
        : "NOT SET",
    },
    database: "not tested",
  };

  // Test database connectivity
  try {
    const { prisma } = await import("@/lib/prisma");
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as ok, current_database() as db, version() as version`;
    const latency = Date.now() - start;
    checks.database = {
      status: "connected",
      latency_ms: latency,
      result,
    };

    // Check if users exist
    const userCount = await prisma.user.count();
    const tenantCount = await prisma.tenant.count();
    checks.data = {
      users: userCount,
      tenants: tenantCount,
      seeded: userCount > 0,
      hint: userCount === 0
        ? "Run: curl 'https://nutri-app-cal.vercel.app/api/setup?key=YOUR_SESSION_SECRET'"
        : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isTimeout = message.includes("P1001") || message.includes("Can't reach");
    const isAuth = message.includes("P1000") || message.includes("authentication");
    const isSsl = message.includes("SSL") || message.includes("ssl");
    const isSupabaseTenantMissing =
      message.toLowerCase().includes("tenant or user not found");

    checks.database = {
      status: "error",
      error: message,
      diagnosis: isSupabaseTenantMissing
        ? "Supabase pooler rejected the connection: Tenant/user not found. This usually means the pooler host/region is wrong for your project, or the pooler username is wrong (pooler user must be postgres.<project-ref>)."
        : isTimeout
        ? "Cannot reach the database server. Check host/port and that the Supabase project is not paused."
        : isAuth
          ? "Authentication failed. Check username and password in DATABASE_URL."
          : isSsl
            ? "SSL error. Ensure ?sslmode=require is in the connection string."
            : "Connection failed. See error message above.",
      quick_fixes: [
        isSupabaseTenantMissing &&
          "In Supabase Dashboard → Project Settings → Database → Connection string: copy the 'Transaction (pooler)' URL for DATABASE_URL (it includes aws-*-<region>.pooler.supabase.com:6543) and paste it exactly into Vercel.",
        isSupabaseTenantMissing &&
          "Ensure the pooler username includes the project ref: postgres.<your-project-ref> (not just postgres).",
        isTimeout && "Unpause your Supabase project at https://supabase.com/dashboard → your project → Database",
        isTimeout && "Use the transaction pooler URL (port 6543) instead of direct (5432) for Vercel",
        isAuth && "Reset database password in Supabase Dashboard → Settings → Database",
        isSsl && "Add ?sslmode=require to DATABASE_URL",
        "Ensure DATABASE_URL is set for the correct Vercel environment (Production / Preview / Development)",
      ].filter(Boolean),
    };
  }

  const isHealthy =
    typeof checks.database === "object" &&
    (checks.database as Record<string, unknown>).status === "connected";

  return NextResponse.json(checks, { status: isHealthy ? 200 : 503 });
}

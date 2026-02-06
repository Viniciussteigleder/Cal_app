import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { ensurePlanConfigs } from "@/lib/plans";
import { getSupabaseClaims } from "@/lib/auth";
import { SubscriptionPlan } from "@prisma/client";

const ALLOWED_FIELDS = new Set([
  "name",
  "description",
  "price_cents",
  "currency",
  "interval",
  "features",
  "ai_credits",
  "ai_usage_limit",
  "patient_limit",
  "is_active",
  "display_order",
]);

function isPlanKey(value: string): value is SubscriptionPlan {
  return Object.values(SubscriptionPlan).includes(value as SubscriptionPlan);
}

function sanitizeUpdates(updates: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    if (key === "features") {
      sanitized[key] = Array.isArray(value) ? value : [];
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}

export async function GET() {
  const claims = await getSupabaseClaims();
  if (!claims || claims.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const plans = await ensurePlanConfigs();

  let currentPlan: SubscriptionPlan | null = null;
  if (claims.tenant_id) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: claims.tenant_id },
      select: { plan: true },
    });
    currentPlan = tenant?.plan ?? null;
  }

  return NextResponse.json({ plans, currentPlan });
}

export async function PUT(request: Request) {
  const claims = await getSupabaseClaims();
  if (!claims || claims.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const planKey = body.plan as string | undefined;
  if (!planKey || !isPlanKey(planKey)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const updates = sanitizeUpdates(body.updates ?? {});
  const syncStripe = body.syncStripe !== false;

  const existing = await prisma.subscriptionPlanConfig.findUnique({
    where: { plan: planKey },
  });

  if (!existing) {
    return NextResponse.json({ error: "Plan config not found" }, { status: 404 });
  }

  const updated = await prisma.subscriptionPlanConfig.update({
    where: { plan: planKey },
    data: updates,
  });

  let stripeSynced = false;
  let finalConfig = updated;

  if (syncStripe) {
    const shouldSyncProduct =
      "name" in updates || "description" in updates || !updated.stripe_product_id;

    let stripeProductId = updated.stripe_product_id || undefined;

    if (updated.price_cents > 0) {
      if (!stripeProductId) {
        const product = await stripe.products.create({
          name: updated.name,
          description: updated.description || undefined,
          metadata: { plan: updated.plan },
        });
        stripeProductId = product.id;
      } else if (shouldSyncProduct) {
        await stripe.products.update(stripeProductId, {
          name: updated.name,
          description: updated.description || undefined,
        });
      }

      const priceChanged =
        updated.price_cents !== existing.price_cents ||
        updated.currency !== existing.currency ||
        updated.interval !== existing.interval ||
        !updated.stripe_price_id;

      if (priceChanged && stripeProductId) {
        const price = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: updated.price_cents,
          currency: updated.currency.toLowerCase(),
          recurring: { interval: updated.interval as "day" | "week" | "month" | "year" },
          metadata: { plan: updated.plan },
        });

        if (updated.stripe_price_id) {
          await stripe.prices.update(updated.stripe_price_id, { active: false });
        }

        finalConfig = await prisma.subscriptionPlanConfig.update({
          where: { plan: updated.plan },
          data: {
            stripe_product_id: stripeProductId,
            stripe_price_id: price.id,
          },
        });
      } else if (!updated.stripe_product_id && stripeProductId) {
        finalConfig = await prisma.subscriptionPlanConfig.update({
          where: { plan: updated.plan },
          data: {
            stripe_product_id: stripeProductId,
          },
        });
      }

      stripeSynced = true;
    }
  }

  return NextResponse.json({ plan: finalConfig, stripeSynced });
}

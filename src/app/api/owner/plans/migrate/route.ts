import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSupabaseClaims } from "@/lib/auth";
import { SubscriptionPlan } from "@prisma/client";
import Stripe from "stripe";

function isPlanKey(value: string): value is SubscriptionPlan {
  return Object.values(SubscriptionPlan).includes(value as SubscriptionPlan);
}

export async function POST(request: Request) {
  const claims = await getSupabaseClaims();
  if (!claims || claims.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const planKey = body?.plan as string | undefined;
  const prorationBehavior = (body?.prorationBehavior as Stripe.SubscriptionUpdateParams.ProrationBehavior) || "create_prorations";

  if (!planKey || !isPlanKey(planKey)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planConfig = await prisma.subscriptionPlanConfig.findUnique({
    where: { plan: planKey },
  });

  if (!planConfig?.stripe_price_id) {
    return NextResponse.json({ error: "Plan has no Stripe price" }, { status: 400 });
  }

  const tenants = await prisma.tenant.findMany({
    where: {
      plan: planKey,
      stripe_subscription_id: { not: null },
      subscription_status: { in: ["active", "trialing", "past_due"] },
    },
    select: {
      id: true,
      stripe_subscription_id: true,
    },
  });

  const results: Array<{ tenantId: string; subscriptionId: string; status: "updated" | "skipped" | "failed"; error?: string }> = [];

  for (const tenant of tenants) {
    try {
      const subscription = await stripe.subscriptions.retrieve(tenant.stripe_subscription_id as string, {
        expand: ["items.data.price"],
      });
      const item = subscription.items.data[0];
      if (!item) {
        results.push({ tenantId: tenant.id, subscriptionId: subscription.id, status: "failed", error: "No subscription item" });
        continue;
      }

      if (item.price?.id === planConfig.stripe_price_id) {
        results.push({ tenantId: tenant.id, subscriptionId: subscription.id, status: "skipped" });
        continue;
      }

      await stripe.subscriptions.update(subscription.id, {
        items: [
          {
            id: item.id,
            price: planConfig.stripe_price_id,
          },
        ],
        proration_behavior: prorationBehavior,
      });

      results.push({ tenantId: tenant.id, subscriptionId: subscription.id, status: "updated" });
    } catch (error: any) {
      results.push({
        tenantId: tenant.id,
        subscriptionId: tenant.stripe_subscription_id as string,
        status: "failed",
        error: error?.message || "unknown",
      });
    }
  }

  return NextResponse.json({
    plan: planKey,
    total: results.length,
    updated: results.filter((r) => r.status === "updated").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  });
}

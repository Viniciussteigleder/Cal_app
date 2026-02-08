import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

async function getPlanConfigByPrice(priceId?: string | null) {
  if (!priceId) return null;
  return prisma.subscriptionPlanConfig.findFirst({
    where: { stripe_price_id: priceId },
  });
}

async function getSubscriptionWithPrice(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session?.metadata?.tenantId) {
      return new NextResponse("Tenant ID is required in metadata", { status: 400 });
    }

    const subscription = await getSubscriptionWithPrice(
      session.subscription as string
    );
    const priceId = subscription.items.data[0]?.price?.id;
    const planConfig = await getPlanConfigByPrice(priceId);

    if (!planConfig) {
      return new NextResponse("Plan config not found for price", { status: 400 });
    }

    await prisma.tenant.update({
      where: {
        id: session.metadata.tenantId,
      },
      data: {
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        // @ts-ignore - Prisma enum mapping needs exact string match or cast
        plan: planConfig.plan as any,
        subscription_status: subscription.status,
        ai_credits: planConfig.ai_credits,
        ai_usage_limit: planConfig.ai_usage_limit,
      },
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = (invoice as any).subscription as string | null;

    if (subscriptionId) {
      const subscription = await getSubscriptionWithPrice(subscriptionId);
      const priceId = subscription.items.data[0]?.price?.id;
      const planConfig = await getPlanConfigByPrice(priceId);

      if (planConfig) {
        const tenant = await prisma.tenant.findFirst({
          where: {
            stripe_subscription_id: subscription.id,
          },
        });

        if (tenant) {
          await prisma.tenant.update({
            where: {
              id: tenant.id,
            },
            data: {
              ai_credits: {
                increment: planConfig.ai_credits,
              },
              subscription_status: subscription.status,
            },
          });
        }
      }
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const priceId = subscription.items.data[0]?.price?.id;
    const planConfig = await getPlanConfigByPrice(priceId);

    await prisma.tenant.updateMany({
      where: {
        stripe_subscription_id: subscription.id,
      },
      data: {
        subscription_status: subscription.status,
        ...(planConfig
          ? {
              // @ts-ignore
              plan: planConfig.plan as any,
              ai_usage_limit: planConfig.ai_usage_limit,
            }
          : {}),
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const basicPlan = await prisma.subscriptionPlanConfig.findFirst({
      where: { plan: "BASIC" },
    });

    await prisma.tenant.updateMany({
      where: {
        stripe_subscription_id: subscription.id,
      },
      data: {
        subscription_status: "canceled",
        plan: "BASIC",
        ai_usage_limit: basicPlan?.ai_usage_limit ?? 200,
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}

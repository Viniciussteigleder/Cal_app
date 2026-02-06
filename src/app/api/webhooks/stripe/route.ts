import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get('Stripe-Signature') as string;

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

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.tenantId) {
            return new NextResponse('Tenant ID is required in metadata', { status: 400 });
        }

        // Map Price ID or Metadata to Plan
        // Ideally pass 'plan' in metadata during checkout creation
        const planKey = session.metadata.plan?.toUpperCase().replace(/\s+/g, '_') || 'PRO';

        // Determine credits based on plan
        let credits = 100; // Default
        let limit = 1000;

        if (planKey === 'BASIC') { credits = 50; limit = 200; }
        if (planKey === 'PRO') { credits = 500; limit = 5000; }
        if (planKey === 'PRO_MAX') { credits = 2000; limit = 20000; }
        if (planKey === 'PRO_MAX_AI') { credits = 5000; limit = 100000; }

        await prisma.tenant.update({
            where: {
                id: session.metadata.tenantId,
            },
            data: {
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer as string,
                // @ts-ignore - Prisma enum mapping needs exact string match or cast
                plan: planKey as any,
                subscription_status: subscription.status,
                ai_credits: {
                    increment: credits // Initial grant
                },
                ai_usage_limit: limit
            },
        });
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        // This is a renewal. Find tenant by subscription ID
        const tenant = await prisma.tenant.findFirst({
            where: {
                stripe_subscription_id: subscription.id,
            },
        });

        if (tenant) {
            // Refresh credits for the new month
            let monthlyCredits = 50;
            // @ts-ignore
            const p = tenant.plan;

            if (p === 'PRO') monthlyCredits = 500;
            if (p === 'PRO_MAX') monthlyCredits = 2000;
            if (p === 'PRO_MAX_AI') monthlyCredits = 5000;

            await prisma.tenant.update({
                where: {
                    id: tenant.id,
                },
                data: {
                    ai_credits: {
                        increment: monthlyCredits
                    },
                    subscription_status: subscription.status,
                },
            });
        }
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.tenant.updateMany({
            where: {
                stripe_subscription_id: subscription.id,
            },
            data: {
                subscription_status: subscription.status
            }
        })
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.tenant.updateMany({
            where: {
                stripe_subscription_id: subscription.id,
            },
            data: {
                subscription_status: 'canceled',
                plan: 'BASIC', // Downgrade to BASIC
                ai_usage_limit: 200 // Reset limits
            },
        });
    }
    return new NextResponse(null, { status: 200 });
}

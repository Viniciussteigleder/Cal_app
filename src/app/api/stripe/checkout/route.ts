import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { getSupabaseClaims } from '@/lib/auth';
import { SubscriptionPlan } from '@prisma/client';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const planParam = searchParams.get('plan');

    if (!planParam) {
        return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
    }

    // Verify authentication
    const claims = await getSupabaseClaims();
    if (!claims) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (claims.role === 'PATIENT') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const planKey = planParam.toUpperCase();
    if (!Object.values(SubscriptionPlan).includes(planKey as SubscriptionPlan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get Tenant to check for existing customer ID
    const tenantId = claims.tenant_id;
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
    });

    if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const planConfig = await prisma.subscriptionPlanConfig.findUnique({
        where: { plan: planKey as SubscriptionPlan },
    });

    if (!planConfig || !planConfig.is_active) {
        return NextResponse.json({ error: 'Plan not available' }, { status: 404 });
    }

    if (!planConfig.stripe_price_id || planConfig.price_cents <= 0) {
        return NextResponse.json({ error: 'Plan does not require checkout' }, { status: 400 });
    }

    let customerId = tenant.stripe_customer_id;

    // If no customer ID, create one
    if (!customerId) {
        // We don't have the email in claims easily unless we query User table
        // Fetch user email
        const user = await prisma.user.findUnique({
            where: { id: claims.user_id }
        });

        const customer = await stripe.customers.create({
            email: user?.email || undefined,
            name: tenant.name,
            metadata: {
                tenantId: tenant.id,
            },
        });
        customerId = customer.id;

        // Save it immediately so we don't create duplicates
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: { stripe_customer_id: customerId },
        });
    }

    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: planConfig.stripe_price_id,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/subscription?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/subscription?canceled=true`,
            metadata: {
                tenantId: tenantId,
                plan: planKey,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}

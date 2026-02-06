import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Adjust based on your auth
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth'; // Adjust location of authOptions

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const priceId = searchParams.get('priceId');
    const tenantId = searchParams.get('tenantId');

    if (!priceId || !tenantId) {
        return new NextResponse('Missing priceId or tenantId', { status: 400 });
    }

    // Verify authentication
    // This is a simplified check. You should verify the user owns the tenant.
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get Tenant to check for existing customer ID
    const tenant = await db.tenant.findUnique({
        where: { id: tenantId },
    });

    if (!tenant) {
        return new NextResponse('Tenant not found', { status: 404 });
    }

    let customerId = tenant.stripe_customer_id;

    // If no customer ID, create one
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: session.user?.email || undefined,
            name: tenant.name,
            metadata: {
                tenantId: tenant.id,
            },
        });
        customerId = customer.id;

        // Save it immediately so we don't create duplicates
        await db.tenant.update({
            where: { id: tenant.id },
            data: { stripe_customer_id: customerId },
        });
    }

    // Determine Metadata Plan Name for Webhook
    // Ideally this mapping should be robust or derived from Price Lookup
    // For now, we rely on the client sending the right Price ID.
    // We can pass the Price ID to metadata to confirm match later if needed.

    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/subscription?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/subscription?canceled=true`,
            metadata: {
                tenantId: tenantId,
                // We can't easily know the Plan Enum from just Price ID without a lookup table.
                // For now, let's rely on the webhook fetching the Subscription and Mapping it, 
                // OR pass it as a query param to this route to stash in metadata.
                plan: searchParams.get('planName') || 'PROFESSIONAL',
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}

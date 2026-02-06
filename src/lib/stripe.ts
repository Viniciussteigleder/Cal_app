import Stripe from 'stripe';

function createStripeClient(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    return new Stripe(key, {
        apiVersion: '2025-01-27.acacia',
        appInfo: {
            name: 'NutriPlan',
            version: '0.1.0',
        },
        typescript: true,
    });
}

let _stripe: Stripe | null | undefined;

export function getStripe(): Stripe {
    if (_stripe === undefined) {
        _stripe = createStripeClient();
    }
    if (!_stripe) {
        throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
    }
    return _stripe;
}

// Backward-compatible lazy proxy — avoids crash at module evaluation when env var is missing
export const stripe = new Proxy({} as Stripe, {
    get(_target, prop, receiver) {
        return Reflect.get(getStripe(), prop, receiver);
    },
});

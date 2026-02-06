const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getPrices() {
    try {
        const products = await stripe.products.list({ limit: 100 });
        const prices = await stripe.prices.list({ limit: 100, active: true });

        // Target names from previous output: "Pro", "Pro Max", "Pro Max AI"
        const targetProducts = ['Pro', 'Pro Max', 'Pro Max AI'];

        console.log("--- STRIPE PRICES ---");
        for (const product of products.data) {
            if (targetProducts.includes(product.name)) {
                const productPrices = prices.data.filter(p => p.product === product.id);

                // Prefer recurring monthly if multiple
                const price = productPrices.find(p => p.recurring?.interval === 'month') || productPrices[0];

                if (price) {
                    // Normalized Env var name
                    let envName = "NEXT_PUBLIC_STRIPE_PRICE_" + product.name.toUpperCase().replace(/\s+/g, '_');
                    // Fix specific mapping if slight mismatch e.g., PRO_MAX_AI is already good

                    console.log(`${envName}=${price.id}`);
                }
            }
        }
        console.log("---------------------");

    } catch (error) {
        console.error('Error fetching from Stripe:', error);
    }
}

getPrices();

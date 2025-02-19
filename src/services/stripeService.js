import "dotenv/config";
import stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const product = await stripe.products.create({
    name: "Eucalyptus",
    description: "Ça ressemble au nom d'un cactus mais non !!",
  });
  
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2000,
    currency: 'eur',
  });

export default stripe;
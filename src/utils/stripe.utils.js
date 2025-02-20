import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createProductAndPrice = async (name, description, unit_amount) => {
  const product = await stripe.products.create({
      name,
      description,
  });

  const price = await stripe.prices.create({
      product: product.id,
      unit_amount,
      currency: 'eur',
  });

  return { product_id: product.id, price_id: price.id };
};

export { createProductAndPrice };

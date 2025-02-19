import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createProductAndPrice = async () => {
    const product = await stripe.products.create({
        name: "Eucalyptus",
        description: "Ça ressemble au nom d'un cactus mais non !!",
      });
      
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 2000,
        currency: 'eur',
      });

      return { product, price };
};

createProductAndPrice().then(({ product, price }) => {
    console.log(`Product created with ID: ${product.id}`);
    console.log(`Price created with ID: ${price.id}`);
 }).catch((error) => {
    console.error(`Error creating product or price: ${error.message}`);
 });

export default stripe;
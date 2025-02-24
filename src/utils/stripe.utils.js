import Stripe from "stripe";

// Initialisation de l'instance Stripe avec la clé secrète en variable d'environnement
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Crée un produit et un prix associé dans Stripe
 * @param {string} name - Le nom du produit
 * @param {string} description - La description du produit
 * @param {number} unit_amount - Le prix unitaire en centimes
 * @returns {Promise<Object>} - Un objet contenant les IDs du produit et du prix créés
 */

const createProductAndPrice = async (name, description, unit_amount) => {
    // Création du produit dans Stripe
    const product = await stripe.products.create({
        name,
        description,
    });

    // Création du prix associé au produit dans Stripe
    const price = await stripe.prices.create({
        product: product.id,
        unit_amount,
        currency: "eur", // Définition de la devise en euros
    });

    // Retourne les IDs du produit et du prix créés
    return { product_id: product.id, price_id: price.id };
};

export { createProductAndPrice };

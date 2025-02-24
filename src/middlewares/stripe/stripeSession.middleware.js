import "dotenv/config";
import Stripe from "stripe";
import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.utils.js";

// Initialisation de l'instance Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Middleware pour créer une session de paiement Stripe
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

const createCheckoutSession = async (req, res) => {
    try {
        // Détermination de l'origine de la requête pour les URLs de redirection
        const origin = req.headers.origin || "process.env.PROTOCOL://process.env.HOST:process.env.PORT";

        // Création des éléments de ligne pour la session Stripe
        const lineItems = req.articleDetails.map(article => {
            if (!article.stripe_price_id) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + ` L'article avec l'ID ${article.id} n'a pas de stripe_price_id.`);
                error.statusCode = STATUS_CODES.BAD_REQUEST;
                throw error;
            }
            return {
                price: article.stripe_price_id,
                quantity: article.quantity,
            };
        });

        // Création de la session de paiement Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${origin}/success.html`,
            cancel_url: `${origin}/cancel.html`,
        });

        // Réponse avec les détails de la commande créée
        res.status(STATUS_CODES.CREATED).json({
            message: "Commande créée avec succès",
            order: {
                id: req.orderId,
                sessionStripeId: session.id
            },
            articleDetails: req.articleDetails
        });

    } catch {
        res.status(STATUS_CODES.SERVER_ERROR).json({
            error: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

export default createCheckoutSession;

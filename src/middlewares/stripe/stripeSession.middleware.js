import Stripe from 'stripe';
import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.utils.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res, next) => {
    try {
        const origin = req.headers.origin || 'http://localhost:3000';

        console.log(req.articleDetails);

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

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
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
        
    } catch (error) {
        console.error("Stripe error: ", error);
        res.status(STATUS_CODES.SERVER_ERROR).json({
            error: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

export default createCheckoutSession;

import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";
import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.utils.js";

// Initialisation de l'application Express
const app = express();
// Initialisation de l'instance Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration du middleware pour parser le corps de la requête en format brut
app.use(bodyParser.raw({ type: "application/json" }));

// Définition de la route pour le webhook Stripe
app.post("/webhook", (req, res) => {
    // Récupération de la signature Stripe depuis les en-têtes
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // Construction de l'événement Stripe à partir du corps de la requête et de la signature
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
        const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Erreur de signature Stripe)");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        return next(error);
    }

    // Gestion des différents types d'événements Stripe
    switch (event.type) {
    case "checkout.session.completed":
        // eslint-disable-next-line no-unused-vars
        const session = event.data.object;
        // Traitement après le paiement réussi pour la session
        // Ajouter ici le traitement que vous souhaitez effectuer avec la session
        break;
    case "payment_intent.succeeded":
        // eslint-disable-next-line no-unused-vars
        const paymentIntent = event.data.object;
        // Traitement après le paiement réussi pour le PaymentIntent
        // Ajouter ici le traitement que vous souhaitez effectuer avec le paymentIntent
        break;

    default:
        // Traitement pour les types d'événements non gérés
    }
    // Réponse de succès
    res.status(STATUS_CODES.OK).json({ received: true });
});

// Démarrage du serveur webhook
app.listen(process.env.STRIPE_PORT);

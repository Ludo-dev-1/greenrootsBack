import "dotenv/config";
import express from 'express';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(bodyParser.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
   const sig = req.headers['stripe-signature'];
   let event;

   try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
   } catch (err) {
      console.error(`Webhook error: ${err.message}`);
      const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Erreur de signature Stripe)");
      error.statusCode = STATUS_CODES.BAD_REQUEST;
      return next(error);
   }

   switch (event.type) {
   case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`Payment successful for session: ${session.id}`);
      // Code to handle successful payment here
      break;
   case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent successful for ID: ${paymentIntent.id}`);
      // Code to handle successful payment here
      break;
   // Add more cases for different event types as needed
   default:
      console.log(`Unhandled event type ${event.type}`);
}


   res.status(STATUS_CODES.OK).json({ received: true });
});

app.listen(process.env.STRIPE_PORT, () => console.log('Webhook server running on port 4242'));

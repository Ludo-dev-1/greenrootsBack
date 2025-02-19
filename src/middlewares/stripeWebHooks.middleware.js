import express from 'express';
import bodyParser from 'body-parser';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(bodyParser.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
   const sig = req.headers['stripe-signature'];
   let event;

   try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
   } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
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


   res.json({ received: true });
});

app.listen(4242, () => console.log('Webhook server running on port 4242'));

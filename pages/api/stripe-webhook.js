import Stripe from 'stripe';
import { buffer } from 'raw-body';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Désactiver le body parser de Next.js pour les webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Gérer les différents types d'événements
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.metadata.supabase_user_email;

        // Mettre à jour le statut de l'abonnement
        await supabase
          .from('clients')
          .update({
            stripe_customer_id: session.customer,
            subscription_status: 'trialing',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('email', customerEmail);

        console.log('Checkout session completed for:', customerEmail);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);

        await supabase
          .from('clients')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_customer_id', subscription.customer);

        console.log('Subscription created:', subscription.id);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        await supabase
          .from('clients')
          .update({
            subscription_status: subscription.status,
            subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log('Subscription updated:', subscription.id, subscription.status);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await supabase
          .from('clients')
          .update({
            subscription_status: 'canceled',
            subscription_canceled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log('Subscription canceled:', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;

        // Enregistrer le paiement dans l'historique
        if (invoice.subscription) {
          const customer = await stripe.customers.retrieve(invoice.customer);

          await supabase
            .from('payment_history')
            .insert({
              stripe_customer_id: invoice.customer,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_paid / 100, // Convertir de centimes en euros
              currency: invoice.currency,
              status: 'paid',
              paid_at: new Date(invoice.created * 1000).toISOString(),
              invoice_pdf: invoice.invoice_pdf
            });

          console.log('Payment succeeded:', invoice.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        await supabase
          .from('clients')
          .update({
            subscription_status: 'past_due',
            payment_failed_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', invoice.customer);

        console.log('Payment failed for customer:', invoice.customer);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

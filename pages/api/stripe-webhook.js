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

// 🔍 FONCTION DE LOGGING pour toutes les opérations Stripe Webhook
function logWebhookEvent(eventType, data, dbOperation = null, error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    eventId: data.id,
    dbOperation,
    error: error ? { message: error.message } : null
  };

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📥 [STRIPE WEBHOOK] ${eventType}`);
  console.log('⏰ Timestamp:', timestamp);
  console.log('🔑 Event ID:', data.id);
  console.log('📦 Event Data:', JSON.stringify(data, null, 2));
  if (dbOperation) {
    console.log('💾 DB Operation:', dbOperation);
  }
  if (error) {
    console.error('❌ Error:', error);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return logEntry;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookId = `WEBHOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`\n🔔 [${webhookId}] NEW WEBHOOK RECEIVED`);

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`✅ [${webhookId}] Webhook signature verified`);
    console.log(`📋 [${webhookId}] Event type: ${event.type}`);
  } catch (err) {
    console.error(`❌ [${webhookId}] Webhook signature verification failed:`, err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Gérer les différents types d'événements
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.metadata.supabase_user_email;

        logWebhookEvent('checkout.session.completed', session, 'Updating client trial status');
        console.log(`📧 [${webhookId}] Customer Email: ${customerEmail}`);
        console.log(`🎁 [${webhookId}] Setting trial period: 30 days`);

        // 🎁 Mettre à jour le statut avec 30 JOURS d'essai gratuit
        const { data: updateData, error: updateError } = await supabase
          .from('clients')
          .update({
            stripe_customer_id: session.customer,
            subscription_status: 'trialing',
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 JOURS
          })
          .eq('email', customerEmail)
          .select();

        if (updateError) {
          logWebhookEvent('checkout.session.completed', session, null, updateError);
          console.error(`❌ [${webhookId}] DB update error:`, updateError);
        } else {
          console.log(`✅ [${webhookId}] Checkout session completed for: ${customerEmail}`);
          console.log(`💾 [${webhookId}] DB updated:`, updateData);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;

        logWebhookEvent('customer.subscription.created', subscription, 'Retrieving customer and updating subscription');
        console.log(`🆕 [${webhookId}] Subscription ID: ${subscription.id}`);
        console.log(`📊 [${webhookId}] Status: ${subscription.status}`);

        const customer = await stripe.customers.retrieve(subscription.customer);
        console.log(`👤 [${webhookId}] Customer: ${customer.email}`);

        const { data: subData, error: subError } = await supabase
          .from('clients')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_customer_id', subscription.customer)
          .select();

        if (subError) {
          logWebhookEvent('customer.subscription.created', subscription, null, subError);
          console.error(`❌ [${webhookId}] DB error:`, subError);
        } else {
          console.log(`✅ [${webhookId}] Subscription created: ${subscription.id}`);
          console.log(`💾 [${webhookId}] DB updated:`, subData);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        logWebhookEvent('customer.subscription.updated', subscription, 'Updating subscription status');
        console.log(`🔄 [${webhookId}] Subscription ID: ${subscription.id}`);
        console.log(`📊 [${webhookId}] New Status: ${subscription.status}`);

        const { data: updateData, error: updateError } = await supabase
          .from('clients')
          .update({
            subscription_status: subscription.status,
            subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
          .select();

        if (updateError) {
          logWebhookEvent('customer.subscription.updated', subscription, null, updateError);
          console.error(`❌ [${webhookId}] DB error:`, updateError);
        } else {
          console.log(`✅ [${webhookId}] Subscription updated: ${subscription.id} - ${subscription.status}`);
          console.log(`💾 [${webhookId}] DB updated:`, updateData);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        logWebhookEvent('customer.subscription.deleted', subscription, 'Marking subscription as canceled');
        console.log(`🗑️ [${webhookId}] Subscription ID: ${subscription.id}`);

        const { data: deleteData, error: deleteError } = await supabase
          .from('clients')
          .update({
            subscription_status: 'canceled',
            subscription_canceled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
          .select();

        if (deleteError) {
          logWebhookEvent('customer.subscription.deleted', subscription, null, deleteError);
          console.error(`❌ [${webhookId}] DB error:`, deleteError);
        } else {
          console.log(`✅ [${webhookId}] Subscription canceled: ${subscription.id}`);
          console.log(`💾 [${webhookId}] DB updated:`, deleteData);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;

        logWebhookEvent('invoice.payment_succeeded', invoice, 'Recording payment in history');
        console.log(`💳 [${webhookId}] Invoice ID: ${invoice.id}`);
        console.log(`💰 [${webhookId}] Amount: ${invoice.amount_paid / 100}€`);

        // Enregistrer le paiement dans l'historique
        if (invoice.subscription) {
          const customer = await stripe.customers.retrieve(invoice.customer);
          console.log(`👤 [${webhookId}] Customer: ${customer.email}`);

          const { data: paymentData, error: paymentError } = await supabase
            .from('payment_history')
            .insert({
              stripe_customer_id: invoice.customer,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_paid / 100, // Convertir de centimes en euros
              currency: invoice.currency,
              status: 'paid',
              paid_at: new Date(invoice.created * 1000).toISOString(),
              invoice_pdf: invoice.invoice_pdf,
              client_email: customer.email
            })
            .select();

          if (paymentError) {
            logWebhookEvent('invoice.payment_succeeded', invoice, null, paymentError);
            console.error(`❌ [${webhookId}] DB error:`, paymentError);
          } else {
            console.log(`✅ [${webhookId}] Payment succeeded: ${invoice.id}`);
            console.log(`💾 [${webhookId}] Payment history updated:`, paymentData);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        logWebhookEvent('invoice.payment_failed', invoice, 'Updating subscription to past_due');
        console.log(`❌ [${webhookId}] Invoice ID: ${invoice.id}`);
        console.log(`⚠️ [${webhookId}] Payment failed for customer: ${invoice.customer}`);

        const { data: failData, error: failError } = await supabase
          .from('clients')
          .update({
            subscription_status: 'past_due',
            payment_failed_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', invoice.customer)
          .select();

        if (failError) {
          logWebhookEvent('invoice.payment_failed', invoice, null, failError);
          console.error(`❌ [${webhookId}] DB error:`, failError);
        } else {
          console.log(`⚠️ [${webhookId}] Payment failed marked for customer: ${invoice.customer}`);
          console.log(`💾 [${webhookId}] DB updated:`, failData);
        }
        break;
      }

      default:
        console.log(`⚠️ [${webhookId}] Unhandled event type: ${event.type}`);
        logWebhookEvent(event.type, event.data.object, 'Unhandled - no action taken');
    }

    console.log(`✅ [${webhookId}] Webhook processed successfully`);
    res.status(200).json({ received: true, webhookId });
  } catch (error) {
    console.error(`❌ [${webhookId}] Webhook handler error:`, error);
    console.error(`❌ [${webhookId}] Stack trace:`, error.stack);
    res.status(500).json({
      error: 'Webhook handler failed',
      message: error.message,
      webhookId
    });
  }
}

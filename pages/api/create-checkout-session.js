import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🔍 FONCTION DE LOGGING pour toutes les opérations Stripe
function logStripeOperation(operation, data, result = null, error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    data,
    result: result ? { id: result.id, type: result.object } : null,
    error: error ? { message: error.message, type: error.type } : null
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔷 [STRIPE API] ${operation}`);
  console.log('⏰ Timestamp:', timestamp);
  console.log('📤 Request Data:', JSON.stringify(data, null, 2));
  if (result) {
    console.log('✅ Response:', JSON.stringify(result, null, 2));
  }
  if (error) {
    console.error('❌ Error:', JSON.stringify(error, null, 2));
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return logEntry;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`\n🆕 [${requestId}] NEW CHECKOUT SESSION REQUEST`);

  try {
    const { email, userId } = req.body;

    if (!email) {
      console.error(`❌ [${requestId}] Email is required`);
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`📧 [${requestId}] Email: ${email}, UserID: ${userId || 'N/A'}`);

    // Configuration du plan unique - 1 MOIS GRATUIT
    const planConfig = {
      name: 'ReplyFast AI - Abonnement Mensuel',
      description: 'Accès complet à toutes les fonctionnalités ReplyFast AI',
      amount: 2900, // 29€ en centimes
      interval: 'month',
      trial_days: 30 // 🎁 1 MOIS GRATUIT (changé de 14 à 30 jours)
    };

    console.log(`💰 [${requestId}] Plan Config:`, planConfig);

    // 🔍 LOG: Vérifier si le client existe déjà dans Stripe
    let customers;
    try {
      logStripeOperation('customers.list (OUTBOUND)', { email, limit: 1 });
      customers = await stripe.customers.list({
        email: email,
        limit: 1
      });
      logStripeOperation('customers.list (OUTBOUND)', { email, limit: 1 }, customers);
      console.log(`✅ [${requestId}] Customers found: ${customers.data.length}`);
    } catch (error) {
      logStripeOperation('customers.list (OUTBOUND)', { email, limit: 1 }, null, error);
      throw error;
    }

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`♻️ [${requestId}] Existing customer: ${customerId}`);
    } else {
      // 🔍 LOG: Créer un nouveau client Stripe
      try {
        const customerData = {
          email: email,
          metadata: {
            supabase_user_id: userId || email,
            created_from: 'replyfast_checkout',
            request_id: requestId
          }
        };
        logStripeOperation('customers.create (OUTBOUND)', customerData);
        const customer = await stripe.customers.create(customerData);
        logStripeOperation('customers.create (OUTBOUND)', customerData, customer);
        customerId = customer.id;
        console.log(`🆕 [${requestId}] New customer created: ${customerId}`);
      } catch (error) {
        logStripeOperation('customers.create (OUTBOUND)', { email }, null, error);
        throw error;
      }
    }

    // 🔍 LOG: Créer la session Stripe Checkout
    const sessionData = {
      customer: customerId,
      payment_method_types: ['card'], // Carte seulement - pas de compte Stripe requis
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // 🎯 Utiliser le price ID configuré
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: planConfig.trial_days, // 🎁 30 JOURS D'ESSAI GRATUIT
        metadata: {
          supabase_user_email: email,
          request_id: requestId
        }
      },
      success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment?canceled=true`,
      metadata: {
        supabase_user_email: email,
        request_id: requestId
      },
      allow_promotion_codes: true, // Permettre les codes promo
      billing_address_collection: 'required', // Collecter l'adresse de facturation
      customer_update: {
        address: 'auto' // Mettre à jour l'adresse automatiquement
      }
    };

    let session;
    try {
      logStripeOperation('checkout.sessions.create (OUTBOUND)', sessionData);
      session = await stripe.checkout.sessions.create(sessionData);
      logStripeOperation('checkout.sessions.create (OUTBOUND)', sessionData, session);
      console.log(`✅ [${requestId}] Checkout session created: ${session.id}`);
      console.log(`🔗 [${requestId}] Checkout URL: ${session.url}`);
    } catch (error) {
      logStripeOperation('checkout.sessions.create (OUTBOUND)', sessionData, null, error);
      throw error;
    }

    // 🔍 LOG: Mettre à jour Supabase avec l'ID du client Stripe
    console.log(`💾 [${requestId}] Updating Supabase...`);
    const { data: updateData, error: updateError } = await supabase
      .from('clients')
      .update({
        stripe_customer_id: customerId,
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + planConfig.trial_days * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('email', email)
      .select();

    if (updateError) {
      console.error(`❌ [${requestId}] Supabase update error:`, updateError);
    } else {
      console.log(`✅ [${requestId}] Supabase updated:`, updateData);
    }

    console.log(`✅ [${requestId}] Checkout session request SUCCESSFUL`);
    console.log(`🎁 [${requestId}] Trial period: ${planConfig.trial_days} days FREE`);

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
      trialDays: planConfig.trial_days,
      requestId
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Stripe checkout error:`, error);
    console.error(`❌ [${requestId}] Stack trace:`, error.stack);
    res.status(500).json({
      error: error.message,
      requestId,
      type: error.type || 'unknown_error'
    });
  }
}

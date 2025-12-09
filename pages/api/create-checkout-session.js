import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialisation Stripe avec gestion d'erreur
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Configuration du plan - 19.99€/mois avec 30 jours d'essai
const PLAN_CONFIG = {
  name: 'ReplyFast AI - Abonnement Mensuel',
  description: 'Acces complet a toutes les fonctionnalites ReplyFast AI',
  price: 1999, // 19.99€ en centimes
  currency: 'eur',
  interval: 'month',
  trial_days: 30
};

export default async function handler(req, res) {
  // Verification methode
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verification Stripe configure
  if (!stripe) {
    console.error('Stripe not configured');
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  const requestId = `REQ-${Date.now()}`;

  try {
    const { email, userId } = req.body;

    // Validation email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim();

    // Validation format email basique
    if (!sanitizedEmail.includes('@') || sanitizedEmail.length < 5) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log(`[${requestId}] Creating checkout for: ${sanitizedEmail}`);

    // Verifier si le client existe deja dans Stripe
    const customers = await stripe.customers.list({
      email: sanitizedEmail,
      limit: 1
    });

    let customerId;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`[${requestId}] Existing customer: ${customerId}`);
    } else {
      // Creer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email: sanitizedEmail,
        metadata: {
          supabase_user_id: userId || sanitizedEmail,
          created_from: 'replyfast_checkout'
        }
      });
      customerId = customer.id;
      console.log(`[${requestId}] New customer: ${customerId}`);
    }

    // Creer la session Stripe Checkout
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: PLAN_CONFIG.trial_days,
        metadata: {
          user_email: sanitizedEmail
        }
      },
      success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment?canceled=true`,
      metadata: {
        user_email: sanitizedEmail
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto'
      }
    };

    // Utiliser STRIPE_PRICE_ID si configure, sinon creer un prix inline
    if (process.env.STRIPE_PRICE_ID) {
      sessionConfig.line_items = [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1
      }];
    } else {
      sessionConfig.line_items = [{
        price_data: {
          currency: PLAN_CONFIG.currency,
          product_data: {
            name: PLAN_CONFIG.name,
            description: PLAN_CONFIG.description
          },
          unit_amount: PLAN_CONFIG.price,
          recurring: {
            interval: PLAN_CONFIG.interval
          }
        },
        quantity: 1
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`[${requestId}] Checkout session created: ${session.id}`);

    // Mettre a jour Supabase avec l'ID client Stripe
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + PLAN_CONFIG.trial_days);

    await supabase
      .from('clients')
      .update({
        stripe_customer_id: customerId,
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString()
      })
      .eq('email', sanitizedEmail);

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
      trialDays: PLAN_CONFIG.trial_days
    });

  } catch (error) {
    console.error(`[${requestId}] Stripe error:`, error.message);

    // Ne pas exposer les details d'erreur Stripe au client
    res.status(500).json({
      error: 'Payment processing error. Please try again.',
      code: error.code || 'unknown'
    });
  }
}

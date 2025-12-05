import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Créer un SetupIntent Stripe pour enregistrer la carte du client
 * + Créer un abonnement en trial
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email et nom requis' });
    }

    console.log('💳 [SETUP-INTENT] Création pour:', email);

    // 1. Créer ou récupérer le customer Stripe
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('✅ [SETUP-INTENT] Customer existant:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          source: 'replyfast-ai'
        }
      });
      console.log('✅ [SETUP-INTENT] Nouveau customer:', customer.id);
    }

    // 2. Créer un prix si nécessaire (19,99€/mois)
    let price;
    const existingPrices = await stripe.prices.list({
      product: process.env.STRIPE_PRODUCT_ID || 'prod_replyfast_monthly',
      limit: 1
    });

    if (existingPrices.data.length > 0) {
      price = existingPrices.data[0];
    } else {
      // Créer le produit
      const product = await stripe.products.create({
        name: 'ReplyFast AI - Abonnement Mensuel',
        description: 'Assistant IA WhatsApp avec 30 jours d\'essai gratuit'
      });

      // Créer le prix
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1999, // 19,99€
        currency: 'eur',
        recurring: {
          interval: 'month'
        }
      });
    }

    // 3. Créer l'abonnement en trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      trial_period_days: 30,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('✅ [SETUP-INTENT] Subscription créée:', subscription.id);

    // 4. Créer le SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        subscription_id: subscription.id,
        email: email
      }
    });

    console.log('✅ [SETUP-INTENT] SetupIntent créé:', setupIntent.id);

    // 5. Mettre à jour Supabase
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        subscription_status: 'trialing'
      })
      .eq('email', email);

    if (updateError) {
      console.error('⚠️ [SETUP-INTENT] Erreur update Supabase:', updateError);
    }

    return res.status(200).json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('❌ [SETUP-INTENT] Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}

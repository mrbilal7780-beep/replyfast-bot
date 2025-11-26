import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, userId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Vérifier si le client existe déjà dans Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Créer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          supabase_user_id: userId || email
        }
      });
      customerId = customer.id;
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'ReplyFast AI - Abonnement Mensuel',
              description: 'Accès complet à ReplyFast AI avec toutes les fonctionnalités incluses',
            },
            unit_amount: 1999, // 19.99€ en centimes
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 14, // 14 jours d'essai gratuit
        metadata: {
          supabase_user_email: email,
        }
      },
      success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/dashboard`,
      metadata: {
        supabase_user_email: email,
      }
    });

    // Mettre à jour Supabase avec l'ID du client Stripe
    await supabase
      .from('clients')
      .update({
        stripe_customer_id: customerId,
        subscription_status: 'trialing'
      })
      .eq('email', email);

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
}

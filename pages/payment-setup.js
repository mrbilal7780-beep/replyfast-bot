import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Check, Loader, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import dynamic from 'next/dynamic';

const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), {
  ssr: false,
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ user, client }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Créer un SetupIntent sur le serveur
      const setupRes = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: `${client.first_name} ${client.last_name}`
        })
      });

      if (!setupRes.ok) {
        const errorData = await setupRes.json();
        throw new Error(errorData.error || 'Erreur serveur');
      }

      const { clientSecret, customerId, subscriptionId } = await setupRes.json();

      // 2. Confirmer le paiement avec Stripe
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${client.first_name} ${client.last_name}`,
            email: user.email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 3. Mettre à jour le client dans Supabase
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'trialing'
        })
        .eq('email', user.email);

      if (updateError) {
        console.error('Erreur mise à jour client:', updateError);
      }

      setSuccess(true);

      // Rediriger vers dashboard après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Erreur paiement:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Carte enregistrée avec succès !
        </h2>
        <p className="text-gray-400 mb-6">
          Votre période d'essai de 30 jours commence maintenant.
        </p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Redirection vers le dashboard...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info période d'essai */}
      <div className="glass p-6 rounded-2xl bg-primary/10 border border-primary/30">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="text-white font-semibold mb-2">
              🎁 30 jours d'essai gratuit
            </p>
            <p className="text-gray-400 text-sm">
              Votre carte ne sera pas débitée pendant la période d'essai.
              Vous pourrez annuler à tout moment avant la fin de l'essai.
            </p>
          </div>
        </div>
      </div>

      {/* Champ carte */}
      <div>
        <label className="block text-white font-semibold mb-3">
          Informations de carte
        </label>
        <div className="glass p-4 rounded-xl border border-white/10 focus-within:border-primary transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  '::placeholder': {
                    color: '#6b7280',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Prix */}
      <div className="glass p-4 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Abonnement mensuel</span>
          <span className="text-white font-semibold">19,99€/mois</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Aujourd'hui</span>
          <span className="text-2xl font-bold text-green-500">0,00€</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Premier paiement le {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Enregistrer ma carte
          </>
        )}
      </button>

      {/* Sécurité */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Shield className="w-4 h-4" />
        <span>Paiement sécurisé par Stripe</span>
      </div>
    </form>
  );
}

export default function PaymentSetup() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Charger les infos client
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle();

      if (clientData) {
        setClient(clientData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur checkUser:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0e27' }}>
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ backgroundColor: '#0a0e27' }}>
      <ThreeBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="glass p-8 rounded-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Enregistrer votre carte
            </h1>
            <p className="text-gray-400">
              Pour continuer après votre période d'essai
            </p>
          </div>

          {/* Stripe Form */}
          <Elements stripe={stripePromise}>
            <PaymentForm user={user} client={client} />
          </Elements>

          {/* Skip */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-6 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Configurer plus tard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CreditCard, X, Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SubscriptionBanner({ subscriptionStatus, trialEndsAt, userEmail }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Calculer les jours restants
  const getDaysRemaining = () => {
    if (!trialEndsAt) return 0;
    const now = new Date();
    const end = new Date(trialEndsAt);
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemaining = getDaysRemaining();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setLoading(false);
    }
  };

  // Ne pas afficher si l'abonnement est actif
  if (subscriptionStatus === 'active' || dismissed) {
    return null;
  }

  // Bannière pour période d'essai
  if (subscriptionStatus === 'trialing' && daysRemaining > 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass p-4 rounded-xl bg-accent/10 border border-accent/30 mb-6 relative"
        >
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">
                Essai gratuit actif
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                {daysRemaining === 1
                  ? 'Dernier jour d\'essai ! '
                  : `${daysRemaining} jours restants. `}
                Profitez de toutes les fonctionnalités gratuitement.
              </p>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-accent to-primary rounded-lg text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Activer maintenant et économiser'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Bannière pour abonnement expiré / inactif
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6"
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              Abonnement requis
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Votre période d'essai est terminée. Activez votre abonnement pour continuer à utiliser ReplyFast AI.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'Chargement...' : 'S\'abonner maintenant - 19,99€/mois'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CreditCard, Clock } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

/**
 * 🔔 Bannière d'alerte d'expiration d'essai
 *
 * Affiche une bannière en haut de l'application quand:
 * - Il reste 7 jours ou moins dans la période d'essai
 * - L'utilisateur n'a pas encore ajouté de moyen de paiement
 */
export default function TrialExpiryBanner({ client }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkTrialStatus();
  }, [client]);

  const checkTrialStatus = () => {
    if (!client || dismissed) return;

    // Vérifier si en période d'essai
    if (client.subscription_status !== 'trialing') {
      setVisible(false);
      return;
    }

    // Vérifier si un moyen de paiement est déjà configuré
    if (client.stripe_customer_id && client.subscription_status === 'trialing') {
      // A déjà configuré le paiement, pas besoin d'alerte
      setVisible(false);
      return;
    }

    // Calculer les jours restants
    if (client.trial_ends_at) {
      const now = new Date();
      const trialEnd = new Date(client.trial_ends_at);
      const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

      setDaysLeft(daysRemaining);

      // Afficher la bannière si 7 jours ou moins
      if (daysRemaining <= 7 && daysRemaining > 0) {
        setVisible(true);
      } else if (daysRemaining <= 0) {
        // Essai expiré
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  const handleAddPayment = () => {
    router.push('/payment-setup');
  };

  if (!visible || dismissed) return null;

  // Déterminer le niveau d'urgence
  const isUrgent = daysLeft <= 3;
  const isExpired = daysLeft <= 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-0 left-0 right-0 z-50 ${
            isExpired ? 'bg-red-600' : isUrgent ? 'bg-orange-600' : 'bg-blue-600'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Icône + Message */}
              <div className="flex items-center gap-3 flex-1">
                {isExpired ? (
                  <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
                ) : (
                  <Clock className="w-6 h-6 text-white flex-shrink-0 animate-pulse" />
                )}

                <div className="flex-1">
                  {isExpired ? (
                    <p className="text-white font-semibold text-sm md:text-base">
                      ⚠️ Votre essai gratuit est terminé. Ajoutez un moyen de paiement pour continuer à utiliser ReplyFast AI.
                    </p>
                  ) : (
                    <p className="text-white font-semibold text-sm md:text-base">
                      {daysLeft === 1 ? (
                        <>⏰ <strong>Dernier jour</strong> d'essai gratuit ! Ajoutez votre paiement pour garder votre IA active 24/7.</>
                      ) : (
                        <>🔔 Plus que <strong>{daysLeft} jours</strong> d'essai gratuit. N'oubliez pas d'ajouter votre moyen de paiement !</>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddPayment}
                  className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajouter paiement</span>
                  <span className="sm:hidden">Payer</span>
                </motion.button>

                {!isExpired && (
                  <button
                    onClick={handleDismiss}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

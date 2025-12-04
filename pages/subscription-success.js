import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Compte à rebours avant redirection
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="fixed inset-0 gradient-bg opacity-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="glass p-12 rounded-3xl text-center">
          {/* Icône de succès animée */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Bienvenue dans ReplyFast AI
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-xl text-gray-300">
              Votre essai gratuit de 14 jours commence maintenant
            </p>

            <div className="glass p-6 rounded-xl bg-accent/5 border border-accent/20">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div className="text-left text-sm text-gray-300 space-y-2">
                  <p className="font-semibold text-white">Ce que vous obtenez :</p>
                  <ul className="space-y-1">
                    <li>✓ Réponses IA illimitées (GPT-4o-mini optimisé)</li>
                    <li>✓ Gestion automatique des rendez-vous</li>
                    <li>✓ Menu Manager avec IA</li>
                    <li>✓ Analytics avancées</li>
                    <li>✓ Support prioritaire 24/7</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              Après 14 jours, vous serez facturé 19,99€/mois.
              <br />
              Vous pouvez annuler à tout moment depuis vos paramètres.
            </p>
          </motion.div>

          {/* Bouton de redirection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 space-y-4"
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Accéder au Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-gray-500 text-sm">
              Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';

const FuturisticBackground = dynamic(() => import('../components/FuturisticBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />
});

// Messages multi-langues qui défilent
const confirmationMessages = [
  { lang: 'Francais', flag: 'FR', text: 'Verifiez votre email' },
  { lang: 'English', flag: 'EN', text: 'Check your email' },
  { lang: 'Espanol', flag: 'ES', text: 'Verifica tu correo' },
  { lang: 'Deutsch', flag: 'DE', text: 'Prufen Sie Ihre E-Mail' },
  { lang: 'Italiano', flag: 'IT', text: 'Controlla la tua email' },
  { lang: 'Portugues', flag: 'PT', text: 'Verifique seu email' },
  { lang: 'Arabic', flag: 'AR', text: 'تحقق من بريدك الإلكتروني' },
  { lang: 'Chinese', flag: 'CN', text: '检查您的电子邮件' },
  { lang: 'Japanese', flag: 'JP', text: 'メールを確認してください' },
  { lang: 'Korean', flag: 'KR', text: '이메일을 확인하세요' },
  { lang: 'Russian', flag: 'RU', text: 'Проверьте вашу почту' },
  { lang: 'Hindi', flag: 'IN', text: 'अपना ईमेल जांचें' }
];

export default function EmailConfirmation() {
  const router = useRouter();
  const { email } = router.query;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [checking, setChecking] = useState(false);

  // Animation des messages qui défilent
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % confirmationMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Vérifier si l'email a été confirmé
  useEffect(() => {
    if (!email) return;

    const checkConfirmation = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/onboarding');
        }
      } catch (err) {
        console.error('Check confirmation error:', err);
      }
    };

    // Vérifier toutes les 5 secondes
    const interval = setInterval(checkConfirmation, 5000);
    return () => clearInterval(interval);
  }, [email, router]);

  const handleResendEmail = async () => {
    if (!email || resending) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error('Resend email error:', err);
    } finally {
      setResending(false);
    }
  };

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/onboarding');
      } else {
        // Afficher un message temporaire
        setTimeout(() => setChecking(false), 1500);
      }
    } catch (err) {
      console.error('Check error:', err);
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <FuturisticBackground />
      <div className="fixed inset-0 bg-black/70 pointer-events-none z-[1]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        {/* Animated envelope icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 inline-block"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
              <Mail className="w-12 h-12 text-primary" />
            </div>
            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-primary/50"
            />
          </div>
        </motion.div>

        {/* Main card */}
        <div className="bg-gray-900/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl border border-white/10">
          {/* Rotating messages */}
          <div className="h-20 mb-6 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {confirmationMessages[currentIndex].text}
                </p>
                <p className="text-sm text-gray-500">
                  {confirmationMessages[currentIndex].flag} - {confirmationMessages[currentIndex].lang}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-8">
            {confirmationMessages.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i === currentIndex ? 'bg-primary' : 'bg-gray-700'
                }`}
                animate={i === currentIndex ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>

          {/* Email display */}
          {email && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Email envoye a:</p>
              <p className="text-white font-medium break-all">{email}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-gray-400 text-sm mb-8 space-y-2">
            <p>Nous avons envoye un lien de confirmation a votre adresse email.</p>
            <p>Cliquez sur le lien pour activer votre compte.</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              onClick={handleCheckNow}
              disabled={checking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verification...
                </>
              ) : (
                <>
                  J'ai confirme mon email
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <button
              onClick={handleResendEmail}
              disabled={resending || resendSuccess}
              className="w-full py-3 border border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : resendSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Email renvoye !
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Renvoyer l'email
                </>
              )}
            </button>
          </div>

          {/* Help text */}
          <p className="text-gray-500 text-xs mt-6">
            Verifiez votre dossier spam si vous ne voyez pas l'email.
          </p>
        </div>

        {/* Back to login */}
        <button
          onClick={() => router.push('/login')}
          className="mt-6 text-gray-500 hover:text-white transition-colors text-sm"
        >
          Retour a la connexion
        </button>
      </motion.div>
    </div>
  );
}

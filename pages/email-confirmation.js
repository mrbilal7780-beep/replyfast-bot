import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Import dynamique du background
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), {
  ssr: false,
});

export default function EmailConfirmation() {
  const router = useRouter();
  const { email } = router.query;
  const [currentLangIndex, setCurrentLangIndex] = useState(0);

  const messages = [
    { lang: 'Français', text: '📧 Vérifiez votre boîte email pour confirmer votre compte' },
    { lang: 'English', text: '📧 Check your email inbox to confirm your account' },
    { lang: 'Español', text: '📧 Revisa tu bandeja de entrada para confirmar tu cuenta' },
    { lang: 'Deutsch', text: '📧 Überprüfen Sie Ihre E-Mails, um Ihr Konto zu bestätigen' },
    { lang: 'Italiano', text: '📧 Controlla la tua casella di posta per confermare il tuo account' },
    { lang: 'Português', text: '📧 Verifique sua caixa de entrada para confirmar sua conta' },
    { lang: 'العربية', text: '📧 تحقق من بريدك الإلكتروني لتأكيد حسابك' },
    { lang: '中文', text: '📧 检查您的电子邮件以确认您的帐户' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLangIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ backgroundColor: '#0a0e27' }}>
      <ThreeBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass p-8 rounded-3xl text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Compte créé avec succès !
          </h1>

          {/* Email */}
          {email && (
            <p className="text-gray-400 mb-8">
              Un email de confirmation a été envoyé à <br />
              <span className="text-primary font-semibold">{email}</span>
            </p>
          )}

          {/* Message défilant multilingue */}
          <div className="relative h-24 overflow-hidden mb-8">
            <motion.div
              key={currentLangIndex}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="text-sm text-gray-500 mb-2">{messages[currentLangIndex].lang}</p>
              <p className="text-lg text-white font-semibold px-4">
                {messages[currentLangIndex].text}
              </p>
            </motion.div>
          </div>

          {/* Instructions */}
          <div className="glass p-6 rounded-2xl bg-white/5 mb-6 text-left">
            <div className="flex items-start gap-4 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1">Étape 1</p>
                <p className="text-gray-400 text-sm">
                  Ouvrez votre boîte email et trouvez l'email de ReplyFast AI
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1">Étape 2</p>
                <p className="text-gray-400 text-sm">
                  Cliquez sur le lien de confirmation dans l'email
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1">Étape 3</p>
                <p className="text-gray-400 text-sm">
                  Connectez-vous pour commencer votre configuration
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            Se connecter
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Note */}
          <p className="text-gray-500 text-sm mt-6">
            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{' '}
            <button className="text-primary hover:underline">
              renvoyer l'email
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

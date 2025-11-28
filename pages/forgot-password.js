import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6">
        <div className="fixed inset-0 gradient-bg opacity-10"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md text-center"
        >
          <div className="glass p-8 rounded-3xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Email envoyé !
            </h1>

            <p className="text-gray-400 mb-8">
              Un email de réinitialisation a été envoyé à <span className="text-white font-semibold">{email}</span>.
              Vérifiez votre boîte de réception et suivez les instructions.
            </p>

            <p className="text-gray-500 text-sm mb-8">
              Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform"
            >
              Retour à la connexion
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="fixed inset-0 gradient-bg opacity-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </button>

        {/* Card */}
        <div className="glass p-8 rounded-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-gray-400">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="vous@exemple.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Vous vous souvenez de votre mot de passe ?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-primary hover:text-secondary transition-colors"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Besoin d'aide ? Contactez-nous à{' '}
          <a href="mailto:support@replyfast.ai" className="text-accent hover:underline">
            support@replyfast.ai
          </a>
        </div>
      </motion.div>
    </div>
  );
}

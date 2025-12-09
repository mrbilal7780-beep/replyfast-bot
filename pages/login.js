import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';

const FuturisticBackground = dynamic(() => import('../components/FuturisticBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />
});

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Verifier si l'utilisateur est deja connecte
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verifier si le profil est complete
        const { data: client } = await supabase
          .from('clients')
          .select('profile_completed')
          .eq('email', session.user.email)
          .maybeSingle();

        if (client?.profile_completed) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    };
    checkSession();
  }, [router]);

  // Verifier le lockout
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null);
        setAttempts(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const getRemainingLockoutTime = () => {
    if (!lockoutUntil) return 0;
    return Math.ceil((lockoutUntil - Date.now()) / 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifier le lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      setError(`Trop de tentatives. Reessayez dans ${getRemainingLockoutTime()} secondes.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sanitize input
      const sanitizedEmail = formData.email.toLowerCase().trim();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: formData.password,
      });

      if (signInError) {
        // Incrementer les tentatives
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        // Lockout apres 5 tentatives
        if (newAttempts >= 5) {
          const lockout = Date.now() + 60000; // 1 minute
          setLockoutUntil(lockout);
          throw new Error('Trop de tentatives. Compte bloque pour 1 minute.');
        }

        throw signInError;
      }

      // Reset attempts on success
      setAttempts(0);

      // Verifier si le profil est complete
      const { data: client } = await supabase
        .from('clients')
        .select('profile_completed')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (client?.profile_completed) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err) {
      let errorMessage = err.message;

      // Traduire les erreurs communes
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
      <FuturisticBackground />
      <div className="fixed inset-0 bg-black/60 pointer-events-none z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-white">Reply</span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Fast</span>
              <span className="text-white/60 ml-1 text-xl">AI</span>
            </h1>
            <p className="text-gray-400">Connectez-vous a votre compte</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Lockout warning */}
          {lockoutUntil && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-orange-500/10 border border-orange-500/30 text-orange-400 p-4 rounded-xl mb-6 text-center"
            >
              <p>Compte temporairement bloque</p>
              <p className="text-2xl font-bold mt-1">{getRemainingLockoutTime()}s</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="vous@exemple.com"
                  disabled={lockoutUntil !== null}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Votre mot de passe"
                  disabled={lockoutUntil !== null}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Mot de passe oublie?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutUntil !== null}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center text-gray-400">
            Pas encore de compte?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-primary hover:text-secondary transition-colors"
            >
              Creer un compte
            </button>
          </div>

          {/* Attempts indicator */}
          {attempts > 0 && attempts < 5 && !lockoutUntil && (
            <p className="text-center text-orange-400/70 text-xs mt-4">
              {5 - attempts} tentative(s) restante(s)
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

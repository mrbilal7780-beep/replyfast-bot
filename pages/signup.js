import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

const FuturisticBackground = dynamic(() => import('../components/FuturisticBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Messages multi-langues pour l'animation
const loadingMessages = [
  { lang: 'fr', text: 'Creation de votre compte...' },
  { lang: 'en', text: 'Creating your account...' },
  { lang: 'es', text: 'Creando tu cuenta...' },
  { lang: 'de', text: 'Konto wird erstellt...' },
  { lang: 'it', text: 'Creazione del tuo account...' },
  { lang: 'pt', text: 'Criando sua conta...' },
  { lang: 'ar', text: '...جاري إنشاء حسابك' },
  { lang: 'zh', text: '正在创建您的账户...' }
];

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Animation des messages pendant le chargement
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  // Debounce pour la verification email
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Verifier si l'email existe deja
  const checkEmailExists = useCallback(
    debounce(async (email) => {
      if (!email || !email.includes('@')) {
        setEmailError('');
        setEmailValid(false);
        return;
      }

      setCheckingEmail(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('email')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle();

        if (data) {
          setEmailError('Cet email est deja utilise');
          setEmailValid(false);
        } else {
          setEmailError('');
          setEmailValid(true);
        }
      } catch (err) {
        console.error('Email check error:', err);
      } finally {
        setCheckingEmail(false);
      }
    }, 500),
    []
  );

  // Calculer la force du mot de passe
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    setEmailValid(false);
    checkEmailExists(email);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validations
      if (emailError) {
        throw new Error('Veuillez utiliser une autre adresse email');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (formData.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caracteres');
      }

      // Sanitization
      const sanitizedEmail = formData.email.toLowerCase().trim();
      const sanitizedFirstName = formData.firstName.trim().replace(/[<>]/g, '');
      const sanitizedLastName = formData.lastName.trim().replace(/[<>]/g, '');

      // 1. Creer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: formData.password,
        options: {
          data: {
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName
          }
        }
      });

      if (authError) throw authError;

      // 2. Creer le client dans la table clients (30 jours d'essai)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      const { error: insertError } = await supabase
        .from('clients')
        .insert([
          {
            email: sanitizedEmail,
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
            subscription_status: 'trialing',
            trial_ends_at: trialEndsAt.toISOString(),
            profile_completed: false,
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        // Handle duplicate email error gracefully
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
          throw new Error('Cette adresse email est déjà utilisée. Essayez de vous connecter.');
        }
        throw insertError;
      }

      // Rediriger vers la page de confirmation email
      router.push('/email-confirmation?email=' + encodeURIComponent(sanitizedEmail));
    } catch (err) {
      // Format error messages for user
      let errorMessage = err.message;
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique constraint')) {
        errorMessage = 'Cette adresse email est déjà utilisée. Essayez de vous connecter.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Un compte existe déjà avec cet email. Essayez de vous connecter.';
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Faible';
    if (passwordStrength <= 2) return 'Moyen';
    if (passwordStrength <= 3) return 'Bon';
    return 'Excellent';
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
            <p className="text-gray-400">Creez votre compte</p>
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

          {/* Loading Overlay */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mb-6"
              />
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white text-lg font-medium"
              >
                {loadingMessages[currentMessageIndex].text}
              </motion.p>
              <p className="text-gray-500 text-sm mt-2">
                {loadingMessages[currentMessageIndex].lang.toUpperCase()}
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Prenom</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Jean"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Dupont"
                />
              </div>
            </div>

            {/* Email with real-time validation */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`w-full bg-white/5 border rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    emailError ? 'border-red-500/50 focus:border-red-500' :
                    emailValid ? 'border-green-500/50 focus:border-green-500' :
                    'border-white/10 focus:border-primary'
                  }`}
                  placeholder="vous@exemple.com"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checkingEmail && (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {!checkingEmail && emailValid && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {!checkingEmail && emailError && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              {emailError && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">{emailError}</p>
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-primary text-sm mt-1 hover:underline"
                  >
                    Se connecter a la place
                  </button>
                </div>
              )}
            </div>

            {/* Password with strength indicator */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Min. 6 caracteres"
                />
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Force: <span className={passwordStrength >= 4 ? 'text-green-400' : 'text-gray-400'}>{getPasswordStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirmer</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full bg-white/5 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500/50'
                      : 'border-white/10 focus:border-primary'
                  }`}
                  placeholder="Confirmer le mot de passe"
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || emailError || !emailValid}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mt-6"
            >
              Creer mon compte
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-gray-400">
            Deja un compte?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary hover:text-secondary transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>

        {/* Trial Badge */}
        <div className="text-center mt-6 text-sm text-gray-500">
          1 mois d'essai gratuit - Sans carte bancaire
        </div>
      </motion.div>
    </div>
  );
}

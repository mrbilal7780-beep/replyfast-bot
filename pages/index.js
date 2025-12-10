import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles, X, Check, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';

// Import dynamique du background 3D futuriste (client-side only)
const FuturisticBackground = dynamic(() => import('../components/FuturisticBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />
});

export default function Home() {
  const router = useRouter();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ne pas rediriger automatiquement - laisser l'utilisateur voir la landing page
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Fade in effect
    const timer = setTimeout(() => setIsLoading(false), 500);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: client, error } = await supabase
          .from('clients')
          .select('profile_completed')
          .eq('email', session.user.email)
          .maybeSingle();

        if (error) {
          console.error('Erreur checkUser:', error);
          return;
        }

        if (client?.profile_completed) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (error) {
      console.error('Erreur dans checkUser:', error);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-black">
      {/* Fond 3D Futuriste */}
      <FuturisticBackground />

      {/* Overlay gradient pour lisibilité */}
      <div className="fixed inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none z-[1]" />
      <div className="fixed inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none z-[1]" />

      {/* Logo fixe en haut à gauche */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed top-6 left-6 md:top-8 md:left-8 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="text-2xl md:text-3xl font-black tracking-tight cursor-pointer"
          onClick={() => router.push('/')}
        >
          <span className="text-white font-light">REPLY</span>
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-black">FAST</span>
          <span className="text-white/60 ml-1 text-lg">AI</span>
        </motion.div>
      </motion.div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-end items-center p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4">
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setShowAboutModal(true)}
            className="text-white/70 hover:text-white transition-colors text-sm md:text-base px-4 py-2"
          >
            A propos
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => router.push('/login')}
            className="border border-white/20 hover:border-primary/50 px-5 py-2 rounded-full text-white hover:text-primary transition-all text-sm md:text-base backdrop-blur-sm"
          >
            Connexion
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl">
          {/* Small text above */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-4"
          >
            <span className="text-primary/80 text-sm md:text-base tracking-[0.3em] uppercase font-light">
              Here and Now
            </span>
          </motion.div>

          {/* Main title - FUTURE style */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              F
            </span>
            <span className="text-white">UTUR</span>
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              E
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xl md:text-2xl text-white/80 mb-4 font-light leading-relaxed"
          >
            Votre commerce{' '}
            <span className="text-primary font-medium">ouvert 24/7</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-gray-400 text-base md:text-lg mb-10 max-w-lg leading-relaxed"
          >
            L'intelligence artificielle qui repond a vos clients pendant que vous dormez.
            Simple, efficace, abordable.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.button
              onClick={() => router.push('/signup')}
              whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(99, 102, 241, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold text-lg overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ transform: "skewX(-20deg)" }}
                initial={{ x: "-200%" }}
                whileHover={{ x: "200%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative flex items-center justify-center gap-2">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <button
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 border border-white/20 rounded-xl text-white font-medium text-lg hover:bg-white/5 transition-all"
            >
              Decouvrir
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-gray-500 mt-6 text-sm"
          >
            1 mois gratuit &bull; Sans engagement &bull; Configuration en 5 min
          </motion.p>
        </div>
      </div>

      {/* Bottom tags - like in the image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-8 left-6 md:left-8 z-10 flex gap-8"
      >
        <div>
          <p className="text-white/40 text-xs tracking-widest uppercase mb-1">Technology</p>
          <p className="text-white/70 text-sm">GPT-4 Powered</p>
        </div>
        <div>
          <p className="text-white/40 text-xs tracking-widest uppercase mb-1">Innovation</p>
          <p className="text-white/70 text-sm">WhatsApp AI</p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-8 right-8 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => scrollToSection('features')}
          className="cursor-pointer"
        >
          <ChevronDown className="w-6 h-6 text-white/40 hover:text-white transition-colors" />
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi <span className="text-primary">ReplyFast</span> ?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              La technologie au service de votre business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Reponses instantanees",
                description: "Votre IA repond 24h/24, meme a 3h du matin. Vos clients ne restent jamais sans reponse."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "100% Securise",
                description: "Cryptage de niveau bancaire. Donnees protegees et conformes RGPD."
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "IA Intelligente",
                description: "Comprend le contexte, s'adapte a votre secteur d'activite et apprend de chaque conversation."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all hover:bg-white/[0.07]"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-32 px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-10 md:p-14 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl"
        >
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 bg-primary/20 rounded-full mb-6">
              <span className="text-primary text-sm font-medium">Offre de lancement</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Un seul prix, tout inclus
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Pas de surprises, pas de frais caches. Tout est inclus.
            </p>
          </div>

          <div className="text-center mb-10">
            <div className="text-7xl md:text-8xl font-black mb-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                19,99
              </span>
              <span className="text-white/60 text-3xl font-normal">/mois</span>
            </div>
            <p className="text-gray-500">soit 0,66/jour</p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-4 mb-10">
            {[
              "Reponses IA illimitees",
              "Gestion automatique des RDV",
              "Menu Manager intelligent",
              "20+ secteurs supportes",
              "Analytics avances",
              "Assistant IA personnel",
              "Integration WhatsApp Business",
              "Support prioritaire 24/7",
              "Mises a jour automatiques",
              "Securite niveau bancaire"
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-gray-300">{item}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={() => router.push('/signup')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            Commencer l'essai gratuit
          </motion.button>

          <p className="text-center text-gray-500 text-sm mt-6">
            1 mois d'essai gratuit &bull; Annulation en 1 clic
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                ReplyFast AI
              </h3>
              <p className="text-gray-500 text-sm">
                L'IA au service de votre business
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>
                  <button onClick={() => router.push('/cgv')} className="hover:text-white transition-colors">
                    CGV
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/privacy')} className="hover:text-white transition-colors">
                    Confidentialite
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>
                  <a href="mailto:support@replyfast.ai" className="hover:text-white transition-colors">
                    support@replyfast.ai
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>
                  <button onClick={() => setShowAboutModal(true)} className="hover:text-white transition-colors">
                    A propos
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-gray-600 text-sm">
            <p>Copyright 2025 ReplyFast AI - Tous droits reserves</p>
          </div>
        </div>
      </footer>

      {/* Modal A propos */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowAboutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl w-full p-8 rounded-2xl bg-gray-900/90 border border-white/10 backdrop-blur-xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowAboutModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-white">
                A propos de ReplyFast AI
              </h2>

              <div className="space-y-6 text-gray-300">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                    RF
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Fondateur</h3>
                    <p className="text-primary">Entrepreneur passionne</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Notre Mission</h3>
                  <p className="leading-relaxed text-gray-400">
                    Democratiser l'intelligence artificielle pour les PME.
                    Chaque commerce merite les meilleures technologies, sans complexite ni couts prohibitifs.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Nos Valeurs</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span><strong className="text-white">Innovation</strong> - Technologies de pointe accessibles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span><strong className="text-white">Simplicite</strong> - Configuration en 5 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span><strong className="text-white">Performance</strong> - Resultats mesurables</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

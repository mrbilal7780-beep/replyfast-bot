import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles, X, Check, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';

// Import dynamique du background (client-side only)
const ParticlesBackground = dynamic(() => import('../components/ParticlesBackground'), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    checkUser();

    // Détecter si mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
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
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Fond futuriste sombre */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        {/* Grille subtile futuriste */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        {/* Points lumineux subtils */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: 'rgba(99, 102, 241, 0.3)'
              }}
              animate={{
                opacity: [0.1, 0.4, 0.1],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navbar - Responsive */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-3xl md:text-5xl font-black tracking-tight"
          style={{ fontFamily: "'Orbitron', 'Rajdhani', sans-serif" }}
        >
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-2xl">
            REPLYFAST
          </span>
          <span className="text-white ml-2">AI</span>
        </motion.div>

        <div className="flex items-center gap-2 md:gap-4">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowAboutModal(true)}
            className="text-white hover:text-accent transition-colors text-sm md:text-base"
          >
            À propos
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => router.push('/login')}
            className="glass px-4 md:px-6 py-2 rounded-full text-white hover:scale-105 transition-transform text-sm md:text-base"
          >
            Se connecter
          </motion.button>
        </div>
      </nav>

      {/* Hero Section - Optimized padding for mobile */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          {/* Badge essai gratuit - Design sobre et pro */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex flex-col gap-3 items-center mb-8"
          >
            <div className="glass px-8 py-3 rounded-2xl border border-primary/30 backdrop-blur-xl">
              <p className="text-xl md:text-2xl font-bold text-white text-center tracking-wide">
                1 MOIS D'ESSAI GRATUIT
              </p>
              <p className="text-center text-gray-400 text-sm mt-1">
                Carte bancaire requise • Annulation en un clic
              </p>
            </div>

            <div className="glass px-6 py-2 rounded-full border border-white/10">
              <span className="text-sm font-medium text-gray-300">Intelligence Artificielle Avancée</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-white">Votre commerce</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ouvert 24/7
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl text-white/90 mb-8"
          >
            Pendant que vous dormez, notre IA travaille
          </motion.h2>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            <p className="mb-4">
              ReplyFast AI est la solution nouvelle génération qui révolutionne la gestion client.
              Conçue avec les dernières technologies d'intelligence artificielle, notre plateforme
              offre des performances maximales à un prix minimal.
            </p>
            <p className="mb-4">
              Pas de choix compliqués, pas de tiers multiples : ici, tous les utilisateurs
              bénéficient du meilleur, au même prix.
            </p>
            <p className="text-accent/80 italic">
              Comme le disait Alan Turing : "Nous ne pouvons voir que peu devant nous,
              mais nous voyons tant à faire." C'est exactement notre vision.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => router.push('/signup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-12 py-5 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl text-white font-bold text-xl shadow-2xl border border-white/20 overflow-hidden"
            >
              {/* Animation brillance au hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ transform: "skewX(-20deg)" }}
                initial={{ x: "-200%" }}
                whileHover={{ x: "200%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative flex items-center gap-3">
                <span>Commencer l'essai gratuit</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>

            <button
              onClick={() => scrollToSection('details')}
              className="glass px-8 py-4 rounded-full text-white font-semibold text-lg hover:scale-105 transition-transform"
            >
              En savoir plus
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-500 mt-4 text-sm"
          >
            Carte bancaire requise • Annulation en un clic
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          id="details"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mt-32"
        >
          {[
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Réponses instantanées",
              description: "Bot répond 24/7, même à 3h du matin. Vos clients ne restent jamais sans réponse."
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "100% Sécurisé",
              description: "Vos données protégées par cryptage de niveau bancaire. Conforme RGPD."
            },
            {
              icon: <Sparkles className="w-8 h-8" />,
              title: "IA Intelligente",
              description: "Intelligence artificielle avancée qui comprend le contexte et s'adapte à votre business."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="glass p-8 rounded-3xl hover:scale-105 transition-transform group"
            >
              <div className="text-accent mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="glass max-w-4xl mx-auto mt-32 p-12 rounded-3xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Un seul prix, tout inclus
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Chez ReplyFast AI, nous croyons en la simplicité. Pas de tiers cachés,
              pas d'options payantes. Vous payez uniquement pour encourager l'innovation
              et maintenir le service. La puissance de l'IA est la même pour tous.
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="inline-block px-6 py-2 bg-accent/20 rounded-full mb-6">
              <span className="text-accent font-semibold">Offre de lancement</span>
            </div>

            <div className="text-7xl font-bold mb-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                19,99€
              </span>
            </div>
            <div className="text-gray-400 text-xl mb-2">par mois</div>
            <div className="text-gray-500">0,66€/jour seulement</div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 mb-10">
            {[
              "Réponses IA illimitées avec intelligence artificielle avancée",
              "Gestion automatique des rendez-vous avec calendrier intelligent",
              "Menu Manager avec apprentissage en temps réel",
              "Multi-secteurs (20+ activités supportées)",
              "Analytics avancées avec projections IA",
              "Assistant IA personnel pour conseils business",
              "Intégration WhatsApp Business officielle (Meta API)",
              "Base de données clients intelligente",
              "Notifications en temps réel",
              "Support prioritaire 24/7",
              "Mises à jour automatiques",
              "Sécurité cryptée de niveau bancaire",
              "Backup quotidien de vos données",
              "99.9% de disponibilité garantie"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/signup')}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-semibold text-lg hover:scale-105 transition-transform shadow-lg"
          >
            Commencer maintenant
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            1 mois d'essai gratuit • Carte bancaire requise • Annulation en un clic
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center mt-20"
        >
          <ChevronDown className="w-8 h-8 text-accent/50 animate-bounce" />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                ReplyFast AI
              </h3>
              <p className="text-gray-400 text-sm">
                Innovation et excellence
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button onClick={() => router.push('/cgv')} className="hover:text-accent transition-colors">
                    CGV
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/privacy')} className="hover:text-accent transition-colors">
                    Politique de confidentialité
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/partners')} className="hover:text-accent transition-colors">
                    Technologies partenaires
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="mailto:support@replyfast.ai" className="hover:text-accent transition-colors">
                    support@replyfast.ai
                  </a>
                </li>
                <li>
                  <button className="hover:text-accent transition-colors">
                    Documentation
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button
                    onClick={() => setShowAboutModal(true)}
                    className="hover:text-accent transition-colors"
                  >
                    À propos
                  </button>
                </li>
                <li>
                  <button className="hover:text-accent transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
            <p>Copyright © 2025 ReplyFast AI</p>
            <p className="mt-2">Tous droits réservés</p>
          </div>
        </div>
      </footer>

      {/* Modal À propos - Responsive */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowAboutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-w-2xl w-full p-4 sm:p-6 md:p-8 rounded-3xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowAboutModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pr-10">
                À propos de ReplyFast AI
              </h2>

              <div className="space-y-4 sm:space-y-6 text-gray-300 text-sm sm:text-base">
                {/* Photo du fondateur - Responsive */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-white flex-shrink-0">
                    RF
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Fondateur</h3>
                    <p className="text-accent text-sm sm:text-base">Entrepreneur passionné</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Notre Mission</h3>
                  <p className="leading-relaxed">
                    ReplyFast AI est née de la volonté de démocratiser l'intelligence artificielle
                    pour les petites et moyennes entreprises. Nous croyons que chaque commerce
                    mérite d'avoir accès aux meilleures technologies, sans complexité ni coûts prohibitifs.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Nos Valeurs</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed"><strong>Innovation :</strong> Technologies de pointe accessibles à tous</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed"><strong>Simplicité :</strong> Interface intuitive, configuration en minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed"><strong>Performance :</strong> Résultats mesurables et ROI rapide</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Contact</h3>
                  <p className="leading-relaxed">
                    Email : <a href="mailto:support@replyfast.ai" className="text-accent hover:underline break-all">
                      support@replyfast.ai
                    </a>
                  </p>
                  <p className="mt-2 leading-relaxed">
                    Nous sommes une équipe passionnée dédiée à votre succès.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

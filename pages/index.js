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
    <div className="min-h-screen overflow-hidden relative" style={{ backgroundColor: '#000000' }}>
      {/* Particles animated background */}
      <ParticlesBackground />

      {/* Top navigation / logo */}
      <nav className="relative z-50 flex justify-between items-center p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}> 
          <div className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: "'Orbitron', 'Rajdhani', sans-serif" }}>
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">REPLYFAST</span>
            <span className="text-white ml-2">AI</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => scrollToSection('features')} className="text-sm text-white hover:text-accent">Fonctionnalités</button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-white hover:text-accent">Comment ça marche</button>
          <button onClick={() => scrollToSection('pricing')} className="text-sm text-white hover:text-accent">Tarifs</button>
          <button onClick={() => scrollToSection('faq')} className="text-sm text-white hover:text-accent">FAQ</button>
          <button onClick={() => setShowAboutModal(true)} className="text-sm text-white hover:text-accent">À propos</button>
          <button onClick={() => router.push('/login')} className="glass px-4 py-2 rounded-full text-white">Se connecter</button>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-40 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Votre commerce ouvert 24/7 avec ReplyFast AI</h1>
          <p className="text-gray-300 max-w-3xl mx-auto mb-8">Automatisez vos réponses, prenez des rendez-vous, gérez vos menus et augmentez vos ventes — tout en offrant une expérience client humaine et personnalisée.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => router.push('/signup')} className="px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-2xl text-white font-semibold">Essayer 1 mois gratuit</button>
            <button onClick={() => scrollToSection('how-it-works')} className="glass px-6 py-3 rounded-full text-white">Voir comment ça marche</button>
          </div>

          <div className="mt-8 text-gray-400 text-sm">Pas de frais cachés • Annulation en un clic</div>
        </div>
      </header>

      <main className="relative z-40">
        {/* Features section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white mb-6">Fonctionnalités clés</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-xl">
              <div className="text-accent mb-3"><Zap /></div>
              <h3 className="font-bold text-white mb-2">Réponses instantanées</h3>
              <p className="text-gray-300 text-sm">Répondez en temps réel à vos clients sur WhatsApp, Messenger et site web.</p>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="text-accent mb-3"><Shield /></div>
              <h3 className="font-bold text-white mb-2">Sécurité & conformité</h3>
              <p className="text-gray-300 text-sm">Données chiffrées, conformité RGPD et sauvegardes quotidiennes.</p>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="text-accent mb-3"><Sparkles /></div>
              <h3 className="font-bold text-white mb-2">IA intelligente</h3>
              <p className="text-gray-300 text-sm">Compréhension du contexte, apprentissage en continu et adaptation au ton de votre entreprise.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-black/40 py-14">
          <div className="max-w-6xl mx-auto px-6 text-white">
            <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-3 items-start"><span className="text-accent font-bold">1.</span> Intégrez ReplyFast à votre canal (WhatsApp, site, Messenger).</li>
              <li className="flex gap-3 items-start"><span className="text-accent font-bold">2.</span> Configurez vos réponses, menus et horaires en quelques minutes.</li>
              <li className="flex gap-3 items-start"><span className="text-accent font-bold">3.</span> Laissez l'IA gérer les conversations et transmettez les leads prioritaires à votre équipe.</li>
            </ol>

            <div className="mt-6 flex gap-3">
              <button onClick={() => router.push('/signup')} className="px-6 py-3 bg-accent text-black rounded-lg">Créer un compte</button>
              <button onClick={() => scrollToSection('pricing')} className="px-6 py-3 glass rounded-lg text-white">Voir tarifs</button>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white mb-6">Tarifs simples</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-xl text-center">
              <div className="text-accent text-2xl font-bold">Starter</div>
              <div className="text-white text-3xl font-extrabold my-4">9,99€<span className="text-gray-400 text-sm">/mois</span></div>
              <p className="text-gray-300 text-sm">Idéal pour débuter — réponses automatisées et menu de base.</p>
            </div>
            <div className="glass p-6 rounded-xl text-center border-2 border-accent">
              <div className="text-accent text-2xl font-bold">Pro</div>
              <div className="text-white text-3xl font-extrabold my-4">19,99€<span className="text-gray-400 text-sm">/mois</span></div>
              <p className="text-gray-300 text-sm">Tout inclus : intégrations, analytics, support prioritaire.</p>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <div className="text-accent text-2xl font-bold">Enterprise</div>
              <div className="text-white text-3xl font-extrabold my-4">Sur devis</div>
              <p className="text-gray-300 text-sm">Support dédié, SLA, intégrations avancées.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-black/30 py-14">
          <div className="max-w-6xl mx-auto px-6 text-white">
            <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <h4 className="font-semibold">Est-ce compatible WhatsApp Business ?</h4>
                <p>Oui — intégration via l'API officielle Meta ou via solutions partenaires.</p>
              </div>
              <div>
                <h4 className="font-semibold">Puis-je personnaliser le ton de l'IA ?</h4>
                <p>Absolument : ton, messages types et règles métier configurables.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact / Support */}
        <section id="contact" className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Besoin d'aide ?</h2>
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="glass p-6 rounded-xl flex-1">
              <h3 className="font-bold text-white">Support</h3>
              <p className="text-gray-300">Email : <a href="mailto:support@replyfast.ai" className="text-accent">support@replyfast.ai</a></p>
            </div>
            <div className="glass p-6 rounded-xl w-full sm:w-64">
              <h3 className="font-bold text-white">Documentation</h3>
              <p className="text-gray-300">Consultez notre guide d'installation et les tutos dans la section Documentation.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-40 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-gray-400 text-sm flex justify-between items-center">
          <div>© ReplyFast AI 2025</div>
          <div className="flex gap-4">
            <button onClick={() => router.push('/cgv')}>CGV</button>
            <button onClick={() => router.push('/privacy')}>Privacy</button>
          </div>
        </div>
      </footer>

      {/* About modal (kept simple) */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowAboutModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="glass p-6 rounded-xl max-w-3xl w-full">
              <button onClick={() => setShowAboutModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10"> <X /></button>
              <h3 className="text-xl font-bold mb-2">À propos de ReplyFast AI</h3>
              <p className="text-gray-300">ReplyFast AI aide les commerces à automatiser les conversations, convertir plus de leads et garder une expérience client humaine.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
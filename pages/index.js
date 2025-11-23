import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 gradient-bg opacity-20"></div>
      
      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            ReplyFast AI
          </span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/login')}
          className="glass px-6 py-2 rounded-full text-white hover:scale-105 transition-transform"
        >
          Se connecter
        </motion.button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm">Propulsé par GPT-4</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Votre commerce
            </span>
            <br />
            <span className="text-white">ouvert 24/7</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            Pendant que vous dormez, notre IA répond à vos clients sur WhatsApp.
            <br />
            <span className="text-accent">+30.660€/an</span> de clients récupérés
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => router.push('/signup')}
              className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-semibold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/50"
            >
              <span className="flex items-center gap-2">
                Essai gratuit 14 jours
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button
              onClick={() => router.push('/demo')}
              className="glass px-8 py-4 rounded-full text-white font-semibold text-lg hover:scale-105 transition-transform"
            >
              Voir la démo
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-500 mt-4 text-sm"
          >
            Sans carte bancaire • Annulez quand vous voulez
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-6 mt-32"
        >
          {[
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Réponses instantanées",
              description: "Bot répond 24/7, même à 3h du matin"
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "100% Sécurisé",
              description: "Vos données protégées par cryptage"
            },
            {
              icon: <Sparkles className="w-8 h-8" />,
              title: "IA Intelligente",
              description: "GPT-4 comprend vos clients"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
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

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="glass max-w-2xl mx-auto mt-32 p-12 rounded-3xl text-center"
        >
          <div className="inline-block px-4 py-1 bg-accent/20 rounded-full mb-6">
            <span className="text-accent font-semibold">Offre de lancement</span>
          </div>
          
          <div className="text-6xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              19,99€
            </span>
          </div>
          <div className="text-gray-400 mb-8">par mois • 0,66€/jour</div>
          
          <div className="text-left space-y-3 mb-8">
            {[
              "Réponses IA illimitées",
              "WhatsApp Business intégré",
              "Dashboard en temps réel",
              "Support prioritaire"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/signup')}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-semibold text-lg hover:scale-105 transition-transform"
          >
            Commencer maintenant
          </button>
        </motion.div>
      </div>
    </div>
  );
}
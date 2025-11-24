import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
            <span className="text-sm">Propulsé par GPT-4o-mini</span>
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
              onClick={() => router.push('/login')}
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
              title: "IA de pointe",
              description: "IA ultra optimisée qui comprend vos clients"
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-32 max-w-4xl mx-auto"
        >
          <div className="glass p-12 rounded-3xl border-2 border-primary/50">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Un seul prix, tout inclus
              </h2>
              <p className="text-gray-400">
                Pas de frais cachés, pas de surprises
              </p>
            </div>

            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-white mb-2">
                79€
                <span className="text-2xl text-gray-400">/mois</span>
              </div>
              <p className="text-accent font-semibold">
                Économisez 200€/mois vs GPT-4
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                "✅ Réponses IA illimitées",
                "✅ Gestion RDV automatique",
                "✅ Analytics en temps réel",
                "✅ Support 24/7",
                "✅ Multi-secteurs",
                "✅ Intégration WhatsApp"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-white">
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/signup')}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold text-lg hover:scale-105 transition-transform"
            >
              Commencer maintenant
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Partners() {
  const router = useRouter();

  const technologies = [
    {
      name: 'OpenAI',
      description: 'Intelligence artificielle de pointe pour des conversations naturelles et contextuelles',
      category: 'Intelligence Artificielle',
      website: 'https://openai.com',
      logo: '🤖'
    },
    {
      name: 'Meta Business',
      description: 'Intégration WhatsApp Business API pour une communication professionnelle fiable',
      category: 'Messagerie',
      website: 'https://business.whatsapp.com',
      logo: '💬'
    },
    {
      name: 'Supabase',
      description: 'Base de données PostgreSQL sécurisée et conforme RGPD, hébergée en Europe',
      category: 'Infrastructure',
      website: 'https://supabase.com',
      logo: '🗄️'
    },
    {
      name: 'Stripe',
      description: 'Plateforme de paiement sécurisée avec chiffrement de niveau bancaire',
      category: 'Paiements',
      website: 'https://stripe.com',
      logo: '💳'
    },
    {
      name: 'Next.js',
      description: 'Framework React pour des applications web rapides et performantes',
      category: 'Développement',
      website: 'https://nextjs.org',
      logo: '⚡'
    },
    {
      name: 'Vercel',
      description: 'Infrastructure cloud pour un déploiement global et des performances optimales',
      category: 'Infrastructure',
      website: 'https://vercel.com',
      logo: '🌐'
    }
  ];

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="fixed inset-0 gradient-bg opacity-10"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Zap className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-white">Technologies partenaires</h1>
              <p className="text-gray-400 mt-2">
                ReplyFast AI s'appuie sur les meilleures technologies du marché pour vous offrir
                un service fiable, sécurisé et performant.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl hover:scale-105 transition-transform"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{tech.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white">{tech.name}</h3>
                    <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full">
                      {tech.category}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3">{tech.description}</p>
                  <a
                    href={tech.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    En savoir plus →
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="glass p-8 rounded-3xl mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Notre engagement qualité</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-bold text-white mb-2">Sécurité maximale</h3>
              <p className="text-gray-400 text-sm">
                Chiffrement SSL/TLS et conformité RGPD pour protéger vos données
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">Performance</h3>
              <p className="text-gray-400 text-sm">
                Infrastructure cloud globale pour des temps de réponse ultra-rapides
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-lg font-bold text-white mb-2">Disponibilité</h3>
              <p className="text-gray-400 text-sm">
                99,5% de disponibilité garantie avec support technique réactif
              </p>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            ReplyFast AI - Propulsé par les meilleures technologies d'intelligence artificielle
          </p>
        </div>
      </div>
    </div>
  );
}

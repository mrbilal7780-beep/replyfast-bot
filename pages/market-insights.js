import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, TrendingUp, DollarSign, Clock, Target, Upload, Bot } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase, getSession } from '../lib/supabase';
import { getSectorById } from '../lib/sectors';
import MobileMenu from '../components/MobileMenu';

export default function MarketInsights() {
  const router = useRouter();
  const [sectorInfo, setSectorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    loadSectorInfo();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/login');
  };

  const loadSectorInfo = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: client, error } = await supabase
        .from('clients')
        .select('sector')
        .eq('email', session.user.email)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur chargement sector:', error);
      }

      if (client?.sector) {
        const sector = getSectorById(client.sector);
        setSectorInfo(sector);
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!sectorInfo) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Aucun secteur configuré</p>
          <button
            onClick={() => router.push('/settings')}
            className="px-6 py-3 bg-primary rounded-xl text-white"
          >
            Configurer mon secteur
          </button>
        </div>
      </div>
    );
  }

  const insights = sectorInfo.marketInsights;

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Mobile Menu */}
      <MobileMenu currentPath="/market-insights" />

      <div className="fixed inset-0">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
      </div>

      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ReplyFast AI
          </h1>
          <p className="text-gray-400 text-sm mt-1">Market Insights</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
            { icon: Calendar, label: 'Smart RDV', path: '/appointments' },
            { icon: Upload, label: 'Menu Manager', path: '/menu' },
            { icon: Users, label: 'Clients', path: '/clients' },
            { icon: TrendingUp, label: 'Market Insights', path: '/market-insights', active: true },
            { icon: Zap, label: 'Analytics', path: '/analytics' },
            { icon: Bot, label: 'Assistant IA', path: '/ai-assistant' },
            { icon: Settings, label: 'Paramètres', path: '/settings' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => {
            supabase.auth.signOut();
            router.push('/');
          }}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Main Content - Responsive */}
      <div className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{sectorInfo.emoji}</span>
            <h2 className="text-3xl font-bold text-white">
              Market Insights
            </h2>
          </div>
          <p className="text-gray-400">
            Données de marché pour: {sectorInfo.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(insights).map(([key, value], i) => {
            const icons = {
              prixMoyen: DollarSign,
              heuresPointe: Clock,
              tauxFidelisation: Target,
              tempsAttenteMoyen: Clock,
              default: TrendingUp
            };
            
            const Icon = icons[key] || icons.default;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-3xl"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {Array.isArray(value) ? value[0] : value}
                </div>
                <div className="text-gray-400 text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </motion.div>
            );
          })}
        </div>

        {insights.heuresPointe && (
          <div className="glass p-6 rounded-3xl mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Heures de Pointe
            </h3>
            <div className="space-y-3">
              {insights.heuresPointe.map((heure, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                >
                  <span className="text-white">{heure}</span>
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${100 - i * 20}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass p-6 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-accent" />
            Recommandations pour votre secteur
          </h3>
          <div className="space-y-3">
            {sectorInfo.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5"
              >
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-sm font-bold">{i + 1}</span>
                </div>
                <div>
                  <p className="text-white capitalize">
                    {feature.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Optimisez cette fonctionnalité pour augmenter vos revenus
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 glass p-6 rounded-3xl border-2 border-primary/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-bold mb-1">
                💡 Besoin d'aide pour optimiser?
              </h4>
              <p className="text-gray-400 text-sm">
                Nos experts peuvent vous aider à maximiser vos résultats
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform">
              Contacter un expert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
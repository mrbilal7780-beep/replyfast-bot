import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, TrendingUp, Clock, CheckCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Analytics() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
    avgResponseTime: '2 min',
    satisfactionRate: 98
  });

  useEffect(() => {
    checkUser();
    loadStats();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/login');
  };

  const loadStats = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*');
    
    if (data) {
      setStats({
        totalMessages: data.length * 5,
        totalConversations: data.length,
        avgResponseTime: '2 min',
        satisfactionRate: 98
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
      </div>

      <div className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ReplyFast AI
          </h1>
          <p className="text-gray-400 text-sm mt-1">Analytics</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
            { icon: Calendar, label: 'Smart RDV', path: '/appointments' },
            { icon: Users, label: 'Clients', path: '/clients' },
            { icon: TrendingUp, label: 'Market Insights', path: '/market-insights' },
            { icon: Zap, label: 'Analytics', path: '/analytics', active: true },
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

      <div className="ml-64 p-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Analytics 📊
          </h2>
          <p className="text-gray-400">
            Suivez vos performances en temps réel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Messages totaux', value: stats.totalMessages, icon: MessageSquare, color: 'primary' },
            { label: 'Conversations', value: stats.totalConversations, icon: Users, color: 'secondary' },
            { label: 'Temps de réponse', value: stats.avgResponseTime, icon: Clock, color: 'accent' },
            { label: 'Satisfaction', value: `${stats.satisfactionRate}%`, icon: CheckCircle, color: 'primary' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-3xl"
            >
              <div className={`w-12 h-12 rounded-full bg-${stat.color}/20 flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="glass p-6 rounded-3xl mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Messages par jour</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-gray-400">Graphiques disponibles bientôt</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Taux de réponse</span>
              <span className="text-white font-semibold">98%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-primary rounded-full h-2" style={{width: '98%'}}></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-400">Clients satisfaits</span>
              <span className="text-white font-semibold">95%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-accent rounded-full h-2" style={{width: '95%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
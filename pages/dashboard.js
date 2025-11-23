import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, WifiOff, Calendar, TrendingUp, Upload } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    responseRate: 0
  });

  useEffect(() => {
    checkUser();
    loadConversations();
    
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session.user);
    }
  };

  const loadConversations = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('sector')
        .eq('email', session.user.email)
        .single();
      
      if (clientData?.sector) {
        setSelectedSector(clientData.sector);
      }

      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_email', session.user.email)
        .order('last_message_at', { ascending: false });
      
      if (data) {
        setConversations(data);
        
        const { data: allMessages } = await supabase
          .from('messages')
          .select('*');
        
        const totalMsgs = allMessages?.length || 0;
        
        setStats({
          totalMessages: totalMsgs,
          activeConversations: data.filter(c => c.status === 'active').length,
          responseRate: 98
        });
      }
    }
  };

  const handleConnectWhatsApp = () => {
    router.push('/settings');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ReplyFast AI
          </h1>
          <p className="text-gray-400 text-sm mt-1">Dashboard</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard', active: true },
            { icon: Calendar, label: 'Smart RDV', path: '/appointments' },
            { icon: Upload, label: 'Menu Manager', path: '/menu' },
            { icon: Users, label: 'Clients', path: '/clients' },
            { icon: TrendingUp, label: 'Market Insights', path: '/market-insights' },
            { icon: Zap, label: 'Analytics', path: '/analytics' },
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
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>

      <div className="ml-64 p-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenue 👋
          </h2>
          <p className="text-gray-400">
            Gérez vos conversations WhatsApp en temps réel
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-3xl mb-8 border-2 border-accent/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">WhatsApp non connecté</h3>
                <p className="text-gray-400 text-sm">
                  Connectez votre compte WhatsApp Business pour commencer
                </p>
              </div>
            </div>
            <button 
              onClick={handleConnectWhatsApp}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform"
            >
              Connecter WhatsApp
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Messages envoyés', value: stats.totalMessages, icon: MessageSquare, color: 'primary' },
            { label: 'Conversations actives', value: stats.activeConversations, icon: Users, color: 'secondary' },
            { label: 'Taux de réponse', value: `${stats.responseRate}%`, icon: Zap, color: 'accent' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-3xl hover:scale-105 transition-transform"
            >
              <div className={`w-12 h-12 rounded-full bg-${stat.color}/20 flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="glass p-6 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-6">Conversations récentes</h3>
          
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-2">Aucune conversation pour le moment</p>
              <p className="text-gray-500 text-sm">
                Connectez WhatsApp pour commencer à recevoir des messages
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv, i) => (
                <div
                  key={i}
                  onClick={() => router.push(`/conversation/${conv.id}`)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{conv.customer_phone}</div>
                    <div className="text-sm text-gray-400">
                      {conv.last_message_at 
                        ? `Dernière activité: ${new Date(conv.last_message_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Pas de message récent'}
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
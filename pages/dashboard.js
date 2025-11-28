import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, TrendingUp, Upload, Edit2, Bot } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase, getSession } from '../lib/supabase';
import MobileMenu from '../components/MobileMenu';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    responseRate: 'N/A'
  });
  const [editingConv, setEditingConv] = useState(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    checkUser();
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session.user);
      loadUserName(session.user.email);
    }
  };

  const loadUserName = async (email) => {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('first_name, last_name, company_name')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Erreur loadUserName:', error);
      }

      if (client) {
        const name = client.first_name || client.company_name || 'Utilisateur';
        setUserName(name);
      }
    } catch (error) {
      console.error('Erreur dans loadUserName:', error);
    }
  };

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .eq('client_email', session.user.email)
      .order('last_message_at', { ascending: false });

    if (convs) {
      setConversations(convs);

      // Calcul du VRAI taux de réponse
      const { data: receivedMsg } = await supabase
        .from('messages')
        .select('id')
        .eq('client_email', session.user.email)
        .eq('direction', 'received');

      const { data: sentMsg } = await supabase
        .from('messages')
        .select('id')
        .eq('client_email', session.user.email)
        .eq('direction', 'sent');

      const received = receivedMsg?.length || 0;
      const sent = sentMsg?.length || 0;

      let rate = 'N/A';
      if (received > 0) {
        rate = Math.round((sent / received) * 100) + '%';
      }

      setStats({
        totalMessages: received + sent,
        activeConversations: convs.filter(c => c.status === 'active').length,
        responseRate: rate
      });
    }
  };

  const handleRenameConversation = async (convId) => {
    if (!newName.trim()) return;

    await supabase
      .from('conversations')
      .update({ customer_name: newName })
      .eq('id', convId);

    setEditingConv(null);
    setNewName('');
    loadData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Mobile Menu */}
      <MobileMenu currentPath="/dashboard" />

      {/* Fond dynamique avec particules interactives */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 100}, 255, ${Math.random() * 0.5 + 0.2})`
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 z-10">
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
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Main Content - No margin on mobile, margin on desktop */}
      <div className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 relative z-10">
        {/* Header avec prénom */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Bienvenue {userName} 👋
          </h2>
          <p className="text-sm md:text-base text-gray-400">
            Voici un aperçu de votre activité
          </p>
        </motion.div>

        {/* Stats Cards - 1 column on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl hover:scale-105 transition-transform group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Messages totaux</p>
            <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-2xl hover:scale-105 transition-transform group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Conversations actives</p>
            <p className="text-3xl font-bold text-white">{stats.activeConversations}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-2xl hover:scale-105 transition-transform group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Taux de réponse</p>
            <p className="text-3xl font-bold text-white">{stats.responseRate}</p>
          </motion.div>
        </div>

        {/* Conversations List */}
        <div className="glass p-4 md:p-6 rounded-2xl">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Conversations récentes</h3>

          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune conversation pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => router.push(`/conversation/${conv.id}`)}
                >
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
                      {conv.customer_name
                        ? conv.customer_name.charAt(0).toUpperCase()
                        : '?'
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingConv === conv.id ? (
                        <input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onBlur={() => handleRenameConversation(conv.id)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRenameConversation(conv.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-primary w-full"
                          autoFocus
                          placeholder="Nom du client"
                        />
                      ) : (
                        <p className="text-white font-semibold truncate">
                          {conv.customer_name || conv.customer_phone || 'Client'}
                        </p>
                      )}
                      <p className="text-gray-400 text-sm truncate">{conv.customer_phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingConv(conv.id);
                      setNewName(conv.customer_name || '');
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors opacity-60 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, TrendingUp, Upload, Edit2, Bot, Book } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase, getSession } from '../lib/supabase';
import MobileMenu from '../components/MobileMenu';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
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
  const [showFeatureModal, setShowFeatureModal] = useState(null); // null, 'messages', 'conversations', 'response'

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

    // 🎯 FIX: Mettre à jour customer_name_override pour persistance du nom
    await supabase
      .from('conversations')
      .update({ customer_name_override: newName })
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
          <p className="text-gray-400 text-sm mt-1">{t('dashboard.title')}</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: t('nav.conversations'), path: '/dashboard', active: true },
            { icon: Calendar, label: t('nav.appointments'), path: '/appointments' },
            { icon: Upload, label: t('nav.menu'), path: '/menu' },
            { icon: Users, label: t('nav.clients'), path: '/clients' },
            { icon: TrendingUp, label: t('nav.insights'), path: '/market-insights' },
            { icon: Zap, label: t('nav.analytics'), path: '/analytics' },
            { icon: Bot, label: t('nav.assistant'), path: '/ai-assistant' },
            { icon: Book, label: 'Tutorial', path: '/tutorial' },
            { icon: Settings, label: t('nav.settings'), path: '/settings' },
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
          <span>{t('nav.logout')}</span>
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
            {t('dashboard.welcome')} {userName}
          </h2>
          <p className="text-sm md:text-base text-gray-400">
            {t('dashboard.activityOverview')}
          </p>
        </motion.div>

        {/* Stats Cards - 1 column on mobile, 3 on desktop - CLICKABLES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <motion.button
            onClick={() => setShowFeatureModal('messages')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl hover:scale-105 transition-all group cursor-pointer text-left hover:border-2 hover:border-primary/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">{t('dashboard.clickForMore')}</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.totalMessages')}</p>
            <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
          </motion.button>

          <motion.button
            onClick={() => setShowFeatureModal('conversations')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-2xl hover:scale-105 transition-all group cursor-pointer text-left hover:border-2 hover:border-accent/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">{t('dashboard.clickForMore')}</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.activeConversations')}</p>
            <p className="text-3xl font-bold text-white">{stats.activeConversations}</p>
          </motion.button>

          <motion.button
            onClick={() => setShowFeatureModal('response')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-2xl hover:scale-105 transition-all group cursor-pointer text-left hover:border-2 hover:border-secondary/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <span className="text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity">{t('dashboard.clickForMore')}</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.responseRate')}</p>
            <p className="text-3xl font-bold text-white">{stats.responseRate}</p>
          </motion.button>
        </div>

        {/* Conversations List */}
        <div className="glass p-4 md:p-6 rounded-2xl">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">{t('dashboard.recentConversations')}</h3>

          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{t('dashboard.noConversations')}</p>
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
                      {/* 🎯 FIX: Utiliser customer_name_override en priorité */}
                      {(conv.customer_name_override || conv.customer_name || conv.customer_phone || 'C').charAt(0).toUpperCase()}
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
                          {/* 🎯 FIX: Utiliser customer_name_override en priorité */}
                          {conv.customer_name_override || conv.customer_name || conv.customer_phone || 'Client'}
                        </p>
                      )}
                      <p className="text-gray-400 text-sm truncate">{conv.customer_phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/appointments?customer_phone=${encodeURIComponent(conv.customer_phone)}&customer_name=${encodeURIComponent(conv.customer_name_override || conv.customer_name || conv.customer_phone)}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent transition-all text-sm font-semibold opacity-60 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1.5"
                      title="Proposer un rendez-vous"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">RDV</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingConv(conv.id);
                        // 🎯 FIX: Charger customer_name_override en priorité
                        setNewName(conv.customer_name_override || conv.customer_name || '');
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors opacity-60 md:opacity-0 md:group-hover:opacity-100"
                      title="Renommer le client"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📊 MODAL FEATURES - Descriptions professionnelles */}
      <AnimatePresence>
        {showFeatureModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowFeatureModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass p-8 rounded-3xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {showFeatureModal === 'messages' && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{t('dashboard.modals.messages.title')}</h3>
                      <p className="text-gray-400">{t('dashboard.modals.messages.subtitle')}</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-gray-300">
                    <p className="text-lg">
                      <strong className="text-primary">{t('dashboard.modals.messages.currently')} : {stats.totalMessages} {t('dashboard.modals.messages.messages')}</strong>
                    </p>
                    <p>{t('dashboard.modals.messages.description')}</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      <li><strong className="text-accent">{t('dashboard.modals.messages.received')}</strong> : {t('dashboard.modals.messages.receivedDesc')}</li>
                      <li><strong className="text-secondary">{t('dashboard.modals.messages.sent')}</strong> : {t('dashboard.modals.messages.sentDesc')}</li>
                    </ul>
                    <div className="glass p-4 rounded-xl mt-4">
                      <p className="text-sm text-gray-400">💡 <strong className="text-white">{t('dashboard.modals.messages.whyImportant')}</strong></p>
                      <p className="text-sm mt-2">{t('dashboard.modals.messages.whyDesc')}</p>
                    </div>
                  </div>
                </>
              )}

              {showFeatureModal === 'conversations' && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                      <Users className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{t('dashboard.modals.conversations.title')}</h3>
                      <p className="text-gray-400">{t('dashboard.modals.conversations.subtitle')}</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-gray-300">
                    <p className="text-lg">
                      <strong className="text-accent">{t('dashboard.modals.conversations.currently')} : {stats.activeConversations} {t('dashboard.modals.conversations.active')}</strong>
                    </p>
                    <p>{t('dashboard.modals.conversations.description')}</p>
                    <div className="glass p-4 rounded-xl mt-4">
                      <p className="text-sm text-gray-400 font-semibold mb-2">{t('dashboard.modals.conversations.definition')}</p>
                      <p className="text-sm">{t('dashboard.modals.conversations.definitionDesc')}</p>
                    </div>
                    <div className="glass p-4 rounded-xl">
                      <p className="text-sm text-gray-400">💡 <strong className="text-white">{t('dashboard.modals.conversations.whyImportant')}</strong></p>
                      <p className="text-sm mt-2">{t('dashboard.modals.conversations.whyDesc')}</p>
                    </div>
                  </div>
                </>
              )}

              {showFeatureModal === 'response' && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{t('dashboard.modals.response.title')}</h3>
                      <p className="text-gray-400">{t('dashboard.modals.response.subtitle')}</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-gray-300">
                    <p className="text-lg">
                      <strong className="text-secondary">{t('dashboard.modals.response.currently')} : {stats.responseRate} {t('dashboard.modals.response.responseRate')}</strong>
                    </p>
                    <p>{t('dashboard.modals.response.description')}</p>
                    <div className="glass p-4 rounded-xl">
                      <p className="text-sm font-semibold text-white mb-3">📊 {t('dashboard.modals.response.interpretation')}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span><strong className="text-green-400">{t('dashboard.modals.response.high')}</strong> : {t('dashboard.modals.response.highDesc')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span><strong className="text-yellow-400">{t('dashboard.modals.response.medium')}</strong> : {t('dashboard.modals.response.mediumDesc')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span><strong className="text-red-400">{t('dashboard.modals.response.low')}</strong> : {t('dashboard.modals.response.lowDesc')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl">
                      <p className="text-sm text-gray-400">💡 <strong className="text-white">{t('dashboard.modals.response.whyImportant')}</strong></p>
                      <p className="text-sm mt-2">{t('dashboard.modals.response.whyDesc')}</p>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setShowFeatureModal(null)}
                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform"
              >
                {t('dashboard.gotIt')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

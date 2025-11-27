import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, TrendingUp, Clock, CheckCircle, Calendar, Upload, DollarSign, Target, Bot, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const COLORS = ['#667eea', '#10b981', '#ef4444', '#f59e0b'];

export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    avgResponseTime: '0 min',
    responseRate: 0
  });

  const [messagesByDay, setMessagesByDay] = useState([]);
  const [messagesByHour, setMessagesByHour] = useState([]);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [hasEnoughDataForAI, setHasEnoughDataForAI] = useState(false);
  const [aiProjections, setAiProjections] = useState(null);

  useEffect(() => {
    checkUser();
    loadAnalytics();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/login');
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Charger messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('client_email', session.user.email)
        .order('created_at', { ascending: true });

      // Charger RDV
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_email', session.user.email);

      // Charger conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_email', session.user.email);

      // Charger business info pour les prix (gérer les duplicates)
      const { data: businessInfo, error: businessInfoError } = await supabase
        .from('business_info')
        .select('*')
        .eq('client_email', session.user.email)
        .limit(1)
        .maybeSingle();

      if (businessInfoError) {
        console.warn('⚠️ Erreur business_info:', businessInfoError);
      }

      // Stats de base
      const totalMessages = messages?.length || 0;
      const totalConversations = conversations?.length || 0;
      const totalAppointments = appointments?.length || 0;

      // Calculer taux de réponse réel
      const sentMessages = messages?.filter(m => m.direction === 'sent').length || 0;
      const receivedMessages = messages?.filter(m => m.direction === 'received').length || 0;
      const responseRate = receivedMessages > 0 ? Math.round((sentMessages / receivedMessages) * 100) : 0;

      // Calculer revenu total (RDV terminés)
      const completedAppointments = appointments?.filter(a => a.status === 'completed') || [];
      const avgPrice = businessInfo?.tarifs?.default || 30; // Prix moyen par défaut
      const totalRevenue = completedAppointments.length * avgPrice;

      setStats({
        totalMessages,
        totalConversations,
        totalAppointments,
        totalRevenue,
        avgResponseTime: '< 1 min',
        responseRate
      });

      // Messages par jour (30 derniers jours)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const messagesByDayData = last30Days.map(day => {
        const count = messages?.filter(m => m.created_at.startsWith(day)).length || 0;
        return {
          date: new Date(day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          messages: count
        };
      });
      setMessagesByDay(messagesByDayData);

      // Messages par heure (24h)
      const messagesByHourData = Array.from({ length: 24 }, (_, hour) => {
        const count = messages?.filter(m => {
          const msgHour = new Date(m.created_at).getHours();
          return msgHour === hour;
        }).length || 0;
        return {
          hour: `${hour}h`,
          messages: count
        };
      });
      setMessagesByHour(messagesByHourData);

      // RDV par statut
      const statusGroups = {
        'En attente': appointments?.filter(a => a.status === 'pending').length || 0,
        'Confirmés': appointments?.filter(a => a.status === 'confirmed').length || 0,
        'Terminés': appointments?.filter(a => a.status === 'completed').length || 0,
        'Annulés': appointments?.filter(a => a.status === 'cancelled').length || 0
      };

      const appointmentsByStatusData = Object.entries(statusGroups).map(([name, value]) => ({
        name,
        value
      })).filter(item => item.value > 0);
      setAppointmentsByStatus(appointmentsByStatusData);

      // Revenu par mois (6 derniers mois)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date;
      });

      const revenueByMonth = last6Months.map(month => {
        const monthStr = month.toISOString().substring(0, 7);
        const completedInMonth = appointments?.filter(a =>
          a.status === 'completed' && a.appointment_date.startsWith(monthStr)
        ).length || 0;
        const revenue = completedInMonth * avgPrice;

        return {
          month: month.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          revenue: revenue,
          appointments: completedInMonth
        };
      });
      setRevenueData(revenueByMonth);

      // Vérifier si assez de données pour l'IA (2 mois minimum)
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const oldMessages = messages?.filter(m => new Date(m.created_at) < twoMonthsAgo) || [];

      if (oldMessages.length > 50 && appointments && appointments.length > 10) {
        setHasEnoughDataForAI(true);

        // Projections IA simples (trend-based)
        const avgMonthlyRevenue = revenueByMonth.reduce((sum, m) => sum + m.revenue, 0) / revenueByMonth.length;
        const growth = revenueByMonth.length > 1
          ? ((revenueByMonth[revenueByMonth.length - 1].revenue - revenueByMonth[0].revenue) / revenueByMonth[0].revenue) * 100
          : 0;

        setAiProjections({
          nextMonthRevenue: Math.round(avgMonthlyRevenue * (1 + growth / 100)),
          projectedGrowth: growth.toFixed(1),
          recommendation: growth > 0 ? 'Croissance positive ! Continuez sur cette lancée.' : 'Stagnation. Pensez à lancer des offres spéciales.'
        });
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Fond animé */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-secondary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
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
            { icon: Upload, label: 'Menu Manager', path: '/menu' },
            { icon: Users, label: 'Clients', path: '/clients' },
            { icon: TrendingUp, label: 'Market Insights', path: '/market-insights' },
            { icon: Zap, label: 'Analytics', path: '/analytics', active: true },
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

      {/* Contenu principal */}
      <div className="ml-64 p-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            📊 Analytics
          </h2>
          <p className="text-gray-400">
            Suivez vos performances en temps réel
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des données...</p>
          </div>
        ) : (
          <>
            {/* Cards stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Messages totaux', value: stats.totalMessages, icon: MessageSquare, color: 'primary', bg: 'from-primary/20 to-primary/5' },
                { label: 'Conversations', value: stats.totalConversations, icon: Users, color: 'secondary', bg: 'from-secondary/20 to-secondary/5' },
                { label: 'Rendez-vous', value: stats.totalAppointments, icon: Calendar, color: 'accent', bg: 'from-accent/20 to-accent/5' },
                { label: 'Revenu Total', value: `${stats.totalRevenue}€`, icon: DollarSign, color: 'secondary', bg: 'from-secondary/20 to-secondary/5' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass p-6 rounded-3xl bg-gradient-to-br ${stat.bg}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${stat.color} to-${stat.color}/50 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-white`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Projections IA */}
            {hasEnoughDataForAI && aiProjections && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-3xl mb-8 border-2 border-accent/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-bold text-white">🤖 Projections IA</h3>
                  <span className="ml-auto px-3 py-1 bg-accent/20 text-accent rounded-full text-xs">Basé sur 2+ mois de données</span>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm mb-2">Revenu projeté mois prochain</p>
                    <p className="text-2xl font-bold text-accent">{aiProjections.nextMonthRevenue}€</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm mb-2">Croissance projetée</p>
                    <p className={`text-2xl font-bold ${aiProjections.projectedGrowth >= 0 ? 'text-accent' : 'text-red-500'}`}>
                      {aiProjections.projectedGrowth}%
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm mb-2">Recommandation</p>
                    <p className="text-sm text-white">{aiProjections.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Messages par jour */}
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Messages par jour (30 derniers jours)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={messagesByDay}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="messages" stroke="#667eea" fillOpacity={1} fill="url(#colorMessages)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Messages par heure */}
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Messages par heure (distribution)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={messagesByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="messages" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RDV par statut */}
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Rendez-vous par statut</h3>
                {appointmentsByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={appointmentsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {appointmentsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Aucun rendez-vous pour le moment
                  </div>
                )}
              </div>

              {/* Revenu par mois */}
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Revenu mensuel (6 derniers mois)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#764ba2" strokeWidth={3} name="Revenu (€)" dot={{ r: 6 }} />
                    <Line type="monotone" dataKey="appointments" stroke="#667eea" strokeWidth={2} name="RDV" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Info sur projections IA */}
            {!hasEnoughDataForAI && (
              <div className="mt-8 glass p-6 rounded-xl border-2 border-yellow-500/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">Projections IA désactivées</h3>
                    <p className="text-gray-400 text-sm">
                      Les projections IA nécessitent au moins 2 mois de données et 50+ messages. Continuez à utiliser ReplyFast AI pour débloquer cette fonctionnalité !
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Performance indicators */}
            <div className="mt-8 glass p-6 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6">Indicateurs de performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Taux de réponse</span>
                    <span className="text-white font-semibold">{stats.responseRate}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-accent rounded-full h-3 transition-all duration-500"
                      style={{width: `${stats.responseRate}%`}}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Temps de réponse moyen</span>
                    <span className="text-white font-semibold">{stats.avgResponseTime}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className="bg-accent rounded-full h-3" style={{width: '95%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

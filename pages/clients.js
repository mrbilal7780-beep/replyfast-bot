import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, TrendingUp, Upload, Search, Star, AlertCircle, CheckCircle, Clock, Bot, Phone, Mail, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Clients() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'active', 'potential', 'leads'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    loadClients();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/login');
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Charger tous les RDV
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_email', session.user.email);

      // Charger tous les messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('client_email', session.user.email);

      // Charger potential_clients
      const { data: potentialClients } = await supabase
        .from('potential_clients')
        .select('*')
        .eq('client_email', session.user.email);

      // Construire la liste des clients avec catégorisation intelligente
      const clientsMap = new Map();

      // 1. Clients avec RDV confirmés/terminés = ACTIVE
      appointments?.forEach(apt => {
        const phone = apt.customer_phone;
        if (!clientsMap.has(phone)) {
          clientsMap.set(phone, {
            phone: phone,
            name: apt.customer_name || phone,
            category: 'leads',
            appointments: [],
            messages: [],
            lastContact: apt.created_at,
            feedback: null
          });
        }

        const client = clientsMap.get(phone);
        client.appointments.push(apt);

        // Catégorisation: ACTIVE si au moins 1 RDV confirmé ou completed
        if (apt.status === 'confirmed' || apt.status === 'completed') {
          client.category = 'active';
        }

        // Feedback
        if (apt.feedback_response) {
          client.feedback = {
            rating: apt.feedback_rating,
            response: apt.feedback_response
          };
        }

        // Dernière date de contact
        if (new Date(apt.created_at) > new Date(client.lastContact)) {
          client.lastContact = apt.created_at;
        }
      });

      // 2. Clients avec messages = POTENTIAL (s'ils n'ont pas de RDV confirmé)
      messages?.forEach(msg => {
        const phone = msg.customer_phone;
        if (!clientsMap.has(phone)) {
          clientsMap.set(phone, {
            phone: phone,
            name: msg.customer_name || phone,
            category: 'leads',
            appointments: [],
            messages: [],
            lastContact: msg.created_at,
            feedback: null
          });
        }

        const client = clientsMap.get(phone);
        client.messages.push(msg);

        // POTENTIAL si a des messages mais pas de RDV confirmé
        if (client.category !== 'active' && client.messages.length > 0) {
          client.category = 'potential';
        }

        // Dernière date de contact
        if (new Date(msg.created_at) > new Date(client.lastContact)) {
          client.lastContact = msg.created_at;
        }
      });

      // 3. Potential clients depuis la table = LEADS
      potentialClients?.forEach(pc => {
        const phone = pc.customer_phone;
        if (!clientsMap.has(phone)) {
          clientsMap.set(phone, {
            phone: phone,
            name: pc.customer_name || phone,
            email: pc.customer_email,
            category: 'leads',
            appointments: [],
            messages: [],
            lastContact: pc.created_at,
            source: pc.source,
            notes: pc.notes,
            feedback: null
          });
        }
      });

      // Convertir en array et trier par dernière activité
      const clientsArray = Array.from(clientsMap.values()).sort((a, b) =>
        new Date(b.lastContact) - new Date(a.lastContact)
      );

      setClients(clientsArray);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
    setLoading(false);
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'active': return 'Client Actif';
      case 'potential': return 'Potentiel';
      case 'leads': return 'Lead';
      default: return 'Inconnu';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'active': return 'bg-accent/20 text-accent border-accent/50';
      case 'potential': return 'bg-primary/20 text-primary border-primary/50';
      case 'leads': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'active': return CheckCircle;
      case 'potential': return Clock;
      case 'leads': return AlertCircle;
      default: return Users;
    }
  };

  const getDaysSinceLastContact = (lastContact) => {
    const days = Math.floor((new Date() - new Date(lastContact)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    return `Il y a ${days} jours`;
  };

  const filteredClients = clients.filter(client => {
    // Filtre par catégorie
    if (activeCategory !== 'all' && client.category !== activeCategory) {
      return false;
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const categories = [
    { value: 'all', label: 'Tous', count: clients.length },
    { value: 'active', label: 'Actifs', count: clients.filter(c => c.category === 'active').length },
    { value: 'potential', label: 'Potentiels', count: clients.filter(c => c.category === 'potential').length },
    { value: 'leads', label: 'Leads', count: clients.filter(c => c.category === 'leads').length },
  ];

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Fond animé */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
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
          <p className="text-gray-400 text-sm mt-1">Clients</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
            { icon: Calendar, label: 'Smart RDV', path: '/appointments' },
            { icon: Upload, label: 'Menu Manager', path: '/menu' },
            { icon: Users, label: 'Clients', path: '/clients', active: true },
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
            👥 Mes Clients
          </h2>
          <p className="text-gray-400">
            Catégorisation intelligente basée sur l'activité
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="glass p-4 rounded-xl mb-6 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un client (nom, téléphone, email)..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Filtres par catégorie */}
        <div className="flex gap-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeCategory === cat.value
                  ? 'glass border-2 border-primary text-white'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Liste des clients */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchQuery ? 'Aucun client trouvé pour cette recherche' : 'Aucun client dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client, i) => {
              const CategoryIcon = getCategoryIcon(client.category);

              return (
                <motion.div
                  key={client.phone}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass p-6 rounded-3xl hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Infos */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">{client.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs border ${getCategoryColor(client.category)} flex items-center gap-1`}>
                            <CategoryIcon className="w-3 h-3" />
                            {getCategoryLabel(client.category)}
                          </span>
                          {client.feedback && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < client.feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Phone className="w-4 h-4" />
                            {client.phone}
                          </div>
                          {client.email && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Mail className="w-4 h-4" />
                              {client.email}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            {getDaysSinceLastContact(client.lastContact)}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-white font-semibold">{client.appointments.length}</span>
                            <span className="text-gray-400">RDV</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-accent" />
                            <span className="text-white font-semibold">{client.messages.length}</span>
                            <span className="text-gray-400">Messages</span>
                          </div>
                          {client.appointments.filter(a => a.status === 'completed').length > 0 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-secondary" />
                              <span className="text-white font-semibold">
                                {client.appointments.filter(a => a.status === 'completed').length}
                              </span>
                              <span className="text-gray-400">Terminés</span>
                            </div>
                          )}
                        </div>

                        {/* Feedback */}
                        {client.feedback && (
                          <div className="mt-3 bg-white/5 p-3 rounded-xl">
                            <p className="text-sm text-gray-300 italic">
                              "{client.feedback.response}"
                            </p>
                          </div>
                        )}

                        {/* Notes (pour les leads) */}
                        {client.notes && (
                          <div className="mt-3 text-sm text-gray-400">
                            📝 {client.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => router.push(`/dashboard?phone=${client.phone}`)}
                        className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-colors text-sm"
                      >
                        Voir conversation
                      </button>
                      {client.category === 'leads' && (
                        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-xl text-xs text-center">
                          À relancer
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 glass p-6 rounded-xl">
          <h3 className="text-white font-semibold mb-3">💡 Comment fonctionne la catégorisation ?</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span><span className="text-accent font-semibold">Clients Actifs:</span> Ont au moins 1 RDV confirmé ou terminé</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><span className="text-primary font-semibold">Potentiels:</span> Ont échangé des messages mais pas encore de RDV confirmé</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span><span className="text-gray-300 font-semibold">Leads:</span> Contacts ajoutés en waitlist ou sans interaction encore</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
            🤖 Les leads sans activité depuis 30 jours sont automatiquement archivés. Le feedback est envoyé automatiquement 1 jour après chaque RDV terminé.
          </div>
        </div>
      </div>
    </div>
  );
}

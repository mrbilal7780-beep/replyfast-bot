import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar as CalendarIcon, Clock, Check, X, Phone, TrendingUp, Upload, List, CalendarDays, UserPlus, AlertCircle, Bot } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('fr');
const localizer = momentLocalizer(moment);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Appointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' ou 'list'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistData, setWaitlistData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    preferred_date: '',
    preferred_time: '',
    service: ''
  });

  useEffect(() => {
    checkUser();
    loadAppointments();

    const interval = setInterval(loadAppointments, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/login');
  };

  const loadAppointments = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('client_email', session.user.email)
        .order('appointment_date', { ascending: false }) // RÉCENT EN HAUT
        .order('appointment_time', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      if (data) setAppointments(data);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: newStatus,
        completed: newStatus === 'completed',
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (!error) {
      loadAppointments();
    }
  };

  const handleDesistement = async (apt) => {
    if (confirm(`Êtes-vous sûr de vouloir annuler le RDV de ${apt.customer_name || apt.customer_phone} ?`)) {
      await updateStatus(apt.id, 'cancelled');

      // Vérifier s'il y a des personnes en waitlist pour cette date/heure
      const { data: waitlist } = await supabase
        .from('rdv_waitlist')
        .select('*')
        .eq('preferred_date', apt.appointment_date)
        .eq('preferred_time', apt.appointment_time)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
        .limit(1);

      if (waitlist && waitlist.length > 0) {
        // Notifier la première personne en attente
        alert(`✅ Une place s'est libérée ! Contact en waitlist: ${waitlist[0].customer_name}`);
      }
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return;

    const { error } = await supabase
      .from('rdv_waitlist')
      .insert([{
        client_email: session.user.email,
        customer_name: waitlistData.customer_name,
        customer_phone: waitlistData.customer_phone,
        customer_email: waitlistData.customer_email,
        preferred_date: waitlistData.preferred_date,
        preferred_time: waitlistData.preferred_time,
        service: waitlistData.service,
        status: 'waiting'
      }]);

    if (!error) {
      alert('✅ Client ajouté à la liste d\'attente !');
      setShowWaitlistModal(false);
      setWaitlistData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        preferred_date: '',
        preferred_time: '',
        service: ''
      });
    } else {
      alert('❌ Erreur lors de l\'ajout à la waitlist');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-accent/20 text-accent border-accent/50';
      case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'completed': return 'bg-secondary/20 text-secondary border-secondary/50';
      default: return 'bg-primary/20 text-primary border-primary/50';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return 'En attente';
    }
  };

  // Préparer les événements pour le calendrier
  const calendarEvents = appointments.map(apt => ({
    id: apt.id,
    title: `${apt.customer_name || apt.customer_phone} - ${apt.service || 'RDV'}`,
    start: new Date(`${apt.appointment_date}T${apt.appointment_time || '09:00'}`),
    end: new Date(`${apt.appointment_date}T${apt.appointment_time || '09:00'}`),
    resource: apt,
    status: apt.status
  }));

  // Style des événements selon le statut
  const eventStyleGetter = (event) => {
    let backgroundColor = '#667eea';

    switch(event.status) {
      case 'confirmed':
        backgroundColor = '#10b981';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        break;
      case 'completed':
        backgroundColor = '#764ba2';
        break;
      default:
        backgroundColor = '#667eea';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '13px',
        padding: '4px'
      }
    };
  };

  const handleSelectSlot = (slotInfo) => {
    const dateStr = moment(slotInfo.start).format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(a => a.appointment_date === dateStr);

    setSelectedDate(slotInfo.start);
    setSelectedAppointments(dayAppointments);
  };

  const handleSelectEvent = (event) => {
    const dateStr = moment(event.start).format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(a => a.appointment_date === dateStr);

    setSelectedDate(event.start);
    setSelectedAppointments(dayAppointments);
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Fond animé */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
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
          <p className="text-gray-400 text-sm mt-1">Smart RDV</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
            { icon: CalendarIcon, label: 'Smart RDV', path: '/appointments', active: true },
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              📅 Smart RDV
            </h2>
            <p className="text-gray-400">
              Calendrier intelligent avec gestion automatique des rendez-vous
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-secondary to-primary rounded-xl text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Ajouter en Waitlist
            </button>

            <div className="glass rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-primary/30 text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Calendrier
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-primary/30 text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                Liste
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-6">
          {[
            { value: 'all', label: 'Tous', count: appointments.length },
            { value: 'pending', label: 'En attente', count: appointments.filter(a => a.status === 'pending').length },
            { value: 'confirmed', label: 'Confirmés', count: appointments.filter(a => a.status === 'confirmed').length },
            { value: 'completed', label: 'Terminés', count: appointments.filter(a => a.status === 'completed').length },
            { value: 'cancelled', label: 'Annulés', count: appointments.filter(a => a.status === 'cancelled').length },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-6 py-3 rounded-xl transition-all ${
                filter === f.value
                  ? 'glass border-2 border-primary text-white'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Vue Calendrier */}
        {viewMode === 'calendar' && (
          <div className="glass p-6 rounded-3xl mb-6">
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                views={['month', 'week', 'day']}
                messages={{
                  next: "Suivant",
                  previous: "Précédent",
                  today: "Aujourd'hui",
                  month: "Mois",
                  week: "Semaine",
                  day: "Jour",
                  agenda: "Agenda",
                  date: "Date",
                  time: "Heure",
                  event: "Événement",
                  noEventsInRange: "Aucun rendez-vous dans cette période."
                }}
              />
            </div>

            {/* Légende */}
            <div className="flex gap-6 mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary"></div>
                <span className="text-sm text-gray-400">En attente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent"></div>
                <span className="text-sm text-gray-400">Confirmé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary"></div>
                <span className="text-sm text-gray-400">Terminé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-sm text-gray-400">Annulé</span>
              </div>
            </div>
          </div>
        )}

        {/* RDV sélectionnés pour une date */}
        {viewMode === 'calendar' && selectedDate && selectedAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-3xl mb-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Rendez-vous du {moment(selectedDate).format('DD MMMM YYYY')}
            </h3>
            <div className="space-y-3">
              {selectedAppointments.map((apt) => (
                <div key={apt.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{apt.customer_name || apt.customer_phone}</p>
                    <p className="text-sm text-gray-400">
                      {apt.appointment_time} - {apt.service || 'RDV'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleDesistement(apt)}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm transition-colors"
                      >
                        Désistement
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Vue Liste */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="glass p-12 rounded-3xl text-center">
                <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun rendez-vous pour le moment</p>
              </div>
            ) : (
              appointments.map((apt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass p-6 rounded-3xl hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-8 h-8 text-primary" />
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">
                            {apt.customer_name || apt.customer_phone}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(apt.appointment_date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {apt.appointment_time}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {apt.customer_phone}
                          </div>
                        </div>
                        {apt.service && (
                          <p className="text-sm text-gray-300 mt-2">
                            Service: <span className="text-primary">{apt.service}</span>
                          </p>
                        )}
                        {apt.notes && (
                          <p className="text-sm text-gray-400 mt-1">
                            Note: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, 'confirmed')}
                            className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Confirmer
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, 'completed')}
                            className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 text-secondary rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Marquer terminé
                          </button>
                          <button
                            onClick={() => handleDesistement(apt)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl transition-colors flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Désistement
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Waitlist */}
      <AnimatePresence>
        {showWaitlistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowWaitlistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass p-8 rounded-3xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-primary" />
                Ajouter en Liste d'Attente
              </h3>

              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nom du client</label>
                  <input
                    type="text"
                    required
                    value={waitlistData.customer_name}
                    onChange={(e) => setWaitlistData({...waitlistData, customer_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    required
                    value={waitlistData.customer_phone}
                    onChange={(e) => setWaitlistData({...waitlistData, customer_phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email (optionnel)</label>
                  <input
                    type="email"
                    value={waitlistData.customer_email}
                    onChange={(e) => setWaitlistData({...waitlistData, customer_email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="jean@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Date préférée</label>
                  <input
                    type="date"
                    required
                    value={waitlistData.preferred_date}
                    onChange={(e) => setWaitlistData({...waitlistData, preferred_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Heure préférée</label>
                  <input
                    type="time"
                    required
                    value={waitlistData.preferred_time}
                    onChange={(e) => setWaitlistData({...waitlistData, preferred_time: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Service</label>
                  <input
                    type="text"
                    value={waitlistData.service}
                    onChange={(e) => setWaitlistData({...waitlistData, service: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Coupe + Couleur"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowWaitlistModal(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform"
                  >
                    Ajouter à la Waitlist
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

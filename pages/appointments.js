import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar as CalendarIcon, Clock, Check, X, Phone, TrendingUp, Upload, List, CalendarDays, UserPlus, AlertCircle, Bot, Archive, ArchiveX, Bell } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MobileMenu from '../components/MobileMenu';
import { useRealTimeAppointments } from '../lib/useRealTimeAppointments';
import { useNotifications } from '../contexts/NotificationContext';

moment.locale('fr');
const localizer = momentLocalizer(moment);

export default function Appointments() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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

  // 🔥 REAL-TIME SYNC: Utiliser le hook de synchronisation en temps réel
  const {
    appointments: realtimeAppointments,
    newAppointmentCount,
    resetNewCount,
    loading: realtimeLoading
  } = useRealTimeAppointments(user?.email);

  const { success: showSuccess } = useNotifications();

  // State local pour les appointments filtrés
  const [appointments, setAppointments] = useState([]);

  // Notifier l'utilisateur lors de nouveaux RDV
  useEffect(() => {
    if (newAppointmentCount > 0) {
      showSuccess(
        '🎉 Nouveau rendez-vous !',
        `${newAppointmentCount} nouveau${newAppointmentCount > 1 ? 'x' : ''} rendez-vous ajouté${newAppointmentCount > 1 ? 's' : ''} automatiquement par l'IA`,
        { duration: 5000 }
      );
      resetNewCount();
    }
  }, [newAppointmentCount, showSuccess, resetNewCount]);

  // Filtrer les appointments en temps réel selon le filtre sélectionné
  useEffect(() => {
    let filtered = realtimeAppointments;

    if (filter === 'archived') {
      filtered = realtimeAppointments.filter(a => a.archived === true);
    } else if (filter === 'all') {
      filtered = realtimeAppointments.filter(a => !a.archived);
    } else {
      filtered = realtimeAppointments.filter(a => a.status === filter && !a.archived);
    }

    setAppointments(filtered);
  }, [realtimeAppointments, filter]);

  useEffect(() => {
    checkUser();
    archivePastAppointments(); // Archiver automatiquement les RDV passés

    const interval = setInterval(() => {
      archivePastAppointments();
    }, 60000); // Toutes les minutes
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

  const archivePastAppointments = async () => {
    if (!user?.email) return;

    const today = moment().format('YYYY-MM-DD');
    const now = moment().format('HH:mm');

    // Archiver tous les RDV passés (date < aujourd'hui OU date = aujourd'hui ET heure < maintenant)
    const { error } = await supabase
      .from('appointments')
      .update({ archived: true, archived_at: new Date().toISOString() })
      .eq('client_email', user.email)
      .or(`appointment_date.lt.${today},and(appointment_date.eq.${today},appointment_time.lt.${now})`)
      .eq('archived', false); // Seulement ceux pas encore archivés

    if (error) {
      console.error('Erreur archivage automatique:', error);
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

    if (error) {
      console.error('Erreur update status:', error);
    }
    // Pas besoin de recharger - le real-time hook s'en charge automatiquement !
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

  const handleArchive = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ archived: true, archived_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      showSuccess('Archivé', 'Rendez-vous archivé avec succès');
    } else {
      console.error('Erreur archivage:', error);
    }
    // Pas besoin de recharger - le real-time hook s'en charge automatiquement !
  };

  const handleUnarchive = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ archived: false, archived_at: null })
      .eq('id', id);

    if (!error) {
      showSuccess('Restauré', 'Rendez-vous restauré avec succès');
    } else {
      console.error('Erreur restauration:', error);
    }
    // Pas besoin de recharger - le real-time hook s'en charge automatiquement !
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
      {/* Mobile Menu */}
      <MobileMenu currentPath="/appointments" />

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

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 z-10">
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

      {/* Contenu principal - Responsive margin */}
      <div className="lg:ml-64 p-4 lg:p-8 relative z-10">
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
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'Actifs', count: appointments.length },
            { value: 'pending', label: 'En attente', count: appointments.filter(a => a.status === 'pending').length },
            { value: 'confirmed', label: 'Confirmés', count: appointments.filter(a => a.status === 'confirmed').length },
            { value: 'completed', label: 'Terminés', count: appointments.filter(a => a.status === 'completed').length },
            { value: 'cancelled', label: 'Annulés', count: appointments.filter(a => a.status === 'cancelled').length },
            { value: 'archived', label: '📦 Archivés', count: appointments.filter(a => a.archived).length, icon: Archive },
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-3xl mb-6 border border-white/10 shadow-2xl"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-primary" />
                Vue Calendrier
              </h3>
              <p className="text-gray-400 text-sm mt-1">Cliquez sur une date pour voir les détails</p>
            </div>

            <div style={{ height: '600px' }} className="calendar-container">
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

            {/* Légende améliorée */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/30">
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                <div>
                  <span className="text-sm font-semibold text-white">En attente</span>
                  <p className="text-xs text-gray-400">{appointments.filter(a => a.status === 'pending').length} RDV</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl border border-accent/30">
                <div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50"></div>
                <div>
                  <span className="text-sm font-semibold text-white">Confirmé</span>
                  <p className="text-xs text-gray-400">{appointments.filter(a => a.status === 'confirmed').length} RDV</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-xl border border-secondary/30">
                <div className="w-3 h-3 rounded-full bg-secondary shadow-lg shadow-secondary/50"></div>
                <div>
                  <span className="text-sm font-semibold text-white">Terminé</span>
                  <p className="text-xs text-gray-400">{appointments.filter(a => a.status === 'completed').length} RDV</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                <div>
                  <span className="text-sm font-semibold text-white">Annulé</span>
                  <p className="text-xs text-gray-400">{appointments.filter(a => a.status === 'cancelled').length} RDV</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal RDV du Jour - Design Amélioré */}
        {viewMode === 'calendar' && selectedDate && selectedAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass p-8 rounded-3xl mb-6 border border-primary/20 shadow-2xl relative overflow-hidden"
          >
            {/* Fond décoratif */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl -z-10"></div>

            {/* En-tête amélioré */}
            <div className="mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    {moment(selectedDate).format('DD MMMM YYYY')}
                  </h3>
                  <p className="text-gray-400 ml-15">
                    {selectedAppointments.length} rendez-vous prévu{selectedAppointments.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Liste des RDV avec design amélioré */}
            <div className="space-y-4">
              {selectedAppointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white/5 to-white/0 p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {(apt.customer_name || apt.customer_phone || 'C').charAt(0).toUpperCase()}
                      </div>

                      {/* Info client */}
                      <div>
                        <p className="text-white font-bold text-lg mb-1">
                          {apt.customer_name || apt.customer_phone}
                        </p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{apt.appointment_time}</span>
                            {apt.service && (
                              <>
                                <span className="text-gray-500">•</span>
                                <span className="text-primary">{apt.service}</span>
                              </>
                            )}
                          </div>
                          {apt.customer_phone && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Phone className="w-3.5 h-3.5" />
                              {apt.customer_phone}
                            </div>
                          )}
                          {apt.notes && (
                            <p className="text-gray-400 text-sm mt-2 italic">
                              💬 {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge statut */}
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 ${getStatusColor(apt.status)} shadow-lg`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>

                  {/* Boutons d'action redessinés */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
                    {apt.status === 'pending' && !apt.archived && (
                      <>
                        <button
                          onClick={() => updateStatus(apt.id, 'confirmed')}
                          className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 text-accent rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 border border-accent/30"
                        >
                          <Check className="w-4 h-4" />
                          Confirmer
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, 'cancelled')}
                          className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20 text-red-500 rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 border border-red-500/30"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && !apt.archived && (
                      <>
                        <button
                          onClick={() => updateStatus(apt.id, 'completed')}
                          className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20 text-secondary rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 border border-secondary/30"
                        >
                          <Check className="w-4 h-4" />
                          Terminé
                        </button>
                        <button
                          onClick={() => handleDesistement(apt)}
                          className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20 text-red-500 rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 border border-red-500/30"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Désistement
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
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

                    <div className="flex flex-wrap gap-2">
                      {apt.status === 'pending' && !apt.archived && (
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
                      {apt.status === 'confirmed' && !apt.archived && (
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

                      {/* Bouton Archiver/Désarchiver */}
                      {!apt.archived ? (
                        <button
                          onClick={() => handleArchive(apt.id)}
                          className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 rounded-xl transition-colors flex items-center gap-2"
                          title="Archiver ce rendez-vous"
                        >
                          <Archive className="w-4 h-4" />
                          Archiver
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnarchive(apt.id)}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-xl transition-colors flex items-center gap-2"
                          title="Restaurer ce rendez-vous"
                        >
                          <ArchiveX className="w-4 h-4" />
                          Restaurer
                        </button>
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

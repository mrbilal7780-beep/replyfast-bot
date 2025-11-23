import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, Clock, Check, X, Phone, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Appointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');

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
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
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
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      loadAppointments();
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-accent/20 text-accent border-accent/50';
      case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/50';
      default: return 'bg-primary/20 text-primary border-primary/50';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      default: return 'En attente';
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
          <p className="text-gray-400 text-sm mt-1">Smart RDV</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
            { icon: Calendar, label: 'Smart RDV', path: '/appointments', active: true },
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
            📅 Smart RDV
          </h2>
          <p className="text-gray-400">
            Vos rendez-vous pris automatiquement par l'IA
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          {[
            { value: 'all', label: 'Tous', count: appointments.length },
            { value: 'pending', label: 'En attente', count: appointments.filter(a => a.status === 'pending').length },
            { value: 'confirmed', label: 'Confirmés', count: appointments.filter(a => a.status === 'confirmed').length },
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

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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
                          <Calendar className="w-4 h-4" />
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

                  {apt.status === 'pending' && (
                    <div className="flex gap-2">
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
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
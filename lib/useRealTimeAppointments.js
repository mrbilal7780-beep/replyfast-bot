import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

/**
 * Hook pour synchronisation temps réel des rendez-vous
 * Utilise Supabase Realtime pour détecter les nouveaux RDV instantanément
 */
export function useRealTimeAppointments(clientEmail) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAppointmentCount, setNewAppointmentCount] = useState(0);

  // Charger les RDV initiaux
  const loadAppointments = useCallback(async () => {
    if (!clientEmail) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_email', clientEmail)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [clientEmail]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Configurer la synchronisation temps réel
  useEffect(() => {
    if (!clientEmail) return;

    console.log('🔄 Setting up realtime subscription for appointments...');

    // S'abonner aux changements de la table appointments
    const subscription = supabase
      .channel('appointments_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'appointments',
          filter: `client_email=eq.${clientEmail}`
        },
        (payload) => {
          console.log('📡 Realtime update received:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              // Nouveau RDV créé
              setAppointments(prev => {
                const exists = prev.some(a => a.id === payload.new.id);
                if (exists) return prev;

                // Ajouter et trier
                const updated = [...prev, payload.new].sort((a, b) => {
                  if (a.appointment_date === b.appointment_date) {
                    return a.appointment_time.localeCompare(b.appointment_time);
                  }
                  return a.appointment_date.localeCompare(b.appointment_date);
                });

                setNewAppointmentCount(c => c + 1);
                return updated;
              });
              break;

            case 'UPDATE':
              // RDV mis à jour
              setAppointments(prev =>
                prev.map(a => (a.id === payload.new.id ? payload.new : a))
              );
              break;

            case 'DELETE':
              // RDV supprimé
              setAppointments(prev =>
                prev.filter(a => a.id === payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Unsubscribing from realtime...');
      subscription.unsubscribe();
    };
  }, [clientEmail]);

  const resetNewCount = useCallback(() => {
    setNewAppointmentCount(0);
  }, []);

  return {
    appointments,
    loading,
    newAppointmentCount,
    resetNewCount,
    refresh: loadAppointments
  };
}

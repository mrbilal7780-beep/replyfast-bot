import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, TrendingUp, Upload, CreditCard, DollarSign, CheckCircle, XCircle, Clock, Bot, Building, Save } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import MobileMenu from '../components/MobileMenu';

export default function Payment() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState({
    type: 'iban',
    iban: '',
    holder_name: '',
    stripe_customer_id: null
  });
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    checkUser();
    loadPaymentInfo();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session.user);
    }
  };

  const loadPaymentInfo = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Charger les informations de paiement
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('client_email', session.user.email)
        .maybeSingle();

      if (paymentData) {
        setPaymentMethod({
          type: paymentData.type || 'iban',
          iban: paymentData.iban || '',
          holder_name: paymentData.holder_name || '',
          stripe_customer_id: paymentData.stripe_customer_id
        });
      }

      // Charger l'abonnement
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('client_email', session.user.email)
        .maybeSingle();

      if (subData) {
        setSubscription(subData);
      }

      // Charger l'historique de paiements
      const { data: history } = await supabase
        .from('payment_history')
        .select('*')
        .eq('client_email', session.user.email)
        .order('created_at', { ascending: false })
        .limit(10);

      if (history) {
        setPaymentHistory(history);
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
    }
    setLoading(false);
  };

  const handleSavePaymentMethod = async () => {
    setSaving(true);
    try {
      // Valider l'IBAN (simple validation)
      if (paymentMethod.type === 'iban') {
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
        const cleanIban = paymentMethod.iban.replace(/\s/g, '');

        if (!ibanRegex.test(cleanIban)) {
          alert('❌ IBAN invalide. Format attendu: FR76 XXXX XXXX XXXX XXXX XXXX XXX');
          setSaving(false);
          return;
        }

        if (!paymentMethod.holder_name.trim()) {
          alert('❌ Veuillez entrer le nom du titulaire du compte');
          setSaving(false);
          return;
        }
      }

      // Sauvegarder dans la base
      const { data: existing } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('client_email', user.email)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('payment_methods')
          .update({
            type: paymentMethod.type,
            iban: paymentMethod.iban.replace(/\s/g, ''),
            holder_name: paymentMethod.holder_name,
            updated_at: new Date().toISOString()
          })
          .eq('client_email', user.email);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert([{
            client_email: user.email,
            type: paymentMethod.type,
            iban: paymentMethod.iban.replace(/\s/g, ''),
            holder_name: paymentMethod.holder_name
          }]);

        if (error) throw error;
      }

      alert('✅ Méthode de paiement enregistrée avec succès !');
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('❌ Erreur lors de l\'enregistrement');
    }
    setSaving(false);
  };

  const formatIban = (value) => {
    // Formater l'IBAN avec des espaces tous les 4 caractères
    const clean = value.replace(/\s/g, '').toUpperCase();
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    return formatted;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-accent';
      case 'cancelled': return 'text-red-500';
      case 'expired': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'expired': return Clock;
      default: return Clock;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return 'Actif';
      case 'cancelled': return 'Annulé';
      case 'expired': return 'Expiré';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Mobile Menu */}
      <MobileMenu currentPath="/payment" />

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
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
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
          <p className="text-gray-400 text-sm mt-1">Paiements</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
            { icon: Calendar, label: 'Smart RDV', path: '/appointments' },
            { icon: Upload, label: 'Menu Manager', path: '/menu' },
            { icon: Users, label: 'Clients', path: '/clients' },
            { icon: TrendingUp, label: 'Market Insights', path: '/market-insights' },
            { icon: Zap, label: 'Analytics', path: '/analytics' },
            { icon: Bot, label: 'Assistant IA', path: '/ai-assistant' },
            { icon: CreditCard, label: 'Paiements', path: '/payment', active: true },
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              💳 Paiements & Abonnement
            </h2>
            <p className="text-gray-400">
              Gérez vos méthodes de paiement et votre abonnement ReplyFast AI
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement...</p>
            </div>
          ) : (
            <>
              {/* Statut abonnement */}
              <div className="glass p-6 rounded-3xl mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                  Abonnement Actuel
                </h3>

                {subscription ? (
                  <div className="bg-white/5 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-white mb-1">
                          {subscription.plan_name || 'Plan Pro'}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {subscription.billing_period === 'monthly' ? 'Facturé mensuellement' : 'Facturé annuellement'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-accent">
                          {subscription.price || 29}€
                        </p>
                        <p className="text-sm text-gray-400">
                          /{subscription.billing_period === 'monthly' ? 'mois' : 'an'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      {(() => {
                        const StatusIcon = getStatusIcon(subscription.status);
                        return <StatusIcon className={`w-5 h-5 ${getStatusColor(subscription.status)}`} />;
                      })()}
                      <span className={`font-semibold ${getStatusColor(subscription.status)}`}>
                        {getStatusLabel(subscription.status)}
                      </span>
                    </div>

                    {subscription.next_billing_date && (
                      <p className="text-sm text-gray-400">
                        Prochain paiement: {new Date(subscription.next_billing_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 p-6 rounded-xl text-center">
                    <p className="text-gray-400 mb-4">Aucun abonnement actif</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform">
                      Choisir un plan
                    </button>
                  </div>
                )}
              </div>

              {/* Méthode de paiement IBAN */}
              <div className="glass p-6 rounded-3xl mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Méthode de Paiement - Prélèvement SEPA
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">IBAN *</label>
                    <input
                      type="text"
                      value={paymentMethod.iban}
                      onChange={(e) => setPaymentMethod({
                        ...paymentMethod,
                        iban: formatIban(e.target.value)
                      })}
                      placeholder="FR76 1234 5678 9012 3456 7890 123"
                      maxLength={34}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: FR76 suivi de 23 chiffres (espaces automatiques)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nom du titulaire *</label>
                    <input
                      type="text"
                      value={paymentMethod.holder_name}
                      onChange={(e) => setPaymentMethod({
                        ...paymentMethod,
                        holder_name: e.target.value
                      })}
                      placeholder="Jean Dupont"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleSavePaymentMethod}
                    disabled={saving || !paymentMethod.iban || !paymentMethod.holder_name}
                    className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Enregistrer la méthode de paiement</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-sm text-blue-300">
                    🔒 <span className="font-semibold">Sécurisé:</span> Vos données bancaires sont chiffrées et sécurisées.
                    En enregistrant votre IBAN, vous autorisez ReplyFast AI à prélever automatiquement votre abonnement.
                  </p>
                </div>
              </div>

              {/* Historique des paiements */}
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  Historique des Paiements
                </h3>

                {paymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {paymentHistory.map((payment, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/5 p-4 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-semibold">
                            {payment.description || 'Abonnement ReplyFast AI'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">
                            {payment.amount}€
                          </p>
                          <p className={`text-sm ${payment.status === 'paid' ? 'text-accent' : 'text-yellow-500'}`}>
                            {payment.status === 'paid' ? '✓ Payé' : '⏳ En attente'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Aucun paiement enregistré</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

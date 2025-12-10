import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader2, Sparkles, AlertCircle, Building2, Clock, RefreshCw, QrCode } from 'lucide-react';
import { useRouter } from 'next/router';
import { getSectorsList } from '../lib/sectors';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';

const FuturisticBackground = dynamic(() => import('../components/FuturisticBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />
});

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // WAHA States
  const [wahaStatus, setWahaStatus] = useState('idle');
  const [qrCode, setQrCode] = useState(null);
  const [wahaError, setWahaError] = useState(null);
  const [wahaMe, setWahaMe] = useState(null);
  const pollInterval = useRef(null);

  const [formData, setFormData] = useState({
    sector: '',
    nom_entreprise: '',
    telephone: '',
    adresse: '',
    email_contact: '',
    description: '',
    horaires: {
      lundi: { ouvert: true, horaires: '09:00-18:00' },
      mardi: { ouvert: true, horaires: '09:00-18:00' },
      mercredi: { ouvert: true, horaires: '09:00-18:00' },
      jeudi: { ouvert: true, horaires: '09:00-18:00' },
      vendredi: { ouvert: true, horaires: '09:00-18:00' },
      samedi: { ouvert: true, horaires: '10:00-17:00' },
      dimanche: { ouvert: false, horaires: 'Ferme' }
    }
  });

  useEffect(() => {
    checkUser();
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        const { data: client } = await supabase
          .from('clients')
          .select('profile_completed')
          .eq('email', session.user.email)
          .maybeSingle();

        if (client?.profile_completed) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erreur checkUser:', error);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // ============ WAHA FUNCTIONS ============

  const startWahaSession = async () => {
    setWahaStatus('starting');
    setWahaError(null);
    setQrCode(null);

    try {
      const startRes = await fetch('/api/waha/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionName: 'default' })
      });

      const startData = await startRes.json();

      // Handle server not available
      if (startRes.status === 503) {
        setWahaStatus('starting');
        // Retry after 3 seconds silently
        setTimeout(() => startWahaSession(), 3000);
        return;
      }

      if (startData.status === 'WORKING') {
        setWahaStatus('connected');
        setWhatsappConnected(true);
        return;
      }

      // Session started, fetch QR code
      setTimeout(() => fetchQrCode(), 2000);

    } catch (error) {
      console.error('WAHA start error:', error);
      // Retry silently instead of showing error
      setWahaStatus('starting');
      setTimeout(() => startWahaSession(), 3000);
    }
  };

  const fetchQrCode = async () => {
    try {
      const qrRes = await fetch('/api/waha/get-qr?sessionName=default');
      const qrData = await qrRes.json();

      if (qrData.qr) {
        setQrCode(qrData.qr);
        setWahaStatus('qr_ready');
        startStatusPolling();
      } else {
        // Keep trying silently
        setTimeout(() => fetchQrCode(), 2000);
      }
    } catch (error) {
      console.error('QR fetch error:', error);
      // Retry silently
      setTimeout(() => fetchQrCode(), 3000);
    }
  };

  const startStatusPolling = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);

    pollInterval.current = setInterval(async () => {
      try {
        const statusRes = await fetch('/api/waha/check-status?sessionName=default');
        const statusData = await statusRes.json();

        if (statusData.connected) {
          clearInterval(pollInterval.current);
          setWahaStatus('connected');
          setWhatsappConnected(true);
          setWahaMe(statusData.me);
          setQrCode(null);
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    }, 3000);
  };

  const refreshQrCode = () => {
    setQrCode(null);
    setWahaStatus('starting');
    startWahaSession();
  };

  // ============ SUBMIT ============

  const handleSubmit = async (skipWhatsApp = false) => {
    if (!whatsappConnected && !skipWhatsApp) {
      setShowSkipWarning(true);
      return;
    }

    setLoading(true);
    try {
      if (!formData.sector) {
        throw new Error('Veuillez selectionner un secteur d\'activite');
      }

      const sanitizedData = {
        sector: formData.sector.trim(),
        nom_entreprise: formData.nom_entreprise.trim().replace(/[<>]/g, ''),
        telephone: formData.telephone.trim(),
        adresse: formData.adresse.trim().replace(/[<>]/g, ''),
        email_contact: formData.email_contact.trim().toLowerCase(),
        description: formData.description.trim().replace(/[<>]/g, '')
      };

      const { error: clientError } = await supabase
        .from('clients')
        .update({
          sector: sanitizedData.sector,
          whatsapp_connected: whatsappConnected,
          waha_session: whatsappConnected ? 'default' : null,
          waha_phone: wahaMe?.id?.replace('@c.us', '') || null,
          company_name: sanitizedData.nom_entreprise,
          profile_completed: true
        })
        .eq('email', user.email);

      if (clientError) throw clientError;

      const { error: businessError } = await supabase
        .from('business_info')
        .upsert({
          client_email: user.email,
          nom_entreprise: sanitizedData.nom_entreprise,
          telephone: sanitizedData.telephone,
          adresse: sanitizedData.adresse,
          email_contact: sanitizedData.email_contact,
          description: sanitizedData.description,
          horaires: formData.horaires,
          tarifs: {}
        });

      if (businessError) throw businessError;

      await supabase
        .from('user_preferences')
        .upsert({
          user_email: user.email,
          theme: 'dark',
          langue: 'fr',
          notifications_email: true,
          notifications_rdv: true,
          notifications_nouveaux_clients: true
        }, { onConflict: 'user_email' });

      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur onboarding:', error);
      alert('Erreur: ' + error.message);
      setLoading(false);
    }
  };

  const stepIcons = [
    <Sparkles key="1" className="w-5 h-5" />,
    <Building2 key="2" className="w-5 h-5" />,
    <Clock key="3" className="w-5 h-5" />,
    <QrCode key="4" className="w-5 h-5" />
  ];

  const stepTitles = ['Secteur', 'Entreprise', 'Horaires', 'WhatsApp'];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <FuturisticBackground />
      <div className="fixed inset-0 bg-black/70 pointer-events-none z-[1]" />

      {/* Skip Warning Modal */}
      <AnimatePresence>
        {showSkipWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowSkipWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 rounded-2xl bg-gray-900 border border-orange-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white">WhatsApp non connecte</h3>
              </div>

              <p className="text-gray-400 mb-6">
                Sans WhatsApp, votre assistant IA ne pourra pas recevoir ni envoyer de messages.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipWarning(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-semibold"
                >
                  Connecter
                </button>
                <button
                  onClick={() => {
                    setShowSkipWarning(false);
                    handleSubmit(true);
                  }}
                  className="flex-1 py-3 border border-white/20 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s, i) => (
              <div key={s} className="flex items-center">
                <motion.div
                  animate={{ scale: s === step ? 1.1 : 1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    s < step ? 'bg-green-500 text-white' :
                    s === step ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' :
                    'bg-white/5 text-gray-500 border border-white/10'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : stepIcons[i]}
                </motion.div>
                {s < 4 && (
                  <div className={`w-12 md:w-20 h-1 mx-2 rounded-full ${s < step ? 'bg-green-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2">
            {stepTitles.map((title, i) => (
              <span key={i} className={`text-xs ${i + 1 === step ? 'text-primary' : 'text-gray-500'}`}>{title}</span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
          <AnimatePresence mode="wait">
            {/* ETAPE 1 */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Bienvenue sur ReplyFast AI</h2>
                  <p className="text-gray-400">Configurons votre assistant</p>
                </div>
                <div>
                  <label className="block text-white font-medium mb-3">Secteur d'activite</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="" className="bg-gray-900">Selectionnez...</option>
                    {getSectorsList().sort((a, b) => a.name.localeCompare(b.name, 'fr')).map((sector) => (
                      <option key={sector.id} value={sector.id} className="bg-gray-900">{sector.emoji} {sector.name}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* ETAPE 2 */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Informations entreprise</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nom *</label>
                    <input type="text" value={formData.nom_entreprise} onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })} placeholder="Mon Entreprise" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Telephone</label>
                      <input type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} placeholder="+33 6 12 34 56 78" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email</label>
                      <input type="email" value={formData.email_contact} onChange={(e) => setFormData({ ...formData, email_contact: e.target.value })} placeholder="contact@email.fr" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Adresse</label>
                    <input type="text" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} placeholder="123 Rue..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ETAPE 3 */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Horaires</h2>
                </div>
                <div className="space-y-2">
                  {Object.keys(formData.horaires).map((jour) => (
                    <div key={jour} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <input type="checkbox" checked={formData.horaires[jour].ouvert} onChange={(e) => setFormData({ ...formData, horaires: { ...formData.horaires, [jour]: { ...formData.horaires[jour], ouvert: e.target.checked, horaires: e.target.checked ? '09:00-18:00' : 'Ferme' } } })} className="w-5 h-5" />
                      <span className="text-white font-medium capitalize w-24">{jour}</span>
                      {formData.horaires[jour].ouvert ? (
                        <input type="text" value={formData.horaires[jour].horaires} onChange={(e) => setFormData({ ...formData, horaires: { ...formData.horaires, [jour]: { ...formData.horaires[jour], horaires: e.target.value } } })} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                      ) : (
                        <span className="text-gray-500 text-sm">Ferme</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ETAPE 4: WAHA QR CODE */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Connecter WhatsApp</h2>
                    <p className="text-sm text-gray-400">Scannez le QR code</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {wahaError && (
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-center">
                      <p className="font-medium">Connexion en cours...</p>
                      <p className="text-sm mt-1 text-orange-300/70">Veuillez patienter quelques instants</p>
                    </div>
                  )}

                  {wahaStatus === 'idle' && (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <QrCode className="w-10 h-10 text-gray-500" />
                      </div>
                      <p className="text-gray-400 mb-6">Cliquez pour generer le QR code</p>
                      <button onClick={startWahaSession} className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all">
                        Generer le QR Code
                      </button>
                    </div>
                  )}

                  {wahaStatus === 'starting' && (
                    <div className="text-center py-8">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">Generation du QR code...</p>
                    </div>
                  )}

                  {wahaStatus === 'qr_ready' && qrCode && (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-2xl inline-block mb-4">
                        <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
                      </div>
                      <p className="text-gray-400 mb-2">Ouvrez WhatsApp sur votre telephone</p>
                      <p className="text-gray-500 text-sm mb-4">Parametres → Appareils lies → Lier un appareil</p>
                      <button onClick={refreshQrCode} className="flex items-center gap-2 mx-auto text-gray-400 hover:text-white transition-colors">
                        <RefreshCw className="w-4 h-4" /> Regenerer
                      </button>
                    </div>
                  )}

                  {wahaStatus === 'connected' && (
                    <div className="p-6 rounded-xl border border-green-500/50 bg-green-500/10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">WhatsApp connecte!</p>
                          {wahaMe && <p className="text-gray-300 text-sm">{wahaMe.pushName || wahaMe.id?.replace('@c.us', '')}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {wahaStatus === 'error' && (
                    <div className="text-center py-4">
                      <button onClick={startWahaSession} className="px-6 py-3 bg-primary rounded-xl text-white font-semibold">Reessayer</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button onClick={handlePrev} disabled={step === 1} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-5 h-5" /> Retour
            </button>

            {step < 4 ? (
              <button onClick={handleNext} disabled={(step === 1 && !formData.sector) || (step === 2 && !formData.nom_entreprise)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Suivant <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => handleSubmit(false)} disabled={loading} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${whatsappConnected ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' : 'bg-gradient-to-r from-primary to-secondary text-white'}`}>
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Configuration...</> : <><Check className="w-5 h-5" /> {whatsappConnected ? 'Terminer' : 'Continuer'}</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

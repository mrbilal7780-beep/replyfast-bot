import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { getSectorsList } from '../lib/sectors';
import { supabase } from '../lib/supabase';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [sessionName, setSessionName] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Données du formulaire
  const [formData, setFormData] = useState({
    // Étape 1: Secteur
    sector: '',

    // Étape 2: Infos entreprise
    nom_entreprise: '',
    telephone: '',
    adresse: '',
    email_contact: '',
    description: '',

    // Étape 3: Horaires
    horaires: {
      lundi: { ouvert: true, horaires: '09:00-18:00' },
      mardi: { ouvert: true, horaires: '09:00-18:00' },
      mercredi: { ouvert: true, horaires: '09:00-18:00' },
      jeudi: { ouvert: true, horaires: '09:00-18:00' },
      vendredi: { ouvert: true, horaires: '09:00-18:00' },
      samedi: { ouvert: true, horaires: '10:00-17:00' },
      dimanche: { ouvert: false, horaires: 'Fermé' }
    },

    // WhatsApp (sera rempli automatiquement par Embedded Signup)
    whatsapp_phone_number_id: '',
    waba_id: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);

        // Vérifier si déjà configuré
        const { data: client, error } = await supabase
          .from('clients')
          .select('profile_completed')
          .eq('email', session.user.email)
          .maybeSingle();

        if (error) {
          console.error('Erreur checkUser onboarding:', error);
        }

        if (client?.profile_completed) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erreur dans checkUser:', error);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // WAHA QR Code Connection
  const handleWhatsAppConnect = async () => {
    setLoading(true);

    try {
      // Démarrer la session WAHA
      const response = await fetch('/api/waha/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur démarrage session');
      }

      setSessionName(data.sessionName);

      // Récupérer le QR code
      await fetchQRCode(data.sessionName);

      // Commencer à vérifier le statut
      startStatusCheck(data.sessionName);

    } catch (error) {
      console.error('Erreur connexion WAHA:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async (session) => {
    try {
      const response = await fetch(`/api/waha/get-qr?sessionName=${session}`);
      const data = await response.json();

      if (response.ok && data.image) {
        setQrCode(data.image);
      }
    } catch (error) {
      console.error('Erreur récupération QR:', error);
    }
  };

  const startStatusCheck = (session) => {
    setCheckingStatus(true);

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/waha/check-status?sessionName=${session}`);
        const data = await response.json();

        if (data.status === 'WORKING') {
          setWhatsappConnected(true);
          setCheckingStatus(false);
          setQrCode(null);
          clearInterval(interval);
          alert('✅ WhatsApp connecté avec succès !');
        }
      } catch (error) {
        console.error('Erreur vérification status:', error);
      }
    }, 3000); // Vérifier toutes les 3 secondes

    // Timeout après 5 minutes
    setTimeout(() => {
      if (!whatsappConnected) {
        clearInterval(interval);
        setCheckingStatus(false);
        alert('⏱️ Timeout. Veuillez réessayer.');
      }
    }, 300000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validation: vérifier que le secteur est bien défini
      if (!formData.sector) {
        throw new Error('Veuillez sélectionner un secteur d\'activité');
      }

      console.log('💾 Sauvegarde onboarding...', {
        email: user.email,
        sector: formData.sector,
        company: formData.nom_entreprise
      });

      // 1. Sauvegarder dans clients
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .update({
          sector: formData.sector,
          whatsapp_phone_number_id: formData.whatsapp_phone_number_id || null,
          waba_id: formData.waba_id || null,
          whatsapp_connected: whatsappConnected,
          company_name: formData.nom_entreprise,
          profile_completed: true
        })
        .eq('email', user.email)
        .select();

      if (clientError) {
        console.error('❌ Erreur clients update:', clientError);
        throw clientError;
      }

      console.log('✅ Client mis à jour:', clientData);

      // 2. Sauvegarder business_info
      const { data: businessData, error: businessError } = await supabase
        .from('business_info')
        .upsert({
          client_email: user.email,
          nom_entreprise: formData.nom_entreprise,
          telephone: formData.telephone,
          adresse: formData.adresse,
          email_contact: formData.email_contact,
          description: formData.description,
          horaires: formData.horaires,
          tarifs: {} // Vide, sera rempli dans Menu Manager
        })
        .select();

      if (businessError) {
        console.error('❌ Erreur business_info upsert:', businessError);
        throw businessError;
      }

      console.log('✅ Business info créé:', businessData);

      // 3. Créer préférences utilisateur
      const { data: prefsData, error: prefsError} = await supabase
        .from('user_preferences')
        .upsert({
          user_email: user.email,
          theme: 'dark',
          langue: 'fr',
          notifications_email: true,
          notifications_rdv: true,
          notifications_nouveaux_clients: true
        }, {
          onConflict: 'user_email'  // 🔧 FIX: Spécifier la clé unique pour éviter les duplicates
        })
        .select();

      if (prefsError) {
        console.error('❌ Erreur user_preferences upsert:', prefsError);
        throw prefsError;
      }

      console.log('✅ Préférences créées:', prefsData);
      console.log('✅ Onboarding complété avec succès !');

      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Erreur onboarding:', error);
      alert('Erreur lors de la configuration: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="fixed inset-0 gradient-bg opacity-10"></div>

      {/* Bouton "Se connecter" en haut à droite */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/20"
        >
          Se connecter
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-3xl"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  s < step ? 'bg-accent text-dark' :
                  s === step ? 'bg-primary text-white' :
                  'bg-white/10 text-gray-500'
                }`}>
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    s < step ? 'bg-accent' : 'bg-white/10'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            Étape {step} sur 4
          </p>
        </div>

        {/* Card */}
        <div className="glass p-8 rounded-3xl">
          <AnimatePresence mode="wait">
            {/* ÉTAPE 1: SECTEUR */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Bienvenue sur ReplyFast AI
                  </h2>
                  <p className="text-gray-400">
                    Commençons par configurer votre secteur d'activité
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-white font-semibold mb-2">
                    Quel est votre secteur d'activité?
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">Sélectionnez...</option>
                    {getSectorsList()
                      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
                      .map((sector) => (
                        <option key={sector.id} value={sector.id} className="bg-dark">
                          {sector.emoji} {sector.name}
                        </option>
                      ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 2: INFOS ENTREPRISE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Informations de votre entreprise
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      value={formData.nom_entreprise}
                      onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
                      placeholder="Salon Élégance"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="+32 4XX XX XX XX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      placeholder="123 Rue de la Paix, Bruxelles"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      value={formData.email_contact}
                      onChange={(e) => setFormData({ ...formData, email_contact: e.target.value })}
                      placeholder="contact@votresalon.be"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez votre entreprise en quelques mots..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3: HORAIRES */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Horaires d'ouverture
                </h2>

                <div className="space-y-3">
                  {Object.keys(formData.horaires).map((jour) => (
                    <div key={jour} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                      <input
                        type="checkbox"
                        checked={formData.horaires[jour].ouvert}
                        onChange={(e) => setFormData({
                          ...formData,
                          horaires: {
                            ...formData.horaires,
                            [jour]: {
                              ...formData.horaires[jour],
                              ouvert: e.target.checked,
                              horaires: e.target.checked ? '09:00-18:00' : 'Fermé'
                            }
                          }
                        })}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold capitalize">{jour}</span>
                      </div>
                      {formData.horaires[jour].ouvert && (
                        <input
                          type="text"
                          value={formData.horaires[jour].horaires}
                          onChange={(e) => setFormData({
                            ...formData,
                            horaires: {
                              ...formData.horaires,
                              [jour]: {
                                ...formData.horaires[jour],
                                horaires: e.target.value
                              }
                            }
                          })}
                          placeholder="09:00-18:00"
                          className="w-40 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                        />
                      )}
                      {!formData.horaires[jour].ouvert && (
                        <span className="text-gray-500 text-sm">Fermé</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 4: WHATSAPP QR CODE (WAHA) */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Connecter WhatsApp
                </h2>

                <div className="space-y-6">
                  {/* Info box */}
                  <div className="glass p-6 rounded-xl border border-primary/30">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div className="text-sm text-gray-300 space-y-2">
                        <p className="font-semibold text-white">
                          Scanner le QR code avec WhatsApp
                        </p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Ouvrez WhatsApp sur votre téléphone</li>
                          <li>Menu (⋮) → Appareils connectés → Connecter un appareil</li>
                          <li>Scannez le QR code ci-dessous</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* QR Code ou Bouton */}
                  {!whatsappConnected ? (
                    !qrCode ? (
                      <button
                        onClick={handleWhatsAppConnect}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Génération du QR code...
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Générer le QR Code WhatsApp
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="glass p-6 rounded-2xl">
                          <img
                            src={qrCode}
                            alt="QR Code WhatsApp"
                            className="w-64 h-64 rounded-xl"
                          />
                        </div>
                        {checkingStatus && (
                          <div className="flex items-center gap-2 text-accent">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="text-sm">En attente de scan...</span>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="glass p-6 rounded-xl border border-green-500/50 bg-green-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">WhatsApp connecté avec succès!</p>
                          <p className="text-gray-300 text-sm">
                            Votre compte WhatsApp est prêt à recevoir des messages.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !formData.sector) ||
                  (step === 2 && !formData.nom_entreprise)
                }
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {whatsappConnected ? 'Terminer la configuration' : 'Configurer WhatsApp plus tard'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

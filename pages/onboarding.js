import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader2, Sparkles, AlertCircle, MessageSquare, Building2, Clock, Smartphone } from 'lucide-react';
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

  // Donnees du formulaire
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
    },
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

  // Meta Embedded Signup
  const handleWhatsAppConnect = () => {
    if (typeof window === 'undefined' || !window.FB) {
      alert('SDK Facebook non charge. Actualisez la page et reessayez.');
      return;
    }

    setLoading(true);

    window.FB.login(function(response) {
      if (response.authResponse) {
        const phoneNumberId = response.authResponse.phone_number_id;
        const wabaId = response.authResponse.waba_id;

        setFormData({
          ...formData,
          whatsapp_phone_number_id: phoneNumberId,
          waba_id: wabaId
        });

        setWhatsappConnected(true);
        setLoading(false);
      } else {
        setLoading(false);
        alert('Connexion annulee. Reessayez.');
      }
    }, {
      scope: 'whatsapp_business_management,whatsapp_business_messaging',
      extras: {
        setup: {}
      }
    });
  };

  const handleSubmit = async (skipWhatsApp = false) => {
    // Validation: WhatsApp obligatoire sauf si skip explicite
    if (!whatsappConnected && !skipWhatsApp) {
      setShowSkipWarning(true);
      return;
    }

    setLoading(true);
    try {
      if (!formData.sector) {
        throw new Error('Veuillez selectionner un secteur d\'activite');
      }

      // Sanitize inputs
      const sanitizedData = {
        sector: formData.sector.trim(),
        nom_entreprise: formData.nom_entreprise.trim().replace(/[<>]/g, ''),
        telephone: formData.telephone.trim(),
        adresse: formData.adresse.trim().replace(/[<>]/g, ''),
        email_contact: formData.email_contact.trim().toLowerCase(),
        description: formData.description.trim().replace(/[<>]/g, '')
      };

      // 1. Sauvegarder dans clients
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          sector: sanitizedData.sector,
          whatsapp_phone_number_id: formData.whatsapp_phone_number_id || null,
          waba_id: formData.waba_id || null,
          whatsapp_connected: whatsappConnected,
          company_name: sanitizedData.nom_entreprise,
          profile_completed: true
        })
        .eq('email', user.email);

      if (clientError) throw clientError;

      // 2. Sauvegarder business_info
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

      // 3. Creer preferences utilisateur
      await supabase
        .from('user_preferences')
        .upsert({
          user_email: user.email,
          theme: 'dark',
          langue: 'fr',
          notifications_email: true,
          notifications_rdv: true,
          notifications_nouveaux_clients: true
        }, {
          onConflict: 'user_email'
        });

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
    <Smartphone key="4" className="w-5 h-5" />
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
                Sans WhatsApp, votre assistant IA ne pourra pas recevoir ni envoyer de messages a vos clients.
                Vous pourrez le configurer plus tard dans les parametres.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipWarning(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-semibold"
                >
                  Connecter WhatsApp
                </button>
                <button
                  onClick={() => {
                    setShowSkipWarning(false);
                    handleSubmit(true);
                  }}
                  className="flex-1 py-3 border border-white/20 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  Continuer sans
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
                  initial={{ scale: 0.8 }}
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
                  <div className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-colors ${
                    s < step ? 'bg-green-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2">
            {stepTitles.map((title, i) => (
              <span key={i} className={`text-xs ${i + 1 === step ? 'text-primary' : 'text-gray-500'}`}>
                {title}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
          <AnimatePresence mode="wait">
            {/* ETAPE 1: SECTEUR */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Bienvenue sur ReplyFast AI
                  </h2>
                  <p className="text-gray-400">
                    Configurons votre assistant en quelques etapes
                  </p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">
                    Quel est votre secteur d'activite?
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">Selectionnez votre secteur...</option>
                    {getSectorsList()
                      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
                      .map((sector) => (
                        <option key={sector.id} value={sector.id} className="bg-gray-900">
                          {sector.emoji} {sector.name}
                        </option>
                      ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* ETAPE 2: INFOS ENTREPRISE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Informations entreprise
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      value={formData.nom_entreprise}
                      onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
                      placeholder="Salon Elegance"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Telephone</label>
                      <input
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email contact</label>
                      <input
                        type="email"
                        value={formData.email_contact}
                        onChange={(e) => setFormData({ ...formData, email_contact: e.target.value })}
                        placeholder="contact@entreprise.fr"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Adresse</label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      placeholder="123 Rue de la Paix, 75001 Paris"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Description (optionnel)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Decrivez votre entreprise..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ETAPE 3: HORAIRES */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Horaires d'ouverture
                  </h2>
                </div>

                <div className="space-y-2">
                  {Object.keys(formData.horaires).map((jour) => (
                    <div key={jour} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
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
                              horaires: e.target.checked ? '09:00-18:00' : 'Ferme'
                            }
                          }
                        })}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                      />
                      <span className="text-white font-medium capitalize w-24">{jour}</span>
                      {formData.horaires[jour].ouvert ? (
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
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">Ferme</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ETAPE 4: WHATSAPP */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Connecter WhatsApp Business
                    </h2>
                    <p className="text-sm text-orange-400">Obligatoire pour recevoir des messages</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-300 space-y-2">
                        <p>
                          Cliquez sur le bouton pour connecter votre WhatsApp Business via Meta.
                          Si vous n'avez pas de compte, il sera cree automatiquement.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!whatsappConnected ? (
                    <button
                      onClick={handleWhatsAppConnect}
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-semibold text-lg hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Connecter WhatsApp Business
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-6 rounded-xl border border-green-500/50 bg-green-500/10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">WhatsApp connecte!</p>
                          <p className="text-gray-300 text-sm">
                            Votre assistant IA est pret a recevoir des messages.
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
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                  whatsappConnected
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg hover:shadow-green-500/25'
                    : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {whatsappConnected ? 'Terminer' : 'Continuer'}
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

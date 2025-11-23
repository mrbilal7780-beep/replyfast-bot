import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader, Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { getSectorsList } from '../lib/sectors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
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
    
    // Étape 4: Tarifs (adapté au secteur)
    tarifs: {},
    
    // Étape 5: WhatsApp
    whatsapp_phone_number_id: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session.user);
      
      // Vérifier si déjà configuré
      const { data: client } = await supabase
        .from('clients')
        .select('profile_completed')
        .eq('email', session.user.email)
        .single();
      
      if (client?.profile_completed) {
        router.push('/dashboard');
      }
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Sauvegarder dans clients
      await supabase
        .from('clients')
        .upsert({
          email: user.email,
          sector: formData.sector,
          whatsapp_phone_number_id: formData.whatsapp_phone_number_id,
          whatsapp_connected: true,
          company_name: formData.nom_entreprise,
          profile_completed: true
        });

      // 2. Sauvegarder business_info
      await supabase
        .from('business_info')
        .upsert({
          client_email: user.email,
          nom_entreprise: formData.nom_entreprise,
          telephone: formData.telephone,
          adresse: formData.adresse,
          email_contact: formData.email_contact,
          description: formData.description,
          horaires: formData.horaires,
          tarifs: formData.tarifs
        });

      // 3. Créer préférences utilisateur
      await supabase
        .from('user_preferences')
        .upsert({
          user_email: user.email,
          theme: 'dark'
        });

      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la configuration: ' + error.message);
    }
    setLoading(false);
  };

  // Formulaires adaptés par secteur
  const getTarifsFields = () => {
    const sector = formData.sector;
    
    if (['coiffure', 'beaute', 'tatouage'].includes(sector)) {
      return ['Coupe homme', 'Coupe femme', 'Coloration', 'Brushing'];
    }
    if (['sport', 'fitness', 'yoga'].includes(sector)) {
      return ['Cotisation mensuelle', 'Cotisation annuelle', 'Cours à l\'unité'];
    }
    if (['restaurant', 'cafe'].includes(sector)) {
      return ['Menu du jour', 'Plat principal', 'Dessert', 'Boisson'];
    }
    if (['medecin', 'veterinaire'].includes(sector)) {
      return ['Consultation', 'Urgence', 'Visite à domicile'];
    }
    if (['garage', 'reparation'].includes(sector)) {
      return ['Révision', 'Vidange', 'Pneus', 'Diagnostic'];
    }
    
    return ['Service 1', 'Service 2', 'Service 3'];
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="fixed inset-0 gradient-bg opacity-10"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-3xl"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  s < step ? 'bg-accent text-dark' :
                  s === step ? 'bg-primary text-white' :
                  'bg-white/10 text-gray-500'
                }`}>
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 5 && (
                  <div className={`w-12 h-1 mx-2 ${
                    s < step ? 'bg-accent' : 'bg-white/10'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            Étape {step} sur 5
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
                    Bienvenue sur ReplyFast AI! 🎉
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
                  📋 Informations de votre entreprise
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
                      placeholder="+33 6 12 34 56 78"
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
                      placeholder="123 Rue de la Paix, Paris"
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
                      placeholder="contact@votresalon.fr"
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
                  🕐 Horaires d'ouverture
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

            {/* ÉTAPE 4: TARIFS */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  💰 Vos tarifs
                </h2>
                <p className="text-gray-400 mb-6">
                  Définissez vos principaux services et leurs prix
                </p>

                <div className="space-y-4">
                  {getTarifsFields().map((service) => (
                    <div key={service}>
                      <label className="block text-white font-semibold mb-2">
                        {service}
                      </label>
                      <input
                        type="text"
                        value={formData.tarifs[service] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          tarifs: {
                            ...formData.tarifs,
                            [service]: e.target.value
                          }
                        })}
                        placeholder="Ex: 25€"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 5: WHATSAPP */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  📱 Connecter WhatsApp Business
                </h2>

                <div className="glass p-6 rounded-xl mb-6 border border-accent/30">
                  <h3 className="text-lg font-bold text-white mb-4">
                    📚 Comment obtenir votre Phone Number ID
                  </h3>
                  <ol className="space-y-2 text-gray-300 text-sm">
                    <li>1. Va sur <a href="https://business.facebook.com" target="_blank" className="text-primary hover:underline">Meta Business Suite</a></li>
                    <li>2. Crée un compte WhatsApp Business (gratuit)</li>
                    <li>3. Va dans Paramètres → WhatsApp Business API</li>
                    <li>4. Copie le Phone Number ID (série de chiffres)</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Phone Number ID *
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp_phone_number_id}
                    onChange={(e) => setFormData({ ...formData, whatsapp_phone_number_id: e.target.value })}
                    placeholder="938427616001036"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
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

            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !formData.sector) ||
                  (step === 2 && !formData.nom_entreprise)
                }
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.whatsapp_phone_number_id}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Terminer
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
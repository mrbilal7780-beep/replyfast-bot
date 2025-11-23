import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, MessageSquare, Users, Zap, Settings, LogOut, Calendar, TrendingUp, Upload, User, Building, Palette, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { getSectorsList } from '../lib/sectors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profil');
  
  // Données profil
  const [profileData, setProfileData] = useState({
    email: '',
    nom_complet: '',
    telephone: ''
  });

  // Données entreprise
  const [businessData, setBusinessData] = useState({
    sector: '',
    whatsapp_phone_number_id: '',
    nom_entreprise: '',
    adresse: '',
    email_contact: '',
    site_web: '',
    description: '',
    horaires: {},
    tarifs: {}
  });

  // Préférences
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    notifications_email: true,
    notifications_rdv: true,
    notifications_nouveaux_clients: true,
    langue: 'fr'
  });

  useEffect(() => {
    checkUser();
    loadAllData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session.user);
      setProfileData({ ...profileData, email: session.user.email });
    }
  };

  const loadAllData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Charger données client
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (client) {
      setBusinessData({
        ...businessData,
        sector: client.sector || '',
        whatsapp_phone_number_id: client.whatsapp_phone_number_id || '',
        nom_entreprise: client.company_name || ''
      });
    }

    // Charger business_info
    const { data: businessInfo } = await supabase
      .from('business_info')
      .select('*')
      .eq('client_email', session.user.email)
      .single();
    
    if (businessInfo) {
      setBusinessData(prev => ({
        ...prev,
        nom_entreprise: businessInfo.nom_entreprise || prev.nom_entreprise,
        adresse: businessInfo.adresse || '',
        email_contact: businessInfo.email_contact || '',
        site_web: businessInfo.site_web || '',
        description: businessInfo.description || '',
        horaires: businessInfo.horaires || {},
        tarifs: businessInfo.tarifs || {}
      }));
    }

    // Charger préférences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_email', session.user.email)
      .single();
    
    if (prefs) {
      setPreferences({
        theme: prefs.theme || 'dark',
        notifications_email: prefs.notifications_email ?? true,
        notifications_rdv: prefs.notifications_rdv ?? true,
        notifications_nouveaux_clients: prefs.notifications_nouveaux_clients ?? true,
        langue: prefs.langue || 'fr'
      });
    }
  };

  const handleSaveProfil = async () => {
    setLoading(true);
    try {
      // Ici tu peux sauvegarder les infos profil si besoin
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };

  const handleSaveBusiness = async () => {
    setLoading(true);
    try {
      // Sauvegarder dans clients
      await supabase
        .from('clients')
        .upsert({
          email: user.email,
          sector: businessData.sector,
          whatsapp_phone_number_id: businessData.whatsapp_phone_number_id,
          whatsapp_connected: true,
          company_name: businessData.nom_entreprise,
          profile_completed: true
        });

      // Sauvegarder dans business_info
      await supabase
        .from('business_info')
        .upsert({
          client_email: user.email,
          nom_entreprise: businessData.nom_entreprise,
          adresse: businessData.adresse,
          email_contact: businessData.email_contact,
          site_web: businessData.site_web,
          description: businessData.description,
          horaires: businessData.horaires,
          tarifs: businessData.tarifs
        });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_email: user.email,
          ...preferences
        });

      // Appliquer le thème
      document.documentElement.setAttribute('data-theme', preferences.theme);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ReplyFast AI
          </h1>
          <p className="text-gray-400 text-sm mt-1">Paramètres</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
            { icon: Calendar, label: 'Smart RDV', path: '/appointments' },
            { icon: Upload, label: 'Menu Manager', path: '/menu' },
            { icon: Users, label: 'Clients', path: '/clients' },
            { icon: TrendingUp, label: 'Market Insights', path: '/market-insights' },
            { icon: Zap, label: 'Analytics', path: '/analytics' },
            { icon: Settings, label: 'Paramètres', path: '/settings', active: true },
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

      {/* Main Content */}
      <div className="ml-64 p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Paramètres
            </h1>
            <p className="text-gray-400">
              Gérez votre profil, entreprise et préférences
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-xl mb-6 border-2 border-accent flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-accent" />
              <span className="text-white">Paramètres sauvegardés!</span>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 glass p-2 rounded-xl">
            {[
              { id: 'profil', label: 'Profil', icon: User },
              { id: 'entreprise', label: 'Entreprise', icon: Building },
              { id: 'apparence', label: 'Apparence', icon: Palette }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB PROFIL */}
          {activeTab === 'profil' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-3xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                👤 Informations personnelles
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={profileData.nom_complet}
                    onChange={(e) => setProfileData({ ...profileData, nom_complet: e.target.value })}
                    placeholder="Jean Dupont"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Téléphone personnel
                  </label>
                  <input
                    type="tel"
                    value={profileData.telephone}
                    onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  onClick={handleSaveProfil}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB ENTREPRISE */}
          {activeTab === 'entreprise' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Secteur & WhatsApp */}
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">
                  🏢 Informations principales
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Secteur d'activité
                    </label>
                    <select
                      value={businessData.sector}
                      onChange={(e) => setBusinessData({ ...businessData, sector: e.target.value })}
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

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Phone Number ID WhatsApp
                    </label>
                    <input
                      type="text"
                      value={businessData.whatsapp_phone_number_id}
                      onChange={(e) => setBusinessData({ ...businessData, whatsapp_phone_number_id: e.target.value })}
                      placeholder="938427616001036"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">
                  📞 Coordonnées de l'entreprise
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={businessData.nom_entreprise}
                      onChange={(e) => setBusinessData({ ...businessData, nom_entreprise: e.target.value })}
                      placeholder="Salon Élégance"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={businessData.adresse}
                      onChange={(e) => setBusinessData({ ...businessData, adresse: e.target.value })}
                      placeholder="123 Rue de la Paix, Paris"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email de contact
                    </label>
                    <input
                      type="email"
                      value={businessData.email_contact}
                      onChange={(e) => setBusinessData({ ...businessData, email_contact: e.target.value })}
                      placeholder="contact@entreprise.fr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Site web
                    </label>
                    <input
                      type="url"
                      value={businessData.site_web}
                      onChange={(e) => setBusinessData({ ...businessData, site_web: e.target.value })}
                      placeholder="https://votresite.fr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Description
                    </label>
                    <textarea
                      value={businessData.description}
                      onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                      placeholder="Décrivez votre entreprise..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveBusiness}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </button>
            </motion.div>
          )}

          {/* TAB APPARENCE */}
          {activeTab === 'apparence' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-3xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                🎨 Apparence et préférences
              </h3>

              <div className="space-y-6">
                {/* Thème */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Thème de l'interface
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.theme === 'dark'
                          ? 'border-primary bg-primary/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 mb-3"></div>
                      <p className="text-white font-semibold">Sombre</p>
                    </button>

                    <button
                      onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.theme === 'light'
                          ? 'border-primary bg-primary/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg bg-gradient-to-br from-gray-100 to-white mb-3"></div>
                      <p className="text-white font-semibold">Clair</p>
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <span className="text-white">Notifications par email</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications_email}
                        onChange={(e) => setPreferences({ ...preferences, notifications_email: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <span className="text-white">Rappels de rendez-vous</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications_rdv}
                        onChange={(e) => setPreferences({ ...preferences, notifications_rdv: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <span className="text-white">Nouveaux clients</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications_nouveaux_clients}
                        onChange={(e) => setPreferences({ ...preferences, notifications_nouveaux_clients: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
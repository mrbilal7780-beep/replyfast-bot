import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, MessageSquare, Users, Zap, Settings, LogOut, Calendar, TrendingUp, Upload, User, Building, Palette, Mail, Phone, MapPin, Globe, Camera, Lock, CreditCard, FileText, Shield, ExternalLink, Bot } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { getSectorsList } from '../lib/sectors';
import MobileMenu from '../components/MobileMenu';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profil');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

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

  // Sécurité
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Paiements (simulé pour la démo)
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    checkUser();
    loadAllData();
    loadPaymentHistory();
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

      // Charger photo de profil
      if (client.profile_photo_url) {
        setProfilePhotoUrl(client.profile_photo_url);
      }
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

  const loadPaymentHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('payment_history')
      .select('*')
      .eq('client_email', session.user.email)
      .order('payment_date', { ascending: false })
      .limit(10);

    if (data) {
      setPaymentHistory(data);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ La photo ne doit pas dépasser 5MB');
      return;
    }

    // Vérifier type
    if (!file.type.startsWith('image/')) {
      alert('❌ Seules les images sont acceptées');
      return;
    }

    setUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.email}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Récupérer URL publique
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const photoUrl = data.publicUrl;

      // Sauvegarder dans la DB
      await supabase
        .from('clients')
        .update({ profile_photo_url: photoUrl })
        .eq('email', user.email);

      setProfilePhotoUrl(photoUrl);
      alert('✅ Photo de profil mise à jour !');

    } catch (error) {
      console.error(error);
      alert('❌ Erreur lors de l\'upload : ' + error.message);
    }

    setUploadingPhoto(false);
  };

  const handleSaveProfil = async () => {
    setLoading(true);
    try {
      // Sauvegarder nom et téléphone dans clients
      await supabase
        .from('clients')
        .update({
          first_name: profileData.nom_complet.split(' ')[0],
          last_name: profileData.nom_complet.split(' ').slice(1).join(' '),
          phone: profileData.telephone
        })
        .eq('email', user.email);

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
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_email: user.email,
          client_email: user.email,
          ...preferences
        });

      if (error) throw error;

      // Appliquer le thème ET le sauvegarder dans localStorage
      document.documentElement.setAttribute('data-theme', preferences.theme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(preferences.theme);
      localStorage.setItem('replyfast_theme', preferences.theme);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Erreur save preferences:', error);
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('❌ Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      alert('✅ Mot de passe modifié avec succès !');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert('❌ Erreur : ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Fond animé */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
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
            { icon: Bot, label: 'Assistant IA', path: '/ai-assistant' },
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
              ⚙️ Paramètres
            </h1>
            <p className="text-gray-400">
              Gérez votre profil, entreprise, sécurité et paiements
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
          <div className="flex gap-2 mb-6 glass p-2 rounded-xl overflow-x-auto">
            {[
              { id: 'profil', label: 'Profil', icon: User },
              { id: 'entreprise', label: 'Entreprise', icon: Building },
              { id: 'security', label: 'Sécurité', icon: Lock },
              { icon: 'payment', label: 'Paiement', icon: CreditCard },
              { id: 'apparence', label: 'Apparence', icon: Palette }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
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

              {/* Photo de profil */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <label className="block text-white font-semibold mb-3">
                  Photo de profil
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary/50"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                    >
                      {uploadingPhoto ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">Modifier la photo</p>
                    <p className="text-gray-400 text-sm">JPG, PNG ou GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>

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

          {/* TAB SÉCURITÉ */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-3xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent" />
                Sécurité du compte
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Minimum 6 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="w-full py-3 bg-gradient-to-r from-accent to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Modification...' : 'Changer le mot de passe'}
                </button>

                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4">
                  <p className="text-yellow-500 text-sm flex items-start gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Votre mot de passe est crypté et sécurisé. Nous ne pourrons jamais le voir.
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB PAIEMENT */}
          {activeTab === 'payment' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Abonnement actuel
                </h3>

                <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-6 rounded-xl mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-2xl font-bold text-white">Plan Pro</h4>
                      <p className="text-gray-300">Abonnement mensuel</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-accent">19,99€</p>
                      <p className="text-gray-400 text-sm">/mois</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full">Actif</span>
                    <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full">Renouvellement automatique</span>
                  </div>
                </div>

                <button
                  className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl font-semibold transition-colors"
                  onClick={() => alert('Redirection vers Stripe pour gérer l\'abonnement...')}
                >
                  Gérer l'abonnement
                </button>
              </div>

              <div className="glass p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">
                  📜 Historique des paiements
                </h3>

                {paymentHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun paiement enregistré pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <div>
                          <p className="text-white font-semibold">{payment.amount}€</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            payment.status === 'succeeded'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {payment.status === 'succeeded' ? 'Payé' : 'Échec'}
                          </span>
                          {payment.invoice_url && (
                            <a
                              href={payment.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-accent transition-colors"
                            >
                              <FileText className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

                <div>
                  <label className="block text-white font-semibold mb-3">
                    Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-white">Notifications par email</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications_email}
                        onChange={(e) => setPreferences({ ...preferences, notifications_email: e.target.checked })}
                        className="w-5 h-5 accent-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-white">Rappels de rendez-vous</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications_rdv}
                        onChange={(e) => setPreferences({ ...preferences, notifications_rdv: e.target.checked })}
                        className="w-5 h-5 accent-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-white">Nouveaux clients</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications_nouveaux_clients}
                        onChange={(e) => setPreferences({ ...preferences, notifications_nouveaux_clients: e.target.checked })}
                        className="w-5 h-5 accent-primary"
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

          {/* Legal Footer */}
          <div className="mt-8 glass p-6 rounded-xl">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                <FileText className="w-4 h-4" />
                CGV
              </a>
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Confidentialité
              </a>
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                RGPD
              </a>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              © 2025 ReplyFast AI. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

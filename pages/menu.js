import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, Upload, Save, Trash2, TrendingUp, Tag, Plus, Edit2, X, Bot } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import MobileMenu from '../components/MobileMenu';

export default function MenuManager() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuText, setMenuText] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' ou 'offers'

  // Offres spéciales
  const [offers, setOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    original_price: '',
    promo_price: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    checkUser();
    loadMenu();
    loadOffers();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session.user);
    }
  };

  const loadMenu = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('menus')
        .select('*')
        .eq('client_email', session.user.email)
        .single();

      if (data) {
        setMenuText(data.menu_text || '');
      }
    }
  };

  const loadOffers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('special_offers')
        .select('*')
        .eq('client_email', session.user.email)
        .order('start_date', { ascending: false });

      if (data) {
        setOffers(data);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (isPDF) {
      alert('📄 Upload PDF détecté!\n\nL\'extraction automatique de texte depuis PDF sera implémentée prochainement.\n\nPour l\'instant, saisissez votre menu manuellement ci-dessous.');
    } else if (isImage) {
      alert('📷 Upload d\'image détecté!\n\nL\'OCR (reconnaissance de texte) sera implémenté prochainement.\n\nPour l\'instant, saisissez votre menu manuellement ci-dessous.');
    } else {
      alert('❌ Format de fichier non supporté.\n\nUtilisez: PNG, JPG, JPEG ou PDF');
    }
  };

  const handleSaveMenu = async () => {
    setLoading(true);
    try {
      const { data: existingMenu } = await supabase
        .from('menus')
        .select('*')
        .eq('client_email', user.email)
        .single();

      if (existingMenu) {
        const { error } = await supabase
          .from('menus')
          .update({
            menu_text: menuText,
            updated_at: new Date().toISOString()
          })
          .eq('client_email', user.email);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menus')
          .insert([{
            client_email: user.email,
            menu_text: menuText
          }]);

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };

  const handleDeleteMenu = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre menu?')) return;

    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('client_email', user.email);

    if (!error) {
      setMenuText('');
      alert('Menu supprimé!');
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingOffer) {
        // Mise à jour
        const { error } = await supabase
          .from('special_offers')
          .update({
            ...offerForm,
            original_price: parseFloat(offerForm.original_price),
            promo_price: parseFloat(offerForm.promo_price)
          })
          .eq('id', editingOffer.id);

        if (error) throw error;
        alert('✅ Offre mise à jour!');
      } else {
        // Création
        const { error } = await supabase
          .from('special_offers')
          .insert([{
            client_email: user.email,
            ...offerForm,
            original_price: parseFloat(offerForm.original_price),
            promo_price: parseFloat(offerForm.promo_price),
            is_active: true
          }]);

        if (error) throw error;
        alert('✅ Offre créée!');
      }

      setShowOfferModal(false);
      setEditingOffer(null);
      setOfferForm({
        title: '',
        description: '',
        original_price: '',
        promo_price: '',
        start_date: '',
        end_date: ''
      });
      loadOffers();
    } catch (error) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title,
      description: offer.description,
      original_price: offer.original_price.toString(),
      promo_price: offer.promo_price.toString(),
      start_date: offer.start_date,
      end_date: offer.end_date
    });
    setShowOfferModal(true);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!confirm('Supprimer cette offre spéciale?')) return;

    const { error } = await supabase
      .from('special_offers')
      .delete()
      .eq('id', offerId);

    if (!error) {
      alert('✅ Offre supprimée!');
      loadOffers();
    } else {
      alert('❌ Erreur lors de la suppression');
    }
  };

  const toggleOfferStatus = async (offerId, currentStatus) => {
    const { error } = await supabase
      .from('special_offers')
      .update({ is_active: !currentStatus })
      .eq('id', offerId);

    if (!error) {
      loadOffers();
    }
  };

  const getOfferStatus = (offer) => {
    const now = new Date();
    const start = new Date(offer.start_date);
    const end = new Date(offer.end_date);

    if (!offer.is_active) return { label: 'Désactivée', color: 'bg-gray-500/20 text-gray-500 border-gray-500/50' };
    if (now < start) return { label: 'Prochainement', color: 'bg-primary/20 text-primary border-primary/50' };
    if (now > end) return { label: 'Expirée', color: 'bg-red-500/20 text-red-500 border-red-500/50' };
    return { label: 'En cours', color: 'bg-accent/20 text-accent border-accent/50' };
  };

  const calculateDiscount = (original, promo) => {
    return Math.round(((original - promo) / original) * 100);
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Mobile Menu */}
      <MobileMenu currentPath="/menu" />

      {/* Fond animé */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-secondary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -25, 0],
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
          <p className="text-gray-400 text-sm mt-1">Menu Manager</p>
        </div>

        <nav className="space-y-2">
          {[
            { icon: MessageSquare, label: 'Conversations', path: '/dashboard' },
            { icon: Calendar, label: 'Smart RDV', path: '/appointments' },
            { icon: Upload, label: 'Menu Manager', path: '/menu', active: true },
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              🍽️ Menu Manager
            </h2>
            <p className="text-gray-400">
              Gérez votre menu et vos offres spéciales - L'IA les connaît par cœur
            </p>
          </div>

          {/* Onglets */}
          <div className="glass rounded-xl p-1 flex gap-1 mb-6">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'menu'
                  ? 'bg-primary/30 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              Menu Principal
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'offers'
                  ? 'bg-primary/30 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              Offres Spéciales
              {offers.filter(o => o.is_active).length > 0 && (
                <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                  {offers.filter(o => o.is_active).length}
                </span>
              )}
            </button>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-xl mb-6 border-2 border-accent flex items-center gap-3"
            >
              <Save className="w-5 h-5 text-accent" />
              <span className="text-white">Sauvegardé avec succès!</span>
            </motion.div>
          )}

          {/* Tab Menu */}
          {activeTab === 'menu' && (
            <>
              <div className="glass p-6 rounded-3xl mb-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  📸 Upload Photo du Menu (OCR)
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Prenez une photo de votre menu, l'IA va extraire automatiquement les plats et prix
                </p>

                <label className="block">
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-primary transition-colors cursor-pointer text-center">
                    <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">Cliquez pour uploader</p>
                    <p className="text-gray-400 text-sm">PNG, JPG, PDF jusqu'à 10MB</p>
                  </div>
                </label>
              </div>

              <div className="glass p-6 rounded-3xl mb-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  ✍️ Saisie Manuelle
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Ou écrivez votre menu directement (format libre)
                </p>

                <textarea
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                  placeholder="Exemple:&#10;&#10;🍕 PIZZAS&#10;Margherita - 12€&#10;4 Fromages - 15€&#10;Calzone - 14€&#10;&#10;🍝 PÂTES&#10;Carbonara - 13€&#10;Bolognaise - 12€"
                  className="w-full h-64 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveMenu}
                  disabled={loading || !menuText}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Sauvegarde...</span>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Sauvegarder le Menu</span>
                    </>
                  )}
                </button>

                {menuText && (
                  <button
                    onClick={handleDeleteMenu}
                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Supprimer</span>
                  </button>
                )}
              </div>

              <div className="mt-6 glass p-4 rounded-xl">
                <p className="text-gray-400 text-sm">
                  💡 <span className="text-white font-semibold">Comment ça marche?</span> Une fois sauvegardé, l'IA utilisera ce menu pour répondre aux questions des clients sur les plats, prix, et recommandations.
                </p>
              </div>
            </>
          )}

          {/* Tab Offres Spéciales */}
          {activeTab === 'offers' && (
            <>
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => {
                    setEditingOffer(null);
                    setOfferForm({
                      title: '',
                      description: '',
                      original_price: '',
                      promo_price: '',
                      start_date: '',
                      end_date: ''
                    });
                    setShowOfferModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nouvelle Offre Spéciale
                </button>
              </div>

              {offers.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center">
                  <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">Aucune offre spéciale pour le moment</p>
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Créer votre première offre
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer, i) => {
                    const status = getOfferStatus(offer);
                    const discount = calculateDiscount(offer.original_price, offer.promo_price);

                    return (
                      <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass p-6 rounded-3xl hover:scale-[1.01] transition-transform"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-white">{offer.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs border ${status.color}`}>
                                {status.label}
                              </span>
                              <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold">
                                -{discount}%
                              </div>
                            </div>

                            <p className="text-gray-400 mb-4">{offer.description}</p>

                            <div className="flex items-center gap-6 text-sm">
                              <div>
                                <span className="text-gray-500 line-through mr-2">{offer.original_price}€</span>
                                <span className="text-2xl font-bold text-accent">{offer.promo_price}€</span>
                              </div>
                              <div className="text-gray-400">
                                📅 Du {new Date(offer.start_date).toLocaleDateString('fr-FR')}
                                {' '}au {new Date(offer.end_date).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                              className={`px-4 py-2 rounded-xl transition-colors text-sm ${
                                offer.is_active
                                  ? 'bg-accent/20 text-accent hover:bg-accent/30'
                                  : 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
                              }`}
                            >
                              {offer.is_active ? 'Actif' : 'Inactif'}
                            </button>
                            <button
                              onClick={() => handleEditOffer(offer)}
                              className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 glass p-4 rounded-xl">
                <p className="text-gray-400 text-sm">
                  💡 <span className="text-white font-semibold">Astuce:</span> Les offres actives sont automatiquement proposées par l'IA aux clients pendant la période définie. Les offres expirées sont désactivées automatiquement.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Offre Spéciale */}
      <AnimatePresence>
        {showOfferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowOfferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass p-8 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Tag className="w-6 h-6 text-accent" />
                {editingOffer ? 'Modifier l\'Offre' : 'Nouvelle Offre Spéciale'}
              </h3>

              <form onSubmit={handleOfferSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Titre de l'offre *</label>
                  <input
                    type="text"
                    required
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Ex: Menu Duo -30%"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={offerForm.description}
                    onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                    rows="3"
                    placeholder="Détails de l'offre..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Prix original (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={offerForm.original_price}
                      onChange={(e) => setOfferForm({...offerForm, original_price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                      placeholder="29.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Prix promo (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={offerForm.promo_price}
                      onChange={(e) => setOfferForm({...offerForm, promo_price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                      placeholder="19.99"
                    />
                  </div>
                </div>

                {offerForm.original_price && offerForm.promo_price && (
                  <div className="text-center py-2 bg-accent/10 rounded-xl">
                    <span className="text-accent font-bold text-lg">
                      Réduction de {calculateDiscount(parseFloat(offerForm.original_price), parseFloat(offerForm.promo_price))}%
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Date de début *</label>
                    <input
                      type="date"
                      required
                      value={offerForm.start_date}
                      onChange={(e) => setOfferForm({...offerForm, start_date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Date de fin *</label>
                    <input
                      type="date"
                      required
                      value={offerForm.end_date}
                      onChange={(e) => setOfferForm({...offerForm, end_date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform"
                  >
                    {editingOffer ? 'Mettre à jour' : 'Créer l\'offre'}
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

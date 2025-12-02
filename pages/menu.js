import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, Upload, Save, Trash2, TrendingUp, Tag, Plus, Edit2, X, Bot, Package, TrendingDown, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { getSectorById } from '../lib/sectors';
import MobileMenu from '../components/MobileMenu';

// 🎯 TEMPLATES D'INVENTAIRE PAR SECTEUR (utilisés uniquement à l'initialisation)
// L'inventaire réel est stocké et chargé depuis la table 'inventory_items'
const getDefaultInventoryBySector = (sectorId) => {
  const inventories = {
    // BOUCHERIE
    boucherie: [
      { id: 1, name: 'Côtelettes', unit: 'kg', sold_today: 0, stock: 100 },
      { id: 2, name: 'Entrecôte', unit: 'kg', sold_today: 0, stock: 50 },
      { id: 3, name: 'Poulet', unit: 'unités', sold_today: 0, stock: 30 }
    ],
    // FROMAGERIE
    fromagerie: [
      { id: 1, name: 'Camembert', unit: 'unités', sold_today: 0, stock: 40 },
      { id: 2, name: 'Comté', unit: 'kg', sold_today: 0, stock: 25 },
      { id: 3, name: 'Roquefort', unit: 'kg', sold_today: 0, stock: 15 }
    ],
    // COIFFURE
    coiffure: [
      { id: 1, name: 'Coupes réalisées', unit: 'coupes', sold_today: 0, stock: 999 },
      { id: 2, name: 'Colorations', unit: 'services', sold_today: 0, stock: 999 },
      { id: 3, name: 'Brushings', unit: 'services', sold_today: 0, stock: 999 }
    ],
    // BEAUTÉ
    beaute: [
      { id: 1, name: 'Soins visage', unit: 'services', sold_today: 0, stock: 999 },
      { id: 2, name: 'Manucures', unit: 'services', sold_today: 0, stock: 999 },
      { id: 3, name: 'Épilations', unit: 'services', sold_today: 0, stock: 999 }
    ],
    // RESTAURANT
    restaurant: [
      { id: 1, name: 'Plat du jour', unit: 'portions', sold_today: 0, stock: 50 },
      { id: 2, name: 'Desserts', unit: 'portions', sold_today: 0, stock: 30 },
      { id: 3, name: 'Boissons', unit: 'unités', sold_today: 0, stock: 100 }
    ],
    // CAFÉ / BOULANGERIE
    cafe: [
      { id: 1, name: 'Croissants', unit: 'unités', sold_today: 0, stock: 80 },
      { id: 2, name: 'Pain', unit: 'baguettes', sold_today: 0, stock: 120 },
      { id: 3, name: 'Pâtisseries', unit: 'unités', sold_today: 0, stock: 50 }
    ],
    // ÉPICERIE
    epicerie: [
      { id: 1, name: 'Fruits & Légumes', unit: 'kg', sold_today: 0, stock: 200 },
      { id: 2, name: 'Produits laitiers', unit: 'unités', sold_today: 0, stock: 150 },
      { id: 3, name: 'Pain & Viennoiseries', unit: 'unités', sold_today: 0, stock: 100 }
    ],
    // PHARMACIE
    pharmacie: [
      { id: 1, name: 'Ordonnances traitées', unit: 'ordonnances', sold_today: 0, stock: 999 },
      { id: 2, name: 'Produits OTC', unit: 'unités', sold_today: 0, stock: 500 },
      { id: 3, name: 'Parapharmacie', unit: 'unités', sold_today: 0, stock: 300 }
    ],
    // SPORT / FITNESS
    fitness: [
      { id: 1, name: 'Cours collectifs', unit: 'séances', sold_today: 0, stock: 999 },
      { id: 2, name: 'Coaching privé', unit: 'séances', sold_today: 0, stock: 20 },
      { id: 3, name: 'Inscriptions', unit: 'membres', sold_today: 0, stock: 50 }
    ],
    sport_club: [
      { id: 1, name: 'Inscriptions', unit: 'membres', sold_today: 0, stock: 100 },
      { id: 2, name: 'Maillots', unit: 'unités', sold_today: 0, stock: 50 },
      { id: 3, name: 'Équipements', unit: 'unités', sold_today: 0, stock: 30 }
    ],
    // GARAGE
    garage: [
      { id: 1, name: 'Révisions', unit: 'services', sold_today: 0, stock: 10 },
      { id: 2, name: 'Réparations', unit: 'interventions', sold_today: 0, stock: 15 },
      { id: 3, name: 'Pneus', unit: 'jeux', sold_today: 0, stock: 20 }
    ]
  };

  // Retourner l'inventaire du secteur, ou un inventaire générique par défaut
  return inventories[sectorId] || [
    { id: 1, name: 'Produit 1', unit: 'unités', sold_today: 0, stock: 100 },
    { id: 2, name: 'Produit 2', unit: 'unités', sold_today: 0, stock: 75 },
    { id: 3, name: 'Produit 3', unit: 'unités', sold_today: 0, stock: 50 }
  ];
};

export default function MenuManager() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuText, setMenuText] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'offers', ou 'inventory'
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);

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

  // Inventaire (dynamique selon le secteur)
  const [inventory, setInventory] = useState([]);
  const [userSector, setUserSector] = useState(null);

  useEffect(() => {
    checkUser();
    loadMenu();
    loadOffers();
    loadUserSector();
  }, []);

  // Charger le secteur de l'utilisateur et l'inventaire depuis la DB
  const loadUserSector = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: client } = await supabase
        .from('clients')
        .select('sector')
        .eq('email', session.user.email)
        .single();

      if (client?.sector) {
        setUserSector(client.sector);
        await loadInventoryFromDB(session.user.email, client.sector);
      }
    }
  };

  // 🔥 NOUVEAU: Charger l'inventaire depuis la DB
  const loadInventoryFromDB = async (email, sector) => {
    try {
      const { data: existingInventory, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('client_email', email)
        .order('id', { ascending: true });

      if (error) {
        console.warn('⚠️ Erreur lors du chargement de l\'inventaire:', error);
      }

      if (existingInventory && existingInventory.length > 0) {
        // Inventaire existe en DB - le charger
        setInventory(existingInventory);
      } else {
        // Pas d'inventaire en DB - initialiser avec les templates par défaut
        const defaultItems = getDefaultInventoryBySector(sector);

        // Sauvegarder les items par défaut en DB
        const { data: insertedItems, error: insertError } = await supabase
          .from('inventory_items')
          .insert(
            defaultItems.map(item => ({
              client_email: email,
              name: item.name,
              unit: item.unit,
              sold_today: item.sold_today,
              stock: item.stock
            }))
          )
          .select();

        if (!insertError && insertedItems) {
          setInventory(insertedItems);
        } else {
          console.error('❌ Erreur insertion inventaire:', insertError);
          // Fallback: utiliser les items par défaut en local seulement
          setInventory(defaultItems);
        }
      }
    } catch (error) {
      console.error('❌ Erreur loadInventoryFromDB:', error);
      // Fallback: utiliser l'inventaire par défaut
      setInventory(getDefaultInventoryBySector(sector));
    }
  };

  // 🔥 NOUVEAU: Sauvegarder un item d'inventaire dans la DB
  const saveInventoryItem = async (item) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          name: item.name,
          unit: item.unit,
          sold_today: item.sold_today,
          stock: item.stock,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) {
        console.error('❌ Erreur sauvegarde inventaire:', error);
      }
    } catch (error) {
      console.error('❌ Erreur saveInventoryItem:', error);
    }
  };

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
        setUploadedFileUrl(data.file_url || null);
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

  // 🖼️ Compression d'image
  const compressImage = (file, maxSizeMB = 2) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Réduire si trop grand
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }));
            },
            'image/jpeg',
            0.85 // Qualité 85%
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError(null);
    setLoading(true);

    try {
      // 🔍 Validation du type de fichier
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        throw new Error('❌ Format non supporté. Utilisez: PNG, JPG, JPEG ou PDF');
      }

      // 🔍 Validation de la taille (10MB max)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error('❌ Fichier trop volumineux. Maximum: 10MB');
      }

      let fileToUpload = file;

      // 🖼️ Compression des images
      if (file.type.startsWith('image/')) {
        console.log('🖼️ Compression de l\'image...');
        fileToUpload = await compressImage(file);
        console.log(`✅ Taille réduite: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
      }

      // 📤 Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `menu-${user.email}-${Date.now()}.${fileExt}`;
      const filePath = `menus/${fileName}`;

      console.log('📤 Upload vers Supabase Storage:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu-files')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Si le bucket n'existe pas, créer et réessayer
        if (uploadError.message.includes('not found')) {
          console.log('📦 Création du bucket menu-files...');
          const { error: bucketError } = await supabase.storage.createBucket('menu-files', {
            public: true,
            fileSizeLimit: MAX_SIZE
          });

          if (bucketError && !bucketError.message.includes('already exists')) {
            throw new Error('❌ Erreur lors de la création du bucket: ' + bucketError.message);
          }

          // Réessayer l'upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from('menu-files')
            .upload(filePath, fileToUpload, {
              cacheControl: '3600',
              upsert: false
            });

          if (retryError) throw retryError;
        } else {
          throw uploadError;
        }
      }

      // 🔗 Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('menu-files')
        .getPublicUrl(filePath);

      console.log('✅ Fichier uploadé avec succès:', publicUrl);
      setUploadedFileUrl(publicUrl);

      // 💾 Sauvegarder l'URL dans la base de données
      const { data: existingMenu } = await supabase
        .from('menus')
        .select('*')
        .eq('client_email', user.email)
        .single();

      if (existingMenu) {
        await supabase
          .from('menus')
          .update({
            file_url: publicUrl,
            file_type: file.type,
            updated_at: new Date().toISOString()
          })
          .eq('client_email', user.email);
      } else {
        await supabase
          .from('menus')
          .insert([{
            client_email: user.email,
            file_url: publicUrl,
            file_type: file.type,
            menu_text: menuText || ''
          }]);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);

      // 📄 Message spécifique selon le type
      if (file.type === 'application/pdf') {
        alert('✅ PDF uploadé avec succès!\n\n📄 Le fichier est accessible dans votre menu.\n\nℹ️ L\'extraction automatique de texte sera ajoutée prochainement.');
      } else {
        alert('✅ Image uploadée avec succès!\n\n📷 Le fichier est accessible dans votre menu.\n\nℹ️ L\'OCR (reconnaissance de texte) sera ajouté prochainement.');
      }

    } catch (error) {
      console.error('❌ Erreur upload:', error);
      setUploadError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
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
              Menu
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
              Offres
              {offers.filter(o => o.is_active).length > 0 && (
                <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                  {offers.filter(o => o.is_active).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-primary/30 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              Inventaire
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
                    disabled={loading}
                  />
                  <div className={`border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-primary transition-colors cursor-pointer text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">
                      {loading ? 'Upload en cours...' : 'Cliquez pour uploader'}
                    </p>
                    <p className="text-gray-400 text-sm">PNG, JPG, PDF jusqu'à 10MB</p>
                  </div>
                </label>

                {/* Prévisualisation du fichier uploadé */}
                {uploadedFileUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-white/5 border border-accent/30 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                          {uploadedFileUrl.includes('.pdf') ? (
                            <span className="text-2xl">📄</span>
                          ) : (
                            <span className="text-2xl">🖼️</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">Fichier uploadé</p>
                          <p className="text-gray-400 text-sm">
                            {uploadedFileUrl.includes('.pdf') ? 'Document PDF' : 'Image'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={uploadedFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm"
                        >
                          Voir
                        </a>
                        <button
                          onClick={async () => {
                            if (confirm('Supprimer le fichier uploadé?')) {
                              await supabase
                                .from('menus')
                                .update({ file_url: null, file_type: null })
                                .eq('client_email', user.email);
                              setUploadedFileUrl(null);
                            }
                          }}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
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

          {/* Tab Inventaire */}
          {activeTab === 'inventory' && (
            <div className="glass p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Package className="w-7 h-7 text-purple-500" />
                    📦 Suivi Inventaire
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Suivez vos ventes quotidiennes et gérez vos stocks
                  </p>
                </div>
              </div>

              {/* Liste Inventaire */}
              <div className="space-y-3">
                {inventory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-4 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-1">{item.name}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUpIcon className="w-4 h-4 text-green-500" />
                            <span className="text-gray-400">Vendu aujourd'hui:</span>
                            <span className="text-green-400 font-bold">{item.sold_today} {item.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-400">Stock:</span>
                            <span className={`font-bold ${item.stock < 20 ? 'text-red-400' : 'text-blue-400'}`}>
                              {item.stock} {item.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="+ vente"
                          className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-accent"
                          onKeyPress={async (e) => {
                            if (e.key === 'Enter') {
                              const value = parseFloat(e.target.value);
                              if (value > 0) {
                                const updatedItem = {
                                  ...item,
                                  sold_today: item.sold_today + value,
                                  stock: Math.max(0, item.stock - value)
                                };

                                // Mettre à jour l'état local
                                setInventory(inventory.map(inv =>
                                  inv.id === item.id ? updatedItem : inv
                                ));

                                // 🔥 Sauvegarder dans la DB
                                await saveInventoryItem(updatedItem);

                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={async () => {
                            const updatedItem = { ...item, sold_today: 0 };

                            // Mettre à jour l'état local
                            setInventory(inventory.map(inv =>
                              inv.id === item.id ? updatedItem : inv
                            ));

                            // 🔥 Sauvegarder dans la DB
                            await saveInventoryItem(updatedItem);
                          }}
                          className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors text-xs"
                          title="Réinitialiser ventes"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats du jour */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Total Vendu Aujourd'hui</p>
                  <p className="text-2xl font-bold text-accent">
                    {inventory.reduce((sum, item) => sum + item.sold_today, 0)} articles
                  </p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Articles Suivis</p>
                  <p className="text-2xl font-bold text-primary">
                    {inventory.length}
                  </p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Stock Total</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {inventory.reduce((sum, item) => sum + item.stock, 0)}
                  </p>
                </div>
              </div>

              <div className="mt-6 glass p-4 rounded-xl">
                <p className="text-gray-400 text-sm">
                  💡 <span className="text-white font-semibold">Info:</span> Entrez la quantité vendue et appuyez sur Entrée pour mettre à jour. Le stock se réduit automatiquement. Utilisez "Reset" pour réinitialiser les ventes du jour.
                </p>
              </div>
            </div>
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

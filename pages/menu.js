import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, Settings, LogOut, Calendar, Upload, Save, Trash2, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MenuManager() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuText, setMenuText] = useState('');
  const [menuImage, setMenuImage] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkUser();
    loadMenu();
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    alert('Upload d\'image - OCR sera implémenté prochainement!\n\nPour l\'instant, saisissez votre menu manuellement ci-dessous.');
  };

  const handleSave = async () => {
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

  const handleDelete = async () => {
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

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
      </div>

      <div className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 z-10">
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
            { icon: Users, label: 'Clients', path: '/clients' },
            { icon: TrendingUp, label: 'Market Insights', path: '/market-insights' },
            { icon: Zap, label: 'Analytics', path: '/analytics' },
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

      <div className="ml-64 p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              🍽️ Menu Manager
            </h2>
            <p className="text-gray-400">
              Gérez votre menu - L'IA l'apprendra par cœur pour répondre aux clients
            </p>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-xl mb-6 border-2 border-accent flex items-center gap-3"
            >
              <Save className="w-5 h-5 text-accent" />
              <span className="text-white">Menu sauvegardé! L'IA connaît maintenant votre carte.</span>
            </motion.div>
          )}

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
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-primary transition-colors cursor-pointer text-center">
                <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Cliquez pour uploader</p>
                <p className="text-gray-400 text-sm">PNG, JPG jusqu'à 10MB</p>
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
              onClick={handleSave}
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
                onClick={handleDelete}
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
        </div>
      </div>
    </div>
  );
}
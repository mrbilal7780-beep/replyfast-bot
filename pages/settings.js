import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, MessageSquare, Users, Zap, Settings, LogOut, Calendar, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { SECTORS, getSectorsList } from '../lib/sectors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  useEffect(() => {
    checkUser();
    loadSettings();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session.user);
    }
  };

  const loadSettings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('clients')
        .select('whatsapp_phone_number_id, sector')
        .eq('email', session.user.email)
        .single();
      
      if (data?.whatsapp_phone_number_id) {
        setPhoneNumberId(data.whatsapp_phone_number_id);
      }
      if (data?.sector) {
        setSelectedSector(data.sector);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('email', user.email)
        .single();

      if (existingClient) {
        const { error } = await supabase
          .from('clients')
          .update({ 
            whatsapp_phone_number_id: phoneNumberId,
            whatsapp_connected: true,
            sector: selectedSector
          })
          .eq('email', user.email);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([{ 
            email: user.email,
            whatsapp_phone_number_id: phoneNumberId,
            whatsapp_connected: true,
            sector: selectedSector
          }]);
        
        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Background */}
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Paramètres
            </h1>
            <p className="text-gray-400">
              Configurez votre compte WhatsApp Business et votre secteur d'activité
            </p>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-xl mb-6 border-2 border-accent flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-accent" />
              <span className="text-white">Paramètres sauvegardés avec succès!</span>
            </motion.div>
          )}

          <div className="glass p-6 rounded-3xl mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📚 Comment obtenir votre Phone Number ID
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>Va sur <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta Business Suite</a></span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>Connecte-toi et crée un compte WhatsApp Business (gratuit)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>Va dans <span className="text-accent">Paramètres → WhatsApp Business API</span></span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>Copie le <span className="text-accent">Phone Number ID</span> (série de chiffres)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">5.</span>
                <span>Colle-le ci-dessous!</span>
              </li>
            </ol>
          </div>

          <div className="glass p-6 rounded-3xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Secteur d'activité *
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option value="" className="bg-dark text-gray-400">Sélectionnez votre secteur</option>
                  {getSectorsList()
                    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
                    .map((sector) => (
                      <option key={sector.id} value={sector.id} className="bg-dark py-2">
                        {sector.emoji} {sector.name}
                      </option>
                    ))}
                </select>
                <p className="text-gray-400 text-sm mt-2">
                  Choisissez votre secteur pour personnaliser les réponses de l'IA
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Phone Number ID *
                </label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="938427616001036"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Format: 15 chiffres (exemple: 938427616001036)
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !phoneNumberId || !selectedSector}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Sauvegarde...</span>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 glass p-4 rounded-xl">
            <p className="text-gray-400 text-sm">
              💡 <span className="text-white font-semibold">Besoin d'aide?</span> Contacte le support à support@replyfast.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
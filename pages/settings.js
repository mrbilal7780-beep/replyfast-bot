import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');

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
        .select('whatsapp_phone_number_id')
        .eq('email', session.user.email)
        .single();
      
      if (data?.whatsapp_phone_number_id) {
        setPhoneNumberId(data.whatsapp_phone_number_id);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // D'abord, vérifier si le client existe
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('email', user.email)
        .single();

      if (existingClient) {
        // Mettre à jour
        const { error } = await supabase
          .from('clients')
          .update({ 
            whatsapp_phone_number_id: phoneNumberId,
            whatsapp_connected: true
          })
          .eq('email', user.email);
        
        if (error) throw error;
      } else {
        // Créer
        const { error } = await supabase
          .from('clients')
          .insert([{ 
            email: user.email,
            whatsapp_phone_number_id: phoneNumberId,
            whatsapp_connected: true
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
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white mb-4 transition-colors"
          >
            ← Retour au dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            Paramètres WhatsApp
          </h1>
          <p className="text-gray-400">
            Connectez votre compte WhatsApp Business
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
            <span className="text-white">Paramètres sauvegardés avec succès!</span>
          </motion.div>
        )}

        {/* Tutorial Card */}
        <div className="glass p-6 rounded-3xl mb-6">
          <h3 className="text-xl font-bold text-white mb-4">
            📚 Comment obtenir votre Phone Number ID
          </h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>Va sur <a href="https://business.facebook.com" target="_blank" className="text-primary hover:underline">Meta Business Suite</a></span>
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

        {/* Settings Form */}
        <div className="glass p-6 rounded-3xl">
          <div className="space-y-6">
            {/* Phone Number ID */}
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

            {/* Access Token (Optional for now) */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Access Token (optionnel)
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Laissez vide pour utiliser le token global"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              />
              <p className="text-gray-400 text-sm mt-2">
                Pour l'instant, nous utilisons un token global. Ce champ sera actif bientôt.
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading || !phoneNumberId}
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

        {/* Help Card */}
        <div className="mt-6 glass p-4 rounded-xl">
          <p className="text-gray-400 text-sm">
            💡 <span className="text-white font-semibold">Besoin d'aide?</span> Contacte le support à support@replyfast.com
          </p>
        </div>
      </div>
    </div>
  );
}
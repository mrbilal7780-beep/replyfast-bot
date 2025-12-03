import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, User, Bot, X, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ConversationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [manualMessage, setManualMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadConversation();
      loadMessages();
      loadProfilePhoto();

      // Auto-refresh toutes les 3 secondes
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const loadProfilePhoto = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: client } = await supabase
        .from('clients')
        .select('profile_photo_url')
        .eq('email', session.user.email)
        .maybeSingle();

      if (client?.profile_photo_url) {
        setProfilePhoto(client.profile_photo_url);
      }
    } catch (error) {
      console.error('Erreur chargement photo:', error);
    }
  };

  // Auto-scroll vers le bas quand nouveaux messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Détecter si l'utilisateur a scrollé vers le haut
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setConversation(data);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      setLoading(false);
    }
  };

  const handleSendManualMessage = async (e) => {
    e.preventDefault();
    if (!manualMessage.trim() || !conversation || sending) return;

    setSending(true);
    const messageToSend = manualMessage;

    try {
      // 1. Récupérer les infos client pour envoyer via WhatsApp D'ABORD
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('❌ Session expirée, veuillez vous reconnecter');
        setSending(false);
        return;
      }

      const { data: client } = await supabase
        .from('clients')
        .select('whatsapp_phone_number_id, whatsapp_token')
        .eq('email', conversation.client_email)
        .single();

      if (!client?.whatsapp_phone_number_id) {
        alert('⚠️ Envoi impossible : Phone Number ID WhatsApp manquant dans vos paramètres');
        setSending(false);
        return;
      }

      // 2. ENVOYER D'ABORD via WhatsApp (priorité)
      const whatsappResponse = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          phone_number_id: client.whatsapp_phone_number_id,
          to: conversation.customer_phone,
          message: messageToSend
        })
      });

      const result = await whatsappResponse.json();

      if (!whatsappResponse.ok || result.error) {
        console.error('❌ Erreur envoi WhatsApp:', result);
        throw new Error(result.details || result.error || 'Erreur WhatsApp');
      }

      console.log('✅ Message envoyé via WhatsApp:', result);

      // 3. SEULEMENT si WhatsApp OK, sauvegarder en DB
      const { error: dbError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: id,
          client_email: conversation.client_email,
          customer_phone: conversation.customer_phone,
          sender: 'bot',
          direction: 'sent',
          message: messageToSend,
          message_type: 'text',
          created_at: new Date().toISOString()
        }]);

      if (dbError) {
        console.error('⚠️ Message envoyé mais erreur DB:', dbError);
      }

      setManualMessage('');
      await loadMessages(); // Recharger pour afficher

    } catch (error) {
      console.error('❌ Erreur complète:', error);
      alert(`❌ Échec envoi WhatsApp:\n\n${error.message}\n\nVérifiez:\n• Phone Number ID configuré\n• Token WhatsApp valide\n• Numéro destinataire correct`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="glass border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">
              {conversation?.customer_name_override || conversation?.customer_name || conversation?.customer_phone || 'Chargement...'}
            </h1>
            <p className="text-sm text-gray-400">
              {messages.length} message(s)
            </p>
          </div>
          {/* Photo de profil du business */}
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profil"
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/50 shadow-lg"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Messages - Avec scroll */}
      <div
        ref={messagesContainerRef}
        className="max-w-4xl mx-auto p-6 overflow-y-auto pb-32"
        style={{ maxHeight: 'calc(100vh - 240px)' }}
      >
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Chargement...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Aucun message</div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-3 ${
                  msg.sender === 'bot' ? 'justify-start' : 'justify-end'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-md p-4 rounded-2xl ${
                    msg.sender === 'bot'
                      ? 'glass border border-white/10'
                      : 'bg-primary text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {msg.sender === 'customer' && (
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bouton "Aller en bas" FLOTTANT - Visible quand scrollé vers le haut */}
      {showScrollButton && (
        <motion.button
          onClick={scrollToBottom}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary/80 backdrop-blur-md border border-primary/50 flex items-center justify-center hover:bg-primary transition-all shadow-lg group"
          title="Aller en bas"
        >
          <ArrowDown className="w-6 h-6 text-white group-hover:animate-bounce" />
        </motion.button>
      )}

      {/* Bouton fermeture FLOTTANT - toujours visible */}
      <motion.button
        onClick={() => router.push('/dashboard')}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/50 flex items-center justify-center hover:bg-red-500/30 transition-all shadow-lg group"
        title="Fermer la conversation"
      >
        <X className="w-6 h-6 text-red-500 group-hover:text-red-400 transition-colors" />
      </motion.button>

      {/* 💬 CHAMP DE RÉPONSE MANUELLE */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-4 z-30">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendManualMessage} className="flex gap-3">
            <textarea
              value={manualMessage}
              onChange={(e) => setManualMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendManualMessage(e);
                }
              }}
              placeholder="Tapez votre réponse manuelle ici... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
              disabled={sending}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
              rows={2}
            />
            <button
              type="submit"
              disabled={sending || !manualMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-fit"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            💡 Votre réponse sera envoyée directement via WhatsApp au client
          </p>
        </div>
      </div>
    </div>
  );
}
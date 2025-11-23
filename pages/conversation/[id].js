import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, User, Bot } from 'lucide-react';
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

  useEffect(() => {
    if (id) {
      loadConversation();
      loadMessages();
      
      // Auto-refresh toutes les 3 secondes
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [id]);

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
              {conversation?.customer_phone || 'Chargement...'}
            </h1>
            <p className="text-sm text-gray-400">
              {messages.length} message(s)
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto p-6">
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
        </div>
      </div>
    </div>
  );
}
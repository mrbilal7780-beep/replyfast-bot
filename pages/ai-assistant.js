import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Loader, Sparkles, TrendingUp, Calendar, DollarSign, MessageSquare, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { getSectorById } from '../lib/sectors';

export default function AIAssistant() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkUser();
    loadBusinessContext();
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const loadBusinessContext = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Charger TOUTES les données
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('email', session.user.email)
      .single();

    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_email', session.user.email);

    const { data: businessInfo } = await supabase
      .from('business_info')
      .select('*')
      .eq('client_email', session.user.email)
      .single();

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('client_email', session.user.email);

    const confirmedRdv = appointments?.filter(a => a.status === 'confirmed').length || 0;
    const cancelledRdv = appointments?.filter(a => a.status === 'cancelled').length || 0;
    const sentMessages = messages?.filter(m => m.direction === 'sent').length || 0;
    const receivedMessages = messages?.filter(m => m.direction === 'received').length || 0;

    // 🎯 FIX: Obtenir le nom lisible du secteur au lieu de l'ID
    const sectorInfo = client?.sector ? getSectorById(client.sector) : null;
    const sectorName = sectorInfo?.name || 'Non défini';

    setContext({
      sector: sectorName,
      companyName: client?.company_name || businessInfo?.nom_entreprise || 'Votre entreprise',
      totalAppointments: appointments?.length || 0,
      confirmedAppointments: confirmedRdv,
      cancelledAppointments: cancelledRdv,
      totalMessages: messages?.length || 0,
      sentMessages: sentMessages,
      receivedMessages: receivedMessages,
      responseRate: receivedMessages > 0 ? Math.round((sentMessages / receivedMessages) * 100) : 0,
      businessInfo: businessInfo,
      horaires: businessInfo?.horaires || {},
      tarifs: businessInfo?.tarifs || {}
    });
  };

  const loadChatHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('ai_assistant_chats')
      .select('*')
      .eq('client_email', session.user.email)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data && data.length > 0) {
      const formattedMessages = data.map(d => ({
        role: d.message_role,
        content: d.message_content
      }));
      setMessages(formattedMessages);

      // Calculer coût total
      const total = data.reduce((sum, msg) => sum + (msg.cost_estimate || 0), 0);
      setTotalCost(total);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: { ...context, companyEmail: session.user.email }
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la communication avec l\'assistant');
      }

      const assistantMessage = { role: 'assistant', content: data.response };
      setMessages([...messages, userMessage, assistantMessage]);

      // Sauvegarder dans la base
      await supabase.from('ai_assistant_chats').insert([
        {
          client_email: session.user.email,
          message_role: 'user',
          message_content: input,
          tokens_used: data.tokens,
          cost_estimate: data.cost
        },
        {
          client_email: session.user.email,
          message_role: 'assistant',
          message_content: data.response,
          tokens_used: data.tokens,
          cost_estimate: data.cost
        }
      ]);

      setTotalCost(totalCost + (data.cost || 0));
    } catch (error) {
      console.error('Erreur Assistant IA:', error);
      setMessages([...messages, userMessage, {
        role: 'assistant',
        content: '❌ Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants ou contacter le support si le problème persiste.'
      }]);
    }

    setLoading(false);
  };

  const suggestionQuestions = [
    "Comment améliorer mes revenus ?",
    "Analyse mes performances du mois",
    "Quels sont mes meilleurs créneaux ?",
    "Conseils pour attirer plus de clients",
    "Comment optimiser mes horaires ?"
  ];

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Fond animé */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white mb-4 transition-colors"
          >
            ← Retour au dashboard
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-accent to-primary flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Assistant IA Personnel</h1>
              <p className="text-gray-400">Votre coach business qui connaît tout de votre activité</p>
            </div>
          </div>

          {/* Context Info Cards */}
          {context && (
            <div className="grid grid-cols-5 gap-4">
              <div className="glass p-4 rounded-xl">
                <Calendar className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-white">{context.totalAppointments}</p>
                <p className="text-xs text-gray-400">RDV Total</p>
              </div>
              <div className="glass p-4 rounded-xl">
                <MessageSquare className="w-5 h-5 text-accent mb-2" />
                <p className="text-2xl font-bold text-white">{context.totalMessages}</p>
                <p className="text-xs text-gray-400">Messages</p>
              </div>
              <div className="glass p-4 rounded-xl">
                <TrendingUp className="w-5 h-5 text-secondary mb-2" />
                <p className="text-2xl font-bold text-white">{context.responseRate}%</p>
                <p className="text-xs text-gray-400">Taux réponse</p>
              </div>
              <div className="glass p-4 rounded-xl">
                <Users className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-white">{context.confirmedAppointments}</p>
                <p className="text-xs text-gray-400">RDV Confirmés</p>
              </div>
              <div className="glass p-4 rounded-xl">
                <DollarSign className="w-5 h-5 text-accent mb-2" />
                <p className="text-2xl font-bold text-white">{totalCost.toFixed(4)}€</p>
                <p className="text-xs text-gray-400">Coût total</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Chat Container */}
        <div className="glass rounded-3xl p-6 mb-6" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4" style={{ maxHeight: '400px' }}>
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-accent mx-auto mb-4" />
                <p className="text-gray-400 mb-6">Posez-moi n'importe quelle question sur votre business !</p>
                <div className="space-y-2">
                  {suggestionQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="block w-full text-left glass p-3 rounded-xl text-gray-300 hover:bg-white/10 transition-colors text-sm"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'glass text-gray-200'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-accent" />
                        <span className="text-xs text-accent font-semibold">Assistant IA</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="glass p-4 rounded-2xl">
                  <Loader className="w-5 h-5 text-accent animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Posez votre question..."
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-accent to-primary rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="glass p-4 rounded-xl">
          <p className="text-gray-400 text-sm text-center">
            💡 L'Assistant IA a accès à toutes vos données : RDV, messages, tarifs, horaires, analytics.
            Il vous donne des conseils personnalisés basés sur votre activité réelle.
          </p>
        </div>
      </div>
    </div>
  );
}

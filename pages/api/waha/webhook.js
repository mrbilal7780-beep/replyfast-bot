/**
 * WAHA Webhook - Recevoir les messages WhatsApp
 * Traite les messages entrants et genere des reponses IA
 */

import { createClient } from '@supabase/supabase-js';
import { getSectorById } from '../../../lib/sectors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3001';
const WAHA_API_KEY = process.env.WAHA_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    console.log('WAHA Event:', event.event, event);

    // Gerer les differents types d'events
    if (event.event === 'session.status') {
      console.log('Session status changed:', event.payload?.status);
      return res.status(200).json({ received: true });
    }

    // Message entrant
    if (event.event === 'message' && event.payload) {
      const { from, body, sessionName } = event.payload;

      // Ignorer les messages sortants
      if (event.payload.fromMe) {
        return res.status(200).json({ received: true });
      }

      const customerPhone = from.replace('@c.us', '');
      const incomingMessage = body;

      console.log('Message recu de:', customerPhone, '|', incomingMessage);

      // Trouver le client par session WAHA
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('waha_session', sessionName || 'default')
        .single();

      if (!client) {
        console.error('Client non trouve pour session:', sessionName);
        return res.status(200).json({ received: true });
      }

      // Gerer conversation
      let { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('customer_phone', customerPhone)
        .eq('client_email', client.email)
        .single();

      if (!conversation) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert([{
            client_email: client.email,
            customer_phone: customerPhone,
            status: 'active',
            last_message_at: new Date().toISOString()
          }])
          .select()
          .single();
        conversation = newConv;
      } else {
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);
      }

      // Sauvegarder message
      await supabase.from('messages').insert([{
        conversation_id: conversation.id,
        sender: 'customer',
        message: incomingMessage,
        message_type: 'text'
      }]);

      // Charger historique
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const conversationHistory = (recentMessages || []).reverse().map(m => ({
        role: m.sender === 'customer' ? 'user' : 'assistant',
        content: m.message
      }));
      conversationHistory.push({ role: 'user', content: incomingMessage });

      // Charger infos business
      const { data: businessInfo } = await supabase
        .from('business_info')
        .select('*')
        .eq('client_email', client.email)
        .single();

      const sectorInfo = getSectorById(client.sector);

      // Generer reponse IA
      const systemPrompt = buildSystemPrompt(sectorInfo, businessInfo);

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      const aiData = await openaiResponse.json();
      const botReply = aiData.choices?.[0]?.message?.content || 'Desole, je n\'ai pas compris.';

      // Sauvegarder reponse
      await supabase.from('messages').insert([{
        conversation_id: conversation.id,
        sender: 'bot',
        message: botReply,
        message_type: 'text'
      }]);

      // Envoyer via WAHA
      await fetch(`${WAHA_URL}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {})
        },
        body: JSON.stringify({
          session: sessionName || 'default',
          chatId: from,
          text: botReply
        })
      });

      console.log('Reponse envoyee:', botReply);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('WAHA webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function buildSystemPrompt(sectorInfo, businessInfo) {
  const today = new Date();
  const todayStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let prompt = sectorInfo?.promptContext || 'Tu es un assistant WhatsApp professionnel.';

  if (businessInfo) {
    prompt += `\n\nEntreprise: ${businessInfo.nom_entreprise || 'Non defini'}
Adresse: ${businessInfo.adresse || 'Non definie'}
Telephone: ${businessInfo.telephone || 'Non defini'}

Horaires:
${Object.entries(businessInfo.horaires || {}).map(([jour, info]) =>
  `${jour}: ${info.ouvert ? info.horaires : 'Ferme'}`
).join('\n')}`;
  }

  prompt += `\n\nDate: ${todayStr}

Regles:
- Reponds en 2-3 phrases maximum
- Sois chaleureux et professionnel
- Utilise les vraies infos de l'entreprise
- Reponds toujours en francais`;

  return prompt;
}

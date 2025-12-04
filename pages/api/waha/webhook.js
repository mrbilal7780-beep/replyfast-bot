import { createClient } from '@supabase/supabase-js';
import { getSectorById } from '../../../lib/sectors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    console.log('📨 [WAHA Webhook]', event.event, event);

    // Traiter les différents types d'événements
    switch (event.event) {
      case 'message':
        await handleMessage(event);
        break;

      case 'session.status':
        await handleSessionStatus(event);
        break;

      case 'message.ack':
        // Message acquitté (envoyé, délivré, lu)
        break;

      default:
        console.log('📭 [WAHA] Événement non géré:', event.event);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ [WAHA Webhook] Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleMessage(event) {
  const { payload, session } = event;

  // Ignorer les messages sortants
  if (payload.fromMe) return;

  // Extraire les infos
  const customerPhone = payload.from.replace('@c.us', '');
  const message = payload.body || '';
  const messageType = payload.type || 'text';

  // Trouver le client avec cette session
  const { data: client } = await supabase
    .from('clients')
    .select('*, sector')
    .eq('waha_session_name', session)
    .maybeSingle();

  if (!client) {
    console.warn('⚠️ [WAHA] Client introuvable pour session:', session);
    return;
  }

  console.log('✅ [WAHA] Client trouvé:', client.email, '| Secteur:', client.sector);

  // Créer ou récupérer la conversation
  let { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('customer_phone', customerPhone)
    .eq('client_email', client.email)
    .maybeSingle();

  if (!conversation) {
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({
        client_email: client.email,
        customer_phone: customerPhone,
        customer_name: payload.from,
        status: 'active',
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    conversation = newConv;
  } else {
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);
  }

  // Sauvegarder le message client
  await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      client_email: client.email,
      customer_phone: customerPhone,
      sender: 'customer',
      direction: 'received',
      message: message,
      message_type: messageType,
      created_at: new Date().toISOString()
    });

  console.log('✅ [WAHA] Message sauvegardé:', customerPhone);

  // 🤖 GÉNÉRER RÉPONSE BOT
  await generateBotResponse(client, conversation, customerPhone, message, session);
}

async function generateBotResponse(client, conversation, customerPhone, incomingMessage, session) {
  try {
    // 1️⃣ Charger business_info
    const { data: businessInfo } = await supabase
      .from('business_info')
      .select('*')
      .eq('email', client.email)
      .maybeSingle();

    // 2️⃣ Charger historique (20 derniers messages)
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const conversationHistory = recentMessages
      .reverse()
      .map(m => ({
        role: m.sender === 'customer' ? 'user' : 'assistant',
        content: m.message
      }));

    // 3️⃣ Générer le prompt système
    const sectorData = getSectorById(client.sector);
    const sectorName = sectorData?.name || 'service';

    const systemPrompt = `Tu es l'assistant virtuel de ${businessInfo?.nom_entreprise || 'cette entreprise'}, spécialisée dans ${sectorName}.

INFORMATIONS ENTREPRISE:
- Nom: ${businessInfo?.nom_entreprise || 'Non défini'}
- Téléphone: ${businessInfo?.telephone || 'Non défini'}
- Adresse: ${businessInfo?.adresse || 'Non défini'}
- Description: ${businessInfo?.description || 'Non défini'}

HORAIRES:
${businessInfo?.horaires ? Object.entries(businessInfo.horaires).map(([jour, h]) =>
  `- ${jour.charAt(0).toUpperCase() + jour.slice(1)}: ${h.ouvert ? h.horaires : 'Fermé'}`
).join('\n') : 'Non définis'}

TON RÔLE:
- Réponds de manière professionnelle, chaleureuse et concise (2-3 phrases max)
- Aide pour: informations, horaires, services, prise de RDV
- Si le client veut un RDV, demande: date, heure, service souhaité
- Utilise les émojis avec modération (1-2 max par message)
- Reste dans ton domaine de compétence (${sectorName})

STYLE:
- Sympathique mais professionnel
- Réponses courtes et utiles
- Pas de blabla inutile`;

    // 4️⃣ Appeler OpenAI GPT-4o-mini
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

    const data = await openaiResponse.json();
    const botReply = data.choices[0].message.content;

    console.log('✅ [WAHA Bot] Réponse générée:', botReply);

    // 5️⃣ Sauvegarder réponse bot
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        client_email: client.email,
        customer_phone: customerPhone,
        sender: 'bot',
        direction: 'sent',
        message: botReply,
        message_type: 'text',
        created_at: new Date().toISOString()
      });

    // 6️⃣ Envoyer via WAHA
    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
    const chatId = customerPhone + '@c.us';

    const wahaResponse = await fetch(
      `${wahaUrl}/api/${session}/sendText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.WAHA_API_KEY || ''
        },
        body: JSON.stringify({
          chatId: chatId,
          text: botReply,
          session: session
        })
      }
    );

    const wahaData = await wahaResponse.json();

    if (!wahaResponse.ok) {
      console.error('❌ [WAHA Bot] Erreur envoi:', wahaData);
      return;
    }

    console.log('✅ [WAHA Bot] Message envoyé via WhatsApp!');

  } catch (error) {
    console.error('❌ [WAHA Bot] Erreur génération réponse:', error);
  }
}

async function handleSessionStatus(event) {
  const { session, payload } = event;
  console.log('📱 [WAHA] Session status:', session, payload.status);

  // Mettre à jour le statut dans la DB
  await supabase
    .from('clients')
    .update({
      whatsapp_connected: payload.status === 'WORKING'
    })
    .eq('waha_session_name', session);
}

import { createClient } from '@supabase/supabase-js';

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
    .select('email')
    .eq('waha_session_name', session)
    .maybeSingle();

  if (!client) {
    console.warn('⚠️ [WAHA] Client introuvable pour session:', session);
    return;
  }

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
        status: 'active'
      })
      .select()
      .single();

    conversation = newConv;
  }

  // Sauvegarder le message
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
}

async function handleSessionStatus(event) {
  const { session, payload } = event;

  console.log('📱 [WAHA] Session status:', session, payload.status);

  // Mettre à jour le statut dans la DB si nécessaire
  await supabase
    .from('clients')
    .update({
      whatsapp_connected: payload.status === 'WORKING'
    })
    .eq('waha_session_name', session);
}

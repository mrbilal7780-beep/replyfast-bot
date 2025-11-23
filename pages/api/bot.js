import getRawBody from 'raw-body';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const config = {
  runtime: 'nodejs',
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  // VÉRIFICATION WEBHOOK (GET request de Meta)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === 'replyfast_webhook_secret_2025') {
      console.log('✅ Webhook vérifié!');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Forbidden');
    }
  }

  // TRAITEMENT DES MESSAGES (POST request)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const body = JSON.parse(rawBody.toString('utf8'));

    if (body.object && body.entry) {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (value.messages && value.messages[0]) {
        const message = value.messages[0];
        const fromNumber = message.from;
        const incomingMessage = message.text.body;

        console.log('📱 Message reçu de:', fromNumber);
        console.log('💬 Contenu:', incomingMessage);

        // Sauvegarder le message dans Supabase
        try {
          // 1. Trouver ou créer la conversation
          let { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .eq('customer_phone', fromNumber)
            .single();

          if (convError || !conversation) {
            // Créer une nouvelle conversation
            const { data: newConv, error: createError } = await supabase
              .from('conversations')
              .insert([
                {
                  client_id: 1, // Pour l'instant, tout va au client ID 1
                  customer_phone: fromNumber,
                  status: 'active'
                }
              ])
              .select()
              .single();

            if (createError) {
              console.error('❌ Erreur création conversation:', createError);
            } else {
              conversation = newConv;
            }
          }

          // 2. Sauvegarder le message client
          if (conversation) {
            await supabase
              .from('messages')
              .insert([
                {
                  conversation_id: conversation.id,
                  sender: 'customer',
                  message: incomingMessage,
                  message_type: 'text'
                }
              ]);
          }
        } catch (dbError) {
          console.error('❌ Erreur DB:', dbError);
        }

        // Appeler OpenAI
        console.log('🤖 Appel OpenAI...');
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Tu es un assistant automatique ReplyFast. Réponds en français, de manière professionnelle et concise.'
              },
              {
                role: 'user',
                content: incomingMessage
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        });

        if (!openaiResponse.ok) {
          const error = await openaiResponse.text();
          console.error('❌ Erreur OpenAI:', error);
          throw new Error(`OpenAI error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        const botReply = data.choices[0].message.content;
        
        console.log('✅ Réponse OpenAI:', botReply);

        // Sauvegarder la réponse du bot dans Supabase
        try {
          if (conversation) {
            await supabase
              .from('messages')
              .insert([
                {
                  conversation_id: conversation.id,
                  sender: 'bot',
                  message: botReply,
                  message_type: 'text'
                }
              ]);
          }
        } catch (dbError) {
          console.error('❌ Erreur DB (réponse bot):', dbError);
        }

        // Envoyer via Meta WhatsApp API
        console.log('📤 Envoi via Meta WhatsApp...');
        
        const metaResponse = await fetch(
          `https://graph.facebook.com/v21.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: fromNumber,
              text: { body: botReply }
            })
          }
        );

        if (!metaResponse.ok) {
          const error = await metaResponse.text();
          console.error('❌ Erreur Meta:', error);
          throw new Error(`Meta error: ${metaResponse.status}`);
        }

        console.log('✅ Message envoyé et sauvegardé!');
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}
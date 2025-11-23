import getRawBody from 'raw-body';
import { createClient } from '@supabase/supabase-js';
import { getSectorById } from '../../lib/sectors';

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

// 🔥 FONCTION POUR DÉTECTER ET CRÉER UN RDV
async function detectAndCreateAppointment(message, clientEmail, customerPhone) {
  const lowerMessage = message.toLowerCase();
  
  // Mots-clés pour détecter une demande de RDV
  const rdvKeywords = ['rendez-vous', 'rdv', 'réserver', 'reservation', 'booking', 'prendre rendez-vous', 'disponibilité', 'disponible'];
  
  const hasRdvIntent = rdvKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (!hasRdvIntent) return null;
  
  // Appeler OpenAI pour extraire les infos du RDV
  const extractionPrompt = `Analyse ce message et extrait les informations de rendez-vous:
Message: "${message}"

Réponds UNIQUEMENT avec un JSON valide (sans markdown, sans backticks):
{
  "hasAppointment": true/false,
  "date": "YYYY-MM-DD" (si mentionnée, sinon null),
  "time": "HH:MM" (si mentionnée, sinon null),
  "service": "nom du service" (si mentionné, sinon null),
  "name": "nom du client" (si mentionné, sinon null)
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: extractionPrompt }],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    const data = await response.json();
    let extracted = data.choices[0].message.content.trim();
    
    // Nettoyer les backticks markdown si présents
    extracted = extracted.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const appointmentData = JSON.parse(extracted);
    
    if (appointmentData.hasAppointment) {
      // Créer le RDV dans la base
      const { error } = await supabase
        .from('appointments')
        .insert([{
          client_email: clientEmail,
          customer_phone: customerPhone,
          customer_name: appointmentData.name,
          appointment_date: appointmentData.date || new Date().toISOString().split('T')[0],
          appointment_time: appointmentData.time || '10:00',
          service: appointmentData.service,
          status: 'pending',
          notes: message
        }]);
      
      if (!error) {
        console.log('✅ RDV créé automatiquement!');
        return appointmentData;
      }
    }
  } catch (error) {
    console.error('❌ Erreur extraction RDV:', error);
  }
  
  return null;
}

export default async function handler(req, res) {
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
        const receivingPhoneNumberId = value.metadata?.phone_number_id;

        console.log('📱 Message reçu de:', fromNumber);
        console.log('📞 Phone Number ID:', receivingPhoneNumberId);
        console.log('💬 Contenu:', incomingMessage);

        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('whatsapp_phone_number_id', receivingPhoneNumberId)
          .eq('whatsapp_connected', true)
          .single();

        if (clientError || !client) {
          console.error('❌ Client non trouvé');
          console.log('⚠️ Mode par défaut');
        }

        console.log('✅ Client:', client?.email || 'Défaut');
        console.log('🏢 Secteur:', client?.sector || 'Non défini');

        // 🔥 DÉTECTION ET CRÉATION AUTOMATIQUE DE RDV
        if (client) {
          const appointmentCreated = await detectAndCreateAppointment(
            incomingMessage, 
            client.email, 
            fromNumber
          );
          
          if (appointmentCreated) {
            console.log('📅 RDV détecté et créé!', appointmentCreated);
          }
        }

        let conversation = null;

        try {
          let { data: existingConv, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .eq('customer_phone', fromNumber)
            .eq('client_email', client?.email || 'default@replyfast.com')
            .single();

          if (convError || !existingConv) {
            const { data: newConv, error: createError } = await supabase
              .from('conversations')
              .insert([{
                client_email: client?.email || 'default@replyfast.com',
                customer_phone: fromNumber,
                status: 'active',
                last_message_at: new Date().toISOString()
              }])
              .select()
              .single();

            if (createError) {
              console.error('❌ Erreur création conversation:', createError);
            } else {
              conversation = newConv;
              console.log('✅ Nouvelle conversation:', conversation.id);
            }
          } else {
            conversation = existingConv;
            await supabase
              .from('conversations')
              .update({ last_message_at: new Date().toISOString() })
              .eq('id', conversation.id);
            console.log('✅ Conversation existante:', conversation.id);
          }

          if (conversation) {
            await supabase
              .from('messages')
              .insert([{
                conversation_id: conversation.id,
                sender: 'customer',
                message: incomingMessage,
                message_type: 'text'
              }]);
            console.log('✅ Message client sauvegardé');
          }
        } catch (dbError) {
          console.error('❌ Erreur DB:', dbError);
        }

        const sectorInfo = client?.sector ? getSectorById(client.sector) : null;

        let menuContext = '';
        if (sectorInfo?.menuEnabled && client) {
          const { data: menuData } = await supabase
            .from('menus')
            .select('menu_text')
            .eq('client_email', client.email)
            .single();
          
          if (menuData?.menu_text) {
            menuContext = `\n\nVOICI LA CARTE/MENU:\n${menuData.menu_text}\n\nUtilise ces informations pour répondre aux questions sur les plats, prix, et recommandations.`;
            console.log('📋 Menu chargé');
          }
        }

        const systemPrompt = sectorInfo 
          ? sectorInfo.promptContext + menuContext + '\n\nSi le client veut un rendez-vous, demande-lui la date et l\'heure souhaitées de manière naturelle.'
          : 'Tu es un assistant automatique ReplyFast. Réponds en français, de manière professionnelle et concise.' + menuContext;

        console.log('🤖 Contexte IA:', sectorInfo?.name || 'Générique');
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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: incomingMessage }
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

        try {
          if (conversation) {
            await supabase
              .from('messages')
              .insert([{
                conversation_id: conversation.id,
                sender: 'bot',
                message: botReply,
                message_type: 'text'
              }]);
            console.log('✅ Réponse bot sauvegardée');
          }
        } catch (dbError) {
          console.error('❌ Erreur DB (réponse bot):', dbError);
        }

        const phoneNumberToUse = receivingPhoneNumberId || process.env.META_PHONE_NUMBER_ID;
        
        console.log('📤 Envoi via Meta WhatsApp...');
        
        const metaResponse = await fetch(
          `https://graph.facebook.com/v21.0/${phoneNumberToUse}/messages`,
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

        console.log('✅ Message envoyé via WhatsApp!');
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
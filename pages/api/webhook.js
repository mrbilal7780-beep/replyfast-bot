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

// 📅 FONCTION POUR CALCULER LES DATES
function parseRelativeDate(text) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lower = text.toLowerCase();
  
  if (lower.includes('aujourd\'hui') || lower.includes('aujourdhui')) {
    return today.toISOString().split('T')[0];
  }
  
  if (lower.includes('demain')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  if (lower.includes('après-demain') || lower.includes('apres-demain')) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  }
  
  // Format "24 novembre", "24/11", etc.
  const dateMatch = text.match(/(\d{1,2})[\/\-\s](novembre|décembre|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|11|12|01|02|03|04|05|06|07|08|09|10)/i);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const monthMap = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
    };
    const month = monthMap[dateMatch[2].toLowerCase()] || dateMatch[2].padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }
  
  return null;
}

// 📅 CHARGER LE CALENDRIER DES RDV
async function loadCalendar(clientEmail, date) {
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('client_email', clientEmail)
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed'])
    .order('appointment_time', { ascending: true });
  
  return data || [];
}

// 🎯 SUGGÉRER DES CRÉNEAUX LIBRES
function suggestAvailableSlots(existingAppointments, businessHours, date) {
  const dayOfWeek = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
  const dayInfo = businessHours[dayOfWeek];
  
  if (!dayInfo?.ouvert) {
    return [];
  }
  
  // Créneaux de 30min de 9h à 18h par défaut
  const allSlots = [];
  for (let h = 9; h <= 18; h++) {
    allSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 18) allSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  
  // Retirer les créneaux pris
  const bookedSlots = existingAppointments.map(a => a.appointment_time);
  const available = allSlots.filter(slot => !bookedSlots.includes(slot));
  
  return available.slice(0, 5); // Top 5 créneaux
}

// 🧠 DÉTECTION INTELLIGENTE DE RDV
async function detectAppointment(conversationHistory, clientEmail, customerPhone, businessInfo) {
  const today = new Date();
  const todayStr = today.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const fullConvo = conversationHistory.map(m => 
    `${m.role === 'user' ? 'Client' : 'Assistant'}: ${m.content}`
  ).join('\n');

  const extractionPrompt = `Tu es un expert en analyse de conversations pour la prise de rendez-vous.

CONVERSATION:
${fullConvo}

CONTEXTE:
- Aujourd'hui: ${todayStr}
- Date ISO: ${today.toISOString().split('T')[0]}

INSTRUCTIONS:
Analyse cette conversation et détermine si le client veut un RDV.
Extrait: date, heure, service, nom.

RÈGLES:
- "demain" = ${new Date(today.getTime() + 86400000).toISOString().split('T')[0]}
- "après-demain" = ${new Date(today.getTime() + 172800000).toISOString().split('T')[0]}
- Si date partielle, ajoute l'année en cours
- Confiance entre 0 et 1

Réponds UNIQUEMENT avec ce JSON (sans markdown):
{
  "hasAppointment": true/false,
  "readyToCreate": true/false,
  "date": "YYYY-MM-DD" ou null,
  "time": "HH:MM" ou null,
  "service": "service exact" ou null,
  "name": "nom" ou null,
  "missingInfo": ["date", "time", "service"],
  "confidence": 0.95
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: extractionPrompt }],
        temperature: 0.1,
        max_tokens: 300
      })
    });

    const data = await response.json();
    let result = data.choices[0].message.content.trim()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const appointmentData = JSON.parse(result);
    
    console.log('🧠 Analyse RDV:', appointmentData);

    // Si prêt à créer
    if (appointmentData.readyToCreate && appointmentData.date && appointmentData.time) {
      // Vérifier si le créneau est libre
      const existingRdv = await loadCalendar(clientEmail, appointmentData.date);
      const isSlotTaken = existingRdv.some(rdv => rdv.appointment_time === appointmentData.time);
      
      if (isSlotTaken) {
        // Suggérer d'autres créneaux
        const available = suggestAvailableSlots(existingRdv, businessInfo?.horaires || {}, appointmentData.date);
        return {
          ...appointmentData,
          slotTaken: true,
          availableSlots: available
        };
      }
      
      // Créer le RDV
      const { error } = await supabase
        .from('appointments')
        .insert([{
          client_email: clientEmail,
          customer_phone: customerPhone,
          customer_name: appointmentData.name || 'Client',
          appointment_date: appointmentData.date,
          appointment_time: appointmentData.time,
          service: appointmentData.service || 'Service général',
          status: 'pending',
          notes: 'RDV pris automatiquement par IA'
        }]);
      
      if (!error) {
        console.log('✅ RDV CRÉÉ!');
        return { ...appointmentData, created: true };
      }
    }
    
    return appointmentData;

  } catch (error) {
    console.error('❌ Erreur détection:', error);
    return { hasAppointment: false, confidence: 0 };
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === 'replyfast_webhook_secret_2025') {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
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

        console.log('📱 Message:', fromNumber, incomingMessage);

        // 1️⃣ Identifier le client
        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('whatsapp_phone_number_id', receivingPhoneNumberId)
          .eq('whatsapp_connected', true)
          .single();

        if (!client) {
          console.error('❌ Client non trouvé');
          return res.status(200).send('OK');
        }

        console.log('✅ Client:', client.email, '| Secteur:', client.sector);

        // 2️⃣ Gérer la conversation
        let { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('customer_phone', fromNumber)
          .eq('client_email', client.email)
          .single();

        if (!conversation) {
          const { data: newConv } = await supabase
            .from('conversations')
            .insert([{
              client_email: client.email,
              customer_phone: fromNumber,
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

        // 3️⃣ Sauvegarder message client
        await supabase
          .from('messages')
          .insert([{
            conversation_id: conversation.id,
            sender: 'customer',
            message: incomingMessage,
            message_type: 'text'
          }]);

        // 4️⃣ Charger historique (10 derniers messages)
        const { data: recentMessages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const conversationHistory = (recentMessages || []).reverse().map(m => ({
          role: m.sender === 'customer' ? 'user' : 'assistant',
          content: m.message
        }));

        conversationHistory.push({ role: 'user', content: incomingMessage });

        // 5️⃣ Charger infos business
        const { data: businessInfo } = await supabase
          .from('business_info')
          .select('*')
          .eq('client_email', client.email)
          .single();

        // 6️⃣ Charger menu
        const { data: menuData } = await supabase
          .from('menus')
          .select('menu_text')
          .eq('client_email', client.email)
          .single();

        // 7️⃣ Charger secteur
        const sectorInfo = getSectorById(client.sector);

        // 8️⃣ Détecter RDV
        const rdvInfo = await detectAppointment(
          conversationHistory,
          client.email,
          fromNumber,
          businessInfo
        );

        // 9️⃣ Construire le contexte ultra complet
        const today = new Date();
        const todayStr = today.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        let businessContext = '';
        if (businessInfo) {
          businessContext = `\n\n🏢 INFORMATIONS ENTREPRISE:
Nom: ${businessInfo.nom_entreprise || 'Non défini'}
Adresse: ${businessInfo.adresse || 'Non définie'}
Téléphone: ${businessInfo.telephone || 'Non défini'}
${businessInfo.description ? `\nDescription: ${businessInfo.description}` : ''}

📅 HORAIRES D'OUVERTURE:
${Object.entries(businessInfo.horaires || {}).map(([jour, info]) => 
  `${jour.charAt(0).toUpperCase() + jour.slice(1)}: ${info.ouvert ? info.horaires : 'Fermé'}`
).join('\n')}

💰 TARIFS:
${businessInfo.tarifs && Object.keys(businessInfo.tarifs).length > 0 
  ? Object.entries(businessInfo.tarifs).map(([service, prix]) => `${service}: ${prix}`).join('\n')
  : 'Voir le menu pour les tarifs'}

💳 Paiements acceptés: ${businessInfo.moyens_paiement?.join(', ') || 'Espèces, CB'}`;
        }

        let menuContext = '';
        if (menuData?.menu_text) {
          menuContext = `\n\n📋 MENU/CATALOGUE:
${menuData.menu_text}`;
        }

        let rdvGuidance = '';
        if (rdvInfo.created) {
          const dateStr = new Date(rdvInfo.date).toLocaleDateString('fr-FR', { 
            weekday: 'long', day: 'numeric', month: 'long' 
          });
          rdvGuidance = `\n\n✅ RDV VIENT D'ÊTRE CRÉÉ!
Confirme au client avec enthousiasme:
"✅ Parfait! Votre rendez-vous est confirmé pour le ${dateStr} à ${rdvInfo.time}${rdvInfo.service ? ` pour ${rdvInfo.service}` : ''}. À très bientôt!"`;
        } else if (rdvInfo.slotTaken) {
          rdvGuidance = `\n\n⚠️ Le créneau ${rdvInfo.time} le ${rdvInfo.date} est déjà pris.
Propose ces créneaux disponibles: ${rdvInfo.availableSlots.join(', ')}`;
        } else if (rdvInfo.hasAppointment && !rdvInfo.readyToCreate) {
          rdvGuidance = `\n\n🎯 Le client veut un RDV mais il manque: ${rdvInfo.missingInfo.join(', ')}.
Demande les infos manquantes de manière naturelle et concise.`;
        }

        const systemPrompt = `${sectorInfo?.promptContext || 'Tu es un assistant automatique ReplyFast.'}${businessContext}${menuContext}

📅 INFORMATIONS TEMPORELLES:
- Aujourd'hui: ${todayStr}
- Date ISO: ${today.toISOString().split('T')[0]}

${rdvGuidance}

🎯 RÈGLES D'OR:
- Sois chaleureux, professionnel et efficace
- Réponds en 2-3 phrases MAX (concis!)
- Ne redemande JAMAIS une info déjà donnée
- Utilise les infos business/menu pour répondre précisément
- Si question sur prix/horaires, donne la vraie info
- Si RDV créé, termine par "À très bientôt!" 🎉`;

        console.log('🤖 Appel GPT-4...');

        // 🔟 Appel OpenAI GPT-4
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationHistory
            ],
            max_tokens: 250,
            temperature: 0.7
          })
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        const botReply = data.choices[0].message.content;

        console.log('✅ Réponse:', botReply);

        // 1️⃣1️⃣ Sauvegarder réponse
        await supabase
          .from('messages')
          .insert([{
            conversation_id: conversation.id,
            sender: 'bot',
            message: botReply,
            message_type: 'text'
          }]);

        // 1️⃣2️⃣ Envoyer via WhatsApp
        await fetch(
          `https://graph.facebook.com/v21.0/${receivingPhoneNumberId}/messages`,
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

        console.log('✅ Envoyé!');
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('❌ ERREUR:', error);
    return res.status(500).json({ error: error.message });
  }
}
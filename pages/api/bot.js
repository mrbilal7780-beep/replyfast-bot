import { createClient } from '@supabase/supabase-js';
import getRawBody from 'raw-body';
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

// 🧠 DÉTECTION INTELLIGENTE DE RDV AVEC GPT-4O-MINI
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

CONTEXTE TEMPOREL:
- Aujourd'hui: ${todayStr}
- Date ISO: ${today.toISOString().split('T')[0]}

MISSION:
Analyse cette conversation et détermine si le client veut prendre un rendez-vous.
Extrais: date, heure, service demandé, nom du client.

RÈGLES DE TRANSFORMATION DES DATES:
- "demain" = ${new Date(today.getTime() + 86400000).toISOString().split('T')[0]}
- "après-demain" = ${new Date(today.getTime() + 172800000).toISOString().split('T')[0]}
- "lundi prochain", "mardi prochain" = calculer la date du prochain jour
- Si date partielle (ex: "15 décembre"), ajoute l'année en cours (${today.getFullYear()})
- Confiance entre 0 et 1

IMPORTANT:
- readyToCreate = true SEULEMENT si tu as date + heure + service (nom optionnel)
- missingInfo = liste exacte de ce qui manque parmi: ["date", "time", "service", "name"]

Réponds UNIQUEMENT avec ce JSON (sans markdown, sans backticks):
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
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: extractionPrompt }],
        temperature: 0.1,
        max_tokens: 400
      })
    });

    const data = await response.json();
    let result = data.choices[0].message.content.trim()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const appointmentData = JSON.parse(result);
    
    console.log('🧠 Analyse RDV:', appointmentData);

    // Si prêt à créer le RDV
    if (appointmentData.readyToCreate && appointmentData.date && appointmentData.time) {
      // Vérifier si le créneau est libre
      const existingRdv = await loadCalendar(clientEmail, appointmentData.date);
      const isSlotTaken = existingRdv.some(rdv => rdv.appointment_time === appointmentData.time);
      
      if (isSlotTaken) {
        // Suggérer d'autres créneaux disponibles
        const available = suggestAvailableSlots(existingRdv, businessInfo?.horaires || {}, appointmentData.date);
        return {
          ...appointmentData,
          slotTaken: true,
          availableSlots: available
        };
      }
      
      // ✅ Créer le RDV dans Supabase
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
        console.log('✅ RDV CRÉÉ:', appointmentData);
        return { ...appointmentData, created: true };
      }
    }
    
    return appointmentData;

  } catch (error) {
    console.error('❌ Erreur détection RDV:', error);
    return { hasAppointment: false, confidence: 0 };
  }
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
  
  // Retirer les créneaux déjà pris
  const bookedSlots = existingAppointments.map(a => a.appointment_time);
  const available = allSlots.filter(slot => !bookedSlots.includes(slot));
  
  return available.slice(0, 5); // Top 5 créneaux disponibles
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

        console.log('📱 Message reçu:', fromNumber, '|', incomingMessage);

        // 1️⃣ Identifier le client - Recherche plus flexible
        let { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('whatsapp_phone_number_id', receivingPhoneNumberId)
          .single();

        // Si pas trouvé par phone_number_id, essayer par waba_id
        if (!client && value.metadata?.waba_id) {
          const { data: clientByWaba } = await supabase
            .from('clients')
            .select('*')
            .eq('waba_id', value.metadata.waba_id)
            .single();
          client = clientByWaba;
        }

        if (!client) {
          console.error('❌ Client non trouvé pour phone_number_id:', receivingPhoneNumberId);
          console.error('   Metadata:', JSON.stringify(value.metadata));
          console.error('   Error:', clientError);
          return res.status(200).send('OK');
        }

        console.log('✅ Client trouvé:', client.email, '| Secteur:', client.sector || 'NON DÉFINI');

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

        // 4️⃣ Charger historique (20 derniers messages pour contexte)
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

        // 7️⃣ Charger infos secteur
        const sectorInfo = getSectorById(client.sector);

        // 8️⃣ Détecter intentions de RDV
        const rdvInfo = await detectAppointment(
          conversationHistory,
          client.email,
          fromNumber,
          businessInfo
        );

        // 9️⃣ Construire le contexte ULTRA COMPLET
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
${businessInfo.description ? `Description: ${businessInfo.description}` : ''}

📅 HORAIRES D'OUVERTURE:
${Object.entries(businessInfo.horaires || {}).map(([jour, info]) => 
  `${jour.charAt(0).toUpperCase() + jour.slice(1)}: ${info.ouvert ? info.horaires : 'Fermé'}`
).join('\n')}

💰 TARIFS:
${businessInfo.tarifs && Object.keys(businessInfo.tarifs).length > 0 
  ? Object.entries(businessInfo.tarifs).map(([service, prix]) => `${service}: ${prix}`).join('\n')
  : 'Tarifs sur demande'}

💳 Paiements acceptés: ${businessInfo.moyens_paiement?.join(', ') || 'Espèces, CB'}`;
        }

        let menuContext = '';
        if (menuData?.menu_text) {
          menuContext = `\n\n📋 MENU/CATALOGUE COMPLET:
${menuData.menu_text}`;
        }

        let rdvGuidance = '';
        if (rdvInfo.created) {
          const dateStr = new Date(rdvInfo.date).toLocaleDateString('fr-FR', { 
            weekday: 'long', day: 'numeric', month: 'long' 
          });
          rdvGuidance = `\n\n✅ 🎉 RDV VIENT D'ÊTRE CRÉÉ AVEC SUCCÈS!
Tu DOIS confirmer au client avec ENTHOUSIASME:
"✅ Parfait! Votre rendez-vous est confirmé pour le ${dateStr} à ${rdvInfo.time}${rdvInfo.service ? ` pour ${rdvInfo.service}` : ''}. À très bientôt! 🎉"`;
        } else if (rdvInfo.slotTaken) {
          rdvGuidance = `\n\n⚠️ CRÉNEAU DÉJÀ PRIS
Le créneau ${rdvInfo.time} le ${rdvInfo.date} est malheureusement déjà réservé.
Propose GENTIMENT ces créneaux disponibles: ${rdvInfo.availableSlots.join(', ')}`;
        } else if (rdvInfo.hasAppointment && !rdvInfo.readyToCreate) {
          rdvGuidance = `\n\n🎯 CLIENT VEUT UN RDV - Infos manquantes: ${rdvInfo.missingInfo.join(', ')}
Demande les infos manquantes de manière NATURELLE et CONCISE.
Ne redemande JAMAIS ce qui a déjà été dit dans l'historique.`;
        }

        // 🔟 PROMPT SYSTÈME ULTRA OPTIMISÉ POUR GPT-4O-MINI
        const systemPrompt = `${sectorInfo?.promptContext || 'Tu es un assistant WhatsApp automatique pour ReplyFast AI.'}${businessContext}${menuContext}

📅 INFORMATIONS TEMPORELLES:
- Aujourd'hui: ${todayStr}
- Date ISO complète: ${today.toISOString().split('T')[0]}
- Heure actuelle: ${today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}

${rdvGuidance}

🎯 RÈGLES D'OR À RESPECTER ABSOLUMENT:
1. CONCISION: Réponds en 2-3 phrases MAXIMUM (sauf si détail du menu demandé)
2. MÉMOIRE: Ne redemande JAMAIS une info déjà donnée dans l'historique
3. PRÉCISION: Utilise les vraies infos (horaires, tarifs, menu) pour répondre
4. NATUREL: Parle comme un humain chaleureux et professionnel
5. PROACTIF: Si question sur prix/horaires, donne la VRAIE info immédiatement
6. RDV: Si RDV créé, termine par "À très bientôt! 🎉"
7. FRANÇAIS: Réponds TOUJOURS en français correct

EXEMPLES DE BONNES RÉPONSES:
❌ MAUVAIS: "Bien sûr! Je peux vous aider. Quels sont vos besoins aujourd'hui?"
✅ BON: "Bonjour! Vous souhaitez un rendez-vous? 😊"

❌ MAUVAIS: "Je vous remercie pour votre message. Je vais regarder nos disponibilités..."
✅ BON: "Avec plaisir! Quel jour vous arrange? Nous sommes ouverts du lundi au samedi."`;

        console.log('🤖 Appel GPT-4o-mini...');

        // 1️⃣1️⃣ Appel OpenAI GPT-4o-mini (ULTRA ÉCONOMIQUE)
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

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        const botReply = data.choices[0].message.content;

        console.log('✅ Réponse générée:', botReply);

        // 1️⃣2️⃣ Sauvegarder réponse bot
        await supabase
          .from('messages')
          .insert([{
            conversation_id: conversation.id,
            sender: 'bot',
            message: botReply,
            message_type: 'text'
          }]);

        // 1️⃣3️⃣ Envoyer via WhatsApp
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

        console.log('✅ Message WhatsApp envoyé!');
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE:', error);
    return res.status(500).json({ error: error.message });
  }
}
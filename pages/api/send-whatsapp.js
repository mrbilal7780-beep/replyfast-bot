/**
 * API Route: Envoi de messages WhatsApp via WAHA
 * Migration complète de Meta Graph API vers WAHA
 */

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
    // 1. Vérifier l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Session invalide' });
    }

    // 2. Récupérer les paramètres
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        error: 'Paramètres manquants',
        required: ['to', 'message']
      });
    }

    // 3. Valider le numéro de téléphone
    const phoneRegex = /^\+?\d{10,15}$/;
    const cleanPhone = to.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide' });
    }

    // 4. Récupérer la session WAHA du client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('waha_session_name, whatsapp_connected')
      .eq('email', user.email)
      .single();

    if (clientError || !client) {
      return res.status(403).json({ error: 'Client non trouvé' });
    }

    if (!client.waha_session_name) {
      return res.status(400).json({
        error: 'WhatsApp non configuré',
        details: 'Veuillez connecter votre WhatsApp dans l\'onboarding'
      });
    }

    if (!client.whatsapp_connected) {
      return res.status(400).json({
        error: 'WhatsApp déconnecté',
        details: 'Veuillez reconnecter votre WhatsApp'
      });
    }

    // 5. Formatter le numéro pour WAHA (format: 33612345678@c.us)
    const formattedPhone = cleanPhone.startsWith('+')
      ? cleanPhone.substring(1) + '@c.us'
      : cleanPhone + '@c.us';

    // 6. Envoyer le message via WAHA
    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
    const wahaResponse = await fetch(
      `${wahaUrl}/api/${client.waha_session_name}/sendText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.WAHA_API_KEY || ''
        },
        body: JSON.stringify({
          chatId: formattedPhone,
          text: message,
          session: client.waha_session_name
        })
      }
    );

    const wahaData = await wahaResponse.json();

    if (!wahaResponse.ok) {
      console.error('❌ Erreur API WAHA:', wahaData);
      return res.status(wahaResponse.status).json({
        error: 'Erreur envoi WhatsApp via WAHA',
        details: wahaData.message || wahaData.error || 'Erreur inconnue',
        code: wahaData.code
      });
    }

    // 7. Succès
    console.log('✅ Message WhatsApp envoyé via WAHA:', wahaData);
    return res.status(200).json({
      success: true,
      message_id: wahaData.id,
      data: wahaData
    });

  } catch (error) {
    console.error('❌ Erreur send-whatsapp:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
}

/**
 * API Route: Envoi de messages WhatsApp
 * Sécurise l'access token Meta en le gardant côté serveur
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
    const { phone_number_id, to, message } = req.body;

    if (!phone_number_id || !to || !message) {
      return res.status(400).json({
        error: 'Paramètres manquants',
        required: ['phone_number_id', 'to', 'message']
      });
    }

    // 3. Valider le numéro de téléphone
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide' });
    }

    // 4. Vérifier que l'utilisateur a accès à ce phone_number_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('whatsapp_phone_number_id, whatsapp_token')
      .eq('email', user.email)
      .single();

    if (clientError || !client) {
      return res.status(403).json({ error: 'Client non trouvé' });
    }

    if (client.whatsapp_phone_number_id !== phone_number_id) {
      return res.status(403).json({ error: 'Phone Number ID non autorisé' });
    }

    // 5. Utiliser le token WhatsApp du client OU le token global
    const accessToken = client.whatsapp_token || process.env.META_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error: 'Configuration WhatsApp manquante',
        details: 'Configurez votre token WhatsApp dans les paramètres'
      });
    }

    // 6. Envoyer le message via l'API Meta
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v21.0/${phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          text: { body: message }
        })
      }
    );

    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('❌ Erreur API Meta:', whatsappData);
      return res.status(whatsappResponse.status).json({
        error: 'Erreur envoi WhatsApp',
        details: whatsappData.error?.message || 'Erreur inconnue',
        code: whatsappData.error?.code
      });
    }

    // 7. Succès
    console.log('✅ Message WhatsApp envoyé:', whatsappData);
    return res.status(200).json({
      success: true,
      message_id: whatsappData.messages?.[0]?.id,
      data: whatsappData
    });

  } catch (error) {
    console.error('❌ Erreur send-whatsapp:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
}

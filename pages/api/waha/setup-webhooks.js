/**
 * Configure les webhooks WAHA APRÈS connexion WhatsApp
 * À appeler une fois que WhatsApp est connecté (status = WORKING)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
    const sessionName = 'default';

    console.log('🔗 [WAHA] Configuration webhooks pour session:', sessionName);

    // Vérifier que la session existe et est WORKING
    const statusResponse = await fetch(`${wahaUrl}/api/sessions/${sessionName}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      }
    });

    if (!statusResponse.ok) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée. Connectez WhatsApp d\'abord.'
      });
    }

    const statusData = await statusResponse.json();

    if (statusData.status !== 'WORKING') {
      return res.status(400).json({
        success: false,
        error: `WhatsApp pas encore connecté (status: ${statusData.status}). Scannez le QR code d'abord.`,
        currentStatus: statusData.status
      });
    }

    // Ajouter les webhooks via l'API WAHA
    const webhookResponse = await fetch(`${wahaUrl}/api/sessions/${sessionName}/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      },
      body: JSON.stringify({
        url: 'https://replyfast-bot.onrender.com/api/waha/webhook',
        events: ['message', 'session.status'],
        hmac: null,
        retries: null,
        customHeaders: null
      })
    });

    const webhookData = await webhookResponse.json();

    if (!webhookResponse.ok) {
      console.error('❌ [WAHA] Erreur config webhooks:', webhookData);
      return res.status(500).json({
        success: false,
        error: webhookData.message || 'Erreur configuration webhooks',
        details: webhookData
      });
    }

    console.log('✅ [WAHA] Webhooks configurés avec succès !');

    return res.status(200).json({
      success: true,
      message: 'Webhooks configurés ! Le bot va maintenant répondre automatiquement aux messages.',
      webhook: webhookData
    });

  } catch (error) {
    console.error('❌ [WAHA Webhooks] Erreur:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

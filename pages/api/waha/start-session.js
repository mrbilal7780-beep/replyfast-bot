/**
 * WAHA - Demarrer une session WhatsApp
 * Cree ou redemarre une session pour permettre le scan QR
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3001';
  const WAHA_API_KEY = process.env.WAHA_API_KEY;
  const headers = WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {};

  try {
    const { sessionName = 'default' } = req.body;

    // 1. Verifier le statut actuel de la session
    const checkResponse = await fetch(`${WAHA_URL}/api/sessions/${sessionName}`, { headers });

    if (checkResponse.ok) {
      const sessionData = await checkResponse.json();

      // Si deja connecte (WORKING), retourner
      if (sessionData.status === 'WORKING') {
        return res.status(200).json({
          success: true,
          status: 'WORKING',
          message: 'Session deja connectee'
        });
      }

      // Si en attente de QR (SCAN_QR_CODE), c'est bon
      if (sessionData.status === 'SCAN_QR_CODE') {
        return res.status(200).json({
          success: true,
          status: 'SCAN_QR_CODE',
          message: 'QR code disponible'
        });
      }

      // Sinon, stopper puis redemarrer proprement
      await fetch(`${WAHA_URL}/api/sessions/${sessionName}/stop`, {
        method: 'POST',
        headers
      });

      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 2. Creer ou demarrer la session
    const createResponse = await fetch(`${WAHA_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        name: sessionName,
        start: true,
        config: {
          webhooks: [
            {
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://replyfast-bot.onrender.com'}/api/waha/webhook`,
              events: ['message', 'session.status']
            }
          ]
        }
      })
    });

    // Si la session existe deja, la demarrer
    if (createResponse.status === 422 || createResponse.status === 409) {
      await fetch(`${WAHA_URL}/api/sessions/${sessionName}/start`, {
        method: 'POST',
        headers
      });
    }

    return res.status(200).json({
      success: true,
      sessionName,
      message: 'Session demarree, attendez le QR code'
    });

  } catch (error) {
    console.error('WAHA start-session error:', error);

    if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return res.status(503).json({
        error: 'Serveur WAHA non disponible'
      });
    }

    return res.status(500).json({
      error: 'Erreur de connexion WAHA',
      details: error.message
    });
  }
}

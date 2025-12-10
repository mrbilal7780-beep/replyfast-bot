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

  try {
    const { sessionName = 'default' } = req.body;

    // Verifier si la session existe deja
    const checkResponse = await fetch(`${WAHA_URL}/api/sessions/${sessionName}`, {
      headers: WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {}
    });

    if (checkResponse.ok) {
      const sessionData = await checkResponse.json();

      // Si deja connecte, retourner le statut
      if (sessionData.status === 'WORKING') {
        return res.status(200).json({
          success: true,
          status: 'WORKING',
          message: 'Session deja connectee'
        });
      }

      // Si existe mais pas connecte, restart
      if (sessionData.status === 'STOPPED' || sessionData.status === 'FAILED') {
        await fetch(`${WAHA_URL}/api/sessions/${sessionName}/restart`, {
          method: 'POST',
          headers: WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {}
        });
      }
    } else {
      // Creer nouvelle session
      const createResponse = await fetch(`${WAHA_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {})
        },
        body: JSON.stringify({
          name: sessionName,
          config: {
            webhooks: [
              {
                url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/waha/webhook`,
                events: ['message', 'session.status']
              }
            ]
          }
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Erreur creation session: ${error}`);
      }
    }

    // Demarrer la session
    const startResponse = await fetch(`${WAHA_URL}/api/sessions/${sessionName}/start`, {
      method: 'POST',
      headers: WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {}
    });

    if (!startResponse.ok && startResponse.status !== 409) {
      // 409 = deja demarree, c'est ok
      const error = await startResponse.text();
      console.error('Erreur demarrage session:', error);
    }

    return res.status(200).json({
      success: true,
      sessionName,
      message: 'Session demarree, QR code disponible'
    });

  } catch (error) {
    console.error('WAHA start-session error:', error);

    // Check if WAHA server is not reachable
    if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return res.status(503).json({
        error: 'Serveur WAHA non disponible',
        details: 'Verifiez que votre serveur WAHA est demarre et accessible.',
        help: 'Variable WAHA_URL actuelle: ' + (process.env.WAHA_URL || 'http://localhost:3001 (defaut)')
      });
    }

    return res.status(500).json({
      error: 'Erreur de connexion WAHA',
      details: error.message
    });
  }
}

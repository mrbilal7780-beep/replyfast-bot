/**
 * WAHA - Verifier le statut de la session
 * Retourne si WhatsApp est connecte ou non
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3001';
  const WAHA_API_KEY = process.env.WAHA_API_KEY;

  try {
    const sessionName = req.query.sessionName || 'default';

    // Timeout de 20s pour eviter les blocages
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(
      `${WAHA_URL}/api/sessions/${sessionName}`,
      {
        headers: WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {},
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(200).json({
          status: 'NOT_FOUND',
          connected: false,
          message: 'Session non trouvee'
        });
      }
      throw new Error(`Erreur WAHA: ${response.status}`);
    }

    const data = await response.json();

    // Statuts WAHA possibles: STARTING, SCAN_QR_CODE, WORKING, STOPPED, FAILED
    const isConnected = data.status === 'WORKING';

    return res.status(200).json({
      success: true,
      status: data.status,
      connected: isConnected,
      me: isConnected ? data.me : null, // Infos du compte WhatsApp connecte
      message: isConnected
        ? 'WhatsApp connecte avec succes!'
        : 'En attente de connexion...'
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(200).json({
        status: 'TIMEOUT',
        connected: false,
        message: 'Timeout - Reessayez'
      });
    }

    console.error('WAHA check-status error:', error);
    return res.status(500).json({
      error: 'Erreur verification statut',
      details: error.message
    });
  }
}

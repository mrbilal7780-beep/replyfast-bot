/**
 * WAHA - Recuperer le QR Code
 * Retourne l'image QR code en base64 pour le scan
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3001';
  const WAHA_API_KEY = process.env.WAHA_API_KEY;

  try {
    const sessionName = req.query.sessionName || 'default';

    // Recuperer le QR code avec timeout de 30s
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `${WAHA_URL}/api/sessions/${sessionName}/auth/qr`,
      {
        headers: WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {},
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      // Peut-etre deja connecte ou session pas demarree
      if (response.status === 404) {
        return res.status(404).json({
          error: 'Session non trouvee',
          message: 'Demarrez d\'abord la session'
        });
      }

      if (response.status === 422) {
        // QR pas encore genere ou deja connecte
        return res.status(200).json({
          status: 'waiting',
          message: 'QR code en cours de generation...'
        });
      }

      throw new Error(`Erreur WAHA: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      qr: data.value || data.qr || data,
      format: 'image'
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(408).json({
        error: 'Timeout',
        message: 'Le serveur WAHA met trop de temps a repondre'
      });
    }

    console.error('WAHA get-qr error:', error);
    return res.status(500).json({
      error: 'Erreur recuperation QR',
      details: error.message
    });
  }
}

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
  const headers = WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {};

  try {
    const sessionName = req.query.sessionName || 'default';

    // D'abord verifier le statut de la session
    const statusRes = await fetch(`${WAHA_URL}/api/sessions/${sessionName}`, { headers });

    if (statusRes.ok) {
      const statusData = await statusRes.json();

      // Si connecte, pas besoin de QR
      if (statusData.status === 'WORKING') {
        return res.status(200).json({
          status: 'connected',
          message: 'Deja connecte'
        });
      }

      // Si pas en mode SCAN_QR_CODE, attendre
      if (statusData.status !== 'SCAN_QR_CODE') {
        return res.status(200).json({
          status: 'waiting',
          sessionStatus: statusData.status,
          message: 'Session en cours de demarrage...'
        });
      }
    }

    // Recuperer le QR code
    const response = await fetch(
      `${WAHA_URL}/api/sessions/${sessionName}/auth/qr`,
      { headers }
    );

    // 404 = QR pas encore disponible, continuer d'attendre
    if (response.status === 404) {
      return res.status(200).json({
        status: 'waiting',
        message: 'QR code en cours de generation...'
      });
    }

    if (!response.ok) {
      return res.status(200).json({
        status: 'waiting',
        message: 'Preparation du QR code...'
      });
    }

    const data = await response.json();
    const qrValue = data.value || data.qr || data;

    // Si pas de QR valide, attendre
    if (!qrValue || qrValue === '') {
      return res.status(200).json({
        status: 'waiting',
        message: 'QR code en preparation...'
      });
    }

    return res.status(200).json({
      success: true,
      qr: qrValue,
      format: 'image'
    });

  } catch (error) {
    console.error('WAHA get-qr error:', error);
    // Retourner waiting au lieu d'erreur pour que le frontend continue d'essayer
    return res.status(200).json({
      status: 'waiting',
      message: 'Connexion en cours...'
    });
  }
}

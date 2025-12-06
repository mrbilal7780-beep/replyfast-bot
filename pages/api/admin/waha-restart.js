/**
 * Endpoint admin pour redémarrer/démarrer WAHA
 * Accès : /api/admin/waha-restart
 */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
    const sessionName = 'default';

    console.log('🔄 [ADMIN] Redémarrage forcé de WAHA session:', sessionName);

    // 1. Vérifier l'état actuel
    const statusResponse = await fetch(`${wahaUrl}/api/sessions/${sessionName}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      }
    });

    let currentStatus = 'UNKNOWN';
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      currentStatus = statusData.status;
      console.log('📊 [ADMIN] Status actuel:', currentStatus);
    }

    // 2. Si STOPPED ou n'existe pas, démarrer
    if (currentStatus === 'STOPPED' || !statusResponse.ok) {
      console.log('🚀 [ADMIN] Démarrage de la session...');

      const startResponse = await fetch(`${wahaUrl}/api/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.WAHA_API_KEY || ''
        },
        body: JSON.stringify({
          name: sessionName,
          config: {
            proxy: null,
            noweb: {
              store: {
                enabled: true,
                fullSync: false
              }
            }
          }
        })
      });

      const startData = await startResponse.json();

      if (!startResponse.ok) {
        console.error('❌ [ADMIN] Erreur démarrage:', startData);
        return res.status(500).json({
          success: false,
          error: startData.message || 'Erreur démarrage',
          previousStatus: currentStatus
        });
      }

      console.log('✅ [ADMIN] Session démarrée');

      return res.status(200).json({
        success: true,
        action: 'started',
        previousStatus: currentStatus,
        newStatus: 'STARTING',
        message: 'Session WAHA démarrée avec succès ! Attendez 10-15 secondes puis générez le QR code.',
        data: startData
      });
    }

    // 3. Si déjà WORKING
    if (currentStatus === 'WORKING') {
      return res.status(200).json({
        success: true,
        action: 'already_working',
        status: currentStatus,
        message: 'La session WAHA est déjà active et WhatsApp est connecté !'
      });
    }

    // 4. Si STARTING ou SCAN_QR_CODE
    return res.status(200).json({
      success: true,
      action: 'already_starting',
      status: currentStatus,
      message: `La session est déjà en cours (${currentStatus}). Vous pouvez générer le QR code maintenant.`
    });

  } catch (error) {
    console.error('❌ [ADMIN] Erreur:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

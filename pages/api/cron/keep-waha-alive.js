/**
 * Cron job pour garder WAHA toujours actif
 * À configurer sur cron-job.org : toutes les 5 minutes
 * URL : https://replyfast-bot.onrender.com/api/cron/keep-waha-alive
 * Header : Authorization: Bearer votre_cron_secret
 */
export default async function handler(req, res) {
  // Vérification sécurité
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
    const sessionName = 'default';

    console.log('🔄 [KEEP-ALIVE] Vérification WAHA...');

    // Vérifier l'état de la session
    const statusResponse = await fetch(`${wahaUrl}/api/sessions/${sessionName}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      }
    });

    if (!statusResponse.ok) {
      console.log('⚠️ [KEEP-ALIVE] Session n\'existe pas, création...');

      // Créer la session
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
      console.log('✅ [KEEP-ALIVE] Session créée:', startData.status);

      return res.status(200).json({
        success: true,
        action: 'created',
        status: startData.status
      });
    }

    const statusData = await statusResponse.json();
    console.log('📊 [KEEP-ALIVE] Status:', statusData.status);

    // Si STOPPED, redémarrer
    if (statusData.status === 'STOPPED') {
      console.log('🚀 [KEEP-ALIVE] Session STOPPED, redémarrage...');

      const restartResponse = await fetch(`${wahaUrl}/api/sessions/start`, {
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

      const restartData = await restartResponse.json();
      console.log('✅ [KEEP-ALIVE] Session redémarrée');

      return res.status(200).json({
        success: true,
        action: 'restarted',
        previousStatus: 'STOPPED',
        newStatus: restartData.status
      });
    }

    // Tout va bien
    return res.status(200).json({
      success: true,
      action: 'healthy',
      status: statusData.status
    });

  } catch (error) {
    console.error('❌ [KEEP-ALIVE] Erreur:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

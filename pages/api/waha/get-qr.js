// Fonction helper pour attendre
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionName } = req.query;

    if (!sessionName) {
      return res.status(400).json({ error: 'sessionName requis' });
    }

    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
    const maxRetries = 8; // 8 tentatives
    const retryDelay = 3000; // 3 secondes entre chaque tentative = max 24 secondes

    console.log('⏳ [WAHA QR] Attente démarrage session (max 24s)...');

    // Retry loop: essayer jusqu'à ce que la session soit prête ou timeout
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 [WAHA QR] Tentative ${attempt}/${maxRetries}...`);

      await sleep(retryDelay);

      const response = await fetch(`${wahaUrl}/api/${sessionName}/auth/qr`, {
        method: 'GET',
        headers: {
          'X-Api-Key': process.env.WAHA_API_KEY || ''
        }
      });

      console.log('📡 [WAHA QR] Status:', response.status);

      // Vérifier le content-type
      const contentType = response.headers.get('content-type');

      // CAS 1: WAHA renvoie une image PNG directe (nouveau comportement)
      if (contentType && contentType.includes('image/')) {
        if (response.ok) {
          console.log('✅ [WAHA QR] Image PNG reçue, conversion en base64...');
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

          console.log('✅ [WAHA QR] QR récupéré après', attempt, 'tentative(s)');
          return res.status(200).json({
            success: true,
            image: base64Image
          });
        }
      }

      // CAS 2: WAHA renvoie du JSON avec {image: "base64..."} (ancien comportement)
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        // Si succès avec image en JSON
        if (response.ok && data.image) {
          console.log('✅ [WAHA QR] QR récupéré après', attempt, 'tentative(s)');
          return res.status(200).json({
            success: true,
            qr: data.qr,
            image: data.image
          });
        }

        // Si erreur JSON, vérifier le statut de la session
        if (!response.ok) {
          // Si erreur mais session toujours STARTING, continuer à retry
          if (data.status === 'STARTING' && attempt < maxRetries) {
            console.log('⏳ [WAHA QR] Session encore en STARTING, nouvelle tentative...');
            continue;
          }

          // Si STOPPED, arrêter et demander de recliquer
          if (data.status === 'STOPPED') {
            return res.status(202).json({
              success: false,
              waiting: true,
              message: 'La session WhatsApp est arrêtée. Cliquez à nouveau sur "Générer le QR Code" pour la redémarrer.',
              status: 'STOPPED'
            });
          }

          // Si dernière tentative et toujours STARTING
          if (attempt === maxRetries && data.status === 'STARTING') {
            return res.status(202).json({
              success: false,
              waiting: true,
              message: 'La session WhatsApp prend plus de temps que prévu. Veuillez cliquer à nouveau dans 10 secondes.',
              status: 'STARTING'
            });
          }

          // Autre erreur
          console.error('❌ [WAHA QR] Erreur:', data);
          throw new Error(data.error || data.message || 'Erreur récupération QR');
        }
      }

      // CAS 3: Autre type de réponse - retry si pas dernière tentative
      if (attempt < maxRetries) {
        console.log('⏳ [WAHA QR] Réponse inattendue, nouvelle tentative...');
        continue;
      }

      // Si on arrive ici à la dernière tentative, échec
      throw new Error('Impossible de récupérer le QR code après toutes les tentatives');
    }

    // Si on arrive ici, toutes les tentatives ont échoué
    return res.status(408).json({
      error: 'Timeout: La session WAHA n\'a pas démarré dans les temps. Veuillez réessayer.'
    });

  } catch (error) {
    console.error('❌ [WAHA QR] Erreur complète:', error);
    return res.status(500).json({ error: error.message });
  }
}

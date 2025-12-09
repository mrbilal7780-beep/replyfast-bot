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

    // ⚡ Timeout 30s pour QR code (WAHA peut être lent)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${wahaUrl}/api/${sessionName}/auth/qr`, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    console.log('📡 [WAHA QR] Status:', response.status);

    // Vérifier le content-type
    const contentType = response.headers.get('content-type');

    // CAS 1: WAHA renvoie une image PNG directe
    if (contentType && contentType.includes('image/')) {
      if (response.ok) {
        console.log('✅ [WAHA QR] Image PNG reçue, conversion en base64...');
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

        return res.status(200).json({
          success: true,
          image: base64Image
        });
      }
    }

    // CAS 2: WAHA renvoie du JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (response.ok && data.image) {
        console.log('✅ [WAHA QR] QR récupéré');
        return res.status(200).json({
          success: true,
          qr: data.qr,
          image: data.image
        });
      }

      // Erreur JSON
      if (!response.ok) {
        if (data.status === 'STARTING') {
          return res.status(202).json({
            success: false,
            waiting: true,
            message: 'Session en démarrage, veuillez patienter...',
            status: 'STARTING'
          });
        }

        throw new Error(data.error || data.message || 'Erreur récupération QR');
      }
    }

    throw new Error('Format de réponse inattendu');

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ [WAHA QR] Timeout 30s dépassé');
      return res.status(408).json({
        error: 'Timeout: WAHA met trop de temps à répondre. Réessayez dans 10 secondes.'
      });
    }

    console.error('❌ [WAHA QR] Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}

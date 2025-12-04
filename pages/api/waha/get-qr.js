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

    console.log('🔗 [WAHA QR] URL:', `${wahaUrl}/api/${sessionName}/auth/qr`);

    const response = await fetch(`${wahaUrl}/api/${sessionName}/auth/qr`, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      }
    });

    console.log('📡 [WAHA QR] Status:', response.status);

    // Vérifier le content-type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ [WAHA QR] Réponse non-JSON:', text.substring(0, 200));
      throw new Error(`WAHA ne répond pas correctement (QR). Status: ${response.status}. Vérifiez que WAHA est accessible à: ${wahaUrl}`);
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [WAHA QR] Erreur:', data);
      throw new Error(data.message || 'Erreur récupération QR');
    }

    console.log('✅ [WAHA QR] QR récupéré');

    return res.status(200).json({
      success: true,
      qr: data.qr,
      image: data.image
    });

  } catch (error) {
    console.error('❌ [WAHA QR] Erreur complète:', error);
    return res.status(500).json({ error: error.message });
  }
}

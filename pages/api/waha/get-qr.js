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

    const response = await fetch(`${wahaUrl}/api/${sessionName}/auth/qr`, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur récupération QR');
    }

    return res.status(200).json({
      success: true,
      qr: data.qr,
      image: data.image
    });

  } catch (error) {
    console.error('Erreur get-qr:', error);
    return res.status(500).json({
      error: error.message
    });
  }
}

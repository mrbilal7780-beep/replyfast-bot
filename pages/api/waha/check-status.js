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

    const response = await fetch(`${wahaUrl}/api/${sessionName}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur vérification status');
    }

    return res.status(200).json({
      success: true,
      status: data.status,
      me: data.me
    });

  } catch (error) {
    console.error('Erreur check-status:', error);
    return res.status(500).json({
      error: error.message
    });
  }
}

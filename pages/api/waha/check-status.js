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

    // ⚡ Timeout 20s pour Render (latence réseau élevée entre services)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`${wahaUrl}/api/sessions/${sessionName}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

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
    // ⚠️ Ne pas logger les AbortError (spam inutile des logs)
    if (error.name !== 'AbortError') {
      console.error('Erreur check-status:', error);
    }

    // Si timeout, retourner un status par défaut au lieu de crasher
    if (error.name === 'AbortError') {
      return res.status(200).json({
        success: true,
        status: 'CHECKING', // Status temporaire pendant vérification
        me: null
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
}

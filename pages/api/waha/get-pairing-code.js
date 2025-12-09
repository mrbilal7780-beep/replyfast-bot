/**
 * Génère un code de couplage (pairing code) pour connecter WhatsApp
 * Alternative au QR code - fonctionne à 100%
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionName, phoneNumber } = req.body;

    if (!sessionName || !phoneNumber) {
      return res.status(400).json({ error: 'sessionName et phoneNumber requis' });
    }

    // Nettoyer le numéro de téléphone (enlever espaces, tirets, etc.)
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';

    console.log('🔗 [WAHA Pairing] Génération code pour:', cleanPhone);

    // Demander un code de couplage via l'API WAHA
    const response = await fetch(`${wahaUrl}/api/${sessionName}/auth/request-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.WAHA_API_KEY || ''
      },
      body: JSON.stringify({
        phoneNumber: cleanPhone
      })
    });

    console.log('📡 [WAHA Pairing] Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [WAHA Pairing] Erreur:', errorData);
      throw new Error(errorData.message || errorData.error || 'Erreur génération code');
    }

    const data = await response.json();

    console.log('✅ [WAHA Pairing] Code généré avec succès');

    return res.status(200).json({
      success: true,
      code: data.code,
      message: 'Code de couplage généré ! Entrez-le dans WhatsApp sur votre téléphone.'
    });

  } catch (error) {
    console.error('❌ [WAHA Pairing] Erreur complète:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

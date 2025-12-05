import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // WAHA gratuit ne supporte que la session "default"
    const sessionName = 'default';

    console.log('🔗 [WAHA] Démarrage session:', sessionName);

    // Démarrer la session WAHA
    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';

    console.log('🔗 [WAHA] Tentative connexion:', wahaUrl);

    const response = await fetch(`${wahaUrl}/api/sessions/start`, {
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

    console.log('📡 [WAHA] Status:', response.status, response.statusText);

    // Vérifier le content-type avant de parser
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ [WAHA] Réponse non-JSON:', text.substring(0, 200));
      throw new Error(`WAHA ne répond pas correctement. Status: ${response.status}. URL: ${wahaUrl}/api/sessions/start`);
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [WAHA] Erreur:', data);
      throw new Error(data.message || `Erreur WAHA: ${response.status}`);
    }

    console.log('✅ [WAHA] Session créée:', sessionName);

    // Sauvegarder le session name dans Supabase
    await supabase
      .from('clients')
      .update({ waha_session_name: sessionName })
      .eq('email', email);

    return res.status(200).json({
      success: true,
      sessionName,
      data
    });

  } catch (error) {
    console.error('Erreur start-session:', error);
    return res.status(500).json({
      error: error.message
    });
  }
}

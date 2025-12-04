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

    // Générer un nom de session unique basé sur l'email
    const sessionName = `session_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    // Démarrer la session WAHA
    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur WAHA');
    }

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

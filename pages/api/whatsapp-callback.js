import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    // Échanger le code contre un access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent('https://replyfast-bot.onrender.com/api/whatsapp-callback')}`,
      { method: 'GET' }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token error:', tokenData.error);
      return res.redirect('/dashboard?error=connection_failed');
    }

    // Récupérer les infos du compte WhatsApp
    const accountResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${tokenData.access_token}`
    );
    const accountData = await accountResponse.json();

    // TODO: Sauvegarder dans Supabase
    console.log('WhatsApp connected:', accountData);

    // Rediriger vers le dashboard avec succès
    return res.redirect('/dashboard?whatsapp=connected');

  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect('/dashboard?error=unknown');
  }
}
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 🔔 CRON JOB: Vérifier les essais qui expirent bientôt
 *
 * À exécuter quotidiennement (ex: via Vercel Cron ou cron-job.org)
 *
 * Envoie des emails d'alerte:
 * - 7 jours avant expiration
 * - 3 jours avant expiration
 * - 1 jour avant expiration
 */
export default async function handler(req, res) {
  // Sécurité: Vérifier le cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    console.log('🔍 [TRIAL CHECK] Recherche des essais expirant bientôt...');

    // Récupérer tous les clients en période d'essai
    const { data: clients, error } = await supabase
      .from('clients')
      .select('email, first_name, last_name, trial_ends_at, trial_notification_sent_at')
      .eq('subscription_status', 'trialing')
      .not('trial_ends_at', 'is', null);

    if (error) throw error;

    console.log(`📊 [TRIAL CHECK] ${clients.length} clients en essai trouvés`);

    let emailsSent = 0;

    for (const client of clients) {
      const trialEndDate = new Date(client.trial_ends_at);
      const daysLeft = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));

      // Vérifier si on doit envoyer une notification
      let shouldSend = false;
      let notificationType = '';

      if (daysLeft === 7 && !client.trial_notification_sent_at) {
        shouldSend = true;
        notificationType = '7_days';
      } else if (daysLeft === 3 && client.trial_notification_sent_at !== '3_days') {
        shouldSend = true;
        notificationType = '3_days';
      } else if (daysLeft === 1 && client.trial_notification_sent_at !== '1_day') {
        shouldSend = true;
        notificationType = '1_day';
      }

      if (shouldSend) {
        console.log(`📧 [TRIAL CHECK] Envoi email à ${client.email} (${daysLeft} jours restants)`);

        // Envoyer l'email d'alerte
        await sendTrialExpiryEmail(client, daysLeft);

        // Mettre à jour la base de données
        await supabase
          .from('clients')
          .update({
            trial_notification_sent_at: notificationType
          })
          .eq('email', client.email);

        emailsSent++;
      }
    }

    console.log(`✅ [TRIAL CHECK] ${emailsSent} emails envoyés`);

    return res.status(200).json({
      success: true,
      clientsChecked: clients.length,
      emailsSent
    });

  } catch (error) {
    console.error('❌ [TRIAL CHECK] Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Envoyer un email d'alerte d'expiration d'essai
 */
async function sendTrialExpiryEmail(client, daysLeft) {
  const firstName = client.first_name || 'Cher client';

  const subject = daysLeft === 1
    ? '⏰ Dernier jour d\'essai gratuit - ReplyFast AI'
    : `🔔 Plus que ${daysLeft} jours d'essai gratuit - ReplyFast AI`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Votre essai gratuit expire bientôt</h1>
        </div>

        <div class="content">
          <p>Bonjour ${firstName},</p>

          <div class="alert-box">
            <strong>⚠️ Attention :</strong> Votre période d'essai gratuit se termine dans <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong>.
          </div>

          <p>Pour continuer à profiter de <strong>ReplyFast AI</strong> et garder votre assistant IA opérationnel 24/7, n'oubliez pas d'ajouter votre moyen de paiement.</p>

          <h3>✨ Ce que vous allez perdre :</h3>
          <ul>
            <li>🤖 Réponses automatiques IA 24/7</li>
            <li>📅 Gestion automatique des rendez-vous</li>
            <li>📊 Analytics et Market Insights</li>
            <li>💬 Toutes vos conversations et données clients</li>
            <li>🎯 Menu Manager intelligent</li>
          </ul>

          <p><strong>Prix après l'essai :</strong> Seulement 19,99€/mois (0,66€/jour) pour garder votre business ouvert 24/7.</p>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=payment" class="cta-button">
              💳 Ajouter mon moyen de paiement
            </a>
          </div>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Rappel :</strong> Vous pouvez annuler à tout moment en un clic depuis vos paramètres.
            Aucun engagement, aucune clause cachée.
          </p>
        </div>

        <div class="footer">
          <p>ReplyFast AI - Intelligence Artificielle pour votre business</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #10b981;">Gérer mon abonnement</a> •
            <a href="mailto:support@replyfast.ai" style="color: #10b981;">Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Utiliser l'API d'envoi d'emails (ex: Resend, SendGrid, etc.)
  // Pour l'instant, on log juste
  console.log(`📧 Email préparé pour ${client.email}:`, { subject });

  // TODO: Intégrer avec Resend ou SendGrid
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     from: 'ReplyFast AI <noreply@replyfast.ai>',
  //     to: client.email,
  //     subject,
  //     html
  //   })
  // });
}

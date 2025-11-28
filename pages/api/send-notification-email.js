import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * API pour envoyer des notifications par email
 * Supporte: rendez-vous, nouveaux clients, messages importants
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, recipientEmail, data } = req.body;

    if (!type || !recipientEmail) {
      return res.status(400).json({ error: 'Missing required fields: type, recipientEmail' });
    }

    // Templates d'emails selon le type
    const emailTemplates = {
      appointment_reminder: {
        subject: `Rappel: Rendez-vous ${data.appointmentDate || 'demain'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Rappel de Rendez-vous</h2>
            <p>Bonjour ${data.clientName || 'cher client'},</p>
            <p>Ceci est un rappel pour votre rendez-vous:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Heure:</strong> ${data.appointmentTime || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${data.service || 'N/A'}</p>
            </div>
            <p>Si vous devez annuler ou reporter, contactez-nous au plus vite.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par ReplyFast AI
            </p>
          </div>
        `
      },
      new_client: {
        subject: `Nouveau client: ${data.clientName || 'Inconnu'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Nouveau Client Enregistré</h2>
            <p>Un nouveau client s'est inscrit sur votre plateforme ReplyFast AI.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nom:</strong> ${data.clientName || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${data.clientEmail || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${data.clientPhone || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
            </div>
            <p>Connectez-vous à votre dashboard pour voir plus de détails.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par ReplyFast AI
            </p>
          </div>
        `
      },
      new_message: {
        subject: `Nouveau message de ${data.senderName || 'un client'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Nouveau Message Reçu</h2>
            <p>Vous avez reçu un nouveau message:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>De:</strong> ${data.senderName || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Message:</strong></p>
              <p style="margin: 10px 0; padding: 15px; background: white; border-left: 4px solid #6366f1;">
                ${data.message || 'N/A'}
              </p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">
                ${new Date(data.timestamp || Date.now()).toLocaleString('fr-FR')}
              </p>
            </div>
            <p>Connectez-vous à ReplyFast AI pour répondre.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par ReplyFast AI
            </p>
          </div>
        `
      },
      appointment_confirmed: {
        subject: `Rendez-vous confirmé - ${data.appointmentDate || ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Rendez-vous Confirmé</h2>
            <p>Bonjour ${data.clientName || 'cher client'},</p>
            <p>Votre rendez-vous a été confirmé avec succès!</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Heure:</strong> ${data.appointmentTime || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${data.service || 'N/A'}</p>
              ${data.address ? `<p style="margin: 5px 0;"><strong>Adresse:</strong> ${data.address}</p>` : ''}
            </div>
            <p>Nous avons hâte de vous accueillir!</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par ReplyFast AI
            </p>
          </div>
        `
      },
      appointment_cancelled: {
        subject: `Rendez-vous annulé`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">❌ Rendez-vous Annulé</h2>
            <p>Bonjour ${data.clientName || 'cher client'},</p>
            <p>Votre rendez-vous a été annulé:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Heure:</strong> ${data.appointmentTime || 'N/A'}</p>
              ${data.reason ? `<p style="margin: 5px 0;"><strong>Raison:</strong> ${data.reason}</p>` : ''}
            </div>
            <p>N'hésitez pas à reprendre rendez-vous quand vous le souhaitez.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par ReplyFast AI
            </p>
          </div>
        `
      }
    };

    const template = emailTemplates[type];
    if (!template) {
      return res.status(400).json({ error: `Unknown notification type: ${type}` });
    }

    // Pour l'instant, on simule l'envoi d'email
    // Dans une vraie app, utilisez un service comme SendGrid, Mailgun, AWS SES, etc.
    console.log('📧 Notification email (SIMULATED):', {
      to: recipientEmail,
      subject: template.subject,
      type: type
    });

    // Sauvegarder la notification dans la DB
    const { error: dbError } = await supabase
      .from('notifications')
      .insert([{
        recipient_email: recipientEmail,
        type: type,
        subject: template.subject,
        content: template.html,
        status: 'sent', // ou 'pending' si envoi réel
        sent_at: new Date().toISOString(),
        metadata: data
      }]);

    if (dbError) {
      console.error('Error saving notification to DB:', dbError);
      // On ne bloque pas si la sauvegarde DB échoue
    }

    // TODO: Intégrer un vrai service d'email
    // Exemple avec SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: recipientEmail,
      from: 'no-reply@replyfast.ai',
      subject: template.subject,
      html: template.html
    });
    */

    res.status(200).json({
      success: true,
      message: 'Email notification sent successfully (simulated)',
      type: type
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: error.message });
  }
}

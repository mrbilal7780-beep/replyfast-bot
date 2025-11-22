import twilio from 'twilio';
import getRawBody from 'raw-body';

export const config = {
  runtime: 'nodejs',
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  // 1. Vérifier méthode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. Parser le body de Twilio
    const rawBody = await getRawBody(req);
    const params = new URLSearchParams(rawBody.toString('utf8'));
    
    const incomingMessage = params.get('Body');
    const fromNumber = params.get('From');
    const toNumber = params.get('To');

    console.log('📱 Message reçu de:', fromNumber);
    console.log('💬 Contenu:', incomingMessage);

    // 4. Appeler OpenAI
    console.log('🤖 Appel OpenAI...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant automatique ReplyFast. Réponds en français, de manière professionnelle et concise.'
          },
          {
            role: 'user',
            content: incomingMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('❌ Erreur OpenAI:', error);
      throw new Error(`OpenAI error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const botReply = data.choices[0].message.content;
    
    console.log('✅ Réponse OpenAI:', botReply);

    // 5. Envoyer via Twilio
    console.log('📤 Envoi via Twilio...');
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      to: fromNumber,
      body: botReply
    });

    console.log('✅ Message envoyé!');
    
    return res.status(200).send('OK');

  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}
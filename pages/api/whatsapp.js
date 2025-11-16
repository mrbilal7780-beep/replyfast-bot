import twilio from 'twilio';
import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParser: false,
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

    // 4. Appeler OpenAI (CLÉS EN DUR POUR TEST)
    console.log('🤖 Appel OpenAI...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
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

    // 5. Envoyer via Twilio (CLÉS EN DUR POUR TEST)
    console.log('📤 Envoi via Twilio...');
    const twilioClient = twilio(
      'NY8RPEU7EBQ1RYLZJKEDFFX2',
      '6229e211b11ea1fcfdf48c467ea11515'
    );

    await twilioClient.messages.create({
      from: 'whatsapp:+14155238886',
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
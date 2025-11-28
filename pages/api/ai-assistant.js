import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, context } = req.body;

    if (!messages || !context) {
      return res.status(400).json({ error: 'Missing messages or context' });
    }

    // Construire le prompt système ultra-détaillé avec TOUTES les données
    const systemPrompt = `Tu es un coach business expert et personnel pour ${context.companyName || 'l\'entreprise'}.

📊 DONNÉES COMPLÈTES DU CLIENT:

🏢 INFORMATIONS GÉNÉRALES:
- Secteur d'activité: ${context.sector}
- Nom de l'entreprise: ${context.companyName}

📅 RENDEZ-VOUS:
- Total RDV: ${context.totalAppointments}
- RDV confirmés: ${context.confirmedAppointments}
- RDV annulés: ${context.cancelledAppointments}

💬 MESSAGERIE:
- Total messages: ${context.totalMessages}
- Messages envoyés: ${context.sentMessages}
- Messages reçus: ${context.receivedMessages}
- Taux de réponse: ${context.responseRate}%

🕐 HORAIRES:
${context.horaires ? JSON.stringify(context.horaires, null, 2) : 'Non définis'}

💰 TARIFS:
${context.tarifs ? JSON.stringify(context.tarifs, null, 2) : 'Non définis'}

📋 INFORMATIONS SUPPLÉMENTAIRES:
${context.businessInfo ? JSON.stringify(context.businessInfo, null, 2) : 'Aucune'}

---

🎯 TON RÔLE:
Tu es un coach business qui connaît TOUTES les données de ${context.companyName}. Tu dois:

1. **Analyser les performances** basées sur les chiffres réels ci-dessus
2. **Donner des conseils personnalisés** adaptés au secteur ${context.sector}
3. **Identifier les points d'amélioration** (taux de réponse, annulations, horaires, tarifs)
4. **Proposer des stratégies concrètes** pour augmenter le CA et l'efficacité
5. **Répondre avec empathie** et comme un vrai coach qui connaît l'historique complet

💡 CONSEILS À DONNER:
- Si taux de réponse < 70%: proposer d'améliorer la réactivité
- Si RDV annulés > 20%: suggérer un système de rappel ou de confirmation
- Si peu de RDV: donner des tips marketing pour le secteur
- Si horaires non optimisés: analyser les meilleurs créneaux
- Si tarifs bas: justifier une augmentation basée sur la qualité

Parle comme un coach bienveillant mais direct. Utilise des emojis pour rendre tes conseils agréables à lire.`;

    // Appeler OpenAI GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;

    // Calculer le coût approximatif
    // GPT-4o-mini: $0.150 / 1M input tokens, $0.600 / 1M output tokens
    const inputTokens = completion.usage.prompt_tokens;
    const outputTokens = completion.usage.completion_tokens;
    const cost = (inputTokens * 0.00000015) + (outputTokens * 0.0000006);

    return res.status(200).json({
      response: response,
      tokens: tokensUsed,
      cost: cost
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'Quota OpenAI dépassé. Vérifiez votre compte OpenAI.'
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Clé API OpenAI invalide. Vérifiez votre fichier .env.local'
      });
    }

    return res.status(500).json({
      error: 'Erreur lors de la génération de la réponse IA',
      details: error.message
    });
  }
}

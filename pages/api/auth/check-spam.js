import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 🛡️ ANTI-SPAM: Vérifier si un email/IP peut créer un nouvel essai
 *
 * Règles:
 * 1. Un email ne peut avoir qu'un seul compte d'essai
 * 2. Une IP ne peut créer que 3 comptes d'essai max
 * 3. Un domaine email ne peut créer que 10 comptes d'essai max (pour éviter spam gmail/outlook)
 *
 * Usage: Appeler depuis signup.js avant de créer le compte
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, ip } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    console.log('🛡️ [ANTI-SPAM] Vérification pour:', email, 'IP:', ip);

    // 1️⃣ Vérifier si l'email existe déjà
    const { data: existingEmail, error: emailError } = await supabase
      .from('clients')
      .select('email, subscription_status, created_at')
      .eq('email', email)
      .maybeSingle();

    if (emailError && emailError.code !== 'PGRST116') {
      throw emailError;
    }

    if (existingEmail) {
      console.log('❌ [ANTI-SPAM] Email déjà utilisé:', email);
      return res.status(403).json({
        error: 'Cet email a déjà été utilisé',
        reason: 'email_exists'
      });
    }

    // 2️⃣ Vérifier le nombre de comptes créés depuis cette IP (si fournie)
    if (ip) {
      const { data: ipAccounts, error: ipError } = await supabase
        .from('clients')
        .select('email, created_at')
        .eq('signup_ip', ip);

      if (ipError) {
        console.warn('⚠️ [ANTI-SPAM] Erreur vérification IP:', ipError);
        // Ne pas bloquer si erreur DB, juste logger
      } else if (ipAccounts && ipAccounts.length >= 3) {
        console.log('❌ [ANTI-SPAM] Trop de comptes depuis cette IP:', ip, '(', ipAccounts.length, 'comptes)');
        return res.status(403).json({
          error: 'Trop de comptes créés depuis cette adresse. Contactez le support.',
          reason: 'ip_limit_exceeded'
        });
      }
    }

    // 3️⃣ Vérifier le nombre de comptes créés avec ce domaine email
    const emailDomain = email.split('@')[1];

    // Liste des domaines gratuits à surveiller davantage
    const freeEmailDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
      'live.com', 'protonmail.com', 'icloud.com', 'aol.com'
    ];

    const maxAccountsPerDomain = freeEmailDomains.includes(emailDomain) ? 5 : 20;

    const { data: domainAccounts, error: domainError } = await supabase
      .from('clients')
      .select('email, created_at')
      .like('email', `%@${emailDomain}`);

    if (domainError) {
      console.warn('⚠️ [ANTI-SPAM] Erreur vérification domaine:', domainError);
    } else if (domainAccounts && domainAccounts.length >= maxAccountsPerDomain) {
      console.log('❌ [ANTI-SPAM] Trop de comptes depuis ce domaine:', emailDomain, '(', domainAccounts.length, 'comptes)');
      return res.status(403).json({
        error: 'Limite de comptes atteinte pour ce domaine email. Contactez le support.',
        reason: 'domain_limit_exceeded'
      });
    }

    // 4️⃣ Vérifier la fréquence de création de comptes (rate limiting)
    // Bloquer si plus de 5 comptes créés dans la dernière heure globalement depuis cette IP
    if (ip) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: recentAccounts, error: recentError } = await supabase
        .from('clients')
        .select('email, created_at')
        .eq('signup_ip', ip)
        .gte('created_at', oneHourAgo);

      if (recentError) {
        console.warn('⚠️ [ANTI-SPAM] Erreur vérification fréquence:', recentError);
      } else if (recentAccounts && recentAccounts.length >= 5) {
        console.log('❌ [ANTI-SPAM] Trop de comptes créés récemment depuis cette IP:', ip);
        return res.status(429).json({
          error: 'Trop de tentatives de création de compte. Veuillez réessayer plus tard.',
          reason: 'rate_limit_exceeded'
        });
      }
    }

    // ✅ Tout est OK, autoriser la création
    console.log('✅ [ANTI-SPAM] Vérifications passées pour:', email);

    return res.status(200).json({
      allowed: true,
      message: 'Compte autorisé'
    });

  } catch (error) {
    console.error('❌ [ANTI-SPAM] Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}

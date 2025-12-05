import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔑 Bypass RLS
);

/**
 * 🔐 Complete signup: Créer/mettre à jour le client avec service_role pour bypass RLS
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, userToken } = req.body;

    if (!email || !firstName || !lastName || !userToken) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    console.log('🔐 [COMPLETE-SIGNUP] Création client pour:', email);

    // Vérifier que le token est valide (sécurité)
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);

    if (authError || !user || user.email !== email) {
      console.error('❌ [COMPLETE-SIGNUP] Token invalide:', authError);
      return res.status(401).json({ error: 'Token invalide' });
    }

    // Créer/mettre à jour le client avec service_role (bypass RLS)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 1 mois d'essai gratuit

    const { data: clientData, error: upsertError } = await supabase
      .from('clients')
      .upsert(
        {
          email: email,
          first_name: firstName,
          last_name: lastName,
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
          profile_completed: false
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false
        }
      )
      .select();

    if (upsertError) {
      console.error('❌ [COMPLETE-SIGNUP] Erreur UPSERT:', upsertError);
      throw upsertError;
    }

    console.log('✅ [COMPLETE-SIGNUP] Client créé:', clientData);

    return res.status(200).json({
      success: true,
      client: clientData
    });

  } catch (error) {
    console.error('❌ [COMPLETE-SIGNUP] Erreur:', error);
    return res.status(500).json({ error: error.message });
  }
}

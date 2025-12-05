-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔄 MIGRATION SQL: Système de gestion d'abonnement et anti-spam
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- À EXÉCUTER DANS SUPABASE SQL EDITOR
--
-- Cette migration ajoute:
-- 1. Colonne pour suivre les notifications d'expiration d'essai
-- 2. Colonne pour tracking IP (anti-spam)
-- 3. Index pour optimiser les requêtes
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1️⃣ Ajouter colonne pour suivre les notifications envoyées
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS trial_notification_sent_at TEXT;

COMMENT ON COLUMN public.clients.trial_notification_sent_at IS 'Type de dernière notification envoyée: 7_days, 3_days, 1_day';

-- 2️⃣ Ajouter colonne pour tracking IP (anti-spam)
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS signup_ip TEXT;

COMMENT ON COLUMN public.clients.signup_ip IS 'Adresse IP utilisée lors de l''inscription (pour anti-spam)';

-- 3️⃣ Créer index pour améliorer les performances des requêtes anti-spam
CREATE INDEX IF NOT EXISTS idx_clients_signup_ip ON public.clients(signup_ip);
CREATE INDEX IF NOT EXISTS idx_clients_email_domain ON public.clients((split_part(email, '@', 2)));
CREATE INDEX IF NOT EXISTS idx_clients_subscription_status ON public.clients(subscription_status);
CREATE INDEX IF NOT EXISTS idx_clients_trial_ends_at ON public.clients(trial_ends_at);

-- 4️⃣ Mettre à jour le trigger pour capturer l'IP lors de l'inscription
-- Note: L'IP sera capturée via l'API, pas par le trigger

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ MIGRATION TERMINÉE
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROCHAINES ÉTAPES:
--
-- 1. Configurer un cron job pour appeler:
--    https://votre-domaine.com/api/cron/check-trial-expiry
--    Fréquence recommandée: Une fois par jour à 9h00
--
--    Options de cron gratuit:
--    - Vercel Cron (vercel.json)
--    - cron-job.org (gratuit)
--    - EasyCron (gratuit)
--
-- 2. Configurer les variables d'environnement:
--    CRON_SECRET=votre_secret_aleatoire_ici
--
-- 3. Configurer un service d'email (optionnel mais recommandé):
--    - Resend: https://resend.com (gratuit jusqu'à 3000 emails/mois)
--    - SendGrid: https://sendgrid.com (gratuit jusqu'à 100 emails/jour)
--
--    Variables à ajouter:
--    RESEND_API_KEY=votre_cle_api_resend
--    NEXT_PUBLIC_APP_URL=https://votre-domaine.com
--
-- 4. Pour tester le système d'alerte email:
--    curl -X POST https://votre-domaine.com/api/cron/check-trial-expiry \
--      -H "Authorization: Bearer VOTRE_CRON_SECRET"
--
-- ═══════════════════════════════════════════════════════════════════════════════

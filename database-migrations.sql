-- ═══════════════════════════════════════════════════════════
-- REPLYFAST AI - MIGRATIONS SQL COMPLÈTES
-- Date: 2025-11-25
-- Description: Nouvelles tables et colonnes pour la refonte complète
-- ═══════════════════════════════════════════════════════════

-- ===============================================================
-- 1. TABLE WAITLIST POUR LES RDV
-- ===============================================================
CREATE TABLE IF NOT EXISTS rdv_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  requested_date DATE NOT NULL,
  requested_time TEXT NOT NULL,
  service TEXT,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_rdv_waitlist_client_email ON rdv_waitlist(client_email);
CREATE INDEX IF NOT EXISTS idx_rdv_waitlist_date ON rdv_waitlist(requested_date);

-- ===============================================================
-- 2. TABLE CLIENTS POTENTIELS
-- ===============================================================
CREATE TABLE IF NOT EXISTS potential_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  last_rdv_date DATE,
  feedback_positive BOOLEAN,
  notes TEXT,
  status TEXT DEFAULT 'potential', -- potential, active, lead
  last_contact TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_potential_clients_email ON potential_clients(client_email);
CREATE INDEX IF NOT EXISTS idx_potential_clients_status ON potential_clients(status);

-- ===============================================================
-- 3. TABLE OFFRES SPÉCIALES
-- ===============================================================
CREATE TABLE IF NOT EXISTS special_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2),
  promo_price DECIMAL(10,2),
  discount_percentage INTEGER,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_special_offers_client ON special_offers(client_email);
CREATE INDEX IF NOT EXISTS idx_special_offers_dates ON special_offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_special_offers_active ON special_offers(active);

-- ===============================================================
-- 4. MODIFICATIONS TABLE CLIENTS
-- ===============================================================
-- Ajouter les nouvelles colonnes si elles n'existent pas
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS waba_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'normal';

-- ===============================================================
-- 5. MODIFICATIONS TABLE CONVERSATIONS
-- ===============================================================
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_avatar_url TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Index pour recherche par nom
CREATE INDEX IF NOT EXISTS idx_conversations_customer_name ON conversations(customer_name);

-- ===============================================================
-- 6. MODIFICATIONS TABLE APPOINTMENTS
-- ===============================================================
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS feedback_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS feedback_response TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS feedback_rating INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Index pour le système de feedback
CREATE INDEX IF NOT EXISTS idx_appointments_feedback ON appointments(feedback_sent, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_completed ON appointments(completed);

-- ===============================================================
-- 7. TABLE ANALYTICS CACHE (pour performances)
-- ===============================================================
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- messages_count, response_rate, revenue, etc.
  metric_value JSONB NOT NULL,
  period_type TEXT NOT NULL, -- day, week, month, year
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_analytics_cache_client ON analytics_cache(client_email);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_type ON analytics_cache(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_period ON analytics_cache(period_start, period_end);

-- ===============================================================
-- 8. TABLE AI ASSISTANT CONVERSATIONS
-- ===============================================================
CREATE TABLE IF NOT EXISTS ai_assistant_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  message_role TEXT NOT NULL, -- user, assistant, system
  message_content TEXT NOT NULL,
  tokens_used INTEGER,
  cost_estimate DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ai_chats_client ON ai_assistant_chats(client_email);
CREATE INDEX IF NOT EXISTS idx_ai_chats_created ON ai_assistant_chats(created_at DESC);

-- ===============================================================
-- 9. TABLE USER PREFERENCES (pour settings)
-- ===============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL UNIQUE,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'fr',
  theme TEXT DEFAULT 'dark',
  font_size TEXT DEFAULT 'normal',
  compact_mode BOOLEAN DEFAULT false,
  auto_backup BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_prefs_email ON user_preferences(client_email);

-- ===============================================================
-- 10. TABLE PAYMENT HISTORY (pour Stripe)
-- ===============================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  stripe_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL, -- succeeded, failed, pending
  description TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_payment_history_client ON payment_history(client_email);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- ===============================================================
-- 11. DÉSACTIVATION RLS (Row Level Security)
-- ===============================================================
-- Pour simplifier l'accès aux données (à sécuriser en production)
ALTER TABLE rdv_waitlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE potential_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history DISABLE ROW LEVEL SECURITY;

-- ===============================================================
-- 12. FONCTIONS UTILITAIRES
-- ===============================================================

-- Fonction pour nettoyer les vieux leads (> 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_leads()
RETURNS void AS $$
BEGIN
  DELETE FROM potential_clients
  WHERE status = 'lead'
  AND last_contact < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour désactiver les offres expirées
CREATE OR REPLACE FUNCTION deactivate_expired_offers()
RETURNS void AS $$
BEGIN
  UPDATE special_offers
  SET active = false
  WHERE end_date < CURRENT_DATE
  AND active = true;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le taux de réponse
CREATE OR REPLACE FUNCTION calculate_response_rate(email TEXT, start_date DATE, end_date DATE)
RETURNS DECIMAL AS $$
DECLARE
  total_messages INTEGER;
  bot_responses INTEGER;
  rate DECIMAL;
BEGIN
  -- Compter les messages reçus
  SELECT COUNT(*) INTO total_messages
  FROM messages
  WHERE client_email = email
  AND direction = 'received'
  AND DATE(created_at) BETWEEN start_date AND end_date;

  -- Compter les réponses envoyées
  SELECT COUNT(*) INTO bot_responses
  FROM messages
  WHERE client_email = email
  AND direction = 'sent'
  AND DATE(created_at) BETWEEN start_date AND end_date;

  -- Calculer le taux
  IF total_messages > 0 THEN
    rate := (bot_responses::DECIMAL / total_messages::DECIMAL) * 100;
  ELSE
    rate := 0;
  END IF;

  RETURN ROUND(rate, 2);
END;
$$ LANGUAGE plpgsql;

-- ===============================================================
-- 13. TRIGGERS
-- ===============================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux tables pertinentes
DROP TRIGGER IF EXISTS update_special_offers_updated_at ON special_offers;
CREATE TRIGGER update_special_offers_updated_at
BEFORE UPDATE ON special_offers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===============================================================
-- 14. VUES UTILES
-- ===============================================================

-- Vue pour les statistiques clients
CREATE OR REPLACE VIEW client_statistics AS
SELECT
  c.email,
  c.company_name,
  c.sector,
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'confirmed' THEN a.id END) as confirmed_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'cancelled' THEN a.id END) as cancelled_appointments,
  COUNT(DISTINCT conv.id) as total_conversations,
  COUNT(DISTINCT m.id) as total_messages
FROM clients c
LEFT JOIN appointments a ON c.email = a.client_email
LEFT JOIN conversations conv ON c.email = conv.client_email
LEFT JOIN messages m ON c.email = m.client_email
GROUP BY c.email, c.company_name, c.sector;

-- ═══════════════════════════════════════════════════════════
-- FIN DES MIGRATIONS
-- ═══════════════════════════════════════════════════════════

-- Pour exécuter ce script dans Supabase:
-- 1. Aller dans SQL Editor
-- 2. Copier-coller tout ce contenu
-- 3. Cliquer sur "Run"
-- 4. Vérifier qu'il n'y a pas d'erreurs

COMMENT ON TABLE rdv_waitlist IS 'Liste d''attente pour les créneaux de RDV complets';
COMMENT ON TABLE potential_clients IS 'Clients potentiels identifiés automatiquement par l''IA';
COMMENT ON TABLE special_offers IS 'Offres spéciales et promotions configurées par le client';
COMMENT ON TABLE analytics_cache IS 'Cache des métriques analytics pour améliorer les performances';
COMMENT ON TABLE ai_assistant_chats IS 'Historique des conversations avec l''assistant IA personnel';
COMMENT ON TABLE user_preferences IS 'Préférences utilisateur (thème, langue, notifications, etc.)';
COMMENT ON TABLE payment_history IS 'Historique des paiements Stripe';

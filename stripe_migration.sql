-- Migration SQL pour ajouter les champs Stripe à la table clients

-- Ajouter les colonnes Stripe à la table clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_canceled_at TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMP;

-- Créer un index sur stripe_customer_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer_id ON clients(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_stripe_subscription_id ON clients(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_clients_subscription_status ON clients(subscription_status);

-- Créer la table payment_history si elle n'existe pas
CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  stripe_customer_id TEXT NOT NULL,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL,
  paid_at TIMESTAMP DEFAULT NOW(),
  invoice_pdf TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Créer un index sur payment_history
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_customer_id ON payment_history(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_paid_at ON payment_history(paid_at DESC);

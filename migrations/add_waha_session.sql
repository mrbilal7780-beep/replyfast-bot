-- Migration: Ajouter support WAHA
-- Date: 2025-01-04
-- Description: Ajoute la colonne waha_session_name pour stocker les sessions WAHA

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS waha_session_name TEXT;

-- Index pour améliorer les recherches
CREATE INDEX IF NOT EXISTS idx_clients_waha_session
ON clients(waha_session_name);

-- Commentaire
COMMENT ON COLUMN clients.waha_session_name IS 'Nom de la session WAHA (WhatsApp HTTP API) pour ce client';

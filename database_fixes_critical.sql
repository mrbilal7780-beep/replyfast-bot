-- ═══════════════════════════════════════════════════════════
-- REPLYFAST AI - CORRECTIFS CRITIQUES BASE DE DONNÉES
-- Date: 2025-12-02
-- Description: Corrections bugs + ajout colonnes manquantes
-- ═══════════════════════════════════════════════════════════

-- ===============================================================
-- 1. AJOUT COLONNE 'phone' DANS TABLE CLIENTS
-- ===============================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT;

-- ===============================================================
-- 2. SUPPRESSION ANCIENNE CONTRAINTE EMAIL (si existe)
-- ===============================================================
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_unique;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_key;

-- ===============================================================
-- 3. AJOUT NOUVELLE CONTRAINTE UNIQUE SUR EMAIL (avec nom explicite)
-- ===============================================================
-- Vérifier qu'il n'y a pas de doublons avant
DO $$
BEGIN
  -- Supprimer les doublons éventuels (garder le plus récent)
  DELETE FROM clients a USING clients b
  WHERE a.id < b.id AND a.email = b.email;
END $$;

-- Ajouter la contrainte
ALTER TABLE clients ADD CONSTRAINT clients_email_unique UNIQUE (email);

-- ===============================================================
-- 4. AJOUT INDEX SUR PHONE
-- ===============================================================
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- ===============================================================
-- 5. SUPABASE STORAGE - DÉSACTIVER RLS SUR BUCKET menu-files
-- ===============================================================
-- Cette commande doit être exécutée dans Supabase Dashboard > Storage
-- OU via SQL Editor:

-- Créer le bucket s'il n'existe pas (via Dashboard de préférence)
-- Nom: menu-files
-- Public: true

-- Désactiver RLS pour ce bucket (TEMPORAIRE pour tests)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- OU ajouter une politique publique pour le bucket menu-files:
/*
-- Politique INSERT (n'importe qui authentifié peut uploader)
CREATE POLICY "Public upload to menu-files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'menu-files');

-- Politique SELECT (lecture publique)
CREATE POLICY "Public access to menu-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-files');

-- Politique DELETE (n'importe qui peut supprimer)
CREATE POLICY "Public delete from menu-files"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'menu-files');
*/

-- ===============================================================
-- 6. AJOUT COLONNE file_url ET file_type DANS TABLE menus
-- ===============================================================
ALTER TABLE menus ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ===============================================================
-- 7. AJOUT COLONNE customer_name_override POUR PERSISTANCE NOM
-- ===============================================================
-- Pour que le nom donné à un client soit le même partout
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_name_override TEXT;

-- Update existing conversations: copier customer_name vers customer_name_override
UPDATE conversations
SET customer_name_override = customer_name
WHERE customer_name IS NOT NULL AND customer_name_override IS NULL;

-- ===============================================================
-- 8. FONCTION POUR SYNCHRONISER customer_name_override
-- ===============================================================
CREATE OR REPLACE FUNCTION sync_customer_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand on met à jour customer_name_override sur une conversation
  -- Mettre à jour toutes les autres conversations avec le même customer_phone
  UPDATE conversations
  SET customer_name_override = NEW.customer_name_override,
      customer_name = NEW.customer_name_override
  WHERE customer_phone = NEW.customer_phone
    AND client_email = NEW.client_email
    AND id != NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur update de customer_name_override
DROP TRIGGER IF EXISTS sync_customer_name_trigger ON conversations;
CREATE TRIGGER sync_customer_name_trigger
AFTER UPDATE OF customer_name_override ON conversations
FOR EACH ROW
WHEN (NEW.customer_name_override IS DISTINCT FROM OLD.customer_name_override)
EXECUTE FUNCTION sync_customer_name();

-- ===============================================================
-- 9. VÉRIFICATION DONNÉES EXISTANTES
-- ===============================================================
-- Compter les clients sans secteur
SELECT COUNT(*) as clients_sans_secteur FROM clients WHERE sector IS NULL;

-- Compter les conversations sans nom override
SELECT COUNT(*) as convs_sans_nom_override FROM conversations WHERE customer_name_override IS NULL;

-- ═══════════════════════════════════════════════════════════
-- FIN DES CORRECTIFS
-- ═══════════════════════════════════════════════════════════

-- INSTRUCTIONS D'EXÉCUTION:
-- 1. Copier tout ce fichier
-- 2. Aller dans Supabase Dashboard > SQL Editor
-- 3. Coller et exécuter
-- 4. Vérifier qu'il n'y a pas d'erreurs
-- 5. Pour le bucket Storage, aller dans Storage > menu-files > Policies

COMMENT ON COLUMN clients.phone IS 'Numéro de téléphone du propriétaire du compte';
COMMENT ON COLUMN conversations.customer_name_override IS 'Nom personnalisé donné au client (persiste partout)';

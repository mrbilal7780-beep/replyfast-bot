-- ═══════════════════════════════════════════════════════════
-- REPLYFAST AI - MENU FILE UPLOAD MIGRATION
-- Date: 2025-12-02
-- Description: Ajouter support upload PDF/images pour menus
-- ═══════════════════════════════════════════════════════════

-- ===============================================================
-- 1. MODIFICATIONS TABLE MENUS - Ajout colonnes upload
-- ===============================================================
ALTER TABLE menus ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Index pour optimiser les recherches par URL
CREATE INDEX IF NOT EXISTS idx_menus_file_url ON menus(file_url);

-- ===============================================================
-- 2. CRÉATION DU BUCKET STORAGE (via Supabase Dashboard)
-- ===============================================================
-- Ce bucket sera créé automatiquement par le code si nécessaire
-- Sinon, créer manuellement dans Supabase Storage:
-- - Nom: menu-files
-- - Public: true
-- - Limite de fichier: 10MB
-- - Types autorisés: image/png, image/jpeg, image/jpg, application/pdf

-- ===============================================================
-- 3. STORAGE POLICIES (RLS pour Supabase Storage)
-- ===============================================================
-- Politique: Permettre aux utilisateurs authentifiés d'uploader leurs menus
-- Exécuter dans Supabase SQL Editor:
/*
-- Politique INSERT (upload)
CREATE POLICY "Users can upload their own menu files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-files' AND
  (storage.foldername(name))[1] = 'menus'
);

-- Politique SELECT (lecture publique)
CREATE POLICY "Menu files are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-files');

-- Politique DELETE (supprimer ses propres fichiers)
CREATE POLICY "Users can delete their own menu files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-files' AND
  (storage.foldername(name))[1] = 'menus'
);
*/

-- ===============================================================
-- 4. TRIGGER AUTO-UPDATE updated_at
-- ===============================================================
DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
CREATE TRIGGER update_menus_updated_at
BEFORE UPDATE ON menus
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- FIN DE LA MIGRATION
-- ═══════════════════════════════════════════════════════════

-- Pour exécuter ce script dans Supabase:
-- 1. Aller dans SQL Editor
-- 2. Copier-coller tout ce contenu
-- 3. Cliquer sur "Run"
-- 4. Vérifier qu'il n'y a pas d'erreurs

COMMENT ON COLUMN menus.file_url IS 'URL du fichier PDF ou image uploadé (Supabase Storage)';
COMMENT ON COLUMN menus.file_type IS 'Type MIME du fichier (application/pdf, image/png, image/jpeg)';

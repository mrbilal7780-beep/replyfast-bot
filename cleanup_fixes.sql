-- CORRECTION 1 : Nettoyer les doublons dans clients et ajouter contrainte UNIQUE

-- Étape 1 : Supprimer les lignes dupliquées (garder la plus récente)
DELETE FROM clients
WHERE id NOT IN (
  SELECT MAX(id)
  FROM clients
  GROUP BY email
);

-- Étape 2 : Ajouter contrainte UNIQUE sur email
ALTER TABLE clients ADD CONSTRAINT clients_email_unique UNIQUE (email);

-- Étape 3 : Créer index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_sector ON clients(sector);

-- CORRECTION 2 : Fix RLS pour les photos de profil
-- Permettre aux utilisateurs authentifiés d'uploader dans le bucket avatars

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- Créer les nouvelles policies
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update their avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

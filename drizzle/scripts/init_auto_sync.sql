-- Script pour initialiser la synchronisation automatique pour les projets existants
-- des utilisateurs Pro et Entreprise

-- Insérer une configuration auto-sync pour chaque projet dont le propriétaire a un plan Pro ou Entreprise
INSERT INTO auto_sync_config (project_id, enabled, sync_interval_minutes)
SELECT 
  p.id as project_id,
  true as enabled,
  30 as sync_interval_minutes
FROM projects p
INNER JOIN users u ON p.owner_user_id = u.id
WHERE u.plan IN ('pro', 'enterprise')
  AND NOT EXISTS (
    SELECT 1 FROM auto_sync_config asc WHERE asc.project_id = p.id
  );

-- Vérifier les configurations créées
SELECT 
  p.name as project_name,
  u.email as owner_email,
  u.plan as plan,
  asc.enabled,
  asc.sync_interval_minutes
FROM auto_sync_config asc
INNER JOIN projects p ON asc.project_id = p.id
INNER JOIN users u ON p.owner_user_id = u.id
ORDER BY p.name;

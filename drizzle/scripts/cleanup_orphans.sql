-- Script pour nettoyer les données orphelines dans la base de données
-- À exécuter via Drizzle Studio ou directement en SQL

-- 1. Supprimer les entrées orphelines (entries sans projet)
DELETE FROM entries 
WHERE project_id NOT IN (SELECT id FROM projects);

-- 2. Supprimer les installations GitHub orphelines
DELETE FROM github_installations 
WHERE project_id NOT IN (SELECT id FROM projects);

-- 3. Supprimer les configurations auto-sync orphelines
DELETE FROM auto_sync_config 
WHERE project_id NOT IN (SELECT id FROM projects);

-- 4. Supprimer les membres d'équipe orphelins
DELETE FROM team_members 
WHERE project_id NOT IN (SELECT id FROM projects);

-- 5. Vérifier l'état après nettoyage
SELECT 
  'entries' as table_name, 
  COUNT(*) as orphan_count 
FROM entries 
WHERE project_id NOT IN (SELECT id FROM projects)

UNION ALL

SELECT 
  'github_installations' as table_name, 
  COUNT(*) as orphan_count 
FROM github_installations 
WHERE project_id NOT IN (SELECT id FROM projects)

UNION ALL

SELECT 
  'auto_sync_config' as table_name, 
  COUNT(*) as orphan_count 
FROM auto_sync_config 
WHERE project_id NOT IN (SELECT id FROM projects)

UNION ALL

SELECT 
  'team_members' as table_name, 
  COUNT(*) as orphan_count 
FROM team_members 
WHERE project_id NOT IN (SELECT id FROM projects);

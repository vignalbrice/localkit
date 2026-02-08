-- Migration: Ajout des contraintes de clés étrangères avec suppression en cascade

-- Ajouter la contrainte de clé étrangère pour entries.projectId
ALTER TABLE "entries" 
ADD CONSTRAINT "entries_project_id_fkey" 
FOREIGN KEY ("project_id") 
REFERENCES "projects"("id") 
ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour github_installations.projectId
ALTER TABLE "github_installations" 
ADD CONSTRAINT "github_installations_project_id_fkey" 
FOREIGN KEY ("project_id") 
REFERENCES "projects"("id") 
ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour team_members.projectId
ALTER TABLE "team_members" 
ADD CONSTRAINT "team_members_project_id_fkey" 
FOREIGN KEY ("project_id") 
REFERENCES "projects"("id") 
ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour team_members.userId
ALTER TABLE "team_members" 
ADD CONSTRAINT "team_members_user_id_fkey" 
FOREIGN KEY ("user_id") 
REFERENCES "users"("id") 
ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour projects.ownerUserId
ALTER TABLE "projects" 
ADD CONSTRAINT "projects_owner_user_id_fkey" 
FOREIGN KEY ("owner_user_id") 
REFERENCES "users"("id") 
ON DELETE CASCADE;

-- Migration: Add plan support to users table
-- Add plan column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP;

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  project_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT team_members_user_id_project_id_unique UNIQUE (user_id, project_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_project_id_idx ON team_members(project_id);

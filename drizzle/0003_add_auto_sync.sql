-- Add auto-sync configuration table for Pro/Enterprise users
CREATE TABLE IF NOT EXISTS "auto_sync_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sync_interval_minutes" integer DEFAULT 30 NOT NULL,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "auto_sync_config" ADD CONSTRAINT "auto_sync_config_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;

-- Create unique index to ensure one config per project
CREATE UNIQUE INDEX IF NOT EXISTS "auto_sync_config_project_id_unique" ON "auto_sync_config" ("project_id");

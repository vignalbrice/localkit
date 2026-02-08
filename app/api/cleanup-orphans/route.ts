import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { entries, githubInstallations, teamMembers, autoSyncConfig, projects } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { requireUser } from "@/lib/security";

export const runtime = "nodejs";

/**
 * POST /api/cleanup-orphans
 * Nettoie les données orphelines dans la base de données
 * Requiert une authentification admin
 */
export async function POST() {
  try {
    // Vérifier l'authentification
    await requireUser();

    const results = {
      entriesDeleted: 0,
      githubInstallationsDeleted: 0,
      autoSyncConfigDeleted: 0,
      teamMembersDeleted: 0,
    };

    // 1. Supprimer les entrées orphelines
    const deletedEntries = await db.execute(sql`
      DELETE FROM ${entries} 
      WHERE project_id NOT IN (SELECT id FROM ${projects})
    `);
    results.entriesDeleted = deletedEntries.count || 0;

    // 2. Supprimer les installations GitHub orphelines
    const deletedGithub = await db.execute(sql`
      DELETE FROM ${githubInstallations} 
      WHERE project_id NOT IN (SELECT id FROM ${projects})
    `);
    results.githubInstallationsDeleted = deletedGithub.count || 0;

    // 3. Supprimer les configurations auto-sync orphelines
    const deletedAutoSync = await db.execute(sql`
      DELETE FROM ${autoSyncConfig} 
      WHERE project_id NOT IN (SELECT id FROM ${projects})
    `);
    results.autoSyncConfigDeleted = deletedAutoSync.count || 0;

    // 4. Supprimer les membres d'équipe orphelins
    const deletedTeamMembers = await db.execute(sql`
      DELETE FROM ${teamMembers} 
      WHERE project_id NOT IN (SELECT id FROM ${projects})
    `);
    results.teamMembersDeleted = deletedTeamMembers.count || 0;

    return NextResponse.json({
      ok: true,
      message: "Nettoyage terminé avec succès",
      results,
    });
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur lors du nettoyage"
      },
      { status: 500 }
    );
  }
}

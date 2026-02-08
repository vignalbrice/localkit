#!/usr/bin/env tsx
/**
 * Script de nettoyage des données orphelines dans la base de données
 * Exécuter avec: npx tsx scripts/cleanup-database.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "@/lib/db/client";
import { entries, githubInstallations, teamMembers, autoSyncConfig, projects } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function cleanup() {
  console.log("🧹 Nettoyage des données orphelines...\n");

  try {
    // 1. Compter les entrées orphelines
    const orphanEntries = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM ${entries} 
      WHERE project_id NOT IN (SELECT id FROM ${projects})
    `);
    const entriesCount = Number(orphanEntries[0]?.count || 0);
    console.log(`📊 Entrées orphelines trouvées: ${entriesCount}`);

    // 2. Compter les installations GitHub orphelines
    const orphanGithub = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM ${githubInstallations} 
      WHERE project_id NOT IN (SELECT id FROM ${projects})
    `);
    const githubCount = Number(orphanGithub[0]?.count || 0);
    console.log(`📊 Installations GitHub orphelines: ${githubCount}`);

    // 3. Compter les configurations auto-sync orphelines
    const orphanAutoSync = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM ${autoSyncConfig} 
      WHERE project_id NOT IN (SELECT id FROM ${projects})
    `);
    const autoSyncCount = Number(orphanAutoSync[0]?.count || 0);
    console.log(`📊 Configurations auto-sync orphelines: ${autoSyncCount}`);

    // 4. Compter les membres d'équipe orphelins
    const orphanTeamMembers = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM ${teamMembers} 
      WHERE project_id NOT IN (SELECT id FROM ${projects})
    `);
    const teamMembersCount = Number(orphanTeamMembers[0]?.count || 0);
    console.log(`📊 Membres d'équipe orphelins: ${teamMembersCount}\n`);

    const totalOrphans = entriesCount + githubCount + autoSyncCount + teamMembersCount;

    if (totalOrphans === 0) {
      console.log("✅ Aucune donnée orpheline trouvée!");
      return;
    }

    console.log(`⚠️  Total de données orphelines: ${totalOrphans}\n`);
    console.log("🗑️  Suppression des données orphelines...\n");

    // Supprimer les données orphelines
    if (entriesCount > 0) {
      await db.execute(sql`
        DELETE FROM ${entries} 
        WHERE project_id NOT IN (SELECT id FROM ${projects})
      `);
      console.log(`✅ ${entriesCount} entrées orphelines supprimées`);
    }

    if (githubCount > 0) {
      await db.execute(sql`
        DELETE FROM ${githubInstallations} 
        WHERE project_id NOT IN (SELECT id FROM ${projects})
      `);
      console.log(`✅ ${githubCount} installations GitHub orphelines supprimées`);
    }

    if (autoSyncCount > 0) {
      await db.execute(sql`
        DELETE FROM ${autoSyncConfig} 
        WHERE project_id NOT IN (SELECT id FROM ${projects})
      `);
      console.log(`✅ ${autoSyncCount} configurations auto-sync orphelines supprimées`);
    }

    if (teamMembersCount > 0) {
      await db.execute(sql`
        DELETE FROM ${teamMembers} 
        WHERE project_id NOT IN (SELECT id FROM ${projects})
      `);
      console.log(`✅ ${teamMembersCount} membres d'équipe orphelins supprimés`);
    }

    console.log("\n✅ Nettoyage terminé!");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
    process.exit(1);
  }

  process.exit(0);
}

cleanup();

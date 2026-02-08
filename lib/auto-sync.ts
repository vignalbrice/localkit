/**
 * Service de synchronisation automatique pour les plans Pro et Entreprise
 * 
 * Ce service gère la synchronisation automatique des traductions avec GitHub
 * pour les projets dont les propriétaires ont un plan Pro ou Entreprise.
 */

import { db } from "@/lib/db/client";
import { projects, autoSyncConfig, githubInstallations, users } from "@/lib/db/schema";
import { eq, and, lt, isNull, or } from "drizzle-orm";
import { Octokit } from "octokit";

interface SyncResult {
  success: boolean;
  projectId: string;
  projectName: string;
  message: string;
  commitSha?: string;
}

/**
 * Récupère tous les projets éligibles à la synchronisation automatique
 */
export async function getProjectsForAutoSync() {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

  try {
    const eligibleProjects = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        ownerId: projects.ownerUserId,
        ownerPlan: users.plan,
        githubToken: users.id, // On récupérera le token OAuth séparément
        syncConfig: autoSyncConfig,
        githubInstall: githubInstallations,
      })
      .from(projects)
      .innerJoin(users, eq(projects.ownerUserId, users.id))
      .innerJoin(autoSyncConfig, eq(autoSyncConfig.projectId, projects.id))
      .innerJoin(githubInstallations, eq(githubInstallations.projectId, projects.id))
      .where(
        and(
          // Seulement les plans Pro et Entreprise
          or(eq(users.plan, "pro"), eq(users.plan, "enterprise")),
          // Synchronisation activée
          eq(autoSyncConfig.enabled, true),
          // Jamais synchronisé OU dernière sync > intervalle
          or(
            isNull(autoSyncConfig.lastSyncAt),
            lt(autoSyncConfig.lastSyncAt, thirtyMinutesAgo)
          )
        )
      );

    return eligibleProjects;
  } catch (error) {
    console.error("Error fetching projects for auto-sync:", error);
    return [];
  }
}

/**
 * Synchronise un projet avec GitHub
 */
export async function syncProjectToGithub(
  projectId: string,
  githubToken: string,
  installationId: string,
  repoOwner: string,
  repoName: string,
  defaultBranch: string,
  localesPath: string
): Promise<SyncResult> {
  try {
    const octokit = new Octokit({ auth: githubToken });

    // 1. Récupérer toutes les traductions du projet
    const entries = await db.query.entries.findMany({
      where: eq(projects.id, projectId),
    });

    if (entries.length === 0) {
      return {
        success: false,
        projectId,
        projectName: "",
        message: "Aucune traduction à synchroniser",
      };
    }

    // 2. Organiser les traductions par locale et namespace
    const translationsByLocaleAndNamespace: Record<
      string,
      Record<string, Record<string, string>>
    > = {};

    entries.forEach((entry) => {
      if (!translationsByLocaleAndNamespace[entry.locale]) {
        translationsByLocaleAndNamespace[entry.locale] = {};
      }
      if (!translationsByLocaleAndNamespace[entry.locale][entry.namespace]) {
        translationsByLocaleAndNamespace[entry.locale][entry.namespace] = {};
      }
      translationsByLocaleAndNamespace[entry.locale][entry.namespace][entry.dotKey] =
        entry.value;
    });

    // 3. Créer les fichiers JSON
    const files: Array<{ path: string; content: string }> = [];

    Object.entries(translationsByLocaleAndNamespace).forEach(([locale, namespaces]) => {
      Object.entries(namespaces).forEach(([namespace, translations]) => {
        const filePath = `${localesPath}/${locale}/${namespace}.json`;
        const content = JSON.stringify(translations, null, 2);
        files.push({ path: filePath, content });
      });
    });

    // 4. Obtenir le dernier commit de la branche
    const { data: refData } = await octokit.rest.git.getRef({
      owner: repoOwner,
      repo: repoName,
      ref: `heads/${defaultBranch}`,
    });

    const baseCommitSha = refData.object.sha;

    // 5. Créer un tree avec les fichiers
    const tree = await Promise.all(
      files.map(async (file) => {
        const blob = await octokit.rest.git.createBlob({
          owner: repoOwner,
          repo: repoName,
          content: Buffer.from(file.content).toString("base64"),
          encoding: "base64",
        });

        return {
          path: file.path,
          mode: "100644" as const,
          type: "blob" as const,
          sha: blob.data.sha,
        };
      })
    );

    const { data: newTree } = await octokit.rest.git.createTree({
      owner: repoOwner,
      repo: repoName,
      base_tree: baseCommitSha,
      tree,
    });

    // 6. Créer un commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner: repoOwner,
      repo: repoName,
      message: `🤖 Auto-sync translations [LocalKit]`,
      tree: newTree.sha,
      parents: [baseCommitSha],
    });

    // 7. Mettre à jour la référence
    await octokit.rest.git.updateRef({
      owner: repoOwner,
      repo: repoName,
      ref: `heads/${defaultBranch}`,
      sha: newCommit.sha,
    });

    // 8. Mettre à jour la date de dernière sync
    await db
      .update(autoSyncConfig)
      .set({ lastSyncAt: new Date(), updatedAt: new Date() })
      .where(eq(autoSyncConfig.projectId, projectId));

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    return {
      success: true,
      projectId,
      projectName: project?.name || "",
      message: "Synchronisation réussie",
      commitSha: newCommit.sha,
    };
  } catch (error) {
    console.error(`Error syncing project ${projectId}:`, error);
    return {
      success: false,
      projectId,
      projectName: "",
      message: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Fonction principale pour exécuter la synchronisation automatique
 * Cette fonction devrait être appelée par un cron job ou un worker
 */
export async function runAutoSync(): Promise<SyncResult[]> {
  console.log("🔄 Starting auto-sync...");

  const projectsToSync = await getProjectsForAutoSync();
  console.log(`📦 Found ${projectsToSync.length} projects to sync`);

  const results: SyncResult[] = [];

  for (const project of projectsToSync) {
    console.log(`🔄 Syncing project: ${project.projectName}`);

    // Note: Dans une vraie implémentation, il faudrait récupérer le token OAuth
    // de l'utilisateur depuis la session ou une table dédiée
    // Pour l'instant, on skip car on n'a pas le token

    const result = await syncProjectToGithub(
      project.projectId,
      "", // TODO: Récupérer le token GitHub de l'utilisateur
      project.githubInstall!.installationId,
      project.githubInstall!.repoOwner,
      project.githubInstall!.repoName,
      project.githubInstall!.defaultBranch,
      project.githubInstall!.localesPath
    );

    results.push(result);
    console.log(`${result.success ? "✅" : "❌"} ${project.projectName}: ${result.message}`);
  }

  console.log("✨ Auto-sync completed");
  return results;
}

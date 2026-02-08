"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { entries, projects, githubInstallations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Ajouter une locale au projet
export async function addLocale(projectId: string, locale: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.ownerUserId, session.user.id)
      ),
    });

    if (!project) {
      return { error: "Projet non trouvé" };
    }

    // Récupérer toutes les clés existantes pour créer les nouvelles entrées
    const existingEntries = await db.query.entries.findMany({
      where: eq(entries.projectId, projectId),
    });

    // Créer un set des paires namespace:dotKey uniques
    const uniqueKeys = new Set<string>();
    for (const entry of existingEntries) {
      uniqueKeys.add(`${entry.namespace}:${entry.dotKey}`);
    }

    // Créer les nouvelles entrées pour cette locale
    const newEntries = Array.from(uniqueKeys).map((key) => {
      const [namespace, dotKey] = key.split(":");
      return {
        projectId,
        locale,
        namespace,
        dotKey,
        value: "",
      };
    });

    if (newEntries.length > 0) {
      await db.insert(entries).values(newEntries);
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, created: newEntries.length };
  } catch (error) {
    console.error("Error adding locale:", error);
    return { error: "Erreur lors de l'ajout de la langue" };
  }
}

// Ajouter une clé de traduction
export async function addKey(
  projectId: string,
  namespace: string,
  dotKey: string,
  locales: string[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.ownerUserId, session.user.id)
      ),
    });

    if (!project) {
      return { error: "Projet non trouvé" };
    }

    // Créer les entrées pour chaque locale
    const newEntries = locales.map((locale) => ({
      projectId,
      locale,
      namespace,
      dotKey,
      value: "",
    }));

    await db.insert(entries).values(newEntries);

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding key:", error);
    return { error: "Erreur lors de l'ajout de la clé" };
  }
}

// Supprimer une clé de traduction
export async function deleteKey(
  projectId: string,
  namespace: string,
  dotKey: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.ownerUserId, session.user.id)
      ),
    });

    if (!project) {
      return { error: "Projet non trouvé" };
    }

    // Supprimer toutes les entrées pour cette clé
    await db
      .delete(entries)
      .where(
        and(
          eq(entries.projectId, projectId),
          eq(entries.namespace, namespace),
          eq(entries.dotKey, dotKey)
        )
      );

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting key:", error);
    return { error: "Erreur lors de la suppression" };
  }
}

// Mettre à jour une entrée de traduction
export async function updateEntry(
  projectId: string,
  locale: string,
  namespace: string,
  dotKey: string,
  value: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.ownerUserId, session.user.id)
      ),
    });

    if (!project) {
      return { error: "Projet non trouvé" };
    }

    // Mettre à jour l'entrée
    await db
      .update(entries)
      .set({ value })
      .where(
        and(
          eq(entries.projectId, projectId),
          eq(entries.locale, locale),
          eq(entries.namespace, namespace),
          eq(entries.dotKey, dotKey)
        )
      );

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating entry:", error);
    return { error: "Erreur lors de la sauvegarde" };
  }
}

// Connecter GitHub
export async function connectGithub(
  projectId: string,
  repository: string,
  branch: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.ownerUserId, session.user.id)
      ),
    });

    if (!project) {
      return { error: "Projet non trouvé" };
    }

    // Extraire owner et repo name
    const [repoOwner, repoName] = repository.split("/");
    if (!repoOwner || !repoName) {
      return { error: "Format de dépôt invalide" };
    }

    // Créer ou mettre à jour la connexion GitHub
    const existing = await db.query.githubInstallations.findFirst({
      where: eq(githubInstallations.projectId, projectId),
    });

    if (existing) {
      await db
        .update(githubInstallations)
        .set({
          repoOwner,
          repoName,
          defaultBranch: branch,
        })
        .where(eq(githubInstallations.projectId, projectId));
    } else {
      await db.insert(githubInstallations).values({
        projectId,
        installationId: "manual", // Pour une connexion manuelle
        repoOwner,
        repoName,
        defaultBranch: branch,
        localesPath: "locales",
      });
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error connecting GitHub:", error);
    return { error: "Erreur lors de la connexion GitHub" };
  }
}

// Déconnecter GitHub
export async function disconnectGithub(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.ownerUserId, session.user.id)
      ),
    });

    if (!project) {
      return { error: "Projet non trouvé" };
    }

    // Supprimer la connexion GitHub
    await db
      .delete(githubInstallations)
      .where(eq(githubInstallations.projectId, projectId));

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error disconnecting GitHub:", error);
    return { error: "Erreur lors de la déconnexion GitHub" };
  }
}

// Push vers GitHub (appelle l'API route existante)
export async function pushToGithub(
  projectId: string,
  commitMessage: string,
  createPullRequest: boolean
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.ownerUserId, session.user.id)
      ),
    });

    if (!project) {
      return { error: "Projet non trouvé" };
    }

    // L'API route existante gère la logique complexe de push
    // On pourrait la refactoriser en fonction utilitaire, mais pour l'instant
    // on retourne une indication que l'action doit appeler l'API route
    return {
      success: true,
      useApiRoute: true,
      apiPath: `/api/projects/${projectId}/github/push`,
      payload: { commitMessage, createPullRequest }
    };
  } catch (error) {
    console.error("Error pushing to GitHub:", error);
    return { error: "Erreur lors du push GitHub" };
  }
}

// Import/Merge depuis un fichier ZIP
export async function importMerge(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.ownerUserId, session.user.id)
      ),
    });

    if (!project) {
      return { error: "Projet non trouvé" };
    }

    // L'API route existante gère la logique complexe d'import
    // On pourrait la refactoriser en fonction utilitaire
    return {
      success: true,
      useApiRoute: true,
      apiPath: `/api/projects/${projectId}/import-merge`
    };
  } catch (error) {
    console.error("Error importing:", error);
    return { error: "Erreur lors de l'import" };
  }
}

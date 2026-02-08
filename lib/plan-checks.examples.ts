/**
 * EXEMPLE D'UTILISATION DES VÉRIFICATIONS DE PLAN
 * 
 * Ce fichier montre comment utiliser les fonctions de vérification
 * dans vos API routes pour appliquer les limites des plans.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  checkCanCreateProject,
  checkCanAddLanguage,
  checkCanAddKeys,
  verifyProjectAccess,
  getUserUsageStats,
  getProjectUsageStats,
} from "@/lib/plan-checks";

// ============================================
// EXEMPLE 1: Créer un nouveau projet
// ============================================
export async function createProjectExample(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // ✅ Vérifier si l'utilisateur peut créer un projet
    await checkCanCreateProject(userId);

    // Créer le projet
    const body = await request.json();
    // ... logique de création du projet

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 } // Forbidden si limite atteinte
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    );
  }
}

// ============================================
// EXEMPLE 2: Ajouter une langue à un projet
// ============================================
export async function addLanguageExample(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id;
  const { projectId } = params;

  try {
    // ✅ Vérifier l'accès au projet ET les limites de langue
    const { project, plan, limits } = await verifyProjectAccess(
      userId,
      projectId
    );

    // Vérifier spécifiquement pour les langues
    await checkCanAddLanguage(userId, projectId);

    // Ajouter la langue
    const body = await request.json();
    const { locale } = body;
    // ... logique d'ajout de la langue

    return NextResponse.json({ success: true, locale });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de la langue" },
      { status: 500 }
    );
  }
}

// ============================================
// EXEMPLE 3: Importer des clés de traduction
// ============================================
export async function importKeysExample(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id;
  const { projectId } = params;

  try {
    // Vérifier l'accès au projet
    await verifyProjectAccess(userId, projectId);

    // Compter les clés à importer
    const body = await request.json();
    const { keys } = body; // Supposons que c'est un tableau de clés
    const keysToAdd = keys.length;

    // ✅ Vérifier si l'utilisateur peut ajouter ces clés
    await checkCanAddKeys(userId, projectId, keysToAdd);

    // Importer les clés
    // ... logique d'import

    return NextResponse.json({
      success: true,
      imported: keysToAdd,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Erreur lors de l'import" },
      { status: 500 }
    );
  }
}

// ============================================
// EXEMPLE 4: Récupérer les stats d'utilisation
// ============================================
export async function getUserStatsExample() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // ✅ Récupérer les stats globales de l'utilisateur
    const stats = await getUserUsageStats(userId);

    return NextResponse.json({
      plan: stats.plan,
      usage: {
        projects: {
          current: stats.projectCount,
          limit:
            stats.limits.maxProjects === -1
              ? "unlimited"
              : stats.limits.maxProjects,
        },
      },
      features: {
        githubSync: stats.limits.githubSync,
        githubAutoSync: stats.limits.githubAutoSync,
        prioritySupport: stats.limits.prioritySupport,
        apiAccess: stats.limits.apiAccess,
        sla: stats.limits.sla,
        roleManagement: stats.limits.roleManagement,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des stats" },
      { status: 500 }
    );
  }
}

// ============================================
// EXEMPLE 5: Récupérer les stats d'un projet
// ============================================
export async function getProjectStatsExample(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id;
  const { projectId } = params;

  try {
    // Vérifier l'accès au projet
    const { project, plan, limits } = await verifyProjectAccess(
      userId,
      projectId
    );

    // ✅ Récupérer les stats du projet
    const stats = await getProjectUsageStats(projectId);

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
      },
      plan,
      usage: {
        languages: {
          current: stats.languageCount,
          limit: limits.maxLanguages === -1 ? "unlimited" : limits.maxLanguages,
        },
        keys: {
          current: stats.keyCount,
          limit: limits.maxKeys === -1 ? "unlimited" : limits.maxKeys,
        },
        namespaces: stats.namespaceCount,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Erreur lors de la récupération des stats" },
      { status: 500 }
    );
  }
}

// ============================================
// EXEMPLE 6: Middleware pour vérifier les features
// ============================================
export async function requireFeatureExample(
  userId: string,
  feature: keyof ReturnType<typeof import("@/lib/plans").getPlanLimits>
) {
  const { plan, limits } = await getUserUsageStats(userId);

  if (!limits[feature]) {
    throw new Error(
      `Cette fonctionnalité n'est pas disponible dans votre plan ${limits.name}. Passez à un plan supérieur pour y accéder.`
    );
  }
}

// Utilisation dans une route:
export async function githubAutoSyncExample(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    // ✅ Vérifier que l'utilisateur a accès à la sync auto GitHub
    await requireFeatureExample(session.user.id, "githubAutoSync");

    // Créer la sync auto
    // ... logique

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

/**
 * RÉSUMÉ DES BONNES PRATIQUES:
 * 
 * 1. ✅ Toujours vérifier l'authentification en premier
 * 2. ✅ Utiliser checkCan* avant les opérations de création/ajout
 * 3. ✅ Utiliser verifyProjectAccess pour vérifier propriété + plan
 * 4. ✅ Retourner 403 (Forbidden) quand une limite est atteinte
 * 5. ✅ Fournir des messages d'erreur clairs avec le nom du plan
 * 6. ✅ Logger les tentatives de dépassement de limite (pour analytics)
 * 
 * SÉCURITÉ:
 * - Ne jamais se fier uniquement aux vérifications côté client
 * - Toujours valider côté serveur dans les API routes
 * - Protéger toutes les routes qui modifient des données
 */

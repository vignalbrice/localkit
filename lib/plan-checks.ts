/**
 * Server-side plan limit checks
 * These functions should be used in API routes and server actions
 * to enforce plan limits
 */

import { db } from "@/lib/db/client";
import { users, projects, entries } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import type { PlanType } from "./plans";
import { getPlanLimits } from "./plans";

/**
 * Get user's current plan from database
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return (user?.plan as PlanType) || "free";
}

/**
 * Get user's project count
 */
export async function getUserProjectCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(eq(projects.ownerUserId, userId));
  return Number(result[0]?.count || 0);
}

/**
 * Get project's language count
 */
export async function getProjectLanguageCount(
  projectId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(distinct ${entries.locale})` })
    .from(entries)
    .where(eq(entries.projectId, projectId));
  return Number(result[0]?.count || 0);
}

/**
 * Get project's key count (unique dotKey + namespace combinations)
 */
export async function getProjectKeyCount(projectId: string): Promise<number> {
  const result = await db
    .select({
      count: sql<number>`count(distinct concat(${entries.namespace}, '.', ${entries.dotKey}))`,
    })
    .from(entries)
    .where(eq(entries.projectId, projectId));
  return Number(result[0]?.count || 0);
}

/**
 * Check if user can create a new project
 * @throws Error if limit reached
 */
export async function checkCanCreateProject(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.maxProjects === -1) {
    return; // Unlimited
  }

  const currentCount = await getUserProjectCount(userId);
  if (currentCount >= limits.maxProjects) {
    throw new Error(
      `Vous avez atteint la limite de ${limits.maxProjects} projet${limits.maxProjects > 1 ? "s" : ""} de votre plan ${limits.name}. Passez à un plan supérieur pour créer plus de projets.`
    );
  }
}

/**
 * Check if user can add a language to a project
 * @throws Error if limit reached
 */
export async function checkCanAddLanguage(
  userId: string,
  projectId: string
): Promise<void> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.maxLanguages === -1) {
    return; // Unlimited
  }

  const currentCount = await getProjectLanguageCount(projectId);
  if (currentCount >= limits.maxLanguages) {
    throw new Error(
      `Vous avez atteint la limite de ${limits.maxLanguages} langue${limits.maxLanguages > 1 ? "s" : ""} de votre plan ${limits.name}. Passez à un plan supérieur pour ajouter plus de langues.`
    );
  }
}

/**
 * Check if user can add keys to a project
 * @throws Error if limit reached
 */
export async function checkCanAddKeys(
  userId: string,
  projectId: string,
  keysToAdd: number = 1
): Promise<void> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.maxKeys === -1) {
    return; // Unlimited
  }

  const currentCount = await getProjectKeyCount(projectId);
  if (currentCount + keysToAdd > limits.maxKeys) {
    throw new Error(
      `Vous avez atteint la limite de ${limits.maxKeys} clé${limits.maxKeys > 1 ? "s" : ""} de votre plan ${limits.name}. Passez à un plan supérieur pour ajouter plus de clés.`
    );
  }
}

/**
 * Comprehensive check for project ownership and plan limits
 * Use this in API routes that modify projects
 */
export async function verifyProjectAccess(
  userId: string,
  projectId: string
): Promise<{
  project: typeof projects.$inferSelect;
  plan: PlanType;
  limits: ReturnType<typeof getPlanLimits>;
}> {
  // Verify project ownership
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerUserId, userId)),
  });

  if (!project) {
    throw new Error("Projet non trouvé ou accès refusé");
  }

  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  return { project, plan, limits };
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: string): Promise<{
  projectCount: number;
  plan: PlanType;
  limits: ReturnType<typeof getPlanLimits>;
}> {
  const plan = await getUserPlan(userId);
  const projectCount = await getUserProjectCount(userId);
  const limits = getPlanLimits(plan);

  return {
    projectCount,
    plan,
    limits,
  };
}

/**
 * Get usage statistics for a specific project
 */
export async function getProjectUsageStats(
  projectId: string
): Promise<{
  languageCount: number;
  keyCount: number;
  namespaceCount: number;
}> {
  const [languageResult, keyResult, namespaceResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(distinct ${entries.locale})` })
      .from(entries)
      .where(eq(entries.projectId, projectId)),
    db
      .select({
        count: sql<number>`count(distinct concat(${entries.namespace}, '.', ${entries.dotKey}))`,
      })
      .from(entries)
      .where(eq(entries.projectId, projectId)),
    db
      .select({ count: sql<number>`count(distinct ${entries.namespace})` })
      .from(entries)
      .where(eq(entries.projectId, projectId)),
  ]);

  return {
    languageCount: Number(languageResult[0]?.count || 0),
    keyCount: Number(keyResult[0]?.count || 0),
    namespaceCount: Number(namespaceResult[0]?.count || 0),
  };
}

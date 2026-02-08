export type PlanType = "free" | "pro" | "enterprise";

export interface PlanLimits {
  name: string;
  price: number;
  maxProjects: number;
  maxLanguages: number;
  maxKeys: number;
  maxTeamMembers: number;
  githubSync: boolean;
  githubAutoSync: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  sla: boolean;
  roleManagement: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    name: "Gratuit",
    price: 0,
    maxProjects: 1,
    maxLanguages: 5,
    maxKeys: 1000,
    maxTeamMembers: 1,
    githubSync: true,
    githubAutoSync: false,
    prioritySupport: false,
    apiAccess: false,
    sla: false,
    roleManagement: false,
  },
  pro: {
    name: "Pro",
    price: 19,
    maxProjects: -1, // illimité
    maxLanguages: -1, // illimité
    maxKeys: -1, // illimité
    maxTeamMembers: 5,
    githubSync: true,
    githubAutoSync: true,
    prioritySupport: true,
    apiAccess: false,
    sla: false,
    roleManagement: false,
  },
  enterprise: {
    name: "Entreprise",
    price: 99,
    maxProjects: -1, // illimité
    maxLanguages: -1, // illimité
    maxKeys: -1, // illimité
    maxTeamMembers: -1, // illimité
    githubSync: true,
    githubAutoSync: true,
    prioritySupport: true,
    apiAccess: true,
    sla: true,
    roleManagement: true,
  },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function canCreateProject(
  currentProjectCount: number,
  plan: PlanType
): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxProjects === -1) return true;
  return currentProjectCount < limits.maxProjects;
}

export function canAddLanguage(
  currentLanguageCount: number,
  plan: PlanType
): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxLanguages === -1) return true;
  return currentLanguageCount < limits.maxLanguages;
}

export function canAddKeys(currentKeyCount: number, plan: PlanType): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxKeys === -1) return true;
  return currentKeyCount < limits.maxKeys;
}

export function canAddTeamMember(
  currentTeamMemberCount: number,
  plan: PlanType
): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxTeamMembers === -1) return true;
  return currentTeamMemberCount < limits.maxTeamMembers;
}

export interface PlanFeature {
  name: string;
  description: string;
  available: boolean;
}

export function getPlanFeatures(plan: PlanType): PlanFeature[] {
  const limits = getPlanLimits(plan);

  return [
    {
      name: "Projets",
      description:
        limits.maxProjects === -1
          ? "Illimités"
          : `${limits.maxProjects} projet${limits.maxProjects > 1 ? "s" : ""}`,
      available: true,
    },
    {
      name: "Langues",
      description:
        limits.maxLanguages === -1
          ? "Illimitées"
          : `Jusqu'à ${limits.maxLanguages} langues`,
      available: true,
    },
    {
      name: "Clés de traduction",
      description:
        limits.maxKeys === -1 ? "Illimitées" : `${limits.maxKeys} clés`,
      available: true,
    },
    {
      name: "Membres d'équipe",
      description:
        limits.maxTeamMembers === -1
          ? "Illimités"
          : `${limits.maxTeamMembers} membre${limits.maxTeamMembers > 1 ? "s" : ""}`,
      available: true,
    },
    {
      name: "Import/Export ZIP",
      description: "Importez et exportez vos traductions facilement",
      available: true,
    },
    {
      name: "Intégration GitHub",
      description: "Connexion à vos dépôts GitHub",
      available: limits.githubSync,
    },
    {
      name: "Synchronisation GitHub automatique",
      description: "Créez des Pull Requests automatiquement",
      available: limits.githubAutoSync,
    },
    {
      name: "Support prioritaire",
      description: "Réponse rapide à vos questions",
      available: limits.prioritySupport,
    },
    {
      name: "Gestion des rôles",
      description: "Contrôlez les permissions des membres",
      available: limits.roleManagement,
    },
    {
      name: "API dédiée",
      description: "Accès programmatique à vos traductions",
      available: limits.apiAccess,
    },
    {
      name: "SLA garanti 99.9%",
      description: "Disponibilité garantie du service",
      available: limits.sla,
    },
  ];
}

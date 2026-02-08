export type PricingPlan = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxProjects: number | 'unlimited';
  maxLanguages: number | 'unlimited';
  maxKeys: number | 'unlimited';
  teamMembers: number | 'unlimited';
  githubSync: boolean;
  autoGithubSync: boolean;
  prioritySupport: boolean;
  dedicatedApi: boolean;
  roleManagement: boolean;
  sla: boolean;
}

export interface UserSubscription {
  plan: PricingPlan;
  limits: PlanLimits;
}

export const PLAN_LIMITS: Record<PricingPlan, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxLanguages: 5,
    maxKeys: 1000,
    teamMembers: 1,
    githubSync: true,
    autoGithubSync: false,
    prioritySupport: false,
    dedicatedApi: false,
    roleManagement: false,
    sla: false,
  },
  pro: {
    maxProjects: 'unlimited',
    maxLanguages: 'unlimited',
    maxKeys: 'unlimited',
    teamMembers: 5,
    githubSync: true,
    autoGithubSync: true,
    prioritySupport: true,
    dedicatedApi: false,
    roleManagement: false,
    sla: false,
  },
  enterprise: {
    maxProjects: 'unlimited',
    maxLanguages: 'unlimited',
    maxKeys: 'unlimited',
    teamMembers: 'unlimited',
    githubSync: true,
    autoGithubSync: true,
    prioritySupport: true,
    dedicatedApi: true,
    roleManagement: true,
    sla: true,
  },
};
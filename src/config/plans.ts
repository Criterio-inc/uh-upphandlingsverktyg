import type { FeatureKey } from "@/config/features";
import { ALL_FEATURE_KEYS } from "@/config/features";

/* ------------------------------------------------------------------ */
/*  Plan definitions                                                   */
/* ------------------------------------------------------------------ */

export type PlanId = "trial" | "starter" | "professional" | "enterprise";

export interface PlanDef {
  id: PlanId;
  label: string;
  description: string;
  features: FeatureKey[];
  maxUsers: number;
  maxCases: number;         // -1 = unlimited
  maxAssessments: number;   // -1 = unlimited
  /** Duration in days for trial plans, -1 for unlimited */
  durationDays: number;
  customProfiles: boolean;
  apiAccess: boolean;
  sso: boolean;
}

export const PLANS: Record<PlanId, PlanDef> = {
  trial: {
    id: "trial",
    label: "Trial",
    description: "Prova mognadsmätning gratis i 30 dagar",
    features: ["mognadmatning"],
    maxUsers: 1,
    maxCases: 0,
    maxAssessments: 3,
    durationDays: 30,
    customProfiles: false,
    apiAccess: false,
    sso: false,
  },
  starter: {
    id: "starter",
    label: "Starter",
    description: "Mognadsmätning med AI-stöd för mindre organisationer",
    features: ["mognadmatning", "ai-mognadmatning"],
    maxUsers: 5,
    maxCases: 0,
    maxAssessments: -1,
    durationDays: -1,
    customProfiles: false,
    apiAccess: false,
    sso: false,
  },
  professional: {
    id: "professional",
    label: "Professional",
    description: "Komplett plattform med upphandlingsstöd och analysverktyg",
    features: [...ALL_FEATURE_KEYS],
    maxUsers: 20,
    maxCases: -1,
    maxAssessments: -1,
    durationDays: -1,
    customProfiles: false,
    apiAccess: false,
    sso: false,
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    description: "Allt inkluderat med anpassade profiler, API-access och SSO",
    features: [...ALL_FEATURE_KEYS],
    maxUsers: -1,
    maxCases: -1,
    maxAssessments: -1,
    durationDays: -1,
    customProfiles: true,
    apiAccess: true,
    sso: true,
  },
};

export const PLAN_IDS: PlanId[] = ["trial", "starter", "professional", "enterprise"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function getPlan(planId: string): PlanDef {
  return PLANS[planId as PlanId] ?? PLANS.trial;
}

/** Get features included in a plan */
export function getPlanFeatures(planId: string): Set<FeatureKey> {
  const plan = getPlan(planId);
  return new Set(plan.features);
}

/** Check if a feature is available for a given plan */
export function isPlanFeature(planId: string, featureKey: FeatureKey): boolean {
  return getPlanFeatures(planId).has(featureKey);
}

/** Check if org has reached its user limit */
export function isAtUserLimit(plan: PlanDef, currentUsers: number): boolean {
  if (plan.maxUsers === -1) return false;
  return currentUsers >= plan.maxUsers;
}

/** Check if org has reached its case limit */
export function isAtCaseLimit(plan: PlanDef, currentCases: number): boolean {
  if (plan.maxCases === -1) return false;
  return currentCases >= plan.maxCases;
}

import { prisma } from "@/lib/db";
import { ALL_FEATURE_KEYS, type FeatureKey, isEffectivelyEnabled } from "@/config/features";
import { getPlan, type PlanId } from "@/config/plans";

/* ------------------------------------------------------------------ */
/*  Resolve effective features for an organization                     */
/* ------------------------------------------------------------------ */

export interface ResolvedFeatures {
  /** The effective feature set (plan + org overrides) */
  features: Record<FeatureKey, boolean>;
  /** The plan that provides the base features */
  plan: PlanId;
  /** Org-level overrides (if any) */
  overrides: Record<string, boolean>;
}

/**
 * Resolve effective features for an organization.
 *
 * Resolution order:
 *   1. Plan features (base — what the plan includes)
 *   2. OrgFeature overrides (admin can enable/disable per org)
 *   3. Cascade logic (parent app disabled → sub-features disabled)
 */
export async function resolveOrgFeatures(orgId: string): Promise<ResolvedFeatures> {
  // Get org with its plan and feature overrides
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      plan: true,
      features: { select: { featureKey: true, enabled: true } },
    },
  });

  if (!org) {
    // Fallback: all features enabled (dev/migration compat)
    const features = {} as Record<FeatureKey, boolean>;
    for (const key of ALL_FEATURE_KEYS) features[key] = true;
    return { features, plan: "enterprise", overrides: {} };
  }

  const plan = getPlan(org.plan);
  const planFeatureSet = new Set(plan.features);
  const overrides: Record<string, boolean> = {};

  // Build override map
  for (const row of org.features) {
    overrides[row.featureKey] = row.enabled;
  }

  // Merge: plan base + org overrides
  const raw = {} as Record<FeatureKey, boolean>;
  for (const key of ALL_FEATURE_KEYS) {
    if (key in overrides) {
      // Org override takes precedence
      raw[key] = overrides[key];
    } else {
      // Plan default
      raw[key] = planFeatureSet.has(key);
    }
  }

  // Apply cascade logic
  const features = {} as Record<FeatureKey, boolean>;
  for (const key of ALL_FEATURE_KEYS) {
    features[key] = isEffectivelyEnabled(raw, key);
  }

  return { features, plan: org.plan as PlanId, overrides };
}

/* ------------------------------------------------------------------ */
/*  Set org-level feature overrides                                    */
/* ------------------------------------------------------------------ */

export async function setOrgFeatures(
  orgId: string,
  updates: Record<string, boolean>,
): Promise<ResolvedFeatures> {
  const ops = [];
  for (const key of ALL_FEATURE_KEYS) {
    if (key in updates && typeof updates[key] === "boolean") {
      ops.push(
        prisma.orgFeature.upsert({
          where: { orgId_featureKey: { orgId, featureKey: key } },
          update: { enabled: updates[key] },
          create: { orgId, featureKey: key, enabled: updates[key] },
        }),
      );
    }
  }
  if (ops.length > 0) {
    await prisma.$transaction(ops);
  }
  return resolveOrgFeatures(orgId);
}

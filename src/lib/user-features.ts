import { prisma } from "@/lib/db";
import { ALL_FEATURE_KEYS, type FeatureKey } from "@/config/features";

/* ------------------------------------------------------------------ */
/*  Per-user feature helpers                                           */
/* ------------------------------------------------------------------ */

/** Read per-user features from DB. Defaults to true if row missing. */
export async function getUserFeatures(
  userId: string,
): Promise<Record<FeatureKey, boolean>> {
  const rows = await prisma.userFeature.findMany({ where: { userId } });
  const result = {} as Record<FeatureKey, boolean>;
  for (const key of ALL_FEATURE_KEYS) {
    const row = rows.find((r) => r.featureKey === key);
    result[key] = row ? row.enabled : true; // default true if no row
  }
  return result;
}

/** Set one or more features for a user (upsert). */
export async function setUserFeatures(
  userId: string,
  features: Record<string, boolean>,
): Promise<Record<FeatureKey, boolean>> {
  const ops = [];
  for (const key of ALL_FEATURE_KEYS) {
    if (key in features && typeof features[key] === "boolean") {
      ops.push(
        prisma.userFeature.upsert({
          where: { userId_featureKey: { userId, featureKey: key } },
          update: { enabled: features[key] },
          create: { userId, featureKey: key, enabled: features[key] },
        }),
      );
    }
  }
  if (ops.length > 0) {
    await prisma.$transaction(ops);
  }
  return getUserFeatures(userId);
}

/** Create default feature rows for a new user (all enabled). */
export async function createDefaultFeatures(
  userId: string,
): Promise<void> {
  const existing = await prisma.userFeature.findMany({
    where: { userId },
    select: { featureKey: true },
  });
  const existingKeys = new Set(existing.map((r) => r.featureKey));
  const creates = ALL_FEATURE_KEYS.filter((k) => !existingKeys.has(k)).map(
    (key) => ({
      userId,
      featureKey: key,
      enabled: true,
    }),
  );
  if (creates.length > 0) {
    await prisma.userFeature.createMany({ data: creates });
  }
}

/** Check if a userId exists in the User table. */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return !!user;
  } catch {
    // Table may not exist yet (migration not applied) — fail-open
    return false;
  }
}

/** Check if a userId belongs to an admin. */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    return user?.isAdmin ?? false;
  } catch {
    // Table may not exist yet (migration not applied) — fail-safe
    return false;
  }
}

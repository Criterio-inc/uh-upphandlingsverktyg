import { prisma } from "@/lib/db";
import { ALL_FEATURE_KEYS, type FeatureKey } from "@/config/features";
import { ensureTables } from "@/lib/ensure-tables";

/* ------------------------------------------------------------------ */
/*  Per-user feature helpers                                           */
/* ------------------------------------------------------------------ */

/** Read per-user features from DB. Defaults to true if row missing. */
export async function getUserFeatures(
  userId: string,
): Promise<Record<FeatureKey, boolean>> {
  await ensureTables();
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
  await ensureTables();
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
  await ensureTables();
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
  await ensureTables();
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
  await ensureTables();
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

const ADMIN_EMAIL = "par.levander@criteroconsulting.se";

/**
 * Admin access check with Clerk email fallback.
 * 1. Checks DB (fast path — works after user is synced)
 * 2. Always falls back to Clerk email check if DB says not admin
 */
export async function checkAdminAccess(userId: string): Promise<boolean> {
  // 1. Fast path: check DB
  const dbAdmin = await isUserAdmin(userId);
  if (dbAdmin) return true;

  // 2. Fallback: always check Clerk email directly
  //    Handles: empty table, partial sync, user not yet in DB
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress;
    return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  } catch {
    // Clerk not available or API error — fail closed
    return false;
  }
}

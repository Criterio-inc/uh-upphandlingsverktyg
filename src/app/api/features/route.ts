import { NextResponse } from "next/server";
import { ALL_FEATURE_KEYS, type FeatureKey } from "@/config/features";
import { getUserFeatures, setUserFeatures, userExists } from "@/lib/user-features";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Clerk auth helper (dynamic import to avoid errors without Clerk)    */
/* ------------------------------------------------------------------ */

async function getClerkUserId(): Promise<string | null> {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch {
    // Clerk not configured or not available
    return null;
  }
}

/** Return default features (all enabled) */
function getDefaultFeatures(): Record<FeatureKey, boolean> {
  const features = {} as Record<FeatureKey, boolean>;
  for (const key of ALL_FEATURE_KEYS) {
    features[key] = true;
  }
  return features;
}

/* ------------------------------------------------------------------ */
/*  GET /api/features — return features for the current user           */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    const userId = await getClerkUserId();

    // If Clerk is active and we have a userId, try per-user features from DB
    if (userId) {
      const exists = await userExists(userId);
      if (exists) {
        const features = await getUserFeatures(userId);
        return NextResponse.json({ features });
      }
      // User not synced to DB yet — fall through to defaults (fail-open)
    }

    // Fallback: all features enabled (dev mode or user not in DB yet)
    return NextResponse.json({ features: getDefaultFeatures() });
  } catch (e) {
    console.error("GET /api/features error:", e);
    // Fail-open: return all features enabled
    return NextResponse.json({ features: getDefaultFeatures() });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/features — update per-user features                      */
/* ------------------------------------------------------------------ */

export async function PATCH(req: Request) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updates: Record<string, boolean> = body.features;

    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Update per-user features in DB
    const features = await setUserFeatures(userId, updates);
    return NextResponse.json({ features });
  } catch (e) {
    console.error("PATCH /api/features error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

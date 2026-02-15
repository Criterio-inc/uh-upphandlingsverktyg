import { NextResponse } from "next/server";
import { ALL_FEATURE_KEYS, type FeatureKey } from "@/config/features";
import { requireAuth, requireOrgAdmin, ApiError } from "@/lib/auth-guard";
import { resolveOrgFeatures, setOrgFeatures } from "@/lib/org-features";

export const dynamic = "force-dynamic";

/** Return default features (all enabled) — for dev/fallback */
function getDefaultFeatures(): Record<FeatureKey, boolean> {
  const features = {} as Record<FeatureKey, boolean>;
  for (const key of ALL_FEATURE_KEYS) {
    features[key] = true;
  }
  return features;
}

/* ------------------------------------------------------------------ */
/*  GET /api/features — return resolved features for current user's org */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    const ctx = await requireAuth();

    if (ctx.orgId) {
      const { features, plan } = await resolveOrgFeatures(ctx.orgId);
      return NextResponse.json({ features, orgId: ctx.orgId, plan });
    }

    // No org (platform admin without membership, or dev mode)
    return NextResponse.json({ features: getDefaultFeatures() });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    console.error("GET /api/features error:", e);
    // Fail-open: return all features enabled
    return NextResponse.json({ features: getDefaultFeatures() });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/features — update org-level feature overrides           */
/*  Requires org admin or platform admin                                */
/* ------------------------------------------------------------------ */

export async function PATCH(req: Request) {
  try {
    const ctx = await requireAuth();
    requireOrgAdmin(ctx);

    if (!ctx.orgId) {
      return NextResponse.json({ error: "Ingen organisation vald" }, { status: 400 });
    }

    const body = await req.json();
    const updates: Record<string, boolean> = body.features;

    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "Ogiltig payload" }, { status: 400 });
    }

    const { features } = await setOrgFeatures(ctx.orgId, updates);
    return NextResponse.json({ features });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    console.error("PATCH /api/features error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Okänt fel" },
      { status: 500 },
    );
  }
}

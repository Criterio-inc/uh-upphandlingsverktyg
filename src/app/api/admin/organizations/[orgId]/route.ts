import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePlatformAdmin, ApiError, logAudit } from "@/lib/auth-guard";
import { validateBody, updateOrgSchema } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/organizations/[orgId] — get org details              */
/* ------------------------------------------------------------------ */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requirePlatformAdmin(ctx);
    const { orgId } = await params;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, imageUrl: true } },
          },
        },
        features: true,
        _count: { select: { cases: true } },
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organisation hittades inte" }, { status: 404 });
    }

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        maxUsers: org.maxUsers,
        settings: org.settings,
        caseCount: org._count.cases,
        createdAt: org.createdAt.toISOString(),
        members: org.memberships.map((m) => ({
          userId: m.user.id,
          email: m.user.email,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          imageUrl: m.user.imageUrl,
          role: m.role,
          joinedAt: m.createdAt.toISOString(),
        })),
        features: Object.fromEntries(
          org.features.map((f) => [f.featureKey, f.enabled]),
        ),
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/admin/organizations/[orgId] — update org                 */
/* ------------------------------------------------------------------ */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requirePlatformAdmin(ctx);
    const { orgId } = await params;

    const rawBody = await req.json();
    const validated = validateBody(updateOrgSchema, rawBody);
    if (!validated.success) return validated.response;
    const body = validated.data;

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.plan !== undefined) data.plan = body.plan;
    if (body.maxUsers !== undefined) data.maxUsers = body.maxUsers;
    if (body.settings !== undefined) {
      data.settings = typeof body.settings === "string"
        ? body.settings
        : JSON.stringify(body.settings);
    }

    // Update org fields (name, plan, maxUsers, settings) if any provided
    if (Object.keys(data).length > 0) {
      await prisma.organization.update({
        where: { id: orgId },
        data,
      });
    }

    // Handle feature overrides via setOrgFeatures
    if (body.features && typeof body.features === "object") {
      const { setOrgFeatures } = await import("@/lib/org-features");
      await setOrgFeatures(orgId, body.features as Record<string, boolean>);
    }

    await logAudit(ctx, "update", "organization", orgId);

    // Re-fetch the updated org to return
    const updated = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        features: true,
      },
    });

    return NextResponse.json({
      organization: {
        ...updated,
        features: Object.fromEntries(
          (updated?.features ?? []).map((f) => [f.featureKey, f.enabled]),
        ),
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/admin/organizations/[orgId] — delete org                */
/* ------------------------------------------------------------------ */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requirePlatformAdmin(ctx);
    const { orgId } = await params;

    await logAudit(ctx, "delete", "organization", orgId);
    await prisma.organization.delete({ where: { id: orgId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

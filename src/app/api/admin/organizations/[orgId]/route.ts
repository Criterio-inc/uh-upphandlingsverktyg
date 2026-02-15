import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePlatformAdmin, ApiError } from "@/lib/auth-guard";

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

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.plan !== undefined) data.plan = body.plan;
    if (body.maxUsers !== undefined) data.maxUsers = body.maxUsers;
    if (body.settings !== undefined) {
      data.settings = typeof body.settings === "string"
        ? body.settings
        : JSON.stringify(body.settings);
    }

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data,
    });

    return NextResponse.json({ organization: updated });
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

    await prisma.organization.delete({ where: { id: orgId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

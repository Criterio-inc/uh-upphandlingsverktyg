import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePlatformAdmin, ApiError } from "@/lib/auth-guard";
import { validateBody } from "@/lib/api-validation";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createOrgSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck").min(2),
  plan: z.enum(["trial", "starter", "professional", "enterprise"]).default("enterprise"),
});

export async function GET() {
  try {
    const ctx = await requireAuth();

    if (!ctx.orgId) {
      // No org — tell the client so it can show setup UI
      return NextResponse.json({
        organization: null,
        userRole: ctx.role,
        isPlatformAdmin: ctx.isPlatformAdmin,
        noOrg: true,
      });
    }

    const org = await prisma.organization.findUnique({
      where: { id: ctx.orgId },
      include: {
        _count: { select: { memberships: true } },
        memberships: {
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true, imageUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
        invitations: {
          where: { usedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

    // Count cases separately — Case.orgId column might not exist yet
    let caseCount = 0;
    try {
      caseCount = await prisma.case.count({ where: { orgId: ctx.orgId } });
    } catch {
      // Case.orgId column missing — count all cases as fallback
      try { caseCount = await prisma.case.count(); } catch { /* ignore */ }
    }

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        maxUsers: org.maxUsers,
        memberCount: org._count.memberships,
        caseCount,
        members: org.memberships.map((m) => ({
          userId: m.user.id,
          email: m.user.email,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          imageUrl: m.user.imageUrl,
          role: m.role,
          joinedAt: m.createdAt.toISOString(),
        })),
        invitations: org.invitations.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          expiresAt: inv.expiresAt.toISOString(),
          createdAt: inv.createdAt.toISOString(),
        })),
      },
      userRole: ctx.role,
      isPlatformAdmin: ctx.isPlatformAdmin,
    });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/org — bootstrap first organization (platform admin only) */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  try {
    const ctx = await requireAuth();
    requirePlatformAdmin(ctx);

    const rawBody = await req.json();
    const validated = validateBody(createOrgSchema, rawBody);
    if (!validated.success) return validated.response;
    const { name, slug, plan } = validated.data;

    // Check slug uniqueness
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug redan upptagen" }, { status: 409 });
    }

    // Create org + add current user as admin member
    const org = await prisma.organization.create({
      data: { name, slug, plan, maxUsers: plan === "enterprise" ? 999 : 20 },
    });

    await prisma.orgMembership.create({
      data: { orgId: org.id, userId: ctx.userId, role: "admin" },
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    console.error("POST /api/org error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Okänt fel" },
      { status: 500 },
    );
  }
}

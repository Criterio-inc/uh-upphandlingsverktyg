import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, ApiError } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ctx = await requireAuth();
    if (!ctx.orgId) return NextResponse.json({ error: "Ingen organisation" }, { status: 400 });

    const org = await prisma.organization.findUnique({
      where: { id: ctx.orgId },
      include: {
        _count: { select: { memberships: true, cases: true } },
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

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        maxUsers: org.maxUsers,
        memberCount: org._count.memberships,
        caseCount: org._count.cases,
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
    });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

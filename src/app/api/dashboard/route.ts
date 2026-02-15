import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, ApiError } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ctx = await requireAuth();

    // Org info
    let orgInfo = null;
    if (ctx.orgId) {
      const org = await prisma.organization.findUnique({
        where: { id: ctx.orgId },
        select: { name: true, slug: true, plan: true, maxUsers: true },
      });
      if (org) {
        const memberCount = await prisma.orgMembership.count({ where: { orgId: ctx.orgId } });
        orgInfo = { ...org, memberCount };
      }
    }

    // Cases stats
    const caseWhere: Record<string, unknown> = ctx.orgId
      ? { OR: [{ orgId: ctx.orgId }, { orgId: null }] }
      : {};
    const [totalCases, draftCases, activeCases] = await Promise.all([
      prisma.case.count({ where: caseWhere }),
      prisma.case.count({ where: { ...caseWhere, status: "draft" } }),
      prisma.case.count({ where: { ...caseWhere, status: "active" } }),
    ]);

    // Recent cases
    const recentCases = await prisma.case.findMany({
      where: caseWhere,
      select: { id: true, name: true, status: true, currentPhase: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // Assessment stats
    const assessmentWhere: Record<string, unknown> = ctx.orgId
      ? { orgId: ctx.orgId }
      : { ownerId: ctx.userId };
    const totalProjects = await prisma.assessmentProject.count({ where: assessmentWhere });

    // Recent audit log
    let recentActivity: { action: string; entityType: string; entityId: string; createdAt: Date }[] = [];
    if (ctx.orgId) {
      recentActivity = await prisma.auditLog.findMany({
        where: { orgId: ctx.orgId },
        select: { action: true, entityType: true, entityId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    }

    return NextResponse.json({
      org: orgInfo,
      stats: {
        totalCases,
        draftCases,
        activeCases,
        totalProjects,
      },
      recentCases: recentCases.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        currentPhase: c.currentPhase,
        updatedAt: c.updatedAt.toISOString(),
      })),
      recentActivity: recentActivity.map((a) => ({
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        createdAt: a.createdAt.toISOString(),
      })),
      userRole: ctx.role,
      plan: ctx.orgPlan,
    });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    console.error("GET /api/dashboard error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

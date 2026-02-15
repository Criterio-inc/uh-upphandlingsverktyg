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

    // Cases stats — defensive: Case.orgId column may not exist yet
    let totalCases = 0, draftCases = 0, activeCases = 0;
    let recentCasesRaw: { id: string; name: string; status: string; currentPhase: string; updatedAt: Date }[] = [];
    try {
      const caseWhere: Record<string, unknown> = ctx.orgId
        ? { OR: [{ orgId: ctx.orgId }, { orgId: null }] }
        : {};
      [totalCases, draftCases, activeCases] = await Promise.all([
        prisma.case.count({ where: caseWhere }),
        prisma.case.count({ where: { ...caseWhere, status: "draft" } }),
        prisma.case.count({ where: { ...caseWhere, status: "active" } }),
      ]);
      recentCasesRaw = await prisma.case.findMany({
        where: caseWhere,
        select: { id: true, name: true, status: true, currentPhase: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      });
    } catch {
      // Case.orgId column missing — query without org filter
      try {
        [totalCases, draftCases, activeCases] = await Promise.all([
          prisma.case.count(),
          prisma.case.count({ where: { status: "draft" } }),
          prisma.case.count({ where: { status: "active" } }),
        ]);
        recentCasesRaw = await prisma.case.findMany({
          select: { id: true, name: true, status: true, currentPhase: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
        });
      } catch { /* ignore */ }
    }

    // Assessment stats — defensive: orgId column may not exist
    let totalProjects = 0;
    try {
      const assessmentWhere: Record<string, unknown> = ctx.orgId
        ? { orgId: ctx.orgId }
        : { ownerId: ctx.userId };
      totalProjects = await prisma.assessmentProject.count({ where: assessmentWhere });
    } catch {
      try { totalProjects = await prisma.assessmentProject.count(); } catch { /* ignore */ }
    }

    // Recent audit log
    let recentActivity: { action: string; entityType: string; entityId: string; createdAt: Date }[] = [];
    if (ctx.orgId) {
      try {
        recentActivity = await prisma.auditLog.findMany({
          where: { orgId: ctx.orgId },
          select: { action: true, entityType: true, entityId: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
      } catch { /* AuditLog table may not exist */ }
    }

    return NextResponse.json({
      org: orgInfo,
      stats: {
        totalCases,
        draftCases,
        activeCases,
        totalProjects,
      },
      recentCases: recentCasesRaw.map((c) => ({
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
      isPlatformAdmin: ctx.isPlatformAdmin,
      hasOrg: !!ctx.orgId,
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

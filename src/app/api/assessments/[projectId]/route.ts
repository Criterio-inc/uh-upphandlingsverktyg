import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTables } from "@/lib/ensure-tables";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Clerk auth helper                                                   */
/* ------------------------------------------------------------------ */

async function getClerkUserId(): Promise<string | null> {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: fetch project with owner check                              */
/* ------------------------------------------------------------------ */

async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.assessmentProject.findUnique({
    where: { id: projectId },
    include: {
      assessmentType: true,
      sessions: {
        include: {
          result: true,
          _count: { select: { responses: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) return null;
  if (project.ownerId !== userId) return "forbidden";
  return project;
}

/* ------------------------------------------------------------------ */
/*  GET /api/assessments/[projectId] — get project details              */
/* ------------------------------------------------------------------ */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const { projectId } = await params;
    const project = await getOwnedProject(projectId, userId);

    if (!project) {
      return NextResponse.json({ error: "Projektet hittades inte" }, { status: 404 });
    }
    if (project === "forbidden") {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        organizationName: project.organizationName,
        assessmentType: {
          id: project.assessmentType.id,
          slug: project.assessmentType.slug,
          name: project.assessmentType.name,
          description: project.assessmentType.description,
        },
        sessions: project.sessions.map((s) => ({
          id: s.id,
          shareToken: s.shareToken,
          status: s.status,
          respondentName: s.respondentName,
          respondentEmail: s.respondentEmail,
          respondentRole: s.respondentRole,
          responseCount: s._count.responses,
          completedAt: s.completedAt?.toISOString() ?? null,
          result: s.result
            ? {
                id: s.result.id,
                scores: JSON.parse(s.result.scores),
                overall: s.result.overall,
                level: s.result.level,
                hasAiInsights: s.result.aiInsights.length > 0,
              }
            : null,
          createdAt: s.createdAt.toISOString(),
        })),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("GET /api/assessments/[projectId] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/assessments/[projectId] — update project                 */
/* ------------------------------------------------------------------ */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const { projectId } = await params;

    // Check ownership
    const existing = await prisma.assessmentProject.findUnique({
      where: { id: projectId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Projektet hittades inte" }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    const body = await request.json();
    const data: Record<string, string> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.organizationName !== undefined) data.organizationName = body.organizationName;

    const updated = await prisma.assessmentProject.update({
      where: { id: projectId },
      data,
      include: { assessmentType: true },
    });

    return NextResponse.json({
      project: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        organizationName: updated.organizationName,
        assessmentType: {
          id: updated.assessmentType.id,
          slug: updated.assessmentType.slug,
          name: updated.assessmentType.name,
        },
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("PATCH /api/assessments/[projectId] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/assessments/[projectId] — delete project (cascades)     */
/* ------------------------------------------------------------------ */

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const { projectId } = await params;

    const existing = await prisma.assessmentProject.findUnique({
      where: { id: projectId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Projektet hittades inte" }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    // Delete project — sessions cascade via FK
    await prisma.assessmentProject.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/assessments/[projectId] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

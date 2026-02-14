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
/*  GET /api/assessments/[projectId]/sessions — list sessions           */
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

    // Check ownership
    const project = await prisma.assessmentProject.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Projektet hittades inte" }, { status: 404 });
    }
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    const sessions = await prisma.assessmentSession.findMany({
      where: { projectId },
      include: {
        result: true,
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = sessions.map((s) => ({
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
            overall: s.result.overall,
            level: s.result.level,
            hasAiInsights: s.result.aiInsights.length > 0,
          }
        : null,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ sessions: result, total: result.length });
  } catch (e) {
    console.error("GET /api/assessments/[projectId]/sessions error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/assessments/[projectId]/sessions — create a new session   */
/* ------------------------------------------------------------------ */

export async function POST(
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
    const project = await prisma.assessmentProject.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Projektet hittades inte" }, { status: 404 });
    }
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { respondentName, respondentEmail, respondentRole } = body as {
      respondentName?: string;
      respondentEmail?: string;
      respondentRole?: string;
    };

    // Generate a share token using crypto.randomUUID
    const shareToken = crypto.randomUUID();

    const session = await prisma.assessmentSession.create({
      data: {
        projectId,
        shareToken,
        respondentName: respondentName ?? "",
        respondentEmail: respondentEmail ?? "",
        respondentRole: respondentRole ?? "",
      },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        shareToken: session.shareToken,
        status: session.status,
        respondentName: session.respondentName,
        respondentEmail: session.respondentEmail,
        respondentRole: session.respondentRole,
        createdAt: session.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (e) {
    console.error("POST /api/assessments/[projectId]/sessions error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

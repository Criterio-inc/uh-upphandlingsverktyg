import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTables } from "@/lib/ensure-tables";
import { getAssessmentConfig } from "@/config/assessments";

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
/*  GET /api/assessments/sessions/[sessionId]                           */
/*  Public if accessed via ?token=<shareToken>, otherwise auth required */
/* ------------------------------------------------------------------ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    await ensureTables();

    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get("token");

    // Fetch the session with all related data
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        responses: true,
        result: true,
        project: {
          include: {
            assessmentType: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sessionen hittades inte" }, { status: 404 });
    }

    // Access control: either valid shareToken or authenticated owner
    if (shareToken) {
      if (session.shareToken !== shareToken) {
        return NextResponse.json({ error: "Ogiltig delningslänk" }, { status: 403 });
      }
    } else {
      const userId = await getClerkUserId();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (session.project.ownerId !== userId) {
        return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
      }
    }

    // Get the assessment config for questions/dimensions
    const config = getAssessmentConfig(session.project.assessmentType.slug);

    // Build response map: questionId -> value
    const responseMap: Record<string, number> = {};
    for (const r of session.responses) {
      responseMap[r.questionId] = r.value;
    }

    return NextResponse.json({
      session: {
        id: session.id,
        shareToken: session.shareToken,
        status: session.status,
        respondentName: session.respondentName,
        respondentEmail: session.respondentEmail,
        respondentRole: session.respondentRole,
        completedAt: session.completedAt?.toISOString() ?? null,
        createdAt: session.createdAt.toISOString(),
        responses: responseMap,
        result: session.result
          ? {
              id: session.result.id,
              scores: JSON.parse(session.result.scores),
              overall: session.result.overall,
              level: session.result.level,
              aiInsights: session.result.aiInsights,
              createdAt: session.result.createdAt.toISOString(),
            }
          : null,
      },
      project: {
        id: session.project.id,
        name: session.project.name,
        description: session.project.description,
        organizationName: session.project.organizationName,
      },
      assessmentType: {
        id: session.project.assessmentType.id,
        slug: session.project.assessmentType.slug,
        name: session.project.assessmentType.name,
        description: session.project.assessmentType.description,
      },
      // Include config data so the survey UI can render questions
      config: config
        ? {
            dimensions: config.dimensions,
            dimensionLabels: config.dimensionLabels,
            dimensionDescriptions: config.dimensionDescriptions,
            questions: config.questions,
            maturityLevels: config.maturityLevels,
          }
        : null,
    });
  } catch (e) {
    console.error("GET /api/assessments/sessions/[sessionId] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/assessments/sessions/[sessionId]                         */
/*  Update session metadata (respondentName etc). Auth required.        */
/* ------------------------------------------------------------------ */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const { sessionId } = await params;

    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { project: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Sessionen hittades inte" }, { status: 404 });
    }
    if (session.project.ownerId !== userId) {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.respondentName !== undefined) updateData.respondentName = body.respondentName;
    if (body.respondentEmail !== undefined) updateData.respondentEmail = body.respondentEmail;
    if (body.respondentRole !== undefined) updateData.respondentRole = body.respondentRole;

    const updated = await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({
      session: {
        id: updated.id,
        shareToken: updated.shareToken,
        status: updated.status,
        respondentName: updated.respondentName,
        respondentEmail: updated.respondentEmail,
        respondentRole: updated.respondentRole,
        completedAt: updated.completedAt?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("PATCH /api/assessments/sessions/[sessionId] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/assessments/sessions/[sessionId]                        */
/*  Delete a session and all its responses/results. Auth required.      */
/* ------------------------------------------------------------------ */

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const { sessionId } = await params;

    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { project: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Sessionen hittades inte" }, { status: 404 });
    }
    if (session.project.ownerId !== userId) {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    // Cascading delete handles responses and results via FK onDelete: Cascade
    await prisma.assessmentSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/assessments/sessions/[sessionId] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

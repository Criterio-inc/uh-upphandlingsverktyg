import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTables } from "@/lib/ensure-tables";
import { getAssessmentConfig } from "@/config/assessments";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/assessments/sessions/by-token/[token]                      */
/*  Fetch session by shareToken. Public endpoint (no auth required).    */
/* ------------------------------------------------------------------ */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await ensureTables();

    const { token } = await params;

    const session = await prisma.assessmentSession.findFirst({
      where: { shareToken: token },
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
      return NextResponse.json(
        { error: "Sessionen hittades inte" },
        { status: 404 },
      );
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
    console.error("GET /api/assessments/sessions/by-token/[token] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/assessments/sessions/by-token/[token]                    */
/*  Update respondent info and/or status. Public endpoint.              */
/* ------------------------------------------------------------------ */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await ensureTables();

    const { token } = await params;

    const session = await prisma.assessmentSession.findFirst({
      where: { shareToken: token },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sessionen hittades inte" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { respondentName, respondentEmail, respondentRole, status } = body;

    // Build update data — only include fields that were provided
    const updateData: Record<string, unknown> = {};
    if (respondentName !== undefined) updateData.respondentName = respondentName;
    if (respondentEmail !== undefined) updateData.respondentEmail = respondentEmail;
    if (respondentRole !== undefined) updateData.respondentRole = respondentRole;
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.assessmentSession.update({
      where: { id: session.id },
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
    console.error("PATCH /api/assessments/sessions/by-token/[token] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

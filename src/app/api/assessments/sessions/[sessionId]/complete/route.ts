import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTables } from "@/lib/ensure-tables";
import { getAssessmentConfig } from "@/config/assessments";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  POST /api/assessments/sessions/[sessionId]/complete                 */
/*  Mark session as completed & calculate scores. Public endpoint.      */
/* ------------------------------------------------------------------ */

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    await ensureTables();

    const { sessionId } = await params;

    // Fetch session with project, type, and all responses
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        responses: true,
        project: {
          include: { assessmentType: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sessionen hittades inte" }, { status: 404 });
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Sessionen är redan slutförd" },
        { status: 400 },
      );
    }

    // Get assessment config to calculate per-dimension scores
    const config = getAssessmentConfig(session.project.assessmentType.slug);
    if (!config) {
      return NextResponse.json(
        { error: "Bedömningstypen saknar konfiguration" },
        { status: 500 },
      );
    }

    // Build a map of questionId -> dimension
    const questionDimensionMap = new Map<string, string>();
    for (const q of config.questions) {
      questionDimensionMap.set(q.id, q.dimension);
    }

    // Build a map of responses: questionId -> value
    const responseMap = new Map<string, number>();
    for (const r of session.responses) {
      responseMap.set(r.questionId, r.value);
    }

    // Calculate per-dimension averages
    const dimensionScores: Record<string, { sum: number; count: number; average: number }> = {};

    for (const dim of config.dimensions) {
      dimensionScores[dim] = { sum: 0, count: 0, average: 0 };
    }

    for (const q of config.questions) {
      const value = responseMap.get(q.id);
      if (value !== undefined) {
        dimensionScores[q.dimension].sum += value;
        dimensionScores[q.dimension].count += 1;
      }
    }

    // Calculate averages
    let totalSum = 0;
    let totalCount = 0;
    for (const dimId of Object.keys(dimensionScores)) {
      const dim = dimensionScores[dimId];
      if (dim.count > 0) {
        dim.average = Math.round((dim.sum / dim.count) * 100) / 100;
        totalSum += dim.sum;
        totalCount += dim.count;
      }
    }

    const overall = totalCount > 0
      ? Math.round((totalSum / totalCount) * 100) / 100
      : 0;

    // Determine maturity level by rounding
    let level = 1;
    if (overall >= 4.5) {
      level = 5;
    } else if (overall >= 3.5) {
      level = 4;
    } else if (overall >= 2.5) {
      level = 3;
    } else if (overall >= 1.5) {
      level = 2;
    } else {
      level = 1;
    }

    // Build scores JSON
    const scoresJson: Record<string, { average: number; questionCount: number; answeredCount: number }> = {};
    for (const dim of config.dimensions) {
      const ds = dimensionScores[dim];
      const totalQuestionsInDim = config.questions.filter((q) => q.dimension === dim).length;
      scoresJson[dim] = {
        average: ds.average,
        questionCount: totalQuestionsInDim,
        answeredCount: ds.count,
      };
    }

    // Upsert the result
    const existingResult = await prisma.assessmentResult.findUnique({
      where: { sessionId },
    });

    let result;
    if (existingResult) {
      result = await prisma.assessmentResult.update({
        where: { id: existingResult.id },
        data: {
          scores: JSON.stringify(scoresJson),
          overall,
          level,
        },
      });
    } else {
      result = await prisma.assessmentResult.create({
        data: {
          sessionId,
          scores: JSON.stringify(scoresJson),
          overall,
          level,
        },
      });
    }

    // Mark session as completed
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    // Get the maturity level info
    const maturityLevel = config.maturityLevels.find((ml) => ml.level === level);

    return NextResponse.json({
      result: {
        id: result.id,
        scores: scoresJson,
        overall,
        level,
        levelName: maturityLevel?.name ?? "",
        levelDescription: maturityLevel?.description ?? "",
      },
      dimensions: config.dimensions.map((d) => ({
        id: d,
        name: config.dimensionLabels[d] ?? d,
        description: config.dimensionDescriptions[d] ?? "",
        score: scoresJson[d]?.average ?? 0,
      })),
    });
  } catch (e) {
    console.error("POST /api/assessments/sessions/[sessionId]/complete error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";
import { getDimensionsByType } from "@/config/maturity-dimensions";

// GET /api/cases/[caseId]/maturity/aggregate - Get aggregated maturity data
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ caseId: string }> }
) {
  const params = await props.params;
  const { caseId } = params;
  const { searchParams } = new URL(req.url);
  const sessionType = (searchParams.get("type") || "general") as
    | "general"
    | "ai_maturity";

  try {
    // Get all completed sessions of the specified type
    const sessions = await db.maturitySession.findMany({
      where: {
        caseId,
        sessionType,
        status: "completed",
      },
      include: {
        responses: true,
      },
    });

    // If no completed sessions, check for active sessions with responses
    if (sessions.length === 0) {
      const activeSessions = await db.maturitySession.findMany({
        where: {
          caseId,
          sessionType,
          status: "active",
        },
        include: {
          responses: true,
        },
      });

      const sessionsWithResponses = activeSessions.filter(
        (s) => s.responses.length > 0
      );
      sessions.push(...sessionsWithResponses);
    }

    if (sessions.length === 0) {
      return NextResponse.json({
        sessionCount: 0,
        completedCount: 0,
        dimensions: [],
      });
    }

    // Get dimension configuration
    const dimensions = getDimensionsByType(sessionType);

    // Aggregate scores by dimension
    const dimensionScores: {
      [key: string]: { scores: number[]; avgScore: number };
    } = {};

    sessions.forEach((session) => {
      session.responses.forEach((response) => {
        if (!dimensionScores[response.dimensionKey]) {
          dimensionScores[response.dimensionKey] = { scores: [], avgScore: 0 };
        }
        dimensionScores[response.dimensionKey].scores.push(response.score);
      });
    });

    // Calculate average scores
    const aggregatedDimensions = dimensions.map((dim) => {
      const dimData = dimensionScores[dim.key];
      const avgScore = dimData
        ? dimData.scores.reduce((sum, s) => sum + s, 0) / dimData.scores.length
        : 0;

      return {
        key: dim.key,
        label: dim.label,
        description: dim.description,
        avgScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
        responseCount: dimData ? dimData.scores.length : 0,
      };
    });

    // Calculate overall maturity score
    const overallScore =
      aggregatedDimensions.reduce((sum, d) => sum + d.avgScore, 0) /
      aggregatedDimensions.length;

    return NextResponse.json({
      sessionCount: sessions.length,
      completedCount: sessions.filter((s) => s.status === "completed").length,
      overallScore: Math.round(overallScore * 10) / 10,
      dimensions: aggregatedDimensions,
      sessionType,
    });
  } catch (error) {
    console.error("Error aggregating maturity data:", error);
    return NextResponse.json(
      { error: "Failed to aggregate data" },
      { status: 500 }
    );
  }
}

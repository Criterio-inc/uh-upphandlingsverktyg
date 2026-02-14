import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";
import { randomBytes } from "crypto";

// GET /api/cases/[caseId]/maturity - List all sessions for a case
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ caseId: string }> }
) {
  const params = await props.params;
  const { caseId } = params;

  try {
    const sessions = await db.maturitySession.findMany({
      where: { caseId },
      include: {
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate completion percentage for each session
    const sessionsWithStats = sessions.map((session) => {
      const totalResponses = session.responses.length;
      const hasResponses = totalResponses > 0;

      return {
        ...session,
        responseCount: totalResponses,
        isComplete: session.status === "completed" || hasResponses,
      };
    });

    return NextResponse.json(sessionsWithStats);
  } catch (error) {
    console.error("Error fetching maturity sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST /api/cases/[caseId]/maturity - Create a new session
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ caseId: string }> }
) {
  const params = await props.params;
  const { caseId } = params;

  try {
    const body = await req.json();
    const { sessionType = "general", name = "Anonym respondent" } = body;

    // Generate a unique shareable link token
    const shareableLink = randomBytes(16).toString("hex");

    const session = await db.maturitySession.create({
      data: {
        caseId,
        sessionType,
        name,
        shareableLink,
        status: "active",
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error creating maturity session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

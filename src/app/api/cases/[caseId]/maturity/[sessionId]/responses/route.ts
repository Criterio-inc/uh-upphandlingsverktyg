import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";

// POST /api/cases/[caseId]/maturity/[sessionId]/responses - Submit responses
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ caseId: string; sessionId: string }> }
) {
  const params = await props.params;
  const { sessionId } = params;

  try {
    const body = await req.json();
    const { responses } = body; // Array of { dimensionKey, score, notes, evidence }

    // Validate session exists
    const session = await db.maturitySession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Upsert responses
    const upsertPromises = responses.map(
      (response: {
        dimensionKey: string;
        score: number;
        notes?: string;
        evidence?: string;
      }) =>
        db.maturityResponse.upsert({
          where: {
            sessionId_dimensionKey: {
              sessionId,
              dimensionKey: response.dimensionKey,
            },
          },
          update: {
            score: response.score,
            notes: response.notes || "",
            evidence: response.evidence || "",
            updatedAt: new Date(),
          },
          create: {
            sessionId,
            dimensionKey: response.dimensionKey,
            score: response.score,
            notes: response.notes || "",
            evidence: response.evidence || "",
          },
        })
    );

    await Promise.all(upsertPromises);

    // Mark session as started if not already
    if (!session.startedAt) {
      await db.maturitySession.update({
        where: { id: sessionId },
        data: { startedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting maturity responses:", error);
    return NextResponse.json(
      { error: "Failed to submit responses" },
      { status: 500 }
    );
  }
}

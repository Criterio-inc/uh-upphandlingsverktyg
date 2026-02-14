import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTables } from "@/lib/ensure-tables";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  POST /api/assessments/sessions/by-token/[token]/responses           */
/*  Submit or update a single response. Public (no auth required).      */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await ensureTables();

    const { token } = await params;

    // Find session by shareToken
    const session = await prisma.assessmentSession.findFirst({
      where: { shareToken: token },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sessionen hittades inte" },
        { status: 404 },
      );
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Sessionen är redan slutförd" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { questionId, value } = body;

    if (!questionId || value === undefined || value === null) {
      return NextResponse.json(
        { error: "questionId och value krävs" },
        { status: 400 },
      );
    }

    if (typeof value !== "number" || value < 1 || value > 5) {
      return NextResponse.json(
        { error: "value måste vara ett heltal mellan 1 och 5" },
        { status: 400 },
      );
    }

    // Upsert: update if exists, create if not
    const existing = await prisma.assessmentResponse.findUnique({
      where: {
        sessionId_questionId: {
          sessionId: session.id,
          questionId,
        },
      },
    });

    let response;
    if (existing) {
      response = await prisma.assessmentResponse.update({
        where: { id: existing.id },
        data: { value },
      });
    } else {
      response = await prisma.assessmentResponse.create({
        data: {
          sessionId: session.id,
          questionId,
          value,
        },
      });
    }

    // Update session status to "in_progress" if currently "pending"
    if (session.status === "pending") {
      await prisma.assessmentSession.update({
        where: { id: session.id },
        data: { status: "in_progress" },
      });
    }

    return NextResponse.json({
      response: {
        id: response.id,
        questionId: response.questionId,
        value: response.value,
      },
      sessionStatus: session.status === "pending" ? "in_progress" : session.status,
    });
  } catch (e) {
    console.error("POST /api/assessments/sessions/by-token/[token]/responses error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

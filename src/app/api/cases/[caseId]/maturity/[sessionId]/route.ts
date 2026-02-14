import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";

// GET /api/cases/[caseId]/maturity/[sessionId] - Get session with responses
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ caseId: string; sessionId: string }> }
) {
  const params = await props.params;
  const { sessionId } = params;

  try {
    const session = await db.maturitySession.findUnique({
      where: { id: sessionId },
      include: {
        responses: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching maturity session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PATCH /api/cases/[caseId]/maturity/[sessionId] - Update session
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ caseId: string; sessionId: string }> }
) {
  const params = await props.params;
  const { sessionId } = params;

  try {
    const body = await req.json();

    const session = await db.maturitySession.update({
      where: { id: sessionId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error updating maturity session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE /api/cases/[caseId]/maturity/[sessionId] - Delete session
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ caseId: string; sessionId: string }> }
) {
  const params = await props.params;
  const { sessionId } = params;

  try {
    await db.maturitySession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting maturity session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

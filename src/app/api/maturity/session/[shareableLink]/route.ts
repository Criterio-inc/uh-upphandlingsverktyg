import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";

// GET /api/maturity/session/[shareableLink] - Get session by shareable link
// This is the public endpoint for anonymous respondents
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ shareableLink: string }> }
) {
  const params = await props.params;
  const { shareableLink } = params;

  try {
    const session = await db.maturitySession.findUnique({
      where: { shareableLink },
      include: {
        responses: true,
        case: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching session by link:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

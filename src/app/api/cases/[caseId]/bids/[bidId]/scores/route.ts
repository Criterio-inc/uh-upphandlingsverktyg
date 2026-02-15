import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string; bidId: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { caseId, bidId } = await params;
    await requireCaseAccess(caseId, ctx);

    const scores = await prisma.score.findMany({
      where: { caseId, bidId },
      orderBy: { criterionId: "asc" },
    });

    return NextResponse.json(scores);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

/** Bulk upsert scores for a bid */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string; bidId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);
    const { caseId, bidId } = await params;
    await requireCaseAccess(caseId, ctx);

    const body: {
      criterionId: string;
      rawScore: number;
      justification?: string;
      scorer?: string;
    }[] = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected array" }, { status: 400 });
    }

    // Fetch criteria to compute normalized scores
    const criteria = await prisma.criterion.findMany({
      where: { caseId },
      select: { id: true, weight: true, scale: true },
    });
    const criteriaMap = Object.fromEntries(
      criteria.map((c: { id: string; weight: number; scale: string }) => [c.id, c])
    );

    const results = [];

    for (const item of body) {
      const criterion = criteriaMap[item.criterionId];
      const maxScale = criterion?.scale === "0-10" ? 10 : 5;
      const normalizedScore = criterion
        ? (item.rawScore / maxScale) * criterion.weight
        : 0;

      const data = {
        caseId,
        bidId,
        criterionId: item.criterionId,
        rawScore: item.rawScore,
        normalizedScore: Math.round(normalizedScore * 100) / 100,
        justification: item.justification ?? "",
        scorer: item.scorer ?? "",
        scoredAt: new Date().toISOString(),
      };

      const result = await prisma.score.upsert({
        where: {
          bidId_criterionId: {
            bidId,
            criterionId: item.criterionId,
          },
        },
        create: data,
        update: {
          rawScore: data.rawScore,
          normalizedScore: data.normalizedScore,
          justification: data.justification,
          scorer: data.scorer,
          scoredAt: data.scoredAt,
        },
      });

      results.push(result);
    }

    return NextResponse.json(results);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string; bidId: string }> }
) {
  const { caseId, bidId } = await params;

  const responses = await prisma.bidResponse.findMany({
    where: { caseId, bidId },
    orderBy: { requirementId: "asc" },
  });

  return NextResponse.json(responses);
}

/** Bulk upsert bid responses for a bid */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string; bidId: string }> }
) {
  const { caseId, bidId } = await params;
  const body: {
    requirementId: string;
    meets: string;
    supplierStatement?: string;
    reviewNotes?: string;
  }[] = await req.json();

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected array" }, { status: 400 });
  }

  const results = [];

  for (const item of body) {
    const data = {
      caseId,
      bidId,
      requirementId: item.requirementId,
      meets: item.meets ?? "no",
      supplierStatement: item.supplierStatement ?? "",
      reviewNotes: item.reviewNotes ?? "",
    };

    const result = await prisma.bidResponse.upsert({
      where: {
        bidId_requirementId: {
          bidId,
          requirementId: item.requirementId,
        },
      },
      create: data,
      update: {
        meets: data.meets,
        supplierStatement: data.supplierStatement,
        reviewNotes: data.reviewNotes,
      },
    });

    results.push(result);
  }

  return NextResponse.json(results);
}

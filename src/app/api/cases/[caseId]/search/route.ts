import { NextRequest, NextResponse } from "next/server";
import { searchEntities } from "@/lib/search";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;

  try {
    const ctx = await requireAuth();
    await requireCaseAccess(caseId, ctx);

    const query = req.nextUrl.searchParams.get("q") ?? "";

    const results = await searchEntities(caseId, query);
    return NextResponse.json(results);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

import { NextResponse } from "next/server";
import { validateCase, validateCaseWithInsights } from "@/lib/validation";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;

  try {
    const ctx = await requireAuth();
    await requireCaseAccess(caseId, ctx);

    const url = new URL(req.url);
    const withInsights = url.searchParams.get("insights") === "true";

    if (withInsights) {
      const result = await validateCaseWithInsights(caseId);
      return NextResponse.json(result);
    }

    const warnings = await validateCase(caseId);
    return NextResponse.json(warnings);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

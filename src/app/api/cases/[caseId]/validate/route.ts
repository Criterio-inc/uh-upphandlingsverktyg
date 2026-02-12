import { NextResponse } from "next/server";
import { validateCase, validateCaseWithInsights } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const url = new URL(req.url);
  const withInsights = url.searchParams.get("insights") === "true";

  if (withInsights) {
    const result = await validateCaseWithInsights(caseId);
    return NextResponse.json(result);
  }

  const warnings = await validateCase(caseId);
  return NextResponse.json(warnings);
}

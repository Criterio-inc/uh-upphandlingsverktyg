import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string; linkId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);
    const { caseId, linkId } = await params;
    await requireCaseAccess(caseId, ctx);

    await prisma.traceLink.delete({ where: { id: linkId } });
    await logAudit(ctx, "delete", "trace-link", linkId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

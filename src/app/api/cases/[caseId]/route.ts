import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { caseId } = await params;
    await requireCaseAccess(caseId, ctx);

    const c = await prisma.case.findUnique({ where: { id: caseId } });
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(c);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);
    const { caseId } = await params;
    await requireCaseAccess(caseId, ctx);

    const body = await req.json();

    // Serialize JSON fields if present
    const data: Record<string, unknown> = { ...body };
    for (const key of ["timeline", "goals", "scopeIn", "scopeOut", "dependencies", "governance"]) {
      if (data[key] !== undefined && typeof data[key] !== "string") {
        data[key] = JSON.stringify(data[key]);
      }
    }

    const updated = await prisma.case.update({
      where: { id: caseId },
      data,
    });
    await logAudit(ctx, "update", "case", caseId);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);
    const { caseId } = await params;
    await requireCaseAccess(caseId, ctx);

    await prisma.case.delete({ where: { id: caseId } });
    await logAudit(ctx, "delete", "case", caseId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

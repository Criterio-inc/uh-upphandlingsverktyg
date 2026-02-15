import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";
import { validateBody, createTraceLinkSchema } from "@/lib/api-validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { caseId } = await params;
    await requireCaseAccess(caseId, ctx);

    const searchParams = req.nextUrl.searchParams;
    const entityId = searchParams.get("entityId");

    const where: Record<string, unknown> = { caseId };

    // If entityId specified, get links FROM or TO this entity
    if (entityId) {
      const links = await prisma.traceLink.findMany({
        where: {
          caseId,
          OR: [{ fromId: entityId }, { toId: entityId }],
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(links);
    }

    const links = await prisma.traceLink.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(links);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);
    const { caseId } = await params;
    await requireCaseAccess(caseId, ctx);

    const rawBody = await req.json();
    const validation = validateBody(createTraceLinkSchema, rawBody);
    if (!validation.success) return validation.response;
    const body = validation.data;

    const link = await prisma.traceLink.create({
      data: {
        caseId,
        fromType: body.fromType,
        fromId: body.fromId,
        toType: body.toType,
        toId: body.toId,
        relation: body.relation,
        note: body.note ?? "",
      },
    });

    await logAudit(ctx, "create", "trace-link", link.id);

    return NextResponse.json(link, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

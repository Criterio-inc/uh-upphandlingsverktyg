import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/id-generator";
import { requireAuth, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

export async function GET() {
  try {
    const ctx = await requireAuth();

    const where: Record<string, unknown> = {};
    if (ctx.orgId) {
      // Filter by organization — also include legacy cases without orgId
      where.OR = [{ orgId: ctx.orgId }, { orgId: null }];
    }

    const cases = await prisma.case.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(cases);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);

    const body = await req.json();
    const id = await generateId("case");

    const created = await prisma.case.create({
      data: {
        id,
        orgId: ctx.orgId || null,
        name: body.name,
        domainProfile: body.domainProfile ?? "generisk_lou",
        orgName: body.orgName ?? "",
        procurementType: body.procurementType ?? "nyanskaffning",
        estimatedValueSek: body.estimatedValueSek ?? 0,
        timeline: JSON.stringify(body.timeline ?? {}),
        goals: JSON.stringify(body.goals ?? []),
        scopeIn: JSON.stringify(body.scopeIn ?? []),
        scopeOut: JSON.stringify(body.scopeOut ?? []),
        dependencies: JSON.stringify(body.dependencies ?? []),
        governance: JSON.stringify(body.governance ?? {}),
        status: "draft",
        currentPhase: "A_start_styrning",
        owner: body.owner ?? "",
      },
    });

    await logAudit(ctx, "create", "case", id);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

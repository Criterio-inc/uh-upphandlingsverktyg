import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

const ENTITY_MAP: Record<string, string> = {
  stakeholders: "stakeholder",
  workshops: "workshop",
  evidence: "evidence",
  needs: "need",
  risks: "risk",
  requirements: "requirement",
  criteria: "criterion",
  bids: "bid",
  decisions: "decision",
  documents: "document",
};

const JSON_FIELDS: Record<string, string[]> = {
  stakeholder: ["tags"],
  workshop: ["tags", "participants", "agenda", "outputs"],
  evidence: ["tags"],
  need: ["tags", "sources", "metrics"],
  risk: ["tags", "relatedNeeds", "relatedRequirements"],
  requirement: ["tags", "linkedNeeds", "linkedRisks", "verification"],
  criterion: ["tags", "anchors", "linkedRequirements"],
  bid: ["tags"],
  decision: ["tags", "alternatives", "attachments"],
  document: ["tags", "generatedFrom"],
};

function getModel(modelName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[modelName];
}

function serializeJsonFields(modelName: string, data: Record<string, unknown>) {
  const fields = JSON_FIELDS[modelName] ?? [];
  const result = { ...data };
  for (const field of fields) {
    if (result[field] !== undefined && typeof result[field] !== "string") {
      result[field] = JSON.stringify(result[field]);
    }
  }
  return result;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string; entityType: string; entityId: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { caseId, entityType, entityId } = await params;
    await requireCaseAccess(caseId, ctx);

    const modelName = ENTITY_MAP[entityType];
    if (!modelName) return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });

    const model = getModel(modelName);
    const item = await model.findUnique({ where: { id: entityId } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string; entityType: string; entityId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);
    const { caseId, entityType, entityId } = await params;
    await requireCaseAccess(caseId, ctx);

    const modelName = ENTITY_MAP[entityType];
    if (!modelName) return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });

    const body = await req.json();
    const model = getModel(modelName);

    // Auto-calculate risk score
    if (modelName === "risk") {
      if (body.likelihood !== undefined || body.impact !== undefined) {
        const current = await model.findUnique({ where: { id: entityId } });
        const likelihood = body.likelihood ?? current.likelihood;
        const impact = body.impact ?? current.impact;
        body.score = likelihood * impact;
      }
    }

    // Increment version
    body.version = { increment: 1 };

    const data = serializeJsonFields(modelName, body);

    const updated = await model.update({
      where: { id: entityId },
      data,
    });
    await logAudit(ctx, "update", entityType, entityId);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string; entityType: string; entityId: string }> }
) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);
    const { caseId, entityType, entityId } = await params;
    await requireCaseAccess(caseId, ctx);

    const modelName = ENTITY_MAP[entityType];
    if (!modelName) return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });

    const model = getModel(modelName);
    await model.delete({ where: { id: entityId } });
    await logAudit(ctx, "delete", entityType, entityId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

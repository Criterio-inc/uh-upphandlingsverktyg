import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/id-generator";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

// Map URL segments to Prisma model names and ID generator keys
const ENTITY_MAP: Record<string, { model: string; idType: string }> = {
  stakeholders: { model: "stakeholder", idType: "stakeholder" },
  workshops: { model: "workshop", idType: "workshop" },
  evidence: { model: "evidence", idType: "evidence" },
  needs: { model: "need", idType: "need" },
  risks: { model: "risk", idType: "risk" },
  requirements: { model: "requirement", idType: "requirement" },
  criteria: { model: "criterion", idType: "criterion" },
  bids: { model: "bid", idType: "bid" },
  decisions: { model: "decision", idType: "decision" },
  documents: { model: "document", idType: "document" },
};

// JSON fields per entity type that need serialization
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
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string; entityType: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { caseId, entityType } = await params;
    await requireCaseAccess(caseId, ctx);

    const config = ENTITY_MAP[entityType];
    if (!config) return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });

    const model = getModel(config.model);
    const searchParams = req.nextUrl.searchParams;

    const where: Record<string, unknown> = { caseId };

    // Apply filters
    for (const [key, value] of searchParams.entries()) {
      if (key === "status" && value) where.status = value;
      if (key === "priority" && value) where.priority = value;
      if (key === "cluster" && value) where.cluster = value;
      if (key === "reqType" && value) where.reqType = value;
      if (key === "level" && value) where.level = value;
      if (key === "category" && value) where.category = value;
      if (key === "decisionType" && value) where.decisionType = value;
      if (key === "docType" && value) where.docType = value;
    }

    const items = await model.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string; entityType: string }> }
) {
  try {
    const ctx = await requireAuth();
    requireWriteAccess(ctx);
    const { caseId, entityType } = await params;
    await requireCaseAccess(caseId, ctx);

    const config = ENTITY_MAP[entityType];
    if (!config) return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });

    const body = await req.json();
    const id = await generateId(config.idType);
    const model = getModel(config.model);

    // Auto-calculate risk score
    if (config.model === "risk") {
      const likelihood = body.likelihood ?? 3;
      const impact = body.impact ?? 3;
      body.score = likelihood * impact;
    }

    const data = serializeJsonFields(config.model, {
      id,
      caseId,
      ...body,
    });

    const created = await model.create({ data });
    await logAudit(ctx, "create", entityType, id);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/id-generator";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";
import { validateBody, importCaseSchema } from "@/lib/api-validation";

/**
 * Import a full JSON backup into a case (restore).
 * Creates entities from the backup data, generating new IDs.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;

  try {
    const ctx = await requireAuth();
    await requireCaseAccess(caseId, ctx);
    await requireWriteAccess(ctx);

    const rawBody = await req.json();
    const v = validateBody(importCaseSchema, rawBody);
    if (!v.success) return v.response;
    const body = v.data;

    const c = await prisma.case.findUnique({ where: { id: caseId } });
    if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    const idMap = new Map<string, string>();
    let created = 0;

    // Helper to import a batch of entities
    async function importBatch(
      items: Record<string, unknown>[] | undefined,
      entityType: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: any,
      fields: string[]
    ) {
      if (!items || !Array.isArray(items)) return;
      for (const item of items) {
        const newId = await generateId(entityType);
        const oldId = item.id as string;
        idMap.set(oldId, newId);
        const data: Record<string, unknown> = { id: newId, caseId };
        for (const f of fields) {
          if (item[f] !== undefined) data[f] = item[f];
        }
        await model.create({ data });
        created++;
      }
    }

    await importBatch(body.needs, "need", prisma.need, [
      "title", "cluster", "statement", "asOutcome", "priority", "consequenceIfNotMet",
      "sources", "metrics", "owner", "status", "tags",
    ]);

    await importBatch(body.requirements, "requirement", prisma.requirement, [
      "title", "reqType", "cluster", "level", "text", "rationale",
      "linkedNeeds", "linkedRisks", "verification", "conflictPriority",
      "owner", "status", "tags",
    ]);

    await importBatch(body.risks, "risk", prisma.risk, [
      "title", "category", "description", "likelihood", "impact", "score",
      "mitigation", "riskOwner", "relatedNeeds", "relatedRequirements",
      "owner", "status", "tags",
    ]);

    await importBatch(body.criteria, "criterion", prisma.criterion, [
      "title", "weight", "scale", "anchors", "evidenceRequired",
      "scoringGuidance", "linkedRequirements", "owner", "status", "tags",
    ]);

    await importBatch(body.stakeholders, "stakeholder", prisma.stakeholder, [
      "title", "role", "unit", "influence", "interest",
      "engagementStrategy", "contact", "owner", "status", "tags",
    ]);

    await importBatch(body.workshops, "workshop", prisma.workshop, [
      "title", "date", "participants", "agenda", "notes", "outputs",
      "owner", "status", "tags",
    ]);

    await importBatch(body.evidence, "evidence", prisma.evidence, [
      "title", "type", "source", "uri", "summary", "fileName",
      "owner", "status", "tags",
    ]);

    await importBatch(body.bids, "bid", prisma.bid, [
      "title", "supplierName", "receivedAt", "qualified", "qualificationNotes",
      "owner", "status", "tags",
    ]);

    await importBatch(body.decisions, "decision", prisma.decision, [
      "title", "decisionType", "alternatives", "chosen", "rationale",
      "impactsCompetition", "attachments", "owner", "status", "tags",
    ]);

    await importBatch(body.documents, "document", prisma.document, [
      "title", "docType", "format", "description", "generatedFrom", "fileName",
      "owner", "status", "tags",
    ]);

    // Import trace links with mapped IDs
    if (body.traceLinks && Array.isArray(body.traceLinks)) {
      for (const tl of body.traceLinks) {
        const fromId = idMap.get(tl.fromId as string) ?? (tl.fromId as string);
        const toId = idMap.get(tl.toId as string) ?? (tl.toId as string);
        await prisma.traceLink.create({
          data: {
            caseId,
            fromType: tl.fromType,
            fromId,
            toType: tl.toType,
            toId,
            relation: tl.relation,
            note: tl.note ?? "",
          },
        });
        created++;
      }
    }

    await logAudit(ctx, "import", "case", caseId);

    return NextResponse.json({ created, idMappings: Object.fromEntries(idMap) });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

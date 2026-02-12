import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/id-generator";

/**
 * Import a library item into a case.
 * Creates entities from the library item's content template.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { libraryItemId, caseId } = body;

  if (!libraryItemId || !caseId) {
    return NextResponse.json({ error: "libraryItemId and caseId required" }, { status: 400 });
  }

  const item = await prisma.libraryItem.findUnique({ where: { id: libraryItemId } });
  if (!item) return NextResponse.json({ error: "Library item not found" }, { status: 404 });

  const content = JSON.parse(item.content);
  const created: string[] = [];

  if (item.type === "requirement_block" && content.requirements) {
    for (const tmpl of content.requirements) {
      const id = await generateId("requirement");
      await prisma.requirement.create({
        data: {
          id,
          caseId,
          title: tmpl.title,
          reqType: tmpl.reqType ?? "funktion",
          level: tmpl.level ?? "BOR",
          text: tmpl.text ?? "",
          rationale: tmpl.rationale ?? "",
          cluster: tmpl.cluster ?? item.cluster ?? "",
          verification: JSON.stringify(tmpl.verification ?? {}),
          tags: JSON.stringify([`importerat:${item.title}`]),
        },
      });
      created.push(id);
    }
  }

  if (item.type === "risk_template" && content.risk) {
    const tmpl = content.risk;
    const id = await generateId("risk");
    const likelihood = tmpl.likelihood ?? 3;
    const impact = tmpl.impact ?? 3;
    await prisma.risk.create({
      data: {
        id,
        caseId,
        title: tmpl.title,
        category: tmpl.category ?? "verksamhet",
        description: tmpl.description ?? "",
        likelihood,
        impact,
        score: likelihood * impact,
        mitigation: tmpl.mitigation ?? "",
        tags: JSON.stringify([`importerat:${item.title}`]),
      },
    });
    created.push(id);
  }

  if (item.type === "workshop_template" && content.workshop) {
    const tmpl = content.workshop;
    const id = await generateId("workshop");
    await prisma.workshop.create({
      data: {
        id,
        caseId,
        title: tmpl.title,
        participants: JSON.stringify(tmpl.suggestedParticipants ?? []),
        agenda: JSON.stringify(tmpl.agenda ?? []),
        notes: tmpl.description ?? "",
        tags: JSON.stringify([`importerat:${item.title}`]),
      },
    });
    created.push(id);
  }

  if (item.type === "criteria_block" && content.criteria) {
    for (const tmpl of content.criteria) {
      const id = await generateId("criterion");
      await prisma.criterion.create({
        data: {
          id,
          caseId,
          title: tmpl.title,
          weight: tmpl.weight ?? 0,
          scale: tmpl.scale ?? "0-5",
          scoringGuidance: tmpl.scoringGuidance ?? "",
          anchors: JSON.stringify(tmpl.anchors ?? {}),
          linkedRequirements: JSON.stringify([]),
          tags: JSON.stringify([`importerat:${item.title}`]),
        },
      });
      created.push(id);
    }
  }

  if (item.type === "contract_clause" && content.clause) {
    const tmpl = content.clause;
    const id = await generateId("requirement");
    await prisma.requirement.create({
      data: {
        id,
        caseId,
        title: tmpl.title,
        reqType: "kontraktsvillkor",
        level: tmpl.level ?? "SKA",
        text: tmpl.text ?? "",
        rationale: tmpl.rationale ?? "",
        cluster: tmpl.cluster ?? "Kontraktsvillkor",
        verification: JSON.stringify({}),
        tags: JSON.stringify([`importerat:${item.title}`, "kontraktsvillkor"]),
      },
    });
    created.push(id);
  }

  // Link library item to case
  await prisma.libraryItem.update({
    where: { id: libraryItemId },
    data: { caseId },
  });

  return NextResponse.json({ created, count: created.length });
}

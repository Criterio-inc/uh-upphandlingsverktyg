import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;

  const [needs, requirements, risks, criteria, scores, bidResponses] = await Promise.all([
    prisma.need.findMany({ where: { caseId }, select: { id: true, title: true, cluster: true, priority: true } }),
    prisma.requirement.findMany({ where: { caseId }, select: { id: true, title: true, level: true, linkedNeeds: true, linkedRisks: true } }),
    prisma.risk.findMany({ where: { caseId }, select: { id: true, title: true, score: true, mitigation: true, relatedRequirements: true } }),
    prisma.criterion.findMany({ where: { caseId }, select: { id: true, title: true, weight: true, linkedRequirements: true } }),
    prisma.score.findMany({ where: { caseId }, select: { criterionId: true, bidId: true } }),
    prisma.bidResponse.findMany({ where: { caseId }, select: { requirementId: true, bidId: true } }),
  ]);

  // Parse JSON links
  function parseArr(val: string): string[] {
    try { const a = JSON.parse(val); return Array.isArray(a) ? a : []; }
    catch { return []; }
  }

  // Build reverse maps
  const reqLinkedNeedIds = new Set<string>();
  const reqLinkedRiskIds = new Set<string>();
  for (const r of requirements) {
    for (const id of parseArr(r.linkedNeeds)) reqLinkedNeedIds.add(id);
    for (const id of parseArr(r.linkedRisks)) reqLinkedRiskIds.add(id);
  }

  const critLinkedReqIds = new Set<string>();
  for (const c of criteria) {
    for (const id of parseArr(c.linkedRequirements)) critLinkedReqIds.add(id);
  }

  const scoredCritIds = new Set(scores.map(s => s.criterionId));
  const respondedReqIds = new Set(bidResponses.map(r => r.requirementId));

  // Coverage metrics
  const needsWithReqs = needs.filter(n => reqLinkedNeedIds.has(n.id));
  const reqsWithCriteria = requirements.filter(r => critLinkedReqIds.has(r.id));
  const criteriaWithScores = criteria.filter(c => scoredCritIds.has(c.id));
  const risksWithMitigation = risks.filter(r => r.mitigation && r.mitigation.trim().length > 0);

  // Orphans
  const orphanNeeds = needs.filter(n => !reqLinkedNeedIds.has(n.id));
  const orphanRequirements = requirements.filter(r => !critLinkedReqIds.has(r.id) && r.level === "BOR");
  const orphanRisks = risks.filter(r => {
    const linked = parseArr(r.relatedRequirements);
    return linked.length === 0 && r.score >= 12;
  });

  // Chains: for each need, trace through to criteria/scores
  const chains = needs.map(n => {
    const linkedReqs = requirements.filter(r => parseArr(r.linkedNeeds).includes(n.id));
    const linkedCriteria: string[] = [];
    for (const r of linkedReqs) {
      for (const c of criteria) {
        if (parseArr(c.linkedRequirements).includes(r.id)) {
          if (!linkedCriteria.includes(c.id)) linkedCriteria.push(c.id);
        }
      }
    }
    return {
      needId: n.id,
      needTitle: n.title,
      needPriority: n.priority,
      requirementIds: linkedReqs.map(r => r.id),
      criterionIds: linkedCriteria,
      complete: linkedReqs.length > 0 && linkedCriteria.length > 0,
    };
  });

  return NextResponse.json({
    coverage: {
      needsWithReqs: { count: needsWithReqs.length, total: needs.length },
      reqsWithCriteria: { count: reqsWithCriteria.length, total: requirements.filter(r => r.level === "BOR").length },
      criteriaWithScores: { count: criteriaWithScores.length, total: criteria.length },
      risksWithMitigation: { count: risksWithMitigation.length, total: risks.length },
    },
    orphans: {
      needs: orphanNeeds,
      requirements: orphanRequirements,
      risks: orphanRisks,
    },
    chains,
  });
}

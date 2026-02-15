import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

type NeedRow = { id: string; title: string; cluster: string; priority: string };
type RequirementRow = { id: string; title: string; level: string; linkedNeeds: string; linkedRisks: string };
type RiskRow = { id: string; title: string; score: number; mitigation: string; relatedRequirements: string };
type CriterionRow = { id: string; title: string; weight: number; linkedRequirements: string };
type ScoreRow = { criterionId: string; bidId: string };
type BidResponseRow = { requirementId: string; bidId: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;

  try {
    const ctx = await requireAuth();
    await requireCaseAccess(caseId, ctx);

    const [needs, requirements, risks, criteria, scores, bidResponses] = await Promise.all([
      prisma.need.findMany({ where: { caseId }, select: { id: true, title: true, cluster: true, priority: true } }),
      prisma.requirement.findMany({ where: { caseId }, select: { id: true, title: true, level: true, linkedNeeds: true, linkedRisks: true } }),
      prisma.risk.findMany({ where: { caseId }, select: { id: true, title: true, score: true, mitigation: true, relatedRequirements: true } }),
      prisma.criterion.findMany({ where: { caseId }, select: { id: true, title: true, weight: true, linkedRequirements: true } }),
      prisma.score.findMany({ where: { caseId }, select: { criterionId: true, bidId: true } }),
      prisma.bidResponse.findMany({ where: { caseId }, select: { requirementId: true, bidId: true } }),
    ]) as [NeedRow[], RequirementRow[], RiskRow[], CriterionRow[], ScoreRow[], BidResponseRow[]];

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

    const scoredCritIds = new Set(scores.map((s: ScoreRow) => s.criterionId));
    const respondedReqIds = new Set(bidResponses.map((r: BidResponseRow) => r.requirementId));

    // Coverage metrics
    const needsWithReqs = needs.filter((n: NeedRow) => reqLinkedNeedIds.has(n.id));
    const reqsWithCriteria = requirements.filter((r: RequirementRow) => critLinkedReqIds.has(r.id));
    const criteriaWithScores = criteria.filter((c: CriterionRow) => scoredCritIds.has(c.id));
    const risksWithMitigation = risks.filter((r: RiskRow) => r.mitigation && r.mitigation.trim().length > 0);

    // Orphans
    const orphanNeeds = needs.filter((n: NeedRow) => !reqLinkedNeedIds.has(n.id));
    const orphanRequirements = requirements.filter((r: RequirementRow) => !critLinkedReqIds.has(r.id) && r.level === "BOR");
    const orphanRisks = risks.filter((r: RiskRow) => {
      const linked = parseArr(r.relatedRequirements);
      return linked.length === 0 && r.score >= 12;
    });

    // Chains: for each need, trace through to criteria/scores
    const chains = needs.map((n: NeedRow) => {
      const linkedReqs = requirements.filter((r: RequirementRow) => parseArr(r.linkedNeeds).includes(n.id));
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
        requirementIds: linkedReqs.map((r: RequirementRow) => r.id),
        criterionIds: linkedCriteria,
        complete: linkedReqs.length > 0 && linkedCriteria.length > 0,
      };
    });

    return NextResponse.json({
      coverage: {
        needsWithReqs: { count: needsWithReqs.length, total: needs.length },
        reqsWithCriteria: { count: reqsWithCriteria.length, total: requirements.filter((r: RequirementRow) => r.level === "BOR").length },
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
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

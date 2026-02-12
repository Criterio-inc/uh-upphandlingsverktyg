import { prisma } from "./db";
import type { GateResult, GateRule } from "@/types/workflow";

/**
 * Evaluate a single gate rule against the database for a given case.
 */
async function evaluateRule(rule: string, caseId: string): Promise<{ passed: boolean; actual?: number | string }> {
  // Parse rule string format: "entity.condition"
  // Examples: "needs.count>=5", "case.goals>=1", "criteria.sumWeight=100"

  // ===================== CASE RULES =====================

  // case.goals>=1
  if (rule === "case.goals>=1") {
    const c = await prisma.case.findUnique({ where: { id: caseId }, select: { goals: true } });
    const goals = c ? JSON.parse(c.goals) : [];
    const count = goals.length;
    return { passed: count >= 1, actual: count };
  }

  // case.governance.steeringGroupDefined
  if (rule === "case.governance.steeringGroupDefined") {
    const c = await prisma.case.findUnique({ where: { id: caseId }, select: { governance: true } });
    const gov = c ? JSON.parse(c.governance) : {};
    const steeringGroup = gov.steeringGroup ?? [];
    return { passed: Array.isArray(steeringGroup) && steeringGroup.length > 0, actual: steeringGroup.length };
  }

  // ===================== STAKEHOLDER RULES =====================

  // stakeholders.count>=N
  const stakeholderMatch = rule.match(/^stakeholders\.count>=(\d+)$/);
  if (stakeholderMatch) {
    const threshold = parseInt(stakeholderMatch[1]);
    const count = await prisma.stakeholder.count({ where: { caseId } });
    return { passed: count >= threshold, actual: count };
  }

  // stakeholders.hasHighInfluence
  if (rule === "stakeholders.hasHighInfluence") {
    const highInfluence = await prisma.stakeholder.count({
      where: { caseId, influence: { gte: 4 } },
    });
    return { passed: highInfluence > 0, actual: highInfluence };
  }

  // ===================== RISK RULES =====================

  // risks.count>=N
  const riskCountMatch = rule.match(/^risks\.count>=(\d+)$/);
  if (riskCountMatch) {
    const threshold = parseInt(riskCountMatch[1]);
    const count = await prisma.risk.count({ where: { caseId } });
    return { passed: count >= threshold, actual: count };
  }

  // risks.hasCategory(category)
  const riskCatMatch = rule.match(/^risks\.hasCategory\((\w+)\)$/);
  if (riskCatMatch) {
    const category = riskCatMatch[1];
    const count = await prisma.risk.count({ where: { caseId, category } });
    return { passed: count > 0, actual: count };
  }

  // risks.dataExitLinkedToRequirement
  if (rule === "risks.dataExitLinkedToRequirement") {
    const dataExitRisks = await prisma.risk.findMany({
      where: { caseId, category: "data_exit" },
      select: { relatedRequirements: true },
    });
    const allLinked = dataExitRisks.every((r) => {
      const reqs = JSON.parse(r.relatedRequirements);
      return Array.isArray(reqs) && reqs.length > 0;
    });
    return { passed: dataExitRisks.length === 0 || allLinked };
  }

  // ===================== NEED RULES =====================

  // needs.count>=N
  const needCountMatch = rule.match(/^needs\.count>=(\d+)$/);
  if (needCountMatch) {
    const threshold = parseInt(needCountMatch[1]);
    const count = await prisma.need.count({ where: { caseId } });
    return { passed: count >= threshold, actual: count };
  }

  // needs.allHaveSources
  if (rule === "needs.allHaveSources") {
    const needs = await prisma.need.findMany({ where: { caseId }, select: { sources: true } });
    const withSources = needs.filter(n => {
      const s = JSON.parse(n.sources); return Array.isArray(s) && s.length > 0;
    });
    return { passed: needs.length === 0 || withSources.length === needs.length, actual: withSources.length };
  }

  // needs.allP1HaveConsequences
  if (rule === "needs.allP1HaveConsequences") {
    const p1Needs = await prisma.need.findMany({
      where: { caseId, priority: "P1" },
      select: { consequenceIfNotMet: true },
    });
    const withConseq = p1Needs.filter(n => n.consequenceIfNotMet && n.consequenceIfNotMet.trim().length > 0);
    return { passed: p1Needs.length === 0 || withConseq.length === p1Needs.length, actual: withConseq.length };
  }

  // needs.distinctClusters>=N
  const clusterMatch = rule.match(/^needs\.distinctClusters>=(\d+)$/);
  if (clusterMatch) {
    const threshold = parseInt(clusterMatch[1]);
    const needs = await prisma.need.findMany({ where: { caseId }, select: { cluster: true } });
    const distinct = new Set(needs.map((n) => n.cluster).filter(Boolean));
    return { passed: distinct.size >= threshold, actual: distinct.size };
  }

  // ===================== REQUIREMENT RULES =====================

  // requirements.count>=N
  const reqCountMatch = rule.match(/^requirements\.count>=(\d+)$/);
  if (reqCountMatch) {
    const threshold = parseInt(reqCountMatch[1]);
    const count = await prisma.requirement.count({ where: { caseId } });
    return { passed: count >= threshold, actual: count };
  }

  // requirements.allLinkedToNeeds
  if (rule === "requirements.allLinkedToNeeds") {
    const reqs = await prisma.requirement.findMany({ where: { caseId }, select: { linkedNeeds: true } });
    const allLinked = reqs.every((r) => {
      const linked = JSON.parse(r.linkedNeeds);
      return Array.isArray(linked) && linked.length > 0;
    });
    return { passed: reqs.length === 0 || allLinked };
  }

  // requirements.SKA.allHaveBidEvidence
  if (rule === "requirements.SKA.allHaveBidEvidence") {
    const skaReqs = await prisma.requirement.findMany({
      where: { caseId, level: "SKA" },
      select: { verification: true },
    });
    const allHave = skaReqs.every((r) => {
      const v = JSON.parse(r.verification);
      return v && v.bidEvidence;
    });
    return { passed: skaReqs.length === 0 || allHave };
  }

  // ===================== CRITERIA RULES =====================

  // criteria.count>=N
  const critCountMatch = rule.match(/^criteria\.count>=(\d+)$/);
  if (critCountMatch) {
    const threshold = parseInt(critCountMatch[1]);
    const count = await prisma.criterion.count({ where: { caseId } });
    return { passed: count >= threshold, actual: count };
  }

  // criteria.sumWeight=100
  if (rule === "criteria.sumWeight=100") {
    const criteria = await prisma.criterion.findMany({ where: { caseId }, select: { weight: true } });
    const sum = criteria.reduce((acc, c) => acc + c.weight, 0);
    return { passed: Math.abs(sum - 100) < 0.01, actual: sum };
  }

  // criteria.allHaveAnchors
  if (rule === "criteria.allHaveAnchors") {
    const criteria = await prisma.criterion.findMany({ where: { caseId }, select: { anchors: true } });
    const withAnchors = criteria.filter(c => {
      try {
        const a = JSON.parse(c.anchors);
        if (Array.isArray(a)) return a.length > 0;
        if (typeof a === "object" && a !== null) return Object.keys(a).length > 0;
        return false;
      } catch { return false; }
    });
    return { passed: criteria.length === 0 || withAnchors.length === criteria.length, actual: withAnchors.length };
  }

  // criteria.allLinkedToRequirements
  if (rule === "criteria.allLinkedToRequirements") {
    const criteria = await prisma.criterion.findMany({ where: { caseId }, select: { linkedRequirements: true } });
    const allLinked = criteria.every(c => {
      const linked = JSON.parse(c.linkedRequirements);
      return Array.isArray(linked) && linked.length > 0;
    });
    return { passed: criteria.length === 0 || allLinked };
  }

  // ===================== BID RULES =====================

  // bids.count>=N
  const bidCountMatch = rule.match(/^bids\.count>=(\d+)$/);
  if (bidCountMatch) {
    const threshold = parseInt(bidCountMatch[1]);
    const count = await prisma.bid.count({ where: { caseId } });
    return { passed: count >= threshold, actual: count };
  }

  // bids.allReviewed — all bids have been qualified or explicitly set to not draft
  if (rule === "bids.allReviewed") {
    const bids = await prisma.bid.findMany({ where: { caseId }, select: { status: true, qualified: true, qualificationNotes: true } });
    // A bid is "reviewed" if it's qualified=true, OR if qualificationNotes is non-empty (actively rejected)
    const reviewed = bids.filter(b => b.qualified || (b.qualificationNotes && b.qualificationNotes.trim().length > 0));
    return { passed: bids.length === 0 || reviewed.length === bids.length, actual: reviewed.length };
  }

  // ===================== BID RESPONSE RULES =====================

  // bidResponses.allComplete — all requirements answered for all qualified bids
  if (rule === "bidResponses.allComplete") {
    const qualifiedBids = await prisma.bid.findMany({ where: { caseId, qualified: true }, select: { id: true } });
    if (qualifiedBids.length === 0) return { passed: true, actual: 0 };
    const reqCount = await prisma.requirement.count({ where: { caseId } });
    if (reqCount === 0) return { passed: true, actual: 0 };
    const responseCount = await prisma.bidResponse.count({ where: { caseId } });
    const expected = qualifiedBids.length * reqCount;
    return { passed: responseCount >= expected, actual: `${responseCount}/${expected}` };
  }

  // ===================== SCORE RULES =====================

  // scores.allComplete — all criteria scored for all qualified bids
  if (rule === "scores.allComplete") {
    const qualifiedBids = await prisma.bid.findMany({ where: { caseId, qualified: true }, select: { id: true } });
    if (qualifiedBids.length === 0) return { passed: true, actual: 0 };
    const critCount = await prisma.criterion.count({ where: { caseId } });
    if (critCount === 0) return { passed: true, actual: 0 };
    const scoreCount = await prisma.score.count({ where: { caseId } });
    const expected = qualifiedBids.length * critCount;
    return { passed: scoreCount >= expected, actual: `${scoreCount}/${expected}` };
  }

  // scores.allHaveJustification
  if (rule === "scores.allHaveJustification") {
    const allScores = await prisma.score.findMany({ where: { caseId }, select: { justification: true } });
    const withJust = allScores.filter(s => s.justification && s.justification.trim().length > 0);
    return { passed: allScores.length === 0 || withJust.length === allScores.length, actual: withJust.length };
  }

  // ===================== EVIDENCE RULES =====================

  // evidence.count>=N
  const evidenceCountMatch = rule.match(/^evidence\.count>=(\d+)$/);
  if (evidenceCountMatch) {
    const threshold = parseInt(evidenceCountMatch[1]);
    const count = await prisma.evidence.count({ where: { caseId } });
    return { passed: count >= threshold, actual: count };
  }

  // evidence.typeExists(type)
  const evidenceTypeMatch = rule.match(/^evidence\.typeExists\((\w+)\)$/);
  if (evidenceTypeMatch) {
    const type = evidenceTypeMatch[1];
    const count = await prisma.evidence.count({ where: { caseId, type } });
    return { passed: count > 0, actual: count };
  }

  // ===================== DECISION RULES =====================

  // decisions.has(type)
  const decisionMatch = rule.match(/^decisions\.has\((\w+)\)$/);
  if (decisionMatch) {
    const decisionType = decisionMatch[1];
    const count = await prisma.decision.count({ where: { caseId, decisionType } });
    return { passed: count > 0, actual: count };
  }

  // ===================== DOCUMENT RULES =====================

  // documents.hasType(type)
  const docTypeMatch = rule.match(/^documents\.hasType\((\w+)\)$/);
  if (docTypeMatch) {
    const docType = docTypeMatch[1];
    const count = await prisma.document.count({ where: { caseId, docType } });
    return { passed: count > 0, actual: count };
  }

  // Unknown rule - pass by default
  return { passed: true };
}

/**
 * Evaluate all gates for a given phase and case.
 */
export async function evaluateGates(
  gates: GateRule[],
  caseId: string
): Promise<GateResult[]> {
  const results: GateResult[] = [];

  for (const gate of gates) {
    const { passed, actual } = await evaluateRule(gate.rule, caseId);
    results.push({
      ruleId: gate.id,
      label: gate.label,
      passed,
      severity: gate.severity,
      actual,
      helpText: gate.helpText,
    });
  }

  return results;
}

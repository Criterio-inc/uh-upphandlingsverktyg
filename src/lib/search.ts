import { prisma } from "./db";
import type { SearchResult } from "@/types/api";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Scored global search across all entity types for a case.
 * Supports fuzzy matching, field-specific scoring, and smart queries.
 */
export async function searchEntities(caseId: string, query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  // Check for smart queries first
  const smartResults = await handleSmartQuery(caseId, query);
  if (smartResults) return smartResults;

  const scored: (SearchResult & { score: number })[] = [];
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  // Helper: score a text against the query
  function scoreMatch(text: string | null, fieldWeight: number): { score: number; snippet: string } {
    if (!text) return { score: 0, snippet: "" };
    const lower = text.toLowerCase();

    // Exact match in field
    if (lower === q) return { score: 100 * fieldWeight, snippet: text };
    // Starts with query
    if (lower.startsWith(q)) return { score: 90 * fieldWeight, snippet: text };
    // Contains exact query
    if (lower.includes(q)) return { score: 80 * fieldWeight, snippet: extractSnippet(text, q) };
    // All tokens match (fuzzy AND)
    if (tokens.length > 1 && tokens.every((t) => lower.includes(t))) {
      return { score: 60 * fieldWeight, snippet: extractSnippet(text, tokens[0]) };
    }
    // Any token matches (fuzzy OR)
    const matchingTokens = tokens.filter((t) => lower.includes(t));
    if (matchingTokens.length > 0) {
      const ratio = matchingTokens.length / tokens.length;
      return { score: 30 * ratio * fieldWeight, snippet: extractSnippet(text, matchingTokens[0]) };
    }
    // Fuzzy: Levenshtein-like for short queries
    if (q.length <= 8 && fuzzyMatch(lower, q)) {
      return { score: 15 * fieldWeight, snippet: text.slice(0, 80) };
    }
    return { score: 0, snippet: "" };
  }

  // Search needs
  const needs = await prisma.need.findMany({
    where: { caseId },
    select: { id: true, title: true, statement: true, cluster: true, priority: true, consequenceIfNotMet: true, sources: true },
  });
  for (const n of needs) {
    const titleScore = scoreMatch(n.title, 1.0);
    const stmtScore = scoreMatch(n.statement, 0.7);
    const clusterScore = scoreMatch(n.cluster, 0.5);
    const conseqScore = scoreMatch(n.consequenceIfNotMet, 0.5);
    const sourcesScore = scoreMatch(n.sources, 0.3);
    const best = [titleScore, stmtScore, clusterScore, conseqScore, sourcesScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: n.id, entityType: "need", caseId, title: n.title,
        matchField: best === titleScore ? "title" : best === stmtScore ? "statement" : "cluster",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search requirements
  const reqs = await prisma.requirement.findMany({
    where: { caseId },
    select: { id: true, title: true, text: true, cluster: true, rationale: true, reqType: true, level: true },
  });
  for (const r of reqs) {
    const titleScore = scoreMatch(r.title, 1.0);
    const textScore = scoreMatch(r.text, 0.7);
    const clusterScore = scoreMatch(r.cluster, 0.5);
    const rationaleScore = scoreMatch(r.rationale, 0.4);
    const typeScore = scoreMatch(r.reqType, 0.3);
    const best = [titleScore, textScore, clusterScore, rationaleScore, typeScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: r.id, entityType: "requirement", caseId, title: r.title,
        matchField: best === titleScore ? "title" : best === textScore ? "text" : "cluster",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search risks
  const risks = await prisma.risk.findMany({
    where: { caseId },
    select: { id: true, title: true, description: true, mitigation: true, category: true },
  });
  for (const r of risks) {
    const titleScore = scoreMatch(r.title, 1.0);
    const descScore = scoreMatch(r.description, 0.7);
    const mitigScore = scoreMatch(r.mitigation, 0.5);
    const catScore = scoreMatch(r.category, 0.4);
    const best = [titleScore, descScore, mitigScore, catScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: r.id, entityType: "risk", caseId, title: r.title,
        matchField: best === titleScore ? "title" : best === descScore ? "description" : "mitigation",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search criteria
  const criteria = await prisma.criterion.findMany({
    where: { caseId },
    select: { id: true, title: true, scoringGuidance: true },
  });
  for (const c of criteria) {
    const titleScore = scoreMatch(c.title, 1.0);
    const guidanceScore = scoreMatch(c.scoringGuidance, 0.6);
    const best = [titleScore, guidanceScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: c.id, entityType: "criterion", caseId, title: c.title,
        matchField: best === titleScore ? "title" : "scoringGuidance",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search stakeholders
  const stakeholders = await prisma.stakeholder.findMany({
    where: { caseId },
    select: { id: true, title: true, role: true, unit: true, engagementStrategy: true },
  });
  for (const s of stakeholders) {
    const titleScore = scoreMatch(s.title, 1.0);
    const roleScore = scoreMatch(s.role, 0.7);
    const unitScore = scoreMatch(s.unit, 0.5);
    const stratScore = scoreMatch(s.engagementStrategy, 0.3);
    const best = [titleScore, roleScore, unitScore, stratScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: s.id, entityType: "stakeholder", caseId, title: s.title,
        matchField: best === titleScore ? "title" : best === roleScore ? "role" : "unit",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search workshops
  const workshops = await prisma.workshop.findMany({
    where: { caseId },
    select: { id: true, title: true, notes: true, participants: true },
  });
  for (const w of workshops) {
    const titleScore = scoreMatch(w.title, 1.0);
    const notesScore = scoreMatch(w.notes, 0.6);
    const partScore = scoreMatch(w.participants, 0.4);
    const best = [titleScore, notesScore, partScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: w.id, entityType: "workshop", caseId, title: w.title,
        matchField: best === titleScore ? "title" : best === notesScore ? "notes" : "participants",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search bids
  const bids = await prisma.bid.findMany({
    where: { caseId },
    select: { id: true, title: true, supplierName: true, qualificationNotes: true },
  });
  for (const b of bids) {
    const titleScore = scoreMatch(b.title, 1.0);
    const supplierScore = scoreMatch(b.supplierName, 0.8);
    const notesScore = scoreMatch(b.qualificationNotes, 0.5);
    const best = [titleScore, supplierScore, notesScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: b.id, entityType: "bid", caseId, title: b.title,
        matchField: best === titleScore ? "title" : best === supplierScore ? "supplierName" : "qualificationNotes",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search decisions
  const decisions = await prisma.decision.findMany({
    where: { caseId },
    select: { id: true, title: true, rationale: true },
  });
  for (const d of decisions) {
    const titleScore = scoreMatch(d.title, 1.0);
    const rationaleScore = scoreMatch(d.rationale, 0.6);
    const best = [titleScore, rationaleScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: d.id, entityType: "decision", caseId, title: d.title,
        matchField: best === titleScore ? "title" : "rationale",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search documents
  const docs = await prisma.document.findMany({
    where: { caseId },
    select: { id: true, title: true, description: true, docType: true },
  });
  for (const d of docs) {
    const titleScore = scoreMatch(d.title, 1.0);
    const descScore = scoreMatch(d.description, 0.6);
    const typeScore = scoreMatch(d.docType, 0.4);
    const best = [titleScore, descScore, typeScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: d.id, entityType: "document", caseId, title: d.title,
        matchField: best === titleScore ? "title" : best === descScore ? "description" : "docType",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Search evidence
  const evidences = await prisma.evidence.findMany({
    where: { caseId },
    select: { id: true, title: true, source: true, type: true },
  });
  for (const e of evidences) {
    const titleScore = scoreMatch(e.title, 1.0);
    const sourceScore = scoreMatch(e.source, 0.6);
    const typeScore = scoreMatch(e.type, 0.4);
    const best = [titleScore, sourceScore, typeScore].sort((a, b) => b.score - a.score)[0];
    if (best.score > 0) {
      scored.push({
        id: e.id, entityType: "evidence", caseId, title: e.title,
        matchField: best === titleScore ? "title" : best === sourceScore ? "source" : "type",
        matchSnippet: best.snippet,
        score: best.score,
      });
    }
  }

  // Sort by score descending, limit to 50
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map(({ score: _score, ...rest }) => rest);
}

/**
 * Handle "smart queries" — structured search patterns.
 */
async function handleSmartQuery(caseId: string, query: string): Promise<SearchResult[] | null> {
  const q = query.toLowerCase().trim();

  // "krav utan spårbarhet" — requirements not linked to any need
  if (q.includes("krav utan spårbarhet") || q.includes("krav utan koppling")) {
    const reqs: any[] = await prisma.requirement.findMany({ where: { caseId } });
    const links: any[] = await prisma.traceLink.findMany({ where: { caseId, toType: "requirement" } });
    const linked = new Set(links.map((l: any) => l.toId));
    return reqs
      .filter((r: any) => !linked.has(r.id))
      .map((r: any) => ({ id: r.id, entityType: "requirement", caseId, title: r.title, matchField: "smart", matchSnippet: "Inget spårat behov" }));
  }

  // "risker utan åtgärd" — risks without mitigation
  if (q.includes("risker utan åtgärd") || q.includes("risk utan åtgärd")) {
    const risks: any[] = await prisma.risk.findMany({ where: { caseId } });
    return risks
      .filter((r: any) => !r.mitigation || r.mitigation.trim().length === 0)
      .map((r: any) => ({ id: r.id, entityType: "risk", caseId, title: r.title, matchField: "smart", matchSnippet: "Ingen åtgärdsplan" }));
  }

  // "SKA utan verifiering" — SKA requirements without verification
  if (q.includes("ska utan verifiering") || q.includes("ska-krav utan verifiering")) {
    const reqs: any[] = await prisma.requirement.findMany({ where: { caseId, level: "SKA" } });
    return reqs
      .filter((r: any) => {
        try {
          const v = JSON.parse(r.verification || "{}");
          return !v.bidEvidence && !v.implementationProof && !v.opsFollowUp;
        } catch { return true; }
      })
      .map((r: any) => ({ id: r.id, entityType: "requirement", caseId, title: r.title, matchField: "smart", matchSnippet: "SKA-krav utan verifieringsplan" }));
  }

  // "behov utan krav" — needs not addressed by any requirement
  if (q.includes("behov utan krav") || q.includes("föräldralösa behov")) {
    const needs: any[] = await prisma.need.findMany({ where: { caseId } });
    const links: any[] = await prisma.traceLink.findMany({ where: { caseId, fromType: "need", toType: "requirement" } });
    const linked = new Set(links.map((l: any) => l.fromId));
    return needs
      .filter((n: any) => !linked.has(n.id))
      .map((n: any) => ({ id: n.id, entityType: "need", caseId, title: n.title, matchField: "smart", matchSnippet: "Inget kopplat krav" }));
  }

  // "höga risker" — risks with score >= 12
  if (q.includes("höga risker") || q.includes("kritiska risker")) {
    const risks: any[] = await prisma.risk.findMany({ where: { caseId } });
    return risks
      .filter((r: any) => r.score >= 12)
      .sort((a: any, b: any) => b.score - a.score)
      .map((r: any) => ({ id: r.id, entityType: "risk", caseId, title: r.title, matchField: "smart", matchSnippet: `Riskvärde: ${r.score}` }));
  }

  return null;
}

/**
 * Extract a snippet around the match location.
 */
function extractSnippet(text: string, match: string, maxLen = 80): string {
  const idx = text.toLowerCase().indexOf(match.toLowerCase());
  if (idx === -1) return text.slice(0, maxLen);
  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + match.length + 40);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return prefix + text.slice(start, end) + suffix;
}

/**
 * Simple fuzzy matching — allows 1-2 character differences for short strings.
 */
function fuzzyMatch(text: string, pattern: string): boolean {
  if (pattern.length <= 2) return false;
  // Check if pattern is a subsequence with at most 1 gap
  let pi = 0;
  let gaps = 0;
  for (let ti = 0; ti < text.length && pi < pattern.length; ti++) {
    if (text[ti] === pattern[pi]) {
      pi++;
    } else if (pi > 0 && gaps < 1) {
      gaps++;
    }
  }
  return pi >= pattern.length - 1; // allow missing last char
}

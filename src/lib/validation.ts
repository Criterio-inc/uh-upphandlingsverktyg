import { prisma } from "./db";

export interface ValidationWarning {
  entityType: string;
  entityId: string;
  entityTitle: string;
  field: string;
  message: string;
  severity: "warning" | "info";
}

/** High-level business insight for verksamhetsföreträdare */
export interface ValidationInsight {
  category: "coverage" | "quality" | "balance" | "readiness" | "tip";
  title: string;
  message: string;
  severity: "success" | "warning" | "info" | "error";
  /** Optional link to relevant page */
  action?: { label: string; href: string };
  /** Progress percentage (0-100) if applicable */
  progress?: number;
}

export interface ValidationResult {
  warnings: ValidationWarning[];
  insights: ValidationInsight[];
}

/**
 * Run soft validation rules on all entities in a case.
 * Returns warnings (not errors) - these are business rule suggestions.
 */
export async function validateCase(caseId: string): Promise<ValidationWarning[]> {
  const warnings: ValidationWarning[] = [];

  const [needs, requirements, risks, criteria, scores, bids, bidResponses, workshops, decisions, documents] = await Promise.all([
    prisma.need.findMany({ where: { caseId } }),
    prisma.requirement.findMany({ where: { caseId } }),
    prisma.risk.findMany({ where: { caseId } }),
    prisma.criterion.findMany({ where: { caseId } }),
    prisma.score.findMany({ where: { caseId } }),
    prisma.bid.findMany({ where: { caseId } }),
    prisma.bidResponse.findMany({ where: { caseId } }),
    prisma.workshop.findMany({ where: { caseId } }),
    prisma.decision.findMany({ where: { caseId } }),
    prisma.document.findMany({ where: { caseId } }),
  ]);

  // ===================== NEED VALIDATIONS =====================

  for (const n of needs) {
    const sources = parseJsonArr(n.sources);
    if (sources.length === 0) {
      warnings.push({
        entityType: "need", entityId: n.id, entityTitle: n.title,
        field: "sources", message: "Behov saknar källa (source)", severity: "warning",
      });
    }
    if (!n.consequenceIfNotMet) {
      warnings.push({
        entityType: "need", entityId: n.id, entityTitle: n.title,
        field: "consequenceIfNotMet", message: "Konsekvens om ej uppfyllt saknas", severity: "warning",
      });
    }
    const metrics = parseJsonArr(n.metrics);
    if (metrics.length === 0) {
      warnings.push({
        entityType: "need", entityId: n.id, entityTitle: n.title,
        field: "metrics", message: "Behov saknar mätbara indikatorer (metrics)", severity: "info",
      });
    }
  }

  // Orphan needs: needs without any linked requirement
  const reqLinkedNeedIds = new Set<string>();
  for (const r of requirements) {
    const linked = parseJsonArr(r.linkedNeeds);
    for (const id of linked) reqLinkedNeedIds.add(String(id));
  }
  for (const n of needs) {
    if (!reqLinkedNeedIds.has(n.id)) {
      warnings.push({
        entityType: "need", entityId: n.id, entityTitle: n.title,
        field: "traceability", message: "Föräldralöst behov — inget krav refererar till detta behov", severity: "warning",
      });
    }
  }

  // ===================== REQUIREMENT VALIDATIONS =====================

  for (const r of requirements) {
    const linked = parseJsonArr(r.linkedNeeds);
    if (linked.length === 0) {
      warnings.push({
        entityType: "requirement", entityId: r.id, entityTitle: r.title,
        field: "linkedNeeds", message: "Krav saknar koppling till behov", severity: "warning",
      });
    }

    if (!r.rationale || r.rationale.trim().length === 0) {
      warnings.push({
        entityType: "requirement", entityId: r.id, entityTitle: r.title,
        field: "rationale", message: "Krav saknar motivering (rationale)", severity: "warning",
      });
    }

    if (r.text && r.text.trim().length > 0 && r.text.trim().length < 20) {
      warnings.push({
        entityType: "requirement", entityId: r.id, entityTitle: r.title,
        field: "text", message: "Kravtext är mycket kort (<20 tecken) — kanske inte verifierbart", severity: "info",
      });
    }

    if (r.text && r.text.length > 500 && r.level === "SKA") {
      warnings.push({
        entityType: "requirement", entityId: r.id, entityTitle: r.title,
        field: "text", message: "SKA-krav med lång text (>500 tecken) — proportionalitetsrisk", severity: "info",
      });
    }

    if (r.level === "SKA") {
      const verif = parseJsonObj(r.verification);
      if (!verif.bidEvidence) {
        warnings.push({
          entityType: "requirement", entityId: r.id, entityTitle: r.title,
          field: "verification", message: "SKA-krav saknar bidEvidence i verifieringsplan", severity: "warning",
        });
      }
      if (!verif.opsFollowUp) {
        warnings.push({
          entityType: "requirement", entityId: r.id, entityTitle: r.title,
          field: "verification", message: "SKA-krav saknar opsFollowUp i verifieringsplan", severity: "info",
        });
      }
    }
  }

  // Orphan requirements: requirements not linked to any criterion
  const critLinkedReqIds = new Set<string>();
  for (const c of criteria) {
    const linked = parseJsonArr(c.linkedRequirements);
    for (const id of linked) critLinkedReqIds.add(String(id));
  }
  const borReqs = requirements.filter(r => r.level === "BOR");
  for (const r of borReqs) {
    if (!critLinkedReqIds.has(r.id)) {
      warnings.push({
        entityType: "requirement", entityId: r.id, entityTitle: r.title,
        field: "traceability", message: "BÖR-krav utan kopplat utvärderingskriterium — kommer inte utvärderas", severity: "warning",
      });
    }
  }

  // ===================== RISK VALIDATIONS =====================

  for (const r of risks) {
    if (r.category === "data_exit") {
      const linkedReqs = parseJsonArr(r.relatedRequirements);
      if (linkedReqs.length === 0) {
        warnings.push({
          entityType: "risk", entityId: r.id, entityTitle: r.title,
          field: "relatedRequirements", message: "Data & exit-risk saknar koppling till krav", severity: "warning",
        });
      }
    }

    // High risk without mitigation
    if (r.score >= 12 && (!r.mitigation || r.mitigation.trim().length === 0)) {
      warnings.push({
        entityType: "risk", entityId: r.id, entityTitle: r.title,
        field: "mitigation", message: `Hög risk (${r.score}) utan åtgärdsplan`, severity: "warning",
      });
    }

    // Very high risk without linked requirement
    if (r.score >= 16) {
      const linkedReqs = parseJsonArr(r.relatedRequirements);
      if (linkedReqs.length === 0) {
        warnings.push({
          entityType: "risk", entityId: r.id, entityTitle: r.title,
          field: "relatedRequirements", message: `Mycket hög risk (${r.score}) utan kopplat krav — överväg kravmässig riskreducering`, severity: "warning",
        });
      }
    }
  }

  // ===================== CRITERION VALIDATIONS =====================

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (criteria.length > 0 && totalWeight !== 100) {
    warnings.push({
      entityType: "criterion", entityId: "ALL", entityTitle: "Alla kriterier",
      field: "weight", message: `Total vikt = ${totalWeight}%, ska vara 100%`, severity: "warning",
    });
  }

  for (const c of criteria) {
    if (c.weight === 0) {
      warnings.push({
        entityType: "criterion", entityId: c.id, entityTitle: c.title,
        field: "weight", message: "Kriterium med vikt 0% — har ingen effekt på utvärderingen", severity: "warning",
      });
    }

    const linked = parseJsonArr(c.linkedRequirements);
    if (linked.length === 0 && !c.evidenceRequired) {
      warnings.push({
        entityType: "criterion", entityId: c.id, entityTitle: c.title,
        field: "linkedRequirements", message: "Kriterium saknar koppling till krav och evidenskrav", severity: "info",
      });
    }

    if (!c.scoringGuidance || c.scoringGuidance.trim().length === 0) {
      warnings.push({
        entityType: "criterion", entityId: c.id, entityTitle: c.title,
        field: "scoringGuidance", message: "Kriterium saknar bedömningsanvisning (scoring guidance)", severity: "warning",
      });
    }

    const anchors = parseJsonArr(c.anchors);
    const anchorsObj = parseJsonObj(c.anchors);
    const hasAnchors = anchors.length > 0 || Object.keys(anchorsObj).length > 0;
    if (!hasAnchors) {
      warnings.push({
        entityType: "criterion", entityId: c.id, entityTitle: c.title,
        field: "anchors", message: "Kriterium saknar poängankare — risk för inkonsekvent bedömning", severity: "info",
      });
    }
  }

  // ===================== SCORE VALIDATIONS =====================

  for (const s of scores) {
    if (!s.justification) {
      warnings.push({
        entityType: "score", entityId: s.id, entityTitle: `Score ${s.id}`,
        field: "justification", message: "Poäng saknar motivering", severity: "warning",
      });
    }
    if (!s.scorer) {
      warnings.push({
        entityType: "score", entityId: s.id, entityTitle: `Score ${s.id}`,
        field: "scorer", message: "Poäng saknar bedömare", severity: "warning",
      });
    }
  }

  // ===================== BID VALIDATIONS =====================

  for (const b of bids) {
    if (!b.qualified && (!b.qualificationNotes || b.qualificationNotes.trim().length === 0)) {
      warnings.push({
        entityType: "bid", entityId: b.id, entityTitle: b.title,
        field: "qualificationNotes", message: "Anbud ej kvalificerat utan anteckning — dokumentera kvalificeringsbeslut", severity: "warning",
      });
    }
  }

  // ===================== WORKSHOP VALIDATIONS =====================

  for (const w of workshops) {
    const outputs = parseJsonArr(w.outputs);
    if (outputs.length === 0) {
      warnings.push({
        entityType: "workshop", entityId: w.id, entityTitle: w.title,
        field: "outputs", message: "Workshop utan dokumenterade resultat (outputs)", severity: "info",
      });
    }
  }

  // ===================== DECISION VALIDATIONS =====================

  for (const d of decisions) {
    if (!d.rationale || d.rationale.trim().length === 0) {
      warnings.push({
        entityType: "decision", entityId: d.id, entityTitle: d.title,
        field: "rationale", message: "Beslut saknar motivering — obligatoriskt för alla upphandlingsbeslut", severity: "warning",
      });
    }
  }

  return warnings;
}

/**
 * Extended validation with business-level insights for verksamhetsföreträdare.
 * Adds ratio analysis, progress tracking, actionable recommendations.
 */
export async function validateCaseWithInsights(caseId: string): Promise<ValidationResult> {
  const warnings = await validateCase(caseId);
  const insights: ValidationInsight[] = [];

  const [needs, requirements, risks, criteria, stakeholders, workshops, evidence, documents] = await Promise.all([
    prisma.need.findMany({ where: { caseId } }),
    prisma.requirement.findMany({ where: { caseId } }),
    prisma.risk.findMany({ where: { caseId } }),
    prisma.criterion.findMany({ where: { caseId } }),
    prisma.stakeholder.findMany({ where: { caseId } }),
    prisma.workshop.findMany({ where: { caseId } }),
    prisma.evidence.findMany({ where: { caseId } }),
    prisma.document.findMany({ where: { caseId } }),
  ]);

  // ===================== COVERAGE ANALYSIS =====================

  // Need → Requirement coverage
  const reqLinkedNeedIds = new Set<string>();
  for (const r of requirements) {
    const linked = parseJsonArr(r.linkedNeeds);
    for (const id of linked) reqLinkedNeedIds.add(String(id));
  }
  const needsCoveredCount = needs.filter(n => reqLinkedNeedIds.has(n.id)).length;
  const needCoveragePercent = needs.length > 0 ? Math.round((needsCoveredCount / needs.length) * 100) : 0;

  if (needs.length > 0) {
    insights.push({
      category: "coverage",
      title: "Behov → Krav-täckning",
      message: `${needsCoveredCount} av ${needs.length} behov har minst ett kopplat krav.${
        needCoveragePercent < 100
          ? ` ${needs.length - needsCoveredCount} behov saknar krav — dessa riskerar att inte tillgodoses i upphandlingen.`
          : " Alla behov är kravtäckta!"
      }`,
      severity: needCoveragePercent === 100 ? "success" : needCoveragePercent >= 70 ? "warning" : "error",
      progress: needCoveragePercent,
      action: needCoveragePercent < 100 ? { label: "Visa behov", href: `/cases/${caseId}/needs` } : undefined,
    });
  }

  // Requirement → Criterion coverage (BÖR-krav)
  const critLinkedReqIds = new Set<string>();
  for (const c of criteria) {
    const linked = parseJsonArr(c.linkedRequirements);
    for (const id of linked) critLinkedReqIds.add(String(id));
  }
  const borReqs = requirements.filter(r => r.level === "BOR");
  const borCoveredCount = borReqs.filter(r => critLinkedReqIds.has(r.id)).length;
  const borCoveragePercent = borReqs.length > 0 ? Math.round((borCoveredCount / borReqs.length) * 100) : 0;

  if (borReqs.length > 0) {
    insights.push({
      category: "coverage",
      title: "BÖR-krav → Kriterium-täckning",
      message: `${borCoveredCount} av ${borReqs.length} BÖR-krav har kopplat utvärderingskriterium.${
        borCoveragePercent < 100
          ? ` BÖR-krav utan kriterium kommer inte utvärderas — de är i praktiken verkningslösa.`
          : ""
      }`,
      severity: borCoveragePercent === 100 ? "success" : borCoveragePercent >= 50 ? "warning" : "error",
      progress: borCoveragePercent,
      action: borCoveragePercent < 100 ? { label: "Visa kriterier", href: `/cases/${caseId}/criteria` } : undefined,
    });
  }

  // Risk coverage — risks with mitigation
  const risksWithMitigation = risks.filter(r => r.mitigation && r.mitigation.trim().length > 0).length;
  const riskMitigationPercent = risks.length > 0 ? Math.round((risksWithMitigation / risks.length) * 100) : 0;

  if (risks.length > 0) {
    insights.push({
      category: "coverage",
      title: "Riskåtgärder",
      message: `${risksWithMitigation} av ${risks.length} risker har åtgärdsplan.${
        riskMitigationPercent < 100
          ? ` Obehandlade risker kan leda till överraskningar under genomförande.`
          : " Alla risker har dokumenterade åtgärder!"
      }`,
      severity: riskMitigationPercent === 100 ? "success" : riskMitigationPercent >= 60 ? "warning" : "error",
      progress: riskMitigationPercent,
      action: riskMitigationPercent < 100 ? { label: "Visa risker", href: `/cases/${caseId}/risks` } : undefined,
    });
  }

  // ===================== BALANCE ANALYSIS =====================

  // SKA vs BÖR ratio
  const skaCount = requirements.filter(r => r.level === "SKA").length;
  const borCount = borReqs.length;
  if (requirements.length > 0) {
    const skaPercent = Math.round((skaCount / requirements.length) * 100);
    if (skaPercent > 80) {
      insights.push({
        category: "balance",
        title: "Hög andel SKA-krav",
        message: `${skaPercent}% av kraven är SKA-krav (${skaCount} av ${requirements.length}). En mycket hög andel obligatoriska krav kan minska konkurrensen och göra upphandlingen svår att uppfylla. Överväg att konvertera några SKA-krav till BÖR-krav med utvärderingskriterier.`,
        severity: "warning",
        action: { label: "Visa krav", href: `/cases/${caseId}/requirements` },
      });
    } else if (skaPercent < 30 && requirements.length >= 5) {
      insights.push({
        category: "balance",
        title: "Låg andel SKA-krav",
        message: `Bara ${skaPercent}% av kraven är SKA-krav (${skaCount} av ${requirements.length}). Utan tillräckligt med obligatoriska krav riskerar ni att få anbud som inte uppfyller grundläggande behov. Överväg att höja de viktigaste BÖR-kraven till SKA.`,
        severity: "warning",
        action: { label: "Visa krav", href: `/cases/${caseId}/requirements` },
      });
    } else {
      insights.push({
        category: "balance",
        title: "SKA/BÖR-balans",
        message: `${skaCount} SKA-krav (${skaPercent}%) och ${borCount} BÖR-krav (${100 - skaPercent}%). Bra balans mellan obligatoriska och utvärderingsbara krav.`,
        severity: "success",
      });
    }
  }

  // Behov-per-krav ratio
  if (needs.length > 0 && requirements.length > 0) {
    const ratio = requirements.length / needs.length;
    if (ratio > 5) {
      insights.push({
        category: "balance",
        title: "Många krav per behov",
        message: `Ni har ${requirements.length} krav för ${needs.length} behov (${ratio.toFixed(1)} krav/behov). Högt antal krav per behov kan tyda på att kraven är för detaljerade eller att behoven är för breda. Verifiera att varje krav verkligen behövs.`,
        severity: "info",
      });
    } else if (ratio < 1 && needs.length >= 3) {
      insights.push({
        category: "balance",
        title: "Få krav relativt behov",
        message: `Ni har ${requirements.length} krav för ${needs.length} behov (${ratio.toFixed(1)} krav/behov). Vissa behov kanske saknar krav — kontrollera spårbarheten.`,
        severity: "warning",
        action: { label: "Kontrollera spårbarhet", href: `/cases/${caseId}/traceability` },
      });
    }
  }

  // ===================== QUALITY CHECKS =====================

  // Criterion weight distribution
  if (criteria.length > 0) {
    const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
    const maxWeight = Math.max(...criteria.map(c => c.weight));
    if (totalWeight === 100 && maxWeight <= 60) {
      insights.push({
        category: "quality",
        title: "Kriterie-vikter",
        message: `Viktfördelningen summerar till 100% och inget kriterium överstiger 60%. Väl balanserad utvärderingsmodell.`,
        severity: "success",
      });
    } else if (maxWeight > 60) {
      const dominant = criteria.find(c => c.weight === maxWeight);
      insights.push({
        category: "quality",
        title: "Dominerande kriterium",
        message: `"${dominant?.title ?? "?"}" har ${maxWeight}% vikt — det dominerar utvärderingen. Överväg om det speglar verksamhetens faktiska prioriteringar eller om vikten bör sänkas.`,
        severity: "warning",
        action: { label: "Visa kriterier", href: `/cases/${caseId}/criteria` },
      });
    }
  }

  // Stakeholder breadth
  if (stakeholders.length < 3 && needs.length > 0) {
    insights.push({
      category: "quality",
      title: "Få intressenter",
      message: `Bara ${stakeholders.length} intressent${stakeholders.length === 1 ? "" : "er"} identifierade. Fler perspektiv ger bättre behovsanalys. Tänk på: slutanvändare, IT, ekonomi, ledning, juridik.`,
      severity: "warning",
      action: { label: "Lägg till intressenter", href: `/cases/${caseId}/stakeholders/new` },
    });
  }

  // Workshop coverage
  if (workshops.length === 0 && needs.length > 0) {
    insights.push({
      category: "quality",
      title: "Inga workshops genomförda",
      message: "Workshops är det viktigaste verktyget för att fånga verksamhetens behov. Planera minst en behovsworkshop med nyckelpersoner från verksamheten.",
      severity: "warning",
      action: { label: "Planera workshop", href: `/cases/${caseId}/workshops/new` },
    });
  }

  // Evidence / documentation
  if (evidence.length === 0 && (needs.length > 0 || requirements.length > 0)) {
    insights.push({
      category: "quality",
      title: "Ingen evidens dokumenterad",
      message: "Evidens (t.ex. mötesprotokoll, nulägesanalyser, marknadsundersökningar) stärker kravens förankring. Dokumentera underlag som motiverar era behov och krav.",
      severity: "info",
      action: { label: "Lägg till evidens", href: `/cases/${caseId}/evidence/new` },
    });
  }

  // ===================== READINESS INDICATORS =====================

  const warningCount = warnings.filter(w => w.severity === "warning").length;
  const infoCount = warnings.filter(w => w.severity === "info").length;

  if (warningCount === 0 && needs.length > 0 && requirements.length > 0) {
    insights.push({
      category: "readiness",
      title: "Inga varningar",
      message: "Inga kritiska valideringsvarningar — bra jobbat! Upphandlingsunderlaget ser välarbetat ut.",
      severity: "success",
    });
  } else if (warningCount > 10) {
    insights.push({
      category: "readiness",
      title: "Många varningar att åtgärda",
      message: `${warningCount} varningar och ${infoCount} förbättringsförslag. Fokusera på varningarna först — de kan leda till problem vid utvärdering eller överprövning.`,
      severity: "error",
    });
  }

  // ===================== VERKSAMHETS-TIPS =====================

  if (needs.length === 0) {
    insights.push({
      category: "tip",
      title: "Kom igång med behovsarbetet",
      message: "Börja med att dokumentera verksamhetens behov. Beskriv VAD ni behöver, inte HUR det ska lösas. Tänk: \"Vilka problem har vi idag?\" och \"Vad vill vi uppnå?\"",
      severity: "info",
      action: { label: "Skapa första behovet", href: `/cases/${caseId}/needs/new` },
    });
  }

  if (needs.length > 0 && requirements.length === 0) {
    insights.push({
      category: "tip",
      title: "Dags att formulera krav",
      message: `Ni har ${needs.length} behov dokumenterade. Nästa steg: formulera krav som leverantörerna ska uppfylla. Varje krav bör kunna kopplas till minst ett behov. Tips: Importera kravblock från biblioteket för att komma igång snabbt.`,
      severity: "info",
      action: { label: "Skapa krav", href: `/cases/${caseId}/requirements/new` },
    });
  }

  if (requirements.length >= 5 && criteria.length === 0) {
    insights.push({
      category: "tip",
      title: "Skapa utvärderingskriterier",
      message: `Ni har ${requirements.length} krav. Nu behöver ni kriterier för att utvärdera anbuden. Kriterier baseras på era BÖR-krav och viktas efter verksamhetens prioriteringar.`,
      severity: "info",
      action: { label: "Skapa kriterier", href: `/cases/${caseId}/criteria/new` },
    });
  }

  if (risks.length === 0 && needs.length >= 3) {
    insights.push({
      category: "tip",
      title: "Identifiera risker",
      message: "Riskanalys är centralt i offentlig upphandling. Vilka risker ser ni med upphandlingen? Tänk på: leverantörsrisker, tekniska risker, förändringsrisker, juridiska risker.",
      severity: "info",
      action: { label: "Skapa risk", href: `/cases/${caseId}/risks/new` },
    });
  }

  return { warnings, insights };
}

function parseJsonArr(val: string): unknown[] {
  try { return JSON.parse(val); } catch { return []; }
}

function parseJsonObj(val: string): Record<string, unknown> {
  try { return JSON.parse(val); } catch { return {}; }
}

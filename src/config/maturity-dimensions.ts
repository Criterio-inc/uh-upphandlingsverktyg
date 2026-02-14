/**
 * Maturity Dimension Configuration
 * Defines dimensions for general organizational maturity and AI maturity assessments
 */

export interface MaturityDimension {
  key: string;
  label: string;
  description: string;
  questions: MaturityQuestion[];
}

export interface MaturityQuestion {
  id: string;
  text: string;
  guidance?: string;
}

export interface MaturityLevel {
  score: number;
  label: string;
  description: string;
}

// Common maturity scale (1-5)
export const MATURITY_LEVELS: MaturityLevel[] = [
  { score: 1, label: "Initial", description: "Ad hoc, ostrukturerat" },
  { score: 2, label: "Utvecklande", description: "Vissa processer finns" },
  { score: 3, label: "Definierat", description: "Dokumenterade processer" },
  { score: 4, label: "Hanterat", description: "Mätbart och styrt" },
  { score: 5, label: "Optimerat", description: "Kontinuerlig förbättring" },
];

// General organizational maturity dimensions
export const GENERAL_MATURITY_DIMENSIONS: MaturityDimension[] = [
  {
    key: "gdpr",
    label: "GDPR & Dataskydd",
    description: "Mognad inom dataskydd och regelefterlevnad",
    questions: [
      {
        id: "gdpr_processes",
        text: "Hur väl är GDPR-processer etablerade?",
        guidance: "Bedöm processer för dataskydd, samtycke, registerföring",
      },
      {
        id: "gdpr_competence",
        text: "Vilken kompetens finns inom GDPR?",
        guidance: "Bedöm medarbetarnas kunskap och utbildning",
      },
      {
        id: "gdpr_tech",
        text: "Hur bra är tekniskt stöd för GDPR?",
        guidance: "Bedöm verktyg för samtycke, radering, portabilitet",
      },
    ],
  },
  {
    key: "security",
    label: "Säkerhet",
    description: "Mognad inom informationssäkerhet",
    questions: [
      {
        id: "security_architecture",
        text: "Hur mogen är säkerhetsarkitekturen?",
        guidance: "Bedöm kryptering, åtkomstkontroll, loggning",
      },
      {
        id: "security_processes",
        text: "Hur väl fungerar säkerhetsprocesser?",
        guidance: "Bedöm incidenthantering, sårbarhetshantering",
      },
      {
        id: "security_culture",
        text: "Hur är säkerhetskulturen?",
        guidance: "Bedöm medvetande, utbildning, policies",
      },
    ],
  },
  {
    key: "processes",
    label: "Processer",
    description: "Mognad inom processledning",
    questions: [
      {
        id: "process_documentation",
        text: "Hur väl är processer dokumenterade?",
        guidance: "Bedöm dokumentation, standardisering",
      },
      {
        id: "process_measurement",
        text: "Hur mäts processernas effektivitet?",
        guidance: "Bedöm KPI:er, uppföljning, rapportering",
      },
      {
        id: "process_improvement",
        text: "Hur fungerar processförbättring?",
        guidance: "Bedöm kontinuerligt förbättringsarbete",
      },
    ],
  },
  {
    key: "quality",
    label: "Kvalitet",
    description: "Mognad inom kvalitetsledning",
    questions: [
      {
        id: "quality_system",
        text: "Hur mogen är kvalitetssystemet?",
        guidance: "Bedöm kvalitetsledningssystem, certifieringar",
      },
      {
        id: "quality_control",
        text: "Hur fungerar kvalitetskontroll?",
        guidance: "Bedöm kontrollprocesser, testning, validering",
      },
      {
        id: "quality_culture",
        text: "Hur är kvalitetskulturen?",
        guidance: "Bedöm medarbetarnas kvalitetsmedvetande",
      },
    ],
  },
  {
    key: "change_management",
    label: "Förändringsledning",
    description: "Mognad inom förändringsledning",
    questions: [
      {
        id: "change_processes",
        text: "Hur väl fungerar förändringsledning?",
        guidance: "Bedöm processer för planering, kommunikation, genomförande",
      },
      {
        id: "change_adoption",
        text: "Hur är organisationens förändringsförmåga?",
        guidance: "Bedöm medarbetarnas acceptans och anpassning",
      },
    ],
  },
];

// AI-specific maturity dimensions
export const AI_MATURITY_DIMENSIONS: MaturityDimension[] = [
  {
    key: "ai_strategy",
    label: "AI-strategi",
    description: "Mognad inom AI-strategi och vision",
    questions: [
      {
        id: "ai_vision",
        text: "Hur väl är AI-visionen definierad?",
        guidance: "Bedöm tydlighet, förankring, långsiktighet",
      },
      {
        id: "ai_roadmap",
        text: "Hur tydlig är AI-färdplanen?",
        guidance: "Bedöm planering, prioritering, milstolpar",
      },
      {
        id: "ai_governance",
        text: "Hur fungerar AI-styrning?",
        guidance: "Bedöm beslutsprocesser, ansvar, riktlinjer",
      },
    ],
  },
  {
    key: "ai_competence",
    label: "AI-kompetens",
    description: "Mognad inom AI-kompetens och utbildning",
    questions: [
      {
        id: "ai_skills",
        text: "Vilken AI-kompetens finns i organisationen?",
        guidance: "Bedöm kunskaper inom ML, data science, AI-etik",
      },
      {
        id: "ai_training",
        text: "Hur fungerar AI-utbildning?",
        guidance: "Bedöm utbildningsprogram, kompetenshöjning",
      },
      {
        id: "ai_recruitment",
        text: "Hur rekryteras AI-kompetens?",
        guidance: "Bedöm rekrytering, retention, utveckling",
      },
    ],
  },
  {
    key: "data_governance",
    label: "Datastyrning",
    description: "Mognad inom datastyrning för AI",
    questions: [
      {
        id: "data_quality",
        text: "Hur är datakvaliteten?",
        guidance: "Bedöm tillgänglighet, kvalitet, struktur",
      },
      {
        id: "data_management",
        text: "Hur fungerar datahantering?",
        guidance: "Bedöm processer för insamling, lagring, delning",
      },
      {
        id: "data_ethics",
        text: "Hur hanteras dataetik?",
        guidance: "Bedöm etiska riktlinjer, bias-hantering",
      },
    ],
  },
  {
    key: "ai_infrastructure",
    label: "AI-infrastruktur",
    description: "Mognad inom teknisk AI-infrastruktur",
    questions: [
      {
        id: "ai_platform",
        text: "Hur mogen är AI-plattformen?",
        guidance: "Bedöm verktyg för utveckling, träning, deployment",
      },
      {
        id: "ai_operations",
        text: "Hur fungerar MLOps?",
        guidance: "Bedöm automation, monitoring, versionskontroll",
      },
      {
        id: "ai_scalability",
        text: "Hur skalbar är infrastrukturen?",
        guidance: "Bedöm compute, lagring, performance",
      },
    ],
  },
  {
    key: "ai_ethics",
    label: "AI-etik",
    description: "Mognad inom ansvarsfull AI",
    questions: [
      {
        id: "ai_principles",
        text: "Hur väl är AI-etiska principer etablerade?",
        guidance: "Bedöm riktlinjer, policies, etisk review",
      },
      {
        id: "ai_transparency",
        text: "Hur transparent är AI-användningen?",
        guidance: "Bedöm förklarbarhet, dokumentation",
      },
      {
        id: "ai_accountability",
        text: "Hur hanteras ansvar för AI?",
        guidance: "Bedöm roller, ansvar, kontroll",
      },
    ],
  },
  {
    key: "ai_adoption",
    label: "AI-adoption",
    description: "Mognad inom AI-implementering",
    questions: [
      {
        id: "ai_use_cases",
        text: "Hur många AI-användningsfall finns?",
        guidance: "Bedöm antal, mångfald, värdeskapande",
      },
      {
        id: "ai_integration",
        text: "Hur väl är AI integrerat?",
        guidance: "Bedöm integration i processer, system",
      },
      {
        id: "ai_value",
        text: "Hur mäts AI-värdet?",
        guidance: "Bedöm ROI, KPI:er, värdemätning",
      },
    ],
  },
];

// Helper function to get dimensions by session type
export function getDimensionsByType(
  sessionType: "general" | "ai_maturity"
): MaturityDimension[] {
  return sessionType === "ai_maturity"
    ? AI_MATURITY_DIMENSIONS
    : GENERAL_MATURITY_DIMENSIONS;
}

// Helper function to get dimension by key
export function getDimensionByKey(
  key: string,
  sessionType: "general" | "ai_maturity"
): MaturityDimension | undefined {
  const dimensions = getDimensionsByType(sessionType);
  return dimensions.find((d) => d.key === key);
}

// Calculate average score for a dimension from question responses
export function calculateDimensionScore(
  questionScores: { [questionId: string]: number }
): number {
  const scores = Object.values(questionScores);
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

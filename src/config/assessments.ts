/* ------------------------------------------------------------------ */
/*  Assessment configuration — questions, dimensions, maturity levels  */
/* ------------------------------------------------------------------ */

export interface AssessmentQuestion {
  id: string;
  dimension: string;
  text: string;
  /** Optional helper text shown below the question */
  helpText?: string;
}

export interface MaturityLevel {
  level: number;
  name: string;
  description: string;
}

export interface AssessmentConfig {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  questionCount: number;
  dimensionCount: number;
  dimensions: string[];
  dimensionLabels: Record<string, string>;
  dimensionDescriptions: Record<string, string>;
  questions: AssessmentQuestion[];
  maturityLevels: MaturityLevel[];
}

/* ================================================================== */
/*  Digital Mognadsmätning — 22 questions, 4 dimensions                */
/* ================================================================== */

const DIGITAL_MOGNAD_DIMENSIONS = [
  "strategi",
  "organisation",
  "teknologi",
  "kultur",
] as const;

const DIGITAL_MOGNAD_DIMENSION_LABELS: Record<string, string> = {
  strategi: "Strategi & Ledarskap",
  organisation: "Organisation & Processer",
  teknologi: "Teknologi & Data",
  kultur: "Kultur & Kompetens",
};

const DIGITAL_MOGNAD_DIMENSION_DESCRIPTIONS: Record<string, string> = {
  strategi: "Hur val organisationens digitala vision och strategi är formulerad, förankrad och leds.",
  organisation: "Hur val processer, arbetssätt och organisationsstruktur stödjer digital transformation.",
  teknologi: "Hur val teknisk infrastruktur, data och digitala verktyg stödjer verksamheten.",
  kultur: "Hur val organisationskulturen och kompetensförsörjningen stödjer digital utveckling.",
};

const DIGITAL_MOGNAD_QUESTIONS: AssessmentQuestion[] = [
  // Strategi & Ledarskap (6 frågor)
  { id: "dm-s1", dimension: "strategi", text: "Vi har en tydlig digital strategi som är känd i hela organisationen." },
  { id: "dm-s2", dimension: "strategi", text: "Ledningen driver aktivt digitala initiativ och föregår med gott exempel." },
  { id: "dm-s3", dimension: "strategi", text: "Det finns avsatt budget och resurser för digital utveckling." },
  { id: "dm-s4", dimension: "strategi", text: "Digitala initiativ kopplas tydligt till verksamhetsmål och nyttorealisering." },
  { id: "dm-s5", dimension: "strategi", text: "Vi mäter och följer upp effekterna av digitala satsningar regelbundet." },
  { id: "dm-s6", dimension: "strategi", text: "Det finns en färdplan (roadmap) för digital transformation med tydliga milstolpar." },
  // Organisation & Processer (5 frågor)
  { id: "dm-o1", dimension: "organisation", text: "Våra kärnprocesser är dokumenterade och digitaliserade i hög utsträckning." },
  { id: "dm-o2", dimension: "organisation", text: "Vi arbetar agilt och tvärfunktionellt i digitaliseringsprojekt." },
  { id: "dm-o3", dimension: "organisation", text: "Det finns tydliga roller och ansvar för digitala initiativ." },
  { id: "dm-o4", dimension: "organisation", text: "Vi har etablerade rutiner för att testa och implementera nya digitala lösningar." },
  { id: "dm-o5", dimension: "organisation", text: "Digitala tjänster utvecklas med användarens behov som utgångspunkt." },
  // Teknologi & Data (6 frågor)
  { id: "dm-t1", dimension: "teknologi", text: "Vår IT-infrastruktur är modern, skalbar och molnbaserad." },
  { id: "dm-t2", dimension: "teknologi", text: "Vi har en integrerad datamiljö där system kan kommunicera med varandra." },
  { id: "dm-t3", dimension: "teknologi", text: "Vi använder data aktivt för att fatta beslut och förbättra verksamheten." },
  { id: "dm-t4", dimension: "teknologi", text: "Vår informationssäkerhet och dataskydd lever upp till gällande krav." },
  { id: "dm-t5", dimension: "teknologi", text: "Vi har en tydlig strategi för hantering av teknisk skuld och legacy-system." },
  { id: "dm-t6", dimension: "teknologi", text: "Vi utvärderar och testar nya teknologier systematiskt." },
  // Kultur & Kompetens (5 frågor)
  { id: "dm-k1", dimension: "kultur", text: "Medarbetarna har den digitala kompetens som krävs för sina arbetsuppgifter." },
  { id: "dm-k2", dimension: "kultur", text: "Det finns kontinuerliga utbildningsinsatser inom digitalisering." },
  { id: "dm-k3", dimension: "kultur", text: "Organisationskulturen uppmuntrar till experiment och att lära av misstag." },
  { id: "dm-k4", dimension: "kultur", text: "Vi delar kunskap och erfarenheter kring digitalisering aktivt mellan avdelningar." },
  { id: "dm-k5", dimension: "kultur", text: "Medarbetarna är motiverade och delaktiga i den digitala utvecklingen." },
];

const DIGITAL_MOGNAD_MATURITY_LEVELS: MaturityLevel[] = [
  { level: 1, name: "Initial", description: "Digitalisering sker ad hoc utan tydlig plan. Enstaka initiativ finns men de är isolerade och okoordinerade." },
  { level: 2, name: "Utvecklande", description: "Grundläggande digitala initiativ finns på plats. Medvetenhet om behovet av digitalisering ökar men arbetet är reaktivt." },
  { level: 3, name: "Definierad", description: "En digital strategi finns och processer börjar standardiseras. Organisationen arbetar medvetet med digitalisering." },
  { level: 4, name: "Hanterad", description: "Digitalisering är integrerad i verksamhetsstyrningen. Resultat mäts systematiskt och kontinuerlig förbättring sker." },
  { level: 5, name: "Optimerad", description: "Organisationen är datadrivet och innovativ. Digital transformation är en naturlig del av kulturen och strategin." },
];

export const DIGITAL_MOGNAD_CONFIG: AssessmentConfig = {
  slug: "digital-mognad",
  name: "Digital Mognadsmätning",
  shortName: "Digital Mognad",
  description: "Mät organisationens digitala mognad med 22 frågor inom 4 dimensioner. Få en tydlig bild av var organisationen står och var utvecklingspotentialen finns.",
  questionCount: 22,
  dimensionCount: 4,
  dimensions: [...DIGITAL_MOGNAD_DIMENSIONS],
  dimensionLabels: DIGITAL_MOGNAD_DIMENSION_LABELS,
  dimensionDescriptions: DIGITAL_MOGNAD_DIMENSION_DESCRIPTIONS,
  questions: DIGITAL_MOGNAD_QUESTIONS,
  maturityLevels: DIGITAL_MOGNAD_MATURITY_LEVELS,
};

/* ================================================================== */
/*  AI-Mognadsmätning — 32 questions, 8 dimensions                     */
/* ================================================================== */

const AI_MOGNAD_DIMENSIONS = [
  "strategi",
  "data",
  "teknologi",
  "organisation",
  "kompetens",
  "etik",
  "sakerhet",
  "innovation",
] as const;

const AI_MOGNAD_DIMENSION_LABELS: Record<string, string> = {
  strategi: "AI-Strategi & Vision",
  data: "Data & Datakvalitet",
  teknologi: "AI-Teknologi & Infrastruktur",
  organisation: "Organisation & Styrning",
  kompetens: "Kompetens & Talang",
  etik: "Etik & Ansvarsfull AI",
  sakerhet: "Säkerhet & EU AI Act",
  innovation: "Innovation & Skalning",
};

const AI_MOGNAD_DIMENSION_DESCRIPTIONS: Record<string, string> = {
  strategi: "Hur val organisationen har formulerat och förankrat sin AI-strategi.",
  data: "Hur val organisation hanterar, kvalitetssäkrar och tillgängliggör data för AI.",
  teknologi: "Hur val den tekniska infrastrukturen stödjer AI-utveckling och driftsättning.",
  organisation: "Hur val organisationsstrukturen och styrningen stödjer AI-initiativ.",
  kompetens: "Hur val organisation bygger och underhåller AI-kompetens.",
  etik: "Hur val organisationen adresserar etiska aspekter och ansvarsfull AI-användning.",
  sakerhet: "Hur val organisationen hanterar AI-säkerhet och efterlevnad av EU AI Act.",
  innovation: "Hur val organisationen skalar AI-lösningar och driver innovation.",
};

const AI_MOGNAD_QUESTIONS: AssessmentQuestion[] = [
  // AI-Strategi & Vision (4 frågor)
  { id: "ai-s1", dimension: "strategi", text: "Vi har en tydlig AI-strategi som är kopplad till verksamhetsmålen." },
  { id: "ai-s2", dimension: "strategi", text: "Ledningen förstår AI:s potential och begränsningar för vår verksamhet." },
  { id: "ai-s3", dimension: "strategi", text: "Det finns en prioriterad lista med AI-användningsfall (use cases)." },
  { id: "ai-s4", dimension: "strategi", text: "Vi har en tydlig plan för hur AI ska bidra till värdeskapande inom 2-3 år." },
  // Data & Datakvalitet (4 frågor)
  { id: "ai-d1", dimension: "data", text: "Vi har god tillgång till strukturerad och kvalitetssäkrad data." },
  { id: "ai-d2", dimension: "data", text: "Det finns etablerade processer för datainsamling, rensning och underhåll." },
  { id: "ai-d3", dimension: "data", text: "Data är tillgänglig och delbar mellan avdelningar och system." },
  { id: "ai-d4", dimension: "data", text: "Vi har en datastyrningsmodell (data governance) på plats." },
  // AI-Teknologi & Infrastruktur (4 frågor)
  { id: "ai-t1", dimension: "teknologi", text: "Vi har teknisk infrastruktur som stödjer AI-modellträning och driftsättning." },
  { id: "ai-t2", dimension: "teknologi", text: "Vi använder moderna MLOps-verktyg för att hantera AI-modellers livscykel." },
  { id: "ai-t3", dimension: "teknologi", text: "Vår infrastruktur kan hantera ökande datamängder och beräkningsbehov." },
  { id: "ai-t4", dimension: "teknologi", text: "Vi har en strategi för val mellan egenutvecklade och tredjepartsmodeller." },
  // Organisation & Styrning (4 frågor)
  { id: "ai-o1", dimension: "organisation", text: "Det finns tydliga roller och ansvar för AI-initiativ i organisationen." },
  { id: "ai-o2", dimension: "organisation", text: "Vi har en tvärfunktionell samarbetsmodell för AI-projekt." },
  { id: "ai-o3", dimension: "organisation", text: "Det finns en governance-struktur för AI som hanterar risker och prioriteringar." },
  { id: "ai-o4", dimension: "organisation", text: "Vi utvärderar AI-projekt systematiskt med tydliga framgångskriterier." },
  // Kompetens & Talang (4 frågor)
  { id: "ai-k1", dimension: "kompetens", text: "Vi har tillgång till rätt AI-kompetens (internt eller via partners)." },
  { id: "ai-k2", dimension: "kompetens", text: "Det finns utbildningsprogram för att öka AI-förståelsen i organisationen." },
  { id: "ai-k3", dimension: "kompetens", text: "Medarbetare i kärnverksamheten kan formulera AI-relevanta problem." },
  { id: "ai-k4", dimension: "kompetens", text: "Vi har en strategi för att attrahera och behålla AI-talang." },
  // Etik & Ansvarsfull AI (4 frågor)
  { id: "ai-e1", dimension: "etik", text: "Vi har riktlinjer för ansvarsfull AI-användning." },
  { id: "ai-e2", dimension: "etik", text: "AI-modeller utvärderas avseende bias, rättvisa och transparens." },
  { id: "ai-e3", dimension: "etik", text: "Det finns processer för att hantera etiska dilemman kopplade till AI." },
  { id: "ai-e4", dimension: "etik", text: "Vi kommunicerar öppet om var och hur AI används i verksamheten." },
  // Säkerhet & EU AI Act (4 frågor)
  { id: "ai-sa1", dimension: "sakerhet", text: "Vi har kartlagt vilka AI-system som berörs av EU AI Act." },
  { id: "ai-sa2", dimension: "sakerhet", text: "Det finns processer för riskklassificering av AI-system." },
  { id: "ai-sa3", dimension: "sakerhet", text: "Vi dokumenterar AI-modellers syfte, data och beslutsprocesser." },
  { id: "ai-sa4", dimension: "sakerhet", text: "Det finns säkerhetsrutiner specifikt anpassade för AI-system." },
  // Innovation & Skalning (4 frågor)
  { id: "ai-i1", dimension: "innovation", text: "Vi har framgångsrikt skalat AI-lösningar från pilot till produktion." },
  { id: "ai-i2", dimension: "innovation", text: "Vi testar och utvärderar nya AI-teknologier regelbundet." },
  { id: "ai-i3", dimension: "innovation", text: "Det finns en process för att identifiera och prioritera nya AI-möjligheter." },
  { id: "ai-i4", dimension: "innovation", text: "Vi samarbetar med externa partners och ekosystem för AI-innovation." },
];

const AI_MOGNAD_MATURITY_LEVELS: MaturityLevel[] = [
  { level: 1, name: "Utforskande", description: "AI-intresset finns men användningen är sporadisk. Inga formella strukturer eller strategier finns på plats." },
  { level: 2, name: "Experimenterande", description: "Pilotprojekt pågår och grundläggande datakvalitet adresseras. AI-kompetens börjar byggas upp." },
  { level: 3, name: "Operationaliserande", description: "AI-modeller används i produktion. Governance och etiska riktlinjer finns. EU AI Act-efterlevnad påbörjad." },
  { level: 4, name: "Skalerande", description: "AI är integrerad i kärnprocesser. Systematisk modellhantering och nyttorealisering sker. Hög medvetenhet om ansvarsfull AI." },
  { level: 5, name: "Transformerande", description: "AI driver strategisk innovation och affärsmodellsutveckling. Organisationen är AI-mogen och agerar proaktivt." },
];

export const AI_MOGNAD_CONFIG: AssessmentConfig = {
  slug: "ai-mognad",
  name: "AI-Mognadsmätning",
  shortName: "AI-Mognad",
  description: "Bedöm organisationens AI-mognad med 32 frågor inom 8 dimensioner. Inkluderar aspekter kring EU AI Act, etik och ansvarsfull AI.",
  questionCount: 32,
  dimensionCount: 8,
  dimensions: [...AI_MOGNAD_DIMENSIONS],
  dimensionLabels: AI_MOGNAD_DIMENSION_LABELS,
  dimensionDescriptions: AI_MOGNAD_DIMENSION_DESCRIPTIONS,
  questions: AI_MOGNAD_QUESTIONS,
  maturityLevels: AI_MOGNAD_MATURITY_LEVELS,
};

/* ================================================================== */
/*  Lookup helpers                                                     */
/* ================================================================== */

export const ASSESSMENT_CONFIGS: Record<string, AssessmentConfig> = {
  "digital-mognad": DIGITAL_MOGNAD_CONFIG,
  "ai-mognad": AI_MOGNAD_CONFIG,
};

export function getAssessmentConfig(slug: string): AssessmentConfig | undefined {
  return ASSESSMENT_CONFIGS[slug];
}

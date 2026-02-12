import type { PhaseConfig } from "@/types/workflow";

// ============================================================
// Generic LOU phase chain (base for all profiles)
// A → B → C → D
// ============================================================

export const BASE_PHASES: PhaseConfig[] = [
  {
    id: "A_start_styrning",
    label: "A. Start & styrning",
    description: "Definiera uppdrag, organisation och grundläggande ramar för upphandlingen.",
    subPhases: [
      {
        id: "A1_uppdragsramar",
        label: "A1. Uppdragsramar",
        description: "Mandat, mål, avgränsning, tidplan",
      },
      {
        id: "A2_organisation",
        label: "A2. Organisation & RACI",
        description: "Styrgrupp, projektgrupp, beslutsformer",
      },
      {
        id: "A3_dokumentationslogg",
        label: "A3. Dokumentationslogg",
        description: "Versionering och dokumentstyrning",
      },
      {
        id: "A4_riskregister",
        label: "A4. Riskregister v0",
        description: "Initial riskidentifiering",
      },
    ],
    gates: [
      {
        id: "A_goals",
        label: "Minst 1 mål definierat",
        rule: "case.goals>=1",
        severity: "blocker",
        helpText: "Upphandlingsmålet styr hela arbetet framåt. Utan mål saknas riktning för behovsanalys och kravdesign. Formulera minst ett övergripande mål.",
      },
      {
        id: "A_stakeholders",
        label: "Minst 3 intressenter identifierade",
        rule: "stakeholders.count>=3",
        severity: "blocker",
        helpText: "LOU förutsätter att alla berörda parter beaktas. Minst beställare, slutanvändare och IT bör finnas. Fler intressenter ger bättre krav.",
      },
      {
        id: "A_stakeholders_high_influence",
        label: "Minst 1 intressent med inflytande ≥4",
        rule: "stakeholders.hasHighInfluence",
        severity: "warning",
        helpText: "Det bör finnas minst en nyckelintressent med högt inflytande (4-5) som kan fatta beslut eller driva processen framåt.",
      },
      {
        id: "A_risks",
        label: "Minst 3 risker identifierade",
        rule: "risks.count>=3",
        severity: "warning",
        helpText: "Tidig riskidentifiering förebygger problem. Typiska tidiga risker: överprövning, resursbrist, tidplansglidning.",
      },
      {
        id: "A_governance",
        label: "Styrgrupp definierad",
        rule: "case.governance.steeringGroupDefined",
        severity: "warning",
        helpText: "En styrgrupp med mandat att fatta beslut behövs för att driva upphandlingen framåt. Definiera styrgrupp under Inställningar.",
      },
      {
        id: "A_decision_forfarande",
        label: "Förfarandeval gjort",
        rule: "decisions.has(forfarande)",
        severity: "warning",
        helpText: "Val av upphandlingsförfarande (öppet, selektivt, förhandlat, etc.) bör göras tidigt. Dokumentera som ett beslut med motivering.",
      },
    ],
  },
  {
    id: "B_forbered",
    label: "B. Förbered upphandlingen",
    description: "Analysera behov, marknad och utforma krav och utvärderingsmodell.",
    subPhases: [
      {
        id: "B1_behovsanalys",
        label: "B1. Behovsanalys",
        description: "Kartlägg → analysera → beskriv behov",
      },
      {
        id: "B2_marknadsanalys",
        label: "B2. Marknadsanalys & marknadsdialog",
        description: "Omvärlds- och leverantörsanalys",
      },
      {
        id: "B3_upphandlingsstrategi",
        label: "B3. Upphandlingsstrategi",
        description: "Förfarandeval och strategi",
      },
      {
        id: "B4_kravdesign",
        label: "B4. Kravdesign",
        description: "SKA/BÖR + verifierbarhet + spårbarhet",
      },
      {
        id: "B5_utvarderingsdesign",
        label: "B5. Utvärderingsdesign",
        description: "Kriterier, viktning, poängsättning",
      },
    ],
    gates: [
      {
        id: "B_needs",
        label: "Minst 5 behov dokumenterade",
        rule: "needs.count>=5",
        severity: "blocker",
        helpText: "Behovsanalysen är grunden för hela upphandlingen. Ju fler väl dokumenterade behov, desto bättre krav. Minst 5 behov krävs för att gå vidare.",
      },
      {
        id: "B_needs_sources",
        label: "Alla behov har källor",
        rule: "needs.allHaveSources",
        severity: "warning",
        helpText: "Varje behov bör kunna spåras till en källa (workshop, intervju, statistik). Stärker behovens legitimitet vid granskning.",
      },
      {
        id: "B_requirements",
        label: "Minst 5 krav definierade",
        rule: "requirements.count>=5",
        severity: "blocker",
        helpText: "Krav ska vara verifierbara och spårbara till behov. Mix av SKA och BÖR. Färre än 5 krav indikerar otillräcklig analys.",
      },
      {
        id: "B_req_linked",
        label: "Alla krav länkade till behov",
        rule: "requirements.allLinkedToNeeds",
        severity: "warning",
        helpText: "Krav utan koppling till behov ('hängande krav') riskerar att inte vara proportionerliga. Varje krav bör motiveras av minst ett behov.",
      },
      {
        id: "B_req_ska_evidence",
        label: "SKA-krav har verifieringsplan",
        rule: "requirements.SKA.allHaveBidEvidence",
        severity: "warning",
        helpText: "SKA-krav som inte kan verifieras i anbudet skapar problem vid utvärdering. Ange hur leverantören ska visa att kravet uppfylls.",
      },
      {
        id: "B_needs_consequences",
        label: "P1-behov har konsekvens",
        rule: "needs.allP1HaveConsequences",
        severity: "warning",
        helpText: "Alla behov med prioritet P1 bör ha en dokumenterad konsekvens om de inte uppfylls. Stärker motivering vid överprövning.",
      },
      {
        id: "B_evidence_market",
        label: "Marknadsanalys dokumenterad",
        rule: "evidence.typeExists(market_note)",
        severity: "warning",
        helpText: "Marknadsanalys stärker proportionalitetsbedömningen och hjälper till att designa realistiska krav. Skapa evidens av typ 'Marknadsnotering'.",
      },
      {
        id: "B_criteria",
        label: "Minst 2 utvärderingskriterier",
        rule: "criteria.count>=2",
        severity: "blocker",
        helpText: "Utvärderingsmodellen behöver minst 2 kriterier (typiskt funktionalitet + pris). Fler kriterier ger nyanserad utvärdering.",
      },
      {
        id: "B_criteria_weight",
        label: "Kriteriernas vikt summerar till 100",
        rule: "criteria.sumWeight=100",
        severity: "blocker",
        helpText: "Vikterna måste summera till exakt 100% för att utvärderingsmodellen ska vara korrekt. Kontrollera och justera vikterna.",
      },
      {
        id: "B_criteria_anchors",
        label: "Alla kriterier har poängankare",
        rule: "criteria.allHaveAnchors",
        severity: "warning",
        helpText: "Poängankare (beskrivning av vad varje poängnivå innebär) säkerställer konsekvent bedömning mellan bedömare.",
      },
      {
        id: "B_criteria_linked",
        label: "Alla kriterier kopplade till krav",
        rule: "criteria.allLinkedToRequirements",
        severity: "warning",
        helpText: "Kriterier utan koppling till krav riskerar att utvärdera saker som inte efterfrågas. Varje kriterium bör referera minst ett BÖR-krav.",
      },
    ],
  },
  {
    id: "C_genomfor",
    label: "C. Genomför upphandlingen",
    description: "Publicera, hantera anbud och utvärdera.",
    subPhases: [
      {
        id: "C1_upphandlingsdokument",
        label: "C1. Upphandlingsdokument",
        description: "Sammanställ och publicera förfrågningsunderlag",
      },
      {
        id: "C2_fragor_svar",
        label: "C2. Frågor & svar",
        description: "Q&A-hantering under anbudstid",
      },
      {
        id: "C3_anbudsprovning",
        label: "C3. Anbudsprövning",
        description: "Formalia, SKA-krav, kvalificering",
      },
      {
        id: "C4_utvardering",
        label: "C4. Utvärdering",
        description: "Kalibrering, bedömning, protokoll",
      },
      {
        id: "C5_tilldelning",
        label: "C5. Tilldelning + avtalsspärr",
        description: "Tilldelningsbeslut och avtalsspärr (10/15 dagar)",
      },
    ],
    gates: [
      {
        id: "C_bids",
        label: "Minst 1 anbud registrerat",
        rule: "bids.count>=1",
        severity: "blocker",
        helpText: "Registrera mottagna anbud med leverantörsnamn och extern referens. Utan anbud kan processen inte fortskrida.",
      },
      {
        id: "C_bids_reviewed",
        label: "Alla anbud kvalificerade/avvisade",
        rule: "bids.allReviewed",
        severity: "blocker",
        helpText: "Alla mottagna anbud måste aktivt kvalificeras eller avvisas. Anbud som inte bedömts skapar rättslig osäkerhet.",
      },
      {
        id: "C_checklist_qualification",
        label: "Formell kvalificering bekräftad",
        rule: "evaluationStatus.checklist(chk-1)",
        severity: "warning",
        helpText: "Bekräfta att formell kvalificering av anbuden är genomförd. Bocka i checklistan under Fas C — Status.",
      },
      {
        id: "C_checklist_evaluation",
        label: "Utvärdering genomförd",
        rule: "evaluationStatus.checklist(chk-3)",
        severity: "warning",
        helpText: "Bekräfta att utvärdering av tilldelningskriterier är genomförd i ert upphandlingssystem. Bocka i checklistan under Fas C — Status.",
      },
      {
        id: "C_doc_utvardering",
        label: "Utvärderingsprotokoll skapat",
        rule: "documents.hasType(utvarderingsprotokoll)",
        severity: "warning",
        helpText: "Utvärderingsprotokoll dokumenterar bedömningsprocessen och är centralt vid eventuell överprövning.",
      },
      {
        id: "C_decision_tilldelning",
        label: "Tilldelningsbeslut fattat",
        rule: "decisions.has(tilldelning)",
        severity: "blocker",
        helpText: "Tilldelningsbeslut med motivering krävs enl. LOU. Beslutet ska kommuniceras till alla anbudsgivare och följas av avtalsspärr.",
      },
    ],
  },
  {
    id: "D_kontrakt_forvaltning",
    label: "D. Kontrakt → implementation → förvaltning",
    description: "Kontraktsteckning, mobilisering och uppföljning.",
    subPhases: [
      {
        id: "D1_kontraktsgenomgang",
        label: "D1. Kontraktsgenomgång",
        description: "Gå igenom och teckna avtal",
      },
      {
        id: "D2_mobilisering",
        label: "D2. Mobilisering & implementation",
        description: "Planera och genomföra implementation",
      },
      {
        id: "D3_forvaltning",
        label: "D3. Förvaltningsupplägg",
        description: "Organisera löpande förvaltning",
      },
      {
        id: "D4_uppfoljning",
        label: "D4. Avtalsuppföljning & nyttorealisering",
        description: "Följ upp avtal och realisera nyttor",
      },
    ],
    gates: [
      {
        id: "D_decision_kontrakt",
        label: "Kontraktsbeslut fattat",
        rule: "decisions.has(kontrakt)",
        severity: "blocker",
        helpText: "Avtal kan tecknas efter avtalsspärrens utgång (10/15 dagar). Kontraktet ska spegla krav och anbud.",
      },
      {
        id: "D_doc_implementation",
        label: "Implementeringsplan skapad",
        rule: "documents.hasType(implementation_plan)",
        severity: "warning",
        helpText: "En implementeringsplan beskriver hur övergången ska gå till: tidplan, roller, milstolpar och riskhantering.",
      },
      {
        id: "D_doc_forvaltning",
        label: "Förvaltningsplan skapad",
        rule: "documents.hasType(forvaltningsplan)",
        severity: "warning",
        helpText: "Förvaltningsplanen beskriver hur avtalet ska följas upp: SLA, kontaktvägar, eskaleringsprocess, rapportering.",
      },
    ],
  },
];

"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

// ============================================================
// Glossary terms
// ============================================================

const GLOSSARY: { term: string; definition: string; example?: string }[] = [
  { term: "LOU", definition: "Lagen om offentlig upphandling. Reglerar hur offentliga medel ska användas vid inköp av varor, tjänster och byggentreprenader.", example: "Alla kommuner, regioner och statliga myndigheter måste följa LOU." },
  { term: "SKA-krav", definition: "Obligatoriskt krav som måste uppfyllas för att ett anbud ska kvalificera sig. Binärt: uppfylls eller uppfylls inte. Anbud som inte uppfyller SKA-krav diskvalificeras.", example: "\"Systemet SKA stödja export i öppna format\" — om leverantören inte kan detta, förkastas anbudet." },
  { term: "BÖR-krav", definition: "Mervärdeskrav som utvärderas med poäng. Ju bättre uppfyllnad, desto fler poäng. Anbud diskvalificeras INTE om BÖR-krav inte uppfylls.", example: "\"Systemet BÖR stödja push-notiser\" — ger extrapoäng men är inte eliminatoriskt." },
  { term: "Proportionalitet", definition: "LOU-princip som säger att krav ska stå i rimlig proportion till vad som upphandlas. Alltför höga krav kan utesluta bra leverantörer utan att det är motiverat.", example: "Att kräva ISO 27001-certifiering för ett litet informationssystem kan vara oproportionerligt." },
  { term: "Gate", definition: "Kontrollpunkt som måste passeras innan upphandlingen kan avancera till nästa fas. Blockerande gates MÅSTE klaras. Varningsgates är rekommendationer.", example: "Gate: 'Minst 5 behov dokumenterade' måste vara uppfyllt innan fas B → C." },
  { term: "Spårbarhet", definition: "Förmågan att följa kedjan Behov → Krav → Kriterium → Poäng. Säkerställer att allt som utvärderas har sitt ursprung i ett verkligt behov.", example: "Om ett krav inte kan spåras till ett behov riskerar det att anses oproportionerligt." },
  { term: "Utvärderingskriterium", definition: "Mätbar aspekt som används för att jämföra anbud. Varje kriterium har en vikt (%) och en poängskala.", example: "Kriteriet 'Användarvänlighet' (vikt 20%, skala 0-5) bedöms via demo." },
  { term: "Poängankare", definition: "Beskrivning av vad varje poängnivå innebär för ett kriterium. Säkerställer att bedömare ger samma poäng för samma kvalitetsnivå.", example: "0 = Oanvändbart, 3 = Rimlig inlärningskurva, 5 = Intuitivt och effektivt." },
  { term: "Förfarande", definition: "Val av upphandlingsmetod: öppet (alla får lämna anbud), selektivt (kvalificering först), förhandlat (med förhandling) eller konkurrenspräglad dialog.", example: "Vid komplexa IT-system väljs ofta selektivt eller förhandlat förfarande." },
  { term: "Tilldelningsbeslut", definition: "Formellt beslut om vilken leverantör som vinner upphandlingen. Måste motiveras och kommuniceras till alla anbudsgivare.", example: "\"WasteFlow AB tilldelas kontraktet baserat på bästa förhållandet pris/kvalitet.\"" },
  { term: "Avtalsspärr", definition: "Period (10 eller 15 dagar) efter tilldelningsbeslut där avtal inte får tecknas. Ger förlorande parter möjlighet att överpröva.", example: "Avtalsspärr 10 dagar vid förenklad upphandling, 15 dagar vid öppen." },
  { term: "Överprövning", definition: "Leverantör som anser att upphandlingen strider mot LOU kan begära överprövning i förvaltningsdomstol.", example: "Otydliga krav eller bristande motivering i tilldelning ökar risken för överprövning." },
  { term: "Kluster", definition: "Gruppering av behov och krav inom ett funktionsområde. Hjälper till att strukturera och säkerställa att inget område missas.", example: "Kluster 'Kund & abonnemang' samlar alla behov relaterade till kundhantering." },
  { term: "Evidens", definition: "Dokumenterade bevis som styrker behov eller krav: intervjuprotokoll, statistik, marknadsnoteringar, benchmarks.", example: "Marknadsnotering som visar att 3 av 5 leverantörer erbjuder önskad funktion." },
  { term: "Verifieringsplan", definition: "Beskrivning av hur varje SKA-krav ska verifieras: via anbud (bidEvidence), vid implementation (proof) och i drift (opsFollowUp).", example: "Verifiering: 'Leverantören ska visa exportfunktion via demo vid anbudspresentation.'" },
  { term: "TCO", definition: "Total Cost of Ownership — total ägandekostnad över hela avtalsperioden, inklusive licenser, drift, support, anpassning och exit.", example: "Ett billigt system med dyrt underhåll kan ha högre TCO än ett dyrare med inkluderad support." },
  { term: "DPIA", definition: "Data Protection Impact Assessment — dataskyddskonsekvensbedömning. Krävs av GDPR vid behandling av känsliga personuppgifter.", example: "Socialtjänstsystem kräver alltid DPIA då de hanterar särskilt känsliga uppgifter." },
  { term: "Riskmatris", definition: "Visuellt verktyg där risker plottas efter sannolikhet (1-5) × konsekvens (1-5). Score ≥12 = hög risk som kräver åtgärd.", example: "Risk: 'Inlåsning' (4 × 4 = 16) → Kräver omedelbar åtgärd via exit-krav." },
];

// ============================================================
// Role descriptions
// ============================================================

interface RoleInfo {
  title: string;
  icon: string;
  description: string;
  responsibilities: string[];
  focusAreas: string[];
  phases: string;
}

const ROLES: RoleInfo[] = [
  {
    title: "Verksamhetsföreträdare",
    icon: "user",
    description: "Du representerar de som ska ANVÄNDA det upphandlade systemet/tjänsten i vardagen. Din kunskap om verksamhetens behov, arbetsflöden och utmaningar är avgörande.",
    responsibilities: [
      "Formulera och prioritera verksamhetsbehov (Fas A–B)",
      "Delta i behovsworkshops och kravrevisioner",
      "Validera att krav speglar verkliga arbetssätt",
      "Bedöma om anbud uppfyller verksamhetens krav (Fas C)",
      "Granska utvärderingsresultat ur verksamhetsperspektiv",
      "Delta i acceptanstest vid implementation (Fas D)",
    ],
    focusAreas: ["Behov", "Krav", "Workshops", "Utvärdering"],
    phases: "Aktiv i alla faser, mest kritisk i Fas A (behovsanalys) och Fas B (kravdesign)",
  },
  {
    title: "Upphandlare / Projektledare",
    icon: "clipboard-list",
    description: "Du leder upphandlingsprocessen och säkerställer att allt följer LOU. Du ansvarar för att processen är korrekt, dokumenterad och försvarbar.",
    responsibilities: [
      "Driva upphandlingsprocessen genom alla faser",
      "Säkerställa att gates passeras korrekt",
      "Granska proportionalitet i kravställning",
      "Designa utvärderingsmodell (kriterier, vikter, skalor)",
      "Sammanställa upphandlingsdokument",
      "Hantera tilldelningsbeslut och avtalsspärr",
    ],
    focusAreas: ["Gates", "Beslut", "Dokument", "Utvärdering"],
    phases: "Aktiv i alla faser, äger processen och dokumentationen",
  },
  {
    title: "IT-ansvarig / Teknisk expert",
    icon: "monitor",
    description: "Du bedömer tekniska aspekter: integration, säkerhet, datamigrering och arkitektur. Din insats är kritisk för att krav blir tekniskt realistiska.",
    responsibilities: [
      "Kartlägga befintligt IT-landskap och integrationer",
      "Bedöma teknisk genomförbarhet av krav",
      "Definiera integration- och säkerhetskrav",
      "Planera datamigrering vid systembyte",
      "Delta i teknisk anbudsutvärdering",
      "Stödja implementering och driftsättning",
    ],
    focusAreas: ["Risker (teknik)", "Krav (integration/säkerhet)", "Evidens"],
    phases: "Mest aktiv i Fas A (riskanalys), Fas B (tekniska krav) och Fas D (implementation)",
  },
  {
    title: "Ekonom / Controller",
    icon: "coins",
    description: "Du ansvarar för budgetfrågor, TCO-analys och prisutvärderings-aspekter.",
    responsibilities: [
      "Sätta budgetram och uppskattat värde",
      "Definiera priskriteriets utformning",
      "Analysera TCO i anbuden",
      "Bedöma prismodeller och risker för kostnadsöverskridning",
      "Granska kontraktsvillkor kring pris och indexering",
    ],
    focusAreas: ["Kriterier (pris)", "Kontraktsvillkor", "Beslut"],
    phases: "Mest aktiv i Fas B (prismodell) och Fas C (prisutvärdering)",
  },
  {
    title: "Jurist",
    icon: "scale",
    description: "Du granskar juridiska aspekter: LOU-efterlevnad, avtal, GDPR och överprövningsrisk.",
    responsibilities: [
      "Granska förfarandeval och kvalificeringskrav",
      "Säkerställa att krav är proportionerliga och icke-diskriminerande",
      "Granska kontraktsvillkor och avtal",
      "Bedöma GDPR-krav och PuB-avtal",
      "Stödja vid eventuell överprövning",
    ],
    focusAreas: ["Krav (juridik)", "Beslut", "Dokument", "Kontraktsvillkor"],
    phases: "Mest aktiv i Fas B (proportionalitet) och Fas C (tilldelning)",
  },
];

// ============================================================
// Phase overview for non-experts
// ============================================================

interface PhaseGuide {
  id: string;
  label: string;
  icon: string;
  purpose: string;
  keyQuestion: string;
  verksamhetRole: string;
  deliverables: string[];
  duration: string;
}

const PHASE_GUIDES: PhaseGuide[] = [
  {
    id: "A",
    label: "Fas A: Start & styrning",
    icon: "flag",
    purpose: "Definiera VAD som ska upphandlas, VEM som berörs och VILKA ramar som gäller.",
    keyQuestion: "Varför gör vi denna upphandling och vad vill vi uppnå?",
    verksamhetRole: "Formulera övergripande mål, identifiera kollegor som bör involveras, påbörja riskidentifiering.",
    deliverables: ["Mål och avgränsning", "Intressentanalys", "Initial riskanalys", "Projektorganisation"],
    duration: "2–4 veckor",
  },
  {
    id: "B",
    label: "Fas B: Förbered upphandlingen",
    icon: "pen-line",
    purpose: "Analysera behov, marknad och utforma kravspecifikation med utvärderingsmodell.",
    keyQuestion: "Vilka behov har vi, vilka krav ställer vi, och hur utvärderar vi anbuden?",
    verksamhetRole: "Delta aktivt i behovsworkshops, granska och validera krav, bidra till utvärderingsmodell. DIN INSATS ÄR MEST KRITISK HÄR.",
    deliverables: ["Behovsanalys", "Kravspecifikation (SKA/BÖR)", "Utvärderingsmodell", "Upphandlingsdokument"],
    duration: "4–12 veckor",
  },
  {
    id: "C",
    label: "Fas C: Genomför upphandlingen",
    icon: "inbox",
    purpose: "Publicera, ta emot anbud, utvärdera och fatta tilldelningsbeslut.",
    keyQuestion: "Vilket anbud ger bäst värde enligt vår utvärderingsmodell?",
    verksamhetRole: "Bedöma kravuppfyllelse i anbud, delta i poängsättning av kvalitetskriterier, granska utvärderingsresultat.",
    deliverables: ["Kvalificering av anbud", "Kravuppfyllelsematris", "Poängsättning", "Tilldelningsbeslut"],
    duration: "4–8 veckor",
  },
  {
    id: "D",
    label: "Fas D: Kontrakt → förvaltning",
    icon: "handshake",
    purpose: "Teckna avtal, implementera och sätta upp löpande förvaltning.",
    keyQuestion: "Hur säkerställer vi att det vi upphandlat verkligen levereras och fungerar?",
    verksamhetRole: "Delta i acceptanstest, utbilda kollegor, äga förvaltningsprocessen efter go-live.",
    deliverables: ["Avtal", "Implementeringsplan", "Utbildning", "Förvaltningsplan"],
    duration: "Löpande",
  },
];

// ============================================================
// FAQ items
// ============================================================

const FAQ_ITEMS: { question: string; answer: string; relatedTerms?: string[] }[] = [
  {
    question: "Hur vet jag om ett krav ska vara SKA eller BÖR?",
    answer: "SKA-krav är binära och eliminatoriska — om leverantören inte uppfyller kravet, diskvalificeras anbudet. Använd SKA endast för absolut nödvändiga funktioner. BÖR-krav ger extrapoäng och används för 'nice-to-have' funktioner som höjer kvaliteten. Tumregel: Om ni kan leva utan funktionen, gör det till BÖR.",
    relatedTerms: ["SKA-krav", "BÖR-krav", "Proportionalitet"],
  },
  {
    question: "Vad händer om vi inte kan spåra ett krav till ett behov?",
    answer: "Det är en allvarlig svaghet! Ett krav utan spårbart behov riskerar att anses oproportionerligt. Vid överprövning kan domstolen underkänna kravet. Använd verktygets spårbarhetsfunktion för att säkerställa att varje krav är länkat till minst ett dokumenterat behov.",
    relatedTerms: ["Spårbarhet", "Proportionalitet", "Överprövning"],
  },
  {
    question: "Hur många behov behöver vi dokumentera?",
    answer: "Det beror på upphandlingens omfattning. För ett mindre system räcker 10–20 välformulerade behov. För komplexa system kan det behövas 50–100. Kvalitet viktigare än kvantitet — varje behov ska vara unikt, mätbart och spårbart.",
    relatedTerms: ["Gate", "Spårbarhet"],
  },
  {
    question: "Kan vi ändra krav efter att upphandlingen publicerats?",
    answer: "Ja, men endast genom förtydliganden eller rättelser. Ändringen får INTE vara så omfattande att nya leverantörer skulle vilja delta. Stora ändringar kräver ny upphandling. Dokumentera alltid ändringar och kommunicera till alla anbudsgivare samtidigt.",
    relatedTerms: ["LOU", "Proportionalitet"],
  },
  {
    question: "Vad är skillnaden mellan kriterium och krav?",
    answer: "Ett KRAV beskriver vad systemet ska eller bör kunna göra (t.ex. 'Systemet ska exportera data i öppna format'). Ett KRITERIUM är en mätbar aspekt som används för att JÄMFÖRA anbud (t.ex. 'Användarvänlighet', vikt 20%, skala 0-5). Kriterier får endast utvärderas aspekter som är relevanta för krav och behov.",
    relatedTerms: ["Utvärderingskriterium", "SKA-krav", "BÖR-krav", "Spårbarhet"],
  },
  {
    question: "Hur undviker vi leverantörsinlåsning?",
    answer: "Ställ krav på öppna standarder, export i öppna format (CSV, XML, JSON), API-tillgång och dokumenterade exit-rutiner. Identifiera risken 'Inlåsning' i riskanalysen och koppla konkreta krav till denna risk. Kräv migreringsplan i anbuden.",
    relatedTerms: ["Riskmatris", "Spårbarhet", "Evidens"],
  },
  {
    question: "Vad gör vi om två anbud får exakt samma poäng?",
    answer: "Detta är ovanligt men kan hända. Ha en förutbestämd metod i utvärderingsmodellen, t.ex. 'vid lika poäng vinner lägsta pris' eller 'vid lika poäng vinner högst poäng i kriterium X'. Dokumentera metoden INNAN anbuden öppnas.",
    relatedTerms: ["Utvärderingskriterium", "Tilldelningsbeslut"],
  },
  {
    question: "Hur hanterar vi personuppgifter i upphandlingen?",
    answer: "Om systemet behandlar personuppgifter, krävs GDPR-krav och PuB-avtal (Personuppgiftsbiträdesavtal). Vid särskilt känsliga uppgifter (t.ex. socialtjänst, vård) krävs även DPIA (dataskyddskonsekvensbedömning). Involvera dataskyddsombud tidigt.",
    relatedTerms: ["DPIA", "Verifieringsplan"],
  },
  {
    question: "Måste alla gates vara gröna?",
    answer: "Blockerande gates (röda) måste vara gröna för att gå vidare. Varningsgates (gula) är rekommendationer — du kan gå vidare men bör åtgärda varningen. Verktyget visar vilka gates som är blockerande vs. varning.",
    relatedTerms: ["Gate", "Spårbarhet"],
  },
  {
    question: "Vad är TCO och hur räknar vi det?",
    answer: "TCO (Total Cost of Ownership) är den totala kostnaden under hela avtalsperioden: licenser + drift + support + anpassning + utbildning + migrering + exit. Använd verktygets Nyttokalkyl för att räkna TCO. Viktigt: billigaste anbud har sällan lägst TCO.",
    relatedTerms: ["TCO"],
  },
];

// ============================================================
// Common pitfalls
// ============================================================

const PITFALLS: { title: string; description: string; prevention: string; phase: string }[] = [
  {
    title: "För många SKA-krav",
    description: "Ställer 50+ SKA-krav, vilket leder till att inga leverantörer klarar kvalificeringen eller att upphandlingen anses oproportionerlig.",
    prevention: "Använd SKA endast för absolut nödvändiga funktioner. Övriga blir BÖR-krav. Tumregel: 60% BÖR, 40% SKA.",
    phase: "Fas B",
  },
  {
    title: "Krav utan behov",
    description: "Skriver krav som inte går att spåra till dokumenterade behov, vilket gör dem svåra att försvara vid överprövning.",
    prevention: "Använd verktygets spårbarhetsfunktion. Varje krav måste länkas till minst ett behov. Inga孤立krav.",
    phase: "Fas B",
  },
  {
    title: "Teknisk överspecifikation",
    description: "Beskriver lösningar istället för behov (t.ex. 'ska byggas i React' istället för 'ska vara responsiv').",
    prevention: "Fokusera på VAD som behövs, inte HUR. Låt leverantören välja teknisk lösning om det inte finns verkliga skäl.",
    phase: "Fas A-B",
  },
  {
    title: "Utvärderingsmodell utan ankare",
    description: "Kriterier saknar poängankare, vilket leder till inkonsekvent bedömning mellan olika bedömare.",
    prevention: "Definiera vad varje poängnivå innebär för varje kriterium INNAN anbud öppnas. Träna bedömarna tillsammans.",
    phase: "Fas B-C",
  },
  {
    title: "Glömmer intressenter",
    description: "Missar att involvera slutanvändare, IT-avdelning eller ekonomi, vilket leder till krav som inte speglar verkligheten.",
    prevention: "Gör grundlig intressentanalys i Fas A. Involvera alla berörda i workshops. Verksamhetsföreträdare är nyckeln.",
    phase: "Fas A",
  },
  {
    title: "Ingen riskanalys",
    description: "Identifierar inte risker som leverantörsinlåsning, datamigrering eller integrationsutmaningar förrän det är för sent.",
    prevention: "Använd verktygets riskmatris tidigt (Fas A). Varje risk med score ≥12 måste ha åtgärdskrav.",
    phase: "Fas A",
  },
  {
    title: "Svag verifieringsplan",
    description: "Krav utan tydlig metod för hur de ska verifieras, vilket leder till tvister om vad som faktiskt levereras.",
    prevention: "Varje SKA-krav ska ha verifieringsplan: Hur bevisas det i anbudet? Hur verifieras det vid implementation?",
    phase: "Fas B",
  },
  {
    title: "Motivering saknas i tilldelning",
    description: "Tilldelningsbeslut saknar tydlig motivering för varför vinnande leverantör valdes, vilket ökar överprövningsrisk.",
    prevention: "Dokumentera utvärderingen noggrant. Visa hur poäng gavs och motivera avvikelser från utvärderingsmodellen.",
    phase: "Fas C",
  },
];

// ============================================================
// Component
// ============================================================

type HelpTab = "overview" | "phases" | "roles" | "glossary" | "faq" | "pitfalls";

const TABS: { id: HelpTab; label: string; icon: string }[] = [
  { id: "overview", label: "Översikt", icon: "home" },
  { id: "phases", label: "Faserna", icon: "refresh-cw" },
  { id: "roles", label: "Roller", icon: "users" },
  { id: "faq", label: "Vanliga frågor", icon: "help-circle" },
  { id: "pitfalls", label: "Fallgropar", icon: "alert-triangle" },
  { id: "glossary", label: "Ordlista", icon: "book-open" },
];

export default function HelpPage() {
  const [tab, setTab] = useState<HelpTab>("overview");
  const [glossaryFilter, setGlossaryFilter] = useState("");

  const filteredGlossary = glossaryFilter
    ? GLOSSARY.filter(
        (g) =>
          g.term.toLowerCase().includes(glossaryFilter.toLowerCase()) ||
          g.definition.toLowerCase().includes(glossaryFilter.toLowerCase())
      )
    : GLOSSARY;

  return (
    <div>
      <Header
        title="Hjälpcenter"
        description="Lär dig om LOU-processen, din roll och centrala begrepp"
        breadcrumbs={[{ label: "Hjälp" }]}
      />
      <div className="p-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <div className="space-y-6 max-w-3xl">
            <Card>
              <CardContent>
                <CardTitle className="mb-3">Vad är LOU-stöd?</CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  LOU-stöd är ett verktyg som guidar dig genom hela upphandlingsprocessen enligt
                  Lagen om offentlig upphandling (LOU). Verktyget hjälper dig att dokumentera behov,
                  formulera krav, designa utvärderingsmodeller och fatta väl motiverade beslut —
                  allt med full spårbarhet.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CardTitle className="mb-3">Hur fungerar processen?</CardTitle>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Upphandlingen drivs genom 4 faser (A→B→C→D). Varje fas har <strong>gates</strong> (kontrollpunkter)
                    som måste klaras innan du kan gå vidare. Detta säkerställer kvalitet och LOU-efterlevnad.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PHASE_GUIDES.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-2">
                        {i > 0 && <span className="text-muted-foreground">→</span>}
                        <button
                          onClick={() => setTab("phases")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors"
                        >
                          <Icon name={p.icon} size={12} /> {p.label.split(":")[0]}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CardTitle className="mb-3">Spårbarhetskedjan — varför den är viktig</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">
                  Allt i upphandlingen hänger ihop. Kedjan nedan visar hur varje steg bygger på det föregående.
                  Utan spårbarhet riskerar krav att vara oproportionerliga och utvärderingar kan överprövas.
                </p>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded font-medium">
                    <Icon name="lightbulb" size={14} className="text-blue-800" /> Behov
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded font-medium">
                    <Icon name="shield-alert" size={14} className="text-purple-800" /> Risk
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded font-medium">
                    <Icon name="ruler" size={14} className="text-green-800" /> Krav
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded font-medium">
                    <Icon name="scale" size={14} className="text-orange-800" /> Kriterium
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded font-medium">
                    <Icon name="layout-dashboard" size={14} className="text-red-800" /> Poäng
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CardTitle className="mb-3">Är du verksamhetsföreträdare?</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">
                  Som verksamhetsföreträdare är din insats mest kritisk i <strong>Fas A</strong> (behovsanalys)
                  och <strong>Fas B</strong> (kravdesign). Du behöver inte vara upphandlingsexpert — men du
                  måste kunna beskriva verksamhetens behov, arbetsflöden och utmaningar.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm space-y-2">
                  <div className="font-medium text-primary">Dina viktigaste uppgifter:</div>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Delta i <strong>workshops</strong> — dela din verksamhetskunskap</li>
                    <li>Formulera <strong>behov</strong> — vad behöver ni i vardagen?</li>
                    <li>Granska <strong>krav</strong> — stämmer de med verkligheten?</li>
                    <li>Bedöm <strong>anbud</strong> — uppfyller de era behov?</li>
                    <li>Testa och <strong>acceptera</strong> — fungerar systemet för er?</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CardTitle className="mb-3">Tips för verksamhetsföreträdare</CardTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { tip: "Beskriv behov, inte lösningar", detail: "Skriv 'Vi behöver se realtidsstatus på ärenden' istället för 'Vi behöver en dashboard med React'." },
                    { tip: "Tänk konsekvens", detail: "Vad händer om behovet INTE uppfylls? Det stärker kravets motivering." },
                    { tip: "Prioritera ärligt", detail: "Allt kan inte vara P1. Prioritering hjälper till att skilja SKA från BÖR." },
                    { tip: "Ge konkreta exempel", detail: "Istället för 'snabbt system' — beskriv vad 'snabbt' innebär i er vardag." },
                    { tip: "Involvera kollegor", detail: "Fler perspektiv ger bättre behov. Glöm inte slutanvändarna." },
                    { tip: "Våga ifrågasätta", detail: "Om ett krav inte speglar verksamheten — säg ifrån. Du äger behovsbilden." },
                  ].map((item) => (
                    <div key={item.tip} className="border border-border rounded-lg p-3">
                      <div className="text-sm font-medium">{item.tip}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CardTitle className="mb-3">Användbara verktyg i systemet</CardTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/tools/risk-matrix" className="border border-border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="shield-alert" size={16} className="text-primary" />
                      <div className="text-sm font-medium">Riskmatris</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Identifiera och hantera risker tidigt. Score ≥12 kräver åtgärd.</div>
                  </Link>
                  <Link href="/tools/benefit-calculator" className="border border-border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="calculator" size={16} className="text-primary" />
                      <div className="text-sm font-medium">Nyttokalkyl</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Räkna TCO och jämför anbud ekonomiskt.</div>
                  </Link>
                  <Link href="/tools/stakeholder-map" className="border border-border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="users" size={16} className="text-primary" />
                      <div className="text-sm font-medium">Intressentanalys</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Identifiera alla berörda parter och deras inflytande.</div>
                  </Link>
                  <Link href="/tools/evaluation-model" className="border border-border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="scale" size={16} className="text-primary" />
                      <div className="text-sm font-medium">Utvärderingsmodell</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Designa kriterier, vikter och poängankare.</div>
                  </Link>
                  <Link href="/tools/timeline-planner" className="border border-border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="clock" size={16} className="text-primary" />
                      <div className="text-sm font-medium">Tidslinjeplanerare</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Planera milstolpar och deadlines för upphandlingen.</div>
                  </Link>
                  <Link href="/tools/kunskapsbank" className="border border-border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="book-open" size={16} className="text-primary" />
                      <div className="text-sm font-medium">Kunskapsbank</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Lär dig om upphandlingsdomäner och bästa praxis.</div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Phases tab */}
        {tab === "phases" && (
          <div className="space-y-4 max-w-3xl">
            {PHASE_GUIDES.map((phase) => (
              <Card key={phase.id}>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Icon name={phase.icon} size={24} className="text-muted-foreground" />
                    <div>
                      <CardTitle>{phase.label}</CardTitle>
                      <div className="text-xs text-muted-foreground">Typisk längd: {phase.duration}</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{phase.purpose}</p>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
                    <div className="text-xs font-semibold text-primary mb-1">Nyckelfråga</div>
                    <div className="text-sm italic">{phase.keyQuestion}</div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="text-xs font-semibold text-blue-700 mb-1">Din roll som verksamhetsföreträdare</div>
                    <div className="text-sm text-blue-900">{phase.verksamhetRole}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1.5">Leverabler</div>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.deliverables.map((d) => (
                        <span key={d} className="bg-muted px-2 py-0.5 rounded text-xs">{d}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Roles tab */}
        {tab === "roles" && (
          <div className="space-y-4 max-w-3xl">
            {ROLES.map((role) => (
              <Card key={role.title}>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Icon name={role.icon} size={24} className="text-muted-foreground" />
                    <div>
                      <CardTitle>{role.title}</CardTitle>
                      <div className="text-xs text-muted-foreground">{role.phases}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1.5">Ansvarsområden</div>
                      <ul className="text-xs space-y-1">
                        {role.responsibilities.map((r) => (
                          <li key={r} className="flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1.5">Fokusområden i verktyget</div>
                      <div className="flex flex-wrap gap-1">
                        {role.focusAreas.map((a) => (
                          <span key={a} className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* FAQ tab */}
        {tab === "faq" && (
          <div className="max-w-3xl space-y-3">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Vanliga frågor från verksamhetsföreträdare och projektledare. Klicka på en fråga för att se svaret.
              </p>
            </div>
            {FAQ_ITEMS.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <Icon name="help-circle" size={18} className="text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground mb-2">{item.question}</div>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                      {item.relatedTerms && (
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">Relaterat:</span>
                          {item.relatedTerms.map((term) => (
                            <button
                              key={term}
                              onClick={() => setTab("glossary")}
                              className="text-xs bg-muted hover:bg-muted/80 px-2 py-0.5 rounded transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pitfalls tab */}
        {tab === "pitfalls" && (
          <div className="max-w-3xl space-y-3">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Vanliga fallgropar i upphandlingsprocessen — och hur du undviker dem.
              </p>
            </div>
            {PITFALLS.map((pitfall, idx) => (
              <Card key={idx}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <Icon name="alert-triangle" size={18} className="text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-semibold text-foreground">{pitfall.title}</div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{pitfall.phase}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                          <div className="text-xs font-semibold text-destructive mb-1">Problem</div>
                          <p className="text-xs text-muted-foreground">{pitfall.description}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                          <div className="text-xs font-semibold text-emerald-700 mb-1">Förebygg</div>
                          <p className="text-xs text-emerald-900">{pitfall.prevention}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Glossary tab */}
        {tab === "glossary" && (
          <div className="max-w-3xl space-y-4">
            <div className="relative">
              <input
                type="text"
                value={glossaryFilter}
                onChange={(e) => setGlossaryFilter(e.target.value)}
                placeholder="Sök begrepp..."
                className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {glossaryFilter && (
                <button
                  onClick={() => setGlossaryFilter("")}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {filteredGlossary.length} av {GLOSSARY.length} begrepp
            </div>
            <div className="space-y-2">
              {filteredGlossary.map((g) => (
                <Card key={g.term}>
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary text-xs font-bold rounded px-2 py-1 shrink-0 mt-0.5">
                        {g.term}
                      </span>
                      <div>
                        <p className="text-sm">{g.definition}</p>
                        {g.example && (
                          <p className="text-xs text-muted-foreground mt-1 italic">Exempel: {g.example}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

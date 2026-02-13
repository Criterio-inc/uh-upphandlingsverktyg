"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";

/* ------------------------------------------------------------------ */
/*  Course data types                                                  */
/* ------------------------------------------------------------------ */

interface Module {
  title: string;
  content: string[];
  keyTakeaway: string;
}

interface CourseData {
  id: string;
  title: string;
  icon: string;
  description: string;
  level: string;
  modules: Module[];
}

/* ------------------------------------------------------------------ */
/*  Course content — all 5 courses                                     */
/* ------------------------------------------------------------------ */

const COURSES: Record<string, CourseData> = {
  "upphandling-lou": {
    id: "upphandling-lou",
    title: "Upphandling & LOU",
    icon: "scale",
    description:
      "Grunderna i Lagen om offentlig upphandling — tröskelvärden, förfaranden, annonsering, utvärdering och tilldelning.",
    level: "Grundläggande",
    modules: [
      {
        title: "Introduktion till LOU",
        content: [
          "Lagen om offentlig upphandling (LOU 2016:1145) reglerar hur myndigheter och andra offentliga organ köper varor, tjänster och byggentreprenader. Syftet är att säkerställa konkurrens, likabehandling och transparens.",
          "LOU bygger på EU:s upphandlingsdirektiv (2014/24/EU) och gäller för alla upphandlande myndigheter — kommuner, regioner, statliga myndigheter och offentligt styrda organ.",
          "De fem grundprinciperna är: icke-diskriminering, likabehandling, proportionalitet, ömsesidigt erkännande och öppenhet.",
        ],
        keyTakeaway:
          "LOU säkerställer att skattemedel används effektivt genom öppen konkurrens.",
      },
      {
        title: "Tröskelvärden och beräkning",
        content: [
          "Tröskelvärdena avgör vilka regler som gäller. Över EU-tröskelvärdet gäller direktivstyrd upphandling; under gäller förenklat förfarande.",
          "För varor och tjänster ligger EU-tröskeln runt 2,3 MSEK (2024), för byggentreprenader ca 58 MSEK. Värdena uppdateras vartannat år.",
          "Beräkning: Uppskattat kontraktsvärde exklusive moms över hela avtalstiden inklusive optioner. Uppdelning för att undvika tröskeln är förbjuden.",
        ],
        keyTakeaway:
          "Kontraktsvärdet bestämmer regelverket — över eller under tröskeln.",
      },
      {
        title: "Upphandlingsförfaranden",
        content: [
          "Öppet förfarande: Alla leverantörer får lämna anbud. Mest använt, särskilt för tydligt definierade behov.",
          "Selektivt förfarande: Tvåstegsprocess — först kvalificering, sedan anbud från utvalda. Används vid många potentiella leverantörer.",
          "Förhandlat förfarande med föregående annonsering: Kräver särskilda skäl, exempelvis komplexa behov eller om öppet förfarande inte gett giltiga anbud.",
          "Konkurrenspolitisk dialog: För särskilt komplexa projekt där myndigheten behöver dialog för att definiera lösningen.",
        ],
        keyTakeaway:
          "Valet av förfarande styrs av behovets komplexitet och kontraktsvärdet.",
      },
      {
        title: "Kravställning och upphandlingsdokument",
        content: [
          "Kravspecifikationen är upphandlingens ryggrad. Den definierar obligatoriska krav (ska-krav) och utvärderingsbara krav (bör-krav/tilldelningskriterier).",
          "Ska-krav är absoluta — anbud som inte uppfyller dem förkastas. Bör-krav påverkar poängsättningen.",
          "Krav ska vara proportionella, icke-diskriminerande och möjliga att verifiera. Undvik produktspecifika krav — använd funktionskrav.",
        ],
        keyTakeaway:
          "Tydliga, proportionella krav är grunden för en lyckad upphandling.",
      },
      {
        title: "Annonsering och tidfrister",
        content: [
          "Över EU-tröskeln annonseras i TED (Tenders Electronic Daily). Under tröskeln annonseras i nationella databaser.",
          "Tidsfrister varierar per förfarande: Öppet — minst 30 dagar (EU), 22 dagar med förhandsannonsering. Selektivt — 30 dagar för anbåkan, 25 dagar för anbud.",
          "Elektronisk annonsering är obligatorisk. Alla leverantörer ska kunna ta del av upphandlingsdokumenten kostnadsfritt.",
        ],
        keyTakeaway:
          "Annonsering säkerställer transparens och räckvidd till potentiella leverantörer.",
      },
      {
        title: "Utvärdering och tilldelning",
        content: [
          "Tre tilldelningsgrunder: bästa förhållandet mellan pris och kvalitet, kostnad (livscykelkostnad), eller lägsta pris.",
          "Utvärderingsmodeller: poängmodell (viktad summa), prisavdragsmodell (mervärde minskar pris), eller fastprismodell (bäst kvalitet vid givet pris).",
          "Alla tilldelningskriterier ska vara transparenta, viktade och möjliga att verifiera. De ska ha koppling till upphandlingsföremålet.",
        ],
        keyTakeaway:
          "Utvärderingsmodellen måste vara tydlig, transparent och definierad i förväg.",
      },
      {
        title: "Tilldelningsbeslut och avtalstecknande",
        content: [
          "När utvärderingen är klar meddelas tilldelningsbeslutet till alla anbudsgivare. Beslutet ska motiveras.",
          "Avtalsspärren (standstill-perioden) är minst 10 dagar (15 dagar vid brevmeddelande). Under denna tid kan leverantörer överpröva.",
          "Avtal tecknas efter avtalsspärren. Avtalet ska återspegla upphandlingsdokumenten — väsentliga ändringar är inte tillåtna.",
        ],
        keyTakeaway:
          "Standstill-perioden ger leverantörer rätt att överpröva beslutet.",
      },
      {
        title: "Överprövning och uppföljning",
        content: [
          "Överprövning sker i förvaltningsdomstol. Leverantören måste visa att ett fel har begåtts och att det har orsakat skada.",
          "Domstolen kan besluta om rättelse (gör om utvärderingen) eller att upphandlingen ska göras om helt.",
          "Avtalsuppföljning är avgörande: kontrollera att leverantören levererar enligt avtal. Dokumentera avvikelser och hantera dem systematiskt.",
        ],
        keyTakeaway:
          "Uppföljning är lika viktig som upphandlingen — det säkrar leveransens kvalitet.",
      },
    ],
  },

  kravhantering: {
    id: "kravhantering",
    title: "Kravhantering",
    icon: "ruler",
    description:
      "Från behov till kravspecifikation — behovsanalys, funktionella vs icke-funktionella krav, kravspårbarhet och verifiering.",
    level: "Medel",
    modules: [
      {
        title: "Behovsanalys",
        content: [
          "Behovsanalysen är grunden för all kravhantering. Den besvarar: Varför behöver vi detta? Vad är problemet vi löser?",
          "Använd intressentanalys för att identifiera alla berörda parter och deras behov. Prioritera behov med MoSCoW (Must, Should, Could, Won't).",
          "Dokumentera behoven strukturerat med unikt ID, beskrivning, källa (intressent), prioritet och spårbarhet till övergripande mål.",
        ],
        keyTakeaway:
          "Tydliga, väldokumenterade behov förebygger kravmissförstånd.",
      },
      {
        title: "Funktionella krav",
        content: [
          "Funktionella krav beskriver vad systemet/tjänsten ska göra. De uttrycks som berättelser: \"Som [roll] vill jag [funktion] så att [nytta].\"",
          "Exempel: \"Systemet ska kunna hantera minst 500 samtida användare.\" \"Användaren ska kunna exportera data i CSV-format.\"",
          "Varje funktionellt krav behöver: unikt ID, beskrivning, verifieringsmetod, prioritet (SKA/BÖR) och spårbarhet till behov.",
        ],
        keyTakeaway:
          "Funktionella krav definierar systemets beteende — gör dem testbara.",
      },
      {
        title: "Icke-funktionella krav",
        content: [
          "Icke-funktionella krav (NFR) handlar om hur systemet presterar: prestanda, säkerhet, tillgänglighet, skalbarhet, underhållbarhet.",
          "Använd ISO 25010 som ramverk för kvalitetsegenskaper. Modellen täcker 8 huvudkategorier med underkategorier.",
          "Kvantifiera NFR: \"Systemet ska svara inom 2 sekunder vid 95:e percentilen\" är bättre än \"Systemet ska vara snabbt.\"",
        ],
        keyTakeaway:
          "Mätbara icke-funktionella krav är avgörande för upplevd kvalitet.",
      },
      {
        title: "Kravspecifikation",
        content: [
          "Kravspecifikationen samlar alla krav i ett strukturerat dokument. Använd hierarkisk struktur: Kapitel, Kravområde, Enskilt krav.",
          "Varje krav ska vara: entydigt, testbart, spårbart, konsistent med andra krav och genomförbart.",
          "Undvik vaghet: \"Systemet ska vara användarvänligt\" är dåligt. \"Systemet ska följa WCAG 2.1 AA\" är bra.",
        ],
        keyTakeaway:
          "En bra kravspecifikation är testbar, spårbar och entydig.",
      },
      {
        title: "Kravspårbarhet",
        content: [
          "Spårbarhet innebär att kunna följa ett krav från behov, genom specifikation, till implementation och verifiering.",
          "Använd en spårbarhetsmatris: Behov → Krav → Designbeslut → Testfall. Detta säkerställer att inget behov tappas bort.",
          "Spårbarhet hjälper vid ändringshantering: när ett behov ändras kan du snabbt se vilka krav, design och tester som påverkas.",
        ],
        keyTakeaway:
          "Spårbarhet säkerställer att alla behov täcks och att ändringar hanteras kontrollerat.",
      },
      {
        title: "Verifiering och validering",
        content: [
          "Verifiering: \"Byggde vi rätt?\" — kontrollerar att leveransen uppfyller kravspecifikationen genom granskning, test eller inspektion.",
          "Validering: \"Byggde vi rätt sak?\" — kontrollerar att leveransen möter det verkliga behovet hos användarna.",
          "Skapa testfall som direkt spårar till krav. Varje SKA-krav behöver minst ett testfall. Dokumentera resultat och avvikelser.",
        ],
        keyTakeaway:
          "Både verifiering (rätt byggt) och validering (rätt sak) krävs.",
      },
    ],
  },

  formagabedomning: {
    id: "formagabedomning",
    title: "Förmågebedömning",
    icon: "gauge",
    description:
      "Utvärdera förmågor inom människa, teknik och process — mognadsmodeller, gap-analys, handlingsplaner.",
    level: "Medel",
    modules: [
      {
        title: "Vad är förmåga?",
        content: [
          "Förmåga (capability) är en organisations samlade kapacitet att leverera ett önskat utfall. Den består av tre dimensioner: Människa, Teknik och Process.",
          "Människa: Kompetens, erfarenhet, motivation och organisation. Teknik: Verktyg, system och infrastruktur. Process: Arbetssätt, rutiner och styrning.",
          "Förmågebedömning syftar till att identifiera nuvarande nivå, önskad nivå och gapet däremellan — för att kunna prioritera insatser.",
        ],
        keyTakeaway:
          "Förmåga = Människa + Teknik + Process. Alla tre måste bedömas.",
      },
      {
        title: "Mognadsmodeller",
        content: [
          "CMM/CMMI (Capability Maturity Model Integration) definierar fem mognadsnivåer: Initial, Managed, Defined, Quantitatively Managed, Optimizing.",
          "Nivå 1 (Initial): Ostrukturerat, ad hoc. Nivå 2 (Managed): Grundläggande styrning. Nivå 3 (Defined): Standardiserade processer.",
          "Använd mognadsmodellen som ett kommunikationsverktyg — inte som ett betyg. Fokus på att identifiera förbättringsområden.",
        ],
        keyTakeaway:
          "Mognadsnivåer hjälper organisationen förstå var den står och vart den behöver gå.",
      },
      {
        title: "Gap-analys",
        content: [
          "Gap-analys jämför nuvarande förmåga (AS-IS) med önskad förmåga (TO-BE). Skillnaden är gapet som måste överbryggas.",
          "För varje förmågeområde: bedöm nuläge (1–5), definiera målnivå, identifiera gap, estimera insats och prioritera.",
          "Visualisera med spindeldiagram (radar chart) för att tydliggöra styrkor och svagheter över alla dimensioner.",
        ],
        keyTakeaway:
          "Gap-analys kvantifierar skillnaden mellan nuläge och mål.",
      },
      {
        title: "Bedömning av människa",
        content: [
          "Kompetensbedömning: Inventera roller, kompetenser och certifieringar. Jämför med krävd kompetens för målförmågan.",
          "Organisationsbedömning: Är ansvar och roller tydliga? Finns rätt ledarskap? Är teamet rätt dimensionerat?",
          "Kulturbedömning: Finns lärandekultur? Uppmuntras förbättring? Hur hanteras misstag?",
        ],
        keyTakeaway:
          "Människan är ofta den mest kritiska och mest underskattade dimensionen.",
      },
      {
        title: "Handlingsplan och roadmap",
        content: [
          "Baserat på gap-analysen: skapa en handlingsplan med konkreta åtgärder, ansvariga, tidplan och förväntad effekt.",
          "Prioritera med avseende på affärsnytta vs insats. \"Quick wins\" (låg insats, hög nytta) först, sedan strategiska initiativ.",
          "Skapa en förmågeroadmap med milstolpar på 3, 6 och 12 månader. Följ upp kvartalsvis med ny bedömning.",
        ],
        keyTakeaway:
          "Handlingsplanen omsätter gap-analysen till konkreta, prioriterade insatser.",
      },
    ],
  },

  systemforvaltning: {
    id: "systemforvaltning",
    title: "Systemförvaltning",
    icon: "server-cog",
    description:
      "Strukturerad IT-förvaltning — förvaltningsobjekt, roller, budgetering, livscykelhantering och pm3-inspirerat arbetssätt.",
    level: "Medel",
    modules: [
      {
        title: "Vad är systemförvaltning?",
        content: [
          "Systemförvaltning handlar om att säkerställa att IT-system levererar värde över tid — från driftsättning till avveckling.",
          "Utan strukturerad förvaltning förfalls system: säkerhetsbrister, teknisk skuld, missnöjda användare och stigande kostnader.",
          "pm3 (Practical Product Management) är en svensk förvaltningsmodell som organiserar förvaltning runt förvaltningsobjekt med tydliga roller.",
        ],
        keyTakeaway:
          "Strukturerad förvaltning förlänger systemets livslängd och optimerar värdeleveransen.",
      },
      {
        title: "Förvaltningsobjekt",
        content: [
          "Ett förvaltningsobjekt är det som förvaltas: ett system, en tjänst eller en grupp av relaterade system.",
          "Varje förvaltningsobjekt behöver: en ägare (verksamhetsansvarig), en förvaltningsledare, budget och en förvaltningsplan.",
          "Avgränsning är viktigt: ett förvaltningsobjekt ska vara lagom stort — överskådligt men inte trivialt.",
        ],
        keyTakeaway:
          "Förvaltningsobjektet är den grundläggande enheten — allt organiseras kring det.",
      },
      {
        title: "Roller och ansvar",
        content: [
          "Objektägare: Verksamhetsansvarig som prioriterar och beslutar. Ansvarar för att objektet levererar affärsnytta.",
          "Förvaltningsledare: Operativt ansvarig för den dagliga förvaltningen. Samordnar verksamhet och IT.",
          "Förvaltningsgrupp: Tvärfunktionellt team med verksamhetskompetens och teknisk kompetens. Arbetar med ärenden, förbättringar och förändringar.",
        ],
        keyTakeaway:
          "Tydliga roller är avgörande — särskilt gränssnittet verksamhet/IT.",
      },
      {
        title: "Budget och styrning",
        content: [
          "Förvaltningsbudget består av: driftkostnad (baseline), vidareutveckling (ändringar), och förbättringsarbete.",
          "Använd årshjul: Budgetplanering (Q4), förvaltningsplan (Q1), kvartalsuppföljning, årsutvärdering.",
          "Styrning: Nyckeltal (KPI) som användarnöjdhet, tillgänglighet, ärendehanteringstid, andel lösta ärenden.",
        ],
        keyTakeaway:
          "Budget och styrning säkerställer att förvaltningen är ekonomiskt hållbar.",
      },
      {
        title: "Livscykelhantering",
        content: [
          "Varje system går genom faser: Anskaffning → Införande → Förvaltning → Vidareutveckling → Avveckling.",
          "Under förvaltningsfasen: hantera incidenter, genomför ändringar, optimera prestanda och planera för nästa fas.",
          "Avvecklingsplanering bör starta tidigt — datamigration, avtal, kunskapsöverföring och utfasning kräver tid.",
        ],
        keyTakeaway:
          "Tänk livscykel från dag ett — avveckling är en del av planen.",
      },
      {
        title: "Kontinuerlig förbättring",
        content: [
          "Använd PDCA-cykeln (Plan, Do, Check, Act) för systematiskt förbättringsarbete.",
          "Samla in förbättringsförslag från användare, förvaltningsgrupp och ledning. Prioritera med nytta vs kostnad.",
          "Mät effekt: Definiera baseline innan förändring, mät efter, och besluta om justering eller fortsatt utrullning.",
        ],
        keyTakeaway:
          "Förvaltning är inte statisk — kontinuerlig förbättring är kärnan.",
      },
    ],
  },

  "forandringsledning-adkar": {
    id: "forandringsledning-adkar",
    title: "Förändringsledning ADKAR",
    icon: "repeat",
    description:
      "Prosci ADKAR-modellen steg för steg — Awareness, Desire, Knowledge, Ability, Reinforcement — med praktiska verktyg.",
    level: "Grundläggande",
    modules: [
      {
        title: "Introduktion till ADKAR",
        content: [
          "ADKAR är en modell för individuell förändring, utvecklad av Prosci. Den beskriver fem sekventiella steg som varje person måste gå igenom.",
          "A = Awareness (medvetenhet om behovet av förändring), D = Desire (önskan att delta), K = Knowledge (kunskap om hur), A = Ability (förmåga att genomföra), R = Reinforcement (förstärkning för att behålla).",
          "Modellens styrka är att den fokuserar på individen — organisationsförändring sker när tillräckligt många individer förändras.",
        ],
        keyTakeaway:
          "ADKAR fokuserar på individen — organisationer förändras en person i taget.",
      },
      {
        title: "Awareness — Medvetenhet",
        content: [
          "Awareness handlar om att förstå varför förändringen behövs. Utan förståelse för \"varför\" uppstår motstånd.",
          "Viktiga aktiviteter: Kommunicera problemet/möjligheten, dela data och fakta, förklara konsekvenser av att inte förändra.",
          "Kommunikation bör komma från två källor: sponsorn (ledningen) för det strategiska \"varför\", och närmaste chef för det personliga \"vad innebär det för mig?\".",
        ],
        keyTakeaway:
          "Kommunicera \"varför\" innan \"vad\" — förståelse minskar motstånd.",
      },
      {
        title: "Desire — Önskan",
        content: [
          "Desire är den personliga motivationen att delta i förändringen. Den kan inte kommenderas — den måste växa fram.",
          "Faktorer som påverkar: \"What's in it for me?\" (personlig vinst), förtroende för ledningen, organisationskultur och påverkan av kollegor.",
          "Hantera motstånd: Lyssna aktivt, adressera oro, involvera berörda tidigt, visa konsekvenser av att inte delta.",
        ],
        keyTakeaway:
          "Du kan inte tvinga motivation — men du kan skapa förutsättningar för den.",
      },
      {
        title: "Knowledge — Kunskap",
        content: [
          "Knowledge handlar om att ge individen kunskap om hur förändringen genomförs — nya processer, verktyg, beteenden.",
          "Utbildningsinsatser: formell utbildning, e-lärande, workshops, mentorskap, handledning, \"show and tell\".",
          "Timing är avgörande: utbildning för tidigt glöms bort, för sent skapar stress. Planera just-in-time utbildning.",
        ],
        keyTakeaway:
          "Utbilda när behovet är som störst — just-in-time, inte just-in-case.",
      },
      {
        title: "Ability — Förmåga",
        content: [
          "Ability är skillnaden mellan att veta hur och att kunna göra det i praktiken. Kunskap är nödvändig men inte tillräcklig.",
          "Stöd för ability: övningstillfällen, pilotprojekt, coachning, superusers/ambassadörer, tillgång till hjälp.",
          "Identifiera hinder: tekniska begränsningar, tidsbrist, kompetensgap, organisatoriska barriärer. Ta bort dem aktivt.",
        ],
        keyTakeaway:
          "Förmåga kräver övning och stöd — kunskap ensam räcker inte.",
      },
      {
        title: "Reinforcement — Förstärkning",
        content: [
          "Reinforcement säkerställer att förändringen håller över tid. Utan förstärkning återgår människor till gamla beteenden.",
          "Verktyg: fira framgångar, erkänn bidrag, mät och visa resultat, samla feedback, korrigera avvikelser.",
          "Sponsorns roll är avgörande: synligt stöd, fortsatt kommunikation, och snabb hantering av tillbakagång.",
        ],
        keyTakeaway:
          "Förändring är inte klar vid lansering — förstärkning är det som gör den bestående.",
      },
      {
        title: "ADKAR i praktiken",
        content: [
          "Använd ADKAR-bedömning: låt individer självskatta A, D, K, A, R på skala 1–5. Identifiera \"barriärpunkten\" — det första steget med låg poäng.",
          "Åtgärder riktas mot barriärpunkten: om Awareness är låg — kommunicera mer. Om Ability är låg — ge mer stöd och övning.",
          "Kombinera ADKAR med projektledning: ADKAR hanterar \"människosidan\", projektplanen hanterar \"tekniska sidan\". Båda behövs.",
        ],
        keyTakeaway:
          "Hitta barriärpunkten och fokusera insatserna där — det är nyckeln.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const course = COURSES[courseId];

  if (!course) {
    notFound();
  }

  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));
  const [completedModules, setCompletedModules] = useState<Set<number>>(
    new Set()
  );

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`critero-training-${courseId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completed) {
          setCompletedModules(new Set(parsed.completed));
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [courseId]);

  // Save progress
  useEffect(() => {
    if (completedModules.size > 0) {
      localStorage.setItem(
        `critero-training-${courseId}`,
        JSON.stringify({ completed: Array.from(completedModules) })
      );
    }
  }, [completedModules, courseId]);

  const toggleModule = (idx: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const toggleComplete = (idx: number) => {
    setCompletedModules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const progress = course.modules.length
    ? Math.round((completedModules.size / course.modules.length) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <nav className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Link
              href="/cases"
              className="hover:text-primary transition-colors duration-150"
            >
              Upphandlingar
            </Link>
            <span className="mx-0.5 text-border">/</span>
            <Link
              href="/training"
              className="hover:text-primary transition-colors duration-150"
            >
              Utbildning
            </Link>
            <span className="mx-0.5 text-border">/</span>
            <span className="text-foreground font-medium">{course.title}</span>
          </nav>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {course.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                {course.description}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon name={course.icon} size={20} className="text-primary" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {completedModules.size} av {course.modules.length} moduler
                  klara
                </span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="px-8 py-6 max-w-3xl space-y-3">
        {course.modules.map((mod, idx) => {
          const isOpen = openModules.has(idx);
          const isDone = completedModules.has(idx);

          return (
            <div
              key={idx}
              className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
            >
              {/* Module header */}
              <button
                onClick={() => toggleModule(idx)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-accent/30 transition-colors"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                    isDone
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <Icon name="check" size={14} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}
                  >
                    {mod.title}
                  </p>
                </div>
                <Icon
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
              </button>

              {/* Module content (collapsible) */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-border/40">
                  <div className="pt-4 space-y-3">
                    {mod.content.map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-sm text-muted-foreground leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Key takeaway */}
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                    <div className="flex items-start gap-2">
                      <Icon
                        name="lightbulb"
                        size={16}
                        className="text-primary mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-primary mb-0.5">
                          Nyckelinsikt
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {mod.keyTakeaway}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mark complete button */}
                  <button
                    onClick={() => toggleComplete(idx)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isDone
                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon name={isDone ? "check-circle" : "circle-dot"} size={14} />
                    {isDone ? "Markerad som klar" : "Markera som klar"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back link */}
      <div className="px-8 pb-8">
        <Link
          href="/training"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <Icon name="arrow-left" size={14} />
          Tillbaka till kurser
        </Link>
      </div>
    </div>
  );
}

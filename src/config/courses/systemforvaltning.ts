import type { EnhancedCourse } from "./types";

export const systemforvaltning: EnhancedCourse = {
  id: "systemforvaltning",
  title: "Systemförvaltning",
  icon: "server-cog",
  description:
    "Strukturerad IT-förvaltning — förvaltningsobjekt, roller, budgetering, livscykelhantering och pm3-inspirerat arbetssätt.",
  level: "Medel",
  estimatedMinutes: 55,
  tags: ["Förvaltning", "IT", "Livscykel"],
  modules: [
    /* ================================================================== */
    /*  Modul 1 — Grunderna i systemförvaltning                           */
    /* ================================================================== */
    {
      id: "systemforvaltning-1",
      title: "Grunderna i systemförvaltning",
      theory: {
        content: [
          "Systemförvaltning handlar om att säkerställa att IT-system fungerar, utvecklas och ger värde under hela sin livscykel. Det är inte bara en teknisk fråga — förvaltning kräver ett strukturerat samarbete mellan verksamhet och IT. PM3-modellen (Praktisk Modell för Multisourcing Management), som är den mest använda förvaltningsmodellen i svensk offentlig sektor, bygger på tre pelare: förvaltningsobjekt (vad som förvaltas), förvaltningsorganisation (vem som förvaltar) och förvaltningsprocesser (hur förvaltningen bedrivs). PM3 betonar särskilt att verksamheten — inte IT — ska äga förvaltningsansvaret, eftersom systemets värde realiseras i verksamheten.",
          "En vanlig missuppfattning är att förvaltning bara handlar om driftstöd och felavhjälpning. ITIL 4 (IT Infrastructure Library, version 4) introducerar begreppet Service Value System (SVS), som beskriver förvaltning som en värdeskapande kedja. SVS omfattar styrande principer (guiding principles), styrning (governance), tjänstevärdekedjans aktiviteter (service value chain), ITIL-practices och ständig förbättring (continual improvement). Enligt ITIL 4 ska varje aktivitet i förvaltningen bidra till att skapa värde för tjänstekonsumenten, inte bara upprätthålla teknisk drift.",
          "ISO 20000 (internationell standard för IT-tjänstehantering) ställer formella krav på hur en organisation ska planera, implementera, drifta, övervaka och förbättra ett ledningssystem för IT-tjänster (SMS — Service Management System). Standarden kräver dokumenterade processer för incidenthantering, problemhantering, ändringshantering och releasehantering. För offentliga organisationer som upphandlar förvaltning ger ISO 20000 en konkret referensram för att formulera krav på leverantörers mognadsnivå.",
          "Utvecklingen inom systemförvaltning har gått från reaktiv brandkårsutryckning till proaktiv och värdedriven tjänstehantering. FitSM (Federated IT Service Management) erbjuder ett lättviktigt alternativ till ITIL, särskilt anpassat för mindre organisationer och samverkansmiljöer. FitSM definierar 14 kärnprocesser och kan fungera som en pragmatisk startpunkt för organisationer som vill professionalisera sin förvaltning utan den omfattande dokumentation som ITIL eller ISO 20000 kräver.",
        ],
        keyPoints: [
          "PM3 bygger på tre pelare: förvaltningsobjekt, organisation, processer — verksamheten äger förvaltningen",
          "ITIL 4 Service Value System beskriver förvaltning som en värdeskapande kedja",
          "ISO 20000 ställer formella krav på ledningssystem för IT-tjänster",
          "FitSM erbjuder ett lättviktigt alternativ med 14 kärnprocesser",
          "Förvaltning har utvecklats från reaktiv drift till proaktiv värdeskapande tjänstehantering",
        ],
      },
      scenario: {
        id: "scenario-sf-1",
        title: "Kommunen som saknar förvaltningsmodell",
        context:
          "Du arbetar på en medelstor kommun som nyligen har driftsatt ett nytt ekonomisystem. Systemet levererades av en extern leverantör och driftshålls i molnet. Det finns ingen formell förvaltningsorganisation — supportärenden hanteras av den som råkar ha tid, och vidareutveckling beställs direkt av enskilda chefer till leverantören.",
        steps: [
          {
            situation:
              "Ekonomichefen klagar på att systemet inte fungerar som förväntat: rapporter saknas, integrationen med lönesystemet har buggar, och ingen vet vem som ansvarar för att prioritera förbättringar. Samtidigt har leverantören fakturerat för ändringar som ingen känner igen.",
            question: "Vad bör du föreslå som första åtgärd?",
            choices: [
              {
                id: "1a",
                text: "Byta leverantör — de levererar uppenbarligen dåligt.",
                isOptimal: false,
                feedback:
                  "Problemet ligger inte primärt hos leverantören utan i avsaknaden av en förvaltningsorganisation. Utan tydliga roller och processer kommer samma problem att uppstå med en ny leverantör.",
              },
              {
                id: "1b",
                text: "Etablera en förvaltningsorganisation med tydliga roller enligt PM3 — utse objektägare, förvaltningsledare och etablera en ärendehanteringsprocess.",
                isOptimal: true,
                feedback:
                  "Helt rätt. PM3-modellen ger en tydlig struktur med objektägare (verksamheten äger prioritering och budget), förvaltningsledare (samordnar det dagliga arbetet) och definierade processer. Utan denna struktur saknas mandat att prioritera och kontrollera leverantörsrelationen.",
              },
              {
                id: "1c",
                text: "Låta IT-avdelningen ta över all kommunikation med leverantören.",
                isOptimal: false,
                feedback:
                  "Att enbart lägga ansvaret på IT löser inte grundproblemet. PM3 betonar att verksamheten måste äga förvaltningsobjektet och prioriteringarna. IT kan inte ensamt avgöra vilka verksamhetsbehov som ska prioriteras.",
              },
            ],
          },
          {
            situation:
              "Ledningen stödjer förslaget att etablera en förvaltningsorganisation. Nu behöver du välja en förvaltningsmodell att utgå ifrån. Kommunen har begränsade resurser och ingen erfarenhet av formella ramverk.",
            question:
              "Vilket ramverk rekommenderar du som startpunkt?",
            choices: [
              {
                id: "2a",
                text: "Implementera ITIL 4 fullt ut med alla 34 practices från dag ett.",
                isOptimal: false,
                feedback:
                  "Full ITIL 4-implementation är alltför omfattande för en organisation utan erfarenhet av formella ramverk. Det kräver betydande resurser och mognad. Börja med grunderna och bygg vidare.",
              },
              {
                id: "2b",
                text: "Börja med PM3 för förvaltningsorganisationen och komplettera med FitSM:s kärnprocesser för den operativa hanteringen.",
                isOptimal: true,
                feedback:
                  "En pragmatisk kombination. PM3 ger den organisatoriska strukturen (roller, ansvar, styrning) och FitSM erbjuder lättviktiga processer för incident-, ändrings- och problemhantering. Denna kombination är väl anpassad för organisationer i ett tidigt mognadsstadium.",
              },
              {
                id: "2c",
                text: "Certifiera organisationen enligt ISO 20000 direkt.",
                isOptimal: false,
                feedback:
                  "ISO 20000-certifiering kräver omfattande dokumentation och mogna processer. Det är ett utmärkt långsiktigt mål, men inte en lämplig startpunkt för en organisation som saknar grundläggande förvaltningsstruktur.",
              },
            ],
          },
        ],
        roleRelevance: ["BESTALLARE", "UPPHANDLARE", "SYSTEMAGARE"],
      },
      roleDeepDives: [
        {
          role: "BESTALLARE",
          perspective:
            "Som beställare är du den som representerar verksamhetens behov och prioriteringar. I PM3 motsvarar din roll objektägaren — den som ytterst ansvarar för att förvaltningsobjektet levererar värde till verksamheten. Du äger förvaltningsbudgeten och fattar beslut om prioritering av vidareutveckling.",
          keyActions: [
            "Tillse att varje viktigt system har en utsedd objektägare med mandat och budget",
            "Delta aktivt i förvaltningsplaneringen — inte delegera allt till IT",
            "Prioritera förvaltningsinsatser baserat på verksamhetsnytta, inte teknisk komplexitet",
            "Säkerställa att förvaltningsavtalet med leverantören speglar verksamhetens faktiska behov",
          ],
          pitfalls: [
            "Att delegera hela förvaltningsansvaret till IT utan verksamhetsstyrning",
            "Att inte avsätta tid och resurser för rollen som objektägare",
            "Att beställa vidareutveckling direkt från leverantören utan samordning",
            "Att undervärdera behovet av strukturerad förvaltning — 'det löser sig'",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare ansvarar du för att förvaltningsavtalen är korrekt utformade och ger organisationen rätt manöverutrymme. Du behöver förstå skillnaden mellan drift, support och vidareutveckling för att kunna strukturera avtal och SLA:er som verkligen stödjer förvaltningen.",
          keyActions: [
            "Ställa krav på leverantörens förvaltningsprocesser — referera till ISO 20000 eller FitSM",
            "Säkerställa att avtalet definierar tydliga SLA:er med mätbara servicenivåer",
            "Kravställa rapportering och uppföljningsrutiner i avtalet",
            "Inkludera mekanismer för årlig översyn och justering av förvaltningsvolymer",
          ],
          pitfalls: [
            "Att upphandla förvaltning och vidareutveckling i samma avtal utan tydlig avgränsning",
            "Att inte definiera vilka processer leverantören förväntas följa",
            "Att missa exit-klausuler och överföringsvillkor vid leverantörsbyte",
            "Att fokusera enbart på pris och inte på leverantörens förvaltningskapacitet",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare har du det tekniska helhetsansvaret för systemets drift och utveckling. Du samverkar med förvaltningsledaren och ansvarar för att systemet är tekniskt sunt, säkert och uppfyller de servicenivåer som avtalats. ITIL 4-practices som incident management och change management är centrala i ditt dagliga arbete.",
          keyActions: [
            "Implementera och underhålla processer för incident-, problem- och ändringshantering",
            "Övervaka systemets hälsa med tekniska nyckeltal (tillgänglighet, svarstider, felfrekvens)",
            "Säkerställa att ändringar genomgår kontrollerad release- och konfigurationshantering",
            "Rapportera regelbundet till förvaltningsledare och objektägare om systemstatus",
          ],
          pitfalls: [
            "Att fokusera enbart på teknisk drift och glömma verksamhetsperspektivet",
            "Att genomföra ändringar utan formell ändringshanteringsprocess",
            "Att inte dokumentera systemets konfiguration och beroenden",
            "Att missa kopplingar mellan tekniska incidenter och underliggande problem",
          ],
        },
      ],
      reflection: {
        question:
          "Hur ser förvaltningen av era viktigaste system ut idag — är den strukturerad enligt en modell som PM3 eller ITIL, eller är den ad hoc?",
      },
      quiz: {
        questions: [
          {
            id: "q-sf1-1",
            question: "Vilka är de tre pelarna i PM3-modellen?",
            options: [
              {
                id: "a",
                text: "Förvaltningsobjekt, förvaltningsorganisation och förvaltningsprocesser",
                isCorrect: true,
              },
              {
                id: "b",
                text: "Drift, underhåll och vidareutveckling",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Incident, problem och change management",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Plan, do, check, act",
                isCorrect: false,
              },
            ],
            explanation:
              "PM3 bygger på tre pelare: förvaltningsobjekt (vad som förvaltas), förvaltningsorganisation (vem som förvaltar) och förvaltningsprocesser (hur förvaltningen bedrivs). Dessa tre dimensioner utgör grunden för en strukturerad förvaltning.",
          },
          {
            id: "q-sf1-2",
            question:
              "Vad står SVS för i ITIL 4-terminologin?",
            options: [
              {
                id: "a",
                text: "Standard Verification System",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Service Value System",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Structured Vendor Support",
                isCorrect: false,
              },
              {
                id: "d",
                text: "System Validation Specification",
                isCorrect: false,
              },
            ],
            explanation:
              "SVS står för Service Value System och är ITIL 4:s övergripande modell som beskriver hur alla komponenter och aktiviteter i organisationen samverkar för att skapa värde genom IT-tjänster.",
          },
          {
            id: "q-sf1-3",
            question: "Vad erbjuder FitSM jämfört med ITIL?",
            options: [
              {
                id: "a",
                text: "En mer omfattande och detaljerad processmodell",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Ett lättviktigt alternativ med 14 kärnprocesser, anpassat för mindre organisationer",
                isCorrect: true,
              },
              {
                id: "c",
                text: "En certifieringsstandard som ersätter ISO 20000",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Ett ramverk enbart för molnbaserade tjänster",
                isCorrect: false,
              },
            ],
            explanation:
              "FitSM (Federated IT Service Management) är ett lättviktigt ramverk med 14 kärnprocesser som passar mindre organisationer och samverkansmiljöer. Det kan fungera som en pragmatisk startpunkt för professionaliserad förvaltning.",
          },
          {
            id: "q-sf1-4",
            question:
              "Vilken standard ställer formella krav på ett ledningssystem för IT-tjänster (SMS)?",
            options: [
              {
                id: "a",
                text: "ISO 27001",
                isCorrect: false,
              },
              {
                id: "b",
                text: "COBIT 2019",
                isCorrect: false,
              },
              {
                id: "c",
                text: "ISO 20000",
                isCorrect: true,
              },
              {
                id: "d",
                text: "TOGAF",
                isCorrect: false,
              },
            ],
            explanation:
              "ISO 20000 är den internationella standarden för IT-tjänstehantering som ställer krav på planering, implementering, drift, övervakning och förbättring av ett Service Management System (SMS).",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 2 — Förvaltningsorganisation och roller                     */
    /* ================================================================== */
    {
      id: "systemforvaltning-2",
      title: "Förvaltningsorganisation och roller",
      theory: {
        content: [
          "En fungerande förvaltningsorganisation kräver tydliga roller med definierat ansvar och mandat. PM3 definierar fyra centrala roller: objektägare (den verksamhetsansvarige chefen som äger förvaltningsobjektet, beslutar om budget och prioriterar verksamhetsutveckling), förvaltningsledare (samordnar det dagliga förvaltningsarbetet och är länken mellan verksamhet och IT), objektspecialist (verksamhetsexpert som representerar slutanvändarnas behov) och teknisk förvaltare (IT-specialist som ansvarar för systemets tekniska underhåll och drift).",
          "ITIL 4 organiserar roller kring practices snarare än hierarkiska positioner. Centrala roller inkluderar Service Owner (helhetsansvarig för en tjänst), Process Manager (ansvarar för att en specifik process fungerar), Change Authority (godkänner ändringar) och Incident Manager (koordinerar incidenthantering). COBIT (Control Objectives for Information and Related Technologies) adderar ett styrningsperspektiv genom att separera governance (styrning — vad ska uppnås) från management (ledning — hur det ska uppnås), vilket är avgörande i organisationer där politiska nämnder eller styrelser fattar strategiska IT-beslut.",
          "En RACI-matris (Responsible, Accountable, Consulted, Informed) är ett kraftfullt verktyg för att klargöra rollfördelningen. För varje aktivitet i förvaltningen definieras vem som utför arbetet (R), vem som bär det yttersta ansvaret (A), vilka som ska konsulteras (C) och vilka som ska informeras (I). Utan en RACI-matris uppstår lätt situationer där alla tror att någon annan ansvarar, eller där beslut fattas utan rätt mandat.",
          "En vanlig utmaning i svenska organisationer är att objektsägarrollen inte är tydligt tillsatt eller att objektägaren inte tar aktivt ansvar. COBIT betonar att IT-governance kräver engagemang från ledningsnivå — i offentlig sektor innebär detta att förvaltningsstyrgruppen bör inkludera representanter från ledning, verksamhet och IT. Utan denna styrningsstruktur hamnar alla operativa och strategiska beslut hos IT-avdelningen, som saknar mandat att prioritera verksamhetsbehov.",
        ],
        keyPoints: [
          "PM3 definierar fyra nyckelroller: objektägare, förvaltningsledare, objektspecialist, teknisk förvaltare",
          "ITIL 4 organiserar roller kring practices: Service Owner, Process Manager, Change Authority",
          "COBIT separerar governance (vad) från management (hur) — avgörande för styrning",
          "RACI-matris klargör ansvar: Responsible, Accountable, Consulted, Informed",
          "Otydlig rollfördelning är den vanligaste orsaken till bristande förvaltning",
        ],
      },
      scenario: {
        id: "scenario-sf-2",
        title: "Rollkonflikten i förvaltningen",
        context:
          "En region har ett patientjournalsystem som förvaltas av IT-avdelningen. Verksamhetschefen för vårdavdelningen anser att systemet behöver ny funktionalitet, men IT-chefen prioriterar säkerhetsuppdateringar. Ingen vet vem som har sista ordet, och konflikten har lett till att inga förändringar genomförts på sex månader.",
        steps: [
          {
            situation:
              "Verksamhetschefen vill lägga till en ny modul för digital triagering. IT-chefen säger att systemet först måste uppdateras med säkerhetspatchar och att det inte finns resurser för båda. Båda vänder sig till dig för att lösa situationen.",
            question: "Hur strukturerar du ansvaret?",
            choices: [
              {
                id: "1a",
                text: "Låt IT-chefen bestämma — IT har teknisk expertis och vet bäst vad som behövs.",
                isOptimal: false,
                feedback:
                  "IT har teknisk expertis men saknar mandat att prioritera verksamhetsbehov. Enligt PM3 ska objektägaren (verksamheten) äga prioriteringen medan IT ansvarar för teknisk leverans. Att ge IT ensam beslutsmakt leder till en teknikdriven förvaltning utan verksamhetsförankring.",
              },
              {
                id: "1b",
                text: "Tillsätt en förvaltningsstyrgrupp med verksamhetschefen som objektägare och IT-chefen som teknisk rådgivare. Använd en RACI-matris för att klargöra roller.",
                isOptimal: true,
                feedback:
                  "Korrekt. En förvaltningsstyrgrupp med verksamheten som objektägare (Accountable för prioritering) och IT som teknisk expert (Responsible för genomförande) löser konflikten. RACI-matrisen dokumenterar vem som beslutar, utför, konsulteras och informeras för varje typ av beslut.",
              },
              {
                id: "1c",
                text: "Eskalera till regionledningen och låt dem besluta om varje enskild förändring.",
                isOptimal: false,
                feedback:
                  "Att eskalera varje beslut till ledningen skapar en flaskhals och visar att förvaltningen saknar fungerande styrning. COBIT betonar att governance ska sätta ramar och delegera operativa beslut — inte fatta varje enskilt beslut.",
              },
            ],
          },
          {
            situation:
              "Förvaltningsstyrgruppen har tillsatts. Nu behöver ni avgöra om säkerhetsuppdateringarna eller den nya triageringsmodulen ska prioriteras först. Båda är viktiga men resurserna räcker bara till en i taget.",
            question: "Hur bör prioriteringsbeslut fattas i den nya strukturen?",
            choices: [
              {
                id: "2a",
                text: "Objektägaren beslutar baserat på verksamhetsrisk och patientnyttan, efter att ha fått teknisk konsekvensanalys från IT.",
                isOptimal: true,
                feedback:
                  "Korrekt. Objektägaren fattar prioriteringsbeslut baserat på verksamhetsnytta och risk, men ska alltid ha IT:s konsekvensanalys som beslutsunderlag. I detta fall kan säkerhetsriskerna vara så allvarliga att de motiverar förtur, men det är verksamhetens beslut — inte IT:s.",
              },
              {
                id: "2b",
                text: "Den som skriker högst vinner — det är så det alltid fungerar i praktiken.",
                isOptimal: false,
                feedback:
                  "Ad hoc-prioritering baserad på politisk makt istället för saklig bedömning är precis det som en strukturerad förvaltningsmodell ska eliminera. PM3 och COBIT betonar transparenta prioriteringsprocesser med dokumenterade beslut.",
              },
              {
                id: "2c",
                text: "Låt leverantören bestämma ordningen baserat på vad som är tekniskt enklast.",
                isOptimal: false,
                feedback:
                  "Leverantören ska inte styra prioriteringen — det är beställarorganisationens ansvar. Att delegera prioriteringsbeslut till leverantören innebär att man tappar kontrollen över sin egen förvaltning.",
              },
            ],
          },
        ],
        roleRelevance: ["BESTALLARE", "UPPHANDLARE", "SYSTEMAGARE"],
      },
      roleDeepDives: [
        {
          role: "BESTALLARE",
          perspective:
            "Som beställare och potentiell objektägare i PM3-termer är ditt primära ansvar att säkerställa att förvaltningen levererar värde till verksamheten. Du äger prioriteringen och budgeten, och du behöver förstå att denna roll kräver aktivt engagemang — inte passiv delegering till IT.",
          keyActions: [
            "Acceptera och aktivt utöva objektägarrollen med tillhörande mandat och budget",
            "Etablera regelbundna förvaltningsstyrgruppsmöten med tydlig agenda och beslutslogg",
            "Använda RACI-matrisen för att formalisera och kommunicera rollfördelningen",
            "Säkerställa att prioriteringsbeslut dokumenteras med verksamhetsmotivering",
          ],
          pitfalls: [
            "Att delegera objektägarskapet till någon som saknar mandat att fatta verksamhetsbeslut",
            "Att inte avsätta tid för förvaltningsstyrning — objektägarrollen kräver minst 10-20% av arbetstiden",
            "Att fatta prioriteringsbeslut utan teknisk konsekvensanalys från IT",
            "Att blanda ihop beställarrollen med utförarrollen — beställaren styr vad, inte hur",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du förstå rollstrukturen för att kunna upphandla rätt typ av förvaltningsstöd. Avtalet måste spegla organisationens förvaltningsmodell — om ni använder PM3 ska leverantörens roller och ansvar i avtalet harmoniera med PM3:s rollstruktur.",
          keyActions: [
            "Kravställa att leverantören har definierade roller som mappas mot organisationens förvaltningsmodell",
            "Inkludera krav på regelbundna leveransgenomgångar och eskaleringsrutiner i avtalet",
            "Definiera RACI-matris för gränsytan mellan intern organisation och leverantör",
            "Säkerställa att avtalet specificerar leverantörens ansvar vid olika typer av ärenden (incident, problem, ändring)",
          ],
          pitfalls: [
            "Att upphandla förvaltning utan att ha klargjort den interna rollfördelningen först",
            "Att inte definiera eskaleringsvägar i avtalet",
            "Att missa att inkludera krav på leverantörens nyckelroller och deras kompetens",
            "Att inte reglera vad som händer vid personbyten hos leverantören",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare ansvarar du för det tekniska genomförandet och är den som i ITIL-termer agerar Service Owner. Du samverkar med objektägaren (verksamheten) och förvaltningsledaren, och din främsta uppgift är att leverera teknisk stabilitet och möjliggöra verksamhetsutveckling genom systemet.",
          keyActions: [
            "Tydligt rapportera tekniska risker och konsekvenser som underlag för verksamhetens prioriteringsbeslut",
            "Upprätthålla dokumenterad RACI-matris för alla tekniska förvaltningsaktiviteter",
            "Implementera ITIL-practices för incident, problem och change management",
            "Säkerställa att alla tekniska förändringar godkänns av rätt Change Authority",
          ],
          pitfalls: [
            "Att fatta verksamhetsbeslut som egentligen tillhör objektägaren",
            "Att genomföra ändringar utan godkännande från Change Authority",
            "Att inte kommunicera tekniska risker tillräckligt tydligt till verksamheten",
            "Att ta ansvar för prioriteringar utan att ha fått formellt mandat",
          ],
        },
      ],
      reflection: {
        question:
          "Vem är objektägare för ert viktigaste system — och tar den personen aktivt ansvar för prioritering med stöd av en RACI-matris?",
      },
      quiz: {
        questions: [
          {
            id: "q-sf2-1",
            question:
              "Vilken roll i PM3-modellen äger förvaltningsbudgeten och prioriterar verksamhetsutveckling?",
            options: [
              { id: "a", text: "Förvaltningsledare", isCorrect: false },
              { id: "b", text: "Objektägare", isCorrect: true },
              { id: "c", text: "Teknisk förvaltare", isCorrect: false },
              { id: "d", text: "Objektspecialist", isCorrect: false },
            ],
            explanation:
              "Objektägaren är den verksamhetsansvarige chefen som äger förvaltningsobjektet, beslutar om budget och prioriterar verksamhetsutveckling. Det är en nyckelroll i PM3 som säkerställer att verksamheten styr förvaltningen.",
          },
          {
            id: "q-sf2-2",
            question: "Vad står bokstaven 'A' för i RACI-matrisen?",
            options: [
              { id: "a", text: "Assigned — tilldelad arbetsuppgiften", isCorrect: false },
              {
                id: "b",
                text: "Accountable — bär det yttersta ansvaret för resultatet",
                isCorrect: true,
              },
              { id: "c", text: "Approver — godkänner leveransen", isCorrect: false },
              { id: "d", text: "Advisor — ger råd och rekommendationer", isCorrect: false },
            ],
            explanation:
              "I RACI-matrisen står A för Accountable — den person som bär det yttersta ansvaret för att aktiviteten slutförs korrekt. Det kan bara finnas en Accountable per aktivitet, till skillnad från Responsible där flera personer kan vara utförare.",
          },
          {
            id: "q-sf2-3",
            question:
              "Vilken distinktion gör COBIT som är särskilt relevant för offentlig sektor?",
            options: [
              {
                id: "a",
                text: "Skillnaden mellan drift och underhåll",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Separationen mellan governance (styrning) och management (ledning)",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Skillnaden mellan interna och externa leverantörer",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Separationen mellan projekt och förvaltning",
                isCorrect: false,
              },
            ],
            explanation:
              "COBIT separerar governance (vad ska uppnås — strategisk styrning) från management (hur det ska uppnås — operativ ledning). I offentlig sektor är denna distinktion avgörande eftersom politiska organ sätter mål medan förvaltningen genomför dem.",
          },
          {
            id: "q-sf2-4",
            question:
              "Vilken ITIL 4-roll har helhetsansvaret för en specifik tjänst?",
            options: [
              { id: "a", text: "Process Manager", isCorrect: false },
              { id: "b", text: "Change Authority", isCorrect: false },
              { id: "c", text: "Service Owner", isCorrect: true },
              { id: "d", text: "Incident Manager", isCorrect: false },
            ],
            explanation:
              "Service Owner har helhetsansvaret för en specifik tjänst i ITIL 4. Rollen ansvarar för att tjänsten levererar överenskommet värde och samordnar alla practices som berör tjänsten.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 3 — Förvaltningsobjekt och tjänstekatalog                   */
    /* ================================================================== */
    {
      id: "systemforvaltning-3",
      title: "Förvaltningsobjekt och tjänstekatalog",
      theory: {
        content: [
          "Ett förvaltningsobjekt i PM3 är en avgränsad enhet — typiskt ett IT-system eller en grupp av sammanhörande system — som förvaltas som en helhet. Avgränsningen är kritisk: ett för stort förvaltningsobjekt blir ohanterbart och otydligt, medan ett för litet skapar administrativ overhead och fragmentering. PM3 rekommenderar att avgränsningen baseras på verksamhetslogik snarare än teknik — ett förvaltningsobjekt bör motsvara ett sammanhängande verksamhetsområde, till exempel 'ekonomihantering' eller 'ärendehantering', oavsett hur många tekniska komponenter som ingår.",
          "ITIL 4:s practice Service Catalog Management beskriver hur organisationen ska dokumentera och kommunicera sitt tjänsteutbud. Tjänstekatalogen består av två delar: den affärsinriktade tjänstekatalogen (vad verksamheten ser — vilka tjänster som erbjuds, vad de kostar, hur de nås) och den tekniska tjänstekatalogen (vad IT ser — underliggande komponenter, beroenden, tekniska plattformar). En välskött tjänstekatalog fungerar som kontraktet mellan förvaltningen och dess kunder.",
          "Servicenivåavtal (SLA — Service Level Agreement) definierar mätbara kvalitetsnivåer för varje tjänst. SLA:er stöds av OLA (Operational Level Agreement, internt avtal mellan IT-team) och UC (Underpinning Contract, avtal med extern leverantör). Denna trelagerstruktur — SLA/OLA/UC — säkerställer att det finns en obruten kedja av ansvar från kundens förväntning till den faktiska leveransen. ISO 20000 kräver att dessa avtal dokumenteras, mäts och regelbundet revideras.",
          "Configuration Management enligt ITIL 4 handlar om att upprätthålla en aktuell bild av alla IT-tillgångar och deras relationer. En CMDB (Configuration Management Database) registrerar varje konfigurationsenhet (CI — Configuration Item) och dess beroenden till andra enheter. CMDB:n är fundamental för impact-analys vid ändringar — utan den kan man inte bedöma vilka tjänster som påverkas när en server tas ur drift eller en databas uppgraderas.",
        ],
        keyPoints: [
          "PM3: Avgränsa förvaltningsobjekt efter verksamhetslogik, inte teknik",
          "Tjänstekatalogen har två lager: affärsinriktad (kundvy) och teknisk (IT-vy)",
          "SLA/OLA/UC-hierarkin skapar en obruten ansvarskedja",
          "CMDB dokumenterar konfigurationsenheter och deras beroenden",
          "ISO 20000 kräver dokumenterade och mätbara servicenivåavtal",
        ],
      },
      scenario: {
        id: "scenario-sf-3",
        title: "Tjänstekatalogen som saknas",
        context:
          "Du arbetar på en myndighet som har 15 IT-system men ingen tjänstekatalog. Användarna vet inte vad de kan förvänta sig av IT, och supportärenden hanteras baserat på vem som skriker högst. IT-avdelningen klagar på att de ständigt blir anklagade för dålig service, trots att de arbetar hårt.",
        steps: [
          {
            situation:
              "Myndighetschefen vill att du skapar en tjänstekatalog. Du har begränsade resurser och behöver välja var du börjar.",
            question:
              "Hur avgränsar du arbetet med tjänstekatalogen?",
            choices: [
              {
                id: "1a",
                text: "Dokumentera alla 15 system med fullständiga SLA:er från dag ett.",
                isOptimal: false,
                feedback:
                  "Att försöka dokumentera allt på en gång är orealistiskt med begränsade resurser. Det leder till utmattning och halvfärdiga SLA:er. Börja med de viktigaste tjänsterna och bygg ut gradvis.",
              },
              {
                id: "1b",
                text: "Identifiera de 3-5 mest verksamhetskritiska systemen, definiera dem som förvaltningsobjekt och skapa SLA:er för deras viktigaste tjänster först.",
                isOptimal: true,
                feedback:
                  "Korrekt. PM3 rekommenderar att börja med de viktigaste förvaltningsobjekten. Genom att fokusera på 3-5 kritiska system kan du skapa en fungerande tjänstekatalog med meningsfulla SLA:er som ger omedelbart värde.",
              },
              {
                id: "1c",
                text: "Kopiera en tjänstekatalogmall från internet och anpassa den.",
                isOptimal: false,
                feedback:
                  "En mall kan vara en startpunkt, men en tjänstekatalog måste spegla organisationens verkliga tjänster och behov. Att kopiera utan att förankra i verksamheten ger ett dokument som ingen använder.",
              },
            ],
          },
          {
            situation:
              "Du har identifierat ekonomisystemet som det viktigaste förvaltningsobjektet. Nu ska du definiera SLA:er. Ekonomichefen vill ha 99,99% tillgänglighet och 15 minuters responstid på alla supportärenden dygnet runt.",
            question: "Hur hanterar du dessa krav?",
            choices: [
              {
                id: "2a",
                text: "Acceptera kraven — kunden har alltid rätt.",
                isOptimal: false,
                feedback:
                  "99,99% tillgänglighet innebär maximalt 52 minuters driftstopp per år, och 24/7-support med 15 minuters responstid kräver enorma resurser. Att acceptera orealistiska SLA:er skapar en förväntningsklyfta som leder till frustration.",
              },
              {
                id: "2b",
                text: "Genomför en dialog med ekonomichefen där ni analyserar det verkliga behovet — när används systemet, vad är konsekvensen av driftstopp, och vad kostar olika servicenivåer?",
                isOptimal: true,
                feedback:
                  "Korrekt. SLA:er måste baseras på verkliga behov och vara ekonomiskt motiverade. Genom att analysera användningsmönster, konsekvenser och kostnader kan ni definiera SLA:er som balanserar kvalitet och kostnad. ISO 20000 betonar att servicenivåer ska vara mätbara, uppnåeliga och regelbundet reviderade.",
              },
              {
                id: "2c",
                text: "Säg nej och bestäm SLA:erna själv baserat på vad IT kan leverera.",
                isOptimal: false,
                feedback:
                  "SLA:er ska förhandlas mellan verksamhet och IT, inte dikteras av endera parten. IT måste vara transparent om vad som är möjligt, men verksamheten måste vara delaktig i avvägningen mellan kostnad och kvalitet.",
              },
            ],
          },
        ],
        roleRelevance: ["BESTALLARE", "UPPHANDLARE", "SYSTEMAGARE"],
      },
      roleDeepDives: [
        {
          role: "BESTALLARE",
          perspective:
            "Som beställare är du den primära konsumenten av tjänstekatalogen. Du behöver förstå vilka tjänster som erbjuds, vad de kostar och vilka servicenivåer som gäller. Din viktigaste uppgift är att definiera verksamhetens verkliga behov — inte maximal kvalitet på allt, utan rätt kvalitet för varje tjänst.",
          keyActions: [
            "Definiera verksamhetens behov av tillgänglighet, svarstider och support för varje system",
            "Förhandla SLA:er som balanserar verksamhetsnytta mot kostnad",
            "Regelbundet granska tjänstekatalogen och justera vid förändrade verksamhetsbehov",
            "Säkerställa att verksamheten förstår vad som ingår och inte ingår i tjänsten",
          ],
          pitfalls: [
            "Att kräva maximal servicenivå på alla system utan kostnadsanalys",
            "Att inte engagera sig i SLA-förhandlingarna utan delegera till IT",
            "Att klaga på bristande service utan att ha definierat förväntningarna i ett SLA",
            "Att inte rapportera när tjänsten inte möter avtalade nivåer",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du kunna omsätta tjänstekatalogen och SLA:erna till avtalskrav. SLA-hierarkin (SLA/OLA/UC) måste speglas i avtalsstrukturen så att det finns en tydlig koppling mellan vad verksamheten förväntar sig och vad leverantören åtar sig.",
          keyActions: [
            "Använda tjänstekatalogen som grund för att formulera krav i upphandlingsdokumenten",
            "Strukturera avtalet med tydliga SLA:er som är mätbara och uppföljningsbara",
            "Inkludera viten och bonus kopplat till SLA-uppfyllnad i avtalet",
            "Kravställa regelbunden SLA-rapportering och revisionsrätt gentemot leverantören",
          ],
          pitfalls: [
            "Att upphandla utan definierade SLA:er — då saknas grund för uppföljning",
            "Att använda tekniska SLA:er som verksamheten inte förstår",
            "Att missa att koppla leverantörens UC (underpinning contract) till organisationens SLA",
            "Att inte inkludera mekanismer för SLA-revidering under avtalsperioden",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare ansvarar du för att upprätthålla den tekniska tjänstekatalogen, CMDB:n och att leverera enligt avtalade SLA:er. Du behöver en aktuell bild av alla konfigurationsenheter och deras beroenden för att kunna bedöma konsekvenser av ändringar och planera kapacitet.",
          keyActions: [
            "Upprätta och underhålla en CMDB med alla konfigurationsenheter och deras relationer",
            "Mäta och rapportera SLA-uppfyllnad systematiskt med objektiva mätmetoder",
            "Genomföra impact-analys baserad på CMDB innan ändringar godkänns",
            "Upprätthålla den tekniska tjänstekatalogen med aktuella beroenden och plattformsinformation",
          ],
          pitfalls: [
            "Att inte hålla CMDB:n uppdaterad — en inaktuell CMDB är värre än ingen CMDB",
            "Att mäta fel saker — tillgänglighet uppmätt från servern kan skilja sig från användarupplevelsen",
            "Att inte informera verksamheten proaktivt vid planerade driftstörningar",
            "Att sakna kapacitetsplanering — SLA-brott uppstår ofta av resursbrist som kunde förutsetts",
          ],
        },
      ],
      reflection: {
        question:
          "Vet användarna i din organisation vad de kan förvänta sig av IT-förvaltningen — finns det dokumenterade SLA:er som mäts och följs upp?",
      },
      quiz: {
        questions: [
          {
            id: "q-sf3-1",
            question:
              "Vad rekommenderar PM3 som grund för att avgränsa förvaltningsobjekt?",
            options: [
              {
                id: "a",
                text: "Teknisk plattform — ett objekt per server",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Verksamhetslogik — ett objekt per verksamhetsområde",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Leverantör — ett objekt per leverantör",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Budget — ett objekt per budgetpost",
                isCorrect: false,
              },
            ],
            explanation:
              "PM3 rekommenderar att förvaltningsobjekt avgränsas efter verksamhetslogik — ett objekt bör motsvara ett sammanhängande verksamhetsområde, oavsett hur många tekniska komponenter som ingår.",
          },
          {
            id: "q-sf3-2",
            question: "Vad står UC för i SLA-hierarkin SLA/OLA/UC?",
            options: [
              {
                id: "a",
                text: "User Compliance — användarnas efterlevnad av regler",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Underpinning Contract — avtal med extern leverantör som stödjer SLA:et",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Unified Configuration — samlad konfigurationsdatabas",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Update Control — kontroll av uppdateringar",
                isCorrect: false,
              },
            ],
            explanation:
              "UC (Underpinning Contract) är avtalet med en extern leverantör som stödjer organisationens förmåga att leverera enligt SLA:et. Tillsammans med OLA (Operational Level Agreement, internt avtal) bildar de en ansvarskedja under SLA:et.",
          },
          {
            id: "q-sf3-3",
            question: "Vad registreras i en CMDB?",
            options: [
              {
                id: "a",
                text: "Personalens kompetensprofiler",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Konfigurationsenheter (CI:er) och deras relationer till varandra",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Budgetposter och kostnadsfördelning",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Projektplaner och milstolpar",
                isCorrect: false,
              },
            ],
            explanation:
              "En CMDB (Configuration Management Database) registrerar konfigurationsenheter (CI — Configuration Items) som servrar, applikationer, nätverk och databaser, samt deras relationer och beroenden. CMDB:n är fundamental för impact-analys vid ändringar.",
          },
        ],
        passingScore: 2,
      },
    },

    /* ================================================================== */
    /*  Modul 4 — Budget och ekonomistyrning                              */
    /* ================================================================== */
    {
      id: "systemforvaltning-4",
      title: "Budget och ekonomistyrning",
      theory: {
        content: [
          "Förvaltningsbudgeten i en mogen organisation struktureras i tre huvudkategorier: driftskostnader (löpande kostnader för licenser, hosting, support och infrastruktur), underhåll (buggfixar, säkerhetsuppdateringar, teknisk skuld och regulatoriska anpassningar) och vidareutveckling (ny funktionalitet som ökar verksamhetsnyttan). ITIL 4:s practice Financial Management for IT Services betonar att kostnader ska kunna fördelas per tjänst och per kund, vilket möjliggör faktabaserade prioriteringsbeslut. I offentlig sektor, där skattemedel ska användas effektivt, är denna transparens särskilt viktig.",
          "Total Cost of Ownership (TCO) är en metod för att beräkna den verkliga totalkostnaden för ett system över hela dess livscykel. TCO inkluderar inte bara uppenbara kostnader som licenser och drift, utan även dolda kostnader som intern personalresurs, utbildning, integrationskostnader, datamigrering och framtida avveckling. Många organisationer underskattar TCO med 30-50% genom att enbart fokusera på de direkta kostnaderna. En korrekt TCO-beräkning bör sträcka sig över minst 5-7 år och inkludera teknologiförnyelsecykler.",
          "FinOps (Financial Operations) är en framväxande disciplin som applicerar ekonomistyrningsprinciper på molnbaserade IT-resurser. FinOps-principerna — Inform, Optimize, Operate — syftar till att ge verksamheten realtidsinsyn i molnkostnader, optimera resursanvändning och skapa en kultur av kostnadsmedvetenhet. För organisationer som migrerar till molntjänster förändras kostnadsmodellen fundamentalt: från kapitalkostnader (CAPEX) till driftskostnader (OPEX), vilket kräver nya budgeteringsmetoder och uppföljningsrutiner.",
          "Teknisk skuld (technical debt) är en ofta dold kostnadsdrivare i förvaltningen. När underhåll och modernisering skjuts upp ackumuleras teknisk skuld som ökar framtida kostnader exponentiellt. En förvaltningsbudget som kroniskt underfinansierar underhåll sparar pengar på kort sikt men skapar en situation där systemet till slut kräver en kostsam total ersättning. ITIL betonar att regelbunden proaktiv underhållsplanering — inklusive teknologiförnyelsecykler — är mer kostnadseffektivt än reaktivt underhåll.",
        ],
        keyPoints: [
          "Tre budgetkategorier: drift, underhåll, vidareutveckling — fördelningen ändras med systemets ålder",
          "TCO inkluderar dolda kostnader och bör beräknas över minst 5-7 år",
          "FinOps-principer ger kostnadsoptimering och transparens för molntjänster",
          "Teknisk skuld ackumuleras vid underfinansierat underhåll och ökar framtida kostnader exponentiellt",
          "ITIL Financial Management kräver kostnadsfördelning per tjänst och per kund",
        ],
      },
      scenario: {
        id: "scenario-sf-4",
        title: "Förvaltningsbudgeten som inte räcker",
        context:
          "Du ansvarar för förvaltningen av kommunens ärendehanteringssystem. Systemet är fem år gammalt och leverantören har aviserat att nuvarande version inte längre supporteras om 18 månader. Förvaltningsbudgeten har varit oförändrad i tre år, och det har inte gjorts någon teknisk modernisering under denna tid. Nu behöver du lägga ett budgetförslag för nästa år.",
        steps: [
          {
            situation:
              "Du upptäcker att 75% av budgeten går till rena licenskostnader och driftskostnader, 20% till akuta buggfixar, och bara 5% till vidareutveckling. Användarna klagar på att systemet är trögt och saknar funktioner som konkurrenternas produkter har. Teknisk skuld har ackumulerats under tre år utan modernisering.",
            question: "Hur presenterar du budgetbehovet för ledningen?",
            choices: [
              {
                id: "1a",
                text: "Begär en generell budgetökning på 20% utan att specificera varför.",
                isOptimal: false,
                feedback:
                  "En ospecificerad begäran om mer pengar kommer sannolikt att avslås. Ledningen behöver förstå vad pengarna ska gå till och vilka konsekvenser alternativet (att inte öka budgeten) medför.",
              },
              {
                id: "1b",
                text: "Presentera en TCO-analys som visar den verkliga totalkostnaden inklusive ackumulerad teknisk skuld, jämför kostnaderna för att förnya vs. ersätta systemet, och koppla varje budgetpost till konkret verksamhetsnytta.",
                isOptimal: true,
                feedback:
                  "Korrekt. En TCO-analys med tydliga alternativscenarier ger ledningen underlag att fatta informerade beslut. Genom att synliggöra den tekniska skuldens kostnad och jämföra alternativ (förnya, ersätta eller avveckla) visar du professionell ekonomistyrning.",
              },
              {
                id: "1c",
                text: "Acceptera budgeten som den är och fortsätt med minimalt underhåll.",
                isOptimal: false,
                feedback:
                  "Att acceptera en otillräcklig budget utan att eskalera riskerna är ansvarslöst. Den tekniska skulden fortsätter ackumuleras och leverantörens supportavslut om 18 månader skapar en kritisk risk som ledningen behöver känna till.",
              },
            ],
          },
          {
            situation:
              "Ledningen uppskattar din TCO-analys och frågar vad du rekommenderar: uppgradera till ny version av befintligt system (kostnad: 2 MSEK + förvaltning) eller upphandla ett helt nytt system (kostnad: 5-8 MSEK + implementering och datamigrering).",
            question: "Vilka faktorer bör vägas in i beslutet?",
            choices: [
              {
                id: "2a",
                text: "Välj det billigaste alternativet — uppgradering kostar mindre.",
                isOptimal: false,
                feedback:
                  "Att enbart jämföra initialinvesteringen ger en missvisande bild. TCO-analysen måste inkludera löpande kostnader, leverantörens långsiktiga viability, teknisk modernitet och verksamhetsnytta över hela den nya livscykeln.",
              },
              {
                id: "2b",
                text: "Jämför TCO för båda alternativen över en 7-årsperiod, inkludera risker för vendor lock-in, bedöm leverantörernas långsiktiga marknadsposition, och analysera verksamhetsnyttan av nya funktioner i respektive alternativ.",
                isOptimal: true,
                feedback:
                  "Korrekt. Ett korrekt beslut kräver TCO-jämförelse över hela den planerade livscykeln, riskanalys av leverantörsberoende, marknadsanalys och värdering av verksamhetsnytta. FinOps-principerna betonar att kostnadsoptimering måste balanseras mot verksamhetsvärde.",
              },
              {
                id: "2c",
                text: "Välj nytt system — det är alltid bättre med det senaste.",
                isOptimal: false,
                feedback:
                  "Att alltid välja det nya är lika problematiskt som att alltid välja det billigaste. Ett nytt system medför implementeringsrisker, migreringsutmaningar och en lång inlärningsperiod. Beslutet måste baseras på saklig analys, inte antaganden.",
              },
            ],
          },
        ],
        roleRelevance: ["BESTALLARE", "UPPHANDLARE", "SYSTEMAGARE"],
      },
      roleDeepDives: [
        {
          role: "BESTALLARE",
          perspective:
            "Som beställare äger du förvaltningsbudgeten och ansvarar för att den investeras där den ger störst verksamhetsnytta. Du behöver förstå TCO-begreppet och kunna kommunicera den verkliga kostnaden för systemen till ledningen. Din viktigaste uppgift är att koppla varje budgetpost till konkret verksamhetsnytta.",
          keyActions: [
            "Kräva och granska TCO-analyser för alla större system innan budgetbeslut",
            "Separera budget för drift, underhåll och vidareutveckling — och följa upp fördelningen",
            "Proaktivt identifiera och kommunicera teknisk skuld till ledningen",
            "Använda livscykelkostnadsanalys vid jämförelse av alternativ (uppgradera vs. ersätta)",
          ],
          pitfalls: [
            "Att acceptera budgetförslag utan att ifrågasätta TCO-beräkningens fullständighet",
            "Att kroniskt underfinansiera underhåll för att frigöra medel till vidareutveckling",
            "Att inte planera för teknologiförnyelsecykler — varje system har en begränsad livslängd",
            "Att jämföra alternativ enbart baserat på initialinvestering utan livscykelperspektiv",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare ansvarar du för att upphandla förvaltning och systemstöd till rätt kostnad med rätt kvalitet. Du behöver förstå hur prismodeller i avtal påverkar TCO och hur avtalsvillkor kan struktureras för att ge kostnadsförutsägbarhet och undvika oväntade kostnadsökningar.",
          keyActions: [
            "Kravställa transparenta prismodeller i upphandlingen — undvik svårberäknade prisstrukturer",
            "Inkludera krav på kostnadsrapportering och budgetuppföljning i avtalet",
            "Strukturera avtalet med tydlig avgränsning mellan bas-förvaltning och tilläggsbeställningar",
            "Säkerställa prisjusteringsmekanismer som skyddar mot orimliga kostnadsökningar",
          ],
          pitfalls: [
            "Att välja leverantör enbart baserat på lägst pris utan att analysera TCO",
            "Att inte definiera vad som ingår i basförvaltningen vs. vad som kostar extra",
            "Att missa dolda kostnader som integrationsanpassningar, utbildning och exitkostnader",
            "Att inte förhandla pristak eller indexklausuler för fleråriga avtal",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare har du den bästa insikten i systemets verkliga kostnader och tekniska skick. Du ansvarar för att ta fram faktabaserade kostnadsunderlag, identifiera teknisk skuld och rekommendera hur underhållsbudgeten bör fördelas för att maximera systemets livslängd och prestanda.",
          keyActions: [
            "Ta fram regelbundna TCO-rapporter med uppdelning i drift, underhåll och vidareutveckling",
            "Kvantifiera teknisk skuld och presentera den som ekonomisk risk för ledningen",
            "Följa och rapportera trender i kostnadsfördelningen som indikerar behov av åtgärd",
            "Föreslå proaktiva underhållsinvesteringar som minskar framtida kostnader",
          ],
          pitfalls: [
            "Att inte dokumentera och kommunicera teknisk skuld förrän den blivit akut",
            "Att underskatta dolda kostnader som intern support, workarounds och produktivitetsförlust",
            "Att presentera kostnader utan att koppla dem till verksamhetsnytta eller risk",
            "Att inte planera för teknologiförnyelse — alla plattformar har en End-of-Life",
          ],
        },
      ],
      reflection: {
        question:
          "Känner du till den verkliga TCO för ert viktigaste system, inklusive interna personalkostnader och ackumulerad teknisk skuld?",
      },
      quiz: {
        questions: [
          {
            id: "q-sf4-1",
            question:
              "Vilka tre huvudkategorier ingår typiskt i en förvaltningsbudget?",
            options: [
              {
                id: "a",
                text: "Personal, lokaler och material",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Drift, underhåll och vidareutveckling",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Licenser, konsulter och hårdvara",
                isCorrect: false,
              },
              {
                id: "d",
                text: "CAPEX, OPEX och avskrivningar",
                isCorrect: false,
              },
            ],
            explanation:
              "Förvaltningsbudgeten delas typiskt i drift (löpande kostnader), underhåll (buggfixar, uppdateringar) och vidareutveckling (ny funktionalitet). Fördelningen mellan dessa tre kategorier förändras med systemets ålder och mognad.",
          },
          {
            id: "q-sf4-2",
            question:
              "Vad innebär FinOps-principen 'Inform' i kontexten av molnkostnader?",
            options: [
              {
                id: "a",
                text: "Att informera leverantören om budgetrestriktioner",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Att ge verksamheten realtidsinsyn i molnkostnader och resursanvändning",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Att rapportera säkerhetsincidenter till myndigheterna",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Att informera alla anställda om IT-policyer",
                isCorrect: false,
              },
            ],
            explanation:
              "FinOps-principen 'Inform' handlar om att ge alla stakeholders — inklusive verksamheten — realtidsinsyn i molnkostnader och resursanvändning. Transparens är grunden för kostnadsoptimering.",
          },
          {
            id: "q-sf4-3",
            question: "Varför bör en TCO-beräkning sträcka sig över minst 5-7 år?",
            options: [
              {
                id: "a",
                text: "För att det är krav i LOU att avtalstiden ska vara minst 5 år",
                isCorrect: false,
              },
              {
                id: "b",
                text: "För att fånga hela livscykeln inklusive teknologiförnyelse, ackumulerat underhåll och eventuell avveckling",
                isCorrect: true,
              },
              {
                id: "c",
                text: "För att budgeten alltid fastställs i 5-årsperioder i offentlig sektor",
                isCorrect: false,
              },
              {
                id: "d",
                text: "För att det tar 5-7 år att implementera ett nytt system",
                isCorrect: false,
              },
            ],
            explanation:
              "En TCO-beräkning bör sträcka sig över hela den planerade livscykeln (typiskt 5-7 år) för att fånga kostnader som uppstår senare: teknologiförnyelse, ökande underhållskostnader, datamigrering och avveckling.",
          },
          {
            id: "q-sf4-4",
            question:
              "Vad händer med förvaltningskostnaderna när teknisk skuld ackumuleras utan åtgärd?",
            options: [
              {
                id: "a",
                text: "Kostnaderna förblir konstanta — teknisk skuld påverkar inte ekonomin",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Kostnaderna minskar eftersom mindre underhåll utförs",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Framtida kostnader ökar exponentiellt och systemet riskerar att kräva total ersättning",
                isCorrect: true,
              },
              {
                id: "d",
                text: "Kostnaderna ökar linjärt och proportionellt mot tiden",
                isCorrect: false,
              },
            ],
            explanation:
              "Teknisk skuld ackumuleras exponentiellt — varje uppskjuten åtgärd gör framtida åtgärder dyrare och mer komplexa. Till slut kan skulden bli så stor att systemet måste ersättas helt, vilket är betydligt dyrare än regelbundet proaktivt underhåll.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 5 — Livscykelhantering och avveckling                       */
    /* ================================================================== */
    {
      id: "systemforvaltning-5",
      title: "Livscykelhantering och avveckling",
      theory: {
        content: [
          "Varje IT-system genomgår en livscykel: införande (implementation och driftsättning), aktiv förvaltning (systemet levererar fullt värde), mognadsfas (systemet fungerar men moderniseringsbehovet ökar) och avveckling (systemet ersätts eller fasas ut). Att planera för hela livscykeln redan vid upphandlingen ger bättre beslut och minskar riskerna vid framtida byten. Gartner TIME-modellen (Tolerate, Invest, Migrate, Eliminate) ger ett strukturerat sätt att kategorisera systemportföljen: tolerera system som fungerar tillräckligt bra, investera i system med hög verksamhetsnytta, migrera system till modernare plattformar, och eliminera system som inte längre behövs.",
          "Vendor lock-in (leverantörsinlåsning) är ett av de allvarligaste riskerna i systemförvaltning. Inlåsning uppstår när organisationen blir beroende av en specifik leverantör på grund av proprietära dataformat, unika teknologier eller avsaknad av exit-klausuler. För att motverka vendor lock-in bör upphandlingen innehålla krav på öppna standarder och format, rätt till data vid avtalets slut (inklusive dataexport i öppna format), stöd för datamigrering, en rimlig övergångsperiod och dokumentation av systemarkitektur och konfiguration.",
          "Avveckling (decommissioning) är ofta den mest försummade fasen i livscykeln. En systematisk avvecklingsplan bör omfatta: datamigrering (vilka data ska flyttas, i vilka format och med vilken kvalitetskontroll), parallellkörning (hur länge körs gamla och nya systemet parallellt), kunskapsöverföring (hur säkerställs att kompetensen om det nya systemet finns i organisationen), juridiska krav (hur länge måste data bevaras enligt arkivlagen och GDPR) och slutligen den tekniska nedmonteringen av infrastruktur, licenser och behörigheter.",
          "ISO 27001 (informationssäkerhet) ställer specifika krav på säker avveckling av IT-system. Standarden kräver att all känslig data raderas på ett säkert sätt (med verifiering), att åtkomsträttigheter avvecklas, att loggar arkiveras och att avvecklingsprocessen dokumenteras. I offentlig sektor tillkommer krav från tryckfrihetsförordningen och arkivlagen om bevarande av allmänna handlingar, vilket kan komplicera avvecklingen avsevärt.",
        ],
        keyPoints: [
          "Gartner TIME-modellen: Tolerate, Invest, Migrate, Eliminate — kategoriserar systemportföljen",
          "Vendor lock-in motverkas med öppna standarder, exit-klausuler och rätt till data",
          "Avvecklingsplan omfattar: datamigrering, parallellkörning, kunskapsöverföring, juridik",
          "ISO 27001 kräver säker dataradering, åtkomstavveckling och dokumenterad process",
          "Planera för hela livscykeln redan vid upphandling — inklusive exit och avveckling",
        ],
      },
      scenario: {
        id: "scenario-sf-5",
        title: "Det åldrande systemet",
        context:
          "Du förvaltar en regions personaladministrationssystem som är 12 år gammalt. Leverantören har meddelat att de slutar supportera plattformen om två år. Systemet innehåller 15 års personaldata, är djupt integrerat med lönesystemet och ekonomisystemet, och 400 användare är beroende av det dagligen. Det finns inget dokumenterat exit-avtal med leverantören.",
        steps: [
          {
            situation:
              "Regionstyrelsen har beslutat att systemet ska ersättas. Du ska leda exit-planeringen. Leverantören har sagt att dataexport 'inte ingår i avtalet' och att de kan erbjuda migreringshjälp mot extra kostnad. Datakvaliteten är okänd — ingen rensning har gjorts under 15 år.",
            question: "Vad bör vara ditt första steg i exit-planeringen?",
            choices: [
              {
                id: "1a",
                text: "Börja genast upphandla ett nytt system — tiden är knapp.",
                isOptimal: false,
                feedback:
                  "Att upphandla ett nytt system innan du har kartlagt datakvaliteten, integrationer och juridiska krav riskerar att du ställer fel krav i upphandlingen. Du vet inte vilken data som ska migreras, vilka format som behövs eller vilka integrationer det nya systemet måste stödja.",
              },
              {
                id: "1b",
                text: "Genomför en komplett kartläggning: datakvalitet och datavolym, alla integrationer med andra system, juridiska krav på databevarande, och leverantörens kontraktuella skyldigheter gällande exit.",
                isOptimal: true,
                feedback:
                  "Korrekt. Innan du kan planera exit eller upphandla nytt behöver du en fullständig bild av nuläget. Kartläggningen ger underlag för migreringsplan, upphandlingskrav och riskbedömning. Utan denna kartläggning baseras alla efterföljande beslut på antaganden.",
              },
              {
                id: "1c",
                text: "Kontakta leverantören och förhandla om migreringshjälp — de känner systemet bäst.",
                isOptimal: false,
                feedback:
                  "Leverantören har ett egenintresse i situationen och bör inte ensidigt styra exit-processen. Du behöver först kartlägga din egen situation innan du kan förhandla med leverantören på lika villkor.",
              },
            ],
          },
          {
            situation:
              "Kartläggningen visar att systemet innehåller 2 TB personaldata (varav mycket historisk), 8 integrationer med andra system, och att arkivlagen kräver att viss data bevaras i 10 år efter avslutad anställning. Leverantörens avtal saknar exit-klausuler.",
            question:
              "Hur hanterar du dataaspekterna av avvecklingen?",
            choices: [
              {
                id: "2a",
                text: "Migrera all data till det nya systemet — man vet aldrig vad som kan behövas.",
                isOptimal: false,
                feedback:
                  "Att migrera 15 års ostrukturerad data utan rensning är dyrt, tidskrävande och riskerar att föra med sig datakvalitetsproblem till det nya systemet. Enligt GDPR ska personuppgifter inte bevaras längre än nödvändigt.",
              },
              {
                id: "2b",
                text: "Klassificera data i tre kategorier: aktiv data som migreras till nytt system, arkivdata som bevaras enligt arkivlagen i ett separat arkiv, och data som kan raderas (efter GDPR:s princip om lagringsminimering). Säkerställ säker radering enligt ISO 27001.",
                isOptimal: true,
                feedback:
                  "Korrekt. En strukturerad dataklassificering balanserar arkivlagens bevarandekrav med GDPR:s krav på lagringsminimering. ISO 27001 ger ramverket för säker radering, och ett separat arkiv löser behovet av långsiktig bevarande utan att belasta det nya systemet.",
              },
              {
                id: "2c",
                text: "Radera all data efter migrering till nytt system — ingen tittar ändå på gammal data.",
                isOptimal: false,
                feedback:
                  "Att radera all data utan hänsyn till arkivlagen och GDPR:s bestämmelser är olagligt. Viss personaldata måste bevaras enligt lag, och radering kräver dokumenterad process enligt ISO 27001.",
              },
            ],
          },
          {
            situation:
              "Du planerar övergången till det nya systemet som upphandlats. 400 användare ska byta system och 8 integrationer ska kopplas om.",
            question: "Hur planerar du övergångsperioden?",
            choices: [
              {
                id: "3a",
                text: "Big bang — stäng av gamla systemet en fredag och slå på det nya måndag morgon.",
                isOptimal: false,
                feedback:
                  "En big bang-övergång för ett verksamhetskritiskt system med 400 användare och 8 integrationer innebär extremt hög risk. Om något går fel finns ingen fallback, och personaladministrationen kan stå stilla.",
              },
              {
                id: "3b",
                text: "Planera parallellkörning i 2-3 månader, migrera integrationer en i taget med rollback-plan, utbilda användarna i omgångar och ha det gamla systemet som fallback tills det nya är verifierat.",
                isOptimal: true,
                feedback:
                  "Korrekt. Parallellkörning ger möjlighet att verifiera det nya systemet i drift med riktiga data och riktiga användare. Stegvis migrering av integrationer minskar risken, och utbildning i omgångar säkerställer att alla användare hinner lära sig det nya systemet.",
              },
              {
                id: "3c",
                text: "Låt avdelningarna själva bestämma när de vill byta — frivillig migrering.",
                isOptimal: false,
                feedback:
                  "Frivillig migrering leder till att organisationen kör två system parallellt på obestämd tid, med dubblerade kostnader och integrationsproblem. Övergången behöver en styrd plan med tydliga deadlines.",
              },
            ],
          },
        ],
        roleRelevance: ["BESTALLARE", "UPPHANDLARE", "SYSTEMAGARE"],
      },
      roleDeepDives: [
        {
          role: "BESTALLARE",
          perspective:
            "Som beställare ansvarar du för att livscykelbeslut fattas i tid och att avvecklingsrisker inte ignoreras. Du behöver förstå Gartner TIME-modellen för att klassificera era system och proaktivt initiera ersättning eller migrering innan ett system når end-of-life.",
          keyActions: [
            "Klassificera systemportföljen enligt TIME-modellen och agera på resultatet",
            "Kräva att exit-klausuler och dataägandeavtal inkluderas i alla systemupphandlingar",
            "Initiera ersättningsplanering minst 2-3 år innan ett system når end-of-support",
            "Säkerställa att budget finns avsatt för datamigrering och parallellkörning vid systembyte",
          ],
          pitfalls: [
            "Att ignorera end-of-support-meddelanden tills det blir akut",
            "Att inte kräva exit-klausuler vid upphandling — 'vi tänker behålla systemet länge'",
            "Att underbudgetera avvecklingsfasen — datamigrering och parallellkörning är kostsamt",
            "Att glömma kunskapsöverföring — användarna behöver tid att lära sig det nya systemet",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare är din viktigaste uppgift gällande livscykel att redan vid upphandling bygga in villkor som skyddar organisationen vid framtida systembyte. Exit-klausuler, krav på öppna format och rätt till data är inte förhandlingspositioner — de är nödvändiga skydd mot vendor lock-in.",
          keyActions: [
            "Inkludera obligatoriska exit-klausuler i alla systemavtal: dataexport, övergångsperiod, kunskapsöverföring",
            "Kravställa öppna dataformat och dokumenterad systemarkitektur i upphandlingen",
            "Definiera vad 'rätt till data' innebär konkret: vilka data, i vilka format, inom vilken tid",
            "Säkerställa att avvecklingshjälp ingår i avtalet — inte som tilläggsbeställning till okänt pris",
          ],
          pitfalls: [
            "Att utelämna exit-klausuler — 'det blir en framtida förhandlingsfråga'",
            "Att acceptera proprietära format utan att kravställa parallell export i öppet format",
            "Att inte testa exit-klausulerna — begär en testexport av data under avtalstiden",
            "Att inte beakta avvecklingskostnader i TCO-beräkningen vid upphandling",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare ansvarar du för den tekniska genomförbarheten av migrering och avveckling. Du behöver upprätthålla aktuell dokumentation om systemets arkitektur, integrationer och datamängder så att migrering och avveckling kan planeras realistiskt. ISO 27001-kraven på säker avveckling vilar operativt på dig.",
          keyActions: [
            "Upprätthålla aktuell dokumentation av systemarkitektur, integrationer och databeroenden",
            "Genomföra regelbundna testmigreringar för att verifiera att data kan exporteras enligt avtalade format",
            "Planera och genomföra säker dataradering enligt ISO 27001 vid avveckling",
            "Utarbeta detaljerade migreringsplaner med rollback-möjligheter och verifieringssteg",
          ],
          pitfalls: [
            "Att inte dokumentera systemets beroenden och integrationer löpande",
            "Att anta att dataexport fungerar utan att testa — testa export regelbundet",
            "Att missa att avveckla åtkomsträttigheter och behörigheter i avvecklade system",
            "Att underskatta tidsåtgången för datamigrering — det tar alltid längre än planerat",
          ],
        },
      ],
      reflection: {
        question:
          "Har era nuvarande avtal tydliga exit-villkor — vad händer om ni vill byta leverantör, och har ni testat att dataexport faktiskt fungerar?",
      },
      quiz: {
        questions: [
          {
            id: "q-sf5-1",
            question:
              "Vad innebär kategorin 'Migrate' i Gartner TIME-modellen?",
            options: [
              {
                id: "a",
                text: "Migrera användarna till ett annat system utan att ändra plattformen",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Flytta systemet till en modernare plattform eller ersätt det med en bättre lösning",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Flytta systemet till molnet utan andra förändringar",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Migrera data till en central dataplattform",
                isCorrect: false,
              },
            ],
            explanation:
              "I Gartner TIME-modellen innebär 'Migrate' att systemet bör flyttas till en modernare plattform eller ersättas med en bättre lösning. Det används för system som fortfarande behövs men vars nuvarande plattform inte längre är optimal.",
          },
          {
            id: "q-sf5-2",
            question:
              "Vilken standard ställer krav på säker radering av data vid avveckling av IT-system?",
            options: [
              { id: "a", text: "ISO 9001", isCorrect: false },
              { id: "b", text: "ITIL 4", isCorrect: false },
              { id: "c", text: "ISO 27001", isCorrect: true },
              { id: "d", text: "COBIT 2019", isCorrect: false },
            ],
            explanation:
              "ISO 27001 (informationssäkerhet) ställer specifika krav på säker hantering av data vid avveckling, inklusive verifierad radering av känslig data, avveckling av åtkomsträttigheter och dokumentation av processen.",
          },
          {
            id: "q-sf5-3",
            question:
              "Vilka exit-krav bör alltid ingå i ett avtal för att motverka vendor lock-in?",
            options: [
              {
                id: "a",
                text: "Krav på att leverantören inte får ha andra kunder",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Rätt till data i öppna format, stöd för datamigrering och en övergångsperiod",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Krav på att leverantören ska stödja systemet gratis efter avtalets slut",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Krav på att källkoden deponeras hos en tredje part",
                isCorrect: false,
              },
            ],
            explanation:
              "De viktigaste exit-kraven för att motverka vendor lock-in är: rätt till data i öppna format, stöd för datamigrering (inklusive hur och inom vilken tid), och en rimlig övergångsperiod där leverantören stödjer överföringen till ny lösning.",
          },
          {
            id: "q-sf5-4",
            question:
              "Varför bör parallellkörning planeras vid byte av verksamhetskritiska system?",
            options: [
              {
                id: "a",
                text: "Det är ett juridiskt krav enligt LOU",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Det ger möjlighet att verifiera det nya systemet i drift med riktiga data och användare innan det gamla stängs",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Det är alltid billigare att köra två system samtidigt",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Det krävs av ISO 27001 för alla system",
                isCorrect: false,
              },
            ],
            explanation:
              "Parallellkörning ger möjlighet att verifiera det nya systemet med riktiga data och riktiga användare innan det gamla stängs. Det fungerar som en säkerhetsbuffert — om det nya systemet har problem kan verksamheten falla tillbaka till det gamla.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 6 — Ständiga förbättringar och mätning                      */
    /* ================================================================== */
    {
      id: "systemforvaltning-6",
      title: "Ständiga förbättringar och mätning",
      theory: {
        content: [
          "ITIL 4:s Continual Improvement Model är en strukturerad metod för ständig förbättring i sju steg: (1) Vad är visionen? (2) Var är vi nu? (3) Var vill vi vara? (4) Hur tar vi oss dit? (5) Agera. (6) Har vi nått dit? (7) Hur behåller vi momentumet? Modellen bygger på att förbättring inte är ett engångsprojekt utan en pågående cykel. I svensk systemförvaltning innebär detta att förvaltningsorganisationen regelbundet ska utvärdera sin egen effektivitet, inte bara systemets tekniska prestanda.",
          "KPI-ramverk (Key Performance Indicators) för systemförvaltning bör balansera tekniska, verksamhetsmässiga och ekonomiska mätetal. ITIL definierar fyra dimensioner av tjänstehantering: organisationer och människor, information och teknik, partners och leverantörer, samt värdeströmmar och processer. Ett balanserat KPI-ramverk mäter alla fyra dimensionerna — till exempel: systemtillgänglighet (teknik), användarens nöjdhet (människor), SLA-uppfyllnad gentemot leverantör (partners) och ärendehanteringstid (processer).",
          "Balanced Scorecard för IT, anpassat för förvaltning, mäter prestanda ur fyra perspektiv: finansiellt perspektiv (kostnad per användare, budget mot utfall, TCO-trend), kundperspektiv (användarnöjdhet, SLA-uppfyllnad, antal eskalerade ärenden), processperspektiv (ärendehanteringstid, first-time-fix-rate, antal ändringar som orsakar incidenter) och lärande- och tillväxtperspektiv (personalens kompetensutveckling, processmognad, innovations-rate). Genom att mäta alla fyra perspektiv undviker man suboptimering — exempelvis att minska kostnader på bekostnad av användarnöjdhet.",
          "CSI (Continual Service Improvement) i den äldre ITIL v3-terminologin, och dess efterföljare i ITIL 4, betonar vikten av benchmarking — att jämföra sin förvaltnings prestanda med jämförbara organisationer. I offentlig sektor erbjuder organisationer som SKR (Sveriges Kommuner och Regioner) benchmarkingdata för IT-nyckeltal. Benchmarking ger perspektiv: är vår kostnad per användare rimlig? Är vår systemtillgänglighet i klass med jämförbara organisationer? Utan jämförelse saknas referenspunkt för att bedöma om förvaltningen presterar väl eller behöver förbättras.",
        ],
        keyPoints: [
          "ITIL 4 Continual Improvement Model har sju steg — förbättring är en pågående cykel",
          "KPI-ramverk bör mäta alla ITIL:s fyra dimensioner: organisation, teknik, partners, processer",
          "Balanced Scorecard ger balans: finansiellt, kund, process och lärande/tillväxt",
          "Benchmarking med jämförbara organisationer ger perspektiv och referenspunkter",
          "CSI-register dokumenterar förbättringsinitiativ och deras status",
        ],
      },
      scenario: {
        id: "scenario-sf-6",
        title: "Förvaltningen som inte vet om den är bra",
        context:
          "Du är ny förvaltningsledare för en kommuns socialtjänstsystem. Systemet har förvaltats i fem år men det finns inga definierade nyckeltal. IT-avdelningen säger att 'allt fungerar bra' medan socialtjänstens handläggare klagar på tröga svarstider och svårbegripliga felmeddelanden. Ingen kan visa siffror som stödjer någons position.",
        steps: [
          {
            situation:
              "Du har fått i uppdrag att införa systematisk mätning av förvaltningens kvalitet. Du behöver välja vilka nyckeltal som ska mätas och hur. IT-avdelningen föreslår att mäta servertillgänglighet ('vi har 99,5% uptime') medan socialtjänstchefen vill mäta användarnas upplevelse.",
            question: "Hur utformar du KPI-ramverket?",
            choices: [
              {
                id: "1a",
                text: "Mät enbart servertillgänglighet — det är ett objektivt och mätbart nyckeltal.",
                isOptimal: false,
                feedback:
                  "Servertillgänglighet mäter bara en dimension. Ett system kan ha 99,5% uptime men ändå vara oanvändbart på grund av tröga svarstider, dålig UX eller felaktiga beräkningar. Ensidig teknisk mätning missar verksamhetsperspektivet.",
              },
              {
                id: "1b",
                text: "Implementera ett balanserat KPI-ramverk baserat på ITIL:s fyra dimensioner: teknisk prestanda (tillgänglighet, svarstider), användarnöjdhet (enkäter, NPS), processeffektivitet (ärendetid, first-time-fix) och ekonomi (kostnad per användare).",
                isOptimal: true,
                feedback:
                  "Korrekt. Ett balanserat KPI-ramverk som mäter alla fyra ITIL-dimensionerna ger en komplett bild. Teknisk mätning kompletteras med användarupplevelse, processeffektivitet och ekonomisk uppföljning. Balanced Scorecard-perspektivet förhindrar suboptimering.",
              },
              {
                id: "1c",
                text: "Mät enbart användarnöjdhet — det är det enda som spelar roll.",
                isOptimal: false,
                feedback:
                  "Användarnöjdhet är viktigt men inte tillräckligt ensamt. Utan tekniska mätetal kan du inte diagnostisera problem, och utan ekonomiska nyckeltal kan du inte prioritera förbättringar baserat på kostnadseffektivitet.",
              },
            ],
          },
          {
            situation:
              "Du har infört KPI-mätning och efter sex månader visar data att: systemtillgängligheten är 99,2% (under SLA-nivån 99,5%), genomsnittlig ärendehanteringstid är 4,5 dagar (SLA: 2 dagar), men användarnöjdheten har ökat från 3,1 till 3,8 (av 5) sedan förvaltningen professionaliserades.",
            question: "Hur använder du mätresultaten för att driva förbättring?",
            choices: [
              {
                id: "2a",
                text: "Fokusera all energi på att höja tillgängligheten till 99,5% — det är en SLA-avvikelse.",
                isOptimal: false,
                feedback:
                  "SLA-avvikelsen är viktig men ITIL:s Continual Improvement Model säger att du först ska analysera grundorsaken. Kanske orsakas tillgänglighetsproblemet av samma underliggande faktor som de långa ärendetiderna.",
              },
              {
                id: "2b",
                text: "Dokumentera resultaten i ett CSI-register, analysera grundorsaker med problemhanteringsprocessen, prioritera förbättringar baserat på verksamhetspåverkan, och rapportera progress till styrgruppen med Continual Improvement Model som ramverk.",
                isOptimal: true,
                feedback:
                  "Korrekt. ITIL:s Continual Improvement Model ger strukturen: var är vi nu (mätresultaten), var vill vi vara (SLA-mål), hur tar vi oss dit (grundorsaksanalys och åtgärdsplan). CSI-registret dokumenterar alla förbättringsinitiativ och deras status.",
              },
              {
                id: "2c",
                text: "Användarnöjdheten ökar ju — det går åt rätt håll. Fortsätt som nu.",
                isOptimal: false,
                feedback:
                  "Ökande användarnöjdhet är positivt men SLA-avvikelser måste adresseras. Att ignorera mätbara avvikelser underminerar trovärdigheten för hela KPI-ramverket och SLA-avtalet med leverantören.",
              },
            ],
          },
        ],
        roleRelevance: ["BESTALLARE", "UPPHANDLARE", "SYSTEMAGARE"],
      },
      roleDeepDives: [
        {
          role: "BESTALLARE",
          perspective:
            "Som beställare är du den primära mottagaren av förvaltningens resultatrapporter. Du behöver kunna tolka KPI:er i termer av verksamhetsnytta och använda dem som underlag för prioriteringsbeslut. Balanced Scorecard-perspektivet hjälper dig att balansera kortsiktiga kostnadsbesparingar mot långsiktig verksamhetsnytta.",
          keyActions: [
            "Definiera verksamhetsrelevanta KPI:er — inte bara tekniska mätetal utan även användarupplevelse och affärsvärde",
            "Kräva regelbundna förvaltningsrapporter med balanserade nyckeltal",
            "Använda benchmarkingdata för att bedöma om förvaltningen presterar rimligt",
            "Delta aktivt i förvaltningsrevisioner och fatta förbättringsbeslut baserat på data",
          ],
          pitfalls: [
            "Att acceptera enbart tekniska KPI:er utan att kräva verksamhetsrelevanta mätetal",
            "Att inte agera på KPI-avvikelser — mätning utan åtgärd är meningslös",
            "Att jämföra äpplen med päron vid benchmarking — kontext och komplexitet skiljer sig",
            "Att fokusera enbart på kostnadsmätetal och glömma kvalitet och användarnöjdhet",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du inkludera mätning och uppföljning som kravområde i förvaltningsupphandlingen. Avtalet bör specificera vilka KPI:er som mäts, hur de rapporteras, vilka konsekvenser avvikelser får och hur förbättringsarbetet ska bedrivas.",
          keyActions: [
            "Inkludera krav på KPI-rapportering och regelbundna servicemöten i avtalet",
            "Definiera tydliga konsekvenser av SLA-avvikelser: viten, förbättringsplaner, uppsägningsrätt",
            "Kravställa att leverantören deltar i förbättringsarbete och benchmarking",
            "Inkludera revisionsrätt med möjlighet att genomföra oberoende granskning av leverantörens rapportering",
          ],
          pitfalls: [
            "Att inte definiera KPI:er och mätmetoder i avtalet — det går inte att kräva i efterhand",
            "Att ha viten som är så låga att leverantören tjänar på att bryta SLA:et",
            "Att inte kravställa proaktiv förbättring — bara mäta utan att agera ger ingen nytta",
            "Att missa att definiera vem som äger mätdata och hur den verifieras",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare ansvarar du för att samla in, analysera och rapportera mätdata. Du implementerar mätverktyg, säkerställer datakvalitet och driver det tekniska förbättringsarbetet. ITIL:s Continual Improvement Model och CSI-register är dina huvudverktyg för strukturerat förbättringsarbete.",
          keyActions: [
            "Implementera automatiserad mätning av tekniska KPI:er (tillgänglighet, svarstider, felfrekvens)",
            "Underhålla ett CSI-register med alla förbättringsinitiativ, status och utfall",
            "Genomföra regelbunden trendanalys av mätdata för att identifiera mönster och grundorsaker",
            "Presentera mätresultat på ett sätt som verksamheten kan förstå och agera på",
          ],
          pitfalls: [
            "Att mäta det som är lätt att mäta istället för det som är relevant att mäta",
            "Att rapportera rådata utan analys och rekommendationer — data utan tolkning är oanvändbar",
            "Att inte följa upp implementerade förbättringar — gav åtgärden faktiskt effekt?",
            "Att låta CSI-registret bli en lista som ingen agerar på",
          ],
        },
      ],
      reflection: {
        question:
          "Hur mäter ni idag om förvaltningen fungerar bra — finns det definierade nyckeltal som balanserar teknik, användarnöjdhet, ekonomi och processeffektivitet?",
      },
      quiz: {
        questions: [
          {
            id: "q-sf6-1",
            question:
              "Hur många steg har ITIL 4:s Continual Improvement Model?",
            options: [
              { id: "a", text: "4 steg (Plan, Do, Check, Act)", isCorrect: false },
              { id: "b", text: "5 steg", isCorrect: false },
              { id: "c", text: "7 steg", isCorrect: true },
              { id: "d", text: "10 steg", isCorrect: false },
            ],
            explanation:
              "ITIL 4:s Continual Improvement Model har sju steg: (1) Vad är visionen? (2) Var är vi nu? (3) Var vill vi vara? (4) Hur tar vi oss dit? (5) Agera. (6) Har vi nått dit? (7) Hur behåller vi momentumet?",
          },
          {
            id: "q-sf6-2",
            question:
              "Vilka fyra perspektiv ingår i Balanced Scorecard för IT-förvaltning?",
            options: [
              {
                id: "a",
                text: "Teknik, drift, support och utveckling",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Finansiellt, kund, process, lärande och tillväxt",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Incident, problem, ändring och release",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Plan, build, run, monitor",
                isCorrect: false,
              },
            ],
            explanation:
              "Balanced Scorecard mäter prestanda ur fyra perspektiv: finansiellt (kostnader, budget), kund (användarnöjdhet, SLA), process (ärendetid, kvalitet) och lärande/tillväxt (kompetens, innovation). Balansen förhindrar suboptimering.",
          },
          {
            id: "q-sf6-3",
            question:
              "Vad är syftet med ett CSI-register i förvaltningen?",
            options: [
              {
                id: "a",
                text: "Att registrera alla konfigurationsenheter i IT-miljön",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Att dokumentera alla säkerhetsincidenter",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Att dokumentera förbättringsinitiativ, deras status och utfall för att säkerställa att förbättringsarbetet är systematiskt",
                isCorrect: true,
              },
              {
                id: "d",
                text: "Att registrera alla ändringar som genomförts i systemet",
                isCorrect: false,
              },
            ],
            explanation:
              "CSI-registret (Continual Service Improvement register) dokumenterar alla identifierade förbättringsmöjligheter, deras prioritet, status och utfall. Det säkerställer att förbättringsarbetet är systematiskt och att ingenting glöms bort.",
          },
          {
            id: "q-sf6-4",
            question:
              "Vilka fyra dimensioner av tjänstehantering definierar ITIL 4?",
            options: [
              {
                id: "a",
                text: "Organisationer och människor, information och teknik, partners och leverantörer, värdeströmmar och processer",
                isCorrect: true,
              },
              {
                id: "b",
                text: "Strategi, design, transition, drift",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Planera, bygga, drifta, förbättra",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Kunder, leverantörer, personal, teknik",
                isCorrect: false,
              },
            ],
            explanation:
              "ITIL 4 definierar fyra dimensioner av tjänstehantering: organisationer och människor, information och teknik, partners och leverantörer, samt värdeströmmar och processer. Alla fyra dimensionerna måste beaktas för att leverera värde.",
          },
          {
            id: "q-sf6-5",
            question:
              "Varför är benchmarking värdefullt för IT-förvaltning i offentlig sektor?",
            options: [
              {
                id: "a",
                text: "Det är ett lagkrav enligt LOU att genomföra benchmarking",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Det ger en referenspunkt för att bedöma om förvaltningens prestanda och kostnader är rimliga jämfört med jämförbara organisationer",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Det ersätter behovet av egna KPI:er",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Det garanterar att förvaltningen presterar på toppnivå",
                isCorrect: false,
              },
            ],
            explanation:
              "Benchmarking ger en extern referenspunkt — utan jämförelse med andra organisationer saknas perspektiv på om kostnader och prestanda är rimliga. SKR erbjuder benchmarkingdata för offentlig sektor som möjliggör sådana jämförelser.",
          },
        ],
        passingScore: 3,
      },
    },
  ],
};

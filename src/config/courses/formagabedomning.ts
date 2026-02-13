import type { EnhancedCourse } from "./types";

export const formagabedomning: EnhancedCourse = {
  id: "formagabedomning",
  title: "Förmågebedömning",
  icon: "gauge",
  description:
    "Utvärdera förmågor inom människa, teknik och process — mognadsmodeller, gap-analys, handlingsplaner med stöd av TOGAF, CMMI, COBIT och ISO 15504.",
  level: "Medel",
  estimatedMinutes: 45,
  tags: [
    "Förmåga",
    "Människa",
    "Teknik",
    "Process",
    "TOGAF",
    "CMMI",
    "COBIT",
    "ISO 15504",
    "ArchiMate",
    "BiSL",
    "SFIA",
  ],
  modules: [
    /* ================================================================== */
    /*  Modul 1 — Vad är förmågebedömning?                                */
    /* ================================================================== */
    {
      id: "formagabedomning-1",
      title: "Vad är förmågebedömning?",
      theory: {
        content: [
          "Förmågebedömning (Capability Assessment) är en systematisk metod för att utvärdera en organisations kapacitet att utföra sina uppdrag och nå sina strategiska mål. Begreppet har sina rötter i TOGAF:s (The Open Group Architecture Framework) Business Architecture, där förmågor definieras som en organisations förmåga att uppnå önskade resultat genom en kombination av människor, processer och teknik. TOGAF introducerar capability-based planning som ett sätt att knyta organisationens strategiska mål till konkreta förmågor som kan mätas, jämföras och utvecklas över tid. Istället för att bara fråga 'Vad behöver vi köpa?' ställer man den mer grundläggande frågan 'Vad kan vi idag, och vad behöver vi kunna imorgon?'",
          "COBIT (Control Objectives for Information and Related Technologies), framtaget av ISACA, tillhandahåller ett ramverk för styrning och ledning av IT som kompletterar förmågebedömningen med strukturerade dimensioner. COBIT 2019 definierar förmågor längs sju dimensioner: principer och policyer, processer, organisationsstrukturer, kultur och beteende, information, tjänster och infrastruktur samt människor och kompetens. Genom att tillämpa dessa dimensioner i upphandlingssammanhang kan beställaren säkerställa att bedömningen inte bara fokuserar på teknik utan fångar hela det organisatoriska ekosystemet som påverkar resultatet av en anskaffning.",
          "I offentlig upphandling är förmågebedömning särskilt värdefullt som beslutsunderlag innan upphandlingsförfarandet inleds. Genom att kartlägga nuläget inom tre centrala dimensioner — Människa (kompetens, roller, organisation), Teknik (system, infrastruktur, verktyg) och Process (arbetssätt, flöden, rutiner) — kan organisationen identifiera var det verkliga gapet ligger. Det som upplevs som ett systemproblem kan i själva verket vara ett kompetensproblem, eller en brist i processerna. Utan en strukturerad förmågebedömning riskerar man att upphandla en lösning på fel problem.",
          "Strategisk anpassning (strategic alignment) är ett nyckelbegrepp inom förmågebedömning. TOGAF:s Architecture Development Method (ADM) betonar att alla förmågor ska kopplas till verksamhetens strategiska mål och arkitekturvision. COBIT 2019:s styrningsprinciper understryker samma sak: varje investering i förmågeutveckling — oavsett om den sker genom upphandling, kompetensutveckling eller processförbättring — måste kunna motiveras utifrån det värde den skapar för organisationen och dess intressenter. Detta perspektiv hjälper upphandlare och beställare att prioritera insatser baserat på strategiskt värde snarare än kortsiktig problemlösning.",
        ],
        keyPoints: [
          "Förmågebedömning utvärderar nuvarande kapacitet mot önskad kapacitet — grundat i TOGAF:s capability-based planning",
          "COBIT 2019 definierar sju dimensioner av förmåga som kompletterar bedömningen",
          "Tre centrala dimensioner: Människa, Teknik och Process",
          "Strategisk anpassning (strategic alignment) säkerställer att förmågebedömningen kopplas till verksamhetsmålen",
          "Särskilt värdefullt som beslutsunderlag innan upphandling påbörjas",
        ],
      },
      scenario: {
        id: "scenario-fb-1",
        title: "IT-chefen vill byta system direkt",
        context:
          "Du arbetar som verksamhetsutvecklare i en kommun. IT-chefen rapporterar att ärendehanteringssystemet är föråldrat och vill att ni omedelbart påbörjar en upphandling av ett nytt system. Medarbetarna klagar dagligen på systemet.",
        steps: [
          {
            situation:
              "IT-chefen säger: 'Systemet är urusel — alla klagar. Vi måste upphandla ett nytt system nu. Jag har redan kollat på tre leverantörer.'",
            question:
              "Hur reagerar du som verksamhetsutvecklare?",
            choices: [
              {
                id: "1a",
                text: "Jag håller med och föreslår att vi skriver en kravspecifikation för ett nytt system direkt.",
                isOptimal: false,
                feedback:
                  "Att gå direkt till kravspecifikation utan förmågebedömning riskerar att lösa fel problem. Klagomålen kan bero på bristande utbildning, otydliga processer eller felaktiga arbetsflöden — inte nödvändigtvis systemet i sig.",
              },
              {
                id: "1b",
                text: "Jag föreslår att vi först gör en förmågebedömning för att förstå om problemet ligger i människa, teknik eller process innan vi upphandlar.",
                isOptimal: true,
                feedback:
                  "Helt rätt. En förmågebedömning enligt TOGAF:s capability-based planning hjälper er att identifiera var det verkliga gapet ligger. Kanske behöver ni utbildning, processförbättring eller en kombination — inte nödvändigtvis ett nytt system.",
              },
              {
                id: "1c",
                text: "Jag föreslår att vi frågar medarbetarna vilka funktioner de saknar i systemet och bygger kravspecifikationen utifrån det.",
                isOptimal: false,
                feedback:
                  "Att samla in önskemål från medarbetare är värdefullt, men utan en strukturerad förmågebedömning riskerar ni att fastna i symtom snarare än grundorsaker. COBIT:s dimensioner påminner om att teknik bara är en av sju dimensioner.",
              },
            ],
          },
          {
            situation:
              "Förmågebedömningen avslöjar att medarbetarna saknar utbildning i systemets avancerade funktioner, att processerna för ärendehantering är otydliga och att systemet faktiskt har de flesta funktioner som efterfrågas. Gapet ligger primärt i människa och process, inte i teknik.",
            question:
              "Hur bör organisationen agera baserat på detta resultat?",
            choices: [
              {
                id: "2a",
                text: "Vi upphandlar nytt system ändå — medarbetarna har tappat förtroendet för det befintliga.",
                isOptimal: false,
                feedback:
                  "Att upphandla nytt system när gapet ligger i kompetens och process är slöseri med skattemedel. Om grundproblemen inte åtgärdas kommer samma problem att uppstå i det nya systemet.",
              },
              {
                id: "2b",
                text: "Vi investerar i kompetensutveckling och processförbättring först, och utvärderar systembehovet igen om 6–12 månader.",
                isOptimal: true,
                feedback:
                  "Korrekt. Genom att adressera de verkliga gapen — människa och process — kan organisationen spara miljoner i onödig upphandling. TOGAF:s gap-analys bekräftar att lösningen ska matcha det identifierade gapet.",
              },
              {
                id: "2c",
                text: "Vi gör en kompromiss: upphandlar ett enklare system och ger lite utbildning.",
                isOptimal: false,
                feedback:
                  "En kompromisslösning som inte adresserar grundproblemet riskerar att bli dyr utan att lösa problemen. Förmågebedömningen visar tydligt att teknikdimensionen inte är det primära gapet.",
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
            "Som beställare är du den som initierar och motiverar förmågebedömningen inför verksamheten. Du behöver förstå TOGAF:s capability-based planning tillräckligt väl för att kunna argumentera för varför en strukturerad bedömning behövs innan resurser allokeras till upphandling. Din roll är att koppla förmågebedömningen till verksamhetens strategiska mål och säkerställa att eventuella investeringar ger maximalt värde.",
          keyActions: [
            "Initiera förmågebedömning som del av behovsanalysen innan upphandling",
            "Koppla bedömningen till verksamhetens strategiska mål med stöd av TOGAF:s ADM",
            "Involvera alla relevanta intressenter i bedömningsarbetet",
            "Använda COBIT:s dimensioner som checklista för att säkerställa helhetssyn",
          ],
          pitfalls: [
            "Att hoppa över förmågebedömning och gå direkt till kravspecifikation",
            "Att enbart fokusera på teknikdimensionen och missa människa och process",
            "Att inte förankra förmågebedömningen i verksamhetens strategiska plan",
            "Att se förmågebedömning som en engångsaktivitet istället för en löpande process",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du förmågebedömningens resultat som underlag för att utforma upphandlingen rätt. Om gapet primärt ligger i kompetens snarare än teknik bör upphandlingen kanske inkludera utbildningstjänster istället för ett nytt system. Förmågebedömningen hjälper dig att ställa rätt krav och välja rätt upphandlingsförfarande.",
          keyActions: [
            "Använda förmågebedömningens resultat som grund för upphandlingsstrategi",
            "Säkerställa att upphandlingsobjektet matchar det identifierade gapet",
            "Inkludera krav på leverantörens förmåga att stödja organisationens kapacitetsutveckling",
            "Utforma utvärderingskriterier som speglar förmågebedömningens dimensioner",
          ],
          pitfalls: [
            "Att upphandla ett nytt system när gapet ligger i kompetens eller process",
            "Att inte koppla kravspecifikationen till förmågebedömningens resultat",
            "Att underlåta att ställa krav på implementationsstöd och kompetensutveckling",
            "Att missa att bedöma leverantörens egen förmåga att leverera förändring",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare ansvarar du för den tekniska dimensionen av förmågebedömningen. Du bidrar med kunskap om befintliga systems kapacitet, teknisk skuld och integrationsmöjligheter. Din insats är avgörande för att bedöma om ett nytt system verkligen behövs eller om befintliga system kan utvecklas eller konfigureras för att möta behoven.",
          keyActions: [
            "Bidra med objektiv teknisk bedömning av befintliga systems förmåga",
            "Kartlägga teknisk skuld, integrationer och livscykelstatus",
            "Bedöma om befintliga system kan konfigureras eller uppgraderas som alternativ till nytt system",
            "Uppskatta total ägandekostnad (TCO) för olika alternativ",
          ],
          pitfalls: [
            "Att överdriva teknikens roll — problemet kan ligga i människa eller process",
            "Att underdriva teknisk skuld för att undvika upphandling av nytt system",
            "Att inte beakta integrationskostnader i den tekniska bedömningen",
            "Att missa att involvera slutanvändarna i den tekniska förmågebedömningen",
          ],
        },
      ],
      reflection: {
        question:
          "Om du tänker på din organisations största utmaning just nu — ligger grundorsaken i människa, teknik eller process? Vilken av COBIT:s sju dimensioner tror du är mest relevant?",
      },
      quiz: {
        questions: [
          {
            id: "q1-1",
            question:
              "Vad är det primära syftet med TOGAF:s capability-based planning?",
            options: [
              {
                id: "a",
                text: "Att specificera tekniska krav för IT-system",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Att knyta organisationens strategiska mål till mätbara förmågor som kan utvecklas över tid",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Att upprätta en detaljerad projektplan för IT-upphandlingar",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Att certifiera organisationens IT-mognad enligt internationella standarder",
                isCorrect: false,
              },
            ],
            explanation:
              "TOGAF:s capability-based planning syftar till att koppla organisationens strategiska mål till konkreta förmågor som kan mätas, jämföras och utvecklas — inte bara till tekniska system eller projekt.",
          },
          {
            id: "q1-2",
            question:
              "Vilka tre centrala dimensioner används i förmågebedömning?",
            options: [
              {
                id: "a",
                text: "Budget, Tid och Kvalitet",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Människa, Teknik och Process",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Strategi, Taktik och Operation",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Input, Throughput och Output",
                isCorrect: false,
              },
            ],
            explanation:
              "De tre centrala dimensionerna i förmågebedömning är Människa (kompetens, roller, organisation), Teknik (system, infrastruktur, verktyg) och Process (arbetssätt, flöden, rutiner).",
          },
          {
            id: "q1-3",
            question:
              "Hur många dimensioner av förmåga definierar COBIT 2019?",
            options: [
              { id: "a", text: "Tre dimensioner", isCorrect: false },
              { id: "b", text: "Fem dimensioner", isCorrect: false },
              { id: "c", text: "Sju dimensioner", isCorrect: true },
              { id: "d", text: "Nio dimensioner", isCorrect: false },
            ],
            explanation:
              "COBIT 2019 definierar sju dimensioner: principer och policyer, processer, organisationsstrukturer, kultur och beteende, information, tjänster och infrastruktur samt människor och kompetens.",
          },
          {
            id: "q1-4",
            question:
              "Varför är förmågebedömning särskilt värdefullt innan en offentlig upphandling?",
            options: [
              {
                id: "a",
                text: "Det är ett juridiskt krav enligt LOU att genomföra förmågebedömning",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Det hjälper till att identifiera var det verkliga gapet ligger så att rätt typ av lösning upphandlas",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Det krävs för att beräkna tröskelvärdena korrekt",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Det ersätter behovsanalysen i upphandlingsprocessen",
                isCorrect: false,
              },
            ],
            explanation:
              "Förmågebedömning hjälper till att identifiera om gapet ligger i människa, teknik eller process. Utan denna insikt riskerar organisationen att upphandla en lösning på fel problem — till exempel ett nytt system när problemet egentligen är bristande kompetens.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 2 — Dimensionen Människa                                    */
    /* ================================================================== */
    {
      id: "formagabedomning-2",
      title: "Dimensionen Människa — kompetens, roller, organisation",
      theory: {
        content: [
          "Människodimensionen handlar om de mänskliga resurserna som krävs för att en organisation ska kunna realisera sina förmågor. SFIA (Skills Framework for the Information Age) erbjuder ett internationellt erkänt ramverk för att kategorisera och bedöma IT-relaterade kompetenser på sju nivåer, från 'Follow' (nivå 1) till 'Set strategy, inspire, mobilise' (nivå 7). Genom att kartlägga organisationens kompetenser enligt SFIA kan man systematiskt identifiera kompetensgap, planera rekrytering och kompetensutveckling samt ställa relevanta kompetenskrav i upphandlingar. SFIA:s strukturerade tillvägagångssätt ger en gemensam vokabulär som underlättar kommunikation mellan HR, verksamhet och IT.",
          "CMMI:s People CMM (People Capability Maturity Model) tar kompetensperspektivet till organisatorisk nivå genom att definiera fem mognadsnivåer för hur organisationen hanterar sina mänskliga resurser. På den lägsta nivån (Initial) sker personalhantering ad hoc utan systematik. På nivå 2 (Managed) finns grundläggande processer för rekrytering och kompetensutveckling. Nivå 3 (Defined) innebär att organisationen har definierade kompetensramverk och karriärvägar. Nivå 4 (Predictable) innebär att organisationen kvantitativt mäter och styr kompetensutvecklingen. Nivå 5 (Optimizing) innebär kontinuerlig förbättring baserad på data. I upphandlingssammanhang är det avgörande att bedöma organisationens People CMM-mognad — en organisation på nivå 1 kommer sannolikt att misslyckas med att implementera ett nytt system oavsett hur bra tekniken är.",
          "Roller och ansvar måste vara tydligt definierade för att förmågebedömningen ska ge meningsfulla resultat. RACI-matrisen (Responsible, Accountable, Consulted, Informed) är ett etablerat verktyg för att kartlägga ansvarsfördelning, men i komplexa upphandlingsprojekt behöver den kompletteras med en analys av knowledge management-kapaciteten. Hur väl fångar organisationen upp och sprider kunskap? Finns det dokumenterade processer, eller är kunskapen beroende av enskilda individer? ISO 30401:2018 (Knowledge Management Systems) ger vägledning för hur organisationer kan bedöma och utveckla sin förmåga att hantera kunskap som strategisk tillgång.",
          "Nyckelpersonsberoende är en av de vanligaste riskerna som identifieras i människodimensionen. När kritisk kunskap koncentreras till enskilda individer utan backup eller dokumentation skapas en sårbarhet som kan äventyra hela verksamheten. I upphandlingskontext är detta särskilt relevant: om organisationen är beroende av en enda person som förstår det befintliga systemet, blir övergången till ett nytt system en högriskoperation. En strukturerad kompetensinventering med stöd av SFIA och People CMM avslöjar dessa risker innan de blir akuta.",
        ],
        keyPoints: [
          "SFIA definierar sju kompetensnivåer för systematisk bedömning av IT-kompetens",
          "CMMI People CMM beskriver fem mognadsnivåer för organisationens hantering av mänskliga resurser",
          "RACI-matrisen kartlägger ansvar, men behöver kompletteras med knowledge management-analys",
          "Nyckelpersonsberoende är en kritisk risk som identifieras i människodimensionen",
          "Organisationens People CMM-mognad påverkar direkt förmågan att genomföra framgångsrika systembyten",
        ],
      },
      scenario: {
        id: "scenario-fb-2",
        title: "Kompetensgap inför systemupphandling",
        context:
          "En region planerar att upphandla ett nytt journalsystem. Den befintliga IT-avdelningen har 15 medarbetare, varav tre är systemspecialister på det nuvarande systemet. En förmågebedömning av människodimensionen ska genomföras.",
        steps: [
          {
            situation:
              "SFIA-kartläggningen visar att de tre systemspecialisterna har nivå 5-kompetens i det gamla systemet men bara nivå 1–2 i moderna molnbaserade plattformar. Övriga IT-medarbetare saknar helt erfarenhet av det nya teknikområdet. Dessutom upptäcker ni att en av de tre specialisterna planerar att gå i pension om 18 månader.",
            question:
              "Hur bör ni hantera detta kompetensgap i upphandlingsplaneringen?",
            choices: [
              {
                id: "1a",
                text: "Vi ställer krav i upphandlingen att leverantören ska ansvara för all drift och förvaltning — vi behöver inte intern kompetens.",
                isOptimal: false,
                feedback:
                  "Att helt outsourca drift och förvaltning kan verka enkelt men skapar ett starkt leverantörsberoende och minskar organisationens egen förmåga. People CMM betonar vikten av att bygga intern kapacitet. Organisationen behöver tillräcklig beställarkompetens för att styra leverantören.",
              },
              {
                id: "1b",
                text: "Vi inkluderar kompetensutvecklingsplan i upphandlingen: krav på utbildning, kunskapsöverföring och successiv övergång med parallell drift.",
                isOptimal: true,
                feedback:
                  "Korrekt. Genom att koppla upphandlingen till en kompetensutvecklingsplan adresseras det verkliga gapet. Krav på leverantörens utbildningsinsats, certifieringsprogram och kunskapsöverföring under avtalstiden säkerställer att organisationen bygger egen kapacitet, i linje med People CMM:s principer.",
              },
              {
                id: "1c",
                text: "Vi rekryterar nya medarbetare med rätt kompetens innan upphandlingen och ersätter befintlig personal.",
                isOptimal: false,
                feedback:
                  "Att ersätta befintlig personal är kostsamt och riskabelt. De tre specialisterna besitter värdefull verksamhetskunskap som inte enkelt kan ersättas. SFIA-ramverket visar att kompetensutveckling ofta är mer effektivt än rekrytering när medarbetarna har hög grundkompetens.",
              },
            ],
          },
          {
            situation:
              "Ni beslutar att inkludera kompetensutveckling i upphandlingen. Nu ska ni bedöma vilken kunskapsspridning som behövs. Kartläggningen visar att den pensionsnära specialisten är den enda som förstår integrationerna mellan journalsystemet och ekonomisystemet.",
            question:
              "Hur hanterar ni detta nyckelpersonsberoende?",
            choices: [
              {
                id: "2a",
                text: "Vi dokumenterar specialistens kunskap genom strukturerade kunskapsöverföringsessioner och ser till att minst två andra medarbetare får samma kompetens före pensionen.",
                isOptimal: true,
                feedback:
                  "Korrekt. Att identifiera och hantera nyckelpersonsberoende är en kärnaktivitet i förmågebedömningens människodimension. ISO 30401 betonar vikten av att fånga tyst kunskap (tacit knowledge) genom strukturerad kunskapsöverföring innan den försvinner ur organisationen.",
              },
              {
                id: "2b",
                text: "Vi skjuter upp upphandlingen tills specialisten har gått i pension — då kan vi börja med rent bord.",
                isOptimal: false,
                feedback:
                  "Att vänta innebär att kritisk kunskap om integrationerna försvinner med specialisten. Det gör upphandlingen och implementeringen avsevärt mer riskfylld och kostsam. Kunskapsöverföring bör ske proaktivt, inte reaktivt.",
              },
              {
                id: "2c",
                text: "Vi löser det i upphandlingen genom att kräva att leverantören kartlägger alla integrationer.",
                isOptimal: false,
                feedback:
                  "Att lägga hela ansvaret på leverantören utan att tillvarata intern kunskap är riskabelt. Leverantören saknar kontext om verksamhetens behov och beroenden. Kunskapsöverföring internt är nödvändig oavsett leverantörens insats.",
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
            "Som beställare ansvarar du för att säkerställa att organisationens kompetens räcker för att tillgodogöra sig en ny lösning. Det spelar ingen roll hur bra ett system är om medarbetarna inte kan använda det. SFIA-kartläggningen ger dig ett faktabaserat underlag för att argumentera för kompetensinvesteringar parallellt med systemupphandlingen.",
          keyActions: [
            "Initiera SFIA-kartläggning av berörda roller innan upphandling",
            "Inkludera kompetensutvecklingskostnader i det totala business caset",
            "Kräva att leverantörer presenterar utbildningsplan och certifieringsprogram",
            "Säkerställa att nyckelpersonsberoenden identifieras och hanteras innan systembyte",
          ],
          pitfalls: [
            "Att underskatta utbildningsbehovet och bara budgetera för systemlicenser",
            "Att anta att medarbetarna 'lär sig av sig själva' med det nya systemet",
            "Att inte involvera HR i förmågebedömningen av människodimensionen",
            "Att missa att kompetensgap kan kräva längre implementeringstid",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du kunna utforma krav som adresserar kompetensgap — inte bara tekniska krav. Det kan innebära krav på utbildningstjänster, mentorprogram, certifieringar och kunskapsöverföring som del av leveransen. SFIA:s kompetensnivåer kan användas som referens i kravspecifikationen för att definiera vilken kompetensnivå som ska uppnås efter genomförd utbildning.",
          keyActions: [
            "Formulera krav på leverantörens utbildningsinsats med mätbara mål (exempelvis SFIA-nivåer)",
            "Inkludera kunskapsöverföring som utvärderingsbart tilldelningskriterium",
            "Ställa krav på dokumentation som möjliggör kunskapsspridning",
            "Utvärdera leverantörens track record inom kompetensutveckling och change management",
          ],
          pitfalls: [
            "Att skriva krav som bara handlar om systemets funktioner utan att beakta användarnas kompetens",
            "Att inte ställa krav på utbildningsspråk — utbildning på engelska kan begränsa effekten",
            "Att underlåta att knyta utbildningskvalitet till kontraktsvillkor och vitesklausuler",
            "Att anta att e-learning räcker för komplex kompetensutveckling",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare behöver du bedöma om din organisation har den tekniska kompetens som krävs för att förvalta ett nytt system på lång sikt. People CMM hjälper dig att förstå var organisationen befinner sig i sin mognad att hantera mänskliga resurser inom IT-förvaltning, och SFIA ger dig ett konkret verktyg för att kartlägga kompetensprofiler.",
          keyActions: [
            "Kartlägga befintlig IT-kompetens med SFIA som ramverk",
            "Identifiera nyckelpersonsberoenden i systemförvaltningen",
            "Planera för kunskapsöverföring vid systemövergång",
            "Definiera vilka kompetensroller som behövs för det nya systemets förvaltning",
          ],
          pitfalls: [
            "Att överskatta organisationens förmåga att hantera ny teknik utan utbildning",
            "Att inte planera för den kompetenslucka som uppstår under övergångsperioden",
            "Att förlita sig på konsulter utan plan för kunskapsöverföring till intern personal",
            "Att missa att kartlägga 'tyst kunskap' som inte finns dokumenterad",
          ],
        },
      ],
      reflection: {
        question:
          "Finns det nyckelpersonsberoenden i din verksamhet som utgör en risk — och hur väl fångas medarbetarnas kompetens upp med stöd av strukturerade ramverk som SFIA?",
      },
      quiz: {
        questions: [
          {
            id: "q2-1",
            question:
              "Hur många kompetensnivåer definierar SFIA-ramverket?",
            options: [
              { id: "a", text: "Tre nivåer", isCorrect: false },
              { id: "b", text: "Fem nivåer", isCorrect: false },
              { id: "c", text: "Sju nivåer", isCorrect: true },
              { id: "d", text: "Tio nivåer", isCorrect: false },
            ],
            explanation:
              "SFIA (Skills Framework for the Information Age) definierar sju kompetensnivåer, från nivå 1 (Follow) till nivå 7 (Set strategy, inspire, mobilise). Varje nivå beskriver ökande grad av autonomi, inflytande, komplexitet och affärskunskap.",
          },
          {
            id: "q2-2",
            question:
              "Vilken mognadsnivå i CMMI People CMM innebär att organisationen har definierade kompetensramverk och karriärvägar?",
            options: [
              { id: "a", text: "Nivå 1 — Initial", isCorrect: false },
              { id: "b", text: "Nivå 2 — Managed", isCorrect: false },
              { id: "c", text: "Nivå 3 — Defined", isCorrect: true },
              { id: "d", text: "Nivå 4 — Predictable", isCorrect: false },
            ],
            explanation:
              "Nivå 3 (Defined) i People CMM innebär att organisationen har etablerat definierade kompetensramverk, karriärvägar och standardiserade processer för kompetensutveckling. Detta är en förutsättning för att systematiskt kunna hantera kompetensgap.",
          },
          {
            id: "q2-3",
            question:
              "Varför är nyckelpersonsberoende särskilt riskabelt i samband med systemupphandling?",
            options: [
              {
                id: "a",
                text: "Det ökar kostnaden för systemlicenserna",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Det innebär att kritisk kunskap om befintliga system och integrationer kan gå förlorad under övergången",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Det strider mot LOU:s krav på mångfald bland anbudsgivare",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Det gör att upphandlingen måste annonseras i TED-databasen",
                isCorrect: false,
              },
            ],
            explanation:
              "Nyckelpersonsberoende innebär att kritisk kunskap om befintliga system, integrationer och verksamhetsprocesser är koncentrerad till enskilda individer. Vid systemövergång riskerar denna kunskap att gå förlorad om kunskapsöverföring inte sker strukturerat.",
          },
          {
            id: "q2-4",
            question: "Vad står RACI för?",
            options: [
              {
                id: "a",
                text: "Risk, Analysis, Control, Implementation",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Responsible, Accountable, Consulted, Informed",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Requirements, Architecture, Compliance, Integration",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Review, Approve, Certify, Inspect",
                isCorrect: false,
              },
            ],
            explanation:
              "RACI står för Responsible (utför arbetet), Accountable (ytterst ansvarig), Consulted (konsulteras innan beslut) och Informed (informeras om beslut). Det är ett verktyg för att tydliggöra roller och ansvarsfördelning i organisationer och projekt.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 3 — Dimensionen Teknik                                      */
    /* ================================================================== */
    {
      id: "formagabedomning-3",
      title: "Dimensionen Teknik — system, infrastruktur, integration",
      theory: {
        content: [
          "Teknikdimensionen utvärderar de system, verktyg och den infrastruktur som organisationen använder — inte som isolerade komponenter utan som ett sammanhängande IT-landskap. TOGAF:s Technology Architecture (fas D i Architecture Development Method) ger ett systematiskt ramverk för att kartlägga och analysera teknikarkitekturen. Genom att definiera en baseline-arkitektur (nuläge) och en target-arkitektur (börläge) kan organisationen identifiera teknikgap som behöver adresseras. TOGAF betonar att teknikarkitekturen alltid måste stödja affärsarkitekturen — teknik är ett medel, inte ett mål i sig.",
          "ArchiMate, som också förvaltas av The Open Group, erbjuder ett modelleringsspråk för att visuellt beskriva enterprise-arkitektur i tre lager: affärslager (Business Layer), applikationslager (Application Layer) och tekniklager (Technology Layer). Genom att använda ArchiMate kan organisationen kartlägga hur verksamhetsprocesser stöds av applikationer, som i sin tur körs på teknisk infrastruktur. Denna treskiktade modell gör det möjligt att identifiera var förmågebristerna finns: kanske stödjer applikationen verksamhetsprocessen dåligt (applikationslager), eller så är den underliggande infrastrukturen föråldrad (tekniklager), eller så matchar inte teknikens kapacitet verksamhetens behov (koppling affär-applikation).",
          "Gartners TIME-modell (Tolerate, Invest, Migrate, Eliminate) ger ett praktiskt verktyg för application portfolio management — att kategorisera varje system i IT-landskapet baserat på dess tekniska kvalitet och affärsvärde. System som 'Tolerate' fungerar tillräckligt men motiverar inte investering. 'Invest' indikerar system med högt affärsvärde som bör vidareutvecklas. 'Migrate' avser system som ska ersättas av modernare alternativ. 'Eliminate' markerar system som kan avvecklas utan negativ påverkan. I upphandlingskontext hjälper TIME-modellen att avgöra vilka system som faktiskt behöver upphandlas som nytt och vilka som kan fortsätta användas.",
          "Teknisk skuld (technical debt) är ett centralt begrepp vid förmågebedömning av teknikdimensionen. Det avser den ackumulerade kostnaden av genvägar, provisoriska lösningar och eftersatt underhåll i IT-landskapet. Ward Cunningham myntade metaforen från finansvärlden: precis som ekonomisk skuld genererar ränta, skapar teknisk skuld ökande kostnader för underhåll, anpassning och integration. Vid förmågebedömning bör teknisk skuld kvantifieras — inte bara i termer av teknik, utan i dess påverkan på verksamhetens förmåga att förändras. Ett system med hög teknisk skuld kan fungera driftsmässigt men vara omöjligt att integrera med nya system, vilket gör det till en flaskhals vid digital transformation.",
        ],
        keyPoints: [
          "TOGAF Technology Architecture ger ramverk för att definiera baseline och target-arkitektur",
          "ArchiMate modellerar tre lager: affär, applikation och teknik — för att identifiera var gapen finns",
          "Gartners TIME-modell kategoriserar system: Tolerate, Invest, Migrate, Eliminate",
          "Teknisk skuld måste kvantifieras utifrån dess påverkan på verksamhetens förändringsförmåga",
          "Integrationskostnader är ofta större än själva systemkostnaden vid upphandling",
        ],
      },
      scenario: {
        id: "scenario-fb-3",
        title: "Systemlandskapet som pussel",
        context:
          "En myndighet har 47 system i sitt IT-landskap. Flera av systemen är 15–20 år gamla. Myndigheten överväger att upphandla ett nytt ärende- och dokumenthanteringssystem, men kartläggningen av integrationerna visar att det befintliga systemet har kopplingar till 12 andra system.",
        steps: [
          {
            situation:
              "ArchiMate-kartläggningen visar att det befintliga ärendehanteringssystemet har integrationer med ekonomisystemet, HR-systemet, webbportalen, tre fackverksamhetssystem och sex rapporteringsverktyg. Fem av integrationerna är punkt-till-punkt (utan mellanliggande integrationsplattform). TIME-analysen kategoriserar ärendehanteringssystemet som 'Migrate' — det har högt affärsvärde men hög teknisk skuld.",
            question:
              "Hur bör ni hantera integrationskomplexiteten i upphandlingsplaneringen?",
            choices: [
              {
                id: "1a",
                text: "Vi kräver att det nya systemet stödjer exakt samma integrationer som det gamla — allt annat vore en regression.",
                isOptimal: false,
                feedback:
                  "Att replikera befintliga integrationer punkt-för-punkt konserverar den tekniska skulden. ArchiMate-analysen bör istället användas för att definiera vilka integrationer som faktiskt behövs och vilka som kan ersättas med moderna integrationsarkitekturer (API-baserade, ESB eller iPaaS).",
              },
              {
                id: "1b",
                text: "Vi gör en integrationsinventering med ArchiMate, bedömer varje integration med TIME-modellen och kravställer moderna standardiserade integrationsmönster i upphandlingen.",
                isOptimal: true,
                feedback:
                  "Korrekt. Genom att analysera varje integration utifrån TIME-modellen kan ni avgöra vilka som ska behållas, moderniseras eller avvecklas. Kravspecifikationen bör definiera standardiserade API:er och integrationsmönster snarare än specifika punkt-till-punkt-kopplingar.",
              },
              {
                id: "1c",
                text: "Vi upphandlar ett system utan integrationer och låter användarna kopiera data manuellt mellan systemen.",
                isOptimal: false,
                feedback:
                  "Att ta bort integrationer skapar manuella arbetsmoment som ökar risken för fel och minskar effektiviteten. ArchiMate-modellen visar att integrationerna finns av en anledning — de stödjer kritiska affärsprocesser.",
              },
            ],
          },
          {
            situation:
              "Under förmågebedömningen av teknikdimensionen upptäcker ni att tre av de sex rapporteringsverktygen producerar samma rapporter med delvis olika data. TIME-analysen kategoriserar dem alla som 'Eliminate'. Dessutom visar kartläggningen att den tekniska skulden i form av odokumenterade integrationer uppgår till uppskattningsvis 2 000 konsulttimmar att kartlägga fullständigt.",
            question:
              "Hur påverkar detta upphandlingsstrategin?",
            choices: [
              {
                id: "2a",
                text: "Vi ignorerar rapporteringsverktygen — de är utanför scope för ärendehanteringsupphandlingen.",
                isOptimal: false,
                feedback:
                  "Att ignorera kringliggande system som har integrationer med det system som ska upphandlas riskerar att skapa nya problem. TOGAF betonar att arkitekturbeslut ska fattas med hela landskapet i beaktande.",
              },
              {
                id: "2b",
                text: "Vi inkluderar rapporteringskonsolidering i upphandlingen och budgeterar för integrationskartläggning som en del av implementeringen.",
                isOptimal: true,
                feedback:
                  "Korrekt. Genom att ta ett helhetsgrepp — konsolidera redundanta system och budgetera för den verkliga integrationskostnaden — skapar ni förutsättningar för en lyckad implementering. TOGAF:s arkitekturprinciper stödjer detta helhetsbaserade angreppssätt.",
              },
              {
                id: "2c",
                text: "Vi upphandlar ärendehanteringssystemet först och hanterar rapporteringsverktygen i en separat upphandling senare.",
                isOptimal: false,
                feedback:
                  "Att separera upphandlingarna utan att beakta deras inbördes beroenden riskerar suboptimering. Den nya ärendehanteringslösningen kan behöva integreras med rapporteringsverktyg som sedan ska avvecklas.",
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
            "Som beställare behöver du förstå det tekniska landskapet tillräckligt väl för att fatta informerade beslut om vad som ska upphandlas. Du behöver inte vara teknisk expert, men du måste kunna tolka ArchiMate-modeller och TIME-analyser för att prioritera investeringar baserat på affärsvärde och verksamhetsnytta.",
          keyActions: [
            "Begära en ArchiMate-kartläggning av berörda system innan upphandling",
            "Använda TIME-modellen för att prioritera vilka system som ska ersättas, utvecklas eller avvecklas",
            "Inkludera integrationskostnader och teknisk skuld i det totala business caset",
            "Säkerställa att teknikdimensionens bedömning kopplas till verksamhetens behov och mål",
          ],
          pitfalls: [
            "Att underbudgetera integrationskostnader — de överstiger ofta själva systemkostnaden",
            "Att lita enbart på leverantörers påståenden om enkel integration utan egen kartläggning",
            "Att inte beakta teknisk skuld i befintliga system som påverkar det nya systemet",
            "Att fokusera på funktioner i det nya systemet utan att förstå hela systemlandskapet",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du kunna omsätta den tekniska förmågebedömningen till upphandlingsbara krav. TOGAF:s arkitekturprinciper och ArchiMate-modellerna ger dig underlag för att specificera integrationskrav, arkitekturkrav och migreringsplaner i kravspecifikationen utan att vara för leverantörsbegränsande.",
          keyActions: [
            "Formulera krav på öppna standarder och API:er istället för specifika tekniska lösningar",
            "Inkludera krav på migrering av data och integrationer i kravspecifikationen",
            "Ställa krav på leverantörens förmåga att hantera teknisk skuld under implementeringen",
            "Utvärdera leverantörers arkitekturförslag med stöd av ArchiMate och TOGAF-principer",
          ],
          pitfalls: [
            "Att skriva tekniska krav som bara en specifik produkt uppfyller (diskriminerande krav)",
            "Att inte kravställa exit-strategi och dataportabilitet",
            "Att missa integrationsaspekten och bara fokusera på systemets kärnfunktionalitet",
            "Att inte inkludera krav på dokumentation av den nya arkitekturen",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare äger du den tekniska förmågebedömningen. Du ansvarar för att kartlägga befintliga systems förmågor, integrationer, teknisk skuld och livscykelstatus. ArchiMate och TOGAF ger dig verktygen att kommunicera det tekniska landskapet på ett sätt som beslutsfattare kan förstå och agera på.",
          keyActions: [
            "Upprätta och underhålla ArchiMate-modeller av IT-landskapet",
            "Genomföra TIME-klassificering av alla system i portföljen",
            "Kvantifiera teknisk skuld i termer av risk, kostnad och verksamhetspåverkan",
            "Definiera target-arkitekturen enligt TOGAF:s ADM fas D (Technology Architecture)",
          ],
          pitfalls: [
            "Att underskatta integrationsberoendens komplexitet — 'det är bara en fil-överföring'",
            "Att inte dokumentera odokumenterade integrationer innan upphandling",
            "Att presentera teknikproblem i för tekniskt språk som beslutsfattare inte förstår",
            "Att inte beakta den tekniska skuldens påverkan på implementeringstid och -kostnad",
          ],
        },
      ],
      reflection: {
        question:
          "Hur väl känner du till integrationerna mellan era system — finns det en aktuell ArchiMate-modell eller systemkarta, och hur skulle ni kategorisera era system enligt TIME-modellen?",
      },
      quiz: {
        questions: [
          {
            id: "q3-1",
            question:
              "Vilka tre lager definierar ArchiMate för enterprise-arkitektur?",
            options: [
              {
                id: "a",
                text: "Strategi, Taktik och Operation",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Affärslager, Applikationslager och Tekniklager",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Frontend, Backend och Databas",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Input, Process och Output",
                isCorrect: false,
              },
            ],
            explanation:
              "ArchiMate definierar tre lager: Business Layer (affärslager), Application Layer (applikationslager) och Technology Layer (tekniklager). Dessa tre lager visar hur verksamhetsprocesser stöds av applikationer, som i sin tur körs på teknisk infrastruktur.",
          },
          {
            id: "q3-2",
            question:
              "Vad står TIME i Gartners TIME-modell för application portfolio management?",
            options: [
              {
                id: "a",
                text: "Test, Implement, Maintain, Evaluate",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Tolerate, Invest, Migrate, Eliminate",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Track, Inspect, Monitor, Execute",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Transform, Integrate, Modernize, Extend",
                isCorrect: false,
              },
            ],
            explanation:
              "Gartners TIME-modell kategoriserar system som Tolerate (tolerera — fungerar tillräckligt), Invest (investera — högt affärsvärde), Migrate (migrera — byt till modern lösning) och Eliminate (eliminera — kan avvecklas).",
          },
          {
            id: "q3-3",
            question:
              "Varför är teknisk skuld relevant vid förmågebedömning av teknikdimensionen?",
            options: [
              {
                id: "a",
                text: "Den påverkar leverantörens prissättning av licenser",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Den minskar organisationens förmåga att integrera och förändra, vilket påverkar upphandlingens framgång",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Den avgör vilken upphandlingsform som ska användas enligt LOU",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Den är bara relevant för privata företag, inte offentlig sektor",
                isCorrect: false,
              },
            ],
            explanation:
              "Teknisk skuld minskar organisationens förmåga att förändras och integreras med nya system. Den ackumulerade kostnaden av genvägar och eftersatt underhåll gör det dyrare och riskablare att implementera nya lösningar.",
          },
          {
            id: "q3-4",
            question:
              "Vilken fas i TOGAF:s ADM fokuserar specifikt på teknikarkitekturen?",
            options: [
              {
                id: "a",
                text: "Fas A — Architecture Vision",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Fas B — Business Architecture",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Fas C — Information Systems Architecture",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Fas D — Technology Architecture",
                isCorrect: true,
              },
            ],
            explanation:
              "Fas D i TOGAF:s Architecture Development Method (ADM) fokuserar på Technology Architecture. I denna fas definieras den tekniska infrastrukturen som behövs för att stödja affärs- och informationssystemarkitekturen.",
          },
          {
            id: "q3-5",
            question:
              "Vilket av följande är det bästa tillvägagångssättet för att hantera integrationer vid systemupphandling?",
            options: [
              {
                id: "a",
                text: "Replikera alla befintliga punkt-till-punkt-integrationer i det nya systemet",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Ta bort alla integrationer och låta användarna manuellt överföra data",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Inventera och bedöma varje integration, kravställ moderna standardiserade integrationsmönster",
                isCorrect: true,
              },
              {
                id: "d",
                text: "Låta leverantören bestämma vilka integrationer som ska finnas",
                isCorrect: false,
              },
            ],
            explanation:
              "Det bästa tillvägagångssättet är att inventera och bedöma varje integration utifrån affärsvärde och teknisk kvalitet (exempelvis med TIME-modellen), och sedan kravställa moderna standardiserade integrationsmönster (API:er, ESB) istället för att konservera gammal teknikskuld.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 4 — Dimensionen Process                                     */
    /* ================================================================== */
    {
      id: "formagabedomning-4",
      title: "Dimensionen Process — arbetssätt, flöden, effektivitet",
      theory: {
        content: [
          "Processdimensionen handlar om hur arbetet faktiskt utförs: vilka steg ingår, vem gör vad, var uppstår flaskhalsar och var finns onödiga manuella moment? CMMI (Capability Maturity Model Integration) erbjuder ett av de mest etablerade ramverken för processmognadsbedömning med fem nivåer: Initial (nivå 1) — processer är oförutsägbara och reaktiva; Managed (nivå 2) — processer är planerade och övervakade på projektnivå; Defined (nivå 3) — processer är standardiserade och proaktiva; Quantitatively Managed (nivå 4) — processer mäts och styrs med kvantitativa metoder; Optimizing (nivå 5) — processer förbättras kontinuerligt baserat på data. I upphandlingskontext ger CMMI-nivån en indikation på organisationens förmåga att framgångsrikt genomföra ett systemimplementeringsprojekt.",
          "ISO 15504, även känd som SPICE (Software Process Improvement and Capability Determination), kompletterar CMMI med en internationell standard för processbedömning. SPICE definierar sex kapabilitetsnivåer (0–5) och ger ett strukturerat tillvägagångssätt för att bedöma processer inom IT. Till skillnad från CMMI, som primärt bedömer organisationens övergripande mognad, möjliggör SPICE bedömning av enskilda processer. Detta gör SPICE särskilt användbart i förmågebedömningar inför upphandling: man kan identifiera att exempelvis ärendehanteringsprocessen befinner sig på nivå 2 medan fakturaprocessen redan nått nivå 4, och prioritera förbättringsinsatser därefter.",
          "BiSL (Business Information Services Library) erbjuder ett processramverk som specifikt adresserar gränssnittet mellan verksamhet och IT — det så kallade informationsförvaltningsdomänet. BiSL definierar processer på tre nivåer: operationell (daglig drift av informationsförsörjningen), taktisk (styrning och planering) och strategisk (långsiktig riktning). I upphandlingssammanhang är BiSL:s taktiska processer särskilt relevanta, eftersom de omfattar behovshantering, kravformulering och leverantörsstyrning. En organisation som saknar mogna BiSL-processer riskerar att ställa fel krav och brista i leverantörsstyrning efter att kontraktet har tecknats.",
          "Lean Six Sigma erbjuder metoder för processoptimering som kompletterar mognadsbedömningen. Innan man upphandlar ett nytt system bör man analysera de processer som systemet ska stödja: innehåller de onödiga steg (waste i Lean-terminologi)? Finns det variationer i hur processen utförs som skapar kvalitetsproblem (variation i Six Sigma-terminologi)? Verktyg som värdeflödeskartläggning (Value Stream Mapping) och rotorsaksanalys (Root Cause Analysis med 5 Why's) hjälper till att identifiera om problemet ligger i processen snarare än i systemet. Att digitalisera en dålig process resulterar bara i en dålig digital process — och det är inte ett bra underlag för upphandling.",
        ],
        keyPoints: [
          "CMMI definierar fem processmognadsnivåer: Initial, Managed, Defined, Quantitatively Managed, Optimizing",
          "ISO 15504/SPICE möjliggör bedömning av enskilda processer på sex kapabilitetsnivåer",
          "BiSL adresserar gränssnittet verksamhet-IT med processer på operationell, taktisk och strategisk nivå",
          "Lean Six Sigma-verktyg identifierar waste och variation i processer innan digitalisering",
          "Att digitalisera en dålig process ger bara en dålig digital process — analysera först, upphandla sedan",
        ],
      },
      scenario: {
        id: "scenario-fb-4",
        title: "Processen eller systemet — vad ska fixas?",
        context:
          "En kommun ska upphandla ett nytt bygglovshanteringssystem. Handläggningstiderna har ökat med 40 procent de senaste tre åren. Politikerna kräver att den nya lösningen halverar handläggningstiderna. En förmågebedömning av processdimensionen genomförs.",
        steps: [
          {
            situation:
              "Processkartläggningen visar att en bygglovsansökan passerar genom 14 steg och involverar 6 olika roller. Tre av stegen är rent administrativa (stämpling, registrering, arkivering) som inte tillför värde. Två steg innebär väntetid på i genomsnitt 8 dagar vardera medan handläggaren väntar på kompletteringar. CMMI-bedömningen placerar bygglovsprocessen på nivå 2 (Managed) — processen finns dokumenterad men följs inte konsekvent av alla handläggare.",
            question:
              "Hur bör detta påverka upphandlingsstrategin?",
            choices: [
              {
                id: "1a",
                text: "Vi specificerar i kravspecifikationen att det nya systemet ska automatisera alla 14 steg i processen.",
                isOptimal: false,
                feedback:
                  "Att automatisera en ineffektiv process konserverar problemen. Lean Six Sigma-principen 'Eliminate before Automate' innebär att onödiga steg ska tas bort innan digitalisering. De tre administrativa stegen och väntetiderna bör adresseras genom processförbättring.",
              },
              {
                id: "1b",
                text: "Vi genomför processförbättring med Lean-metodik först — eliminerar onödiga steg och minskar väntetider — och anpassar sedan kravspecifikationen till den optimerade processen.",
                isOptimal: true,
                feedback:
                  "Korrekt. Genom att först optimera processen med Lean Six Sigma-verktyg (eliminera waste, minska variation, reducera väntetider) och sedan kravställa systemstöd för den förbättrade processen, maximerar ni nyttan av upphandlingen. ISO 15504 kan sedan användas för att mäta processförbättringen.",
              },
              {
                id: "1c",
                text: "Vi ber leverantörerna i upphandlingen att föreslå en optimerad process — de har erfarenhet från andra kommuner.",
                isOptimal: false,
                feedback:
                  "Att överlåta processdesignen helt till leverantörer riskerar att man tappar kontrollen över sin egen verksamhet. BiSL betonar att behovshantering och processdesign är verksamhetens ansvar, inte leverantörens. Leverantörsinput är värdefullt men ska komplettera, inte ersätta, egen analys.",
              },
            ],
          },
          {
            situation:
              "Efter processförbättring har ni minskat antalet steg från 14 till 9 och infört automatiska kompletteringsförfrågningar som minskar väntetiden. Nu ska kravspecifikationen för det nya systemet skrivas. BiSL-analysen visar att kommunen saknar taktiska processer för leverantörsstyrning och avtalsuppföljning.",
            question:
              "Hur hanterar ni bristen i leverantörsstyrning?",
            choices: [
              {
                id: "2a",
                text: "Vi etablerar en BiSL-baserad förvaltningsorganisation med tydliga processer för leverantörsstyrning innan avtalet tecknas.",
                isOptimal: true,
                feedback:
                  "Korrekt. Att etablera förvaltningsprocesser innan kontraktet tecknas säkerställer att organisationen kan styra och följa upp leverantören effektivt. BiSL:s taktiska processer för leverantörsstyrning, avtalshantering och serviceplanering ger strukturen som behövs.",
              },
              {
                id: "2b",
                text: "Vi litar på att leverantören sköter sig — vi väljer ju den bästa anbudsgivaren.",
                isOptimal: false,
                feedback:
                  "Att inte ha processer för leverantörsstyrning är ett vanligt skäl till att systemavtal inte levererar förväntat värde. BiSL betonar att leverantörsstyrning kräver aktiva processer på verksamhetssidan — det kan inte överlåtas till leverantören.",
              },
              {
                id: "2c",
                text: "Vi inkluderar en klausul i avtalet om att leverantören ska rapportera regelbundet — det räcker.",
                isOptimal: false,
                feedback:
                  "Avtalsklausuler om rapportering är nödvändiga men inte tillräckliga. Utan etablerade processer för att analysera rapporterna, agera på avvikelser och styra förbättringsarbetet blir rapporterna bara pappersexercis.",
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
            "Som beställare äger du de verksamhetsprocesser som det nya systemet ska stödja. Du ansvarar för att processerna är analyserade och optimerade innan systemkrav formuleras. CMMI och ISO 15504 ger dig verktyg för att bedöma och kommunicera processmognaden till beslutsfattare, medan Lean Six Sigma ger dig metoder för att identifiera och eliminera slöseri i processerna.",
          keyActions: [
            "Genomföra processkartläggning med värdeflödeskartläggning (Value Stream Mapping) innan kravspecifikation",
            "Bedöma processmognad med CMMI eller ISO 15504/SPICE som referens",
            "Eliminera onödiga steg och minska väntetider med Lean-metodik innan digitalisering",
            "Etablera BiSL-baserade förvaltningsprocesser för leverantörsstyrning",
          ],
          pitfalls: [
            "Att digitalisera en dålig process utan att först optimera den",
            "Att inte involvera medarbetarna som utför processerna i kartläggningen",
            "Att missa att processmognad (CMMI-nivå) påverkar förmågan att implementera nytt system",
            "Att tro att systemet automatiskt löser processproblem",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du förstå processdimensionens resultat för att kunna utforma upphandlingen rätt. Om processerna inte är mogna (CMMI nivå 1–2) bör upphandlingen inkludera krav på processimplementeringsstöd, inte bara systemleverans. BiSL:s processer hjälper dig att formulera krav på leverantörens åtagande kring förvaltning och support.",
          keyActions: [
            "Formulera krav som speglar den optimerade processen, inte den gamla",
            "Inkludera processimplementeringsstöd som krav om organisationens processmognad är låg",
            "Ställa krav på leverantörens förmåga att konfigrera systemet efter verksamhetens processer",
            "Utvärdera leverantörens referenscase med avseende på processförbättring, inte bara systemleverans",
          ],
          pitfalls: [
            "Att kravställa det gamla arbetssättet digitaliserat i det nya systemet",
            "Att inte beakta organisationens processmognad i implementeringsplanen",
            "Att missa att ställa krav på processanpassning av systemet (konfiguration snarare än anpassad utveckling)",
            "Att inte ha med processrelaterade utvärderingskriterier i tilldelningsbeslut",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare ansvarar du för att systemet stödjer verksamhetens processer effektivt. Du behöver förstå BiSL:s operationella och taktiska processer för att säkerställa att systemförvaltningen fungerar efter driftsättning. Du bidrar dessutom med insikt om hur befintliga systems processstöd fungerar och var gapen finns.",
          keyActions: [
            "Dokumentera hur befintliga system stödjer (eller inte stödjer) verksamhetsprocesserna",
            "Bidra med krav på systemets konfigurerbarhet för att stödja processförändringar",
            "Planera för processpecifik konfiguration och testning i implementeringsfasen",
            "Etablera operationella BiSL-processer för incident- och ändringshantering",
          ],
          pitfalls: [
            "Att fokusera på systemets funktioner utan att förstå vilka processer de ska stödja",
            "Att inte testa processer end-to-end i systemet innan driftsättning",
            "Att missa att processer kan behöva anpassas till systemets styrkor istället för tvärtom",
            "Att inte ha en plan för processpecifik change management vid övergång",
          ],
        },
      ],
      reflection: {
        question:
          "Välj en nyckelprocess i din verksamhet — på vilken CMMI-mognadsnivå befinner sig processen, och vilka Lean-slöserier kan du identifiera?",
      },
      quiz: {
        questions: [
          {
            id: "q4-1",
            question:
              "Vilken CMMI-mognadsnivå innebär att processer är standardiserade och proaktiva i hela organisationen?",
            options: [
              { id: "a", text: "Nivå 1 — Initial", isCorrect: false },
              { id: "b", text: "Nivå 2 — Managed", isCorrect: false },
              { id: "c", text: "Nivå 3 — Defined", isCorrect: true },
              { id: "d", text: "Nivå 4 — Quantitatively Managed", isCorrect: false },
            ],
            explanation:
              "Nivå 3 (Defined) i CMMI innebär att processer är standardiserade och proaktiva i hela organisationen. Till skillnad från nivå 2, där processerna finns på projektnivå, är de på nivå 3 integrerade i en organisationsövergripande standard.",
          },
          {
            id: "q4-2",
            question:
              "Vad skiljer ISO 15504/SPICE från CMMI vid processbedömning?",
            options: [
              {
                id: "a",
                text: "SPICE bedömer bara IT-processer, CMMI bedömer alla processer",
                isCorrect: false,
              },
              {
                id: "b",
                text: "SPICE möjliggör bedömning av enskilda processer, medan CMMI primärt bedömer organisationens övergripande mognad",
                isCorrect: true,
              },
              {
                id: "c",
                text: "SPICE är gratis att använda, CMMI kräver licens",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Det finns ingen skillnad — de är samma standard",
                isCorrect: false,
              },
            ],
            explanation:
              "ISO 15504/SPICE möjliggör bedömning av enskilda processer på sex kapabilitetsnivåer (0–5), medan CMMI primärt bedömer organisationens övergripande mognad. Detta gör SPICE mer flexibelt för punktvisa bedömningar.",
          },
          {
            id: "q4-3",
            question:
              "Vilken Lean Six Sigma-princip är mest relevant vid processanalys inför systemupphandling?",
            options: [
              {
                id: "a",
                text: "Just-in-time delivery av IT-hårdvara",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Eliminera onödiga steg (waste) i processen innan digitalisering",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Minska antalet leverantörer till en enda",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Maximera antalet automatiserade steg oavsett processdesign",
                isCorrect: false,
              },
            ],
            explanation:
              "Lean-principen att eliminera waste (muda) innebär att onödiga steg ska tas bort innan man digitaliserar. 'Eliminate before Automate' — att automatisera en dålig process ger bara en snabbare dålig process.",
          },
          {
            id: "q4-4",
            question:
              "Vilken del av BiSL-ramverket är särskilt relevant för upphandlingskontext?",
            options: [
              {
                id: "a",
                text: "De operationella processerna för daglig IT-drift",
                isCorrect: false,
              },
              {
                id: "b",
                text: "De taktiska processerna för behovshantering, kravformulering och leverantörsstyrning",
                isCorrect: true,
              },
              {
                id: "c",
                text: "De strategiska processerna för IT-budgetering",
                isCorrect: false,
              },
              {
                id: "d",
                text: "BiSL har ingen relevans för upphandling",
                isCorrect: false,
              },
            ],
            explanation:
              "BiSL:s taktiska processer är särskilt relevanta i upphandlingskontext, eftersom de omfattar behovshantering (förstå och specificera behov), kravformulering (omsätta behov till krav) och leverantörsstyrning (styra och följa upp leverantörsavtal).",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 5 — Gap-analys och handlingsplan                            */
    /* ================================================================== */
    {
      id: "formagabedomning-5",
      title: "Gap-analys och handlingsplan",
      theory: {
        content: [
          "Gap-analys jämför nuvarande förmåga (nuläge/baseline) med önskad förmåga (börläge/target) och identifierar gapen som behöver adresseras. TOGAF:s Architecture Development Method (ADM) formaliserar detta i fas E (Opportunities and Solutions) och fas F (Migration Planning), där identifierade gap prioriteras och omsätts till genomförbara insatser. TOGAF-gap-analysen struktureras som en matris där baseline-arkitekturens komponenter jämförs med target-arkitekturens komponenter för att identifiera tre kategorier: komponenter som behålls (carried over), komponenter som är nya (new) och komponenter som ska avvecklas (removed). Denna systematik gäller för alla tre dimensionerna — människa, teknik och process.",
          "Capability heat maps är ett visuellt verktyg som TOGAF rekommenderar för att kommunicera förmågebedömningens resultat till beslutsfattare och intressenter. En capability heat map visar organisationens förmågor i ett rutnät där färgkodning indikerar mognadsnivå eller gapets storlek: grönt för god förmåga, gult för acceptabel men förbättringsbar, rött för kritiska gap. Heat maps gör det möjligt att snabbt identifiera vilka förmågor som kräver omedelbar uppmärksamhet och kommunicera detta till personer utan teknisk bakgrund. I upphandlingskontext kan heat maps visa var upphandling behövs (röda teknikförmågor), var kompetensutveckling behövs (röda mänskoförmågor) och var processförbättring krävs (röda processförmågor).",
          "Roadmap planning — att planera förmågeutvecklingen över tid — är avgörande för att gap-analysen ska leda till konkret handling. TOGAF:s Implementation and Migration Planning (ADM fas F) ger en struktur för att definiera arbetspaket, beroenden och tidslinjer. En capability roadmap visar vilka förmågor som utvecklas när, i vilken ordning och med vilka beroenden. Detta är särskilt viktigt i upphandlingskontext: kanske måste kompetensutveckling ske innan systemet upphandlas, eller så måste processförbättring genomföras parallellt med implementeringen. En vanlig fallgrop är att planera allt parallellt utan att beakta att organisationens förändringskapacitet är begränsad.",
          "Business case development kopplar förmågebedömningen till ekonomiska beslut. Varje identifierat gap behöver en bedömning av kostnaden att sluta gapet, nyttan av att sluta gapet och risken av att inte agera. COBIT:s princip om 'Realising Stakeholder Value' betonar att alla investeringar i förmågeutveckling måste kunna motiveras utifrån det värde de skapar. Ett robust business case för en capability-investering bör innehålla: en kvantifierad gap-beskrivning, alternativa lösningar (köpa, bygga, kompetensutveckla, outsourca), total ägandekostnad (TCO) per alternativ, förväntad nyttorealisering och en riskanalys. Detta underlag är avgörande för att säkerställa att rätt insatser prioriteras och att upphandlingar motiveras av verkligt affärsvärde, inte bara teknisk önskelista.",
        ],
        keyPoints: [
          "TOGAF:s gap-analys identifierar tre kategorier: behålls (carried over), nytt (new), avvecklas (removed)",
          "Capability heat maps visualiserar gapens storlek med färgkodning för effektiv kommunikation",
          "Roadmap planning med TOGAF ADM fas F definierar arbetspaket, beroenden och tidslinjer",
          "Business case kopplar gapanalys till ekonomiska beslut: kostnad, nytta och risk per alternativ",
          "Organisationens förändringskapacitet begränsar hur många gap som kan adresseras parallellt",
        ],
      },
      scenario: {
        id: "scenario-fb-5",
        title: "Från gap-analys till handlingsplan",
        context:
          "Du har genomfört en komplett förmågebedömning för en kommuns socialtjänst. Resultatet visar gap i alla tre dimensioner: Människa — handläggarna saknar digital kompetens (SFIA nivå 1–2 i digitala verktyg), Teknik — det befintliga verksamhetssystemet har hög teknisk skuld (TIME: Migrate), Process — ärendehanteringsprocessen befinner sig på CMMI nivå 1 (Initial). Politikerna vill se snabba resultat.",
        steps: [
          {
            situation:
              "Capability heat map visar rött i alla tre dimensioner. Politikerna kräver att alla gap ska adresseras inom 12 månader. Organisationens förändringskapacitet bedöms som begränsad — den har aldrig genomfört ett större förändringsprojekt tidigare.",
            question:
              "Hur bör handlingsplanen utformas?",
            choices: [
              {
                id: "1a",
                text: "Vi adresserar alla tre gap parallellt med ett stort transformationsprogram — politikerna kräver snabba resultat.",
                isOptimal: false,
                feedback:
                  "Att försöka åtgärda alla gap samtidigt i en organisation med begränsad förändringskapacitet riskerar att allt misslyckas. TOGAF:s roadmap planning betonar att beroenden och organisationens kapacitet måste beaktas. Ett stort transformationsprogram kräver hög organisatorisk mognad.",
              },
              {
                id: "1b",
                text: "Vi prioriterar baserat på beroenden: först processförbättring och kompetensutveckling, sedan systemupphandling — och kommunicerar en realistisk roadmap med milstolpar.",
                isOptimal: true,
                feedback:
                  "Korrekt. Genom att börja med process och kompetens skapar ni förutsättningarna för en lyckad systemimplementering. TOGAF:s ADM fas F betonar att migration ska ske i logisk ordning baserad på beroenden. En roadmap med tydliga milstolpar ger politikerna synliga framsteg utan att riskera helheten.",
              },
              {
                id: "1c",
                text: "Vi fokuserar enbart på systemupphandlingen — ett modernt system löser de andra problemen automatiskt.",
                isOptimal: false,
                feedback:
                  "Att tro att teknik löser kompetens- och processproblem är den vanligaste fallgropen vid IT-upphandlingar. Förmågebedömningen visar tydligt att gapen finns i alla tre dimensioner. Ett nytt system i händerna på handläggare med SFIA nivå 1 i digitala verktyg och CMMI nivå 1-processer kommer inte att leverera förväntat resultat.",
              },
            ],
          },
          {
            situation:
              "Ni har tagit fram en roadmap: Fas 1 (månad 1–4): Processförbättring med Lean-metodik och kompetensutveckling med SFIA-baserad utbildningsplan. Fas 2 (månad 5–8): Upphandling av nytt verksamhetssystem med krav baserade på den optimerade processen. Fas 3 (månad 9–18): Implementering med intensiv kompetensutveckling och parallell drift. Nu ska business caset tas fram för att motivera investeringen inför kommunstyrelsen.",
            question:
              "Vad bör business caset innehålla?",
            choices: [
              {
                id: "2a",
                text: "En detaljerad teknisk specifikation av det nya systemet och dess funktioner.",
                isOptimal: false,
                feedback:
                  "Kommunstyrelsen behöver ett affärsmässigt beslutsunderlag, inte en teknisk specifikation. COBIT:s princip om stakeholder value innebär att investeringen ska motiveras utifrån verksamhetsnytta, inte teknisk funktionalitet.",
              },
              {
                id: "2b",
                text: "Kvantifierade gap, alternativa lösningar med TCO-beräkning per alternativ, förväntad nyttorealisering (minskade handläggningstider, förbättrad rättssäkerhet) och riskanalys.",
                isOptimal: true,
                feedback:
                  "Korrekt. Ett robust business case enligt COBIT:s principer kopplar investeringen till mätbar verksamhetsnytta. Genom att presentera alternativa lösningar med TCO, kvantifierad nytta och risk ger ni kommunstyrelsen ett informerat beslutsunderlag.",
              },
              {
                id: "2c",
                text: "En jämförelse av tre leverantörers system med priser och funktioner.",
                isOptimal: false,
                feedback:
                  "En leverantörsjämförelse är inte ett business case — det är en del av upphandlingens utvärderingsfas. Business caset ska motivera varför organisationen ska investera överhuvudtaget, vilken typ av investering som behövs och vilket värde den skapar.",
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
            "Som beställare ansvarar du för att omsätta förmågebedömningens resultat till en handlingsplan med tydligt business case. Du behöver kunna kommunicera capability heat maps till beslutsfattare, prioritera gap baserat på verksamhetsnytta och ta fram en realistisk roadmap som beaktar organisationens förändringskapacitet. TOGAF:s gap-analysteknik och COBIT:s principer för nyttohantering ger dig ramverken för detta.",
          keyActions: [
            "Presentera capability heat maps för beslutsfattare som tydlig kommunikation av förmågebedömningen",
            "Prioritera gap baserat på verksamhetspåverkan, genomförbarhet och beroenden",
            "Ta fram business case med kvantifierade gap, alternativ, TCO och nyttorealisering",
            "Utforma en capability roadmap med realistiska milstolpar och hänsyn till förändringskapacitet",
          ],
          pitfalls: [
            "Att försöka åtgärda alla gap samtidigt utan hänsyn till organisationens förändringskapacitet",
            "Att sakna kvantifierad nyttorealisering i business caset — 'det blir bättre' räcker inte",
            "Att inte kommunicera beroenden mellan dimensionerna (exempelvis att kompetensutveckling måste ske innan systemimplementering)",
            "Att presentera förmågebedömningen som ett tekniskt dokument istället för ett verksamhetsstrategiskt underlag",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du förstå handlingsplanen och roadmappen för att kunna tidplanera upphandlingen rätt. Om handlingsplanen visar att processförbättring ska ske före upphandling behöver du anpassa din planering. Gap-analysens resultat ger dig dessutom underlag för att utforma upphandlingens kravspecifikation och utvärderingskriterier så att de adresserar de verkliga gapen.",
          keyActions: [
            "Anpassa upphandlingens tidplan till handlingsplanens roadmap",
            "Utforma kravspecifikation som adresserar identifierade gap i alla tre dimensioner",
            "Inkludera implementeringsstöd, kompetensutveckling och processanpassning i upphandlingens scope",
            "Säkerställa att utvärderingskriterier speglar förmågebedömningens prioriteringar",
          ],
          pitfalls: [
            "Att starta upphandling innan nödvändiga förutsättningar (processförbättring, kompetensutveckling) är på plats",
            "Att inte beakta handlingsplanens faser i implementeringskraven",
            "Att formulera krav enbart baserat på teknikgap och missa människa- och processgap",
            "Att inte upphandla förändringsinsatser (utbildning, processimplementering) som del av systemleveransen",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare bidrar du till gap-analysen med teknisk bedömning av baseline- och target-arkitekturen. Du ansvarar för att den tekniska handlingsplanen är genomförbar, att migreringsplanen är realistisk och att den tekniska roadmappen samordnas med organisationens övriga förmågeutveckling. TOGAF:s ADM fas F ger dig strukturen för migrationsplanering.",
          keyActions: [
            "Definiera teknisk baseline och target med stöd av TOGAF ADM",
            "Bidra till capability heat map med teknisk mognadsbedömning av varje system",
            "Uppskatta migrations- och integrationskostnader för business caset",
            "Samordna teknisk roadmap med kompetensutveckling och processförbättring",
          ],
          pitfalls: [
            "Att underskatta migrationskomplexiteten — historiskt underskattas den med 30–50 procent",
            "Att inte planera för parallell drift under övergångsperioden",
            "Att fokusera enbart på den tekniska roadmappen utan att samordna med människa och process",
            "Att inte definiera en tydlig exit-strategi för system som ska avvecklas",
          ],
        },
      ],
      reflection: {
        question:
          "Hur ser ditt största förmågegap ut just nu — och om du skulle rita en capability heat map för din organisation, vilka områden skulle vara röda? Vad skulle vara det första steget i din roadmap?",
      },
      quiz: {
        questions: [
          {
            id: "q5-1",
            question:
              "Vilka tre kategorier identifierar TOGAF:s gap-analysteknik?",
            options: [
              {
                id: "a",
                text: "Grön, Gul och Röd",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Carried over (behålls), New (nytt) och Removed (avvecklas)",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Must have, Should have och Nice to have",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Kortsiktig, Medellång och Långsiktig",
                isCorrect: false,
              },
            ],
            explanation:
              "TOGAF:s gap-analys identifierar tre kategorier vid jämförelse av baseline- och target-arkitektur: Carried over (komponenter som behålls), New (nya komponenter som behövs) och Removed (komponenter som ska avvecklas).",
          },
          {
            id: "q5-2",
            question:
              "Vad är en capability heat map?",
            options: [
              {
                id: "a",
                text: "Ett tekniskt verktyg för att mäta systemets processorbelastning",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Ett visuellt verktyg som med färgkodning visar organisationens förmågor och gapens storlek",
                isCorrect: true,
              },
              {
                id: "c",
                text: "En geografisk karta som visar var organisationens kontor finns",
                isCorrect: false,
              },
              {
                id: "d",
                text: "En projektplan med tidslinje och milstolpar",
                isCorrect: false,
              },
            ],
            explanation:
              "En capability heat map är ett visuellt kommunikationsverktyg som visar organisationens förmågor i ett rutnät med färgkodning (grönt = god förmåga, gult = acceptabel, rött = kritiska gap). Det gör det möjligt att snabbt kommunicera förmågeläget till beslutsfattare.",
          },
          {
            id: "q5-3",
            question:
              "Varför är det viktigt att beakta organisationens förändringskapacitet i roadmap-planeringen?",
            options: [
              {
                id: "a",
                text: "Det är ett krav enligt LOU att bedöma organisationens förändringskapacitet",
                isCorrect: false,
              },
              {
                id: "b",
                text: "En organisation som aldrig genomfört större förändringar bör inte upphandla nya system",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Att försöka genomföra fler förändringar parallellt än organisationen klarar av ökar risken att allt misslyckas",
                isCorrect: true,
              },
              {
                id: "d",
                text: "Det påverkar bara den tekniska dimensionen, inte människa och process",
                isCorrect: false,
              },
            ],
            explanation:
              "Organisationens förändringskapacitet begränsar hur många gap som kan adresseras parallellt. Att försöka genomföra för många förändringar samtidigt — nytt system, processförbättring och kompetensutveckling — i en organisation med låg förändringsmognad ökar risken att samtliga insatser misslyckas.",
          },
          {
            id: "q5-4",
            question:
              "Vad bör ett robust business case för en förmågeinvestering innehålla enligt COBIT:s principer?",
            options: [
              {
                id: "a",
                text: "Enbart en kostnadskalkyl för systemlicenser och implementering",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Kvantifierade gap, alternativa lösningar med TCO, förväntad nyttorealisering och riskanalys",
                isCorrect: true,
              },
              {
                id: "c",
                text: "En jämförelse av tre leverantörers produkter",
                isCorrect: false,
              },
              {
                id: "d",
                text: "En teknisk specifikation av det nya systemet",
                isCorrect: false,
              },
            ],
            explanation:
              "Enligt COBIT:s princip om stakeholder value ska ett business case innehålla kvantifierade gap, alternativa lösningar (med total ägandekostnad per alternativ), förväntad nyttorealisering och en riskanalys som visar konsekvenserna av att inte agera.",
          },
          {
            id: "q5-5",
            question:
              "I vilken ordning bör en organisation med CMMI nivå 1-processer och låg digital kompetens prioritera sina insatser?",
            options: [
              {
                id: "a",
                text: "Systemupphandling först — teknik löser övriga problem",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Allt parallellt — det sparar tid",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Processförbättring och kompetensutveckling först, sedan systemupphandling",
                isCorrect: true,
              },
              {
                id: "d",
                text: "Ordningen spelar ingen roll om budget finns",
                isCorrect: false,
              },
            ],
            explanation:
              "Med CMMI nivå 1-processer och låg digital kompetens saknar organisationen förutsättningarna att framgångsrikt implementera ett nytt system. Processförbättring och kompetensutveckling bör ske först för att skapa grundförutsättningar. TOGAF:s roadmap-principer betonar att insatser ska sekvenseras baserat på beroenden.",
          },
        ],
        passingScore: 3,
      },
    },
  ],
};

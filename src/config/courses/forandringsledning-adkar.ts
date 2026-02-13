import type { EnhancedCourse } from "./types";

export const forandringsledningAdkar: EnhancedCourse = {
  id: "forandringsledning-adkar",
  title: "Förändringsledning ADKAR",
  icon: "repeat",
  description:
    "Prosci ADKAR-modellen steg för steg — Awareness, Desire, Knowledge, Ability, Reinforcement — med praktiska verktyg.",
  level: "Grundläggande",
  estimatedMinutes: 65,
  tags: ["ADKAR", "Förändring", "Prosci"],
  modules: [
    /* ================================================================== */
    /*  Modul 1 — Varför förändringsledning?                              */
    /* ================================================================== */
    {
      id: "forandringsledning-adkar-1",
      title: "Varför förändringsledning?",
      theory: {
        content: [
          "Prosci har i över tjugo år genomfört benchmarkingstudier som visar att projekt med strukturerad förändringsledning har upp till sex gånger större sannolikhet att nå sina mål jämfört med projekt som saknar det. Trots detta behandlas förändringsledning ofta som en mjuk fråga som kan lösas med en informationsinsats i slutet av projektet. McKinsey rapporterar att cirka 70 procent av alla transformationsinitiativ misslyckas, och den vanligaste orsaken är bristande hantering av den mänskliga sidan av förändringen — inte teknik, budget eller projektplanering.",
          "John Kotter identifierade i sin forskning vid Harvard Business School åtta steg för framgångsrik förändring, där det allra första steget är att skapa en känsla av angelägenhet — ett 'sense of urgency'. Utan denna angelägenhet stannar förändringsinitiativ i startblocken. Kotter betonar att ledare ofta underskattar hur svårt det är att driva människor ur sina komfortzoner och att brist på angelägenhet är den enskilt största orsaken till att förändringar strandar redan i planeringsfasen.",
          "Kurt Lewins klassiska modell delar förändringsprocessen i tre faser: Unfreeze (lös upp befintliga beteenden och strukturer), Change (genomför förändringen) och Refreeze (förankra det nya tillståndet). Denna modell, som utvecklades redan på 1940-talet, utgör fortfarande grunden för modern förändringsteori. McKinsey 7-S Framework kompletterar genom att visa att förändring måste adressera sju sammanlänkade dimensioner — strategi, struktur, system, gemensamma värderingar, kompetenser, ledarstil och personal — för att bli hållbar.",
          "XLPM (Cross-Lifecycle Project Management) är ett ramverk som integrerar förändringsledning med projektledning genom hela livscykeln. Istället för att behandla förändringsledning som en separat aktivitet visar XLPM att förändringsledningsaktiviteter måste vara inbäddade i varje projektfas — från förstudie och upphandling till implementation och förvaltning. Detta perspektiv är särskilt relevant vid offentlig upphandling, där förändringsledning alltför ofta startar först vid leverans, långt efter att förutsättningarna cementerades i kravspecifikationen.",
        ],
        keyPoints: [
          "Prosci-forskning: projekt med förändringsledning lyckas upp till sex gånger oftare",
          "McKinsey: ca 70 % av transformationsinitiativ misslyckas — oftast pga den mänskliga faktorn",
          "Kotter: 'sense of urgency' är det kritiska första steget",
          "Lewins tre faser: Unfreeze → Change → Refreeze",
          "XLPM: förändringsledning ska integreras i hela projektlivscykeln, inte adderas i slutet",
        ],
      },
      scenario: {
        id: "scenario-5-1",
        title: "Nytt ekonomisystem utan förändringsplan",
        context:
          "Din kommun har beslutat att upphandla ett nytt ekonomisystem. Projektledaren har lagt en detaljerad teknisk plan med milstolpar för datamigration, integration och testning, men det finns ingen plan för förändringsledning. Driftsättning är om åtta månader.",
        steps: [
          {
            situation:
              "Projektledaren säger: 'Vi har en stram tidplan och begränsad budget. Förändringsledning får vi ta när vi närmar oss go-live — just nu måste vi fokusera på det tekniska.'",
            question: "Hur argumenterar du för att inkludera förändringsledning redan nu?",
            choices: [
              {
                id: "1a",
                text: "Jag håller med — det tekniska måste fungera först, sedan kan vi informera användarna.",
                isOptimal: false,
                feedback:
                  "Proscidata visar att sena förändringsledningsinsatser dramatiskt ökar risken för motstånd och lågt användarantagande. Att vänta med förändringsledning till go-live innebär att man missar möjligheten att påverka Awareness och Desire i tid.",
              },
              {
                id: "1b",
                text: "Jag hänvisar till Prosci-forskningen som visar att tidigt integrerad förändringsledning mångfaldigar projektets chans att lyckas, och föreslår att vi lägger in förändringsledningsaktiviteter parallellt med den tekniska planen.",
                isOptimal: true,
                feedback:
                  "Korrekt. Genom att integrera förändringsledning från start — i linje med XLPM-ramverket — säkerställer du att användarna är förberedda och motiverade när systemet väl driftsätts. Kostnaden för tidig förändringsledning är en bråkdel av kostnaden för ett misslyckat införande.",
              },
              {
                id: "1c",
                text: "Jag skickar ett mejl till alla medarbetare om det nya systemet för att skapa medvetenhet.",
                isOptimal: false,
                feedback:
                  "Ett informationsmejl är inte förändringsledning. Enligt Kotter krävs det en systematisk plan som skapar angelägenhet, bygger en ledande koalition och kommunicerar en tydlig vision — inte bara en engångsinformation.",
              },
            ],
          },
          {
            situation:
              "Styrgruppen har accepterat att förändringsledning ska ingå i projektet. Nu frågar de vad det kostar och vem som ska ansvara.",
            question: "Vad föreslår du?",
            choices: [
              {
                id: "2a",
                text: "Jag föreslår att HR-avdelningen tar ansvar — det handlar ju om människor.",
                isOptimal: false,
                feedback:
                  "Förändringsledning bör ägas av projektet med tydligt förankrat sponsorskap från ledningen, inte delegeras till en stödfunktion. HR kan bidra, men ansvaret måste sitta i linjen och i projektet.",
              },
              {
                id: "2b",
                text: "Jag föreslår en dedikerad förändringsledare i projektteamet med budget för kommunikation, utbildning och stödinsatser, och att en senior chef utses till förändringssponsor.",
                isOptimal: true,
                feedback:
                  "Helt rätt. Prosci betonar att aktivt och synligt sponsorskap från en senior ledare är den enskilt viktigaste framgångsfaktorn för förändring. En dedikerad förändringsledare i teamet säkerställer att aktiviteterna faktiskt genomförs.",
              },
              {
                id: "2c",
                text: "Jag föreslår att projektledaren tar förändringsledningen som en extra uppgift.",
                isOptimal: false,
                feedback:
                  "Projektledaren har redan fullt fokus på den tekniska leveransen. Förändringsledning kräver specifik kompetens och dedikerad tid. Att lägga det som en extrauppgift leder ofta till att det prioriteras bort.",
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
            "Som beställare är du den som äger verksamhetsnyttan och har det yttersta ansvaret för att förändringen lyckas. Du behöver inte vara expert på förändringsledning, men du måste förstå att det är en kritisk framgångsfaktor och säkerställa att det planeras och budgeteras. Utan aktivt sponsorskap från dig som beställare saknar förändringsledningen mandat och legitimitet.",
          keyActions: [
            "Kräv att förändringsledning inkluderas i projektplanen och budgeten från start",
            "Utse en senior förändringssponsor med mandat att fatta beslut",
            "Efterfråga en förändringsbedömning (change impact assessment) tidigt i projektet",
            "Kommunicera varför förändringen är nödvändig i varje forum du deltar i",
          ],
          pitfalls: [
            "Att anta att ett bra system automatiskt leder till användning och nytta",
            "Att delegera förändringsledning till HR eller IT utan eget engagemang",
            "Att inte avsätta budget för förändringsledning — det kostar pengar att göra rätt",
            "Att underskatta motståndet — även 'bra' förändringar möter motstånd",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare kan du redan i upphandlingsfasen skapa förutsättningar för framgångsrik förändringsledning. Genom att ställa krav på leverantörens förändringsplan, utbildningsinsatser och implementeringsstöd i förfrågningsunderlaget säkerställer du att förändringsledning inte blir en eftertanke utan en kontraktuell skyldighet.",
          keyActions: [
            "Inkludera krav på förändringsledningsplan i förfrågningsunderlaget",
            "Ställ krav på leverantörens erfarenhet av förändringsledning vid utvärdering",
            "Efterfråga utbildningsplan och stödresurser som en del av anbudet",
            "Säkerställ att kontraktet specificerar leverantörens ansvar för användaradoption",
          ],
          pitfalls: [
            "Att enbart fokusera på tekniska krav utan att adressera den mänskliga faktorn",
            "Att inte inkludera förändringsledning som utvärderingskriterium",
            "Att anta att leverantören automatiskt hanterar förändringsledning",
            "Att missa att budgetera för förändringsledning i den totala projektkostnaden",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare lever du med konsekvenserna av förändringen långt efter att projektet avslutats. Du vet att ett system som användarna inte accepterar blir en kostsam belastning istället för ett verktyg. Därför har du ett starkt intresse av att förändringsledning genomförs effektivt från start till förankring.",
          keyActions: [
            "Delta aktivt i förändringsbedömningen för att identifiera påverkade processer",
            "Planera för superanvändarorganisation redan under upphandlingsfasen",
            "Säkerställ att förvaltningsorganisationen dimensioneras för att stödja adoption",
            "Etablera mätpunkter för användaradoption som följs upp efter go-live",
          ],
          pitfalls: [
            "Att fokusera enbart på teknisk funktionalitet utan att förstå användarbehoven",
            "Att inte involvera förvaltningsteamet i förändringsledningsplaneringen",
            "Att underskatta behovet av stöd under och efter driftsättning",
            "Att inte mäta och följa upp faktisk användning efter systemleverans",
          ],
        },
      ],
      reflection: {
        question:
          "Tänk på en förändring du upplevt — vad hade du behövt för att ta emot den bättre?",
      },
      quiz: {
        questions: [
          {
            id: "q5-1-1",
            question:
              "Enligt Proscis benchmarkingforskning, hur mycket högre sannolikhet att lyckas har projekt med strukturerad förändringsledning?",
            options: [
              { id: "a", text: "Dubbelt så hög sannolikhet", isCorrect: false },
              { id: "b", text: "Tre gånger så hög sannolikhet", isCorrect: false },
              { id: "c", text: "Upp till sex gånger så hög sannolikhet", isCorrect: true },
              { id: "d", text: "Tio gånger så hög sannolikhet", isCorrect: false },
            ],
            explanation:
              "Proscis omfattande benchmarkingstudier visar att projekt med utmärkt förändringsledning har upp till sex gånger högre sannolikhet att nå sina mål jämfört med projekt med dålig eller obefintlig förändringsledning.",
          },
          {
            id: "q5-1-2",
            question: "Vad är det första steget i Kotters åttastegsmodell för förändring?",
            options: [
              { id: "a", text: "Bilda en vägledande koalition", isCorrect: false },
              { id: "b", text: "Skapa en känsla av angelägenhet (sense of urgency)", isCorrect: true },
              { id: "c", text: "Kommunicera visionen", isCorrect: false },
              { id: "d", text: "Generera kortsiktiga vinster", isCorrect: false },
            ],
            explanation:
              "Kotters första steg är att skapa en känsla av angelägenhet — utan den mobiliseras aldrig den energi som krävs för att förändringen ska komma igång. Kotter betonar att detta steg ofta underskattas av ledare.",
          },
          {
            id: "q5-1-3",
            question: "Vilka är de tre faserna i Lewins förändringsmodell?",
            options: [
              { id: "a", text: "Plan — Do — Check", isCorrect: false },
              { id: "b", text: "Unfreeze — Change — Refreeze", isCorrect: true },
              { id: "c", text: "Awareness — Transition — Adoption", isCorrect: false },
              { id: "d", text: "Diagnos — Design — Deployment", isCorrect: false },
            ],
            explanation:
              "Kurt Lewins modell från 1940-talet beskriver förändring som en process i tre faser: Unfreeze (lösa upp det befintliga), Change (genomföra förändringen) och Refreeze (förankra det nya tillståndet). Modellen utgör grunden för modern förändringsteori.",
          },
          {
            id: "q5-1-4",
            question: "Vad innebär XLPM i förhållande till förändringsledning?",
            options: [
              { id: "a", text: "En metod för att mäta projektprestanda", isCorrect: false },
              { id: "b", text: "Ett verktyg för riskhantering i komplexa projekt", isCorrect: false },
              {
                id: "c",
                text: "Ett ramverk som integrerar förändringsledning med projektledning genom hela livscykeln",
                isCorrect: true,
              },
              { id: "d", text: "En certifiering för förändringsledare", isCorrect: false },
            ],
            explanation:
              "XLPM (Cross-Lifecycle Project Management) integrerar förändringsledning med projektledning så att förändringsledningsaktiviteter är inbäddade i varje fas — från förstudie till förvaltning — istället för att behandlas som en separat, ofta försenad aktivitet.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 2 — ADKAR-modellen — översikt                              */
    /* ================================================================== */
    {
      id: "forandringsledning-adkar-2",
      title: "ADKAR-modellen — översikt",
      theory: {
        content: [
          "ADKAR-modellen utvecklades av Jeff Hiatt, grundare av Prosci, och beskriver de fem byggstenar varje individ måste passera för att en förändring ska lyckas: Awareness (medvetenhet om behovet av förändring), Desire (vilja att delta och stödja förändringen), Knowledge (kunskap om hur man förändras), Ability (förmåga att implementera förändringen i praktiken) och Reinforcement (förstärkning för att upprätthålla förändringen). Modellens grundinsikt är att organisationer inte förändras — det är individerna inom organisationen som förändras, en i taget.",
          "ADKAR skiljer sig från andra förändringsmodeller genom sitt tydliga individfokus. Medan Kotters åttastegsmodell primärt beskriver organisatoriska aktiviteter som ledningen ska driva (bilda koalitioner, kommunicera vision, skapa kortsiktiga vinster), fokuserar ADKAR på vad varje enskild medarbetare behöver. Lewins Unfreeze–Change–Refreeze-modell ger en övergripande processbild, men ADKAR bryter ner 'Change'-fasen i konkreta individsteg. I praktiken kompletterar modellerna varandra: Kotter beskriver vad organisationen ska göra, ADKAR beskriver vad individen behöver uppleva.",
          "En central princip i ADKAR är sekventialiteten. Stegen måste byggas i ordning, och varje steg bygger på det föregående. Det går inte att utbilda en medarbetare (Knowledge) som inte förstår varför förändringen behövs (Awareness) eller saknar vilja att delta (Desire). Prosci kallar den punkt där en individ fastnar för ett 'barrier point'. Genom att diagnostisera var i ADKAR-trappan en person befinner sig kan förändringsledaren rikta exakt rätt insats — istället för att generiskt 'informera mer' när problemet egentligen är bristande vilja eller otillräcklig övning.",
          "Jämfört med Bridges Transition Model, som beskriver den psykologiska inre resan genom tre faser — Ending (avslut av det gamla), Neutral Zone (osäkerhetens övergångsperiod) och New Beginning (det nya) — erbjuder ADKAR en mer handlingsorienterad diagnostik. Bridges betonar att varje förändring innebär en förlust och att sorg och motstånd är naturliga delar av övergången. ADKAR-modellen ger dock konkreta verktyg för att mäta individens position och designa interventioner, vilket gör den särskilt lämplig för projektbaserade IT-implementeringar där tidplaner och milstolpar styr.",
        ],
        keyPoints: [
          "ADKAR: Awareness → Desire → Knowledge → Ability → Reinforcement",
          "Fokuserar på individens resa — organisationer förändras inte, individer gör det",
          "Sekvensiell: varje steg måste byggas i ordning — identifiera 'barrier point'",
          "Kompletterar Kotter (organisationsnivå) och Lewin (processmodell)",
          "Bridges Transition Model belyser den emotionella sidan — ADKAR den handlingsorienterade",
        ],
      },
      scenario: {
        id: "scenario-5-2",
        title: "Diagnostisera motstånd med ADKAR",
        context:
          "Ditt landsting har upphandlat ett nytt journalsystem. Tre månader innan driftsättning visar en enkät att 40 procent av läkarna är skeptiska. Projektledaren vill lösa det med fler utbildningstillfällen. Du misstänker att problemet sitter djupare.",
        steps: [
          {
            situation:
              "Projektledaren säger: 'Vi lägger in dubbelt så många utbildningsdagar. Då kommer läkarna att förstå systemet bättre och sluta klaga.'",
            question: "Hur analyserar du situationen med hjälp av ADKAR?",
            choices: [
              {
                id: "1a",
                text: "Jag håller med — mer utbildning löser alltid motstånd.",
                isOptimal: false,
                feedback:
                  "Enligt ADKAR är utbildning en Knowledge-insats. Om läkarna saknar Awareness (förståelse för varför) eller Desire (vilja att delta) hjälper inte mer utbildning. Man måste först diagnostisera var i ADKAR-trappan motståndet sitter.",
              },
              {
                id: "1b",
                text: "Jag föreslår en ADKAR-bedömning där vi mäter var läkarna befinner sig i trappan — är det Awareness, Desire eller Knowledge som brister? Sedan designar vi insatser utifrån resultatet.",
                isOptimal: true,
                feedback:
                  "Korrekt. En ADKAR-bedömning identifierar var 'barrier point' ligger för varje grupp. Om läkarna inte förstår varför det gamla systemet behöver bytas (bristande Awareness) eller inte vill lämna ett system de behärskar (bristande Desire), löser mer utbildning inte problemet.",
              },
              {
                id: "1c",
                text: "Jag föreslår att ledningen skickar ett direktiv om att alla måste använda det nya systemet.",
                isOptimal: false,
                feedback:
                  "Ett direktiv kan skapa formell efterlevnad men inte genuin Desire. Prosci betonar att tvång sällan leder till hållbar förändring och ofta ökar motståndet. Bridges Transition Model varnar för att forcera människor genom den 'Neutral Zone' utan stöd.",
              },
            ],
          },
          {
            situation:
              "ADKAR-bedömningen visar att de flesta läkare har god Awareness men mycket låg Desire. De förstår varför förändringen behövs men vill inte lämna det gamla systemet.",
            question: "Vilken typ av insats riktar du in dig på?",
            choices: [
              {
                id: "2a",
                text: "Ytterligare informationskampanjer om varför förändringen behövs.",
                isOptimal: false,
                feedback:
                  "Awareness är redan hög. Mer information om 'varför' adresserar inte problemet. ADKAR visar att man behöver arbeta med Desire-steget: delaktighet, motivation, och hantering av vad förändringen innebär för individen.",
              },
              {
                id: "2b",
                text: "Desire-fokuserade insatser: involvera läkare i konfigurering, adressera deras specifika oro, visa konkreta förbättringar i vardagen, och aktivera chefer som förebilder.",
                isOptimal: true,
                feedback:
                  "Exakt rätt. Desire byggs genom delaktighet, förtroende och synliga fördelar. Att involvera läkarna i att forma det nya arbetssättet ger dem ägarskap. Bridges betonar att man måste erkänna förlusten av det gamla innan människor kan omfamna det nya.",
              },
              {
                id: "2c",
                text: "Mer utbildning i det nya systemet för att visa hur bra det är.",
                isOptimal: false,
                feedback:
                  "Utbildning adresserar Knowledge, inte Desire. Enligt ADKARs sekventiella logik måste Desire finnas på plats innan Knowledge-insatser ger effekt. Läkare som inte vill använda systemet kommer inte att engagera sig i utbildningen.",
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
            "Som beställare behöver du förstå ADKAR för att kunna diagnostisera var motstånd uppstår i din organisation. Du är den som har makten att mobilisera chefsledet och skapa förutsättningar för varje ADKAR-steg. Utan din aktiva insats stannar förändringen vid Awareness — medarbetarna förstår behovet men det händer inget.",
          keyActions: [
            "Använd ADKAR-bedömningar för att mäta organisationens beredskap vid upphandlingens start",
            "Koppla varje ADKAR-steg till konkreta milstolpar i projektplanen",
            "Säkerställ att cheferna i linjen förstår sin roll i att bygga Desire hos medarbetarna",
            "Följ upp ADKAR-data löpande — inte bara vid en tidpunkt",
          ],
          pitfalls: [
            "Att tro att information (Awareness) räcker för att skapa förändring",
            "Att hoppa över Desire och gå direkt till Knowledge med utbildningar",
            "Att inte investera i mätning av var i ADKAR medarbetarna befinner sig",
            "Att behandla alla medarbetargrupper som om de har samma barrier point",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare kan du förankra ADKAR-tänkandet redan i förfrågningsunderlaget. Genom att kräva att leverantören beskriver hur de stödjer varje ADKAR-steg i sin implementeringsplan säkerställer du att förändringsledning blir en del av leveransen — inte ett separat projekt som organisationen själv måste finansiera.",
          keyActions: [
            "Inkludera krav på att leverantörens implementeringsplan adresserar alla fem ADKAR-steg",
            "Utvärdera leverantörens förändringsmetodik som ett kvalitetskriterium",
            "Ställ krav på att leverantören tillhandahåller material för Awareness-fasen",
            "Kräv att kontraktet specificerar stöd för Reinforcement-fasen efter go-live",
          ],
          pitfalls: [
            "Att begränsa sig till krav på 'utbildning' utan att adressera hela ADKAR-kedjan",
            "Att inte efterfråga leverantörens erfarenhet av att hantera motstånd (Desire)",
            "Att separera teknisk leverans och förändringsledning i kontraktet",
            "Att anta att förändringsledning enbart är beställarens ansvar",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare lever du med resultatet av hur väl varje ADKAR-steg genomförts. Ett system med låg Ability bland användarna genererar supportärenden och workarounds. Bristande Reinforcement leder till att användare faller tillbaka till gamla system och processer. Du har ett direkt intresse av att varje steg i ADKAR genomförs grundligt.",
          keyActions: [
            "Planera superanvändarorganisationen kopplat till Ability-steget i ADKAR",
            "Etablera supportprocesser som adresserar Knowledge- och Ability-gap efter go-live",
            "Bygg in mätning av faktisk systemanvändning som indikator på ADKAR-framgång",
            "Planera för Reinforcement-aktiviteter i den löpande förvaltningen",
          ],
          pitfalls: [
            "Att enbart mäta systemtillgänglighet utan att mäta faktisk användning",
            "Att avveckla stödinsatser för tidigt — innan Ability stabiliserats",
            "Att inte ha en plan för att hantera användare som fastnat vid låg Desire",
            "Att ignorera signaler på att användare faller tillbaka till gamla arbetssätt",
          ],
        },
      ],
      reflection: {
        question:
          "Om du tänker på en pågående förändring — var i ADKAR-trappan sitter de flesta medarbetarna?",
      },
      quiz: {
        questions: [
          {
            id: "q5-2-1",
            question: "Vad står bokstäverna i ADKAR för?",
            options: [
              {
                id: "a",
                text: "Awareness, Desire, Knowledge, Ability, Reinforcement",
                isCorrect: true,
              },
              {
                id: "b",
                text: "Analysis, Design, Knowledge, Assessment, Review",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Alignment, Development, Kickoff, Adoption, Retrospective",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Awareness, Direction, Knowledge, Action, Results",
                isCorrect: false,
              },
            ],
            explanation:
              "ADKAR står för Awareness (medvetenhet), Desire (vilja), Knowledge (kunskap), Ability (förmåga) och Reinforcement (förstärkning). Modellen utvecklades av Jeff Hiatt på Prosci.",
          },
          {
            id: "q5-2-2",
            question:
              "Varför fungerar det inte att ge mer utbildning (Knowledge) till medarbetare som saknar Desire?",
            options: [
              { id: "a", text: "Utbildning är alltid effektiv oavsett motivation", isCorrect: false },
              {
                id: "b",
                text: "ADKAR är sekvensiell — Desire måste finnas innan Knowledge kan byggas effektivt",
                isCorrect: true,
              },
              { id: "c", text: "Desire och Knowledge är oberoende av varandra", isCorrect: false },
              { id: "d", text: "Utbildning bygger automatiskt Desire", isCorrect: false },
            ],
            explanation:
              "ADKAR är strikt sekvensiell. Varje steg bygger på det föregående. En medarbetare som saknar vilja att delta (Desire) kommer inte att engagera sig i utbildningen och kunskapen fäster inte. Man måste först lösa barrier point vid Desire.",
          },
          {
            id: "q5-2-3",
            question:
              "Hur skiljer sig ADKAR från Kotters åttastegsmodell i sitt primära fokus?",
            options: [
              {
                id: "a",
                text: "ADKAR fokuserar på organisatoriska aktiviteter, Kotter på individen",
                isCorrect: false,
              },
              {
                id: "b",
                text: "ADKAR fokuserar på individens resa, Kotter på organisatoriska ledarskapsaktiviteter",
                isCorrect: true,
              },
              { id: "c", text: "De är identiska modeller med olika namn", isCorrect: false },
              {
                id: "d",
                text: "Kotter fokuserar på individen, ADKAR på teknisk implementation",
                isCorrect: false,
              },
            ],
            explanation:
              "ADKAR fokuserar på vad varje enskild individ behöver för att genomföra förändringen, medan Kotters modell beskriver organisatoriska ledarskapsaktiviteter som att bilda koalitioner, kommunicera vision och generera kortsiktiga vinster. Modellerna kompletterar varandra.",
          },
          {
            id: "q5-2-4",
            question: "Vad kallar Prosci den punkt där en individ fastnar i ADKAR-trappan?",
            options: [
              { id: "a", text: "Blockeringspunkt", isCorrect: false },
              { id: "b", text: "Barrier point", isCorrect: true },
              { id: "c", text: "Neutral zone", isCorrect: false },
              { id: "d", text: "Resistance threshold", isCorrect: false },
            ],
            explanation:
              "Prosci kallar den punkt i ADKAR-sekvensen där en individ inte kan gå vidare för ett 'barrier point'. Genom att identifiera barrier point kan förändringsledaren rikta rätt insats istället för generella åtgärder.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 3 — Awareness — skapa medvetenhet                          */
    /* ================================================================== */
    {
      id: "forandringsledning-adkar-3",
      title: "Awareness — skapa medvetenhet",
      theory: {
        content: [
          "Awareness är det första steget i ADKAR och handlar om att individen förstår varför förändringen behövs. Det motsvarar Kotters första steg 'Create Urgency' och Lewins 'Unfreeze'-fas, där befintliga beteenden och antaganden måste lösas upp innan något nytt kan ta form. Prosci betonar att Awareness inte bara handlar om att veta att en förändring kommer — det handlar om en djupare förståelse för varför nuläget inte är hållbart och vilka konsekvenser det får att inte förändras.",
          "Prosci har utvecklat PCT-modellen (Prosci Change Triangle) som identifierar tre kritiska element för framgångsrik förändring: ledarskap/sponsorskap, projektledning och förändringsledning. I Awareness-fasen är sponsorns roll avgörande. Forskning visar att den viktigaste budbäraren för det organisatoriska 'varför' (affärsskälet till förändringen) är en senior sponsor, medan den viktigaste budbäraren för det personliga 'varför' (vad innebär detta för mig?) är den närmaste chefen. Kommunikationsstrategin måste adressera båda nivåerna.",
          "Motstånd i Awareness-fasen tar sig ofta uttryck i förnekelse och ignorering. Medarbetare kan aktivt undvika information om förändringen eller avfärda den som irrelevant. Enligt Kübler-Ross förändringskurva — som ursprungligen beskrev sorgeprocessen men har anpassats till organisatorisk förändring — befinner sig individer i denna fas ofta i chock eller förnekelse. Det är en normal reaktion, och effektiv Awareness-kommunikation måste vara repetitiv, multimodal och äkta. Enkelriktad information räcker aldrig — det krävs dialog.",
          "Kommunikationsstrategin för Awareness bör följa fem principer: (1) Förklara varför nuläget inte fungerar med konkreta data och exempel. (2) Beskriva riskerna med att inte förändra — det är ofta kraftfullare än att beskriva fördelarna med förändring. (3) Använd flera kanaler: stormöten, avdelningsmöten, intranät, personliga samtal. (4) Låt den närmaste chefen vara huvudbudbärare — inte projektledaren eller en extern konsult. (5) Skapa utrymme för frågor och oro tidigt, innan motståndet cementeras. Kotter betonar att angelägenhet inte kan skapas en gång utan måste underhållas genom hela projektet.",
        ],
        keyPoints: [
          "Awareness = förståelse för VARFÖR förändringen behövs, inte bara ATT den kommer",
          "Motsvarar Kotters 'Create Urgency' och Lewins 'Unfreeze'",
          "PCT-modellen: sponsor kommunicerar affärsskälet, närmaste chef det personliga varför",
          "Kübler-Ross: förnekelse och chock är normala reaktioner som kräver tålamod",
          "Kommunikation måste vara repetitiv, multimodal och inkludera dialog — inte enbart information",
        ],
      },
      scenario: {
        id: "scenario-5-3",
        title: "Kommunicera byte av HR-system",
        context:
          "Din myndighet ska byta HR-system efter en offentlig upphandling. Det nya systemet kräver att alla chefer registrerar personalärenden själva istället för att delegera till HR-administratörer. Cheferna har inte informerats ännu. Driftsättning är om sex månader.",
        steps: [
          {
            situation:
              "HR-chefen vill skicka ett gemensamt mejl till alla 200 chefer med information om det nya systemet och en länk till en FAQ. Hen tycker det räcker som Awareness-insats.",
            question: "Vad tycker du om den föreslagna kommunikationsstrategin?",
            choices: [
              {
                id: "1a",
                text: "Det räcker — ett tydligt mejl med FAQ täcker det viktigaste.",
                isOptimal: false,
                feedback:
                  "Ett mejl är ensidig information, inte dialog. Prosci betonar att Awareness kräver personlig kommunikation genom den närmaste chefen. Dessutom adresserar ett generiskt mejl inte det personliga 'varför' — vad innebär detta för mig som chef?",
              },
              {
                id: "1b",
                text: "Jag föreslår en stegvis kommunikationsplan: först briefing med avdelningscheferna som sponsors, sedan dialogmöten med cheferna i mindre grupper där de får ställa frågor, och slutligen skriftligt material som komplement.",
                isOptimal: true,
                feedback:
                  "Korrekt. Proscis forskning visar att effektiv Awareness-kommunikation kräver både en senior sponsor som förklarar det organisatoriska varför och möjlighet till dialog i mindre grupper. Närmaste chefens roll som budbärare är avgörande.",
              },
              {
                id: "1c",
                text: "Jag väntar med att informera cheferna tills vi har utbildningsmaterialet klart, så vi kan ge dem allt på en gång.",
                isOptimal: false,
                feedback:
                  "Att vänta med Awareness underminerar förändringen. Enligt Kotter måste angelägenhet skapas tidigt. Om cheferna hör rykten innan de informerats officiellt ökar motståndet dramatiskt. ADKAR-stegen måste genomföras i ordning, och Awareness måste komma först.",
              },
            ],
          },
          {
            situation:
              "Under det första dialogmötet uttrycker flera chefer stark frustration: 'Varför ska vi behöva göra HR-administration? Det är inte vår uppgift!' Stämningen är upprörd.",
            question: "Hur hanterar du den upprörda reaktionen?",
            choices: [
              {
                id: "2a",
                text: "Jag försöker lugna ner diskussionen genom att betona alla fördelar med det nya systemet.",
                isOptimal: false,
                feedback:
                  "Att avfärda eller minimera oron skapar ytterligare motstånd. Bridges Transition Model betonar att man måste erkänna förlusten av det gamla innan man kan prata om fördelarna med det nya. Cheferna behöver bli hörda.",
              },
              {
                id: "2b",
                text: "Jag erkänner att förändringen innebär ett nytt ansvar, lyssnar aktivt på deras oro, förklarar det bakomliggande behovet med konkreta data, och noterar frågorna för uppföljning.",
                isOptimal: true,
                feedback:
                  "Helt rätt. Att erkänna oron och lyssna aktivt bygger förtroende. Kübler-Ross-kurvan visar att frustration och motstånd är naturliga faser som måste genomlevas, inte undertryckas. Genom att dokumentera och följa upp visar du att deras input har värde.",
              },
              {
                id: "2c",
                text: "Jag hänvisar till ledningens beslut och säger att förändringen inte är förhandlingsbar.",
                isOptimal: false,
                feedback:
                  "Att hänvisa till auktoritet utan att adressera det underliggande behovet skapar underkastelse, inte Awareness. Prosci betonar att Awareness handlar om förståelse och accept, inte lydnad. Medarbetare som inte förstår varför kommer att motarbeta förändringen passivt.",
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
            "Som beställare och förändringssponsor är du den som måste stå i frontlinjen för Awareness-kommunikationen. Din uppgift är att förklara det organisatoriska varför — varför behöver vi förändra oss? — med autenticitet och övertygelse. Du kan inte delegera detta till projektledaren eller en konsult. Din trovärdighet och ditt engagemang avgör om cheferna tar förändringen på allvar.",
          keyActions: [
            "Formulera och kommunicera ett tydligt 'case for change' med konkreta data",
            "Delta personligen i kommunikationsmöten med chefsledet",
            "Aktivera mellanchefer som budbärare genom coaching och samtal",
            "Skapa forum för dialog och tvåvägskommunikation — inte bara informera",
          ],
          pitfalls: [
            "Att delegera Awareness-kommunikation till HR eller IT",
            "Att kommunicera enbart fördelar utan att erkänna utmaningarna",
            "Att skicka ett mejl och tro att Awareness är avklarad",
            "Att inte ge mellanchefer stöd i att kommunicera med sina team",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare har du en unik möjlighet att bygga in Awareness-stöd redan i kontraktet. Genom att kräva att leverantören tillhandahåller kommunikationsmaterial, demo-möjligheter och referensfall som kan användas i Awareness-fasen ger du beställaren konkreta verktyg för att skapa medvetenhet om förändringens värde.",
          keyActions: [
            "Kräv att leverantören tillhandahåller kommunikationspaket för organisationens Awareness-fas",
            "Inkludera referenskundbesök som en del av upphandlingens dialogfas",
            "Ställ krav på att leverantören kan genomföra demo för bred publik, inte bara projektgruppen",
            "Säkerställ att tidplanen i kontraktet ger utrymme för Awareness-aktiviteter innan go-live",
          ],
          pitfalls: [
            "Att inte ge tillräckligt med tid mellan tilldelning och driftsättning för Awareness-arbete",
            "Att begränsa dialog med leverantören till tekniska frågor utan att adressera förändringskommunikation",
            "Att inte inkludera kommunikationsmaterial som en leverabel i kontraktet",
            "Att missa möjligheten att använda marknadsundersökning/dialogfas för att bygga tidig Awareness",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare bidrar du till Awareness genom att förklara de tekniska och operativa skälen till förändringen. Du kan visa konkret data om nuvarande systems begränsningar — driftstörningar, supportkostnader, saknade funktioner — som gör behovet av förändring tydligt och mätbart för användarna.",
          keyActions: [
            "Tillhandahåll data om nuvarande systems brister som stöd för Awareness-kommunikationen",
            "Delta i dialogmöten för att besvara tekniska frågor och avdramatisera förändringen",
            "Visa prototyper eller demos av det nya systemet för att göra förändringen konkret",
            "Identifiera early adopters som kan sprida positiv medvetenhet i organisationen",
          ],
          pitfalls: [
            "Att använda teknisk jargong som skapar förvirring istället för Awareness",
            "Att fokusera enbart på tekniska fördelar utan att koppla till verksamhetsnytta",
            "Att inte samordna sitt budskap med beställarens och sponsorns kommunikation",
            "Att visa det nya systemet för tidigt — innan det är tillräckligt konfigurerat för att imponera",
          ],
        },
      ],
      reflection: {
        question:
          "Hur brukar förändringar kommuniceras i din organisation — vet medarbetarna VARFÖR, eller bara VAD?",
      },
      quiz: {
        questions: [
          {
            id: "q5-3-1",
            question:
              "Enligt Proscis forskning, vem är den viktigaste budbäraren för det personliga 'varför' i Awareness-kommunikation?",
            options: [
              { id: "a", text: "VD eller generaldirektör", isCorrect: false },
              { id: "b", text: "Projektledaren", isCorrect: false },
              { id: "c", text: "Den närmaste chefen", isCorrect: true },
              { id: "d", text: "Extern förändringskonsult", isCorrect: false },
            ],
            explanation:
              "Prosci har identifierat att medarbetare litar mest på sin närmaste chef när det gäller information om hur förändringen påverkar just dem personligen. En senior sponsor bör kommunicera det organisatoriska varför, men det personliga budskapet måste komma från den närmaste chefen.",
          },
          {
            id: "q5-3-2",
            question:
              "Vilken fas i Lewins modell motsvarar Awareness-steget i ADKAR?",
            options: [
              { id: "a", text: "Change", isCorrect: false },
              { id: "b", text: "Unfreeze", isCorrect: true },
              { id: "c", text: "Refreeze", isCorrect: false },
              { id: "d", text: "Lewins modell har ingen motsvarighet", isCorrect: false },
            ],
            explanation:
              "Awareness motsvarar Lewins 'Unfreeze'-fas, där befintliga beteenden och antaganden måste lösas upp. Människor behöver förstå varför nuläget inte kan fortsätta innan de är redo att förändras. Kotter kallar detta 'Create Urgency'.",
          },
          {
            id: "q5-3-3",
            question:
              "Enligt Kübler-Ross förändringskurva, vilka reaktioner är vanliga i den tidiga Awareness-fasen?",
            options: [
              { id: "a", text: "Entusiasm och engagemang", isCorrect: false },
              { id: "b", text: "Acceptans och integration", isCorrect: false },
              { id: "c", text: "Chock och förnekelse", isCorrect: true },
              { id: "d", text: "Experimenterande och utforskande", isCorrect: false },
            ],
            explanation:
              "Kübler-Ross förändringskurva visar att tidiga reaktioner på förändring ofta inkluderar chock och förnekelse. Dessa är normala reaktioner som förändringsledaren måste hantera med tålamod, empati och upprepade kommunikationsinsatser.",
          },
          {
            id: "q5-3-4",
            question: "Vad står PCT i Proscis PCT-modell för?",
            options: [
              { id: "a", text: "Project Change Timeline", isCorrect: false },
              { id: "b", text: "Prosci Change Triangle", isCorrect: true },
              { id: "c", text: "People Culture Technology", isCorrect: false },
              { id: "d", text: "Plan Communicate Train", isCorrect: false },
            ],
            explanation:
              "PCT står för Prosci Change Triangle och identifierar tre kritiska framgångselement: ledarskap/sponsorskap, projektledning och förändringsledning. Alla tre måste fungera för att förändringen ska lyckas.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 4 — Desire — bygga vilja                                   */
    /* ================================================================== */
    {
      id: "forandringsledning-adkar-4",
      title: "Desire — bygga vilja",
      theory: {
        content: [
          "Desire är det andra steget i ADKAR och ofta det svåraste att uppnå, eftersom vilja inte kan kommenderas fram. Prosci definierar Desire som individens personliga beslut att stödja och delta i förändringen. Det handlar om en inre övergång från 'jag förstår varför' till 'jag vill vara med'. Motståndshantering är centralt i denna fas — Prosci identifierar tio vanliga orsaker till motstånd, däribland rädsla för det okända, förlorad kontroll, dåligt timing, brist på förtroende för ledningen och personlig historia av misslyckade förändringar.",
          "Motivation att förändras kan vara både inre (intrinsic) och yttre (extrinsic). Intrinsisk motivation — som kommer inifrån individen — är starkare och mer hållbar. Den byggs genom delaktighet, meningsfullhet och autonomi. Extrinsisk motivation — belöningar, påtryckningar, karriärmöjligheter — kan fungera kortsiktigt men skapar sällan genuint engagemang. Prosci betonar att den mest effektiva strategin för att bygga Desire är att kombinera båda: ge individen möjlighet att påverka förändringen (intrinsisk) samtidigt som organisationen erkänner och belönar engagemang (extrinsisk).",
          "Bridges Transition Model ger viktiga insikter för Desire-fasen genom konceptet 'Neutral Zone' — den psykologiskt svåra övergångsperioden mellan det gamla och det nya. I denna zon känner medarbetare sig vilsna, osäkra och ofta frustrerade. Bridges betonar att ledare måste erkänna och normalisera dessa känslor, skapa tillfälliga strukturer som ger trygghet och visa tålamod. Att forcera människor genom den neutrala zonen med otålighet eller hot underminerar Desire och skapar djupare motstånd.",
          "Stakeholder-engagemang är en nyckelstrategi för att bygga Desire. Prosci kategoriserar intressenter efter deras engagemangsnivå: omedveten, medveten, förståelse, acceptans, engagerad och ledande. Målet i Desire-fasen är att flytta nyckelintressenter från acceptans till engagemang. De mest effektiva verktygen är personliga samtal (inte massutskick), involvering i beslutsfattande, synliga snabba vinster och förebilder som redan omfamnat förändringen. Chefer i linjen spelar en avgörande roll: de är 'desire builders' som genom dagliga interaktioner påverkar sina medarbetares inställning.",
        ],
        keyPoints: [
          "Desire = individens personliga beslut att delta — kan inte kommenderas fram",
          "Prosci identifierar tio vanliga orsaker till motstånd som måste adresseras specifikt",
          "Intrinsisk motivation (delaktighet, meningsfullhet) är starkare än extrinsisk (belöningar)",
          "Bridges 'Neutral Zone': normalisera osäkerhet och ge trygghet under övergången",
          "Chefer i linjen är 'desire builders' — deras attityd smittar av sig på medarbetarna",
        ],
      },
      scenario: {
        id: "scenario-5-4",
        title: "Motstånd vid systemimplementation",
        context:
          "Din kommun har upphandlat ett nytt ärendehanteringssystem. Två nyckelmedarbetare i socialförvaltningen — som är informella ledare i sin grupp — vägrar att delta i pilottestningen och uttrycker öppet att det gamla systemet fungerade bättre.",
        steps: [
          {
            situation:
              "De två medarbetarna har stor informell makt i organisationen. Kollegorna lyssnar på dem och flera har börjat tveka om pilottestningen. Projektledaren vill eskalera till deras chef och kräva att de deltar.",
            question: "Hur hanterar du de två motståndarna?",
            choices: [
              {
                id: "1a",
                text: "Jag stödjer eskalering — det är dags att chefen sätter ner foten.",
                isOptimal: false,
                feedback:
                  "Att tvinga deltagande skapar formell närvaro men inte genuin Desire. Prosci varnar för att tvång ofta förvärrar motståndet och att informella ledare som tvingas kan bli ännu starkare motståndare. Bridges betonar att motstånd ofta är ett tecken på obearbetad förlust.",
              },
              {
                id: "1b",
                text: "Jag föreslår individuella samtal med de två medarbetarna för att förstå deras specifika oro, erkänna deras expertis och erbjuda dem en meningsfull roll i att forma det nya arbetssättet.",
                isOptimal: true,
                feedback:
                  "Korrekt. Prosci betonar att de mest effektiva motståndshanteringsstrategierna är personliga och lyssnar först. Genom att erkänna deras kompetens och ge dem inflytande transformerar du potentiella motståndare till ambassadörer. Delaktighet bygger intrinsisk motivation.",
              },
              {
                id: "1c",
                text: "Jag ignorerar dem och fokuserar på de medarbetare som är positiva — de negativa kommer att följa efter.",
                isOptimal: false,
                feedback:
                  "Att ignorera informella ledare med motstånd är riskabelt. Deras inflytande kan underminera hela gruppens Desire. Prosci visar att tidigt hanterat motstånd är hanterbart — ignorerat motstånd växer och cementeras.",
              },
            ],
          },
          {
            situation:
              "Du har haft enskilda samtal med medarbetarna. Det visar sig att deras motstånd grundar sig i att de inte tillfrågades under kravfasen och att de ser brister i systemet som ingen lyssnat på. De har konkreta förbättringsförslag.",
            question: "Hur tar du tillvara på deras input?",
            choices: [
              {
                id: "2a",
                text: "Jag tackar för inputen men förklarar att kravfasen är avslutad och att systemet inte kan ändras.",
                isOptimal: false,
                feedback:
                  "Att avfärda konkreta förbättringsförslag efter att ha bjudit in till dialog förstör förtroendet. Även om systemet inte kan ändras fundamentalt kan deras input ofta adresseras genom konfigurering, arbetsflödesanpassningar eller framtida releaseplaner.",
              },
              {
                id: "2b",
                text: "Jag ger dem en formell roll som 'expertgranskare' i pilottestningen, kanaliserar deras förbättringsförslag till projektteamet och återkopplar transparent om vad som kan ändras och vad som inte kan det.",
                isOptimal: true,
                feedback:
                  "Perfekt. Genom att ge dem en meningsfull roll omvandlar du deras motstånd till konstruktivt engagemang. Prosci visar att individer som får påverka förändringen utvecklar ägarskap och starkare Desire. Transparens om begränsningar bygger förtroende.",
              },
              {
                id: "2c",
                text: "Jag lovar att alla deras förslag kommer att implementeras för att vinna deras stöd.",
                isOptimal: false,
                feedback:
                  "Att göra löften som inte kan hållas underminerar förtroendet permanent. Prosci betonar att ärlighet och transparens är grunden för Desire. Bättre att vara ärlig om vad som kan och inte kan ändras.",
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
            "Som beställare och sponsor har du den avgörande rollen i att bygga Desire. Ditt aktiva, synliga engagemang signalerar till organisationen att förändringen är på riktigt och att den har ledningens fulla stöd. Prosci identifierar aktivt och synligt sponsorskap som den enskilt viktigaste framgångsfaktorn. Du bygger Desire inte genom att beordra, utan genom att visa vägen, lyssna och ge medarbetare inflytande.",
          keyActions: [
            "Var synlig och tillgänglig — delta i möten, besök arbetsgrupper, ställ frågor",
            "Hantera motstånd tidigt och personligt — undvik att delegera svåra samtal",
            "Identifiera och aktivera informella ledare som ambassadörer för förändringen",
            "Erkänn att förändringen innebär uppoffringar och visa empati för det som lämnas bakom",
          ],
          pitfalls: [
            "Att tro att ett ledningsbeslut automatiskt skapar vilja i organisationen",
            "Att inte ha tid för personlig kontakt med nyckelintressenter",
            "Att bemöta motstånd med irritation istället för nyfikenhet",
            "Att fokusera enbart på de positiva och ignorera de tveksamma",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare kan du stödja Desire-byggandet genom att redan i upphandlingsfasen involvera slutanvändare. Om medarbetare får delta i leverantörsdialoger, demo-utvärderingar och referensbesök skapas en känsla av delaktighet som bygger Desire redan innan kontraktet skrivs. Upphandlingen blir då inte något som 'görs åt' verksamheten utan något de aktivt format.",
          keyActions: [
            "Involvera slutanvändare i dialog med potentiella leverantörer under upphandlingen",
            "Genomför demo-sessioner med bred deltagarkrets — inte bara projektgruppen",
            "Ställ krav på leverantörens plan för att hantera motstånd under implementeringen",
            "Kräv att leverantören erbjuder referensbesök hos organisationer som genomfört samma förändring",
          ],
          pitfalls: [
            "Att genomföra hela upphandlingen utan slutanvändarnas medverkan",
            "Att inte inkludera krav på motståndshantering i förfrågningsunderlaget",
            "Att välja leverantör enbart på teknik och pris utan att beakta implementeringsstöd",
            "Att skapa orealistiska förväntningar under upphandlingens marknadsundersökning",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare kan du bygga Desire genom att visa konkreta förbättringar som det nya systemet ger i vardagen. Användare motiveras av synliga vinster i sitt eget arbete. Du kan identifiera 'quick wins' — funktioner som löser irritationsmoment i det gamla systemet — och lyfta fram dessa i Desire-kommunikationen. Din tekniska kunskap gör att du kan koppla systemets kapacitet till användarens behov.",
          keyActions: [
            "Identifiera och demonstrera snabba vinster som löser kända problem i det gamla systemet",
            "Rekrytera och stötta superanvändare som kan vara positiva förebilder",
            "Ge användare möjlighet att testa systemet i en säker miljö utan press",
            "Vara ärlig om systemets begränsningar och visa hur de hanteras eller utvecklas",
          ],
          pitfalls: [
            "Att överdriva systemets förmågor — det skapar besvikelse som förstör Desire",
            "Att inte lyssna på användarnas konkreta oro och invändningar",
            "Att visa systemet i ett för tidigt och oslipad skede som skapar negativt intryck",
            "Att bemöta motstånd med tekniska argument istället för att adressera den emotionella dimensionen",
          ],
        },
      ],
      reflection: {
        question:
          "När kände du senast starkt motstånd mot en förändring — vad hade kunnat öka din vilja att delta?",
      },
      quiz: {
        questions: [
          {
            id: "q5-4-1",
            question:
              "Vilken typ av motivation är enligt forskningen mest hållbar för att bygga Desire?",
            options: [
              { id: "a", text: "Extrinsisk motivation (belöningar och påtryckningar)", isCorrect: false },
              { id: "b", text: "Intrinsisk motivation (delaktighet, meningsfullhet, autonomi)", isCorrect: true },
              { id: "c", text: "Tvångsbaserad motivation (order från ledningen)", isCorrect: false },
              { id: "d", text: "Motivationen spelar ingen roll — det är processen som avgör", isCorrect: false },
            ],
            explanation:
              "Intrinsisk motivation — som byggs genom delaktighet, meningsfullhet och känsla av autonomi — är starkare och mer hållbar än extrinsisk motivation. Prosci rekommenderar att kombinera båda men betonar att intrinsisk motivation är grunden för genuint Desire.",
          },
          {
            id: "q5-4-2",
            question: "Vad kallar Bridges den psykologiskt svåra övergångsperioden mellan det gamla och det nya?",
            options: [
              { id: "a", text: "Unfreeze-fasen", isCorrect: false },
              { id: "b", text: "Denial-fasen", isCorrect: false },
              { id: "c", text: "Neutral Zone", isCorrect: true },
              { id: "d", text: "Ability-gapet", isCorrect: false },
            ],
            explanation:
              "William Bridges kallar övergångsperioden för 'Neutral Zone' — en tid av osäkerhet och vilsenhet mellan det gamla (Ending) och det nya (New Beginning). Ledare måste normalisera dessa känslor och skapa tillfälliga strukturer som ger trygghet.",
          },
          {
            id: "q5-4-3",
            question:
              "Enligt Prosci, vilken är den enskilt viktigaste framgångsfaktorn för att bygga Desire?",
            options: [
              { id: "a", text: "En stor kommunikationsbudget", isCorrect: false },
              { id: "b", text: "Aktivt och synligt sponsorskap från en senior ledare", isCorrect: true },
              { id: "c", text: "Ekonomiska incitament för medarbetarna", isCorrect: false },
              { id: "d", text: "Omfattande utbildningsprogram", isCorrect: false },
            ],
            explanation:
              "Prosci identifierar aktivt och synligt sponsorskap som den enskilt viktigaste framgångsfaktorn för förändring. En sponsor som är synlig, engagerad och kommunicerar personligt skapar legitimitet och bygger Desire i hela organisationen.",
          },
          {
            id: "q5-4-4",
            question:
              "Hur bör man enligt Prosci hantera informella ledare som aktivt motarbetar förändringen?",
            options: [
              { id: "a", text: "Eskalera till deras chef för att tvinga deltagande", isCorrect: false },
              { id: "b", text: "Ignorera dem och fokusera på de positiva medarbetarna", isCorrect: false },
              {
                id: "c",
                text: "Föra personliga samtal, förstå deras oro och erbjuda dem en meningsfull roll",
                isCorrect: true,
              },
              { id: "d", text: "Flytta dem till en annan avdelning under implementeringen", isCorrect: false },
            ],
            explanation:
              "Prosci betonar att informella ledare har stort inflytande. Genom personliga samtal kan man förstå deras oro, erkänna deras kompetens och erbjuda dem en meningsfull roll. Detta omvandlar ofta motståndare till ambassadörer och bygger Desire i hela gruppen.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 5 — Knowledge — förmedla kunskap                           */
    /* ================================================================== */
    {
      id: "forandringsledning-adkar-5",
      title: "Knowledge — förmedla kunskap",
      theory: {
        content: [
          "Knowledge är det tredje steget i ADKAR och handlar om att ge individen de kunskaper som behövs för att genomföra förändringen i praktiken. Prosci betonar att Knowledge omfattar två dimensioner: kunskap om hur man utför nya beteenden och processer (procedurkunskap) och kunskap om tillgängliga resurser och stöd (var man får hjälp). Det är avgörande att Knowledge-insatser inte startar innan Awareness och Desire finns på plats — annars faller utbildningen på hälleberget.",
          "Blooms taxonomi, utvecklad av Benjamin Bloom 1956 och reviderad av Anderson och Krathwohl 2001, erbjuder ett värdefullt ramverk för att designa Knowledge-insatser vid förändring. Taxonomin beskriver sex kognitiva nivåer: Minnas, Förstå, Tillämpa, Analysera, Utvärdera och Skapa. Vid en systemimplementation behöver de flesta användare nå nivån 'Tillämpa' — de ska kunna använda systemet i sin vardagssituation — medan superanvändare behöver nå 'Analysera' eller 'Utvärdera' för att kunna felsöka och stödja kollegor.",
          "70-20-10-modellen för lärande och utveckling, som bygger på forskning av Morgan McCall, Robert Eichinger och Michael Lombardo, visar att 70 procent av lärandet sker genom erfarenhet (learning by doing), 20 procent genom social interaktion (coaching, mentorskap, kollegialt lärande) och 10 procent genom formell utbildning (kurser, e-lärande). Implikationen för förändringsledning är tydlig: klassisk utbildning i sig är otillräcklig. Kunskapsöverföring måste inkludera övningsmöjligheter, coaching från superanvändare och kollegialt stöd.",
          "Timing är en kritisk faktor i Knowledge-fasen. Forskning visar att 'forgetting curve' — Hermann Ebbinghaus upptäckt att människor glömmer upp till 70 procent av ny information inom 24 timmar utan repetition — gör det avgörande att utbildning ligger nära den tidpunkt då kunskapen faktiskt ska användas. Just-in-time training, stödmaterial tillgängligt vid arbetsplatsen (performance support) och spaced repetition (uppdelad repetition) är strategier som ökar kunskapsretentionen dramatiskt. En behovsanalys för utbildning (Training Needs Analysis, TNA) bör genomföras för att identifiera vilka grupper som behöver vilken typ av kunskap och vid vilken tidpunkt.",
        ],
        keyPoints: [
          "Knowledge = både procedurkunnande och vetskap om var man får stöd",
          "Blooms taxonomi: de flesta användare behöver nå 'Tillämpa', superanvändare 'Analysera'",
          "70-20-10: 70 % av lärandet sker genom praktisk erfarenhet, inte formell utbildning",
          "Ebbinghaus glömskekurva: utbildning nära användningstillfället ökar retention",
          "Training Needs Analysis (TNA) säkerställer rätt utbildning till rätt grupp vid rätt tid",
        ],
      },
      scenario: {
        id: "scenario-5-5",
        title: "Utbildningsplanering inför nytt system",
        context:
          "Din region har upphandlat ett nytt sjukvårdsadministrativt system. Driftsättning är om tre månader. Du ska planera utbildningsinsatserna för 1 500 användare i fyra yrkesgrupper: läkare, sjuksköterskor, administratörer och chefer. Budget och tid är begränsade.",
        steps: [
          {
            situation:
              "Projektledaren föreslår att alla 1 500 användare ska gå samma heldagsutbildning i det nya systemet sex veckor innan driftsättning.",
            question: "Vad är din bedömning av utbildningsplanen?",
            choices: [
              {
                id: "1a",
                text: "Det låter bra — alla får samma grund och det är effektivt att köra alla samtidigt.",
                isOptimal: false,
                feedback:
                  "En standardutbildning för alla ignorerar att olika yrkesgrupper har olika behov och använder systemet på olika sätt. Dessutom visar Ebbinghaus glömskekurva att sex veckor före driftsättning innebär att mycket av kunskapen hunnit glömmas bort.",
              },
              {
                id: "1b",
                text: "Jag föreslår en Training Needs Analysis som identifierar varje yrkesgrupps specifika behov, rollbaserad utbildning så nära driftsättning som möjligt, och kompletterande stödmaterial och superanvändare vid go-live.",
                isOptimal: true,
                feedback:
                  "Korrekt. En TNA säkerställer att rätt grupp får rätt utbildning. Blooms taxonomi hjälper att anpassa djupet: chefer behöver kanske bara 'Förstå' medan administratörer behöver 'Tillämpa'. Timing nära go-live och 70-20-10-balans med praktiska övningar maximerar kunskapsretentionen.",
              },
              {
                id: "1c",
                text: "Jag föreslår att vi skippar klassrumsutbildning helt och bara ger alla ett e-lärandematerial.",
                isOptimal: false,
                feedback:
                  "Enbart e-lärande adresserar bara 10 procent av lärandebehovet enligt 70-20-10. Utan praktisk övning och kollegialt stöd når de flesta aldrig Blooms 'Tillämpa'-nivå. En blandad ansats med flera format är effektivare.",
              },
            ],
          },
          {
            situation:
              "TNA visar att läkare behöver minimal utbildning (de använder bara journaldelen) medan administratörerna behöver djupgående utbildning i ekonomi- och rapportmodulerna. Budget räcker till 10 utbildningsdagar totalt.",
            question: "Hur fördelar du utbildningsresurserna?",
            choices: [
              {
                id: "2a",
                text: "Lika mycket tid till alla grupper — det är rättvist.",
                isOptimal: false,
                feedback:
                  "Lika fördelning är inte nödvändigtvis rättvis — det är behovsbaserad fördelning som är effektiv. Att ge läkare lika mycket tid som administratörer slösar resurser på den ena gruppen och ger för lite till den andra.",
              },
              {
                id: "2b",
                text: "Jag allokerar utbildningstiden efter behov: korta fokuserade sessioner för läkare, djupgående utbildning med övningar för administratörer, och specialmoduler för chefer. Superanvändare får extra tid.",
                isOptimal: true,
                feedback:
                  "Perfekt. Behovsbaserad allokering enligt TNA-resultatet maximerar nyttan av begränsade resurser. Blooms taxonomi styr djupet: läkare behöver 'Tillämpa' i en begränsad del, administratörer 'Tillämpa' i hela systemet, superanvändare 'Analysera' för att kunna stödja andra.",
              },
              {
                id: "2c",
                text: "Jag fokuserar all utbildning på administratörerna som har störst behov — övriga får klara sig med skriftliga guider.",
                isOptimal: false,
                feedback:
                  "Att helt exkludera grupper från utbildning skapar Knowledge-gap som leder till frustration, supportbehov och motstånd. Alla grupper behöver någon form av utbildning, anpassad efter deras specifika behov och Blooms taxonomi-nivå.",
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
            "Som beställare ansvarar du för att utbildningsbudget avsätts och att verksamheten frigör tid för att medarbetarna faktiskt kan delta. Det vanligaste problemet är inte brist på utbildningsmaterial utan brist på tid — medarbetare som förväntas utbildas parallellt med full arbetsbelastning lär sig ingenting. Du måste fatta beslut om tillfällig kapacitetsreduktion under utbildningsperioden.",
          keyActions: [
            "Avsätt dedikerad budget och tid för utbildning — det är en investering, inte en kostnad",
            "Fatta beslut om tillfällig kapacitetsanpassning under utbildningsperioden",
            "Kräv en Training Needs Analysis som grund för utbildningsplanen",
            "Säkerställ att utbildning sker nära driftsättning, inte för tidigt",
          ],
          pitfalls: [
            "Att inte avsätta tid — medarbetare som utbildas 'vid sidan av' lär sig minimalt",
            "Att anta att leverantörens standardutbildning räcker för alla grupper",
            "Att spara pengar genom att korta ner utbildningstiden under vad TNA visar",
            "Att planera utbildning månader före go-live — kunskapen hinner glömmas",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare kan du säkerställa att leverantörens utbildningsåtagande är tydligt specificerat i kontraktet. Många upphandlingar innehåller vaga formuleringar som 'leverantören ska tillhandahålla utbildning' utan att specificera omfång, format, målgrupper eller timing. Genom att ställa tydliga krav i förfrågningsunderlaget skapar du förutsättningar för effektiv kunskapsöverföring.",
          keyActions: [
            "Specificera utbildningskrav per målgrupp i förfrågningsunderlaget",
            "Kräv att leverantören tillhandahåller rollbaserat utbildningsmaterial",
            "Ställ krav på train-the-trainer-koncept för organisationens superanvändare",
            "Inkludera krav på stödmaterial: korta guider, FAQ, videoinstruktioner",
          ],
          pitfalls: [
            "Att skriva vaga utbildningskrav som 'leverantören ska ge utbildning'",
            "Att inte specificera antal utbildningsdagar, format och målgrupper i kontraktet",
            "Att missa att inkludera train-the-trainer som en del av leveransen",
            "Att inte kräva att utbildningsmaterialet ägs av organisationen, inte leverantören",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare ansvarar du för att kunskapen lever vidare efter projektets slut. Projektets utbildningsinsats är tidsbegränsad, men nya medarbetare, uppdateringar och processförändringar kräver löpande kunskapsunderhåll. Du behöver bygga en intern kunskapsbas och superanvändarorganisation som kan hantera detta långsiktigt.",
          keyActions: [
            "Bygg en intern kunskapsbas med uppdaterbara guider, FAQ och videoinstruktioner",
            "Etablera och utbilda superanvändare som kan ge kollegialt stöd (20 % av 70-20-10)",
            "Planera för onboarding-utbildning av nya medarbetare efter go-live",
            "Koordinera uppdatering av utbildningsmaterial vid systemuppgraderingar",
          ],
          pitfalls: [
            "Att inte ha en plan för kunskapsöverföring efter projektavslut",
            "Att förlita sig enbart på leverantörens utbildning utan intern kompetens",
            "Att inte uppdatera utbildningsmaterialet vid systemförändringar",
            "Att inte mäta kunskapsnivån löpande — bara vid initial utbildning",
          ],
        },
      ],
      reflection: {
        question:
          "Tänk på senaste systembytet — fick du tillräckligt med utbildning och stöd, och kom det vid rätt tidpunkt?",
      },
      quiz: {
        questions: [
          {
            id: "q5-5-1",
            question:
              "Enligt 70-20-10-modellen, hur stor andel av lärandet sker genom praktisk erfarenhet?",
            options: [
              { id: "a", text: "10 procent", isCorrect: false },
              { id: "b", text: "20 procent", isCorrect: false },
              { id: "c", text: "50 procent", isCorrect: false },
              { id: "d", text: "70 procent", isCorrect: true },
            ],
            explanation:
              "Enligt 70-20-10-modellen sker 70 procent av lärandet genom praktisk erfarenhet (learning by doing), 20 procent genom social interaktion (coaching, mentorskap) och 10 procent genom formell utbildning (kurser, e-lärande).",
          },
          {
            id: "q5-5-2",
            question:
              "Vilken nivå i Blooms taxonomi bör de flesta slutanvändare uppnå vid en systemimplementation?",
            options: [
              { id: "a", text: "Minnas", isCorrect: false },
              { id: "b", text: "Förstå", isCorrect: false },
              { id: "c", text: "Tillämpa", isCorrect: true },
              { id: "d", text: "Skapa", isCorrect: false },
            ],
            explanation:
              "De flesta slutanvändare behöver nå 'Tillämpa'-nivån — de ska kunna använda systemet i sin vardagliga arbetssituation. Superanvändare bör nå 'Analysera' eller 'Utvärdera' för att kunna felsöka och stödja kollegor.",
          },
          {
            id: "q5-5-3",
            question:
              "Varför är timing av utbildning avgörande enligt Ebbinghaus forskning?",
            options: [
              { id: "a", text: "Människor lär sig bäst på morgonen", isCorrect: false },
              {
                id: "b",
                text: "Människor glömmer upp till 70 procent av ny information inom 24 timmar utan repetition",
                isCorrect: true,
              },
              { id: "c", text: "Utbildning tar alltid exakt 8 timmar att genomföra", isCorrect: false },
              { id: "d", text: "Timing spelar ingen roll om materialet är bra", isCorrect: false },
            ],
            explanation:
              "Hermann Ebbinghaus 'forgetting curve' visar att utan repetition glömmer människor upp till 70 procent av ny information inom 24 timmar. Därför bör utbildning ligga nära den tidpunkt då kunskapen ska användas, kompletterat med repetition och stödmaterial.",
          },
          {
            id: "q5-5-4",
            question: "Vad är syftet med en Training Needs Analysis (TNA)?",
            options: [
              { id: "a", text: "Att minska utbildningsbudgeten", isCorrect: false },
              { id: "b", text: "Att ge alla exakt samma utbildning", isCorrect: false },
              {
                id: "c",
                text: "Att identifiera vilka grupper som behöver vilken typ av kunskap och vid vilken tidpunkt",
                isCorrect: true,
              },
              { id: "d", text: "Att testa medarbetarnas befintliga kunskaper", isCorrect: false },
            ],
            explanation:
              "En Training Needs Analysis (TNA) identifierar specifika kunskapsbehov per målgrupp, vilket format som passar bäst och optimal timing. Den säkerställer att begränsade utbildningsresurser allokeras där de gör mest nytta.",
          },
          {
            id: "q5-5-5",
            question:
              "Enligt ADKAR, varför är det ineffektivt att starta utbildning (Knowledge) innan Desire finns på plats?",
            options: [
              { id: "a", text: "Det finns inget samband mellan Desire och Knowledge", isCorrect: false },
              {
                id: "b",
                text: "Medarbetare utan vilja att delta engagerar sig inte i utbildningen och kunskapen fäster inte",
                isCorrect: true,
              },
              { id: "c", text: "Utbildning är alltid effektiv oavsett motivationsnivå", isCorrect: false },
              { id: "d", text: "Desire byggs automatiskt genom bra utbildning", isCorrect: false },
            ],
            explanation:
              "ADKAR är sekvensiell — Desire måste finnas innan Knowledge kan byggas effektivt. Medarbetare som saknar vilja att delta kommer inte att engagera sig i utbildningen, och kunskapen fäster inte hos en omotiverad deltagare.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 6 — Ability — utveckla förmåga                             */
    /* ================================================================== */
    {
      id: "forandringsledning-adkar-6",
      title: "Ability — utveckla förmåga",
      theory: {
        content: [
          "Ability är det fjärde steget i ADKAR och representerar gapet mellan att veta hur man ska göra något (Knowledge) och att faktiskt kunna utföra det i praktiken. Prosci betonar att Ability inte uppstår automatiskt efter utbildning — det kräver övning, coaching och tid. En kirurg som har läst en manual om en ny operationsteknik har Knowledge, men Ability utvecklas först genom handlett övande. På samma sätt utvecklar systemanvändare Ability genom upprepat användande med tillgång till stöd.",
          "Kübler-Ross förändringskurva placerar Ability-fasen i det skede där individen rör sig från frustration och depression mot acceptans och integration. Det är i denna fas som produktiviteten sjunker som mest — den så kallade 'valley of despair' eller produktivitetsdipp. Forskning visar att organisationer som planerar för och kommunicerar om denna dipp hanterar den betydligt bättre. Att erkänna att det är normalt att vara långsammare och göra fel under inlärningsperioden minskar stressen och påskyndar övergången till Ability.",
          "GROW-modellen (Goal, Reality, Options, Will/Way forward) är ett etablerat coachingramverk som är särskilt användbart för att bygga Ability. Superanvändare och chefer kan använda GROW i individuella samtal: Vad är ditt mål med att använda systemet? (Goal), Hur ser situationen ut just nu? (Reality), Vilka alternativ har du? (Options), Vad väljer du att göra och när? (Will). Denna strukturerade coaching hjälper individer att identifiera sina specifika Ability-gap och formulera konkreta steg framåt.",
          "Performance support systems — stöd som finns tillgängligt i arbetsögonblicket — är avgörande för Ability-utveckling. Dit hör inbyggda hjälptexter i systemet, kontextkänsliga guider, steg-för-steg-instruktioner vid vanliga arbetsuppgifter, och snabbstöd via chat eller telefon. Forskning om electronic performance support (EPSS) visar att tillgängligt stöd i arbetsflödet reducerar behovet av formell utbildning med upp till 50 procent och accelererar Ability-utvecklingen markant. Go-live-stöd — intensivt närvarostöd under de första veckorna efter driftsättning — är den mest kritiska insatsen för att bygga Ability.",
        ],
        keyPoints: [
          "Ability = kunna göra det i praktiken, inte bara veta hur — kräver övning och coaching",
          "Kübler-Ross: 'valley of despair' — produktivitetsdipp är normal och bör kommuniceras",
          "GROW-modellen (Goal-Reality-Options-Will) för strukturerad coaching av individer",
          "Performance support i arbetsflödet reducerar utbildningsbehovet med upp till 50 %",
          "Go-live-stöd (intensiv närvaro första veckorna) är den mest kritiska Ability-insatsen",
        ],
      },
      scenario: {
        id: "scenario-5-6",
        title: "Go-live med nytt upphandlingssystem",
        context:
          "Det är måndag morgon och ditt nya upphandlingssystem är driftsatt sedan fredag kväll. Alla upphandlare har genomgått utbildning (Knowledge), men nu ska de använda systemet på riktigt för första gången. Inom den första timmen får du fyra supportärenden och två frustrerade mejl.",
        steps: [
          {
            situation:
              "En erfaren upphandlare ringer dig frustrerad: 'Jag har jobbat med upphandling i 20 år och nu sitter jag här och klickar runt som en nybörjare. Det här systemet är omöjligt att använda. Jag vill ha tillbaka det gamla.'",
            question: "Hur hanterar du situationen?",
            choices: [
              {
                id: "1a",
                text: "Jag skickar hen till FAQ:n och ber hen prova igen.",
                isOptimal: false,
                feedback:
                  "En erfaren medarbetare som uttrycker denna nivå av frustration behöver personligt stöd, inte en hänvisning till FAQ. Kübler-Ross kurvan visar att detta är en normal reaktion i 'valley of despair'. Att hänvisa till skriftligt material i detta läge upplevs som avfärdande.",
              },
              {
                id: "1b",
                text: "Jag erkänner frustrationen, förklarar att produktivitetsdipp är normalt vid systembyte, erbjuder personlig handledning på plats och visar hur hen gör sin vanligaste uppgift steg för steg.",
                isOptimal: true,
                feedback:
                  "Perfekt. Du adresserar den emotionella reaktionen (Kübler-Ross), normaliserar produktivitetsdippen och ger konkret coaching (GROW-modellen). Att visa en specifik arbetsuppgift steg för steg bygger Ability direkt i arbetssituationen — precis vad performance support handlar om.",
              },
              {
                id: "1c",
                text: "Jag beklagar och lovar att ta upp problemen med leverantören för att ändra systemet.",
                isOptimal: false,
                feedback:
                  "Att lova systemändringar skapar felaktiga förväntningar. Problemet är sannolikt inte systemet utan Ability-gapet — skillnaden mellan utbildning och praktisk förmåga. Att adressera frustrationen med coaching och stöd är mer effektivt.",
              },
            ],
          },
          {
            situation:
              "Efter två veckor visar statistiken att 60 procent av användarna loggar in dagligen, 25 procent sporadiskt och 15 procent inte alls. Projektledaren vill dra tillbaka go-live-stödet för att spara pengar.",
            question: "Vad rekommenderar du?",
            choices: [
              {
                id: "2a",
                text: "Jag stödjer att dra tillbaka stödet — de som inte använder systemet efter två veckor kommer ändå inte att göra det.",
                isOptimal: false,
                feedback:
                  "Prosci visar att Ability-utveckling tar olika lång tid för olika individer. Att dra tillbaka stöd efter bara två veckor överger de 40 procent som fortfarande behöver hjälp. Performance support bör pågå tills minst 80 procent av användarna uppnått stabil Ability.",
              },
              {
                id: "2b",
                text: "Jag rekommenderar att behålla stödet men rikta det: intensiv coaching för de 15 procent som inte loggar in, uppsökande stöd för de 25 procent sporadiska, och övergång till självservicestöd för de 60 procent som redan är igång.",
                isOptimal: true,
                feedback:
                  "Korrekt. En differentierad insats maximerar resurserna. De 15 procent som inte loggar in kan ha barrier points vid Desire eller Ability — det kräver individuell diagnos. De 25 procent sporadiska behöver troligen mer praktisk övning. De 60 procent aktiva kan klara sig med kunskapsbas och FAQ.",
              },
              {
                id: "2c",
                text: "Jag skickar ut ett direktiv från ledningen som kräver att alla loggar in dagligen.",
                isOptimal: false,
                feedback:
                  "Ett direktiv adresserar inte Ability-gapet. Medarbetare som inte loggar in gör det sannolikt för att de inte kan, inte för att de inte vill. Att tvinga dem in i systemet utan stöd skapar frustration och ytterligare motstånd. Coaching och stöd är rätt insats.",
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
            "Som beställare måste du förstå och kommunicera att produktivitetsdipp är en naturlig del av Ability-fasen. Din viktigaste insats är att skydda organisationen under denna period — genom att tillfälligt sänka prestationskraven, avsätta resurser för stöd och visa tålamod. Ledare som reagerar med otålighet under produktivitetsdippen förstör Ability-utvecklingen.",
          keyActions: [
            "Kommunicera proaktivt att produktivitetsdipp är normal och tillfällig",
            "Tillåt tillfälligt sänkta prestationskrav under inlärningsperioden",
            "Säkerställ att go-live-stöd finns på plats och inte dras tillbaka för tidigt",
            "Följ upp Ability-data (systemanvändning, supportärenden) regelbundet med projektteamet",
          ],
          pitfalls: [
            "Att reagera med otålighet när produktiviteten sjunker efter go-live",
            "Att dra tillbaka stödresurser för tidigt för att spara pengar",
            "Att inte ge medarbetare tid att öva — de förväntas prestera fullt ut från dag ett",
            "Att skylla problem på systemet istället för att investera i Ability-utveckling",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare kan du säkerställa att kontraktet inkluderar tillräckligt go-live-stöd. Många upphandlingar specificerar utbildning men inte det kritiska stödet under och efter driftsättning. Genom att inkludera krav på on-site support, hypercare-period och performance support-material i kontraktet skapar du förutsättningar för Ability-utveckling.",
          keyActions: [
            "Inkludera krav på go-live-stöd (on-site support) under minst fyra veckor efter driftsättning",
            "Specificera en hypercare-period med förstärkt support i kontraktet",
            "Kräv att leverantören tillhandahåller performance support-material inbyggt i systemet",
            "Inkludera SLA för supporttider under Ability-fasen — snabbare svar de första månaderna",
          ],
          pitfalls: [
            "Att inte specificera go-live-stöd i kontraktet — det blir kostsamt att lägga till senare",
            "Att ha samma SLA från dag ett som i stabil drift — stödbehoven är mycket högre initialt",
            "Att inte inkludera testmiljö för övning i kontraktet",
            "Att definiera utbildning som en engångsleverans istället för en process",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare ansvarar du för superanvändarorganisationen som är ryggraden i Ability-utvecklingen. Superanvändare fungerar som lokalt stöd, coacher och förebilder. Din uppgift är att rekrytera, utbilda och motivera dem. En väl fungerande superanvändarorganisation är skillnaden mellan ett system som används och ett system som bara finns.",
          keyActions: [
            "Rekrytera superanvändare med rätt profil: tekniskt intresserade, sociala, respekterade av kollegor",
            "Ge superanvändarna djupare utbildning (Blooms 'Analysera'-nivå) och tillgång till testmiljö",
            "Etablera regelbundna superanvändarträffar för erfarenhetsutbyte och kompetensutveckling",
            "Monitorera systemanvändningsdata för att identifiera Ability-gap i specifika grupper",
          ],
          pitfalls: [
            "Att utse superanvändare baserat på tillgänglighet istället för kompetens och engagemang",
            "Att inte ge superanvändarna dedicerad tid för sin stödroll",
            "Att inte uppdatera performance support-materialet när systemet förändras",
            "Att inte ha en plan för att ersätta superanvändare som byter roll eller lämnar organisationen",
          ],
        },
      ],
      reflection: {
        question:
          "Hur lång tid tog det för dig att känna dig bekväm med det senaste nya systemet du började använda?",
      },
      quiz: {
        questions: [
          {
            id: "q5-6-1",
            question:
              "Vad beskriver 'valley of despair' i Kübler-Ross förändringskurva?",
            options: [
              { id: "a", text: "Den inledande chocken vid besked om förändring", isCorrect: false },
              {
                id: "b",
                text: "Den period då produktiviteten sjunker som mest under övergången till nytt arbetssätt",
                isCorrect: true,
              },
              { id: "c", text: "Slutfasen då gamla rutiner avvecklas", isCorrect: false },
              { id: "d", text: "Planeringsfasen innan förändringen börjar", isCorrect: false },
            ],
            explanation:
              "Valley of despair är den djupaste punkten i Kübler-Ross förändringskurva, där frustration och produktivitetsfall är som störst. Det inträffar när medarbetare har lämnat det gamla men ännu inte behärskar det nya. Det är en normal fas som bör kommuniceras och hanteras med stöd.",
          },
          {
            id: "q5-6-2",
            question: "Vad står GROW för i coachingmodellen?",
            options: [
              { id: "a", text: "Gather, Review, Organize, Work", isCorrect: false },
              { id: "b", text: "Goal, Reality, Options, Will/Way forward", isCorrect: true },
              { id: "c", text: "Guide, Reflect, Observe, Wrap-up", isCorrect: false },
              { id: "d", text: "Ground, Reach, Overcome, Win", isCorrect: false },
            ],
            explanation:
              "GROW står för Goal (mål), Reality (nuläge), Options (alternativ) och Will/Way forward (vilja/väg framåt). Det är ett strukturerat coachingramverk som hjälper individer att identifiera sina Ability-gap och formulera konkreta steg framåt.",
          },
          {
            id: "q5-6-3",
            question:
              "Vad är skillnaden mellan Knowledge och Ability i ADKAR?",
            options: [
              { id: "a", text: "Det finns ingen skillnad — de överlappar helt", isCorrect: false },
              {
                id: "b",
                text: "Knowledge är att veta hur man gör något, Ability är att kunna utföra det i praktiken",
                isCorrect: true,
              },
              { id: "c", text: "Knowledge handlar om teori, Ability om motivation", isCorrect: false },
              { id: "d", text: "Knowledge kommer efter Ability i ADKAR-sekvensen", isCorrect: false },
            ],
            explanation:
              "Knowledge är att veta hur man ska göra något (procedurkunskap), medan Ability är att faktiskt kunna utföra det i praktiken. En kirurg som läst en manual har Knowledge — Ability utvecklas genom handlett övande. Gapet mellan de två fylls genom övning, coaching och stöd.",
          },
          {
            id: "q5-6-4",
            question:
              "Vad är performance support och varför är det viktigt för Ability?",
            options: [
              { id: "a", text: "Årliga prestationssamtal med chefen", isCorrect: false },
              { id: "b", text: "Bonussystem kopplat till systemanvändning", isCorrect: false },
              {
                id: "c",
                text: "Stöd tillgängligt i arbetsögonblicket — hjälptexter, guider och snabbstöd som reducerar utbildningsbehovet",
                isCorrect: true,
              },
              { id: "d", text: "Externa konsulter som övervakar produktiviteten", isCorrect: false },
            ],
            explanation:
              "Performance support är stöd tillgängligt direkt i arbetssituationen: inbyggda hjälptexter, kontextkänsliga guider, steg-för-steg-instruktioner och snabbstöd via chat. Forskning visar att det kan reducera behovet av formell utbildning med upp till 50 procent.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 7 — Reinforcement — förankra förändringen                  */
    /* ================================================================== */
    {
      id: "forandringsledning-adkar-7",
      title: "Reinforcement — förankra förändringen",
      theory: {
        content: [
          "Reinforcement är det femte och sista steget i ADKAR och handlar om att säkerställa att förändringen håller över tid — att människor inte faller tillbaka till gamla arbetssätt. Det motsvarar Lewins 'Refreeze'-fas och Kotters åttonde steg: 'Anchor changes in corporate culture'. Prosci betonar att Reinforcement inte är en engångshändelse utan en systematisk process som bör pågå i minst sex till tolv månader efter driftsättning. Utan aktiv Reinforcement riskerar organisationen att gradvis glida tillbaka till utgångsläget.",
          "Kotters forskning visar att organisationer som lyckas med långsiktig förändring aktivt kopplar det nya beteendet till organisationskulturen. Det innebär att det nya arbetssättet måste integreras i rekryteringsprocesser, introduktionsprogram, befordringskriterier och ledarskapsutveckling. Förändringen är inte färdig förrän det nya beteendet upplevs som 'så vi gör här'. McKinsey 7-S Framework understryker att hållbar förändring kräver alignment mellan alla sju S: Strategy, Structure, Systems, Shared values, Skills, Style och Staff. Om till exempel systemet (Systems) har förändrats men ledarstilen (Style) fortfarande belönar gamla beteenden, kommer Reinforcement att misslyckas.",
          "Mätning är grundbulten i Reinforcement. Utan data vet man inte om förändringen håller. Prosci rekommenderar tre typer av mätetal: adoption metrics (använder medarbetarna det nya systemet/arbetssättet?), proficiency metrics (hur bra använder de det?) och outcome metrics (levererar förändringen den förväntade nyttan?). Dashboards som visar trender över tid gör det möjligt att identifiera avdrift tidigt. Feedback-loopar — regelbundna pulsmätningar och uppföljningssamtal — säkerställer att problem fångas upp innan de blir systemiska.",
          "Lewin varnade för att 'Refreeze' kräver aktiva åtgärder, inte passiv väntan. Konkreta Reinforcement-mekanismer inkluderar: fira och synliggöra framgångar (storytelling om förändringens positiva effekter), integrera det nya arbetssättet i processbeskrivningar och rutindokument, justera målsättningar och KPI:er till det nya sättet att arbeta, ge erkännande till individer och team som anammat förändringen, och hantera avvikelser snabbt och konstruktivt. Det sistnämnda är kritiskt — om ledningen tolererar att medarbetare fortsätter med gamla arbetssätt signalerar det att förändringen egentligen var valfri.",
        ],
        keyPoints: [
          "Reinforcement = Lewins 'Refreeze' och Kotters 'Anchor changes in corporate culture'",
          "Bör pågå i minst 6-12 månader efter go-live — inte en engångsinsats",
          "McKinsey 7-S: alla sju dimensioner måste alignas för hållbar förändring",
          "Tre mätetal: adoption (används det?), proficiency (hur bra?) och outcome (ger det nytta?)",
          "Ledningen måste konsekvent signalera att det nya arbetssättet gäller — tolerans för avvikelse dödar förändringen",
        ],
      },
      scenario: {
        id: "scenario-5-7",
        title: "Sex månader efter go-live",
        context:
          "Det är sex månader sedan ditt nya verksamhetssystem driftsattes. Projektgruppen har avvecklats. Data visar att 70 procent av användarna använder systemet dagligen, men 20 procent har börjat använda parallella lösningar (Excel-ark, gamla rutiner) och 10 procent loggar knappt in. Ledningen är nöjd och har gått vidare till andra prioriteringar.",
        steps: [
          {
            situation:
              "Din chef säger: '70 procent adoption är bra nog. Vi behöver fokusera på andra projekt nu. Förändringsledningen är klar.'",
            question: "Hur argumenterar du?",
            choices: [
              {
                id: "1a",
                text: "Jag håller med — 70 procent är en acceptabel nivå.",
                isOptimal: false,
                feedback:
                  "70 procent adoption innebär att 30 procent av organisationen inte har anammat förändringen. Prosci betonar att utan aktiv Reinforcement riskerar adoptionen att sjunka ytterligare — de 20 procent med parallella lösningar kan dra med sig fler. Lewins Refreeze kräver aktiva åtgärder.",
              },
              {
                id: "1b",
                text: "Jag presenterar data som visar trenden och risken: 20 procent använder parallella lösningar, vilket underminerar datakvaliteten och nyttan. Jag föreslår en Reinforcement-plan med tydliga åtgärder och mätetal.",
                isOptimal: true,
                feedback:
                  "Korrekt. Data driver beslutsfattande. Genom att visa att parallella lösningar underminerar hela systemets värde och att trenden riskerar att sprida sig motiverar du fortsatt investering i Reinforcement. Kotter betonar att förändring som inte förankras i kulturen kan reverseras på överraskande kort tid.",
              },
              {
                id: "1c",
                text: "Jag skickar ut ett direktiv om att alla parallella lösningar ska stängas ner omedelbart.",
                isOptimal: false,
                feedback:
                  "Att stänga ner parallella lösningar utan att adressera varför de uppstått skapar frustration och motstånd. De 20 procent som använder Excel-ark gör det troligen för att systemet inte täcker ett behov. Reinforcement kräver att man förstår och adresserar rotorsaken.",
              },
            ],
          },
          {
            situation:
              "Ledningen har godkänt en tremånaders Reinforcement-plan. Du ska välja de mest effektiva åtgärderna med begränsade resurser.",
            question: "Vilka insatser prioriterar du?",
            choices: [
              {
                id: "2a",
                text: "Fler utbildningstillfällen för alla användare.",
                isOptimal: false,
                feedback:
                  "Utbildning adresserar Knowledge, men efter sex månader är problemet sannolikt inte brist på kunskap utan brist på Reinforcement. De som använder parallella lösningar vet hur systemet fungerar — de har valt att inte använda det. Mer utbildning löser inte det.",
              },
              {
                id: "2b",
                text: "Jag kombinerar tre insatser: (1) synliggöra framgångsberättelser från de 70 procent aktiva användarna, (2) identifiera och adressera rotorsaken till att 20 procent valt parallella lösningar, och (3) uppdatera processbeskrivningar och KPI:er så att det nya systemet är 'default'.",
                isOptimal: true,
                feedback:
                  "Perfekt. Denna kombination adresserar Reinforcement från tre vinklar: positiv förstärkning (synliggöra framgångar), problemlösning (förstå och åtgärda rotorsaker) och strukturell förankring (göra det nya till standard). Det motsvarar Lewins Refreeze och Kotters 'anchor in culture'.",
              },
              {
                id: "2c",
                text: "Jag inför bonusar för de som använder systemet och avdrag för de som inte gör det.",
                isOptimal: false,
                feedback:
                  "Ekonomiska incitament skapar yttre motivation som sällan leder till hållbar beteendeförändring. Dessutom kan det skapa en känsla av bestraffning som förstärker motståndet. Prosci betonar att Reinforcement bygger på positiv förstärkning och strukturell förankring, inte pisk.",
              },
            ],
          },
          {
            situation:
              "Under utredningen visar det sig att de 20 procent som använder parallella lösningar gör det för att systemet saknar en rapportfunktion som de behöver för sin månatliga uppföljning. Denna funktion fanns aldrig med i kravspecifikationen.",
            question: "Hur hanterar du denna upptäckt?",
            choices: [
              {
                id: "3a",
                text: "Jag ber dem anpassa sig till systemets rapportfunktioner som de är.",
                isOptimal: false,
                feedback:
                  "Att be användare avstå från en funktion de behöver för sitt arbete leder till permanent parallellkörning. Reinforcement kräver att systemet faktiskt stödjer arbetsbehoven — annars är det rationellt att använda alternativ.",
              },
              {
                id: "3b",
                text: "Jag dokumenterar behovet, utreder om det kan lösas genom konfigurering eller vidareutveckling, och skapar en tillfällig lösning som integrerar med systemet medan en permanent lösning tas fram.",
                isOptimal: true,
                feedback:
                  "Korrekt. Reinforcement innebär att kontinuerligt förbättra systemet utifrån verkliga behov. En tillfällig integrerad lösning visar att organisationen lyssnar, medan en permanent lösning planeras. Detta bygger förtroende och eliminerar rotorsaken till parallellkörning.",
              },
              {
                id: "3c",
                text: "Jag skyller på att kravarbetet var bristfälligt och eskalerar till projektledaren.",
                isOptimal: false,
                feedback:
                  "Att söka syndabockar hjälper inte i Reinforcement-fasen. Det viktiga är att lösa problemet framåt. Dessutom kan oupptäckta behov uppstå i alla projekt — en bra Reinforcement-process fångar och adresserar dem konstruktivt.",
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
            "Som beställare är din viktigaste roll i Reinforcement-fasen att hålla fast vid förändringen. Det innebär att du fortsätter att kommunicera vikten av det nya arbetssättet, att du inte tolererar att ledare eller medarbetare faller tillbaka till gamla rutiner, och att du följer upp nyttorealisering med data. Kotter betonar att det är ledningens konsekventa beteende som avgör om förändringen förankras i kulturen.",
          keyActions: [
            "Följ upp adoption, proficiency och outcome med regelbundna mätningar",
            "Kommunicera framgångar och nyttan av förändringen till hela organisationen",
            "Hantera avvikelser snabbt — tolerans för parallella lösningar signalerar att förändringen är valfri",
            "Integrera det nya arbetssättet i organisationens mål, processer och belöningssystem",
          ],
          pitfalls: [
            "Att förklara projektet klart vid go-live och gå vidare till andra prioriteringar",
            "Att inte mäta faktisk adoption och nyttorealisering efter driftsättning",
            "Att tolerera att chefer i linjen undantar sina team från det nya arbetssättet",
            "Att inte avsätta resurser för Reinforcement-aktiviteter efter projektavslut",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare kan du skapa kontraktuella förutsättningar för Reinforcement redan under upphandlingen. Genom att inkludera krav på nyttorealiserings-stöd, adoptionsmätning och vidareutveckling i kontraktet säkerställer du att leverantören har ett åtagande som sträcker sig bortom go-live. Reinforcement är en av de vanligaste posterna som glöms bort i upphandlingar.",
          keyActions: [
            "Inkludera krav på adoptionsmätning och rapportering i kontraktet",
            "Specificera en kontraktuell Reinforcement-period med definierade stödåtgärder",
            "Ställ krav på att leverantören levererar användningsstatistik och adoptionsrapporter",
            "Inkludera optioner för vidareutveckling som kan adressera behov som uppstår efter go-live",
          ],
          pitfalls: [
            "Att kontraktet slutar vid go-live utan post-implementation-stöd",
            "Att inte specificera leverantörens ansvar för att stödja Reinforcement",
            "Att missa att inkludera mätetal för adoption som en del av leveransens kvalitetsuppföljning",
            "Att inte planera för den vidareutveckling som alltid behövs efter go-live",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare äger du Reinforcement långsiktigt. När projektet avslutas övergår ansvaret för att upprätthålla förändringen till dig och din förvaltningsorganisation. Du behöver etablera strukturer för löpande mätning, stöd, utbildning av nya medarbetare och vidareutveckling. Systemet är aldrig 'färdigt' — Reinforcement är en löpande process.",
          keyActions: [
            "Etablera dashboards som visar adoption, proficiency och outcome över tid",
            "Upprätthåll superanvändarorganisationen med regelbundna träffar och kompetensutveckling",
            "Integrera systemutbildning i onboarding-processen för nya medarbetare",
            "Samla in och prioritera förbättringsförslag från användarna i en strukturerad process",
          ],
          pitfalls: [
            "Att sluta mäta systemanvändning efter att projektet avslutats",
            "Att låta superanvändarorganisationen tyna bort utan nyrekrytering och motivation",
            "Att inte ha en process för att fånga upp och adressera användarbehov löpande",
            "Att acceptera gradvis avdrift utan att agera — 'boiling frog'-syndromet",
          ],
        },
      ],
      reflection: {
        question:
          "Hur brukar förändringar förankras i din organisation efter go-live — finns det en plan eller tappar man fokus?",
      },
      quiz: {
        questions: [
          {
            id: "q5-7-1",
            question:
              "Vilket av Kotters åtta steg motsvarar Reinforcement i ADKAR?",
            options: [
              { id: "a", text: "Steg 1: Skapa angelägenhet", isCorrect: false },
              { id: "b", text: "Steg 4: Kommunicera visionen", isCorrect: false },
              { id: "c", text: "Steg 6: Generera kortsiktiga vinster", isCorrect: false },
              { id: "d", text: "Steg 8: Förankra förändringen i kulturen", isCorrect: true },
            ],
            explanation:
              "Kotters åttonde och sista steg — 'Anchor changes in corporate culture' — motsvarar Reinforcement i ADKAR. Båda handlar om att säkerställa att förändringen inte reverseras utan blir en del av organisationens normala arbetssätt.",
          },
          {
            id: "q5-7-2",
            question: "Vilka tre typer av mätetal rekommenderar Prosci för Reinforcement?",
            options: [
              { id: "a", text: "Tid, kostnad och kvalitet", isCorrect: false },
              { id: "b", text: "Input, output och impact", isCorrect: false },
              {
                id: "c",
                text: "Adoption (används det?), proficiency (hur bra?) och outcome (ger det nytta?)",
                isCorrect: true,
              },
              { id: "d", text: "Awareness, Desire och Knowledge", isCorrect: false },
            ],
            explanation:
              "Prosci rekommenderar tre mätetal: adoption metrics (hur många använder det nya?), proficiency metrics (hur bra använder de det?) och outcome metrics (levererar förändringen den förväntade nyttan?). Tillsammans ger de en komplett bild av förändringens framgång.",
          },
          {
            id: "q5-7-3",
            question:
              "Vilken fas i Lewins modell motsvarar Reinforcement?",
            options: [
              { id: "a", text: "Unfreeze", isCorrect: false },
              { id: "b", text: "Change", isCorrect: false },
              { id: "c", text: "Refreeze", isCorrect: true },
              { id: "d", text: "Lewins modell har inget motsvarande steg", isCorrect: false },
            ],
            explanation:
              "Reinforcement motsvarar Lewins 'Refreeze'-fas, där det nya tillståndet förankras. Lewin betonade att Refreeze kräver aktiva åtgärder — det nya beteendet måste stabiliseras genom strukturer, processer och kulturell förankring.",
          },
          {
            id: "q5-7-4",
            question:
              "Hur länge bör Reinforcement-aktiviteter pågå efter driftsättning enligt Prosci?",
            options: [
              { id: "a", text: "En till två veckor", isCorrect: false },
              { id: "b", text: "En månad", isCorrect: false },
              { id: "c", text: "Sex till tolv månader", isCorrect: true },
              { id: "d", text: "Reinforcement behöver inte planeras — det sker automatiskt", isCorrect: false },
            ],
            explanation:
              "Prosci rekommenderar att Reinforcement-aktiviteter pågår i minst sex till tolv månader efter driftsättning. Det tar tid för nya beteenden att bli till vanor och för organisationskulturen att anpassa sig. Utan aktiv Reinforcement riskerar adoptionen att sjunka.",
          },
          {
            id: "q5-7-5",
            question:
              "Enligt McKinsey 7-S Framework, vad krävs för att en förändring ska vara hållbar?",
            options: [
              { id: "a", text: "Bara systemet (Systems) behöver ändras", isCorrect: false },
              { id: "b", text: "Strategi och struktur räcker", isCorrect: false },
              {
                id: "c",
                text: "Alla sju S måste alignas: Strategy, Structure, Systems, Shared values, Skills, Style, Staff",
                isCorrect: true,
              },
              { id: "d", text: "Det räcker att ledarstilen (Style) anpassas", isCorrect: false },
            ],
            explanation:
              "McKinsey 7-S Framework visar att hållbar förändring kräver alignment mellan alla sju dimensioner: Strategy, Structure, Systems, Shared values, Skills, Style och Staff. Om till exempel systemet förändrats men ledarstilen fortfarande belönar gamla beteenden misslyckas Reinforcement.",
          },
        ],
        passingScore: 3,
      },
    },
  ],
};

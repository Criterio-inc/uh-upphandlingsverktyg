import type { EnhancedCourse } from "./types";

export const kravhantering: EnhancedCourse = {
  id: "kravhantering",
  title: "Kravhantering",
  icon: "ruler",
  description:
    "Från behov till kravspecifikation — behovsanalys, funktionella vs icke-funktionella krav, kravspårbarhet och verifiering.",
  level: "Medel",
  estimatedMinutes: 50,
  tags: ["Krav", "Specifikation", "Spårbarhet"],
  modules: [
    /* ================================================================== */
    /*  Modul 1 — Introduktion till kravhantering                         */
    /* ================================================================== */
    {
      id: "kravhantering-1",
      title: "Introduktion till kravhantering",
      theory: {
        content: [
          "Kravhantering (Requirements Engineering) är den ingenjörsmässiga disciplinen att systematiskt identifiera, analysera, dokumentera, validera och förvalta krav genom hela ett projekts livscykel. Enligt BABOK (Business Analysis Body of Knowledge) från IIBA är kravhantering en kärnkompetens inom verksamhetsanalys som omfattar allt från behovselicitering till lösningsvalidering. I en upphandlingskontext är kravhantering avgörande eftersom kraven utgör den juridiska och funktionella grunden för vad leverantören förväntas leverera — de definierar kontraktets kärna och blir det viktigaste underlaget vid eventuell tvist eller överprövning.",

          "Forskningen är entydig om att bristfällig kravhantering är en huvudorsak till projektmisslyckanden. Standish Groups CHAOS-rapporter har under decennier visat att ofullständiga krav, bristande användarinvolvering och ändrade krav är de tre vanligaste orsakerna till att IT-projekt misslyckas eller överskrider budget och tidplan. Klaus Pohl och Chris Rupp beskriver i sin referensbok 'Requirements Engineering: Fundamentals, Principles and Techniques' att upp till 60 procent av alla fel i mjukvaruprojekt kan spåras tillbaka till kravfasen — och att dessa fel blir exponentiellt dyrare att åtgärda ju senare de upptäcks. I offentlig upphandling förstärks detta problem av att otydliga krav också kan leda till överprövningar enligt LOU.",

          "IEEE har standardiserat kravhantering genom en rad standarder, varav IEEE 830 (Software Requirements Specifications) och den nyare IEEE 29148 (Systems and Software Engineering — Life Cycle Processes — Requirements Engineering) är de mest centrala. Dessa standarder definierar vad en kravspecifikation ska innehålla, vilka kvalitetskriterier som gäller för enskilda krav (entydighet, testbarhet, konsistens, spårbarhet) och hur kravprocessen ska struktureras. Att följa dessa standarder ger upphandlande myndigheter ett gemensamt språk och en gemensam kvalitetsnivå.",

          "En strukturerad kravprocess säkerställer att alla intressenters behov fångas upp, att kraven är testbara och spårbara, och att förändringar hanteras kontrollerat. Det handlar inte om att skriva så många krav som möjligt, utan om att skriva rätt krav — krav som är proportionerliga, mätbara och direkt kopplade till verksamhetens behov. Kravhantering är inte en engångsaktivitet utan en kontinuerlig process som lever genom hela upphandlingens och avtalets livscykel.",
        ],
        keyPoints: [
          "Kravhantering (Requirements Engineering) är en etablerad ingenjörsdisciplin med stöd i BABOK och IEEE-standarder",
          "Standish CHAOS-rapporter visar att dåliga krav är den främsta orsaken till projektmisslyckanden",
          "Upp till 60 procent av alla mjukvarufel kan spåras till kravfasen (Pohl/Rupp)",
          "IEEE 830 och 29148 definierar kvalitetskriterier: entydighet, testbarhet, konsistens, spårbarhet",
          "Kraven utgör den juridiska grunden i en upphandling — rätt krav, inte flest krav",
        ],
      },
      scenario: {
        id: "scenario-krav-1",
        title: "Det hastar med ny kravspecifikation",
        context:
          "Du arbetar som verksamhetsutvecklare på en kommun som ska upphandla ett nytt ärendehanteringssystem. Projektledaren vill att kravspecifikationen ska vara klar inom två veckor. Det finns ingen dokumenterad behovsanalys och inga workshops har genomförts.",
        steps: [
          {
            situation:
              "Projektledaren säger: 'Vi har inte tid med workshops — skriv kraven baserat på det gamla systemet och skicka ut förfrågan nästa vecka.'",
            question: "Hur hanterar du situationen?",
            choices: [
              {
                id: "1a",
                text: "Jag skriver krav baserat på det befintliga systemet och kompletterar med några önskemål jag hört i korridoren.",
                isOptimal: false,
                feedback:
                  "Att basera krav enbart på ett befintligt system riskerar att reproducera gamla brister och missa nya behov. Standish CHAOS-rapporten visar att bristande användarinvolvering är en av de främsta orsakerna till projektmisslyckanden.",
              },
              {
                id: "1b",
                text: "Jag föreslår en kompromiss: vi genomför åtminstone 2-3 fokuserade workshops med nyckelintressenter och använder BABOK:s eliciteringstekniker för att snabbt fånga behov.",
                isOptimal: true,
                feedback:
                  "Bra val. Även under tidspress behöver vi involvera intressenter. Korta, fokuserade workshops med rätt deltagare kan ge tillräckligt underlag för en initial kravbild som sedan kan förfinas.",
              },
              {
                id: "1c",
                text: "Jag vägrar att skriva krav utan fullständig behovsanalys och kräver minst tre månaders utredning.",
                isOptimal: false,
                feedback:
                  "Att helt blockera processen är inte konstruktivt. En pragmatisk approach med anpassade metoder efter tillgänglig tid är bättre — men aldrig utan någon form av intressentinvolvering.",
              },
            ],
          },
          {
            situation:
              "Projektledaren accepterar workshops men frågar: 'Hur vet vi att vi fångat tillräckligt många krav? Ju fler krav desto bättre, eller?'",
            question: "Vad svarar du?",
            choices: [
              {
                id: "2a",
                text: "Ja, fler krav ger bättre skydd — vi bör skriva minst 500 krav.",
                isOptimal: false,
                feedback:
                  "Kvantitet är inte kvalitet. Ett stort antal krav ökar komplexiteten för leverantörer att svara, gör utvärderingen ohanterlig och riskerar att inkludera oproportionerliga krav som kan leda till överprövning.",
              },
              {
                id: "2b",
                text: "Det handlar om kravkvalitet, inte kvantitet. Varje krav ska vara spårbart till ett behov, testbart och proportionerligt enligt IEEE:s kriterier.",
                isOptimal: true,
                feedback:
                  "Korrekt. IEEE 29148 betonar att krav ska vara nödvändiga, entydiga, testbara och spårbara. Ett krav utan koppling till ett dokumenterat behov bör ifrågasättas.",
              },
              {
                id: "2c",
                text: "Vi skriver lagom många — ungefär 100 krav brukar vara lagom.",
                isOptimal: false,
                feedback:
                  "Antalet krav beror helt på upphandlingens komplexitet. Det finns inget 'lagom antal' — fokus ska ligga på att varje krav är motiverat, testbart och proportionerligt.",
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
            "Som beställare är du den som initierar kravprocessen genom att artikulera verksamhetens behov. Du behöver inte vara expert på kravhanteringsmetodik, men du måste förstå varför en strukturerad process är nödvändig och varför det lönar sig att investera tid i kravarbetet. CHAOS-rapportens fynd att bristande användarinvolvering leder till projektmisslyckanden bör vara en stark drivkraft för dig att engagera verksamheten.",
          keyActions: [
            "Avsätta tid och resurser för behovsanalys och workshops",
            "Säkerställa att slutanvändare och verksamhetsexperter involveras i kravarbetet",
            "Förstå skillnaden mellan behov och krav — formulera behov, låt experter översätta till krav",
            "Kräva spårbarhet mellan behov och krav för att säkerställa att inget behov tappas",
          ],
          pitfalls: [
            "Att hoppa över behovsanalysen och gå direkt till kravskrivning",
            "Att delegera allt kravarbete till IT utan verksamhetsinvolvering",
            "Att tro att fler krav innebär bättre skydd — kvantitet ersätter inte kvalitet",
            "Att inte prioritera bland behoven utan behandla allt som lika viktigt",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare är du garant för att kravspecifikationen uppfyller LOU:s krav på proportionalitet, likabehandling och transparens. Du behöver säkerställa att kraven inte är diskriminerande, att de är tillräckligt tydliga för att leverantörer ska kunna lämna jämförbara anbud, och att de är testbara så att utvärderingen kan ske objektivt. IEEE-standardernas kvalitetskriterier (entydighet, testbarhet, konsistens) är direkt tillämpbara på upphandlingskrav.",
          keyActions: [
            "Granska krav för proportionalitet och icke-diskriminering enligt LOU",
            "Säkerställa att kraven är tillräckligt tydliga för att leverantörer ska kunna lämna jämförbara anbud",
            "Verifiera att varje krav har en kopplad verifieringsmetod",
            "Kontrollera att kravspecifikationen inte oavsiktligt stänger ute leverantörer",
          ],
          pitfalls: [
            "Att godkänna krav utan att kontrollera proportionalitet",
            "Att acceptera vaga formuleringar som 'bra prestanda' eller 'användarvänligt'",
            "Att inte involveras i kravarbetet förrän specifikationen ska annonseras",
            "Att missa att krav med SKA-nivå måste vara absolut nödvändiga — onödiga SKA-krav kan leda till överprövning",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare bidrar du med teknisk expertis till kravprocessen. Du förstår systemlandskapet, integrationsbehov och tekniska begränsningar. Din roll är avgörande för att säkerställa att kravspecifikationen är tekniskt genomförbar och att icke-funktionella krav som prestanda, säkerhet och skalbarhet inte glöms bort. Pohl och Rupps ramverk för kravkategorisering kan hjälpa dig att systematiskt identifiera tekniska krav.",
          keyActions: [
            "Bidra med teknisk kravbild baserad på systemlandskapet och arkitekturkrav",
            "Identifiera icke-funktionella krav som verksamheten ofta missar",
            "Bedöma teknisk genomförbarhet för föreslagna krav",
            "Säkerställa att integrationskrav och migrationskrav dokumenteras",
          ],
          pitfalls: [
            "Att specificera tekniska lösningar istället för funktionella behov",
            "Att använda teknisk jargong som leverantörer tolkar olika",
            "Att glömma icke-funktionella krav som prestanda, skalbarhet och säkerhet",
            "Att inte beakta total ägandekostnad (TCO) och förvaltningskrav i kravbilden",
          ],
        },
      ],
      reflection: {
        question:
          "Har du upplevt ett projekt där otydliga krav ledde till problem — vad hände och vad kunde gjorts annorlunda med en mer strukturerad kravprocess enligt BABOK eller IEEE?",
      },
      quiz: {
        questions: [
          {
            id: "q1-1",
            question:
              "Vilken av följande är den mest centrala IEEE-standarden för kravspecifikationer inom mjukvaruutveckling?",
            options: [
              { id: "a", text: "IEEE 802.11", isCorrect: false },
              { id: "b", text: "IEEE 830 / 29148", isCorrect: true },
              { id: "c", text: "IEEE 1394", isCorrect: false },
              { id: "d", text: "IEEE 754", isCorrect: false },
            ],
            explanation:
              "IEEE 830 (Software Requirements Specifications) och dess efterträdare IEEE 29148 (Systems and Software Engineering — Requirements Engineering) är standarderna som definierar struktur och kvalitetskriterier för kravspecifikationer.",
          },
          {
            id: "q1-2",
            question:
              "Enligt Standish Groups CHAOS-rapporter, vilken faktor är en av de främsta orsakerna till IT-projektmisslyckanden?",
            options: [
              { id: "a", text: "Brist på programmerare", isCorrect: false },
              {
                id: "b",
                text: "Ofullständiga krav och bristande användarinvolvering",
                isCorrect: true,
              },
              { id: "c", text: "Val av fel programmeringsspråk", isCorrect: false },
              { id: "d", text: "För stor projektbudget", isCorrect: false },
            ],
            explanation:
              "Standish CHAOS-rapporterna har konsekvent visat att ofullständiga krav, bristande användarinvolvering och förändrade krav är de vanligaste orsakerna till IT-projektmisslyckanden.",
          },
          {
            id: "q1-3",
            question:
              "Vilket ramverk definierar kravhantering som en kärnkompetens inom verksamhetsanalys?",
            options: [
              { id: "a", text: "ITIL", isCorrect: false },
              { id: "b", text: "PRINCE2", isCorrect: false },
              { id: "c", text: "BABOK (Business Analysis Body of Knowledge)", isCorrect: true },
              { id: "d", text: "PMBOK", isCorrect: false },
            ],
            explanation:
              "BABOK (Business Analysis Body of Knowledge) från IIBA (International Institute of Business Analysis) definierar kravhantering som en kärnkompetens och beskriver eliciteringsTekniker, analysmetoder och valideringsprocesser.",
          },
          {
            id: "q1-4",
            question:
              "Enligt Pohl och Rupp, hur stor andel av alla fel i mjukvaruprojekt kan spåras till kravfasen?",
            options: [
              { id: "a", text: "Cirka 10 procent", isCorrect: false },
              { id: "b", text: "Cirka 30 procent", isCorrect: false },
              { id: "c", text: "Upp till 60 procent", isCorrect: true },
              { id: "d", text: "Över 90 procent", isCorrect: false },
            ],
            explanation:
              "Pohl och Rupp visar i 'Requirements Engineering: Fundamentals, Principles and Techniques' att upp till 60 procent av alla fel i mjukvaruprojekt kan spåras tillbaka till kravfasen, och att dessa fel blir exponentiellt dyrare att åtgärda ju senare de upptäcks.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 2 — Behovsanalys och intressenthantering                    */
    /* ================================================================== */
    {
      id: "kravhantering-2",
      title: "Behovsanalys och intressenthantering",
      theory: {
        content: [
          "Behovsanalysen är grunden för all kravställning och representerar den första fasen i kravprocessen. Innan du kan formulera krav måste du förstå vilka behov verksamheten har. BABOK (kapitel 4 — Elicitation and Collaboration) beskriver en hierarki där affärsbehov (business needs) bryts ned till intressentbehov (stakeholder needs) som i sin tur översätts till lösningskrav (solution requirements). Denna hierarki är fundamental: ett behov beskriver VAD organisationen behöver uppnå, medan ett krav beskriver HUR det ska uppnås. Att blanda ihop dessa nivåer är en av de vanligaste felen i kravarbete.",

          "Intressenthantering är en kritisk framgångsfaktor som ofta underskattas. BABOK rekommenderar att använda intressentkartläggning (stakeholder mapping) med tekniker som power/interest-matrisen (Mendelows matris) för att kategorisera intressenter efter deras inflytande och intresse. Intressenter med hög makt och högt intresse kräver aktiv samverkan, medan de med låg makt och lågt intresse kan hanteras med löpande information. I en upphandlingskontext inkluderar intressenterna slutanvändare, verksamhetschefer, IT-avdelning, ekonomiavdelning, fackliga representanter, dataskyddsombud och ibland externa parter som medborgare eller samarbetspartners.",

          "BABOK beskriver ett tiotal eliciteringstekniker för att samla in behov, varav de viktigaste i upphandlingssammanhang är: workshops (strukturerade gruppsessioner), intervjuer (djupgående samtal med enskilda intressenter), enkäter (bred insamling från många), observation (studera hur arbetet faktiskt utförs), dokumentanalys (granska befintlig dokumentation) och prototyping (visa tidiga koncept för att väcka diskussion). Valet av teknik beror på antalet intressenter, tillgänglig tid och informationens karaktär. I praktiken ger en kombination av workshops och intervjuer ofta bäst resultat.",

          "Behovsdokumentation bör följa en strukturerad mall som inkluderar behovets ID, beskrivning, källa (vilken intressent), prioritet och koppling till verksamhetsmål. Prioriteringen kan med fördel göras med MoSCoW-metoden (Must have, Should have, Could have, Won't have this time) eller en enklare P1/P2/P3-skala. Det viktigaste är att prioriteringen görs i samråd med intressenterna och att det finns tydlig konsensus kring vad som är absolut nödvändigt (Must/P1) kontra önskvärt (Could/P3). I offentlig upphandling översätts Must-behov till SKA-krav och Should/Could-behov till BÖR-krav.",
        ],
        keyPoints: [
          "BABOK definierar en hierarki: affärsbehov → intressentbehov → lösningskrav",
          "Behov beskriver VAD, krav beskriver HUR — håll isär nivåerna",
          "Använd power/interest-matris (Mendelows matris) för intressentkategorisering",
          "BABOK:s eliciteringstekniker: workshops, intervjuer, enkäter, observation, dokumentanalys, prototyping",
          "MoSCoW-prioritering: Must → SKA-krav, Should/Could → BÖR-krav",
          "Glöm inte slutanvändarna — de vet bäst hur vardagen fungerar",
        ],
      },
      scenario: {
        id: "scenario-krav-2",
        title: "Intressenter med motstridiga behov",
        context:
          "Din kommun ska upphandla ett nytt verksamhetssystem för socialtjänsten. Du har genomfört workshops med tre intressentgrupper: socialsekreterare (slutanvändare), enhetschefer (verksamhetsledning) och IT-avdelningen. Deras behov står delvis i konflikt med varandra.",
        steps: [
          {
            situation:
              "Socialsekreterarna vill ha ett system som är så enkelt som möjligt med minimalt antal klick per ärende. Enhetscheferna vill ha detaljerad statistik och uppföljning, vilket kräver att handläggarna fyller i fler fält. IT-avdelningen vill att systemet körs i kommunens egen servermiljö, medan leverantörsmarknaden i stort erbjuder molnbaserade lösningar.",
            question: "Hur hanterar du de motstridiga behoven?",
            choices: [
              {
                id: "1a",
                text: "Jag prioriterar chefernas behov — de har högst makt i organisationen.",
                isOptimal: false,
                feedback:
                  "Att enbart prioritera efter makt riskerar att ge ett system som handläggarna inte vill använda. Mendelows matris visar att intressenter med högt intresse och hög påverkan (här: både chefer och slutanvändare) kräver aktiv samverkan — inte att den ena gruppen överordnas den andra.",
              },
              {
                id: "1b",
                text: "Jag dokumenterar alla behov, analyserar konflikterna och faciliterar en prioriteringsworkshop där vi gemensamt rangordnar med MoSCoW-metoden.",
                isOptimal: true,
                feedback:
                  "Utmärkt. Genom att synliggöra konflikterna och använda en strukturerad prioriteringsmetod som MoSCoW kan intressenterna gemensamt enas om vad som är Must (SKA) och vad som är Should/Could (BÖR). Kompromisser som 'enkelt för handläggare MEN med obligatoriska statistikfält' kan identifieras.",
              },
              {
                id: "1c",
                text: "Jag tar med alla behov som SKA-krav för att ingen intressentgrupp ska känna sig förbisedd.",
                isOptimal: false,
                feedback:
                  "Att göra alla behov till SKA-krav skapar en överspecificerad kravbild som kan vara oproportionerlig, stänga ute leverantörer och leda till onödigt höga kostnader. Dessutom maskerar det de verkliga konflikterna istället för att lösa dem.",
              },
            ],
          },
          {
            situation:
              "Under prioriteringsworkshopen framkommer att en enhetschef som inte deltog i de tidiga workshoparna nu kräver omfattande rapportfunktionalitet. Hen menar att hela kravarbetet måste göras om.",
            question: "Hur hanterar du den sena intressenten?",
            choices: [
              {
                id: "2a",
                text: "Vi startar om hela kravprocessen för att inkludera alla nya behov.",
                isOptimal: false,
                feedback:
                  "Att starta om hela processen för en sen intressent är oproportionerligt och riskerar att tappa momentum. Däremot måste de nya behoven dokumenteras och analyseras.",
              },
              {
                id: "2b",
                text: "Jag dokumenterar de nya behoven, gör en konsekvensanalys av hur de påverkar befintliga krav och prioriteringar, och presenterar en reviderad kravbild för styrgruppen.",
                isOptimal: true,
                feedback:
                  "Korrekt approach. Sena intressenter är vanliga — det viktiga är att ha en process för att hantera nya behov utan att spåra ur. Konsekvensanalys och styrgruppsbeslut säkerställer kontrollerad hantering.",
              },
              {
                id: "2c",
                text: "Jag ignorerar de nya kraven — vi har redan kört workshops och processen är klar.",
                isOptimal: false,
                feedback:
                  "Att ignorera legitima behov riskerar att systemet inte möter verksamhetens faktiska krav. Sena intressenter kan ha valid input — det viktiga är att hantera det kontrollerat, inte att avfärda det.",
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
            "Som beställare äger du behovsanalysen. Det är din uppgift att säkerställa att rätt intressenter involveras och att behoven fångas i sin helhet. Använd power/interest-matrisen för att identifiera vilka intressenter som kräver aktiv samverkan och vilka som bara behöver informeras. Var särskilt uppmärksam på slutanvändare som ofta har låg formell makt men mycket hög kunskap om det dagliga arbetet.",
          keyActions: [
            "Genomföra intressentkartläggning med power/interest-matris tidigt i processen",
            "Planera och genomföra behovsworkshops med representanter från alla intressentgrupper",
            "Dokumentera behov enligt BABOK:s hierarki — skilja på affärsbehov, intressentbehov och lösningskrav",
            "Facilitera MoSCoW-prioritering med intressenterna och förankra resultatet i styrgruppen",
          ],
          pitfalls: [
            "Att bara involvera chefer och missa slutanvändarperspektivet",
            "Att blanda ihop behov (VAD) och lösning (HUR) i behovsdokumentationen",
            "Att inte hantera motstridiga behov utan istället ta med allt som SKA-krav",
            "Att glömma intressenter som dyker upp sent i processen och saknar forum att uttrycka sina behov",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare behöver du säkerställa att behovsanalysen är tillräckligt genomarbetad innan kravspecifikationen tas fram. En bristfällig behovsanalys leder till bristfälliga krav, som i sin tur leder till anbud som inte möter verksamhetens faktiska behov — eller till överprövningar. Kontrollera att intressentinvolvering har skett, att prioriteringar är förankrade och att behoven är dokumenterade med spårbar källa.",
          keyActions: [
            "Verifiera att behovsanalysen bygger på dokumenterad intressentinvolvering",
            "Kontrollera att prioriteringen (MoSCoW/P1-P3) är förankrad hos berörda intressenter",
            "Granska att behov inte innehåller lösningsförslag som begränsar konkurrensen",
            "Säkerställa att behoven är tillräckligt detaljerade för att kunna översättas till testbara krav",
          ],
          pitfalls: [
            "Att acceptera kravspecifikationer utan dokumenterad behovsanalys",
            "Att inte ifrågasätta SKA-krav som saknar tydlig koppling till ett dokumenterat behov",
            "Att missa att behov som formulerats som lösningar kan strida mot principen om konkurrensneutralitet",
            "Att inte kontrollera att behovsanalysen inkluderat alla relevanta intressentgrupper",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare har du en unik insyn i det befintliga systemlandskapet och kan bidra med kunskap om tekniska behov som verksamheten sällan artikulerar själv. Det handlar om integrationsbehov, migrationsbehov, teknisk skuld som måste hanteras och infrastrukturkrav. Du bör vara en aktiv deltagare i behovsworkshops — inte bara en granskare av färdiga behov.",
          keyActions: [
            "Delta aktivt i behovsworkshops och komplettera med tekniska behov",
            "Kartlägga integrationsbehov med befintliga system i systemlandskapet",
            "Identifiera migrationsbehov (data, processer, behörigheter) som verksamheten ofta glömmer",
            "Bidra med kunskap om tekniska begränsningar och möjligheter som påverkar lösningsutrymmet",
          ],
          pitfalls: [
            "Att inte delta i behovsworkshops utan bara granska det färdiga resultatet",
            "Att formulera behov som tekniska lösningar istället för funktionella mål",
            "Att inte flagga för integrationskomplexitet tillräckligt tidigt",
            "Att underskatta migrationsbehov — datamigrering är ofta den svåraste delen av ett systembyte",
          ],
        },
      ],
      reflection: {
        question:
          "Vilka intressentgrupper brukar glömmas bort i behovsanalysen i din organisation, och vilka konsekvenser har det fått? Hur skulle du använda Mendelows power/interest-matris för att förbättra intressenthanteringen?",
      },
      quiz: {
        questions: [
          {
            id: "q2-1",
            question:
              "Enligt BABOK:s behovshierarki, vilken ordning gäller för nedbrytning av behov?",
            options: [
              { id: "a", text: "Lösningskrav → intressentbehov → affärsbehov", isCorrect: false },
              { id: "b", text: "Affärsbehov → intressentbehov → lösningskrav", isCorrect: true },
              { id: "c", text: "Intressentbehov → affärsbehov → lösningskrav", isCorrect: false },
              { id: "d", text: "Affärsbehov → lösningskrav → intressentbehov", isCorrect: false },
            ],
            explanation:
              "BABOK definierar en hierarki där affärsbehov (business needs) bryts ned till intressentbehov (stakeholder needs) som sedan översätts till lösningskrav (solution requirements). Denna top-down-approach säkerställer att alla krav har förankring i verksamhetens mål.",
          },
          {
            id: "q2-2",
            question:
              "Vad mäter power/interest-matrisen (Mendelows matris) hos intressenter?",
            options: [
              { id: "a", text: "Ålder och erfarenhet", isCorrect: false },
              { id: "b", text: "Inflytande/makt och intresse/engagemang", isCorrect: true },
              { id: "c", text: "Budget och tidstillgång", isCorrect: false },
              { id: "d", text: "Teknisk kompetens och organisationsnivå", isCorrect: false },
            ],
            explanation:
              "Mendelows power/interest-matris kategoriserar intressenter efter två dimensioner: deras makt/inflytande över projektet och deras intresse/engagemang. Intressenter med hög makt och högt intresse kräver aktiv samverkan.",
          },
          {
            id: "q2-3",
            question: "Vad står bokstaven 'M' för i MoSCoW-prioriteringsmetoden?",
            options: [
              { id: "a", text: "Maximum — det maximala antalet krav", isCorrect: false },
              { id: "b", text: "Must have — absolut nödvändigt", isCorrect: true },
              { id: "c", text: "Medium — mellanhög prioritet", isCorrect: false },
              { id: "d", text: "Mandatory — lagstadgat krav", isCorrect: false },
            ],
            explanation:
              "MoSCoW står för Must have (absolut nödvändigt), Should have (bör finnas), Could have (önskvärt) och Won't have this time (inte i denna version). I upphandling översätts Must till SKA-krav och Should/Could till BÖR-krav.",
          },
          {
            id: "q2-4",
            question:
              "Vilken eliciteringsteknik i BABOK är mest effektiv för att fånga behov från flera intressentgrupper samtidigt?",
            options: [
              { id: "a", text: "Dokumentanalys", isCorrect: false },
              { id: "b", text: "Enkäter", isCorrect: false },
              { id: "c", text: "Workshops (strukturerade gruppsessioner)", isCorrect: true },
              { id: "d", text: "Observation", isCorrect: false },
            ],
            explanation:
              "Workshops (facilitated workshops) är enligt BABOK den mest effektiva tekniken för att samla in behov från flera intressentgrupper samtidigt. De möjliggör interaktion, diskussion och gemensam prioritering i realtid.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 3 — Kravtyper                                               */
    /* ================================================================== */
    {
      id: "kravhantering-3",
      title: "Kravtyper — funktionella, icke-funktionella, begränsningar",
      theory: {
        content: [
          "En fundamental uppdelning inom kravhantering är distinktionen mellan funktionella krav, icke-funktionella krav (kvalitetskrav) och begränsningar (constraints). IEEE 29148 definierar funktionella krav som krav som beskriver vad systemet ska kunna göra — vilken funktionalitet och vilka tjänster systemet ska tillhandahålla. Exempel inkluderar: systemet ska kunna registrera nya ärenden, generera statistikrapporter, hantera behörighetsroller och skicka notifieringar. Funktionella krav svarar på frågan 'vilka funktioner behöver systemet ha?' och är ofta de krav som verksamheten har lättast att artikulera.",

          "Icke-funktionella krav, även kallade kvalitetsattribut, beskriver hur bra systemet ska vara snarare än vad det ska göra. ISO 25010 (Systems and Software Quality Requirements and Evaluation, SQuaRE) definierar åtta huvudkategorier av kvalitetsattribut: funktionell lämplighet, prestandaeffektivitet, kompatibilitet, användbarhet, tillförlitlighet, säkerhet, underhållbarhet och portabilitet. Hewlett-Packards FURPS+-modell (Functionality, Usability, Reliability, Performance, Supportability, plus Design constraints, Implementation, Interface och Physical requirements) erbjuder en alternativ men likartad kategorisering. Icke-funktionella krav glöms ofta bort i kravarbetet men är avgörande för leveransens framgång — ett system som har rätt funktioner men är för långsamt, osäkert eller svårt att använda uppfyller inte verksamhetens behov.",

          "Begränsningar (constraints) utgör den tredje kategorin och begränsar lösningsutrymmet utan att beskriva funktionalitet eller kvalitet. Begränsningar kan vara tekniska (systemet måste köras på Linux-servrar), juridiska (systemet måste uppfylla GDPR), organisatoriska (systemet måste kunna driftas av kommunens IT-avdelning) eller ekonomiska (driftskostnaden får inte överstiga 500 000 kr per år). I upphandlingssammanhang är begränsningar särskilt känsliga eftersom de direkt påverkar vilka leverantörer som kan delta — en teknisk begränsning som 'systemet måste vara byggt i Java' kan stänga ute alla leverantörer utom en, vilket strider mot LOU:s proportionalitetsprincip.",

          "I praktiken är gränsen mellan kravtyperna ibland flytande, och det är kravhanterarens uppgift att korrekt kategorisera varje krav. Pohl och Rupp rekommenderar att använda en kravmodell som explicit separerar de tre typerna och säkerställer att varje typ hanteras med lämplig detaljnivå. Funktionella krav kan ofta beskrivas som användningsfallsscenarier, icke-funktionella krav kräver mätbara acceptanskriterier (t.ex. svarstid under 2 sekunder i 95:e percentilen) och begränsningar bör alltid motiveras för att säkerställa proportionalitet. En bra tumregel i offentlig upphandling är att fler begränsningar kräver starkare motivering.",
        ],
        keyPoints: [
          "Funktionella krav = vad systemet ska göra (funktioner och tjänster)",
          "Icke-funktionella krav = hur bra det ska vara (kvalitetsattribut enligt ISO 25010)",
          "ISO 25010:s åtta kvalitetsattribut: funktionell lämplighet, prestanda, kompatibilitet, användbarhet, tillförlitlighet, säkerhet, underhållbarhet, portabilitet",
          "FURPS+ erbjuder alternativ kategorisering: Functionality, Usability, Reliability, Performance, Supportability",
          "Begränsningar begränsar lösningsutrymmet och kräver stark motivering för proportionalitet",
          "Icke-funktionella krav glöms ofta men är avgörande för leveransens framgång",
        ],
      },
      scenario: {
        id: "scenario-krav-3",
        title: "Det oproportionerliga kravet",
        context:
          "Du granskar en kravspecifikation för upphandling av ett dokumenthanteringssystem. IT-avdelningen har formulerat flera tekniska krav som du misstänker kan vara oproportionerliga eller onödigt begränsande.",
        steps: [
          {
            situation:
              "Ett av kraven lyder: 'Systemet SKA vara utvecklat i programmeringsspråket C# och köras på Microsoft SQL Server.' IT-avdelningen motiverar kravet med att de har mest kompetens i den miljön.",
            question: "Hur bedömer du detta krav?",
            choices: [
              {
                id: "1a",
                text: "Kravet är rimligt — IT-avdelningen vet bäst vilken teknik som passar.",
                isOptimal: false,
                feedback:
                  "Att kräva specifik teknik utan funktionell motivering strider mot LOU:s proportionalitetsprincip. Det begränsar konkurrensen till leverantörer som arbetar med just den tekniken, utan att det nödvändigtvis ger ett bättre system.",
              },
              {
                id: "1b",
                text: "Jag omformulerar kravet till en begränsning med tydlig motivering, alternativt ersätter det med icke-funktionella krav om drift och underhållbarhet.",
                isOptimal: true,
                feedback:
                  "Korrekt. Istället för att kräva specifik teknik bör du formulera krav om vad som behöver uppnås: 'Systemet BÖR kunna driftas och förvaltas med den kompetens som finns i kommunens IT-organisation' eller mätbara underhållbarhetskrav enligt ISO 25010.",
              },
              {
                id: "1c",
                text: "Jag tar bort kravet helt — teknik ska inte specificeras alls i en upphandling.",
                isOptimal: false,
                feedback:
                  "Tekniska krav kan vara relevanta om de är motiverade och proportionerliga. Att helt ta bort tekniska aspekter riskerar att kommunen får ett system de inte kan förvalta. Nyckeln är att formulera dem som funktionella eller icke-funktionella krav snarare än tekniska begränsningar.",
              },
            ],
          },
          {
            situation:
              "Du hittar ett annat krav: 'Systemet SKA ha en svarstid under 1 sekund.' Det finns ingen specifikation av under vilka förutsättningar (antal användare, datamängd, nätverksbelastning).",
            question: "Vad är problemet med detta krav och hur åtgärdar du det?",
            choices: [
              {
                id: "2a",
                text: "Kravet är bra som det är — kort svarstid är alltid önskvärt.",
                isOptimal: false,
                feedback:
                  "Ett prestandakrav utan definierade mätförutsättningar är inte testbart och därmed inte ett giltigt krav enligt IEEE 29148. Vad innebär 'svarstid under 1 sekund' — vid 10 användare eller 10 000? För vilken typ av operation?",
              },
              {
                id: "2b",
                text: "Jag kompletterar kravet med mätbara förutsättningar: vilken operation, antal samtidiga användare, datamängd och acceptabel percentil (t.ex. 95:e).",
                isOptimal: true,
                feedback:
                  "Utmärkt. Enligt ISO 25010 ska prestandakrav (prestandaeffektivitet) vara mätbara. Ett bättre krav vore: 'Svarstiden för ärendesökning SKA vara under 2 sekunder vid 100 samtidiga användare och 500 000 ärenden i databasen, mätt i 95:e percentilen.'",
              },
              {
                id: "2c",
                text: "Jag ändrar till ett BÖR-krav — prestanda är inte så viktigt.",
                isOptimal: false,
                feedback:
                  "Att sänka kravnivån löser inte grundproblemet: kravet är inte testbart. Oavsett om det är SKA eller BÖR måste ett prestandakrav vara mätbart med definierade förutsättningar.",
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
            "Som beställare behöver du förstå alla tre kravtyper, men ditt primära fokus ligger på funktionella krav — vilka funktioner och processer systemet ska stödja. Du bör kunna artikulera vad verksamheten behöver utan att föreskriva hur det ska lösas tekniskt. ISO 25010:s kvalitetsattribut kan hjälpa dig att systematiskt identifiera vilka icke-funktionella egenskaper som är viktigast för din verksamhet.",
          keyActions: [
            "Fokusera på att beskriva verksamhetens funktionella behov tydligt och mätbart",
            "Använda ISO 25010:s kvalitetsattribut som checklista för att identifiera viktiga icke-funktionella krav",
            "Granska begränsningar kritiskt — kräv tydlig motivering för varje begränsning",
            "Säkerställa att icke-funktionella krav som användbarhet och tillgänglighet inte glöms bort",
          ],
          pitfalls: [
            "Att beskriva lösningar istället för behov i funktionella krav",
            "Att helt delegera icke-funktionella krav till IT och därmed missa verksamhetskritiska aspekter som användbarhet",
            "Att acceptera oproportionerliga begränsningar utan att förstå konsekvenserna för konkurrens och pris",
            "Att glömma bort tillgänglighetskrav (WCAG) som är lagkrav för offentlig verksamhet",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare är din viktigaste uppgift inom kravtyper att granska begränsningar för proportionalitet och att säkerställa att alla krav är testbara. Begränsningar som kräver specifik teknik, specifika plattformar eller specifika leverantörer är röda flaggor som kräver stark motivering. Varje SKA-krav som inte är testbart är en risk vid utvärdering och potentiell överprövning.",
          keyActions: [
            "Granska alla begränsningar mot LOU:s proportionalitetsprincip",
            "Verifiera att varje krav (oavsett typ) har en kopplad verifieringsmetod",
            "Kontrollera att icke-funktionella krav har mätbara acceptanskriterier",
            "Ifrågasätta tekniska krav som riskerar att begränsa konkurrensen oproportionerligt",
          ],
          pitfalls: [
            "Att godkänna tekniska begränsningar utan att kontrollera proportionalitet",
            "Att acceptera vaga icke-funktionella krav som 'hög prestanda' utan mätetal",
            "Att inte skilja mellan SKA-krav (absoluta) och BÖR-krav (utvärderbara) korrekt",
            "Att missa att oproportionerliga begränsningar kan leda till överprövning",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare är du ofta den som formulerar icke-funktionella krav och tekniska begränsningar. Din utmaning är att balansera tekniska behov (integration, drift, säkerhet) mot principen om konkurrenneutralitet. Använd ISO 25010 som ramverk för att systematiskt gå igenom alla kvalitetsattribut och formulera krav som beskriver önskad kvalitetsnivå utan att föreskriva teknisk lösning.",
          keyActions: [
            "Använda ISO 25010:s åtta kvalitetsattribut som checklista för icke-funktionella krav",
            "Formulera tekniska krav som funktionella eller kvalitetsmässiga mål — inte som lösningsföreskrifter",
            "Säkerställa att prestandakrav har mätbara acceptanskriterier med definierade testförutsättningar",
            "Dokumentera integrationskrav mot befintligt systemlandskap utan att föreskriva teknikval",
          ],
          pitfalls: [
            "Att kräva specifika teknologier (programmeringsspråk, databas, operativsystem) utan stark motivering",
            "Att formulera icke-funktionella krav utan mätbara acceptanskriterier",
            "Att glömma portabilitetskrav — vad händer vid leverantörsbyte?",
            "Att inte beakta underhållbarhet och teknisk skuld som kvalitetsattribut",
          ],
        },
      ],
      reflection: {
        question:
          "Vilka icke-funktionella krav (enligt ISO 25010:s kvalitetsattribut) är viktigast för ert nuvarande system, och har de mätbara acceptanskriterier idag?",
      },
      quiz: {
        questions: [
          {
            id: "q3-1",
            question:
              "Vilken standard definierar åtta huvudkategorier av kvalitetsattribut för mjukvara?",
            options: [
              { id: "a", text: "ISO 9001", isCorrect: false },
              { id: "b", text: "ISO 25010 (SQuaRE)", isCorrect: true },
              { id: "c", text: "ISO 27001", isCorrect: false },
              { id: "d", text: "ISO 14001", isCorrect: false },
            ],
            explanation:
              "ISO 25010 (Systems and Software Quality Requirements and Evaluation, SQuaRE) definierar åtta kvalitetsattribut: funktionell lämplighet, prestandaeffektivitet, kompatibilitet, användbarhet, tillförlitlighet, säkerhet, underhållbarhet och portabilitet.",
          },
          {
            id: "q3-2",
            question: "Vad står FURPS+ för i kravkategoriseringsmodellen?",
            options: [
              {
                id: "a",
                text: "Functionality, Usability, Reliability, Performance, Supportability (plus Design, Implementation, Interface, Physical)",
                isCorrect: true,
              },
              {
                id: "b",
                text: "Features, Updates, Requirements, Processes, Standards",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Functional, Unfunctional, Regulatory, Procedural, Structural",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Feasibility, Utility, Risk, Priority, Scope",
                isCorrect: false,
              },
            ],
            explanation:
              "FURPS+ är en kravkategoriseringsmodell utvecklad av Hewlett-Packard. Den kategoriserar krav i Functionality, Usability, Reliability, Performance och Supportability, plus ytterligare kategorier för Design constraints, Implementation, Interface och Physical requirements.",
          },
          {
            id: "q3-3",
            question:
              "Varför är kravet 'Systemet SKA ha bra prestanda' problematiskt i en upphandling?",
            options: [
              { id: "a", text: "Prestanda är inte viktigt i offentlig upphandling", isCorrect: false },
              {
                id: "b",
                text: "Det är inte testbart — det saknar mätbara acceptanskriterier och definierade förutsättningar",
                isCorrect: true,
              },
              { id: "c", text: "Det borde vara ett BÖR-krav, inte ett SKA-krav", isCorrect: false },
              { id: "d", text: "Prestanda hör inte till icke-funktionella krav", isCorrect: false },
            ],
            explanation:
              "Enligt IEEE 29148 ska krav vara testbara (verifiable). 'Bra prestanda' saknar mätbara acceptanskriterier — vad innebär 'bra'? Under vilka förutsättningar? Ett testbart alternativ vore: 'Svarstid under 2 sekunder vid 100 samtidiga användare, mätt i 95:e percentilen.'",
          },
          {
            id: "q3-4",
            question:
              "I en offentlig upphandling kräver IT-avdelningen att systemet 'SKA vara byggt i Java'. Vad är det primära problemet med detta krav?",
            options: [
              { id: "a", text: "Java är ett föråldrat programmeringsspråk", isCorrect: false },
              {
                id: "b",
                text: "Det är en oproportionerlig begränsning som riskerar att stänga ute leverantörer i strid med LOU",
                isCorrect: true,
              },
              { id: "c", text: "Tekniska krav får aldrig ställas i en upphandling", isCorrect: false },
              { id: "d", text: "Java är dyrare än andra språk", isCorrect: false },
            ],
            explanation:
              "Att kräva ett specifikt programmeringsspråk utan stark funktionell motivering är en oproportionerlig begränsning som begränsar konkurrensen i strid med LOU:s proportionalitetsprincip. Kravet bör istället formuleras som icke-funktionella krav om underhållbarhet och driftbarhet.",
          },
          {
            id: "q3-5",
            question:
              "Vilket av ISO 25010:s kvalitetsattribut handlar om hur lätt ett system kan flyttas till en annan driftsmiljö?",
            options: [
              { id: "a", text: "Kompatibilitet", isCorrect: false },
              { id: "b", text: "Underhållbarhet", isCorrect: false },
              { id: "c", text: "Portabilitet", isCorrect: true },
              { id: "d", text: "Tillförlitlighet", isCorrect: false },
            ],
            explanation:
              "Portabilitet (portability) i ISO 25010 handlar om hur lätt ett system kan överföras från en driftsmiljö till en annan, inklusive adaptabilitet, installerbarhet och utbytbarhet. Detta är särskilt viktigt vid leverantörsbyte.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 4 — Kravspecifikation och dokumentation                     */
    /* ================================================================== */
    {
      id: "kravhantering-4",
      title: "Kravspecifikation och dokumentation",
      theory: {
        content: [
          "Kravspecifikationen är det centrala dokumentet i en upphandling — det är här behov översätts till formella, kontraktuellt bindande krav. IEEE 830 (Software Requirements Specification) definierar en referensstruktur för kravspecifikationer som inkluderar: syfte och scope, övergripande beskrivning (produktperspektiv, produktfunktioner, användarkaraktäristik, begränsningar), specifika krav (funktionella, icke-funktionella, gränssnitt) och bilagor. Den nyare IEEE 29148 bygger vidare på IEEE 830 och lägger till krav på spårbarhet och livscykelhantering. Volere-mallen, utvecklad av James och Suzanne Robertson, erbjuder ett alternativt och ofta mer praktiskt format med 27 sektioner som systematiskt täcker allt från projektdrivkrafter till underhållskrav.",

          "Varje enskilt krav bör uppfylla IEEE 29148:s kvalitetskriterier: det ska vara nödvändigt (necessary — det behövs verkligen), entydigt (unambiguous — bara en tolkning), mätbart/testbart (verifiable — kan objektivt verifieras), konsistent (consistent — inte i konflikt med andra krav), spårbart (traceable — kan spåras till behov och verifiering) och rankningsbart (ranked — har en tydlig prioritet). I praktiken bör varje krav ha ett unikt ID, en beskrivning, kravnivå (SKA/BÖR), prioritet, källa (vilken intressent/behov), verifieringsmetod och eventuella beroenden till andra krav.",

          "För mer agila kravformat har INVEST-kriterierna för user stories blivit ett komplement till traditionella kravspecifikationer. INVEST står för Independent (oberoende), Negotiable (förhandlingsbar), Valuable (värdefull), Estimable (uppskattningsbar), Small (lagom stor) och Testable (testbar). I upphandlingssammanhang kan user stories användas som komplement till formella krav, särskilt för att beskriva användarscenarion och acceptanskriterier. Formatet 'Som [roll] vill jag [funktion] så att [nytta]' tvingar kravställaren att alltid koppla funktionalitet till värde och användare. Acceptanskriterier formulerade med Given-When-Then-mönstret (Givet att... När... Då...) ger en testbar specifikation.",

          "Naturliga språkmönster för testbara krav är ett kraftfullt verktyg. Chris Rupp rekommenderar att använda mallar som: '[System] SKA [process verb] [objekt] [kvalificering]' — till exempel 'Ärendehanteringssystemet SKA generera statistikrapporter filtrerade per handläggare och tidsperiod med en svarstid under 5 sekunder.' Denna struktur säkerställer att kravet identifierar systemet, anger en handling, specificerar objektet och (där relevant) lägger till en kvalificering. Vaga formuleringar som 'systemet ska vara användarvänligt' eller 'systemet ska ha bra prestanda' bör alltid omformuleras till mätbara krav med specifika acceptanskriterier.",
        ],
        keyPoints: [
          "IEEE 830 och Volere-mallen ger referensstrukturer för kravspecifikationer",
          "IEEE 29148:s kvalitetskriterier: nödvändigt, entydigt, testbart, konsistent, spårbart, rankningsbart",
          "Varje krav behöver: ID, beskrivning, nivå (SKA/BÖR), källa, verifieringsmetod",
          "INVEST-kriterierna (Independent, Negotiable, Valuable, Estimable, Small, Testable) för user stories",
          "Naturligt språkmönster: '[System] SKA [verb] [objekt] [kvalificering]'",
          "Undvik vaga ord som 'bra', 'snabbt', 'lätt' — formulera mätbara acceptanskriterier",
        ],
      },
      scenario: {
        id: "scenario-krav-4",
        title: "Kravspecifikationen som ingen förstod",
        context:
          "Du har fått i uppdrag att granska en färdig kravspecifikation för upphandling av ett HR-system. Specifikationen innehåller 200 krav men du misstänker att kvaliteten varierar kraftigt.",
        steps: [
          {
            situation:
              "Du hittar följande krav: 'KRAV-047: Systemet SKA vara modernt och användarvänligt med en bra design som passar vår organisation.' Kravet saknar verifieringsmetod och källa.",
            question: "Hur bedömer du och åtgärdar detta krav?",
            choices: [
              {
                id: "1a",
                text: "Kravet är bra — alla vill ha ett modernt och användarvänligt system.",
                isOptimal: false,
                feedback:
                  "Kravet bryter mot flera av IEEE 29148:s kvalitetskriterier: det är inte entydigt ('modernt' och 'bra design' kan tolkas på många sätt), inte testbart (hur mäter man att designen 'passar organisationen'?) och inte spårbart (saknar källa). Ett sådant krav är omöjligt att utvärdera objektivt.",
              },
              {
                id: "1b",
                text: "Jag delar upp kravet i specifika, testbara krav: 'Systemet SKA uppfylla WCAG 2.1 AA för tillgänglighet' och 'Systemet SKA ha en SUS-poäng (System Usability Scale) på minst 70 vid användartest med 5 representativa användare.'",
                isOptimal: true,
                feedback:
                  "Utmärkt. Du har ersatt vaga begrepp med mätbara kriterier enligt IEEE 29148:s princip om testbarhet. WCAG-kravet är testbart mot en standard, och SUS-poängen ger ett kvantifierbart mått på användbarhet.",
              },
              {
                id: "1c",
                text: "Jag sänker det till ett BÖR-krav — det löser problemet med otydligheten.",
                isOptimal: false,
                feedback:
                  "Att ändra kravnivå från SKA till BÖR löser inte grundproblemet: kravet är fortfarande inte testbart. Ett BÖR-krav som inte kan mätas kan inte heller utvärderas och poängsättas objektivt i en upphandling.",
              },
            ],
          },
          {
            situation:
              "Du upptäcker att kravspecifikationen saknar struktur — funktionella och icke-funktionella krav är blandade utan logisk ordning. Leverantörer har redan hört av sig och klagat på att det är svårt att förstå vad som efterfrågas.",
            question: "Hur strukturerar du om kravspecifikationen?",
            choices: [
              {
                id: "2a",
                text: "Jag numrerar om alla krav i ordning 1-200 och skickar ut en reviderad version.",
                isOptimal: false,
                feedback:
                  "Enbart omnumrering löser inte strukturproblemet. Leverantörerna behöver kunna navigera specifikationen logiskt — per funktionsområde, kravtyp eller användningsfall.",
              },
              {
                id: "2b",
                text: "Jag strukturerar om enligt IEEE 830/Volere-mallen: grupperar krav i funktionella kluster (per verksamhetsområde), separerar icke-funktionella krav (per ISO 25010-kategori) och samlar begränsningar i ett eget avsnitt.",
                isOptimal: true,
                feedback:
                  "Korrekt. IEEE 830 och Volere-mallen ger beprövade strukturer. Genom att gruppera funktionella krav per verksamhetsområde och icke-funktionella krav per kvalitetskategori (ISO 25010) blir specifikationen navigerbar och logisk för leverantörerna.",
              },
              {
                id: "2c",
                text: "Jag skickar kravspecifikationen som den är — leverantörerna får be om förtydliganden under frågeperioden.",
                isOptimal: false,
                feedback:
                  "En ostrukturerad kravspecifikation ökar risken för missförstånd, icke-jämförbara anbud och överprövningar. Det är upphandlarens ansvar att leverera en tydlig och navigerbar specifikation.",
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
            "Som beställare ska du kunna läsa, förstå och validera kravspecifikationen — även om du inte skriver den själv. Din uppgift är att säkerställa att kraven faktiskt beskriver det verksamheten behöver, att prioriteringarna är korrekta och att inget väsentligt behov saknas. INVEST-kriterierna kan hjälpa dig att bedöma om kraven är tillräckligt tydliga och värdefulla.",
          keyActions: [
            "Granska att varje krav kan kopplas till ett dokumenterat verksamhetsbehov",
            "Verifiera att SKA-krav verkligen är absolut nödvändiga — ifrågasätt onödiga SKA-krav",
            "Kontrollera att acceptanskriterier är begripliga för verksamheten — inte bara för IT",
            "Använda INVEST-kriterierna för att bedöma om user stories är tillräckligt specifika",
          ],
          pitfalls: [
            "Att godkänna kravspecifikationen utan att verkligen läsa och förstå varje krav",
            "Att inte ifrågasätta krav formulerade i teknisk jargong som verksamheten inte förstår",
            "Att acceptera för många SKA-krav utan att väga konsekvenserna för kostnad och leverantörsdeltagande",
            "Att missa att kontrollera att kraven har tydliga verifieringsmetoder",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare är du ytterst ansvarig för kravspecifikationens kvalitet ur ett juridiskt och processperspektiv. Du ska säkerställa att varje krav är entydigt, testbart och proportionerligt. IEEE 29148:s kvalitetskriterier bör fungera som din checklista vid granskning. Särskilt viktigt är att SKA-krav verkligen är absolut nödvändiga — ett onödigt SKA-krav som ingen leverantör uppfyller tvingar dig att avbryta upphandlingen.",
          keyActions: [
            "Systematiskt granska varje krav mot IEEE 29148:s kvalitetskriterier",
            "Säkerställa att kravspecifikationen följer en logisk struktur (IEEE 830/Volere)",
            "Verifiera att alla krav har kopplad verifieringsmetod som möjliggör objektiv utvärdering",
            "Kontrollera konsistens — att krav inte motsäger varandra",
          ],
          pitfalls: [
            "Att inte avsätta tillräckligt tid för granskning av en stor kravspecifikation",
            "Att godkänna vaga krav under tidspress — dessa skapar problem vid utvärdering",
            "Att missa att kontrollera att BÖR-krav har utvärderingskriterier och poängmodell",
            "Att inte testa specifikationen med en 'leverantörsläsning' — kan en leverantör verkligen svara?",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare bidrar du med teknisk substans till kravspecifikationen. Du formulerar ofta integrationskrav, gränssnittskrav, datamigreringskrav och tekniska icke-funktionella krav. Din utmaning är att vara tillräckligt specifik för att säkerställa teknisk kvalitet utan att vara så specifik att du begränsar konkurrensen. Pohl och Rupps naturliga språkmönster ('[System] SKA [verb] [objekt] [kvalificering]') hjälper dig att formulera tydliga tekniska krav.",
          keyActions: [
            "Formulera integrations- och gränssnittskrav med tydliga protokoll och dataformat utan att kräva specifika produkter",
            "Använda naturliga språkmönster för testbara tekniska krav med mätbara kvalificeringar",
            "Specificera datamigreringskrav inklusive datakvalitetskontroll och verifieringsmetod",
            "Dokumentera drift- och förvaltningskrav som möjliggör långsiktig förvaltning",
          ],
          pitfalls: [
            "Att specificera integrationskrav som bara en specifik leverantörs produkt uppfyller",
            "Att glömma att specificera hur kravet ska verifieras — ett krav utan verifieringsmetod är meningslöst",
            "Att använda teknisk jargong som kan tolkas olika av olika leverantörer",
            "Att inte koordinera tekniska krav med verksamhetens funktionella krav — de måste hänga ihop",
          ],
        },
      ],
      reflection: {
        question:
          "Välj ett krav från en tidigare upphandling och bedöm det mot IEEE 29148:s kvalitetskriterier — är det nödvändigt, entydigt, testbart, konsistent och spårbart? Hur skulle du formulera om det?",
      },
      quiz: {
        questions: [
          {
            id: "q4-1",
            question: "Vad står INVEST-kriterierna för i kontexten av user stories?",
            options: [
              {
                id: "a",
                text: "Independent, Negotiable, Valuable, Estimable, Small, Testable",
                isCorrect: true,
              },
              {
                id: "b",
                text: "Integrated, Necessary, Verified, Evaluated, Specified, Traceable",
                isCorrect: false,
              },
              {
                id: "c",
                text: "Incremental, Negotiated, Validated, Efficient, Structured, Tracked",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Iterative, Normalized, Verified, Estimated, Scaled, Tested",
                isCorrect: false,
              },
            ],
            explanation:
              "INVEST står för Independent (oberoende), Negotiable (förhandlingsbar), Valuable (värdefull), Estimable (uppskattningsbar), Small (lagom stor) och Testable (testbar). Dessa kriterier hjälper till att säkerställa att user stories har rätt kvalitet och granularitet.",
          },
          {
            id: "q4-2",
            question:
              "Vilken dokumentationsstruktur definieras av IEEE 830 för kravspecifikationer?",
            options: [
              { id: "a", text: "En enkel lista med numrerade krav", isCorrect: false },
              {
                id: "b",
                text: "Syfte/scope, övergripande beskrivning, specifika krav (funktionella, icke-funktionella, gränssnitt) och bilagor",
                isCorrect: true,
              },
              { id: "c", text: "Sammanfattning, bakgrund och kravlista", isCorrect: false },
              { id: "d", text: "Gantt-schema med krav kopplade till milstolpar", isCorrect: false },
            ],
            explanation:
              "IEEE 830 definierar en referensstruktur som inkluderar: syfte och scope, övergripande beskrivning (produktperspektiv, produktfunktioner, användare, begränsningar), specifika krav (funktionella, icke-funktionella, gränssnittskrav) och bilagor.",
          },
          {
            id: "q4-3",
            question:
              "Enligt Volere-mallen, hur många sektioner bör en komplett kravspecifikation ha?",
            options: [
              { id: "a", text: "5 sektioner", isCorrect: false },
              { id: "b", text: "12 sektioner", isCorrect: false },
              { id: "c", text: "27 sektioner", isCorrect: true },
              { id: "d", text: "50 sektioner", isCorrect: false },
            ],
            explanation:
              "Volere-mallen, utvecklad av James och Suzanne Robertson, innehåller 27 sektioner som systematiskt täcker allt från projektdrivkrafter och intressentanalys till funktionella krav, icke-funktionella krav och underhållskrav.",
          },
          {
            id: "q4-4",
            question:
              "Enligt Chris Rupps naturliga språkmönster för krav, vilken struktur bör ett testbart krav ha?",
            options: [
              { id: "a", text: "[Roll] vill [funktion] så att [nytta]", isCorrect: false },
              {
                id: "b",
                text: "[System] SKA [process verb] [objekt] [kvalificering]",
                isCorrect: true,
              },
              { id: "c", text: "[Krav-ID]: [Beskrivning]", isCorrect: false },
              { id: "d", text: "Givet [villkor] När [händelse] Då [resultat]", isCorrect: false },
            ],
            explanation:
              "Chris Rupp rekommenderar mönstret '[System] SKA [process verb] [objekt] [kvalificering]' — t.ex. 'Ärendehanteringssystemet SKA generera statistikrapporter filtrerade per handläggare med en svarstid under 5 sekunder.' Svarsalternativ D (Given-When-Then) är ett acceptanskriterieformat, inte ett kravformat.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 5 — Kravspårbarhet och ändringshantering                    */
    /* ================================================================== */
    {
      id: "kravhantering-5",
      title: "Kravspårbarhet och ändringshantering",
      theory: {
        content: [
          "Kravspårbarhet (requirements traceability) är förmågan att följa ett krav genom hela dess livscykel — från det ursprungliga behovet det grundar sig på, genom specifikation och design, till implementation, testning och slutligen drift. IEEE 29148 definierar spårbarhet som en av de fundamentala egenskaperna hos krav och kräver att varje krav ska kunna spåras både framåt (forward tracing) och bakåt (backward tracing). Bakåtspårbarhet svarar på frågan 'varför finns detta krav?' genom att visa kopplingen till behov och intressent. Framåtspårbarhet svarar på frågan 'hur verifieras detta krav?' genom att visa kopplingen till utvärderingskriterier, testfall och acceptansprov.",

          "Det primära verktyget för att hantera spårbarhet är spårbarhetsmatrisen (Requirements Traceability Matrix, RTM). En RTM är en tabell som mappar relationer mellan krav och andra artefakter: behov, designbeslut, testfall, verifieringsresultat. I en upphandlingskontext kan spårbarhetskedjan beskrivas som Behov → Krav → Utvärderingskriterium → Anbudssvar → Poäng → Tilldelningsbeslut. Denna kedja säkerställer att varje steg i utvärderingen kan motiveras och spåras tillbaka till ett verksamhetsbehov. Om en leverantör överklagar tilldelningsbeslutet kan du med en komplett RTM visa exakt hur varje poäng har tilldelats baserat på objektiva kriterier kopplade till dokumenterade behov.",

          "Ändringshantering (change management) i kravkontext handlar om att hantera förändringar i kravbilden på ett kontrollerat och dokumenterat sätt. Principer från konfigurationshantering (configuration management) är direkt tillämpbara: varje kravändring bör ha en unik identitet, en motivering, en konsekvensanalys (impact analysis), ett godkännande och en historik. I offentlig upphandling är ändringshantering särskilt kritisk: kravändringar efter annonsering kan kräva ny annonsering enligt LOU om ändringen är väsentlig och påverkar vilka leverantörer som kan delta eller hur anbud utvärderas.",

          "Konsekvensanalys (impact analysis) är nyckeln till kontrollerad ändringshantering. När ett krav behöver ändras måste du analysera vilka andra krav, kriterier och artefakter som påverkas. Spårbarhetsmatrisen gör denna analys möjlig genom att visa alla beroenden. En ändring i ett funktionellt krav kan påverka relaterade icke-funktionella krav, utvärderingskriterier, testfall och kostnadsberäkningar. Utan spårbarhet blir konsekvensanalysen en gissningslek med hög risk för att missa beroenden. Best practice är att implementera en formell ändringsprocess (Change Control Board) med tydliga roller och ansvar för att godkänna eller avvisa ändringar.",
        ],
        keyPoints: [
          "Spårbarhet: bakåt (varför finns kravet?) och framåt (hur verifieras det?)",
          "Spårbarhetskedjan: Behov → Krav → Kriterium → Anbudssvar → Poäng → Tilldelning",
          "Requirements Traceability Matrix (RTM) mappar relationer mellan alla artefakter",
          "Kravändringar efter annonsering kan kräva ny annonsering enligt LOU",
          "Konsekvensanalys (impact analysis) kräver komplett spårbarhetsmatris",
          "Formell ändringsprocess (Change Control Board) för kontrollerad hantering",
        ],
      },
      scenario: {
        id: "scenario-krav-5",
        title: "Kravet som ändrades för sent",
        context:
          "Din kommun har annonserat en upphandling av ett nytt ekonomisystem. Tre veckor efter annonsering, under frågeperioden, upptäcker ekonomichefen att ett centralt funktionellt krav saknas — systemet måste kunna hantera EU-rapportering enligt en ny förordning som träder i kraft om sex månader.",
        steps: [
          {
            situation:
              "Ekonomichefen kräver att kravet läggs till omedelbart. Upphandlaren påpekar att ändringar efter annonsering är problematiska. Det saknade kravet skulle klassas som ett SKA-krav.",
            question: "Hur hanterar du situationen?",
            choices: [
              {
                id: "1a",
                text: "Jag lägger till kravet och publicerar en rättelse — det är ju ett viktigt krav.",
                isOptimal: false,
                feedback:
                  "Att lägga till ett nytt SKA-krav efter annonsering kan utgöra en väsentlig ändring som påverkar vilka leverantörer som kan delta. Enligt LOU kan detta kräva ny annonsering, vilket försenar processen ytterligare.",
              },
              {
                id: "2b",
                text: "Jag gör en konsekvensanalys: bedömer om kravet är väsentligt (ändrar upphandlingens karaktär), kontrollerar om det påverkar vilka leverantörer som kan delta, och diskuterar med upphandlaren om ny annonsering krävs eller om det kan hanteras som ett förtydligande.",
                isOptimal: true,
                feedback:
                  "Korrekt approach. En konsekvensanalys avgör om ändringen är väsentlig enligt LOU. Om kravet väsentligt ändrar upphandlingens art bör ny annonsering övervägas. Om det kan formuleras som ett förtydligande av befintliga krav kan det eventuellt hanteras inom ramen för fråge-svar-processen.",
              },
              {
                id: "1c",
                text: "Jag avbryter upphandlingen och startar om från scratch.",
                isOptimal: false,
                feedback:
                  "Att avbryta upphandlingen är en drastisk åtgärd som bör vara sista utvägen. En konsekvensanalys kan visa att det finns mindre ingripande lösningar, som ny annonsering med utökad kravspecifikation eller att hantera EU-rapportering i en separat upphandling.",
              },
            ],
          },
          {
            situation:
              "Konsekvensanalysen visar att tillägg av EU-rapporteringskravet är en väsentlig ändring. Ni beslutar att göra ny annonsering med förlängd anbudstid. Ekonomichefen undrar: 'Hade detta kunnat undvikas?'",
            question: "Vad svarar du?",
            choices: [
              {
                id: "2a",
                text: "Nej, nya regelverk kan man aldrig förutse.",
                isOptimal: false,
                feedback:
                  "EU-förordningen var känd sedan tidigare — den hade kunnat identifieras i behovsanalysen genom en systematisk omvärldsbevakning och intressentinvolvering av ekonomiavdelningen.",
              },
              {
                id: "2b",
                text: "Ja, med en komplett spårbarhetsmatris och systematisk intressentinvolvering hade vi fångat behovet tidigt. Behovsanalysen borde ha inkluderat en omvärldsbevakning av kommande regelverk.",
                isOptimal: true,
                feedback:
                  "Korrekt. En komplett spårbarhetsmatris hade visat att ekonomiavdelningens behov inte var fullt kartlagda. Systematisk intressenthantering med power/interest-matrisen hade identifierat ekonomichefen som nyckelintressent med hög makt och högt intresse.",
              },
              {
                id: "2c",
                text: "Ja, om vi hade skrivit fler krav från början hade vi täckt detta.",
                isOptimal: false,
                feedback:
                  "Problemet var inte att det saknades krav — problemet var att behovsanalysen inte var tillräckligt grundlig. Fler krav utan bättre behovsanalys hade inte löst problemet.",
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
            "Som beställare är spårbarhet ditt viktigaste skydd mot otydlighet och godtycke. Genom att kunna spåra varje krav tillbaka till ett dokumenterat behov säkerställer du att kravspecifikationen verkligen representerar verksamhetens intressen. Vid ändringsförfrågningar efter annonsering är det du som måste bedöma om det nya behovet är tillräckligt viktigt för att motivera en fördröjning av upphandlingen.",
          keyActions: [
            "Kräva att en spårbarhetsmatris upprättas och underhålls genom hela processen",
            "Verifiera att varje krav kan spåras till ett dokumenterat behov med namngiven källa",
            "Delta i konsekvensanalyser vid ändringsförfrågningar — bedöm verksamhetspåverkan",
            "Säkerställa att ändringar i kravbilden förankras i styrgruppen innan de genomförs",
          ],
          pitfalls: [
            "Att inte upprätthålla spårbarhetsmatrisen efter att den skapats — den blir snabbt inaktuell",
            "Att driva igenom kravändringar efter annonsering utan att förstå LOU-konsekvenserna",
            "Att inte ha en formell ändringsprocess — ad hoc-ändringar skapar kaos",
            "Att glömma att uppdatera alla beroende artefakter vid en kravändring",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare är spårbarhetsmatrisen ditt viktigaste juridiska skydd. Vid överprövning ska du kunna visa en komplett kedja: behov → krav → kriterium → poäng → beslut. Utan denna kedja är det svårt att motivera att utvärderingen varit objektiv och proportionerlig. Ändringshantering efter annonsering är ditt ansvar — du måste bedöma om en ändring är väsentlig enligt LOU.",
          keyActions: [
            "Upprätta och underhålla en komplett spårbarhetsmatris (RTM) genom hela upphandlingen",
            "Bedöma om kravändringar efter annonsering är väsentliga enligt LOU:s praxis",
            "Dokumentera alla ändringar med motivering, konsekvensanalys och godkännande",
            "Säkerställa att spårbarhetskedjan är komplett vid tilldelningsbeslut",
          ],
          pitfalls: [
            "Att sakna spårbarhetsmatris vid överprövning — omöjliggör försvar av utvärderingen",
            "Att göra väsentliga ändringar efter annonsering utan ny annonsering",
            "Att inte dokumentera varför en ändring bedömdes som icke-väsentlig",
            "Att missa beroenden vid konsekvensanalys — en ändring kan påverka fler krav än man tror",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare bidrar du med teknisk konsekvensanalys vid kravändringar. Du förstår hur en ändring i ett krav kan kaskadeffektera genom integrationskrav, prestandakrav och driftkrav. Din kunskap om det befintliga systemlandskapet är avgörande för att bedöma genomförbarheten av föreslagna ändringar. Du bör också bidra till framåtspårbarheten genom att koppla krav till tekniska verifieringsmetoder.",
          keyActions: [
            "Genomföra teknisk konsekvensanalys vid ändringsförfrågningar — identifiera kaskadeffekter",
            "Koppla tekniska krav till verifieringsmetoder (demo, test, inspektion, analys)",
            "Underhålla tekniska beroenden i spårbarhetsmatrisen",
            "Bidra med kunskap om migreringsrisker och integrationspåverkan vid kravändringar",
          ],
          pitfalls: [
            "Att underskatta kaskadeffekter — en ändring i ett gränssnittskrav kan påverka hela integrationskedjan",
            "Att inte dokumentera tekniska beroenden i spårbarhetsmatrisen",
            "Att sakna teknisk verifieringsplan för varje krav — hur ska uppfyllnad kontrolleras?",
            "Att inte flagga för tekniska risker vid sena kravändringar",
          ],
        },
      ],
      reflection: {
        question:
          "Kan du spåra alla krav i din senaste upphandling tillbaka till dokumenterade behov? Vilka delar av spårbarhetskedjan (Behov → Krav → Kriterium → Poäng → Beslut) saknas oftast i din organisation?",
      },
      quiz: {
        questions: [
          {
            id: "q5-1",
            question:
              "Vad innebär 'backward tracing' (bakåtspårbarhet) i kravhantering?",
            options: [
              {
                id: "a",
                text: "Att spåra ett krav framåt till testfall och verifiering",
                isCorrect: false,
              },
              {
                id: "b",
                text: "Att spåra ett krav bakåt till det ursprungliga behovet och intressenten",
                isCorrect: true,
              },
              {
                id: "c",
                text: "Att ta bort krav som inte längre är relevanta",
                isCorrect: false,
              },
              {
                id: "d",
                text: "Att versionshantera kravspecifikationen",
                isCorrect: false,
              },
            ],
            explanation:
              "Bakåtspårbarhet (backward tracing) innebär att varje krav kan spåras tillbaka till det behov det grundar sig på och den intressent som uttryckt behovet. Det svarar på frågan 'varför finns detta krav?'.",
          },
          {
            id: "q5-2",
            question:
              "Vad är en Requirements Traceability Matrix (RTM)?",
            options: [
              { id: "a", text: "En prioriteringsmodell för krav", isCorrect: false },
              {
                id: "b",
                text: "En tabell som mappar relationer mellan krav och andra artefakter (behov, testfall, verifiering)",
                isCorrect: true,
              },
              { id: "c", text: "En mall för kravspecifikationer", isCorrect: false },
              { id: "d", text: "En metod för att estimera projektkostnader", isCorrect: false },
            ],
            explanation:
              "En Requirements Traceability Matrix (RTM) är en tabell som mappar relationer mellan krav och andra artefakter som behov, designbeslut, testfall och verifieringsresultat. Den möjliggör både framåt- och bakåtspårbarhet.",
          },
          {
            id: "q5-3",
            question:
              "Enligt LOU, vad kan bli konsekvensen av att lägga till ett väsentligt nytt SKA-krav efter annonsering?",
            options: [
              { id: "a", text: "Inget — krav kan alltid läggas till under frågeperioden", isCorrect: false },
              {
                id: "b",
                text: "Det kan kräva ny annonsering eftersom ändringen är väsentlig och påverkar vilka leverantörer som kan delta",
                isCorrect: true,
              },
              { id: "c", text: "Leverantörerna får automatiskt förlängd anbudstid", isCorrect: false },
              { id: "d", text: "Upphandlingen måste alltid avbrytas helt", isCorrect: false },
            ],
            explanation:
              "Enligt LOU kan en väsentlig ändring av upphandlingsdokumenten efter annonsering kräva ny annonsering. En ändring är väsentlig om den påverkar upphandlingens art eller vilka leverantörer som kan delta. Att lägga till ett nytt SKA-krav är typiskt en sådan väsentlig ändring.",
          },
          {
            id: "q5-4",
            question:
              "Vad är syftet med en konsekvensanalys (impact analysis) vid kravändringar?",
            options: [
              { id: "a", text: "Att beräkna den nya projektkostnaden", isCorrect: false },
              { id: "b", text: "Att hitta den billigaste lösningen", isCorrect: false },
              {
                id: "c",
                text: "Att analysera vilka andra krav, kriterier och artefakter som påverkas av ändringen",
                isCorrect: true,
              },
              { id: "d", text: "Att avgöra om projektet ska avbrytas", isCorrect: false },
            ],
            explanation:
              "En konsekvensanalys (impact analysis) identifierar alla beroenden som påverkas av en kravändring: andra krav, utvärderingskriterier, testfall, kostnadsberäkningar och tidplaner. Utan spårbarhetsmatris är en tillförlitlig konsekvensanalys omöjlig.",
          },
        ],
        passingScore: 3,
      },
    },

    /* ================================================================== */
    /*  Modul 6 — Verifiering och validering av krav                      */
    /* ================================================================== */
    {
      id: "kravhantering-6",
      title: "Verifiering och validering av krav",
      theory: {
        content: [
          "Verifiering och validering (V&V) av krav är två distinkt olika aktiviteter som ofta blandas ihop. Verifiering svarar på frågan 'bygger vi produkten rätt?' — dvs. är kraven korrekt formulerade, konsekventa, testbara och genomförbara? Validering svarar på frågan 'bygger vi rätt produkt?' — dvs. löser kraven verksamhetens faktiska problem? V-modellen (Verification and Validation model) illustrerar denna distinktion genom att koppla varje utvecklingsfas till en motsvarande verifieringsfas: kravspecifikation kopplas till acceptanstest, systemdesign till systemtest, detaljdesign till integrationstest och implementation till enhetstest. I upphandlingskontext innebär detta att verifiering sker i tre nivåer: vid anbudsgrankning, vid leveranstest och i drift.",

          "Kravgranskningar (requirements reviews) är den viktigaste verifieringsmetoden i kravfasen. Fagan-inspektioner, uppkallade efter Michael Fagan som utvecklade metoden på IBM på 1970-talet, är en formell granskningsmetod med definierade roller: moderator (leder granskningen), författare (förklarar kraven), inspektörer (granskar) och protokollförare (dokumenterar). Forskning visar att formella granskningar är den mest kostnadseffektiva metoden för att hitta fel i krav — betydligt effektivare än att förlita sig på testning i senare faser. I upphandlingssammanhang bör kravgranskningen involvera personer med flera perspektiv: verksamhetsföreträdare (validering — är det rätt krav?), upphandlare (proportionalitet och juridik), IT-arkitekt (teknisk genomförbarhet) och ekonom (kostnadspåverkan).",

          "Prototyping är en kraftfull valideringsteknik som gör abstrakta krav konkreta och gripbara för intressenter. Genom att visa en interaktiv prototyp — oavsett om det är en pappersprototyp, wireframe eller klickbar mockup — kan intressenter identifiera missade krav, felaktiga antaganden och användbarhetsproblem innan upphandlingen annonseras. I offentlig upphandling kan prototyper användas i behovsanalysfasen och som kommunikationsverktyg, men de får inte utformas så att de favoriserar en specifik leverantörs lösning. Prototyper bör ses som ett valideringsverktyg — de svarar på frågan 'är detta verkligen vad vi behöver?'",

          "Acceptanskriterier är den konkreta länken mellan krav och verifiering. Varje krav bör ha definierade acceptanskriterier som beskriver hur uppfyllnad verifieras. I upphandlingskontext behövs ofta tre nivåer av acceptanskriterier: anbudskriterier (hur bedöms kravet vid anbudsutdvärdering — t.ex. genom beskrivning, demo eller referens), leveranskriterier (hur verifieras kravet vid leverans — t.ex. genom funktionstest, prestandatest eller inspektion) och driftskriterier (hur följs kravet upp i drift — t.ex. genom SLA-mätning, användarnöjdhetsundersökning eller revisionsrapport). Mönstret Given-When-Then (Givet att... När... Då...) från Behaviour-Driven Development (BDD) är ett utmärkt format för att formulera testbara acceptanskriterier som är begripliga för både verksamheten och leverantören.",
        ],
        keyPoints: [
          "Verifiering = rätt formulerade krav ('bygger vi produkten rätt?')",
          "Validering = rätt krav ('bygger vi rätt produkt?')",
          "V-modellen kopplar kravspecifikation till acceptanstest, design till systemtest",
          "Fagan-inspektioner är den mest kostnadseffektiva metoden för att hitta kravfel",
          "Tre nivåer av acceptanskriterier: anbudsverifiering, leveranstest, driftsuppföljning",
          "Given-When-Then (BDD) ger testbara acceptanskriterier begripliga för alla",
          "Prototyping validerar krav genom att göra abstrakta krav konkreta för intressenter",
        ],
      },
      scenario: {
        id: "scenario-krav-6",
        title: "Leveransen som inte stämde",
        context:
          "Din kommun har nyligen tagit emot en leverans av ett nytt dokumenthanteringssystem. Vid leveranstestet visar det sig att flera krav tolkas olika av kommunen och leverantören. Tre av fem kritiska SKA-krav är omtvistade.",
        steps: [
          {
            situation:
              "Leverantören hävdar att de uppfyller kravet 'Systemet SKA ha god sökfunktionalitet' genom att erbjuda en enkel textsökning. Kommunen förväntade sig avancerad sökning med filter, facettnavigering och relevansrankning.",
            question: "Vem har rätt, och vad borde gjorts annorlunda?",
            choices: [
              {
                id: "1a",
                text: "Leverantören har rätt — 'god sökfunktionalitet' är subjektivt och kan inte bedömas objektivt.",
                isOptimal: false,
                feedback:
                  "Leverantören har en poäng: kravet är inte testbart enligt IEEE 29148. Men situationen hade kunnat undvikas helt genom att formulera kravet med specifika, mätbara acceptanskriterier redan i kravspecifikationen.",
              },
              {
                id: "1b",
                text: "Felet ligger i kravformuleringen — kravet borde haft specifika acceptanskriterier, t.ex. 'Systemet SKA erbjuda fritextsökning med filteralternativ för dokumenttyp, datum och författare, med sökresultat presenterade med relevansrankning.'",
                isOptimal: true,
                feedback:
                  "Korrekt analys. Grundproblemet är att kravet inte uppfyller IEEE 29148:s krav på testbarhet och entydighet. Med Given-When-Then-acceptanskriterier hade frågan aldrig uppstått: 'Givet att 1000 dokument finns i systemet, När användaren söker på sökterm, Då presenteras resultaten sorterade efter relevans med filteralternativ för dokumenttyp, datum och författare.'",
              },
              {
                id: "1c",
                text: "Kommunen har rätt — alla vet vad 'god sökfunktionalitet' innebär.",
                isOptimal: false,
                feedback:
                  "Vad 'god sökfunktionalitet' innebär är subjektivt och kan tolkas helt olika av olika aktörer. IEEE 29148 kräver att krav ska vara entydiga (unambiguous) — bara en tolkning ska vara möjlig. Detta krav uppfyller inte det kriteriet.",
              },
            ],
          },
          {
            situation:
              "Ytterligare ett omtvistat krav lyder: 'Systemet SKA ha hög tillgänglighet.' Leverantören erbjuder 95 procent tillgänglighet (drifttid), medan kommunen förväntade sig 99,5 procent.",
            question: "Hur hade detta undvikits och hur löser du det nu?",
            choices: [
              {
                id: "2a",
                text: "Vi accepterar 95 procent — det är trots allt 'hög tillgänglighet'.",
                isOptimal: false,
                feedback:
                  "95 procent tillgänglighet innebär upp till 18 dagars driftstopp per år — knappast 'hög' för ett verksamhetskritiskt system. Utan definierat mätetal i kravet saknas dock grund för att kräva mer.",
              },
              {
                id: "2b",
                text: "Kravet borde formulerats som 'Systemet SKA ha en tillgänglighet på minst 99,5 procent mätt på månadsbasis, exklusive planerat underhåll.' Nu behöver vi förhandla ett SLA med leverantören baserat på det vi faktiskt behöver.",
                isOptimal: true,
                feedback:
                  "Korrekt. Kravet saknade mätbart acceptanskriterium. I framtiden bör tillgänglighetskrav alltid specificera: procentsats, mätperiod, vad som inkluderas/exkluderas och vilka konsekvenser bristande uppfyllnad får (SLA-viten). Nu krävs en pragmatisk förhandling om SLA-nivåer.",
              },
              {
                id: "2c",
                text: "Vi häver kontraktet och gör en ny upphandling med bättre krav.",
                isOptimal: false,
                feedback:
                  "Att häva ett kontrakt på grund av otydliga krav som kommunen själv formulerat är problematiskt juridiskt. Förhandling om SLA-tillägg är en mer proportionerlig åtgärd. Lärdomen bör dock tas med till nästa upphandling.",
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
            "Som beställare ansvarar du för valideringen — att kraven löser verksamhetens faktiska problem. Du bör delta i kravgranskningar med fokus på att kontrollera att kraven täcker alla verksamhetsbehov och att acceptanskriterierna är begripliga för slutanvändarna. Prototyping är ett kraftfullt valideringsverktyg som du bör initiera: genom att visa intressenter en prototyp kan ni validera att kraven faktiskt representerar det verksamheten behöver innan upphandlingen annonseras.",
          keyActions: [
            "Delta i kravgranskningar med fokus på validering — löser kraven verksamhetens problem?",
            "Initiera prototyping i behovsfasen för att validera kravbilden med slutanvändare",
            "Granska acceptanskriterier — är de begripliga och verifierbara för verksamheten?",
            "Planera för leveransacceptans — hur verifierar ni att leveransen uppfyller kraven?",
          ],
          pitfalls: [
            "Att inte delta i kravgranskningar och istället delegera allt till IT och upphandlare",
            "Att godkänna krav utan att förstå hur de ska verifieras vid leverans",
            "Att inte planera för leveranstester — verifiering måste planeras redan i kravfasen",
            "Att inte använda prototyper för att validera kravbilden med slutanvändare",
          ],
        },
        {
          role: "UPPHANDLARE",
          perspective:
            "Som upphandlare fokuserar du på verifiering — att kraven är korrekt formulerade och möjliga att utvärdera objektivt. Du bör granska varje krav mot IEEE 29148:s kriterier och säkerställa att acceptanskriterierna möjliggör en rättvis och transparent utvärdering. Fagan-inspektionsmetoden, anpassad för upphandlingskontext, ger en strukturerad process för kravgranskning med dokumenterade resultat.",
          keyActions: [
            "Organisera formella kravgranskningar med inspektörer från flera kompetensområden",
            "Verifiera att varje SKA-krav har entydiga acceptanskriterier som möjliggör ja/nej-bedömning",
            "Kontrollera att BÖR-krav har utvärderingskriterier och poängmodell",
            "Dokumentera granskningsresultat och säkerställa att identifierade brister åtgärdas",
          ],
          pitfalls: [
            "Att förlita sig på informell granskning istället för strukturerad inspektion",
            "Att acceptera krav med vaga acceptanskriterier — dessa skapar problem vid utvärdering",
            "Att inte testa specifikationen ur ett leverantörsperspektiv — kan en leverantör verkligen svara?",
            "Att inte följa upp att granskningskommentarer faktiskt har åtgärdats",
          ],
        },
        {
          role: "SYSTEMAGARE",
          perspective:
            "Som systemägare har du en central roll i verifiering av tekniska krav. Du ska säkerställa att icke-funktionella krav har mätbara acceptanskriterier, att integrationskrav kan testas och att prestandakrav har definierade testförutsättningar. V-modellens koppling mellan kravnivå och testnivå bör guida din planering av teknisk verifiering. Du bör också bidra till att definiera leveranstest och driftsuppföljningskriterier.",
          keyActions: [
            "Definiera tekniska verifieringsmetoder för varje icke-funktionellt krav (demo, test, inspektion, analys)",
            "Planera leveranstester med definierade testfall, testdata och acceptanskriterier",
            "Etablera SLA-mätning för driftsuppföljning av kritiska krav (tillgänglighet, prestanda, säkerhet)",
            "Granska krav för teknisk genomförbarhet — kan kraven faktiskt testas med tillgängliga resurser?",
          ],
          pitfalls: [
            "Att inte definiera verifieringsmetod för tekniska krav förrän vid leverans — då är det för sent",
            "Att sakna testmiljö och testdata för leveransverifiering",
            "Att inte etablera SLA-baserad driftsuppföljning — krav som inte mäts uppfylls sällan",
            "Att underskatta behovet av prestandatester med realistisk data och belastning",
          ],
        },
      ],
      reflection: {
        question:
          "Hur verifierar ni idag att leverantören faktiskt uppfyller de krav som ställdes i upphandlingen? Vilken av de tre nivåerna (anbudsverifiering, leveranstest, driftsuppföljning) är svagast i er organisation, och vad skulle Given-When-Then-acceptanskriterier kunna förbättra?",
      },
      quiz: {
        questions: [
          {
            id: "q6-1",
            question:
              "Vad är den fundamentala skillnaden mellan verifiering och validering av krav?",
            options: [
              { id: "a", text: "Verifiering görs av IT, validering görs av verksamheten", isCorrect: false },
              {
                id: "b",
                text: "Verifiering kontrollerar att kraven är rätt formulerade, validering kontrollerar att det är rätt krav",
                isCorrect: true,
              },
              { id: "c", text: "Verifiering sker före leverans, validering sker efter", isCorrect: false },
              { id: "d", text: "Det finns ingen skillnad — begreppen är synonyma", isCorrect: false },
            ],
            explanation:
              "Verifiering ('bygger vi produkten rätt?') kontrollerar att kraven är korrekt formulerade, konsekventa och testbara. Validering ('bygger vi rätt produkt?') kontrollerar att kraven löser verksamhetens faktiska problem. Båda är nödvändiga för kravkvalitet.",
          },
          {
            id: "q6-2",
            question:
              "Vem utvecklade den formella granskningsmetoden som kallas Fagan-inspektion?",
            options: [
              { id: "a", text: "Klaus Pohl", isCorrect: false },
              { id: "b", text: "Michael Fagan på IBM", isCorrect: true },
              { id: "c", text: "James Robertson", isCorrect: false },
              { id: "d", text: "Alistair Cockburn", isCorrect: false },
            ],
            explanation:
              "Michael Fagan utvecklade den formella inspektionsmetoden (Fagan Inspection) på IBM på 1970-talet. Metoden har definierade roller (moderator, författare, inspektörer, protokollförare) och har visat sig vara den mest kostnadseffektiva metoden för att hitta fel i krav och kod.",
          },
          {
            id: "q6-3",
            question:
              "I V-modellen, vilken testnivå kopplas direkt till kravspecifikationen?",
            options: [
              { id: "a", text: "Enhetstest", isCorrect: false },
              { id: "b", text: "Integrationstest", isCorrect: false },
              { id: "c", text: "Systemtest", isCorrect: false },
              { id: "d", text: "Acceptanstest", isCorrect: true },
            ],
            explanation:
              "I V-modellen kopplas kravspecifikationen (vänstra sidan) direkt till acceptanstest (högra sidan). Systemdesign kopplas till systemtest, detaljdesign till integrationstest och implementation till enhetstest. Denna koppling säkerställer att varje kravnivå verifieras.",
          },
          {
            id: "q6-4",
            question:
              "Vad är formatet för acceptanskriterier i Given-When-Then-mönstret (BDD)?",
            options: [
              { id: "a", text: "Om [villkor] Och [villkor] Resultat [utfall]", isCorrect: false },
              { id: "b", text: "Input [data] Process [steg] Output [resultat]", isCorrect: false },
              {
                id: "c",
                text: "Givet att [förutsättning] När [händelse/åtgärd] Då [förväntat resultat]",
                isCorrect: true,
              },
              { id: "d", text: "Före [tillstånd] Under [test] Efter [tillstånd]", isCorrect: false },
            ],
            explanation:
              "Given-When-Then (Givet-När-Då) från Behaviour-Driven Development (BDD) beskriver: Givet att (förutsättningar/kontext), När (händelse/åtgärd), Då (förväntat resultat). Detta format ger testbara acceptanskriterier som är begripliga för både verksamhet och leverantör.",
          },
          {
            id: "q6-5",
            question:
              "Vilka tre nivåer av acceptanskriterier bör finnas för krav i en offentlig upphandling?",
            options: [
              { id: "a", text: "Enkel, medel och avancerad", isCorrect: false },
              { id: "b", text: "Funktionell, teknisk och juridisk", isCorrect: false },
              {
                id: "c",
                text: "Anbudsverifiering, leveranstest och driftsuppföljning",
                isCorrect: true,
              },
              { id: "d", text: "Intern granskning, extern revision och tredjepartscertifiering", isCorrect: false },
            ],
            explanation:
              "I upphandlingskontext behövs tre nivåer: anbudsverifiering (hur bedöms kravet vid utvärdering — beskrivning, demo, referens), leveranstest (hur verifieras vid leverans — funktionstest, prestandatest) och driftsuppföljning (hur följs upp i drift — SLA-mätning, användarnöjdhet).",
          },
        ],
        passingScore: 3,
      },
    },
  ],
};

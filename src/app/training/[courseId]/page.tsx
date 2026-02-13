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
      "Grunderna i Lagen om offentlig upphandling \u2014 tr\u00f6skelv\u00e4rden, f\u00f6rfaranden, annonsering, utv\u00e4rdering och tilldelning.",
    level: "Grundl\u00e4ggande",
    modules: [
      {
        title: "Introduktion till LOU",
        content: [
          "Lagen om offentlig upphandling (LOU 2016:1145) reglerar hur myndigheter och andra offentliga organ k\u00f6per varor, tj\u00e4nster och byggentreprenader. Syftet \u00e4r att s\u00e4kerst\u00e4lla konkurrens, likabehandling och transparens.",
          "LOU bygger p\u00e5 EU:s upphandlingsdirektiv (2014/24/EU) och g\u00e4ller f\u00f6r alla upphandlande myndigheter \u2014 kommuner, regioner, statliga myndigheter och offentligt styrda organ.",
          "De fem grundprinciperna \u00e4r: icke-diskriminering, likabehandling, proportionalitet, \u00f6msesidigt erk\u00e4nnande och \u00f6ppenhet.",
        ],
        keyTakeaway:
          "LOU s\u00e4kerst\u00e4ller att skattemedel anv\u00e4nds effektivt genom \u00f6ppen konkurrens.",
      },
      {
        title: "Tr\u00f6skelv\u00e4rden och ber\u00e4kning",
        content: [
          "Tr\u00f6skelv\u00e4rdena avg\u00f6r vilka regler som g\u00e4ller. \u00d6ver EU-tr\u00f6skelv\u00e4rdet g\u00e4ller direktivstyrd upphandling; under g\u00e4ller f\u00f6renklat f\u00f6rfarande.",
          "F\u00f6r varor och tj\u00e4nster ligger EU-tr\u00f6skeln runt 2,3 MSEK (2024), f\u00f6r byggentreprenader ca 58 MSEK. V\u00e4rdena uppdateras vartannat \u00e5r.",
          "Ber\u00e4kning: Uppskattat kontraktsv\u00e4rde exklusive moms \u00f6ver hela avtalstiden inklusive optioner. Uppdelning f\u00f6r att undvika tr\u00f6skeln \u00e4r f\u00f6rbjuden.",
        ],
        keyTakeaway:
          "Kontraktsv\u00e4rdet best\u00e4mmer regelverket \u2014 \u00f6ver eller under tr\u00f6skeln.",
      },
      {
        title: "Upphandlingsf\u00f6rfaranden",
        content: [
          "\u00d6ppet f\u00f6rfarande: Alla leverant\u00f6rer f\u00e5r l\u00e4mna anbud. Mest anv\u00e4nt, s\u00e4rskilt f\u00f6r tydligt definierade behov.",
          "Selektivt f\u00f6rfarande: Tv\u00e5stegsprocess \u2014 f\u00f6rst kvalificering, sedan anbud fr\u00e5n utvalda. Anv\u00e4nds vid m\u00e5nga potentiella leverant\u00f6rer.",
          "F\u00f6rhandlat f\u00f6rfarande med f\u00f6reg\u00e5ende annonsering: Kr\u00e4ver s\u00e4rskilda sk\u00e4l, exempelvis komplexa behov eller om \u00f6ppet f\u00f6rfarande inte gett giltiga anbud.",
          "Konkurrenspolitisk dialog: F\u00f6r s\u00e4rskilt komplexa projekt d\u00e4r myndigheten beh\u00f6ver dialog f\u00f6r att definiera l\u00f6sningen.",
        ],
        keyTakeaway:
          "Valet av f\u00f6rfarande styrs av behovets komplexitet och kontraktsv\u00e4rdet.",
      },
      {
        title: "Kravst\u00e4llning och upphandlingsdokument",
        content: [
          "Kravspecifikationen \u00e4r upphandlingens ryggrad. Den definierar obligatoriska krav (ska-krav) och utv\u00e4rderingsbara krav (b\u00f6r-krav/tilldelningskriterier).",
          "Ska-krav \u00e4r absoluta \u2014 anbud som inte uppfyller dem f\u00f6rkastas. B\u00f6r-krav p\u00e5verkar po\u00e4ngs\u00e4ttningen.",
          "Krav ska vara proportionella, icke-diskriminerande och m\u00f6jliga att verifiera. Undvik produktspecifika krav \u2014 anv\u00e4nd funktionskrav.",
        ],
        keyTakeaway:
          "Tydliga, proportionella krav \u00e4r grunden f\u00f6r en lyckad upphandling.",
      },
      {
        title: "Annonsering och tidfrister",
        content: [
          "\u00d6ver EU-tr\u00f6skeln annonseras i TED (Tenders Electronic Daily). Under tr\u00f6skeln annonseras i nationella databaser.",
          "Tidsfrister varierar per f\u00f6rfarande: \u00d6ppet \u2014 minst 30 dagar (EU), 22 dagar med f\u00f6rhandsannonsering. Selektivt \u2014 30 dagar f\u00f6r anb\u00e5kan, 25 dagar f\u00f6r anbud.",
          "Elektronisk annonsering \u00e4r obligatorisk. Alla leverant\u00f6rer ska kunna ta del av upphandlingsdokumenten kostnadsfritt.",
        ],
        keyTakeaway:
          "Annonsering s\u00e4kerst\u00e4ller transparens och r\u00e4ckvidd till potentiella leverant\u00f6rer.",
      },
      {
        title: "Utv\u00e4rdering och tilldelning",
        content: [
          "Tre tilldelningsgrunder: b\u00e4sta f\u00f6rh\u00e5llandet mellan pris och kvalitet, kostnad (livscykelkostnad), eller l\u00e4gsta pris.",
          "Utv\u00e4rderingsmodeller: po\u00e4ngmodell (viktad summa), prisavdragsmodell (merv\u00e4rde minskar pris), eller fastprismodell (b\u00e4st kvalitet vid givet pris).",
          "Alla tilldelningskriterier ska vara transparenta, viktade och m\u00f6jliga att verifiera. De ska ha koppling till upphandlingsf\u00f6rem\u00e5let.",
        ],
        keyTakeaway:
          "Utv\u00e4rderingsmodellen m\u00e5ste vara tydlig, transparent och definierad i f\u00f6rv\u00e4g.",
      },
      {
        title: "Tilldelningsbeslut och avtalstecknande",
        content: [
          "N\u00e4r utv\u00e4rderingen \u00e4r klar meddelas tilldelningsbeslutet till alla anbudsgivare. Beslutet ska motiveras.",
          "Avtalssf\u00e4ren (standstill-perioden) \u00e4r minst 10 dagar (15 dagar vid brevmeddelande). Under denna tid kan leverant\u00f6rer \u00f6verpr\u00f6va.",
          "Avtal tecknas efter avtalssf\u00e4ren. Avtalet ska \u00e5terspegla upphandlingsdokumenten \u2014 v\u00e4sentliga \u00e4ndringar \u00e4r inte till\u00e5tna.",
        ],
        keyTakeaway:
          "Standstill-perioden ger leverant\u00f6rer r\u00e4tt att \u00f6verpr\u00f6va beslutet.",
      },
      {
        title: "\u00d6verpr\u00f6vning och uppf\u00f6ljning",
        content: [
          "\u00d6verpr\u00f6vning sker i f\u00f6rvaltningsdomstol. Leverant\u00f6ren m\u00e5ste visa att ett fel har begicks och att det har orsakat skada.",
          "Domstolen kan besluta om r\u00e4ttelse (g\u00f6r om utv\u00e4rderingen) eller att upphandlingen ska g\u00f6ras om helt.",
          "Avtalsuppf\u00f6ljning \u00e4r avgr\u00f6rande: kontrollera att leverant\u00f6ren levererar enligt avtal. Dokumentera avvikelser och hantera dem systematiskt.",
        ],
        keyTakeaway:
          "Uppf\u00f6ljning \u00e4r lika viktig som upphandlingen \u2014 det s\u00e4krar leveransens kvalitet.",
      },
    ],
  },

  kravhantering: {
    id: "kravhantering",
    title: "Kravhantering",
    icon: "ruler",
    description:
      "Fr\u00e5n behov till kravspecifikation \u2014 behovsanalys, funktionella vs icke-funktionella krav, kravsp\u00e5rbarhet och verifiering.",
    level: "Medel",
    modules: [
      {
        title: "Behovsanalys",
        content: [
          "Behovsanalysen \u00e4r grunden f\u00f6r all kravhantering. Den besvarar: Varf\u00f6r beh\u00f6ver vi detta? Vad \u00e4r problemet vi l\u00f6ser?",
          "Anv\u00e4nd intressentanalys f\u00f6r att identifiera alla ber\u00f6rda parter och deras behov. Prioritera behov med MoSCoW (Must, Should, Could, Won\u2019t).",
          "Dokumentera behoven strukturerat med unikt ID, beskrivning, k\u00e4lla (intressent), prioritet och sp\u00e5rbarhet till \u00f6vergripande m\u00e5l.",
        ],
        keyTakeaway:
          "Tydliga, v\u00e4ldokumenterade behov f\u00f6rebygger kravmissf\u00f6rst\u00e5nd.",
      },
      {
        title: "Funktionella krav",
        content: [
          "Funktionella krav beskriver vad systemet/tj\u00e4nsten ska g\u00f6ra. De uttrycks som ber\u00e4ttelser: \u201dSom [roll] vill jag [funktion] s\u00e5 att [nytta].\u201d",
          "Exempel: \u201dSystemet ska kunna hantera minst 500 samtida anv\u00e4ndare.\u201d \u201dAnv\u00e4ndaren ska kunna exportera data i CSV-format.\u201d",
          "Varje funktionellt krav beh\u00f6ver: unikt ID, beskrivning, verifieringsmetod, prioritet (SKA/B\u00d6R) och sp\u00e5rbarhet till behov.",
        ],
        keyTakeaway:
          "Funktionella krav definierar systemets beteende \u2014 g\u00f6r dem testbara.",
      },
      {
        title: "Icke-funktionella krav",
        content: [
          "Icke-funktionella krav (NFR) handlar om hur systemet presterar: prestanda, s\u00e4kerhet, tillg\u00e4nglighet, skalbarhet, underh\u00e5llbarhet.",
          "Anv\u00e4nd ISO 25010 som ramverk f\u00f6r kvalitetsegenskaper. Modellen t\u00e4cker 8 huvudkategorier med underkategorier.",
          "Kvantifiera NFR: \u201dSystemet ska svara inom 2 sekunder vid 95:e percentilen\u201d \u00e4r b\u00e4ttre \u00e4n \u201dSystemet ska vara snabbt.\u201d",
        ],
        keyTakeaway:
          "M\u00e4tbara icke-funktionella krav \u00e4r avg\u00f6rande f\u00f6r upplevd kvalitet.",
      },
      {
        title: "Kravspecifikation",
        content: [
          "Kravspecifikationen samlar alla krav i ett strukturerat dokument. Anv\u00e4nd hierarkisk struktur: Kapitel \u2192 Kravomr\u00e5de \u2192 Enskilt krav.",
          "Varje krav ska vara: entydigt, testbart, sp\u00e5rbart, konsistent med andra krav och genomf\u00f6rbart.",
          "Undvik vaghet: \u201dSystemet ska vara anv\u00e4ndarv\u00e4nligt\u201d \u00e4r d\u00e5ligt. \u201dSystemet ska f\u00f6lja WCAG 2.1 AA\u201d \u00e4r bra.",
        ],
        keyTakeaway:
          "En bra kravspecifikation \u00e4r testbar, sp\u00e5rbar och entydig.",
      },
      {
        title: "Kravsp\u00e5rbarhet",
        content: [
          "Sp\u00e5rbarhet inneb\u00e4r att kunna f\u00f6lja ett krav fr\u00e5n behov, genom specifikation, till implementation och verifiering.",
          "Anv\u00e4nd en sp\u00e5rbarhetsmatris: Behov \u2192 Krav \u2192 Designbeslut \u2192 Testfall. Detta s\u00e4kerst\u00e4ller att inget behov tappas bort.",
          "Sp\u00e5rbarhet hj\u00e4lper vid \u00e4ndringshantering: n\u00e4r ett behov \u00e4ndras kan du sn\u00e4bbt se vilka krav, design och tester som p\u00e5verkas.",
        ],
        keyTakeaway:
          "Sp\u00e5rbarhet s\u00e4kerst\u00e4ller att alla behov t\u00e4cks och att \u00e4ndringar hanteras kontrollerat.",
      },
      {
        title: "Verifiering och validering",
        content: [
          "Verifiering: \u201dByggde vi r\u00e4tt?\u201d \u2014 kontrollerar att leveransen uppfyller kravspecifikationen genom granskning, test eller inspektion.",
          "Validering: \u201dByggde vi r\u00e4tt sak?\u201d \u2014 kontrollerar att leveransen m\u00f6ter det verkliga behovet hos anv\u00e4ndarna.",
          "Skapa testfall som direkt sp\u00e5rar till krav. Varje SKA-krav beh\u00f6ver minst ett testfall. Dokumentera resultat och avvikelser.",
        ],
        keyTakeaway:
          "B\u00e5de verifiering (r\u00e4tt byggt) och validering (r\u00e4tt sak) kr\u00e4vs.",
      },
    ],
  },

  formagabedomning: {
    id: "formagabedomning",
    title: "F\u00f6rm\u00e5gebed\u00f6mning",
    icon: "gauge",
    description:
      "Utv\u00e4rdera f\u00f6rm\u00e5gor inom m\u00e4nniska, teknik och process \u2014 mognadsmodeller, gap-analys, handlingsplaner.",
    level: "Medel",
    modules: [
      {
        title: "Vad \u00e4r f\u00f6rm\u00e5ga?",
        content: [
          "F\u00f6rm\u00e5ga (capability) \u00e4r en organisations samlade kapacitet att leverera ett \u00f6nskat utfall. Den best\u00e5r av tre dimensioner: M\u00e4nniska, Teknik och Process.",
          "M\u00e4nniska: Kompetens, erfarenhet, motivation och organisation. Teknik: Verktyg, system och infrastruktur. Process: Arbetss\u00e4tt, rutiner och styrning.",
          "F\u00f6rm\u00e5gebed\u00f6mning syftar till att identifiera nuvarande niv\u00e5, \u00f6nskad niv\u00e5 och gapet d\u00e4remellan \u2014 f\u00f6r att kunna prioritera insatser.",
        ],
        keyTakeaway:
          "F\u00f6rm\u00e5ga = M\u00e4nniska + Teknik + Process. Alla tre m\u00e5ste bed\u00f6mas.",
      },
      {
        title: "Mognadsmodeller",
        content: [
          "CMM/CMMI (Capability Maturity Model Integration) definierar fem mognadsniv\u00e5er: Initial, Managed, Defined, Quantitatively Managed, Optimizing.",
          "Niv\u00e5 1 (Initial): Ostrukturerat, ad hoc. Niv\u00e5 2 (Managed): Grundl\u00e4ggande styrning. Niv\u00e5 3 (Defined): Standardiserade processer.",
          "Anv\u00e4nd mognadsmodellen som ett kommunikationsverktyg \u2014 inte som ett betyg. Fokus p\u00e5 att identifiera f\u00f6rb\u00e4ttringsomr\u00e5den.",
        ],
        keyTakeaway:
          "Mognadsniv\u00e5er hj\u00e4lper organisationen f\u00f6rst\u00e5 var den st\u00e5r och vart den beh\u00f6ver g\u00e5.",
      },
      {
        title: "Gap-analys",
        content: [
          "Gap-analys j\u00e4mf\u00f6r nuvarande f\u00f6rm\u00e5ga (AS-IS) med \u00f6nskad f\u00f6rm\u00e5ga (TO-BE). Skillnaden \u00e4r gapet som m\u00e5ste \u00f6verbryggas.",
          "F\u00f6r varje f\u00f6rm\u00e5geomr\u00e5de: bed\u00f6m nul\u00e4ge (1\u20135), definiera m\u00e5lniv\u00e5, identifiera gap, estimera insats och prioritera.",
          "Visualisera med spindeldiagram (radar chart) f\u00f6r att tydligg\u00f6ra styrkor och svagheter \u00f6ver alla dimensioner.",
        ],
        keyTakeaway:
          "Gap-analys kvantifierar skillnaden mellan nul\u00e4ge och m\u00e5l.",
      },
      {
        title: "Bed\u00f6mning av m\u00e4nniska",
        content: [
          "Kompetensbed\u00f6mning: Inventera roller, kompetenser och certifieringar. J\u00e4mf\u00f6r med kr\u00e4vd kompetens f\u00f6r m\u00e5lf\u00f6rm\u00e5gan.",
          "Organisationsbed\u00f6mning: \u00c4r ansvar och roller tydliga? Finns r\u00e4tt ledarskap? \u00c4r teamet r\u00e4tt dimensionerat?",
          "Kulturbed\u00f6mning: Finns l\u00e4randekultur? Uppmuntras f\u00f6rb\u00e4ttring? Hur hanteras misstag?",
        ],
        keyTakeaway:
          "M\u00e4nniskan \u00e4r ofta den mest kritiska och mest underskattade dimensionen.",
      },
      {
        title: "Handlingsplan och roadmap",
        content: [
          "Baserat p\u00e5 gap-analysen: skapa en handlingsplan med konkreta \u00e5tg\u00e4rder, ansvariga, tidplan och f\u00f6rv\u00e4ntad effekt.",
          "Prioritera med avseende p\u00e5 aff\u00e4rsnytta vs insats. \u201dQuick wins\u201d (l\u00e5g insats, h\u00f6g nytta) f\u00f6rst, sedan strategiska initiativ.",
          "Skapa en f\u00f6rm\u00e5geroadmap med milstolpar p\u00e5 3, 6 och 12 m\u00e5nader. F\u00f6lj upp kvartalsvis med ny bed\u00f6mning.",
        ],
        keyTakeaway:
          "Handlingsplanen omsätter gap-analysen till konkreta, prioriterade insatser.",
      },
    ],
  },

  systemforvaltning: {
    id: "systemforvaltning",
    title: "Systemf\u00f6rvaltning",
    icon: "server-cog",
    description:
      "Strukturerad IT-f\u00f6rvaltning \u2014 f\u00f6rvaltningsobjekt, roller, budgetering, livscykelhantering och pm3-inspirerat arbetss\u00e4tt.",
    level: "Medel",
    modules: [
      {
        title: "Vad \u00e4r systemf\u00f6rvaltning?",
        content: [
          "Systemf\u00f6rvaltning handlar om att s\u00e4kerst\u00e4lla att IT-system levererar v\u00e4rde \u00f6ver tid \u2014 fr\u00e5n drifts\u00e4ttning till avveckling.",
          "Utan strukturerad f\u00f6rvaltning f\u00f6rf\u00e5lls system: s\u00e4kerhetsbrister, teknisk skuld, missnöjda anv\u00e4ndare och stigande kostnader.",
          "pm3 (Practical Product Management) \u00e4r en svensk f\u00f6rvaltningsmodell som organiserar f\u00f6rvaltning runt f\u00f6rvaltningsobjekt med tydliga roller.",
        ],
        keyTakeaway:
          "Strukturerad f\u00f6rvaltning f\u00f6rl\u00e4nger systemets livsl\u00e4ngd och optimerar v\u00e4rdeleveransen.",
      },
      {
        title: "F\u00f6rvaltningsobjekt",
        content: [
          "Ett f\u00f6rvaltningsobjekt \u00e4r det som f\u00f6rvaltas: ett system, en tj\u00e4nst eller en grupp av relaterade system.",
          "Varje f\u00f6rvaltningsobjekt beh\u00f6ver: en \u00e4gare (verksamhetsansvarig), en f\u00f6rvaltningsledare, budget och en f\u00f6rvaltningsplan.",
          "Avgr\u00e4nsning \u00e4r viktigt: ett f\u00f6rvaltningsobjekt ska vara lagom stort \u2014 \u00f6versk\u00e5dligt men inte trivialt.",
        ],
        keyTakeaway:
          "F\u00f6rvaltningsobjektet \u00e4r den grundl\u00e4ggande enheten \u2014 allt organiseras kring det.",
      },
      {
        title: "Roller och ansvar",
        content: [
          "Objekt\u00e4gare: Verksamhetsansvarig som prioriterar och beslutar. Ansvarar f\u00f6r att objektet levererar aff\u00e4rsnytta.",
          "F\u00f6rvaltningsledare: Operativt ansvarig f\u00f6r den dagliga f\u00f6rvaltningen. Samordnar verksamhet och IT.",
          "F\u00f6rvaltningsgrupp: Tv\u00e4rfunktionellt team med verksamhetskompetens och teknisk kompetens. Arbetar med \u00e4renden, f\u00f6rb\u00e4ttringar och f\u00f6r\u00e4ndringar.",
        ],
        keyTakeaway:
          "Tydliga roller \u00e4r avg\u00f6rande \u2014 s\u00e4rskilt gr\u00e4nssnittet verksamhet/IT.",
      },
      {
        title: "Budget och styrning",
        content: [
          "F\u00f6rvaltningsbudget best\u00e5r av: driftkostnad (basline), vidareutveckling (\u00e4ndringar), och f\u00f6rb\u00e4ttringsarbete.",
          "Anv\u00e4nd \u00e5rshjul: Budgetplanering (Q4), f\u00f6rvaltningsplan (Q1), kvartalsuppf\u00f6ljning, \u00e5rsutvärdering.",
          "Styrning: Nyckeltal (KPI) som anv\u00e4ndarn\u00f6jdhet, tillg\u00e4nglighet, \u00e4rendehanteringstid, andel l\u00f6sta \u00e4renden.",
        ],
        keyTakeaway:
          "Budget och styrning s\u00e4kerst\u00e4ller att f\u00f6rvaltningen \u00e4r ekonomiskt h\u00e5llbar.",
      },
      {
        title: "Livscykelhantering",
        content: [
          "Varje system g\u00e5r genom faser: Anskaffning \u2192 Inffr\u00e5de \u2192 F\u00f6rvaltning \u2192 Vidareutveckling \u2192 Avveckling.",
          "Under f\u00f6rvaltningsfasen: hantera incidenter, genomfr\u00f6 \u00e4ndringar, optimera prestanda och planera f\u00f6r n\u00e4sta fas.",
          "Avvecklingsplanering b\u00f6r starta tidigt \u2014 datamigration, avtal, kunskaps\u00f6verf\u00f6ring och utfasning kr\u00e4ver tid.",
        ],
        keyTakeaway:
          "T\u00e4nk livscykel fr\u00e5n dag ett \u2014 avveckling \u00e4r en del av planen.",
      },
      {
        title: "Kontinuerlig f\u00f6rb\u00e4ttring",
        content: [
          "Anv\u00e4nd PDCA-cykeln (Plan, Do, Check, Act) f\u00f6r systematiskt f\u00f6rb\u00e4ttringsarbete.",
          "Samla in f\u00f6rb\u00e4ttringsf\u00f6rslag fr\u00e5n anv\u00e4ndare, f\u00f6rvaltningsgrupp och ledning. Prioritera med nytta vs kostnad.",
          "M\u00e4t effekt: Definiea basline innan f\u00f6r\u00e4ndring, m\u00e4t efter, och besluta om justering eller fortsatt utrullning.",
        ],
        keyTakeaway:
          "F\u00f6rvaltning \u00e4r inte statisk \u2014 kontinuerlig f\u00f6rb\u00e4ttring \u00e4r kärnan.",
      },
    ],
  },

  "forandringsledning-adkar": {
    id: "forandringsledning-adkar",
    title: "F\u00f6r\u00e4ndringsledning ADKAR",
    icon: "repeat",
    description:
      "Prosci ADKAR-modellen steg f\u00f6r steg \u2014 Awareness, Desire, Knowledge, Ability, Reinforcement \u2014 med praktiska verktyg.",
    level: "Grundl\u00e4ggande",
    modules: [
      {
        title: "Introduktion till ADKAR",
        content: [
          "ADKAR \u00e4r en modell f\u00f6r individuell f\u00f6r\u00e4ndring, utvecklad av Prosci. Den beskriver fem sekventiella steg som varje person m\u00e5ste g\u00e5 igenom.",
          "A = Awareness (medvetenhet om behovet av f\u00f6r\u00e4ndring), D = Desire (\u00f6nskan att delta), K = Knowledge (kunskap om hur), A = Ability (f\u00f6rm\u00e5ga att genomf\u00f6ra), R = Reinforcement (f\u00f6rst\u00e4rkning f\u00f6r att beh\u00e5lla).",
          "Modellens styrka \u00e4r att den fokuserar p\u00e5 individen \u2014 organisationsf\u00f6r\u00e4ndring sker n\u00e4r tillr\u00e4ckligt m\u00e5nga individer f\u00f6r\u00e4ndras.",
        ],
        keyTakeaway:
          "ADKAR fokuserar p\u00e5 individen \u2014 organisationer f\u00f6r\u00e4ndras en person i taget.",
      },
      {
        title: "Awareness \u2014 Medvetenhet",
        content: [
          "Awareness handlar om att f\u00f6rst\u00e5 varf\u00f6r f\u00f6r\u00e4ndringen beh\u00f6vs. Utan f\u00f6rst\u00e5else f\u00f6r \u201dvarf\u00f6r\u201d uppst\u00e5r motst\u00e5nd.",
          "Viktiga aktiviteter: Kommunicera problemet/m\u00f6jligheten, dela data och fakta, f\u00f6rklara konsekvenser av att inte f\u00f6r\u00e4ndra.",
          "Kommunikation b\u00f6r komma fr\u00e5n tv\u00e5 k\u00e4llor: sponsorn (ledningen) f\u00f6r det strategiska \u201dvarf\u00f6r\u201d, och n\u00e4rmaste chef f\u00f6r det personliga \u201dvad inneb\u00e4r det f\u00f6r mig?\u201d.",
        ],
        keyTakeaway:
          "Kommunicera \u201dvarf\u00f6r\u201d innan \u201dvad\u201d \u2014 f\u00f6rst\u00e5else minskar motst\u00e5nd.",
      },
      {
        title: "Desire \u2014 \u00d6nskan",
        content: [
          "Desire \u00e4r den personliga motivationen att delta i f\u00f6r\u00e4ndringen. Den kan inte kommenderas \u2014 den m\u00e5ste v\u00e4xas fram.",
          "Faktorer som p\u00e5verkar: \u201dWhat\u2019s in it for me?\u201d (personlig vinst), f\u00f6rtroende f\u00f6r ledningen, organisationskultur och p\u00e5verkan av kollegor.",
          "Hantera motst\u00e5nd: Lyssna aktivt, adressera oro, involvera ber\u00f6rda tidigt, visa konsekvenser av att inte delta.",
        ],
        keyTakeaway:
          "Du kan inte tvinga motivation \u2014 men du kan skapa f\u00f6ruts\u00e4ttningar f\u00f6r den.",
      },
      {
        title: "Knowledge \u2014 Kunskap",
        content: [
          "Knowledge handlar om att ge individen kunskap om hur f\u00f6r\u00e4ndringen genomf\u00f6rs \u2014 nya processer, verktyg, beteenden.",
          "Utbildningsinsatser: formell utbildning, e-l\u00e4rande, workshops, mentorskap, handledning, \u201dshow and tell\u201d.",
          "Timing \u00e4r avg\u00f6rande: utbildning f\u00f6r tidigt gl\u00f6ms bort, f\u00f6r sent skapar stress. Planera just-in-time utbildning.",
        ],
        keyTakeaway:
          "Utbilda n\u00e4r behovet \u00e4r som st\u00f6rst \u2014 just-in-time, inte just-in-case.",
      },
      {
        title: "Ability \u2014 F\u00f6rm\u00e5ga",
        content: [
          "Ability \u00e4r skillnaden mellan att veta hur och att kunna g\u00f6ra det i praktiken. Kunskap \u00e4r n\u00f6dv\u00e4ndig men inte tillr\u00e4cklig.",
          "St\u00f6d f\u00f6r ability: \u00f6vningstillf\u00e4llen, pilotprojekt, coachning, superusers/ambassad\u00f6rer, tillg\u00e5ng till hj\u00e4lp.",
          "Identifiera hinder: tekniska begr\u00e4nsningar, tidsbrist, kompetensgap, organisatoriska barri\u00e4rer. Ta bort dem aktivt.",
        ],
        keyTakeaway:
          "F\u00f6rm\u00e5ga kr\u00e4ver \u00f6vning och st\u00f6d \u2014 kunskap ensam r\u00e4cker inte.",
      },
      {
        title: "Reinforcement \u2014 F\u00f6rst\u00e4rkning",
        content: [
          "Reinforcement s\u00e4kerst\u00e4ller att f\u00f6r\u00e4ndringen h\u00e5ller \u00f6ver tid. Utan f\u00f6rst\u00e4rkning \u00e5terg\u00e5r m\u00e4nniskor till gamla beteenden.",
          "Verktyg: fira framg\u00e5ngar, erkk\u00e4nn bidrag, m\u00e4t och visa resultat, samla feedback, korrigera avvikelser.",
          "Sponsorns roll \u00e4r avg\u00f6rande: synligt st\u00f6d, fortsatt kommunikation, och snabb hantering av tillbakag\u00e5ng.",
        ],
        keyTakeaway:
          "F\u00f6r\u00e4ndring \u00e4r inte klar vid lansering \u2014 f\u00f6rst\u00e4rkning \u00e4r det som g\u00f6r den best\u00e5ende.",
      },
      {
        title: "ADKAR i praktiken",
        content: [
          "Anv\u00e4nd ADKAR-bed\u00f6mning: l\u00e5t individer sj\u00e4lvskatta A, D, K, A, R p\u00e5 skala 1\u20135. Identifiera \u201dbarri\u00e4rpunkten\u201d \u2014 det f\u00f6rsta steget med l\u00e5g po\u00e4ng.",
          "\u00c5tg\u00e4rder riktas mot barri\u00e4rpunkten: om Awareness \u00e4r l\u00e5g \u2014 kommunicera mer. Om Ability \u00e4r l\u00e5g \u2014 ge mer st\u00f6d och \u00f6vning.",
          "Kombinera ADKAR med projektledning: ADKAR hanterar \u201dm\u00e4nniskosidan\u201d, projektplanen hanterar \u201dtekniska sidan\u201d. B\u00e5da beh\u00f6vs.",
        ],
        keyTakeaway:
          "Hitta barri\u00e4rpunkten och fokusera insatserna d\u00e4r \u2014 det \u00e4r nyckeln.",
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

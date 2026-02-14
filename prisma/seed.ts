import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSql({
  url,
  ...(authToken ? { authToken } : {}),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear all existing data
  await prisma.maturityResponse.deleteMany();
  await prisma.maturitySession.deleteMany();
  await prisma.traceLink.deleteMany();
  await prisma.score.deleteMany();
  await prisma.bidResponse.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.document.deleteMany();
  await prisma.criterion.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.need.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.stakeholder.deleteMany();
  await prisma.case.deleteMany();
  await prisma.libraryItem.deleteMany();
  await prisma.idCounter.deleteMany();
  console.log("  ✓ Cleared existing data");

  // ============================================================
  // Library content — ~100+ items
  // ============================================================

  // ── KRAVBLOCK (10 st) ──────────────────────────────────────

  // 1. Data & exit (befintligt)
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Data & exit",
      title: "Kravblock: Data & exit",
      description: "Grundläggande krav för dataportabilitet och exit baserat på Diggs rekommendationer",
      content: JSON.stringify({ requirements: [
        { title: "Export av data i öppna format", reqType: "funktion", level: "SKA", text: "Leverantören ska erbjuda export av all data i minst ett öppet, dokumenterat format (t.ex. CSV, JSON, XML).", rationale: "Säkerställer dataportabilitet och förhindrar inlåsning.", cluster: "Data & exit", verification: { bidEvidence: "Demo/beskrivning av exportfunktion", implementationProof: "Testexport", opsFollowUp: "Årlig verifiering" } },
        { title: "API för datauttag", reqType: "funktion", level: "BOR", text: "Systemet bör erbjuda API (REST/GraphQL) för programmatisk åtkomst till all data.", rationale: "Möjliggör integration och automatiserad dataåtkomst.", cluster: "Data & exit" },
        { title: "Dokumentation av datamodell", reqType: "funktion", level: "SKA", text: "Leverantören ska tillhandahålla komplett dokumentation av datamodell och dataformat.", rationale: "Nödvändigt för migrering och integration.", cluster: "Data & exit", verification: { bidEvidence: "Bifoga eller referera till dokumentation", implementationProof: "Granskning av dokumentation" } },
        { title: "Exit-process och tidplan", reqType: "kontraktsvillkor", level: "SKA", text: "Avtal ska innehålla tydlig exit-process med definierad tidplan (minst 6 månader).", rationale: "Säkerställer ordnad avveckling.", cluster: "Data & exit" },
        { title: "Dataägarskap", reqType: "kontraktsvillkor", level: "SKA", text: "All data som skapas i systemet ägs av kunden. Leverantören har ingen rätt att behålla eller använda data efter avtalsperiod.", rationale: "Juridisk klarhet kring dataägarskap.", cluster: "Data & exit" },
        { title: "Arkivering vid avtalsupphörande", reqType: "funktion", level: "BOR", text: "Systemet bör stödja arkivering av historiska data i lämpligt format vid avtalsupphörande.", rationale: "Lagkrav på arkivering.", cluster: "Data & exit" },
      ] }),
      tags: JSON.stringify(["digg", "dataportabilitet", "exit", "generisk"]),
    },
  });

  // 2. Säkerhet & informationssäkerhet
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Säkerhet",
      title: "Kravblock: Säkerhet & informationssäkerhet",
      description: "Grundläggande säkerhetskrav baserade på ISO 27001 och MSB:s rekommendationer",
      content: JSON.stringify({ requirements: [
        { title: "Informationsklassning", reqType: "funktion", level: "SKA", text: "Systemet ska stödja klassning av information enligt organisationens klassningsmodell.", rationale: "Grundläggande för rätt skyddsnivå.", cluster: "Säkerhet", verification: { bidEvidence: "Beskrivning av klassningshantering" } },
        { title: "Kryptering i transit och vila", reqType: "icke-funktionellt", level: "SKA", text: "All data ska krypteras med TLS 1.2+ vid transport och AES-256 eller likvärdigt vid lagring.", rationale: "Skyddar mot avlyssning och dataintrång.", cluster: "Säkerhet", verification: { bidEvidence: "Säkerhetsarkitekturdokument" } },
        { title: "Penetrationstest", reqType: "icke-funktionellt", level: "SKA", text: "Systemet ska genomgå årligt penetrationstest av oberoende tredje part. Resultat ska delas med kunden.", rationale: "Proaktiv säkerhetsverifiering.", cluster: "Säkerhet", verification: { bidEvidence: "Senaste testrapport", opsFollowUp: "Årlig granskning" } },
        { title: "Incidenthantering", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska ha dokumenterad incidenthanteringsprocess med rapportering till kund inom 24 timmar.", rationale: "Krav från NIS2 och MSB.", cluster: "Säkerhet" },
        { title: "Multifaktorautentisering", reqType: "funktion", level: "SKA", text: "Systemet ska stödja MFA för alla administrativa funktioner.", rationale: "Minskar risken för obehörig åtkomst.", cluster: "Säkerhet" },
        { title: "Säkerhetsloggning", reqType: "funktion", level: "SKA", text: "Alla säkerhetsrelevanta händelser ska loggas och vara sökbara i minst 12 månader.", rationale: "Nödvändigt för forensisk analys.", cluster: "Säkerhet", verification: { bidEvidence: "Demo av loggfunktion", opsFollowUp: "Kvartalsvis granskning" } },
      ] }),
      tags: JSON.stringify(["säkerhet", "iso27001", "msb", "generisk"]),
    },
  });

  // 3. Tillgänglighet WCAG
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Tillgänglighet",
      title: "Kravblock: Tillgänglighet WCAG",
      description: "Krav för digital tillgänglighet enligt WCAG 2.1 och DOS-lagen",
      content: JSON.stringify({ requirements: [
        { title: "WCAG 2.1 AA-nivå", reqType: "icke-funktionellt", level: "SKA", text: "Alla publika gränssnitt ska uppfylla WCAG 2.1 nivå AA.", rationale: "Lagkrav enligt DOS-lagen (2018:1937).", cluster: "Tillgänglighet", verification: { bidEvidence: "Tillgänglighetsrapport", implementationProof: "Oberoende granskning", opsFollowUp: "Årlig revision" } },
        { title: "Skärmläsarkompatibilitet", reqType: "icke-funktionellt", level: "SKA", text: "Systemet ska vara fullt kompatibelt med vanliga skärmläsare (JAWS, NVDA, VoiceOver).", rationale: "Säkerställer tillgänglighet för synskadade.", cluster: "Tillgänglighet" },
        { title: "Tangentbordsnavigering", reqType: "funktion", level: "SKA", text: "Alla funktioner ska kunna nås och användas enbart med tangentbord.", rationale: "Grundläggande tillgänglighetskrav.", cluster: "Tillgänglighet" },
        { title: "Tillgänglighetsredogörelse", reqType: "funktion", level: "SKA", text: "Leverantören ska tillhandahålla aktuell tillgänglighetsredogörelse enligt standardformat.", rationale: "Lagkrav.", cluster: "Tillgänglighet" },
      ] }),
      tags: JSON.stringify(["tillgänglighet", "wcag", "dos-lagen", "generisk"]),
    },
  });

  // 4. SLA & driftnivåer
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Drift & SLA",
      title: "Kravblock: SLA & driftnivåer",
      description: "Krav för tillgänglighet, svarstider och driftnivåer",
      content: JSON.stringify({ requirements: [
        { title: "Tillgänglighet 99,5%", reqType: "icke-funktionellt", level: "SKA", text: "Systemet ska ha en tillgänglighet på minst 99,5% mätt per kalendermånad, exklusive planerat underhåll.", rationale: "Kritiskt för verksamhetens funktion.", cluster: "Drift & SLA", verification: { bidEvidence: "SLA-avtal", opsFollowUp: "Månadsrapport" } },
        { title: "Svarstid < 2 sekunder", reqType: "icke-funktionellt", level: "SKA", text: "Genomsnittlig svarstid för standardoperationer ska understiga 2 sekunder.", rationale: "Användarvänlighet och produktivitet.", cluster: "Drift & SLA" },
        { title: "Planerat underhåll utanför kontorstid", reqType: "kontraktsvillkor", level: "SKA", text: "Planerat underhåll ska förläggas utanför kontorstid (mån-fre 07-17) med minst 5 arbetsdagars förvarning.", rationale: "Minimera produktionsstörningar.", cluster: "Drift & SLA" },
        { title: "Backup och återställning", reqType: "funktion", level: "SKA", text: "Daglig backup med möjlighet till punktåterställning (PITR). Recovery Time Objective (RTO) < 4 timmar.", rationale: "Dataskydd och affärskontinuitet.", cluster: "Drift & SLA" },
        { title: "Supportnivåer", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska erbjuda minst 2 supportnivåer: kritisk (svar 1h, lösning 4h) och standard (svar 4h, lösning 2 arbetsdagar).", rationale: "Tydliga förväntningar vid problem.", cluster: "Drift & SLA" },
      ] }),
      tags: JSON.stringify(["sla", "drift", "tillgänglighet", "generisk"]),
    },
  });

  // 5. Priskonstruktion
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Pris & ekonomi",
      title: "Kravblock: Priskonstruktion",
      description: "Krav på transparens i prissättning och kostnadsstruktur",
      content: JSON.stringify({ requirements: [
        { title: "Fast pris för grundlicens", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska ange fast pris per månad/år för grundlicens, specificerat per användare eller volym.", rationale: "Budgetförutsägbarhet.", cluster: "Pris & ekonomi" },
        { title: "Transparent tilläggsmodell", reqType: "kontraktsvillkor", level: "SKA", text: "Alla tillägg, moduler och tillkommande kostnader ska redovisas separat med tydlig prislista.", rationale: "Undviker dolda kostnader.", cluster: "Pris & ekonomi" },
        { title: "Prisindexering", reqType: "kontraktsvillkor", level: "BOR", text: "Prisändringar bör kopplas till officiellt prisindex (t.ex. KPI) och vara begränsade till årliga justeringar.", rationale: "Begränsar prisökningar.", cluster: "Pris & ekonomi" },
        { title: "Ingen inlåsningskostnad vid exit", reqType: "kontraktsvillkor", level: "SKA", text: "Inga extra kostnader ska utgå för datauttag, export eller nedstängning vid avtalsupphörande.", rationale: "Förhindrar ekonomisk inlåsning.", cluster: "Pris & ekonomi" },
      ] }),
      tags: JSON.stringify(["pris", "ekonomi", "kostnad", "generisk"]),
    },
  });

  // 6. Integration API
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Integration",
      title: "Kravblock: Integration & API",
      description: "Krav för systemintegration och API-åtkomst",
      content: JSON.stringify({ requirements: [
        { title: "REST API", reqType: "funktion", level: "SKA", text: "Systemet ska tillhandahålla REST API för läs- och skrivoperationer mot alla centrala dataentiteter.", rationale: "Möjliggör integration med andra system.", cluster: "Integration", verification: { bidEvidence: "API-dokumentation", implementationProof: "Integrationstest" } },
        { title: "API-dokumentation (OpenAPI)", reqType: "funktion", level: "SKA", text: "API:er ska dokumenteras enligt OpenAPI 3.0+ standard.", rationale: "Underlättar integration och underhåll.", cluster: "Integration" },
        { title: "SSO/SAML/OIDC", reqType: "funktion", level: "SKA", text: "Systemet ska stödja SSO via SAML 2.0 eller OpenID Connect.", rationale: "Enhetlig inloggning i organisationens systemlandskap.", cluster: "Integration" },
        { title: "Webhooks för händelsenotifiering", reqType: "funktion", level: "BOR", text: "Systemet bör stödja webhooks för att notifiera externa system om händelser.", rationale: "Möjliggör realtidsintegration.", cluster: "Integration" },
        { title: "Importgränssnitt för bulk-data", reqType: "funktion", level: "BOR", text: "Systemet bör ha ett gränssnitt för import av bulk-data (CSV/Excel) för initiala datamängder.", rationale: "Förenklad initial dataöverföring.", cluster: "Integration" },
      ] }),
      tags: JSON.stringify(["integration", "api", "sso", "generisk"]),
    },
  });

  // 7. GDPR/Compliance
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "GDPR & compliance",
      title: "Kravblock: GDPR & dataskydd",
      description: "Krav relaterade till GDPR, personuppgiftsbehandling och dataskydd",
      content: JSON.stringify({ requirements: [
        { title: "Personuppgiftsbiträdesavtal", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska ingå personuppgiftsbiträdesavtal enligt Art. 28 GDPR.", rationale: "Lagkrav vid extern personuppgiftsbehandling.", cluster: "GDPR & compliance" },
        { title: "Data inom EU/EES", reqType: "icke-funktionellt", level: "SKA", text: "All personuppgiftsbehandling och datalagring ska ske inom EU/EES.", rationale: "Minimerar rättsliga risker vid tredjelandsöverföring.", cluster: "GDPR & compliance" },
        { title: "Rätt till radering", reqType: "funktion", level: "SKA", text: "Systemet ska stödja radering av personuppgifter enligt GDPR Art. 17, med verifierbar bekräftelse.", rationale: "Lagkrav.", cluster: "GDPR & compliance", verification: { bidEvidence: "Demo av raderingsprocess" } },
        { title: "Registerförteckning", reqType: "funktion", level: "SKA", text: "Systemet ska kunna generera behandlingsregister enligt Art. 30 GDPR.", rationale: "Lagkrav.", cluster: "GDPR & compliance" },
        { title: "Konsekvensbedömning (DPIA)", reqType: "funktion", level: "BOR", text: "Leverantören bör tillhandahålla underlag för dataskyddskonsekvensbedömning.", rationale: "Underlättar organisationens DPIA-arbete.", cluster: "GDPR & compliance" },
      ] }),
      tags: JSON.stringify(["gdpr", "dataskydd", "personuppgifter", "generisk"]),
    },
  });

  // 8. Avfall — Ruttplanering & fältarbete
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "avfall_nyanskaffning", cluster: "Logistik/insamling",
      title: "Kravblock: Ruttplanering & fältarbete",
      description: "Krav specifika för ruttplanering och fältarbete inom avfallshantering",
      content: JSON.stringify({ requirements: [
        { title: "GIS-baserad ruttoptimering", reqType: "funktion", level: "SKA", text: "Systemet ska erbjuda GIS-baserad ruttoptimering med hänsyn till vägtyp, fordon och tidsramar.", rationale: "Effektiviserar insamling och minskar kostnader.", cluster: "Logistik/insamling", verification: { bidEvidence: "Demo av ruttoptimering" } },
        { title: "Fyllnadsgradsbaserad hämtning", reqType: "funktion", level: "BOR", text: "Systemet bör kunna anpassa rutter baserat på rapporterad eller sensorbaserad fyllnadsgrad.", rationale: "Undviker onödiga tömningar.", cluster: "Logistik/insamling" },
        { title: "Avvikelsehantering i fält", reqType: "funktion", level: "SKA", text: "Chaufförer ska kunna rapportera avvikelser (ej utställt, felsortering, hinder) via mobil enhet.", rationale: "Dokumentation och kundkommunikation.", cluster: "Logistik/insamling", verification: { bidEvidence: "Demo av mobil avvikelserapport" } },
        { title: "Integration med fordonssystem", reqType: "funktion", level: "BOR", text: "Systemet bör integrera med fordonsdatorer för automatisk registrering av tömningar.", rationale: "Automatiserar datainsamling.", cluster: "Logistik/insamling" },
        { title: "Kapacitetsplanering", reqType: "funktion", level: "BOR", text: "Systemet bör stödja planering av fordons- och personalresurser baserat på ruttbehov.", rationale: "Resursoptimering.", cluster: "Logistik/insamling" },
      ] }),
      tags: JSON.stringify(["avfall", "rutt", "logistik", "gis"]),
    },
  });

  // 9. Avfall — ÅVC-hantering
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "avfall_nyanskaffning", cluster: "ÅVC",
      title: "Kravblock: ÅVC-hantering",
      description: "Krav för hantering av återvinningscentraler",
      content: JSON.stringify({ requirements: [
        { title: "Besöksregistrering med ID-kontroll", reqType: "funktion", level: "SKA", text: "Systemet ska stödja registrering av besök på ÅVC med identifiering via körkortsscanning, kundkort eller personnummer.", rationale: "Spårbarhet och avgiftshantering.", cluster: "ÅVC", verification: { bidEvidence: "Demo av besöksregistrering" } },
        { title: "Fraktionshantering", reqType: "funktion", level: "SKA", text: "Systemet ska hantera alla fraktioner (brännbart, el-avfall, farligt avfall, etc.) med vikter och volymer.", rationale: "Rapporteringskrav och statistik.", cluster: "ÅVC" },
        { title: "Avgiftsberäkning per besök", reqType: "funktion", level: "BOR", text: "Systemet bör kunna beräkna och debitera avgifter baserat på fraktionstyp och mängd.", rationale: "Intäktshantering och rättvisa.", cluster: "ÅVC" },
        { title: "Statistik och rapportering", reqType: "funktion", level: "SKA", text: "Systemet ska generera statistik per ÅVC: besökare, volymer per fraktion, trender.", rationale: "Miljörapportering och beslutsunderlag.", cluster: "ÅVC" },
      ] }),
      tags: JSON.stringify(["avfall", "åvc", "återvinning"]),
    },
  });

  // 10. Avfall — Kund & abonnemang (befintligt)
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "avfall_nyanskaffning", cluster: "Kund & abonnemang",
      title: "Kravblock: Kundregister & abonnemang",
      description: "Krav för kundregister, abonnemangshantering och avtal inom avfallshantering",
      content: JSON.stringify({ requirements: [
        { title: "Kundregister med historik", reqType: "funktion", level: "SKA", text: "Systemet ska hantera kundregister med fullständig historik för adresser, abonnemang och ägarbyte.", cluster: "Kund & abonnemang", rationale: "Grundläggande kundhantering." },
        { title: "Abonnemangshantering", reqType: "funktion", level: "SKA", text: "Systemet ska stödja skapa, ändra och avsluta abonnemang med spårbarhet.", cluster: "Kund & abonnemang", rationale: "Kundservice och fakturering." },
        { title: "Masshantering av abonnemang", reqType: "funktion", level: "BOR", text: "Systemet bör stödja massändringar av abonnemang vid t.ex. taxa- eller zonändringar.", cluster: "Kund & abonnemang", rationale: "Effektivitet vid systemändringar." },
      ] }),
      tags: JSON.stringify(["avfall", "kund", "abonnemang"]),
    },
  });

  // 11. Socialtjänst — Journalföring
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "socialtjanst_byte", cluster: "Ärende/process",
      title: "Kravblock: Journalföring & dokumentation",
      description: "Krav för journalföring inom socialtjänstens verksamhetsområden",
      content: JSON.stringify({ requirements: [
        { title: "Strukturerad journalföring", reqType: "funktion", level: "SKA", text: "Systemet ska stödja strukturerad journalföring med fördefinierade mallar per verksamhetsområde.", rationale: "Rättssäkerhet och kvalitet.", cluster: "Ärende/process", verification: { bidEvidence: "Demo av journalfunktion" } },
        { title: "Tidslinje per ärende", reqType: "funktion", level: "SKA", text: "Varje ärende ska ha en kronologisk tidslinje som visar alla händelser, beslut och journalanteckningar.", rationale: "Överblick och granskning.", cluster: "Ärende/process" },
        { title: "Dokumentmallar", reqType: "funktion", level: "SKA", text: "Systemet ska tillhandahålla anpassningsbara mallar för utredningar, beslut och genomförandeplaner.", rationale: "Effektivitet och enhetlighet.", cluster: "Ärende/process" },
        { title: "Signeringsfunktion", reqType: "funktion", level: "SKA", text: "Journalanteckningar och beslut ska kunna signeras digitalt av ansvarig handläggare.", rationale: "Ansvarighet och rättssäkerhet.", cluster: "Ärende/process" },
        { title: "Versionhantering", reqType: "funktion", level: "BOR", text: "Systemet bör stödja versionshantering av dokument med spårbar ändringshistorik.", rationale: "Revision och transparens.", cluster: "Ärende/process" },
      ] }),
      tags: JSON.stringify(["socialtjänst", "journal", "dokumentation"]),
    },
  });

  // 12. Socialtjänst — Genomförandeplan & insatser
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "socialtjanst_byte", cluster: "Insatser",
      title: "Kravblock: Genomförandeplan & insatser",
      description: "Krav för genomförandeplaner och insatshantering",
      content: JSON.stringify({ requirements: [
        { title: "Genomförandeplan med mål", reqType: "funktion", level: "SKA", text: "Systemet ska stödja genomförandeplaner med mätbara mål, ansvarig och tidplan.", rationale: "Krav enligt SoL och LSS.", cluster: "Insatser", verification: { bidEvidence: "Demo av genomförandeplan" } },
        { title: "Uppföljning av insatser", reqType: "funktion", level: "SKA", text: "Systemet ska möjliggöra uppföljning av insatser med avvikelsehantering.", rationale: "Kvalitetssäkring.", cluster: "Insatser" },
        { title: "Koppling till beslut", reqType: "funktion", level: "SKA", text: "Varje insats ska kunna kopplas till det beslut som ligger till grund.", rationale: "Spårbarhet och rättssäkerhet.", cluster: "Insatser" },
        { title: "Extern utförare-portal", reqType: "funktion", level: "BOR", text: "Systemet bör erbjuda portal för externa utförare att rapportera genomförda insatser.", rationale: "Effektiv samverkan.", cluster: "Insatser" },
        { title: "Statistik per insatstyp", reqType: "funktion", level: "BOR", text: "Systemet bör generera statistik per insatstyp, utförare och målgrupp.", rationale: "Verksamhetsplanering och uppföljning.", cluster: "Insatser" },
      ] }),
      tags: JSON.stringify(["socialtjänst", "genomförandeplan", "insatser"]),
    },
  });

  // 13. Socialtjänst — Behörighet (befintligt)
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "socialtjanst_byte", cluster: "Behörighet & loggning",
      title: "Kravblock: Behörighetsmodell",
      description: "Krav för behörighet, delegering och spärrar inom socialtjänst",
      content: JSON.stringify({ requirements: [
        { title: "Rollbaserad behörighetsmodell", reqType: "funktion", level: "SKA", text: "Systemet ska implementera rollbaserad behörighetsmodell med stöd för delegering och tidsbegränsade behörigheter.", cluster: "Behörighet & loggning", rationale: "Rättssäkerhet och dataskydd." },
        { title: "Spärrhantering", reqType: "funktion", level: "SKA", text: "Systemet ska stödja spärrar av känsliga personuppgifter med åtkomstkontroll och loggning.", cluster: "Behörighet & loggning", rationale: "Skydd av särskilt känsliga uppgifter." },
        { title: "Behörighetshistorik", reqType: "funktion", level: "SKA", text: "Alla behörighetsändringar ska loggas med tidpunkt, utförare och motivering.", cluster: "Behörighet & loggning", rationale: "Revision och ansvarsutkrävande." },
      ] }),
      tags: JSON.stringify(["socialtjänst", "behörighet", "säkerhet"]),
    },
  });

  console.log("  ✓ 13 kravblock");

  // ── RISKMALLAR (16 st) ─────────────────────────────────────

  const riskTemplates = [
    {
      title: "Riskmall: Inlåsning/svag dataexport",
      category: "data_exit",
      description: "Risk att leverantören inte erbjuder fullgod dataexport, vilket försvårar byte.",
      likelihood: 4,
      impact: 4,
      mitigation: "Ställ SKA-krav på dataexport i öppna format, testa vid leveransgodkännande.",
      assessmentQuestions: [
        "Hanterar systemet data som behöver kunna migreras till annan leverantör?",
        "Finns det branschstandarder för dataformat inom det aktuella området?",
        "Har organisationen tidigare haft problem med inlåsning hos befintlig leverantör?",
        "Är det sannolikt att systemet behöver bytas inom 5-10 år?"
      ],
      indicators: [
        "Leverantören undviker frågor om exportformat vid marknadsdialog",
        "Proprietära dataformat utan dokumenterad konverteringsmöjlighet",
        "Saknad eller vag dokumentation av datamodell i leverantörens erbjudande"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp om leverantören inte kan uppvisa fungerande dataexport i öppet format vid PoC eller demo."
    },
    {
      title: "Riskmall: Migreringsfel/datatapp",
      category: "teknik",
      description: "Risk för förlust eller korruption av data vid migrering från befintligt system.",
      likelihood: 3,
      impact: 5,
      mitigation: "Krav på migreringsplan, testmigrering i sandlåda, rollback-plan.",
      assessmentQuestions: [
        "Ska data migreras från ett befintligt system?",
        "Hur komplex är datamodellen i det befintliga systemet?",
        "Finns det historiska data som måste bevaras av juridiska skäl?",
        "Har organisationen tidigare genomfört storskaliga migreringar?"
      ],
      indicators: [
        "Oklarheter kring datakvalitet i befintligt system upptäcks under analysfasen",
        "Leverantören har begränsad erfarenhet av migrering från aktuell plattform",
        "Testmigrering visar avvikelser i volym eller datastrukturer"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om testmigrering visar dataförlust överstigande 0,1% eller om kritisk data inte kan mappas till nytt format."
    },
    {
      title: "Riskmall: Otillräcklig loggning",
      category: "sakerhet",
      description: "Risk att loggning inte möter rättssäkerhetskrav (särskilt socialtjänst).",
      likelihood: 3,
      impact: 4,
      mitigation: "SKA-krav på loggning med granskningsfunktion, demo vid utvärdering.",
      assessmentQuestions: [
        "Hanterar systemet personuppgifter eller känsliga uppgifter som kräver spårbarhet?",
        "Finns det lagkrav eller myndighetskrav på loggning inom verksamhetsområdet?",
        "Behöver enskilda handläggares åtkomst kunna granskas i efterhand?",
        "Omfattas verksamheten av tillsyn från IVO, IMY eller annan myndighet?"
      ],
      indicators: [
        "Leverantören kan inte specificera vilka händelser som loggas",
        "Loggfunktionen saknar sökbarhet eller filtreringsmöjligheter vid demo",
        "Befintliga system har redan fått anmärkningar om bristande spårbarhet"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp om loggningskraven inte kan verifieras vid leverantörsdemo eller om juridisk granskning bedömer att kraven inte möter rättssäkerhetsnivån."
    },
    {
      title: "Riskmall: Leverantörsberoende",
      category: "leverans",
      description: "Risk för beroende av en enskild leverantör eller nyckelpersoner.",
      likelihood: 3,
      impact: 3,
      mitigation: "Krav på dokumentation, escrow-avtal, SLA med garanterad kontinuitet.",
      assessmentQuestions: [
        "Finns det fler än tre leverantörer på marknaden som kan leverera liknande lösning?",
        "Kräver lösningen specialistkompetens som är svår att ersätta?",
        "Ingår det anpassningar som bara leverantören kan underhålla?",
        "Finns det möjlighet att byta leverantör utan att byta systemlösning?"
      ],
      indicators: [
        "Mycket liten leverantörsmarknad identifierad vid marknadsanalys",
        "Leverantören erbjuder enbart egenutvecklad plattform utan öppen källkod",
        "Nyckelpersoner hos leverantören nämns upprepade gånger som kritiska för leveransen"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om marknadsanalysen visar färre än två potentiella leverantörer eller om leverantören vägrar escrow-avtal."
    },
    {
      title: "Riskmall: Integrationsmisslyckande",
      category: "teknik",
      description: "Risk att integrationer med befintliga system inte fungerar som förväntat.",
      likelihood: 3,
      impact: 4,
      mitigation: "PoC-krav på kritiska integrationer, tydligt specificerade API-krav.",
      assessmentQuestions: [
        "Ska systemet integreras med befintliga system (ekonomi, identitet, ärendehantering)?",
        "Använder befintliga system standardiserade API:er eller proprietära gränssnitt?",
        "Finns det realtidskrav på datautbyte mellan systemen?",
        "Har organisationen erfarenhet av att hantera integrationsplattformar?"
      ],
      indicators: [
        "Leverantören saknar dokumenterade integrationer mot aktuella system",
        "Befintliga system har begränsade eller föråldrade API:er",
        "Tidsplanen saknar tillräcklig tid för integrationstester"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om PoC visar att kritiska integrationer inte kan genomföras inom godkänd budget eller tidplan."
    },
    {
      title: "Riskmall: Säkerhetsbrister",
      category: "sakerhet",
      description: "Risk för säkerhetsluckor i systemet eller dess infrastruktur.",
      likelihood: 2,
      impact: 5,
      mitigation: "Krav på säkerhetscertifiering, penetrationstest, incidenthanteringsplan.",
      assessmentQuestions: [
        "Hanterar systemet känsliga personuppgifter eller sekretessbelagd information?",
        "Ska systemet vara tillgängligt via internet eller publika nätverk?",
        "Finns det regulatoriska krav på informationssäkerhet (NIS2, MSB, ISO 27001)?",
        "Har organisationen en befintlig säkerhetspolicy som leverantören måste uppfylla?"
      ],
      indicators: [
        "Leverantören saknar relevant säkerhetscertifiering (ISO 27001, SOC2)",
        "Penetrationstest har inte genomförts eller resultat delas inte",
        "Säkerhetsarkitekturen beskrivs vagt eller undviks i leverantörsdialog"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera omedelbart till styrgrupp och CISO om penetrationstest avslöjar kritiska sårbarheter eller om leverantören inte kan påvisa adekvat incidenthanteringsförmåga."
    },
    {
      title: "Riskmall: Förändringsledning",
      category: "verksamhet",
      description: "Risk att organisationen inte klarar övergången till nytt system.",
      likelihood: 4,
      impact: 3,
      mitigation: "Förändringsledningsplan, utbildning, superanvändare, stegvis utrullning.",
      assessmentQuestions: [
        "Innebär det nya systemet betydande förändring i arbetsflöden för användarna?",
        "Har organisationen tidigare haft svårigheter med förändringsprocesser?",
        "Finns det motstånd mot förändring bland nyckelpersoner eller fackliga parter?",
        "Har organisationen dedikerade resurser för förändringsledning?"
      ],
      indicators: [
        "Lågt deltagande i behovsworkshops och referensgruppsmöten",
        "Negativa signaler från fackliga representanter eller enhetschefer",
        "Organisationen har nyligen genomgått andra stora förändringar"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om mer än 30% av nyckelpersoner uttrycker aktivt motstånd eller om resurser för förändringsledning inte kan säkerställas."
    },
    {
      title: "Riskmall: Användaracceptans",
      category: "verksamhet",
      description: "Risk att slutanvändarna inte accepterar det nya systemet.",
      likelihood: 3,
      impact: 4,
      mitigation: "Tidig involvering av användare, användbarhetstester, prototyp.",
      assessmentQuestions: [
        "Har slutanvändarna involverats i kravprocessen?",
        "Finns det starka preferenser för befintligt system bland användarna?",
        "Skiljer sig det nya systemets gränssnitt markant från det befintliga?",
        "Har användarna varierande digital mognad?"
      ],
      indicators: [
        "Användare uttrycker oro eller skepsis vid informationsträffar",
        "Användbarhetstester visar att viktiga arbetsflöden tar längre tid i nytt system",
        "Superanvändare har svårt att se fördelar med det nya systemet"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om acceptanstester visar att mindre än 60% av användarna bedömer systemet som likvärdigt eller bättre än befintligt."
    },
    {
      title: "Riskmall: Kostnadsöverskridning",
      category: "ekonomi",
      description: "Risk att projektet överskrider budget på grund av ändrade krav eller tillägg.",
      likelihood: 3,
      impact: 3,
      mitigation: "Fast pris eller takpris, tydlig kravspecifikation, ändringshantering.",
      assessmentQuestions: [
        "Är kravbilden tydligt definierad eller finns det risk för tillägg under projektet?",
        "Används fast pris, takpris eller löpande räkning som prismodell?",
        "Har organisationen erfarenhet av att hantera ändringsförfrågningar i IT-projekt?",
        "Finns det en tydlig process för att godkänna tilläggsbeställningar?"
      ],
      indicators: [
        "Tidiga ändringsförfrågningar redan under implementeringens första fas",
        "Leverantören flaggar för att kravspecifikationen är otydlig eller ofullständig",
        "Kostnader för tillägg överstiger 10% av ursprunglig budget"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om prognostiserade kostnader överstiger budget med mer än 15% eller om tre eller fler ändringsförfrågningar inkommer under samma fas."
    },
    {
      title: "Riskmall: Överprövning",
      category: "juridik",
      description: "Risk att upphandlingen överprövas med fördröjning som följd.",
      likelihood: 2,
      impact: 4,
      mitigation: "Tydlig dokumentation av utvärdering, transparenta tilldelningskriterier.",
      assessmentQuestions: [
        "Är utvärderingskriterierna tydligt definierade och transparenta?",
        "Finns det leverantörer som tidigare har överprövat liknande upphandlingar?",
        "Har tilldelningskriterierna granskats av juridisk expertis?",
        "Är det sannolikt att resultatskillnaden mellan anbud blir liten?"
      ],
      indicators: [
        "Leverantörer ställer detaljerade frågor om utvärderingsmetod under anbudstiden",
        "Utvärderingsresultat visar mycket små skillnader mellan anbud",
        "Tidigare upphandlingar inom samma kategori har överprövats"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp och juridik omedelbart om överprövningsansökan inkommer, samt om utvärderingsresultat visar marginell skillnad (<5%) mellan anbud."
    },
    {
      title: "Riskmall: Resursbrist i organisationen",
      category: "verksamhet",
      description: "Risk att organisationen saknar tillräckliga resurser för att genomföra projektet.",
      likelihood: 3,
      impact: 3,
      mitigation: "Dedikerad projektorganisation, extern projektledning vid behov.",
      assessmentQuestions: [
        "Har organisationen tillräckligt med personal som kan avsättas för projektet?",
        "Pågår andra stora projekt parallellt som konkurrerar om samma resurser?",
        "Finns det kompetens inom upphandling och IT-projekt internt?",
        "Har ledningen formellt avsatt tid och budget för interna resurser?"
      ],
      indicators: [
        "Nyckelpersoner avbokar eller skjuter upp projektmöten upprepade gånger",
        "Interna leverabler (kravunderlag, testfall) levereras försenade",
        "Projektmedlemmar rapporterar att ordinarie arbetsuppgifter prioriteras framför projektet"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om kritiska interna milstolpar försenas med mer än två veckor eller om nyckelpersoner avsäger sig projektdeltagande."
    },
    {
      title: "Riskmall: Tidplansglidning",
      category: "leverans",
      description: "Risk att leverans försenas med påverkan på verksamheten.",
      likelihood: 4,
      impact: 3,
      mitigation: "Milstolpar med viten, löpande uppföljning, parallella aktiviteter.",
      assessmentQuestions: [
        "Är tidplanen realistisk i förhållande till projektets komplexitet?",
        "Finns det externa beroenden som kan påverka tidplanen (t.ex. andra system, beslut)?",
        "Har leverantören tillräcklig kapacitet att leverera enligt tidplan?",
        "Finns det en kritisk deadline (t.ex. avtalsupphörande för befintligt system)?"
      ],
      indicators: [
        "Leverantören missar första milstolpen eller begär tidförlängning tidigt",
        "Beroenden till andra projekt eller system visar sig mer komplexa än planerat",
        "Internresurser kan inte leverera godkännanden i tid"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om en milstolpe försenas mer än tre veckor eller om leverantören begär omförhandling av tidplanen."
    },
    {
      title: "Riskmall: Regelverksändring",
      category: "juridik",
      description: "Risk att lagändringar påverkar kravbilden under upphandlingen.",
      likelihood: 2,
      impact: 3,
      mitigation: "Bevakning av remisser, flexibla krav med optioner.",
      assessmentQuestions: [
        "Pågår det lagstiftningsarbete som kan påverka det aktuella verksamhetsområdet?",
        "Finns det remisser eller utredningar som kan resultera i ändrade krav?",
        "Är upphandlingens tidplan längre än 12 månader (ökad exponering)?",
        "Berörs verksamhetsområdet av EU-direktiv som kan genomföras under projekttiden?"
      ],
      indicators: [
        "Nya remisser eller propositioner publiceras inom aktuellt område",
        "Branschorganisationer signalerar kommande regeländringar",
        "Myndigheters föreskrifter revideras under upphandlingsperioden"
      ],
      responseStrategy: "accept",
      escalationCriteria: "Eskalera till styrgrupp om en identifierad regeländring bedöms påverka mer än 20% av kravspecifikationen eller om ny lagstiftning träder i kraft under upphandlingsperioden."
    },
    {
      title: "Riskmall: Personuppgiftsincident",
      category: "sakerhet",
      description: "Risk för oavsiktlig exponering av personuppgifter.",
      likelihood: 2,
      impact: 5,
      mitigation: "DPIA, kryptering, åtkomstkontroll, incidenthanteringsrutin.",
      assessmentQuestions: [
        "Hanterar systemet personuppgifter enligt artikel 9 GDPR (känsliga uppgifter)?",
        "Överförs personuppgifter till tredje land eller underleverantör?",
        "Finns det en genomförd DPIA (konsekvensbedömning) för behandlingen?",
        "Har leverantören dokumenterade rutiner för incidenthantering och anmälan till IMY?"
      ],
      indicators: [
        "Leverantören saknar eller har bristfälligt PuB-avtal",
        "Databehandling sker utanför EU/EES utan adekvata skyddsmekanismer",
        "Leverantören har historik av personuppgiftsincidenter"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera omedelbart till styrgrupp och dataskyddsombud om personuppgiftsincident inträffar eller om DPIA visar hög kvarstående risk som inte kan mitigeras."
    },
    {
      title: "Riskmall: Tillgänglighetsbrister",
      category: "verksamhet",
      description: "Risk att systemet inte uppfyller tillgänglighetskrav.",
      likelihood: 3,
      impact: 3,
      mitigation: "WCAG 2.1 AA som SKA-krav, oberoende tillgänglighetsgranskning.",
      assessmentQuestions: [
        "Har systemet externa användare (medborgare/kunder) som kräver tillgänglighet?",
        "Omfattas systemet av DOS-lagen (lagen om tillgänglighet till digital offentlig service)?",
        "Finns det användare med funktionsnedsättningar bland målgruppen?",
        "Har organisationen resurser att genomföra oberoende tillgänglighetsgranskning?"
      ],
      indicators: [
        "Leverantörens demo eller prototyp saknar grundläggande tillgänglighetsstöd (tangentbordsnavigering, skärmläsare)",
        "VPAT eller tillgänglighetsrapport saknas eller är inaktuell",
        "Användartester med hjälpmedel visar allvarliga brister"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp om oberoende tillgänglighetsgranskning visar brott mot WCAG 2.1 AA-krav som påverkar mer än 25% av funktionaliteten."
    },
    {
      title: "Riskmall: Kompetensberoende",
      category: "verksamhet",
      description: "Risk att projektets framgång hänger på enskilda nyckelpersoner.",
      likelihood: 3,
      impact: 4,
      mitigation: "Dokumentation av kunskap, par-bemanning, kunskapsdelning.",
      assessmentQuestions: [
        "Finns det enskilda personer vars frånvaro skulle stoppa projektet?",
        "Är verksamhetskunskapen koncentrerad till få personer?",
        "Har projektet backup-resurser identifierade för kritiska roller?",
        "Är kunskapen om befintligt system dokumenterad eller buren av enskilda?"
      ],
      indicators: [
        "Samma person nämns som oersättlig i flera projektaktiviteter",
        "Sjukfrånvaro eller semester hos nyckelperson orsakar omedelbart projektstopp",
        "Beslut och kunskap kommuniceras muntligt utan dokumentation"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om en nyckelperson med unik kompetens meddelar uppsägning eller långvarig frånvaro, eller om kunskapsöverföring inte sker enligt plan."
    },
  ];

  for (const tmpl of riskTemplates) {
    await prisma.libraryItem.create({
      data: {
        type: "risk_template", profile: "", cluster: tmpl.category,
        title: tmpl.title, description: tmpl.description,
        content: JSON.stringify({ risk: tmpl }),
        tags: JSON.stringify(["riskmall", tmpl.category]),
      },
    });
  }

  console.log("  ✓ 16 riskmallar");

  // ── WORKSHOPMALLAR (10 st) ─────────────────────────────────

  const workshopTemplates = [
    {
      title: "Workshopmall: Behovsworkshop (generisk)",
      description: "Generisk behovsworkshop för kartläggning och prioritering av behov.",
      suggestedParticipants: ["Verksamhetsansvarig", "Slutanvändare", "IT-ansvarig", "Ekonomiansvarig"],
      agenda: ["Introduktion och syfte", "Kartläggning av nuläge", "Identifiera behov och smärtpunkter", "Prioritering (P1/P2/P3)", "Sammanfattning och nästa steg"],
      expectedOutputs: ["Behovslista", "Prioriteringsmatris"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Introduktion och syfte", timeMinutes: 20, purpose: "Skapa gemensam bild av varför workshopen genomförs och vad vi vill uppnå. Etablera trygghet och engagemang.", method: "Presentation", facilitationQuestions: ["Vad är den enskilt viktigaste utmaningen ni upplever i ert dagliga arbete idag?", "Vilka förväntningar har ni på denna workshop?", "Hur skulle en perfekt lösning påverka er vardag?", "Finns det tidigare upphandlingar eller projekt vi bör dra lärdomar från?"], tips: "Låt varje deltagare kort presentera sig och sin roll. Använd en check-in-runda där alla får ordet tidigt — det sänker tröskeln för att bidra senare." },
        { title: "Kartläggning av nuläge", timeMinutes: 40, purpose: "Dokumentera hur verksamheten fungerar idag, inklusive befintliga system, processer och arbetssätt. Skapar en gemensam referenspunkt.", method: "Affinity mapping", facilitationQuestions: ["Vilka system och verktyg använder ni idag och vad gör ni i respektive system?", "Var i processen uppstår flaskhalsar eller dubbelarbete?", "Vilka manuella steg finns som ni önskar vore automatiserade?", "Hur ser informationsflödet ut mellan avdelningar idag?", "Finns det workarounds som ni har byggt upp över tid?"], tips: "Använd en stor whiteboard eller digital tavla. Låt deltagarna skriva lappar individuellt först (5 min tyst arbete), sedan gruppera tillsammans. Det ger tystare deltagare utrymme att bidra." },
        { title: "Identifiera behov och smärtpunkter", timeMinutes: 50, purpose: "Fånga verkliga behov ur verksamhetsperspektiv, inte tekniska önskemål. Fokus på problem snarare än lösningar.", method: "Brainstorming", facilitationQuestions: ["Om ni fick ändra en enda sak i ert nuvarande arbetssätt, vad skulle det vara?", "Vilka situationer skapar mest frustration eller tar mest tid?", "Vilka behov har era kunder/brukare som ni inte kan tillgodose idag?", "Finns det lagkrav eller regulatoriska krav som ni har svårt att uppfylla?", "Vad händer om vi INTE gör något — hur ser situationen ut om två år?"], tips: "Skilj på behov och lösningar. Om deltagare säger 'vi behöver ett nytt system' — fråga 'varför?' tills ni når det underliggande behovet. Använd '5 varför'-metoden." },
        { title: "Prioritering (P1/P2/P3)", timeMinutes: 40, purpose: "Rangordna behoven för att styra kravställningen. P1 = måste ha, P2 = bör ha, P3 = önskvärt.", method: "Dot-voting", facilitationQuestions: ["Vilka behov är absolut nödvändiga för att verksamheten ska fungera?", "Vilka behov ger störst verksamhetsnytta i förhållande till kostnad?", "Finns det beroenden mellan behoven som påverkar prioriteringen?", "Vilka behov kan vi leva utan de första åren och införa stegvis?"], tips: "Ge varje deltagare 5-7 röstprickar. Tillåt max 2 prickar per behov. Diskutera efter omröstningen — det är i samtalet insikterna uppstår. Var beredd att hantera meningsskiljaktigheter genom att hänvisa till verksamhetsnytta." },
        { title: "Sammanfattning och nästa steg", timeMinutes: 20, purpose: "Säkerställ att alla är överens om resultatet och att det finns en tydlig plan framåt.", method: "Presentation", facilitationQuestions: ["Har vi missat något väsentligt?", "Är det någon som har invändningar mot prioriteringen?", "Vilka ytterligare personer bör involveras i nästa steg?"], tips: "Sammanfatta resultaten visuellt på tavlan. Fotografera eller exportera alla lappar. Skicka ut protokoll inom 48 timmar — det är avgörande för att behålla momentum." },
      ],
      preparation: "Förbered en nulägesbeskrivning med befintliga system, avtal och processer. Skicka ut workshopens syfte och agenda minst en vecka i förväg så deltagarna kan reflektera. Samla in eventuella befintliga behovslistor eller önskemål som redan dokumenterats.",
      followUp: ["Dokumentera alla identifierade behov i en strukturerad behovslista med prioritering (P1/P2/P3)", "Skicka ut workshopprotokoll till alla deltagare inom 48 timmar för validering", "Boka uppföljningsmöte inom 2 veckor för att kvalitetssäkra behovslistan", "Koppla varje behov till en intressent (behovsägare) som kan svara på följdfrågor", "Påbörja spårbarhetsdokumentation: behov till framtida krav"],
      sparkboardSuggestion: [
        { boardTitle: "Nuläge & smärtpunkter", questions: ["Vilken uppgift i ditt dagliga arbete tar mest tid och borde gå snabbare?", "Beskriv en situation där befintliga system sviker dig.", "Vilken information saknar du ofta för att kunna fatta bra beslut?", "Om du var chef för en dag — vad skulle du ändra först?"], timeLimit: 10 },
        { boardTitle: "Framtida drömläge", questions: ["Hur ser din perfekta arbetsdag ut med det nya systemet?", "Vilka uppgifter vill du att systemet ska klara helt automatiskt?", "Vad vill du kunna göra som du inte kan idag?"], timeLimit: 8 },
      ],
    },
    {
      title: "Workshopmall: Exit & migrering",
      description: "Workshop för att planera datamigrering och exit från befintligt system.",
      suggestedParticipants: ["IT-ansvarig", "Systemförvaltare", "DBA/dataansvarig", "Verksamhetsansvarig"],
      agenda: ["Systeminventering: vad har vi?", "Dataanalys: volymer, kvalitet, format", "Integrationskartläggning", "Migreringsstrategier", "Risk- och rollback-planering"],
      expectedOutputs: ["Systeminventeringsdokument", "Migreringsstrategi", "Risklista"],
      duration: "4h",
      profile: "",
      agendaDetailed: [
        { title: "Systeminventering: vad har vi?", timeMinutes: 45, purpose: "Skapa en komplett bild av nuvarande systemlandskap inklusive licenser, avtal, versioner och ägarskap.", method: "Affinity mapping", facilitationQuestions: ["Vilka system ingår i det nuvarande landskapet och vilka äger respektive system?", "Finns det skugg-IT eller lokala lösningar som inte är centralt dokumenterade?", "Vilka avtal löper ut och när? Finns det bindningstider vi måste beakta?", "Vilka databaser och datalagringslösningar används idag?", "Finns det tredjepartssystem som är beroende av det system vi ska avveckla?"], tips: "Förbered en lista men var öppen för att deltagarna tillför system ni inte kände till. Fråga specifikt efter Excel-lösningar och Access-databaser — de dyker ofta upp som överraskningar." },
        { title: "Dataanalys: volymer, kvalitet, format", timeMinutes: 50, purpose: "Kartlägga datamängder, format och kvalitet för att kunna bedöma migreringsinsats och risker.", method: "Presentation", facilitationQuestions: ["Hur stora är datamängderna (antal poster, storlek i GB)?", "Vilken data är affärskritisk och måste migreras utan undantag?", "Finns det känd datakvalitetsproblematik — dubbletter, ofullständiga poster, inaktuell data?", "Vilka dataformat används (XML, CSV, JSON, proprietära format)?", "Finns det gallringsregler som gör att viss data inte behöver migreras?"], tips: "Be om konkreta siffror. Om ingen vet, planera in en datainventeringsaktivitet som föregår migreringen. Dålig datakvalitet är den vanligaste orsaken till misslyckade migreringar." },
        { title: "Integrationskartläggning", timeMinutes: 40, purpose: "Identifiera alla integrationer som påverkas vid systembytet och måste återskapas eller avvecklas.", method: "Affinity mapping", facilitationQuestions: ["Vilka system skickar data till eller hämtar data från det befintliga systemet?", "Hur sker datautbytet — API:er, filöverföring, manuell inmatning?", "Finns det batch-jobb eller schemalagda flöden som behöver beaktas?", "Vilka integrationer är affärskritiska respektive kan avvecklas?"], tips: "Rita ett integrationsdiagram på tavlan under workshopen. Markera varje integration med röd/gul/grön beroende på komplexitet. Det ger en snabb visuell överblick." },
        { title: "Migreringsstrategier", timeMinutes: 50, purpose: "Välja strategi för migreringen: big bang, parallellkörning eller stegvis migrering.", method: "Brainstorming", facilitationQuestions: ["Kan vi köra parallellt under en övergångsperiod eller måste det vara big bang?", "Vilka verksamhetsperioder har lägst belastning och lämpar sig bäst för migrering?", "Finns det regulatoriska krav på att all historisk data ska följa med?", "Hur lång driftstopp kan verksamheten tolerera?", "Behöver vi testmigrering och i så fall hur många omgångar?"], tips: "Presentera för- och nackdelar med varje strategi. Big bang är billigare men riskfylldare. Parallellkörning kostar mer men ger en fallback. Låt verksamheten avgöra risknivån." },
        { title: "Risk- och rollback-planering", timeMinutes: 45, purpose: "Identifiera risker kopplade till migreringen och ta fram en rollback-plan om något går fel.", method: "Brainstorming", facilitationQuestions: ["Vad är det värsta som kan hända under migreringen?", "Vid vilken punkt är det för sent att rulla tillbaka?", "Hur verifierar vi att migreringen lyckats — vilka kontroller gör vi?", "Vem fattar beslut om go/no-go på migreringsdag?", "Hur kommunicerar vi till slutanvändare vid problem?"], tips: "Var inte rädd för worst-case-scenarier. En genomtänkt rollback-plan ger trygghet. Dokumentera beslutskedjan tydligt: vem beslutar vad och när." },
      ],
      preparation: "Samla in systemdokumentation, avtalsöversikt och integrationsbeskrivningar. Be IT föra en inventering av databaser med volymer och format. Identifiera avtalstider och uppsägningsvillkor för befintliga leverantörer.",
      followUp: ["Dokumentera systeminventering med alla identifierade system, databaser och integrationer", "Genomför en datakvalitetsanalys på de största datamängderna", "Ta fram en detaljerad migreringsplan med tidslinje och ansvariga", "Planera minst en testmigrering i en icke-produktionsmiljö", "Upprätta en rollback-plan med tydliga beslutspunkter och ansvariga"],
      sparkboardSuggestion: [
        { boardTitle: "Systemlandskap & beroenden", questions: ["Vilka system interagerar du med dagligen och vad gör du i dem?", "Finns det data som du vet är felaktig eller dubblerad i nuvarande system?", "Vilken data absolut INTE får förloras vid ett systembyte?"], timeLimit: 10 },
        { boardTitle: "Migreringsrisker", questions: ["Vad oroar dig mest inför systembytet?", "Beskriv en situation då en tidigare migrering eller uppgradering gick fel.", "Vilken information behöver du för att känna dig trygg på migreringsdagen?"], timeLimit: 8 },
      ],
    },
    {
      title: "Workshopmall: Kundresa & självservice (avfall)",
      description: "Workshop för att kartlägga kundresan och självservicebehov inom avfallshantering.",
      suggestedParticipants: ["Kundtjänstansvarig", "IT-ansvarig", "Kommunikatör", "Slutanvändare/medborgare"],
      agenda: ["Kartlägg kundens resa (från anmälan till faktura)", "Identifiera självservicebehov", "Digitala kanaler och tillgänglighet", "Prioritering"],
      expectedOutputs: ["Kundresekarta", "Självservicekrav"],
      duration: "3h",
      profile: "avfall_nyanskaffning",
      agendaDetailed: [
        { title: "Kartlägg kundens resa (från anmälan till faktura)", timeMinutes: 50, purpose: "Visualisera hela kundresan steg för steg för att identifiera kontaktpunkter, friktion och förbättringsmöjligheter.", method: "Affinity mapping", facilitationQuestions: ["Hur tar en kund idag kontakt med er för att beställa eller ändra en tjänst?", "Vilka steg i processen skapar mest frågor eller klagomål från kunderna?", "Hur lång tid tar det från anmälan till att tjänsten är levererad?", "Vilka kontaktpunkter har kunden med er under ett år (beställning, hämtning, faktura, reklamation)?", "Finns det skillnader i kundresan mellan privatpersoner och företag?"], tips: "Rita kundresan som en tidslinje på väggen. Markera varje kontaktpunkt. Använd röda lappar för smärtpunkter och gröna för det som fungerar bra. Involvera gärna en riktig kund om möjligt." },
        { title: "Identifiera självservicebehov", timeMinutes: 40, purpose: "Identifiera vilka ärenden och uppgifter som kunderna själva bör kunna utföra digitalt utan att kontakta kundtjänst.", method: "Brainstorming", facilitationQuestions: ["Vilka ärenden hos kundtjänst är enklast och mest repetitiva — och borde kunderna kunna göra själva?", "Vilka tjänster erbjuder andra kommuner i sina självserviceportaler inom avfall?", "Vilka hinder finns idag för att kunderna ska kunna hjälpa sig själva?", "Hur stor andel av kundkontakterna skulle kunna lösas via självservice?"], tips: "Ta med statistik från kundtjänst: topp 10 ärendetyper. De mest frekventa ärendena är ofta de bästa kandidaterna för självservice. Prioritera utifrån volym och enkelhet." },
        { title: "Digitala kanaler och tillgänglighet", timeMinutes: 35, purpose: "Definiera vilka digitala kanaler som ska användas och hur tillgänglighet säkerställs för alla användargrupper.", method: "Presentation", facilitationQuestions: ["Vilka digitala kanaler förväntar sig kunderna — webb, app, SMS, e-post?", "Hur säkerställer vi tillgänglighet för äldre, funktionshindrade och icke-svensktalande?", "Ska vi erbjuda inloggning via BankID/Freja eID eller öppen åtkomst?", "Hur hanterar vi kunder som inte kan eller vill använda digitala kanaler?"], tips: "Tänk på WCAG-krav för tillgänglighet. Kommunala tjänster måste vara tillgängliga för alla. Diskutera också flerspråkighet — har kommunen krav på det?" },
        { title: "Prioritering", timeMinutes: 35, purpose: "Prioritera självservicefunktioner utifrån kundnytta, volym och genomförbarhet.", method: "Dot-voting", facilitationQuestions: ["Vilka funktioner ger störst kundnytta med minst insats?", "Vilka funktioner måste finnas från dag ett?", "Finns det beroenden mellan funktionerna som styr ordningen?", "Vad kan vi vänta med till fas 2 eller 3?"], tips: "Använd en enkel matris med kundnytta på Y-axeln och komplexitet på X-axeln. Placera varje funktion i matrisen. Börja med hög nytta + låg komplexitet." },
      ],
      preparation: "Samla in kundtjänststatistik (topp 20 ärendetyper, volymer, svarstider). Kartlägg befintliga digitala kanaler. Titta på 2-3 andra kommuners självserviceportaler för avfall som inspiration.",
      followUp: ["Dokumentera kundresekartan digitalt med alla kontaktpunkter och smärtpunkter", "Skapa en prioriterad lista över självservicefunktioner med förväntad ärendereduktion", "Utred autentiseringslösning (BankID/Freja eID) och integrationer", "Genomför kundundersökning för att validera de identifierade behoven"],
      sparkboardSuggestion: [
        { boardTitle: "Kundens perspektiv", questions: ["Vad klagar kunderna mest på när de kontaktar er?", "Beskriv ett typiskt kundärende som borde gå att lösa utan att ringa kundtjänst.", "Vilken information efterfrågar kunderna oftast?"], timeLimit: 8 },
        { boardTitle: "Drömportalen", questions: ["Om du vore kund — vilka tre saker vill du kunna göra själv i en portal?", "Vilken kommun eller organisation har en bra digital kundupplevelse som vi kan inspireras av?", "Vilka funktioner i dagens lösning fungerar bra och bör behållas?"], timeLimit: 8 },
      ],
    },
    {
      title: "Workshopmall: Rättssäkra flöden (socialtjänst)",
      description: "Workshop för att säkerställa rättssäkra handläggningsflöden.",
      suggestedParticipants: ["Enhetschef", "Handläggare", "Jurist", "IT-ansvarig", "Dataskyddsombud"],
      agenda: ["Kartlägg handläggningsflödet", "Identifiera rättssäkerhetskrav", "Behörighet och delegering", "Dokumentationskrav", "Spärrar och känsliga uppgifter"],
      expectedOutputs: ["Flödesdiagram", "Rättssäkerhetskrav", "Behörighetsmatris"],
      duration: "4h",
      profile: "socialtjanst_byte",
      agendaDetailed: [
        { title: "Kartlägg handläggningsflödet", timeMinutes: 50, purpose: "Skapa en gemensam bild av handläggningsprocessen från ansökan till beslut och uppföljning. Identifiera varianter och undantag.", method: "Affinity mapping", facilitationQuestions: ["Hur ser handläggningsflödet ut steg för steg — från det att en ansökan inkommer till att beslut fattas?", "Vilka varianter finns i flödet beroende på ärendetyp (t.ex. försörjningsstöd vs. bistånd)?", "Var i processen fattas formella beslut och av vem?", "Vilka tidsfrister gäller enligt lag för handläggningen?", "Vilka steg i processen kräver samverkan med andra aktörer (Försäkringskassan, vård, skola)?"], tips: "Rita flödet på whiteboard. Markera beslutspunkter med diamanter, processteg med rektanglar. Var extra noggrann med undantags- och överklagandeflöden — de är ofta bristfälligt dokumenterade." },
        { title: "Identifiera rättssäkerhetskrav", timeMinutes: 45, purpose: "Säkerställa att systemet stödjer lagkrav enligt SoL, LVU, LVM, LSS och förvaltningslagen.", method: "Presentation", facilitationQuestions: ["Vilka lagkrav ställer SoL, LVU och LSS på handläggningen som systemet måste stödja?", "Hur säkerställer ni idag att beslut fattas av behörig person med korrekt delegation?", "Finns det krav på kommunicering med den enskilde innan beslut — hur hanteras det i systemet?", "Vilka rättssäkerhetsproblem har ni upplevt med nuvarande system?", "Hur hanteras överklaganden och omprövningar?"], tips: "Ha en jurist närvarande som kan klargöra lagkraven. Dokumentera varje krav med lagrumshänvisning. Det underlättar enormt vid kravställning och utvärdering." },
        { title: "Behörighet och delegering", timeMinutes: 40, purpose: "Definiera behörighetsstruktur och delegeringsordning som systemet ska stödja.", method: "Brainstorming", facilitationQuestions: ["Vilka roller finns i handläggningen och vilka befogenheter har respektive roll?", "Hur fungerar delegeringsordningen — vem får fatta vilka beslut?", "Vad händer vid semester eller frånvaro — hur hanteras ställföreträdare?", "Finns det beslut som kräver chef-i-chef-godkännande?", "Hur ska vikarier och tillfällig personal hanteras i behörighetssystemet?"], tips: "Rita en behörighetsmatris på tavlan med roller på ena axeln och behörigheter på den andra. Testa med konkreta scenarier: 'Kan en ny handläggare fatta beslut om bistånd under 10 000 kr?'" },
        { title: "Dokumentationskrav", timeMinutes: 35, purpose: "Definiera krav på dokumentation, journalföring och diarieföring som systemet måste stödja.", method: "Presentation", facilitationQuestions: ["Vilka dokumentationskrav ställs av tillsynsmyndigheten (IVO)?", "Hur ska journalanteckningar struktureras och vem ska kunna skriva dem?", "Vilka krav finns på diarieföring och ärendehantering?", "Hur lång tid ska dokumentation sparas och hur hanteras gallring?"], tips: "Ta med IVO:s senaste granskningsrapporter för er kommun som underlag. Vanliga brister som IVO pekar på ger direkt input till kravställningen." },
        { title: "Spärrar och känsliga uppgifter", timeMinutes: 40, purpose: "Definiera hur sekretessbelagda uppgifter, spärrmarkering och skyddade personuppgifter ska hanteras i systemet.", method: "Brainstorming", facilitationQuestions: ["Hur hanteras ärenden med spärrmarkerade personer idag och vilka brister finns?", "Vilka typer av känsliga uppgifter hanteras (skyddade personuppgifter, sekretessmarkering)?", "Hur ska systemet förhindra att obehöriga ser känslig information?", "Finns det krav på fysisk separation av data för vissa ärendetyper?", "Hur hanteras jäv — kan en handläggare oavsiktligt komma åt ärenden som rör närstående?"], tips: "Var extra noggrann här — felhantering av spärrade uppgifter kan äventyra personers säkerhet. Testa med konkreta scenarier. Involvera dataskyddsombudet aktivt." },
      ],
      preparation: "Samla in gällande delegeringsordning, senaste IVO-granskning, befintlig processdokumentation och dataskyddsanalys. Bjud in jurist med kompetens inom SoL/LVU/LSS. Förbered konkreta ärendescenarier att testa flöden mot.",
      followUp: ["Dokumentera handläggningsflödet i ett detaljerat flödesdiagram med beslutspunkter", "Skapa en komplett behörighetsmatris med roller, befogenheter och delegeringsnivåer", "Sammanställ rättssäkerhetskrav med lagrumshänvisningar som underlag till kravspecifikation", "Granska och dokumentera krav på spärr- och sekretesshantering", "Boka separata fördjupningsworkshops per verksamhetsområde (barn/ungdom, vuxna, funktionshinder)"],
      sparkboardSuggestion: [
        { boardTitle: "Rättssäkerhet i praktiken", questions: ["Beskriv en situation där nuvarande system brister i rättssäkerhet.", "Vilka kontroller saknar du i det dagliga handläggningsarbetet?", "Hur skulle systemet kunna hjälpa dig att fatta mer rättssäkra beslut?"], timeLimit: 10 },
        { boardTitle: "Behörighet & sekretess", questions: ["Finns det situationer där du har tillgång till mer information än du behöver?", "Hur hanterar du känsliga ärenden (t.ex. spärrmarkerade personer) i nuvarande system?", "Vilka förbättringar önskar du i behörighetshanteringen?"], timeLimit: 8 },
      ],
    },
    {
      title: "Workshopmall: Marknadsanalys",
      description: "Workshop för att analysera marknaden inför upphandling.",
      suggestedParticipants: ["Upphandlare", "Verksamhetsansvarig", "IT-ansvarig", "Ekonomiansvarig"],
      agenda: ["Definiera behov och önskat scope", "Identifiera potentiella leverantörer", "Analysera befintliga avtal i branschen", "Benchmark mot liknande organisationer", "RFI-strategi"],
      expectedOutputs: ["Marknadsanalysrapport", "Leverantörslista", "RFI-underlag"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Definiera behov och önskat scope", timeMinutes: 30, purpose: "Klargöra vad vi söker på marknaden — avgränsa upphandlingens scope så att marknadsanalysen blir fokuserad.", method: "Presentation", facilitationQuestions: ["Vad är kärnan i det vi behöver upphandla — var går gränsen för scopet?", "Söker vi en helhetslösning eller best-of-breed med flera leverantörer?", "Vilka funktionsområden är absolut nödvändiga och vilka är önskvärda?", "Finns det befintliga system som ska ersättas helt eller delvis?"], tips: "Var tydlig med avgränsningen — en för bred analys blir ytlig och oanvändbar. Fokusera på de kärnbehov som identifierats i behovsworkshopen." },
        { title: "Identifiera potentiella leverantörer", timeMinutes: 35, purpose: "Kartlägga vilka leverantörer som finns på marknaden, deras storlek, specialisering och erfarenhet av offentlig sektor.", method: "Brainstorming", facilitationQuestions: ["Vilka leverantörer känner ni till som erbjuder denna typ av lösning?", "Vilka leverantörer används av jämförbara organisationer?", "Finns det nischade specialister eller dominerar några få stora aktörer?", "Vilka leverantörer har erfarenhet av offentlig upphandling i Sverige?", "Finns det internationella aktörer vi bör titta på?"], tips: "Använd SKL Kommentus, TendSign och liknande källor för att hitta tidigare upphandlingar. Googla även Gartner/Forrester-rapporter om relevanta produktkategorier." },
        { title: "Analysera befintliga avtal i branschen", timeMinutes: 30, purpose: "Lära av andras erfarenheter genom att analysera befintliga avtal och upphandlingar inom samma område.", method: "Presentation", facilitationQuestions: ["Vilka ramavtal finns redan som vi kan avropa från?", "Vad kan vi lära av andra kommuners upphandlingar — vad fungerade och vad blev problem?", "Vilka prisnivåer ser vi i befintliga avtal?", "Finns det samordnad upphandling via SKR/Adda som vi bör beakta?"], tips: "Sök i upphandlingsdatabaser efter liknande upphandlingar. Kontakta kollegor i andra kommuner — erfarenhetsutbytet är ovärderligt och helt tillåtet enligt LOU." },
        { title: "Benchmark mot liknande organisationer", timeMinutes: 30, purpose: "Jämföra med liknande organisationers lösningar och erfarenheter för att kalibrera förväntningar.", method: "Presentation", facilitationQuestions: ["Vilka jämförbara organisationer (storlek, komplexitet) bör vi titta på?", "Vad har de valt för lösningar och hur nöjda är de?", "Vilka lärdomar kan vi dra av deras implementeringsresor?", "Finns det siffror på kostnader och tidsåtgång vi kan jämföra med?"], tips: "Kontakta 3-5 referenskommuner direkt. Ställ strukturerade frågor: vad valde ni, vad kostade det, vad skulle ni gjort annorlunda? Dokumentera svaren systematiskt." },
        { title: "RFI-strategi", timeMinutes: 25, purpose: "Planera om och hur en Request for Information (RFI) ska genomföras för att komplettera kunskapen.", method: "Brainstorming", facilitationQuestions: ["Vilka frågor behöver vi svar på som vi inte kan besvara utan leverantörskontakt?", "Ska vi genomföra RFI, marknadsdag eller enskilda leverantörsdialoger?", "Vilka leverantörer bör bjudas in och hur säkerställer vi likabehandling?", "Hur tidigt i processen bör vi genomföra RFI:n?"], tips: "Kom ihåg att all leverantörskontakt under upphandlingsprocessen måste ske med likabehandling. Dokumentera alla kontakter noggrant. En RFI är inte bindande men ger värdefull information." },
      ],
      preparation: "Sök i upphandlingsdatabaser (e-Avrop, TendSign, Mercell) efter liknande upphandlingar de senaste 3 åren. Samla in information om befintliga ramavtal. Förbered en kort sammanfattning av behovsanalysen.",
      followUp: ["Dokumentera marknadsanalysen i en strukturerad rapport med leverantörsöversikt", "Besluta om RFI eller marknadsdialog ska genomföras och i vilken form", "Uppdatera behovsanalysen med insikter från marknadsanalysen", "Upprätta en leverantörslista med kontaktuppgifter och produktbeskrivningar", "Kalibrera budget och tidsplan utifrån marknadens erbjudanden"],
      sparkboardSuggestion: [
        { boardTitle: "Marknadskännedom", questions: ["Vilka leverantörer har du hört talas om eller haft kontakt med inom detta område?", "Vilka erfarenheter har du av liknande system — bra eller dåliga?", "Vad tror du marknaden kan erbjuda som vi kanske inte tänkt på?"], timeLimit: 8 },
        { boardTitle: "RFI-frågor", questions: ["Vilka frågor skulle du vilja ställa till leverantörerna om du fick chansen?", "Vad behöver du veta för att kunna bedöma om en lösning passar er verksamhet?"], timeLimit: 6 },
      ],
    },
    {
      title: "Workshopmall: Utvärderingsdesign",
      description: "Workshop för att designa utvärderingsmodell och kriterier.",
      suggestedParticipants: ["Upphandlare", "Verksamhetsansvarig", "Jurist", "Kvalitetssäkrare"],
      agenda: ["Välj utvärderingsmodell (pris/kvalitet-balans)", "Definiera kriterier och vikter", "Skapa poängskalor med ankare", "Granska proportionalitet", "Dokumentera i utvärderingsprotokoll"],
      expectedOutputs: ["Utvärderingsmodell", "Kriteriematris med vikter", "Poängskalor"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Välj utvärderingsmodell (pris/kvalitet-balans)", timeMinutes: 30, purpose: "Bestämma grundmodell för utvärderingen: lägsta pris, bästa pris-kvalitetsförhållande eller bästa kvalitet till fast pris.", method: "Presentation", facilitationQuestions: ["Vad är viktigast i denna upphandling — pris eller kvalitet — och i vilken proportion?", "Har vi en tydlig budget som kan styra mot fast-pris-modell?", "Vilken utvärderingsmodell har använts i liknande upphandlingar?", "Finns det risk att lägsta-pris-modellen ger anbud som inte möter våra behov?"], tips: "Visa konkreta exempel på olika modeller och deras utfall. En 60/40-fördelning kvalitet/pris är vanlig vid IT-upphandlingar. Undvik komplicerade formler — juristen ska kunna förklara modellen i en överprövning." },
        { title: "Definiera kriterier och vikter", timeMinutes: 40, purpose: "Fastställa vilka utvärderingskriterier som ska användas och hur de viktas mot varandra.", method: "Brainstorming", facilitationQuestions: ["Vilka kvalitetsaspekter är avgörande för att upphandlingen ska bli lyckad?", "Hur ska vi vikta funktionalitet kontra implementeringskompetens?", "Finns det kriterier som är knock-out — dvs. underkänt leder till diskvalificering?", "Är vikterna proportionerliga i förhållande till verksamhetsnyttan?", "Kan vi motivera varje vikt inför en eventuell överprövning?"], tips: "Begränsa till 4-6 huvudkriterier. Fler kriterier gör utvärderingen ohanterlig och ökar risken för godtyckliga bedömningar. Varje kriterium ska vara mätbart och verifierbart." },
        { title: "Skapa poängskalor med ankare", timeMinutes: 40, purpose: "Definiera tydliga poängskalor med beskrivande ankarpunkter som minskar subjektiviteten i bedömningen.", method: "Brainstorming", facilitationQuestions: ["Vad skiljer ett utmärkt anbud från ett godkänt anbud rent konkret?", "Kan vi formulera ankare så att två oberoende utvärderare skulle ge samma poäng?", "Ska vi använda 0-5-skala, 1-3-skala eller annan gradering?", "Behöver vi exemplifiera med konkreta scenarier för varje poängnivå?"], tips: "Skriv ankare som beskriver observerbara egenskaper, inte vaga begrepp. 'Leverantören visar 3+ relevanta referensuppdrag' är bättre än 'God erfarenhet'. Testa skalan mot fiktiva anbud." },
        { title: "Granska proportionalitet", timeMinutes: 25, purpose: "Säkerställa att utvärderingsmodellen är proportionerlig och inte oavsiktligt diskriminerar leverantörer.", method: "Presentation", facilitationQuestions: ["Kan en liten leverantör med bra lösning konkurrera med denna modell?", "Finns det kriterier som oavsiktligt gynnar en specifik leverantör?", "Är vikterna motiverade utifrån verksamhetsbehov — inte preferenser?", "Skulle modellen klara en överprövning?"], tips: "Be juristen granska modellen ur ett LOU-perspektiv. Vanliga fallgropar: vikter som inte speglar faktiska behov, kriterier som bara en leverantör kan uppfylla, oklara ankare som ger utrymme för godtycke." },
        { title: "Dokumentera i utvärderingsprotokoll", timeMinutes: 20, purpose: "Skapa ett komplett utvärderingsprotokoll som grund för förfrågningsunderlaget.", method: "Presentation", facilitationQuestions: ["Är allt dokumenterat så att en utomstående kan förstå och tillämpa modellen?", "Finns alla motiveringar dokumenterade — varför just dessa kriterier och vikter?", "Hur kommunicerar vi utvärderingsmodellen till anbudsgivarna?"], tips: "Transparens är nyckeln. Anbudsgivarna ska förstå exakt hur deras anbud kommer utvärderas. Publicera hela modellen i förfrågningsunderlaget — det ger bättre anbud." },
      ],
      preparation: "Samla in behovsanalysen och kravspecifikationen. Granska utvärderingsmodeller från liknande upphandlingar (referensupphandlingar). Ha juristen förberedd med relevanta LOU-paragrafer och rättspraxis kring utvärderingsmodeller.",
      followUp: ["Dokumentera komplett utvärderingsmodell med kriterier, vikter och poängskalor", "Juridisk granskning av modellen ur LOU-perspektiv", "Testa modellen mot fiktiva anbud för att verifiera att den ger önskat utfall", "Integrera modellen i förfrågningsunderlaget"],
      sparkboardSuggestion: [
        { boardTitle: "Kvalitetskriterier", questions: ["Vad skiljer en riktigt bra leverantör från en medelmåttig — konkret?", "Vilka kvalitetsaspekter är du beredd att betala extra för?", "Beskriv ett scenario där lägsta pris INTE gav bästa resultat."], timeLimit: 8 },
      ],
    },
    {
      title: "Workshopmall: Kravrevidering",
      description: "Workshop för att revidera och kvalitetssäkra krav.",
      suggestedParticipants: ["Kravansvarig", "Verksamhetsansvarig", "IT-arkitekt", "Juridik"],
      agenda: ["Gå igenom befintliga krav", "Kontrollera spårbarhet till behov", "Granska SKA/BÖR-nivåer", "Kontrollera verifierbarhet", "Proportionalitetsbedömning"],
      expectedOutputs: ["Reviderad kravlista", "Spårbarhetsmatris", "Proportionalitetsanalys"],
      duration: "4h",
      profile: "",
      agendaDetailed: [
        { title: "Gå igenom befintliga krav", timeMinutes: 50, purpose: "Gå igenom kravlistan och verifiera att varje krav är tydligt, entydigt och mätbart. Identifiera oklara eller överlappande krav.", method: "Presentation", facilitationQuestions: ["Är kravet formulerat så att en leverantör entydigt kan förstå vad som efterfrågas?", "Finns det dubbletter eller överlappningar mellan kraven?", "Är kravet testbart — hur verifierar vi att det uppfylls?", "Finns det krav som är för tekniskt specificerade och styr mot en viss lösning?", "Saknas det krav som borde finnas baserat på behovsanalysen?"], tips: "Gå igenom krav för krav med projektorn. Markera varje krav med grön (OK), gul (behöver omformuleras) eller röd (stryk/skriv om). Begränsa diskussionen till 2 minuter per krav." },
        { title: "Kontrollera spårbarhet till behov", timeMinutes: 35, purpose: "Säkerställa att varje krav kan spåras tillbaka till ett identifierat behov. Krav utan behovsgrund ska ifrågasättas.", method: "Affinity mapping", facilitationQuestions: ["Vilket behov svarar detta krav mot — och finns det dokumenterat?", "Finns det behov som inte täcks av något krav?", "Finns det krav som inte kan kopplas till något identifierat behov — varför finns de?", "Har vi säkerställt att de viktigaste behoven (P1) har tillräcklig kravtäckning?"], tips: "Använd en matris med behov på ena axeln och krav på den andra. Tomma rader (behov utan krav) och tomma kolumner (krav utan behov) indikerar brister." },
        { title: "Granska SKA/BÖR-nivåer", timeMinutes: 40, purpose: "Kvalitetssäkra att rätt kravnivå (SKA = obligatoriskt, BÖR = önskvärt) är satt för varje krav.", method: "Dot-voting", facilitationQuestions: ["Är detta krav verkligen ett SKA-krav — kan vi inte leva utan det?", "Vad händer om vi sänker detta från SKA till BÖR — utesluter vi leverantörer i onödan?", "Finns det BÖR-krav som egentligen borde vara SKA — dvs. krav vi inte kan kompromissa om?", "Hur påverkar antalet SKA-krav konkurrensen — riskerar vi att få för få anbud?"], tips: "Tumregel: om ett SKA-krav inte är absolut nödvändigt, gör det till BÖR med hög vikt i utvärderingen istället. Det ger fler anbud och bättre konkurrens utan att ge avkall på kvalitet." },
        { title: "Kontrollera verifierbarhet", timeMinutes: 35, purpose: "Säkerställa att varje krav kan verifieras objektivt — antingen genom demo, test, referens eller dokumentation.", method: "Presentation", facilitationQuestions: ["Hur ska leverantören bevisa att kravet uppfylls — demo, referens, certifikat?", "Kan två oberoende bedömare komma fram till samma slutsats om kravet är uppfyllt?", "Finns det krav som bara kan verifieras genom att testa systemet i drift?", "Är verifieringsmetoden proportionerlig — kräver vi inte för mycket dokumentation?"], tips: "Ange verifieringsmetod direkt i kravlistan. Acceptabla metoder: demo, testfall, referens, certifikat, egendeklaration med rätt att verifiera. Undvik krav som bara kan verifieras i drift." },
        { title: "Proportionalitetsbedömning", timeMinutes: 40, purpose: "Säkerställa att kravmassan som helhet är proportionerlig och inte utgör ett onödigt hinder för leverantörer.", method: "Presentation", facilitationQuestions: ["Är kravmassan rimlig i förhållande till upphandlingens värde och komplexitet?", "Finns det krav som kan uppfattas som diskriminerande mot vissa leverantörskategorier?", "Kan en SME (liten/medelstor leverantör) rimligen svara på alla krav?", "Har vi tagit hänsyn till marknadens mognad — kan leverantörerna faktiskt uppfylla kraven?"], tips: "Jämför med liknande upphandlingar. Om ni har dubbelt så många krav som genomsnittet, fundera på om alla behövs. Fråga: 'Vad händer om vi tar bort detta krav — hur påverkas resultatet?'" },
      ],
      preparation: "Sammanställ befintlig kravlista med spårbarhet till behov. Förbered spårbarhetsmatrisen (behov-till-krav). Samla in referensupphandlingar med kravlistor för jämförelse. Ha en kopia av behovsanalysen tillgänglig.",
      followUp: ["Uppdatera kravlistan med alla ändringar från workshopen (omformuleringar, nivåändringar, strykningar)", "Komplettera spårbarhetsmatrisen med eventuella nya kopplingar", "Juridisk slutgranskning av reviderade krav ur LOU-perspektiv", "Cirkulera reviderad kravlista till verksamhetsansvariga för godkännande", "Lägg till verifieringsmetod för varje krav"],
      sparkboardSuggestion: [
        { boardTitle: "Kravkvalitet", questions: ["Vilket krav tycker du är otydligast formulerat och varför?", "Finns det krav som du tror leverantörerna kommer ha svårt att förstå?", "Vilket krav är du mest osäker på om det borde vara SKA eller BÖR?"], timeLimit: 8 },
        { boardTitle: "Saknade krav", questions: ["Finns det behov som du inte ser täckta i kravlistan?", "Vilka självklarheter saknas — saker vi förutsätter men inte har skrivit ner?"], timeLimit: 6 },
      ],
    },
    {
      title: "Workshopmall: Riskworkshop",
      description: "Workshop för riskidentifiering och riskbedömning.",
      suggestedParticipants: ["Projektledare", "IT-ansvarig", "Verksamhetsansvarig", "Juridik", "Säkerhetsansvarig"],
      agenda: ["Brainstorm risker per kategori", "Bedöm sannolikhet och konsekvens", "Prioritera (riskmatris)", "Definiera åtgärder per risk", "Tilldela riskägare"],
      expectedOutputs: ["Riskregister", "Riskmatris", "Åtgärdsplan"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Brainstorm risker per kategori", timeMinutes: 40, purpose: "Identifiera så många relevanta risker som möjligt inom kategorierna: teknisk, organisatorisk, juridisk, ekonomisk och leverantörsrelaterad.", method: "Brainstorming", facilitationQuestions: ["Vad kan gå fel tekniskt — med systemet, integrationer, data eller infrastruktur?", "Vilka organisatoriska risker finns — motstånd, resursbrist, kompetenstapp?", "Vilka juridiska risker finns — överprövning, GDPR-brister, avtalsrisker?", "Vilka ekonomiska risker finns — budgetöverdrag, dolda kostnader, valutarisker?", "Vilka leverantörsrisker finns — konkurs, inlåsning, nyckelpersoner som slutar?"], tips: "Kör brainstorm i tystnad först (5 min per kategori, skriv på lappar), sedan gruppering och diskussion. Det ger fler unika risker. Uppmuntra osannolika risker — det är ofta de mest destruktiva." },
        { title: "Bedöm sannolikhet och konsekvens", timeMinutes: 35, purpose: "Bedöma varje identifierad risk på en skala 1-5 för sannolikhet och konsekvens.", method: "Dot-voting", facilitationQuestions: ["Hur troligt är det att denna risk faktiskt inträffar under projektets livstid?", "Om risken inträffar — vad är den värsta konsekvensen?", "Har denna typ av risk inträffat i liknande projekt?", "Kan vi kvantifiera konsekvensen i tid eller pengar?"], tips: "Använd en 5-gradig skala för både sannolikhet och konsekvens. Låt deltagarna först bedöma individuellt, sedan diskutera avvikelser. Dokumentera motiveringen — inte bara siffran." },
        { title: "Prioritera (riskmatris)", timeMinutes: 25, purpose: "Placera alla risker i en riskmatris (sannolikhet x konsekvens) och identifiera de mest kritiska riskerna.", method: "Affinity mapping", facilitationQuestions: ["Vilka risker hamnar i den röda zonen (hög sannolikhet + hög konsekvens)?", "Finns det risker vi accepterar utan åtgärd — och varför?", "Hur många röda risker kan vi hantera parallellt med tillgängliga resurser?"], tips: "Rita matrisen på tavlan och flytta lappar in i rätt ruta. Röd zon = åtgärd krävs, gul = bevaka, grön = acceptera. Fokusera diskussionen på röda och gula risker." },
        { title: "Definiera åtgärder per risk", timeMinutes: 35, purpose: "Bestämma åtgärdsstrategi per risk: undvika, minska, överföra eller acceptera.", method: "Brainstorming", facilitationQuestions: ["Kan vi eliminera denna risk helt — till vilken kostnad?", "Kan vi minska sannolikheten eller konsekvensen med rimliga åtgärder?", "Kan vi överföra risken till leverantören via avtalsvillkor?", "Om vi accepterar risken — vad är vår beredskapsplan om den ändå inträffar?"], tips: "Var konkret med åtgärderna. 'Mitigera risk' är inte en åtgärd. 'Kräv escrow-avtal i upphandlingen' är en åtgärd. Ange vem, vad, och när för varje åtgärd." },
        { title: "Tilldela riskägare", timeMinutes: 20, purpose: "Utse en ansvarig person (riskägare) per risk som ansvarar för att åtgärden genomförs och risken bevakas.", method: "Presentation", facilitationQuestions: ["Vem har bäst förutsättningar att hantera denna risk?", "Har riskägaren mandat och resurser att genomföra åtgärden?", "Hur ofta ska riskregistret uppdateras och av vem?"], tips: "En risk utan ägare är en risk ingen hanterar. Riskägaren behöver inte göra allt själv men ansvarar för att åtgärden sker. Boka in riskrevidering i projektets stående mötesagenda." },
      ],
      preparation: "Förbered riskkategorier (teknisk, organisatorisk, juridisk, ekonomisk, leverantör). Samla in risklistor från liknande projekt. Ha en tom riskmatris (5x5) utskriven. Förbered riskmallarna från biblioteket som inspiration.",
      followUp: ["Dokumentera alla risker i ett strukturerat riskregister med sannolikhet, konsekvens och åtgärder", "Skapa den visuella riskmatrisen i projektverktyget", "Distribuera riskregistret till alla riskägare med deras specifika ansvar", "Lägg in riskreviderings-möten i projektkalendern (minst månadsvis)", "Integrera relevanta risker som kravställning i upphandlingsunderlaget"],
      sparkboardSuggestion: [
        { boardTitle: "Riskidentifiering", questions: ["Vad oroar dig mest med detta projekt/denna upphandling?", "Beskriv ett worst-case-scenario som vi måste planera för.", "Vilka risker har du sett i liknande projekt?", "Finns det risker som ingen vill prata om men som vi måste ta på allvar?"], timeLimit: 10 },
        { boardTitle: "Åtgärdsidéer", questions: ["Hur kan vi skydda oss mot leverantörsinlåsning?", "Vilka avtalsvillkor bör vi kräva för att hantera de största riskerna?"], timeLimit: 6 },
      ],
    },
    {
      title: "Workshopmall: Integrationsplanering",
      description: "Workshop för att planera systemintegrationer.",
      suggestedParticipants: ["IT-arkitekt", "Systemförvaltare", "Leverantör (befintliga system)", "Projektledare"],
      agenda: ["Kartlägg integrationslandskap", "Definiera dataflöden", "API-krav och format", "Autentisering och säkerhet", "Test- och godkännandestrategi"],
      expectedOutputs: ["Integrationskarta", "API-kravlista", "Testplan"],
      duration: "4h",
      profile: "",
      agendaDetailed: [
        { title: "Kartlägg integrationslandskap", timeMinutes: 50, purpose: "Skapa en komplett bild av vilka system som ska integreras, i vilken riktning data flödar och vilka beroenden som finns.", method: "Affinity mapping", facilitationQuestions: ["Vilka system behöver utbyta data med det nya systemet?", "Vilka integrationer finns idag och vilka är nya?", "Vilka system ägs av oss, vilka ägs av leverantörer och vilka är myndighetssystem?", "Finns det system som vi planerar att avveckla — behöver vi tillfälliga integrationer?", "Vilka integrationer är realtid och vilka kan vara batch/schemalagda?"], tips: "Rita ett integrationsdiagram på tavlan med det nya systemet i mitten. Dra linjer till varje system det ska integreras med. Ange riktning (pilar), frekvens och datamängd på varje linje." },
        { title: "Definiera dataflöden", timeMinutes: 45, purpose: "Detaljera vilken data som flödar mellan systemen, i vilken riktning, med vilken frekvens och vem som äger datan.", method: "Presentation", facilitationQuestions: ["Vilken data ska synkroniseras mellan systemen — och vem är master för varje dataobjekt?", "Hur ofta behöver data synkroniseras — realtid, dagligen, veckovis?", "Vad händer om en integration är nere — hur påverkas verksamheten?", "Finns det regelverk som styr vilken data som får överföras (GDPR, sekretess)?"], tips: "Skapa ett dataflödesdiagram per integration. Ange för varje flöde: dataobjekt, volym, frekvens, riktning, master-system och felhantering. Det blir grunden för API-kravställningen." },
        { title: "API-krav och format", timeMinutes: 40, purpose: "Specificera tekniska krav på API:er: format, protokoll, versionshantering och dokumentation.", method: "Brainstorming", facilitationQuestions: ["Vilka API-standarder stödjer de system vi ska integrera med (REST, SOAP, GraphQL)?", "Vilka dataformat ska användas (JSON, XML, CSV)?", "Hur ska versionshantering av API:er ske — vad händer vid uppgradering?", "Finns det branschstandarder vi bör följa (t.ex. SS12000 för skola, Mina meddelanden)?", "Vilka krav har vi på API-dokumentation?"], tips: "Standardisera på REST+JSON om möjligt. Kräv OpenAPI/Swagger-dokumentation. Undvik proprietära format — de skapar inlåsning. Fråga befintliga systemleverantörer om deras API-mognad innan workshopen." },
        { title: "Autentisering och säkerhet", timeMinutes: 35, purpose: "Definiera säkerhetskrav för integrationer: autentisering, auktorisering, kryptering och loggning.", method: "Presentation", facilitationQuestions: ["Vilken autentiseringsmetod ska användas för system-till-system-kommunikation (OAuth2, certifikat, API-nycklar)?", "Vilka krav finns på kryptering av data i transit och i vila?", "Hur ska behörighet hanteras — vilka system får läsa respektive skriva vilken data?", "Vilka loggningskrav finns på integrationstrafiken?"], tips: "Involvera informationssäkerhetsansvarig. Kräv minst TLS 1.2 för all kommunikation. OAuth2 med client credentials är standard för system-till-system. Logga alla API-anrop med tidsstämpel, avsändare och status." },
        { title: "Test- och godkännandestrategi", timeMinutes: 40, purpose: "Planera hur integrationer ska testas, godkännas och sättas i produktion.", method: "Brainstorming", facilitationQuestions: ["Hur ska vi testa integrationer — i gemensam testmiljö eller med mockar?", "Vilka testscenarier är kritiska: normala flöden, felhantering, stresstest?", "Vem godkänner att en integration är klar att sättas i produktion?", "Hur hanterar vi felsökning när integrationsproblem uppstår i drift?", "Behöver vi en gemensam integrationstestmiljö med alla parter?"], tips: "Planera testmiljöerna tidigt — de är ofta en flaskhals. Kräv att alla parter tillgängliggör testmiljöer. Skapa testfall som inkluderar felscenarier (timeout, felaktiga data, otillgängligt system)." },
      ],
      preparation: "Kartlägg befintliga integrationer och deras dokumentation. Samla in API-dokumentation från befintliga system. Bjud in systemförvaltare för alla system som ska integreras. Förbered ett tomt integrationsdiagram.",
      followUp: ["Dokumentera integrationskarta med alla system, dataflöden och beroenden", "Skapa detaljerade API-kravspecifikationer per integration", "Etablera gemensam testmiljö med alla integrationsparter", "Definiera SLA per integration (tillgänglighet, svarstider, felhantering)", "Planera integrationstest med tidslinje och ansvariga per integration"],
      sparkboardSuggestion: [
        { boardTitle: "Integrationsutmaningar", questions: ["Vilken integration oroar dig mest och varför?", "Beskriv ett problem du upplevt med en befintlig integration.", "Vilka system har dålig eller obefintlig API-dokumentation?", "Finns det integrationer som fungerar dåligt idag och måste bli bättre?"], timeLimit: 10 },
      ],
    },
    {
      title: "Workshopmall: Förändringsledning",
      description: "Workshop för att planera organisatorisk förändringsledning.",
      suggestedParticipants: ["Projektledare", "HR", "Enhetschefer", "Kommunikatör", "Fackrepresentant"],
      agenda: ["Intressentanalys", "Kommunikationsplan", "Utbildningsbehov och -plan", "Superanvändarstrategi", "Motstånd och hantering"],
      expectedOutputs: ["Förändringsledningsplan", "Kommunikationsplan", "Utbildningsplan"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Intressentanalys", timeMinutes: 35, purpose: "Identifiera alla intressentgrupper som påverkas av förändringen och bedöma deras inställning, inflytande och behov.", method: "Affinity mapping", facilitationQuestions: ["Vilka grupper berörs direkt av systembytet och hur påverkas deras arbetsvardag?", "Vilka personer eller grupper har störst inflytande på projektets framgång?", "Var förväntar vi oss mest motstånd — och varför?", "Vilka intressenter är positiva till förändringen och kan fungera som ambassadörer?", "Finns det fackliga aspekter vi behöver beakta?"], tips: "Placera intressenter i en intressentmatris (inflytande/intresse). Fokusera förändringsledningsinsatserna på grupper med hög påverkan. Glöm inte chefer i mellannivå — de är avgörande för framgång." },
        { title: "Kommunikationsplan", timeMinutes: 30, purpose: "Planera hur, när och av vem information om förändringen ska kommuniceras till olika intressentgrupper.", method: "Brainstorming", facilitationQuestions: ["Vilka budskap behöver nå ut till olika grupper och i vilken ordning?", "Vilka kommunikationskanaler är mest effektiva för respektive grupp?", "Vem ska stå som avsändare — projektet, ledningen eller enhetscheferna?", "Hur hanterar vi ryktesspridning och felaktig information?", "Hur ofta behöver vi kommunicera under projektets olika faser?"], tips: "Kommunicera tidigt och ofta. 'Varför' är viktigare än 'vad'. Använd enhetschefer som kommunikationskanal — de når sina team bäst. Boka regelbundna informationsträffar och använd intranätet aktivt." },
        { title: "Utbildningsbehov och -plan", timeMinutes: 35, purpose: "Kartlägga utbildningsbehov per grupp och planera utbildningsinsatser inför och efter go-live.", method: "Brainstorming", facilitationQuestions: ["Vilka kompetenser behöver de olika användargrupperna — och vad kan de redan?", "Vilken utbildningsform passar bäst: klassrum, e-learning, workshops, learning by doing?", "När i projektet ska utbildningen genomföras — och hur nära go-live?", "Hur följer vi upp att utbildningen har gett resultat?", "Behöver vi utbilda chefer separat — de har andra behov än slutanvändare?"], tips: "Utbilda inte för tidigt — folk glömmer snabbt. Ideal timing: 2-4 veckor före go-live. Kombinera olika format. Ge möjlighet att öva i testmiljö. Skapa lathundar och snabbguider som komplement." },
        { title: "Superanvändarstrategi", timeMinutes: 25, purpose: "Definiera en superanvändarstrategi med urval, utbildning, roll och mandat.", method: "Presentation", facilitationQuestions: ["Hur många superanvändare behöver vi och hur väljer vi ut dem?", "Vilka egenskaper ska en superanvändare ha — teknikintresse, ledarskap, tålamod?", "Vilken roll har superanvändaren i sin vardag efter go-live?", "Hur kompenserar vi superanvändare för den extra tid detta tar?"], tips: "Välj superanvändare med omsorg — de ska vara respekterade av kollegorna och genuint intresserade. Ge dem extra tid i sin tjänst för rollen. Starta utbildningen av superanvändare 1-2 månader före övriga." },
        { title: "Motstånd och hantering", timeMinutes: 25, purpose: "Identifiera potentiellt motstånd och ta fram strategier för att hantera det konstruktivt.", method: "Brainstorming", facilitationQuestions: ["Vilka typer av motstånd förväntar vi oss — aktivt, passivt, öppet, dolt?", "Vad ligger bakom motståndet — rädsla, osäkerhet, dåliga erfarenheter?", "Hur kan vi vända motstånd till engagemang?", "Vilka åtgärder behövs om nyckelpersoner aktivt motarbetar förändringen?"], tips: "Motstånd är naturligt och ofta rationellt. Lyssna genuint på invändningar — de innehåller ofta viktig information. Involvera skeptiker tidigt i processen, de blir ofta de bästa ambassadörerna om de blir hörda." },
      ],
      preparation: "Kartlägg organisationsstrukturen och alla berörda enheter. Samla in erfarenheter från tidigare förändringsinitiativ. Förbered en intressentkarta med preliminär bedömning. Stäm av med fack om samverkansprocessen.",
      followUp: ["Dokumentera förändringsledningsplanen med intressentanalys, kommunikationsplan och utbildningsplan", "Utse och rekrytera superanvändare i samråd med enhetschefer", "Starta kommunikationsinsatserna enligt den framtagna planen", "Planera och boka utbildningstillfällen", "Etablera en kanal för löpande feedback från organisationen under projektet"],
      sparkboardSuggestion: [
        { boardTitle: "Oro & förväntningar", questions: ["Vad oroar dig mest med det kommande systembytet?", "Vad ser du mest fram emot med det nya systemet?", "Vad behöver du för att känna dig trygg med förändringen?", "Beskriv ett tidigare systembyte — vad fungerade bra och vad var dåligt?"], timeLimit: 10 },
        { boardTitle: "Utbildning & stöd", questions: ["Hur lär du dig bäst — klassrum, video, prova själv?", "Vilken hjälp behöver du de första veckorna med ett nytt system?"], timeLimit: 6 },
      ],
    },
  ];

  for (const tmpl of workshopTemplates) {
    const { profile, ...workshopData } = tmpl;
    await prisma.libraryItem.create({
      data: {
        type: "workshop_template",
        profile: profile ?? "",
        title: tmpl.title, description: tmpl.description,
        content: JSON.stringify({ workshop: workshopData }),
        tags: JSON.stringify(["workshopmall"]),
      },
    });
  }

  console.log("  ✓ 10 workshopmallar");

  // ── KRITERIEBLOCK (4 st) ───────────────────────────────────

  const criteriaBlocks = [
    {
      title: "Kriterieblock: Funktionalitet",
      description: "Utvärderingskriterier för funktionell kvalitet",
      criteria: [
        { title: "Funktionell täckning", weight: 30, scale: "0-5", scoringGuidance: "Bedöm hur stor andel av SKA-krav som uppfylls fullt ut och hur väl BÖR-krav adresseras.", anchors: { "0": "Uppfyller inte grundkraven", "1": "Uppfyller <50% av SKA-krav", "2": "Uppfyller 50-75% av SKA-krav", "3": "Uppfyller alla SKA-krav", "4": "Uppfyller alla SKA + merparten BÖR", "5": "Uppfyller alla krav med mervärde" } },
        { title: "Användarvänlighet", weight: 15, scale: "0-5", scoringGuidance: "Bedöm gränssnittets intuitivitet, arbetsflöden och inlärningskurva.", anchors: { "0": "Oanvändbart", "2": "Kräver omfattande utbildning", "3": "Rimlig inlärningskurva", "5": "Intuitivt och effektivt" } },
        { title: "Flexibilitet och anpassningsbarhet", weight: 10, scale: "0-5", scoringGuidance: "Bedöm möjligheter till konfiguration utan programmeringsinsats." },
      ],
    },
    {
      title: "Kriterieblock: Pris",
      description: "Utvärderingskriterier för prisaspekter",
      criteria: [
        { title: "Total ägandekostnad (TCO)", weight: 25, scale: "0-5", scoringGuidance: "Bedöm total kostnad över avtalsperioden inkl. licenser, drift, support, anpassning.", anchors: { "0": "Högst kostnad bland anbuden", "3": "Genomsnittlig kostnad", "5": "Lägst kostnad bland anbuden" } },
        { title: "Pristransparens", weight: 5, scale: "0-5", scoringGuidance: "Bedöm hur tydligt och transparent prissättningen redovisas." },
      ],
    },
    {
      title: "Kriterieblock: Implementeringskvalitet",
      description: "Utvärderingskriterier för implementering och övergång",
      criteria: [
        { title: "Implementeringsplan", weight: 10, scale: "0-5", scoringGuidance: "Bedöm detaljrikedom, realism och riskhantering i leverantörens implementeringsplan.", anchors: { "0": "Ingen plan presenterad", "2": "Övergripande plan utan detaljer", "3": "Detaljerad plan med milstolpar", "5": "Excellent plan med riskhantering och referensfall" } },
        { title: "Migreringskapacitet", weight: 5, scale: "0-5", scoringGuidance: "Bedöm leverantörens erfarenhet och metodik för datamigrering." },
      ],
    },
    {
      title: "Kriterieblock: Leverantörskapacitet",
      description: "Utvärderingskriterier för leverantörens kapacitet och stabilitet",
      criteria: [
        { title: "Erfarenhet och referenser", weight: 10, scale: "0-5", scoringGuidance: "Bedöm leverantörens erfarenhet av liknande uppdrag inom offentlig sektor.", anchors: { "0": "Inga relevanta referenser", "2": "Begränsad erfarenhet", "3": "God erfarenhet (3+ liknande uppdrag)", "5": "Omfattande erfarenhet med verifierade resultat" } },
        { title: "Organisation och bemanning", weight: 5, scale: "0-5", scoringGuidance: "Bedöm föreslagna resurser, kompetens och tillgänglighet." },
      ],
    },
  ];

  for (const block of criteriaBlocks) {
    await prisma.libraryItem.create({
      data: {
        type: "criteria_block", profile: "", cluster: "Utvärdering",
        title: block.title, description: block.description,
        content: JSON.stringify({ criteria: block.criteria }),
        tags: JSON.stringify(["kriterier", "utvärdering"]),
      },
    });
  }

  console.log("  ✓ 4 kriterieblock");

  // ── KONTRAKTSKLAUSULER (6 st) ──────────────────────────────

  const contractClauses = [
    { title: "Exit-klausul", text: "Vid avtalsupphörande ska leverantören medverka till en ordnad övergång under minst 6 månader. Under exit-perioden ska full tillgång till data och system kvarstå.", rationale: "Förhindrar abrupt avslut och skyddar verksamheten.", cluster: "Kontraktsvillkor", level: "SKA" },
    { title: "SLA-villkor med vitesklausul", text: "Vid upprepade brott mot avtalade SLA-nivåer (mer än 3 månader under rullande 12-månadersperiod) har beställaren rätt till avdrag om 10% av månadskostnaden per brott.", rationale: "Incitament för leverantören att hålla servicenivåer.", cluster: "Kontraktsvillkor", level: "SKA" },
    { title: "GDPR-dataskyddsklausul", text: "Leverantören förbinder sig att behandla personuppgifter strikt i enlighet med PuB-avtal. All databehandling sker inom EU/EES. Brott mot dataskyddsvillkor utgör väsentligt avtalsbrott.", rationale: "GDPR-krav och skydd av registrerade.", cluster: "Kontraktsvillkor", level: "SKA" },
    { title: "Vitesklausul vid försenad leverans", text: "Vid försening av avtalad leverans utgår vite om 0,5% av kontraktsvärdet per påbörjad veckas försening, dock max 10% av totalt kontraktsvärde.", rationale: "Incitament för leverans i tid.", cluster: "Kontraktsvillkor", level: "SKA" },
    { title: "Optionsvillkor", text: "Beställaren har rätt att påkalla option för utökning av antalet användarlicenser, ytterligare moduler eller förlängning av avtalsperioden. Option ska påkallas senast 6 månader före avtalsperiodens utgång.", rationale: "Flexibilitet och framtidssäkring.", cluster: "Kontraktsvillkor", level: "BOR" },
    { title: "Ändringshantering", text: "Ändringar i leveransens omfattning hanteras via formell ändringsprocess. Varje ändring dokumenteras med konsekvensbeskrivning avseende kostnad, tid och kvalitet. Ingen ändring genomförs utan skriftligt godkännande.", rationale: "Kontroll över scope-creep.", cluster: "Kontraktsvillkor", level: "SKA" },
  ];

  for (const clause of contractClauses) {
    await prisma.libraryItem.create({
      data: {
        type: "contract_clause", profile: "", cluster: clause.cluster,
        title: `Kontraktsklausul: ${clause.title}`,
        description: clause.rationale,
        content: JSON.stringify({ clause }),
        tags: JSON.stringify(["kontraktsvillkor", "avtal"]),
      },
    });
  }

  console.log("  ✓ 6 kontraktsklausuler");

  // ── FASCHECKLISTOR (4 st) ──────────────────────────────────

  const phaseChecklists = [
    {
      title: "Faschecklista: Fas A — Analysera",
      description: "Checklista för att säkerställa att analysfasen är komplett",
      phase: "A_analysera",
      items: [
        { title: "Intressentanalys genomförd", description: "Alla relevanta intressenter identifierade med inflytande och intresse", required: true },
        { title: "Behovsworkshop(ar) genomförd(a)", description: "Minst en behovsworkshop med nyckelpersoner", required: true },
        { title: "Behov dokumenterade och prioriterade", description: "Alla behov har P1/P2/P3 och konsekvens vid ej uppfyllt", required: true },
        { title: "Nulägesanalys klar", description: "Befintliga system och processer dokumenterade", required: false },
        { title: "Marknadsanalys genomförd", description: "Potentiella leverantörer och lösningar identifierade", required: false },
        { title: "Förfarandeval gjort", description: "Öppet, selektivt eller förenklat förfarande valt och motiverat", required: true },
        { title: "Styrgrupp definierad", description: "Projektorganisation med roller och ansvar", required: true },
      ],
    },
    {
      title: "Faschecklista: Fas B — Förbered",
      description: "Checklista för att säkerställa att förberedelsfasen är komplett",
      phase: "B_forbered",
      items: [
        { title: "Kravspecifikation klar", description: "Alla krav dokumenterade med SKA/BÖR-nivå och spårbarhet till behov", required: true },
        { title: "Riskanalys genomförd", description: "Risker identifierade, bedömda och åtgärder definierade", required: true },
        { title: "Utvärderingsmodell definierad", description: "Kriterier, vikter och poängskalor fastställda", required: true },
        { title: "Verifieringsplan för SKA-krav", description: "Alla SKA-krav har verifieringsmetod (demo, intyg, test)", required: true },
        { title: "Kontraktsvillkor granskade", description: "Avtalsmall med SLA, viten, exit, GDPR mm genomgånget", required: true },
        { title: "Proportionalitetsbedömning gjord", description: "Krav bedömda ur proportionalitetssynpunkt", required: false },
        { title: "Upphandlingsdokument granskat", description: "Komplett upphandlingsdokument granskat av juridik", required: true },
      ],
    },
    {
      title: "Faschecklista: Fas C — Utvärdera",
      description: "Checklista för att säkerställa att utvärderingsfasen är komplett",
      phase: "C_utvardera",
      items: [
        { title: "Alla anbud mottagna och registrerade", description: "Alla inkomna anbud loggade med tidstämpel", required: true },
        { title: "Kvalificeringsprövning genomförd", description: "Varje anbud prövat mot kvalificeringskrav", required: true },
        { title: "Kravuppfyllelse bedömd", description: "Alla SKA-krav verifierade per kvalificerat anbud", required: true },
        { title: "Poängsättning genomförd", description: "Alla kriterier poängsatta per anbud med motivering", required: true },
        { title: "Utvärderingsprotokoll upprättat", description: "Samlad utvärdering dokumenterad och signerad", required: true },
        { title: "Tilldelningsbeslut fattat", description: "Beslut om vinnande anbud med motivering", required: true },
      ],
    },
    {
      title: "Faschecklista: Fas D — Genomför & förvalta",
      description: "Checklista för att säkerställa att genomförande och förvaltning planeras",
      phase: "D_genomfor",
      items: [
        { title: "Implementeringsplan godkänd", description: "Detaljerad plan med milstolpar och ansvar", required: true },
        { title: "Avtal signerat", description: "Kontrakt undertecknat av behörig firmatecknare", required: true },
        { title: "Migreringsplan godkänd", description: "Plan för dataöverföring med testmigrering", required: false },
        { title: "Utbildningsplan klar", description: "Plan för utbildning av slutanvändare och administratörer", required: true },
        { title: "Förvaltningsplan upprättad", description: "Roller, rutiner och SLA-uppföljning definierade", required: true },
        { title: "Avslutande leveransgodkännande", description: "Samtliga delleveranser godkända", required: true },
      ],
    },
  ];

  for (const checklist of phaseChecklists) {
    await prisma.libraryItem.create({
      data: {
        type: "phase_checklist", profile: "", cluster: checklist.phase,
        title: checklist.title, description: checklist.description,
        content: JSON.stringify({ checklist: { phase: checklist.phase, items: checklist.items } }),
        tags: JSON.stringify(["faschecklista", checklist.phase]),
      },
    });
  }

  console.log("  ✓ 4 faschecklistor");

  // ── EXTRA KRAVBLOCK (10 st) ─────────────────────────────────

  // 14. Användbarhet & UX
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Användbarhet",
      title: "Kravblock: Användbarhet & UX",
      description: "Krav för användarvänlighet, design och användarupplevelse",
      content: JSON.stringify({ requirements: [
        { title: "Responsiv design", reqType: "icke-funktionellt", level: "SKA", text: "Gränssnittet ska vara responsivt och fungera på skärmar från 320px till 4K.", rationale: "Användare arbetar på olika enheter.", cluster: "Användbarhet" },
        { title: "Kontextberoende hjälp", reqType: "funktion", level: "BOR", text: "Systemet bör ha inline-hjälptexter kopplade till respektive funktion.", rationale: "Minskar utbildningsbehov.", cluster: "Användbarhet" },
        { title: "Max 3 klick till vanlig funktion", reqType: "icke-funktionellt", level: "BOR", text: "De 10 vanligaste arbetsuppgifterna bör nås med max 3 klick/steg.", rationale: "Effektivitet i dagligt arbete.", cluster: "Användbarhet" },
      ] }),
      tags: JSON.stringify(["ux", "design", "användbarhet", "generisk"]),
    },
  });

  // 15. Rapportering & statistik
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Rapportering",
      title: "Kravblock: Rapportering & statistik",
      description: "Krav för rapportgenerering, dashboard och statistik",
      content: JSON.stringify({ requirements: [
        { title: "Dashboard med nyckeltal", reqType: "funktion", level: "SKA", text: "Systemet ska erbjuda konfigurerbara dashboards med realtidsnyckeltal.", rationale: "Överblick för beslutsfattare.", cluster: "Rapportering", verification: { bidEvidence: "Demo av dashboard" } },
        { title: "Ad-hoc rapporter", reqType: "funktion", level: "BOR", text: "Användare bör kunna skapa egna rapporter utan teknisk kompetens.", rationale: "Flexibilitet i rapportering.", cluster: "Rapportering" },
        { title: "Schemalagda rapporter", reqType: "funktion", level: "BOR", text: "Systemet bör stödja schemalagd generering och distribution av rapporter via e-post.", rationale: "Automatiserad uppföljning.", cluster: "Rapportering" },
        { title: "Exportformat", reqType: "funktion", level: "SKA", text: "Rapporter ska kunna exporteras i minst PDF och Excel-format.", rationale: "Kompatibilitet med befintliga arbetsflöden.", cluster: "Rapportering" },
      ] }),
      tags: JSON.stringify(["rapportering", "statistik", "dashboard", "generisk"]),
    },
  });

  // 16. Dokumenthantering
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Dokumenthantering",
      title: "Kravblock: Dokumenthantering",
      description: "Krav för dokumentlagring, versionshantering och arkivering",
      content: JSON.stringify({ requirements: [
        { title: "Versionshantering", reqType: "funktion", level: "SKA", text: "Alla dokument ska versionshanteras med möjlighet att se och återställa tidigare versioner.", rationale: "Spårbarhet och revisionssäkerhet.", cluster: "Dokumenthantering" },
        { title: "Sökbar dokumentbank", reqType: "funktion", level: "SKA", text: "Alla uppladdade dokument ska vara fulltextsökbara.", rationale: "Effektiv informationsåtkomst.", cluster: "Dokumenthantering" },
        { title: "Arkivering enligt regelverk", reqType: "funktion", level: "SKA", text: "Systemet ska stödja arkivering i enlighet med organisationens arkivplan.", rationale: "Lagkrav.", cluster: "Dokumenthantering" },
      ] }),
      tags: JSON.stringify(["dokument", "arkiv", "version", "generisk"]),
    },
  });

  // 17. Testning & kvalitetssäkring
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Kvalitet",
      title: "Kravblock: Testmiljö & kvalitetssäkring",
      description: "Krav för testning, staging och kvalitetssäkring",
      content: JSON.stringify({ requirements: [
        { title: "Separat testmiljö", reqType: "funktion", level: "SKA", text: "Leverantören ska tillhandahålla en separat testmiljö som speglar produktion.", rationale: "Säker testning utan produktionspåverkan.", cluster: "Kvalitet" },
        { title: "Regressionstestning vid uppdatering", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska genomföra regressionstester inför varje produktionsuppdatering.", rationale: "Förebygger buggar vid uppdateringar.", cluster: "Kvalitet" },
        { title: "Acceptanstestperiod", reqType: "kontraktsvillkor", level: "SKA", text: "Minst 4 veckors acceptanstestperiod ska ingå efter leverans av ny version.", rationale: "Tid att verifiera leverans.", cluster: "Kvalitet" },
      ] }),
      tags: JSON.stringify(["test", "kvalitet", "staging", "generisk"]),
    },
  });

  // 18. Utbildning & support
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Utbildning",
      title: "Kravblock: Utbildning & kunskapsöverföring",
      description: "Krav för utbildning, dokumentation och kunskapsöverföring",
      content: JSON.stringify({ requirements: [
        { title: "Grundutbildning", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska erbjuda grundutbildning för alla användarroller (administratörer, handläggare, chefer).", rationale: "Grundläggande för adoption.", cluster: "Utbildning" },
        { title: "Onlineutbildningsmaterial", reqType: "funktion", level: "BOR", text: "Systemet bör ha inbyggt utbildningsmaterial (videor, guider) tillgängligt för alla användare.", rationale: "Stödjer löpande lärande.", cluster: "Utbildning" },
        { title: "Administratörsutbildning", reqType: "kontraktsvillkor", level: "SKA", text: "Djupgående utbildning för systemadministratörer om konfiguration och förvaltning.", rationale: "Minskar leverantörsberoende.", cluster: "Utbildning" },
      ] }),
      tags: JSON.stringify(["utbildning", "support", "kunskapsöverföring", "generisk"]),
    },
  });

  // 19. Avfall — Taxa & fakturering
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "avfall_nyanskaffning", cluster: "Taxa & fakturering",
      title: "Kravblock: Taxemodell & fakturering",
      description: "Krav för taxehantering och fakturering inom avfallsverksamhet",
      content: JSON.stringify({ requirements: [
        { title: "Flexibel taxemodell", reqType: "funktion", level: "SKA", text: "Systemet ska stödja differentierade taxor baserat på abonnemangstyp, kärlstorlek, hämtfrekvens och eventuell viktbaserad debitering.", rationale: "Anpassning till kommunens taxemodell.", cluster: "Taxa & fakturering" },
        { title: "Taxeperiodhantering", reqType: "funktion", level: "SKA", text: "Systemet ska hantera taxeändringar med datum för ikraftträdande utan att förlora historik.", rationale: "Årliga taxeändringar.", cluster: "Taxa & fakturering" },
        { title: "Integration med ekonomisystem", reqType: "funktion", level: "SKA", text: "Systemet ska integrera med kommunens ekonomisystem för fakturautskick och reskontra.", rationale: "Undviker manuell hantering.", cluster: "Taxa & fakturering" },
      ] }),
      tags: JSON.stringify(["avfall", "taxa", "fakturering"]),
    },
  });

  // 20. Avfall — Digitala tjänster
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "avfall_nyanskaffning", cluster: "Digitala tjänster",
      title: "Kravblock: Kundportal & digitala tjänster",
      description: "Krav för självserviceportal och digitala kundtjänster inom avfallshantering",
      content: JSON.stringify({ requirements: [
        { title: "Min sida-portal", reqType: "funktion", level: "SKA", text: "Systemet ska erbjuda en kundportal ('Min sida') med BankID-inloggning för att se abonnemang, fakturor och hämtschema.", rationale: "Självservice minskar belastning på kundtjänst.", cluster: "Digitala tjänster" },
        { title: "Felanmälan via portal", reqType: "funktion", level: "SKA", text: "Kund ska kunna göra felanmälan (missad hämtning, skadat kärl) via portalen.", rationale: "24/7 tillgänglighet.", cluster: "Digitala tjänster" },
        { title: "Push-notiser", reqType: "funktion", level: "BOR", text: "Systemet bör stödja notiser (SMS/app/e-post) om förändrade hämtdagar eller störningar.", rationale: "Proaktiv kundkommunikation.", cluster: "Digitala tjänster" },
      ] }),
      tags: JSON.stringify(["avfall", "kundportal", "digital", "självservice"]),
    },
  });

  // 21. Socialtjänst — Statistik & uppföljning
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "socialtjanst_byte", cluster: "Rapportering",
      title: "Kravblock: Statistik & myndighetsrapportering",
      description: "Krav för statistikuttag och rapportering till myndigheter",
      content: JSON.stringify({ requirements: [
        { title: "SCB-rapportering", reqType: "funktion", level: "SKA", text: "Systemet ska generera rapporter i det format som krävs för SCB:s individstatistik (SoL, LSS, HSL).", rationale: "Lagstadgad rapporteringsskyldighet.", cluster: "Rapportering" },
        { title: "Öppna jämförelser", reqType: "funktion", level: "BOR", text: "Systemet bör stödja uttag av data för SKR:s Öppna jämförelser.", rationale: "Kvalitetsjämförelse mellan kommuner.", cluster: "Rapportering" },
        { title: "Verksamhetsstatistik", reqType: "funktion", level: "SKA", text: "Systemet ska tillhandahålla statistik per verksamhetsområde: ärenden, handläggningstider, insatser.", rationale: "Verksamhetsstyrning och beslutsunderlag.", cluster: "Rapportering" },
      ] }),
      tags: JSON.stringify(["socialtjänst", "statistik", "scb", "rapportering"]),
    },
  });

  // 22. Socialtjänst — E-tjänster
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "socialtjanst_byte", cluster: "Digitala tjänster",
      title: "Kravblock: E-tjänster socialtjänst",
      description: "Krav för digitala tjänster mot medborgare och brukare",
      content: JSON.stringify({ requirements: [
        { title: "Digital ansökan", reqType: "funktion", level: "BOR", text: "Systemet bör stödja digital ansökan om bistånd med e-legitimation.", rationale: "Tillgänglighet och effektivitet.", cluster: "Digitala tjänster" },
        { title: "Mina ärenden", reqType: "funktion", level: "BOR", text: "Brukare bör kunna följa sitt ärende digitalt (ärendestatus, nästa steg).", rationale: "Transparens mot medborgare.", cluster: "Digitala tjänster" },
        { title: "Säker meddelandefunktion", reqType: "funktion", level: "BOR", text: "Systemet bör erbjuda säker digital kommunikation mellan handläggare och brukare.", rationale: "Alternativ till telefon och brev.", cluster: "Digitala tjänster" },
      ] }),
      tags: JSON.stringify(["socialtjänst", "e-tjänster", "digital"]),
    },
  });

  // 23. Socialtjänst — IBIC
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "socialtjanst_byte", cluster: "Ärende/process",
      title: "Kravblock: IBIC-stöd",
      description: "Krav för Individens behov i centrum (IBIC) enligt Socialstyrelsens modell",
      content: JSON.stringify({ requirements: [
        { title: "IBIC-struktur i utredning", reqType: "funktion", level: "SKA", text: "Systemet ska stödja IBIC:s livsområden och ICF-kodning i utredningsprocessen.", rationale: "Socialstyrelsens rekommendation för systematisk utredning.", cluster: "Ärende/process" },
        { title: "Behovsinstrument", reqType: "funktion", level: "SKA", text: "Systemet ska inkludera behovsinstrument anpassat efter IBIC:s struktur.", rationale: "Standardiserad bedömning.", cluster: "Ärende/process" },
        { title: "Koppling till genomförandeplan", reqType: "funktion", level: "SKA", text: "IBIC-bedömda behov ska kunna kopplas direkt till mål i genomförandeplanen.", rationale: "Spårbarhet från behov till insats.", cluster: "Ärende/process" },
      ] }),
      tags: JSON.stringify(["socialtjänst", "ibic", "icf", "utredning"]),
    },
  });

  console.log("  ✓ 10 extra kravblock");

  // ── KRAVBLOCK: ICKE-FUNKTIONELLA IT-KRAV (12 st) ────────────────
  // Generiska icke-funktionella krav för IT-upphandling i offentlig sektor
  // 108 krav uppdelade i 12 tematiska kravblock

  // 1. Användare & behörigheter
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Användare & behörigheter",
      title: "Kravblock: Användare & behörigheter",
      description: "Krav på behörighetshantering, rollstyrning och automatiserad användarhantering för IT-system i offentlig sektor.",
      content: JSON.stringify({ requirements: [
        { title: "Beställaren styr behörigheter", reqType: "icke-funktionellt", level: "SKA", text: "Beställaren/kunden skall vara den part som styr behörigheter i systemet samt vilken form av autentisering som krävs för att nå vilken information och funktion i lösningen.", rationale: "Säkerställer att kunden har full kontroll över åtkomst till systemet.", cluster: "Användare & behörigheter" },
        { title: "Behörighetsstyrt gränssnitt", reqType: "funktion", level: "SKA", text: "Behörighetsfunktionen styr användares tillgång till data och funktioner i systemet. Med funktioner avses även det grafiska gränssnittet – om man ej har behörighet till en funktion skall den ej heller synas i det grafiska gränssnittet.", rationale: "Undviker förvirring och minskar risken för obehöriga åtkomstförsök.", cluster: "Användare & behörigheter" },
        { title: "Rollbaserade behörigheter", reqType: "funktion", level: "BOR", text: "Systemet bör hantera rollbaserade behörigheter. Om behörigheten ändras på en roll skall det slå igenom på alla som har den specifika rollen.", rationale: "Effektiv och skalbar behörighetshantering.", cluster: "Användare & behörigheter" },
        { title: "Multipla roller per användare", reqType: "funktion", level: "SKA", text: "En användare skall kunna ha flera roller.", rationale: "Stödjer organisationer där medarbetare har flera ansvarsområden.", cluster: "Användare & behörigheter" },
        { title: "Obegränsat antal roller", reqType: "funktion", level: "SKA", text: "Det skall gå att skapa ett obegränsat antal roller.", rationale: "Flexibilitet att anpassa behörighetsmodellen efter organisationens behov.", cluster: "Användare & behörigheter" },
        { title: "Behörighetshistorik", reqType: "funktion", level: "SKA", text: "Systemet skall behålla behörighetshistorik för en användare som tas bort eller görs inaktiv.", rationale: "Nödvändigt för spårbarhet och revision.", cluster: "Användare & behörigheter" },
        { title: "Gemensamt behörighetssystem", reqType: "icke-funktionellt", level: "BOR", text: "Systemet bör ha ett gemensamt behörighetssystem för alla delar och moduler.", rationale: "Undviker inkonsistenta behörighetsmodeller mellan systemdelar.", cluster: "Användare & behörigheter" },
        { title: "Automatiserad användarhantering", reqType: "funktion", level: "SKA", text: "Systemet ska stödja automatiserad provisionering av användare via minst en av följande tekniker: SCIM, REST-API, LDAPS eller filöverföring. Systemet måste även kunna hantera användare från olika domäner.", rationale: "Automatiserad användarhantering minskar manuellt arbete och säkerställer att behörigheter hålls aktuella.", cluster: "Användare & behörigheter" },
      ] }),
      tags: JSON.stringify(["behörigheter", "roller", "användarhantering", "generisk"]),
    },
  });

  // 2. Användargränssnitt
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Användargränssnitt",
      title: "Kravblock: Användargränssnitt",
      description: "Krav på tillgänglighet, responsivitet, webbläsarstöd och grafisk anpassningsbarhet för IT-system i offentlig sektor.",
      content: JSON.stringify({ requirements: [
        { title: "Responsiv design", reqType: "icke-funktionellt", level: "SKA", text: "Samtliga webbaserade gränssnitt skall vara responsiva (responsive web design) så att de anpassar sig efter den enhet som besökaren använder.", rationale: "Säkerställer användbarhet på alla enheter.", cluster: "Användargränssnitt" },
        { title: "WCAG 2.1 nivå AA", reqType: "icke-funktionellt", level: "SKA", text: "Samtliga webbaserade gränssnitt skall minimum uppfylla kraven enligt WCAG 2.1 nivå AA.", rationale: "Lagkrav enligt lagen om tillgänglighet till digital offentlig service.", cluster: "Användargränssnitt" },
        { title: "Tillgänglighetslagen", reqType: "icke-funktionellt", level: "SKA", text: "Samtliga delar i den offererade lösningen som omfattas av lagen (2018:1937) om tillgänglighet till digital offentlig service skall följa denna lagstiftning.", rationale: "Direkt lagkrav för offentlig sektor.", cluster: "Användargränssnitt" },
        { title: "Marknadsledande webbläsare", reqType: "icke-funktionellt", level: "SKA", text: "Samtliga webbaserade gränssnitt skall fungera utan väsentliga funktionsbrister i senaste versionen av marknadsledande webbläsare. Gränssnitt som kräver Silverlight, Shockwave eller Flash accepteras ej.", rationale: "Säkerställer bred kompatibilitet.", cluster: "Användargränssnitt" },
        { title: "Stöd för mobila operativsystem", reqType: "icke-funktionellt", level: "SKA", text: "Om den offererade lösningen använder appar skall dessa ha stöd för marknadsledande operativsystem för mobila enheter.", rationale: "Bred tillgänglighet på mobila enheter.", cluster: "Användargränssnitt" },
        { title: "Anpassningsbar visuell identitet", reqType: "funktion", level: "SKA", text: "Samtliga gränssnitt skall gå att anpassa grafiskt för att följa organisationens visuella identitet, minimum genom ändring av logotyper och färgscheman.", rationale: "Enhetlig visuell identitet stärker organisationens varumärke.", cluster: "Användargränssnitt" },
        { title: "Svenskt gränssnitt", reqType: "icke-funktionellt", level: "SKA", text: "Systemets gränssnitt mot användare skall vara på svenska.", rationale: "Grundläggande krav för svenska offentliga organisationer.", cluster: "Användargränssnitt" },
        { title: "Webbaserat utan klientinstallation", reqType: "icke-funktionellt", level: "SKA", text: "Systemet ska vara webbaserat i alla funktioner och inte kräva klientinstallation på PC.", rationale: "Minimerar driftkostnader och förenklar utrullning.", cluster: "Användargränssnitt" },
      ] }),
      tags: JSON.stringify(["tillgänglighet", "wcag", "gränssnitt", "generisk"]),
    },
  });

  // 3. Dokumentation
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Dokumentation",
      title: "Kravblock: Dokumentation",
      description: "Krav på system-, användar- och API-dokumentation samt kontextuella hjälptexter för IT-system.",
      content: JSON.stringify({ requirements: [
        { title: "Heltäckande dokumentation", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska tillhandahålla adekvat dokumentation för beställarens användare, förvaltningsorganisation och integratörer. Dokumentationen ska minst omfatta användarinstruktioner, systemdokumentation inklusive specifika inställningar och konfiguration, samt API-dokumentation.", rationale: "Nödvändigt för effektiv förvaltning och självständig drift.", cluster: "Dokumentation" },
        { title: "Systemdokumentation", reqType: "kontraktsvillkor", level: "SKA", text: "Systemdokumentationen ska innehålla adekvat beskrivning av tjänsten, systemkrav, systemdesign och kommunikation. Dokumentationen ska kompletteras med beställarens specifika inställningar.", rationale: "Säkerställer att beställaren förstår systemets arkitektur.", cluster: "Dokumentation" },
        { title: "Användarmanualer", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall tillhandahålla användarmanualer eller inbyggd hjälpfunktion för funktionaliteten i systemet.", rationale: "Minskar behovet av support och underlättar onboarding.", cluster: "Dokumentation" },
        { title: "Ändringslogg och releasenotes", reqType: "kontraktsvillkor", level: "SKA", text: "Ändringsdokumentation (changelog) och releasenotes skall produceras löpande i samband med leverans av ändringar och nya funktioner.", rationale: "Ger beställaren insyn i vad som förändrats mellan versioner.", cluster: "Dokumentation" },
        { title: "Felmeddelanden i klartext", reqType: "funktion", level: "SKA", text: "Systemet ska visa felmeddelanden i klartext som är begripliga för en slutanvändare, inte enbart felkoder.", rationale: "Förbättrar användarupplevelsen och minskar supportbehovet.", cluster: "Dokumentation" },
        { title: "Kontextuella hjälptexter", reqType: "funktion", level: "BOR", text: "Systemet bör innehålla funktionsorienterade hjälptexter kopplade till den sida och funktion användaren har framför sig. Hjälptexterna bör kunna ersättas med kundanpassade texter.", rationale: "Kontextuell hjälp ökar produktiviteten och möjliggör organisationsanpassning.", cluster: "Dokumentation" },
      ] }),
      tags: JSON.stringify(["dokumentation", "manualer", "hjälptexter", "generisk"]),
    },
  });

  // 4. Informationsmängder: Ägarskap & portabilitet
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Informationsmängder",
      title: "Kravblock: Dataägarskap & portabilitet",
      description: "Krav på dataägarskap, nyttjanderätt, exportmöjligheter och datamigration vid avveckling av IT-system.",
      content: JSON.stringify({ requirements: [
        { title: "Full ägande- och nyttjanderätt till data", reqType: "kontraktsvillkor", level: "SKA", text: "All data och information som beställaren genererar och lagrar i systemet skall beställaren ha full kostnadsfri ägande- och nyttjanderätt till.", rationale: "Grundläggande krav för att undvika leverantörsinlåsning.", cluster: "Informationsmängder" },
        { title: "Ingen delning utan godkännande", reqType: "kontraktsvillkor", level: "SKA", text: "All data som lagras i systemet ska ägas av kunden och leverantören har ingen rätt att dela denna data med andra aktörer eller använda kundens data utan kundens explicita godkännande.", rationale: "Skyddar kundens informationstillgångar.", cluster: "Informationsmängder" },
        { title: "Nyttjanderätt efter avtal", reqType: "kontraktsvillkor", level: "SKA", text: "All data som leverantören skapar eller tillhandahåller i systemet under avtalstiden ska kunden erhålla en nyttjanderätt som innebär att kunden kan använda och dela data vidare även efter avtalets upphörande.", rationale: "Säkerställer att kundens datatillgång inte är beroende av avtalsrelationen.", cluster: "Informationsmängder" },
        { title: "Förvarning vid datamodellförändringar", reqType: "kontraktsvillkor", level: "SKA", text: "Vid förändringar i systemets datamodell, datahantering eller funktioner för informationsutbyte ska leverantören skriftligen underrätta kunden inom skälig tid och tillhandahålla dokumentation, testmiljö och testdata.", rationale: "Förhindrar oväntade konsekvenser för integrationer och processer.", cluster: "Informationsmängder" },
        { title: "Export med bibehållen integritet", reqType: "funktion", level: "SKA", text: "Data i systemet ska kunna exporteras med bibehållen funktionalitet utan att informationens autenticitet, tillförlitlighet och integritet påverkas.", rationale: "Krävs för dataportabilitet och leverantörsoberoende.", cluster: "Informationsmängder" },
        { title: "Migrationsstöd vid avveckling", reqType: "kontraktsvillkor", level: "SKA", text: "Vid avveckling ska leverantören kostnadsfritt tillhandahålla kompetens och resurser för att exportera och migrera data till annat system, samt bistå med dokumentation.", rationale: "Minskar risken och kostnaden vid systembyte.", cluster: "Informationsmängder" },
        { title: "Dokumentation av API och datautbyte", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska på kundens begäran tillhandahålla dokumentation av systemets funktioner för datautbyte inklusive API:er, standarder och metadata.", rationale: "Nödvändigt för integration och analys.", cluster: "Informationsmängder" },
        { title: "Radering vid avtalsupphörande", reqType: "kontraktsvillkor", level: "SKA", text: "När avtalet upphör ska leverantören radera all kunddata senast 30 dagar efter att kunden meddelat detta.", rationale: "Säkerställer att data inte finns kvar hos leverantören efter avslutad relation.", cluster: "Informationsmängder" },
      ] }),
      tags: JSON.stringify(["dataägarskap", "portabilitet", "export", "generisk"]),
    },
  });

  // 5. Informationsmängder: Arkivering & gallring
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Informationsmängder",
      title: "Kravblock: Arkivering & gallring",
      description: "Krav på e-arkiv, FGS-stöd, gallringsfunktioner och långtidsbevarande för IT-system i offentlig sektor.",
      content: JSON.stringify({ requirements: [
        { title: "Stöd för e-arkiv (FGS Paketstruktur)", reqType: "funktion", level: "SKA", text: "Systemet skall ha stöd för att exportera information till beställarens e-arkiv enligt Riksarkivets FGS Paketstruktur.", rationale: "Standardiserad arkiveringsprocess enligt Riksarkivets krav.", cluster: "Informationsmängder" },
        { title: "Riksarkivets föreskrifter", reqType: "icke-funktionellt", level: "SKA", text: "Systemet ska följa Riksarkivets föreskrifter, rekommendationer och specifikationer gällande information som ska bevaras, inklusive arkivbeständiga filformat.", rationale: "Lagkrav för offentlig verksamhet.", cluster: "Informationsmängder" },
        { title: "Gallring vid valfri tidpunkt", reqType: "funktion", level: "SKA", text: "Föreskriven eller beslutad gallring av information i systemet skall kunna utföras vid valfri tidpunkt.", rationale: "Nödvändigt för att uppfylla dokumenthanteringsplanen.", cluster: "Informationsmängder" },
        { title: "Oåterkallelig gallring", reqType: "funktion", level: "SKA", text: "Gallrad information skall gallras på ett sådant sätt att den inte går att återskapa.", rationale: "Uppfyller juridiska krav och dataskyddslagstiftning.", cluster: "Informationsmängder" },
        { title: "Separering av gallringsbar information", reqType: "funktion", level: "SKA", text: "I systemet ska det vara möjligt att skilja på information som ska bevaras från gallringsbar information, samt att skilja på information med olika gallringsfrister.", rationale: "Grundläggande för korrekt informationshantering enligt arkivlag.", cluster: "Informationsmängder" },
        { title: "Automatiserad gallring", reqType: "funktion", level: "SKA", text: "Systemet ska ha funktion för att automatiskt radera data med definierade intervall enligt uppsatta regler. Gallringsfunktionen ska vara behörighetsstyrd.", rationale: "Automatisering minskar risk för förbiseende.", cluster: "Informationsmängder" },
        { title: "Gallringsrapporter", reqType: "funktion", level: "SKA", text: "Systemet ska ha funktion för rapporter över utförd gallring. Begärd gallring ska kunna kontrolleras innan den verkställs.", rationale: "Spårbarhet och kontroll av gallringsåtgärder.", cluster: "Informationsmängder" },
        { title: "Långtidsbevarande i XML", reqType: "funktion", level: "SKA", text: "Uttag för långtidsbevarande ska kunna ske i XML-format med tillhörande XML-schema (XSD) samt extern XSL-stilmall.", rationale: "Standardiserat format för långtidsbevarande i offentlig sektor.", cluster: "Informationsmängder" },
      ] }),
      tags: JSON.stringify(["arkivering", "gallring", "e-arkiv", "riksarkivet", "generisk"]),
    },
  });

  // 6. Informationssäkerhet: Leverantörskrav
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Informationssäkerhet",
      title: "Kravblock: Informationssäkerhet – Leverantörskrav",
      description: "Krav på leverantörens ledningssystem för informationssäkerhet, åtkomststyrning och säker utvecklingsmetodik.",
      content: JSON.stringify({ requirements: [
        { title: "Ledningssystem för informationssäkerhet", reqType: "icke-funktionellt", level: "SKA", text: "Leverantören skall ha ett ledningssystem för informationssäkerhet (LIS) baserat på ISO/IEC 27001 eller motsvarande med dokumenterade roller, ansvar och befogenheter.", rationale: "Grundläggande trygghetskrav för offentlig sektors IT-upphandling.", cluster: "Informationssäkerhet" },
        { title: "Säkerhetspolicy för distansarbete", reqType: "icke-funktionellt", level: "SKA", text: "Leverantören skall ha policy och säkerhetsåtgärder som skyddar information vid distansarbete avseende drift, förvaltning och support.", rationale: "Distansarbete kräver särskild hantering av informationssäkerhet.", cluster: "Informationssäkerhet" },
        { title: "Säkerhetsklassad personal", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall garantera att endast säkerhetsklassad och godkänd personal har tillgång till beställarens information.", rationale: "Skyddar mot obehörig åtkomst till känslig information.", cluster: "Informationssäkerhet" },
        { title: "Regelbundna risk- och sårbarhetsanalyser", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall genomföra risk- och sårbarhetsanalyser minst årligen. Identifierade brister skall åtgärdas enligt dokumenterad plan.", rationale: "Proaktiv säkerhetshantering minskar risken för incidenter.", cluster: "Informationssäkerhet" },
        { title: "Minsta möjliga behörighet", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantörens behörigheter skall tilldelas enligt principen om minsta möjliga behörighet utifrån roll och arbetsuppgifter.", rationale: "Grundprincip i informationssäkerhet (principle of least privilege).", cluster: "Informationssäkerhet" },
        { title: "Krypteringsrutiner", reqType: "icke-funktionellt", level: "SKA", text: "Leverantören skall ha rutiner för kryptering med dokumenterade algoritmer, protokoll, nyckellängder och nyckelhantering.", rationale: "Säkerställer adekvat skydd av data i transit och lagring.", cluster: "Informationssäkerhet" },
        { title: "Backup geografiskt åtskild", reqType: "funktion", level: "SKA", text: "Leverantören skall ha funktioner för återställande av information. Säkerhetskopior skall skyddas enligt samma nivåer som originalet och förvaras geografiskt åtskilt.", rationale: "Skyddar mot dataförlust.", cluster: "Informationssäkerhet" },
        { title: "Säker utvecklingsmetodik", reqType: "icke-funktionellt", level: "SKA", text: "Leverantören skall ha dokumenterade principer för utveckling av säkra system. Vid webbutveckling ska OWASP:s rekommendationer eller motsvarande följas.", rationale: "Säker utveckling minskar sårbarheter i levererad programvara.", cluster: "Informationssäkerhet" },
      ] }),
      tags: JSON.stringify(["informationssäkerhet", "iso27001", "leverantörskrav", "generisk"]),
    },
  });

  // 7. Informationssäkerhet: Loggning & dataskydd
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Informationssäkerhet",
      title: "Kravblock: Loggning & dataskydd",
      description: "Krav på loggning av säkerhetshändelser, spårbarhet av personuppgiftsbehandling och incidenthantering.",
      content: JSON.stringify({ requirements: [
        { title: "Loggning av säkerhetshändelser", reqType: "funktion", level: "SKA", text: "Loggningsfunktioner skall finnas för säkerhetsrelaterade händelser, minst för felaktiga inloggningar, förändring av behörigheter och överträdelser.", rationale: "Grundläggande för att upptäcka och utreda säkerhetsincidenter.", cluster: "Informationssäkerhet" },
        { title: "Loggning av behörighetsförändringar", reqType: "funktion", level: "SKA", text: "Behörighetssystemet skall logga när användare skapades, togs bort eller förändrades samt senaste inloggning.", rationale: "Spårbarhet av behörighetsförändringar är kritiskt för revision.", cluster: "Informationssäkerhet" },
        { title: "Konfigurerbar loggningstid", reqType: "funktion", level: "SKA", text: "Tiden som logginformation sparas skall kunna bestämmas av beställaren.", rationale: "Organisationen måste kunna anpassa lagring efter lagkrav.", cluster: "Informationssäkerhet" },
        { title: "Spårbarhet vid personuppgiftsbehandling", reqType: "funktion", level: "SKA", text: "Vid hantering av personuppgifter skall systemet logga vem som behandlat uppgiften, tidpunkt, vilken uppgift och vad behandlingen bestod av.", rationale: "GDPR kräver dokumenterad spårbarhet.", cluster: "Informationssäkerhet" },
        { title: "Självbetjäning för logggranskning", reqType: "funktion", level: "SKA", text: "Systemet skall möjliggöra för beställaren att själv granska användarrelaterade loggar.", rationale: "Beställaren behöver kunna granska loggar utan leverantörsberoende.", cluster: "Informationssäkerhet" },
        { title: "Skydd av loggar mot manipulation", reqType: "icke-funktionellt", level: "SKA", text: "Leverantören skall skydda loggningsfunktioner och loggningsverktyg mot manipulation och obehörig åtkomst.", rationale: "Loggar är bevis vid incidenter och får inte kunna manipuleras.", cluster: "Informationssäkerhet" },
        { title: "Incidenthanteringsrutiner", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall ha dokumenterade rutiner för utredning av säkerhetsincidenter enligt gällande lagar.", rationale: "Strukturerad incidenthantering minskar skadan vid säkerhetshändelser.", cluster: "Informationssäkerhet" },
        { title: "Personuppgiftsbiträdesavtal", reqType: "kontraktsvillkor", level: "SKA", text: "Vid behandling av personuppgifter i systemet skall biträdesavtal tecknas vid avtalsstart.", rationale: "Lagkrav enligt GDPR.", cluster: "Informationssäkerhet" },
      ] }),
      tags: JSON.stringify(["loggning", "dataskydd", "gdpr", "spårbarhet", "generisk"]),
    },
  });

  // 8. Integration & API
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Integration & API",
      title: "Kravblock: Integration & API",
      description: "Krav på integrationsgränssnitt, API-dokumentation, import/export och schemalagd datahantering.",
      content: JSON.stringify({ requirements: [
        { title: "Dokumenterade integrationsgränssnitt", reqType: "funktion", level: "SKA", text: "Samtliga system skall ha definierade och dokumenterade integrationsgränssnitt (Web Services, API). Dessa skall tillgängliggöras utan extra kostnad.", rationale: "Grundkrav för interoperabilitet.", cluster: "Integration & API" },
        { title: "Import och export i standardformat", reqType: "funktion", level: "SKA", text: "Systemet ska ha import- och exportfunktionalitet i minst XML- och CSV-format.", rationale: "Standardformat möjliggör datautbyte utan specialanpassningar.", cluster: "Integration & API" },
        { title: "Säkra API:er", reqType: "icke-funktionellt", level: "SKA", text: "Leverantören ansvarar för att extern åtkomst via API:er är säker och att obehöriga inte kan få åtkomst till data.", rationale: "API-säkerhet skyddar informationstillgångar.", cluster: "Integration & API" },
        { title: "Diggs REST API-profil", reqType: "icke-funktionellt", level: "BOR", text: "Diggs allmänna krav på REST-API:er bör följas.", rationale: "Standardisering underlättar interoperabilitet i offentlig sektor.", cluster: "Integration & API" },
        { title: "Strukturerad API-dokumentation", reqType: "kontraktsvillkor", level: "BOR", text: "API:erna bör finnas dokumenterade i Swagger/OpenAPI eller liknande ramverk.", rationale: "Standardiserad dokumentation sänker tröskeln för integration.", cluster: "Integration & API" },
        { title: "Förvarning vid API-förändringar", reqType: "kontraktsvillkor", level: "SKA", text: "Vid planerad utfasning, ersättning eller borttagning av API ska leverantören i god tid meddela beställaren.", rationale: "Ger tid att anpassa integrationer.", cluster: "Integration & API" },
        { title: "Schemalagd import och export", reqType: "funktion", level: "SKA", text: "Systemet skall kunna starta processer för inläsning och export av data utifrån förinställt klockslag eller tidsintervall utan manuell åtgärd.", rationale: "Automatiserad datahantering minskar manuellt arbete.", cluster: "Integration & API" },
        { title: "Integrationsstatus", reqType: "funktion", level: "SKA", text: "Systemet skall visa status över utförda och pågående integrationer och bearbetningar.", rationale: "Ger insyn i att integrationer fungerar korrekt.", cluster: "Integration & API" },
      ] }),
      tags: JSON.stringify(["integration", "api", "interoperabilitet", "generisk"]),
    },
  });

  // 9. Support & kundtjänst
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Support & kundtjänst",
      title: "Kravblock: Support & kundtjänst",
      description: "Krav på supportfunktion, öppettider, kundansvarig och ärendehantering för IT-leverantörer.",
      content: JSON.stringify({ requirements: [
        { title: "Supportfunktion på svenska", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören ska ha supportfunktion nåbar via telefon, e-post och eventuell chat. All kommunikation ska ske på svenska.", rationale: "Grundläggande tillgänglighet för supportärenden.", cluster: "Support & kundtjänst" },
        { title: "Öppettider helgfria vardagar", reqType: "kontraktsvillkor", level: "SKA", text: "Öppettider för supportfunktion skall vara helgfri vardag kl 08:00 till 17:00.", rationale: "Säkerställer tillgänglighet under arbetstid.", cluster: "Support & kundtjänst" },
        { title: "Kundansvarig kontaktperson", reqType: "kontraktsvillkor", level: "SKA", text: "Det skall finnas en utsedd kundansvarig för löpande kontakter, dialog om systemets utveckling och eskalering av ärenden.", rationale: "Namngiven kontaktperson underlättar kommunikation.", cluster: "Support & kundtjänst" },
        { title: "Tillgång till ärendehistorik", reqType: "funktion", level: "SKA", text: "Beställaren skall ha tillgång till historiska ärenden och kunna erhålla statistik från leverantören.", rationale: "Möjliggör uppföljning av servicenivå.", cluster: "Support & kundtjänst" },
        { title: "Teknisk support mot tredje part", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall tillhandahålla teknisk support gentemot beställaren och tredjepartsleverantörer.", rationale: "Nödvändigt i miljöer med flera leverantörer.", cluster: "Support & kundtjänst" },
        { title: "Återrapportering inom 8 timmar", reqType: "kontraktsvillkor", level: "SKA", text: "Avslutade ärenden skall återrapporteras till anmälaren senast 8 timmar efter åtgärdande.", rationale: "Snabb återkoppling säkerställer att ärenden bekräftas lösta.", cluster: "Support & kundtjänst" },
      ] }),
      tags: JSON.stringify(["support", "kundtjänst", "sla", "generisk"]),
    },
  });

  // 10. Teknik & autentisering
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Teknik & autentisering",
      title: "Kravblock: Teknik & autentisering",
      description: "Krav på federerad inloggning, MFA, testmiljö och teknisk infrastruktur för IT-system.",
      content: JSON.stringify({ requirements: [
        { title: "Federerad inloggning (SAML/OIDC)", reqType: "funktion", level: "SKA", text: "Inloggning för interna användare ska ske via befintliga AD-konton med federerad inloggning via SAML 2.0 eller OpenID Connect.", rationale: "SSO förenklar inloggning och centraliserar behörighetshantering.", cluster: "Teknik & autentisering" },
        { title: "Stark autentisering via federation", reqType: "funktion", level: "SKA", text: "Stark autentisering (t.ex. BankID eller Freja+) för interna och externa användare ska ske via beställarens identitetslösning.", rationale: "Centraliserad autentisering ger enhetlig säkerhetsnivå.", cluster: "Teknik & autentisering" },
        { title: "Behörighet från identitetsintyg", reqType: "funktion", level: "SKA", text: "Behörighet ska baseras på federerad identitetsdata i identitetsintyget som grund för behörighetsprofiler.", rationale: "Möjliggör automatisk rollmappning.", cluster: "Teknik & autentisering" },
        { title: "MFA för lokala konton", reqType: "icke-funktionellt", level: "SKA", text: "Om systemet erbjuder lokala konton ska dessa skyddas av MFA med FIDO2 eller OATH-TOTP.", rationale: "Lokala konton utan MFA utgör en allvarlig säkerhetsrisk.", cluster: "Teknik & autentisering" },
        { title: "Testmiljö inkluderad", reqType: "kontraktsvillkor", level: "SKA", text: "En testmiljö som kopia av produktionsmiljön ska ingå i leveransen. Leverantören ska kunna kopiera data från produktion till test.", rationale: "Testmiljö möjliggör verifiering utan risk för produktionsdata.", cluster: "Teknik & autentisering" },
        { title: "MDM/EMM-distribution", reqType: "funktion", level: "SKA", text: "Systemets appar ska stödja distribution och konfiguration via EMM/MDM-lösningar.", rationale: "Centraliserad appdistribution minskar administrationskostnader.", cluster: "Teknik & autentisering" },
        { title: "Ingen hårdvarulåst licensiering", reqType: "icke-funktionellt", level: "SKA", text: "Systemet skall inte använda licensiering som låser installationen till visst hårdvaru-id, vilket försvårar drift i virtualiserad miljö.", rationale: "Virtualisering är standard i modern IT-drift.", cluster: "Teknik & autentisering" },
        { title: "Anpassningar bevaras vid uppgradering", reqType: "icke-funktionellt", level: "SKA", text: "Systemet skall bibehålla kundanpassad tilläggsfunktionalitet vid uppgraderingar och versionsbyten.", rationale: "Skyddar beställarens investeringar i anpassningar.", cluster: "Teknik & autentisering" },
      ] }),
      tags: JSON.stringify(["autentisering", "sso", "saml", "mfa", "generisk"]),
    },
  });

  // 11. Underhåll & releasehantering
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Underhåll",
      title: "Kravblock: Underhåll & releasehantering",
      description: "Krav på releasehantering, felklassning, åtgärdstider och underhåll av kundunika lösningar.",
      content: JSON.stringify({ requirements: [
        { title: "Kostnadsfria releaser", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall kostnadsfritt tillhandahålla nya releaser och versioner av systemet.", rationale: "Beställaren ska få buggfixar och förbättringar utan tilläggskostnad.", cluster: "Underhåll" },
        { title: "Löpande information om releaseplaner", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall kontinuerligt informera om pågående arbete, releaseplaner, avvikelser och upptäckta problem.", rationale: "Transparens möjliggör bättre planering.", cluster: "Underhåll" },
        { title: "Testade releaser", reqType: "kontraktsvillkor", level: "SKA", text: "Alla nya releaser skall vara testade och godkända av leverantören innan de införs.", rationale: "Minskar risken för driftstörningar.", cluster: "Underhåll" },
        { title: "Skriftlig ändringsdokumentation", reqType: "kontraktsvillkor", level: "SKA", text: "Innehållet i uppgraderingar skall meddelas skriftligt med förändringar beskrivna på teknisk nivå, administratörsnivå och användarnivå.", rationale: "Ger beställaren möjlighet att bedöma påverkan.", cluster: "Underhåll" },
        { title: "Rätt att senarelägga uppgraderingar", reqType: "kontraktsvillkor", level: "SKA", text: "Beställaren skall ha rätt att senarelägga uppgraderingar med bibehållna servicenivåer.", rationale: "Beställaren behöver kunna styra tidpunkt utifrån sin verksamhet.", cluster: "Underhåll" },
        { title: "Underhåll av kundunika anpassningar", reqType: "kontraktsvillkor", level: "SKA", text: "Underhållsavgiften skall inkludera underhåll av kundunika lösningar (anpassningar, integrationer).", rationale: "Undviker oväntade tilläggskostnader.", cluster: "Underhåll" },
        { title: "Felavhjälpningsskyldighet", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall åtgärda dokumenterade fel. Fel är inte åtgärdat förrän systemet fungerar enligt avtal.", rationale: "Tydligt ansvar skyddar beställaren.", cluster: "Underhåll" },
        { title: "Felklassificering i fyra nivåer", reqType: "kontraktsvillkor", level: "SKA", text: "Fel klassas efter påverkan: Kritisk (alla användare berörs), Hög (vissa användare), Medium (fåtal, verksamheten fortgår), Låg (mindre avvikelser). Klassning föreslås av beställaren.", rationale: "Standardiserad felklassificering möjliggör tydliga SLA-åtaganden.", cluster: "Underhåll" },
      ] }),
      tags: JSON.stringify(["underhåll", "releasehantering", "felhantering", "generisk"]),
    },
  });

  // 12. Utveckling & utbildning
  await prisma.libraryItem.create({
    data: {
      type: "requirement_block", profile: "", cluster: "Utveckling",
      title: "Kravblock: Utveckling & utbildning",
      description: "Krav på utbildning, vidareutveckling, användarsamverkan och utvecklingsplan för IT-leverantörer.",
      content: JSON.stringify({ requirements: [
        { title: "Utbildning för användargrupper", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall tillhandahålla utbildning inklusive dokumentation för aktuella användargrupper.", rationale: "Utbildning är avgörande för framgångsrik adoption.", cluster: "Utveckling" },
        { title: "Möjlighet att föreslå vidareutveckling", reqType: "kontraktsvillkor", level: "SKA", text: "Beställaren skall kunna lämna förslag om vidareutveckling. Leverantören ska redogöra för hur förslag tillvaratas.", rationale: "Säkerställer att systemet utvecklas i linje med behoven.", cluster: "Utveckling" },
        { title: "Användarsamverkan", reqType: "kontraktsvillkor", level: "BOR", text: "Leverantören bör ha en organisation för samverkan med användare, t.ex. en användarförening.", rationale: "Användarforum ger möjlighet att påverka och dela erfarenheter.", cluster: "Utveckling" },
        { title: "Utvecklingsplan", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall ange utvecklingsplan för kommande år avseende både teknik och funktion.", rationale: "Ger insyn i systemets framtida riktning.", cluster: "Utveckling" },
        { title: "Kundspecifik utveckling", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall erbjuda utveckling av funktioner efter beställning av enskild kund.", rationale: "Möjliggör anpassning till specifika verksamhetsbehov.", cluster: "Utveckling" },
        { title: "Delning av kundspecifika lösningar", reqType: "kontraktsvillkor", level: "SKA", text: "Leverantören skall beskriva hur andra kunder kan ta del av lösningar utvecklade för en specifik kund.", rationale: "Kan sänka kostnader genom delad utveckling.", cluster: "Utveckling" },
      ] }),
      tags: JSON.stringify(["utveckling", "utbildning", "generisk"]),
    },
  });

  console.log("  ✓ 12 IT-kravblock (108 krav)");

  // ── EXTRA RISKMALLAR (10 st) ────────────────────────────────

  const extraRiskTemplates = [
    {
      title: "Riskmall: Bristande testning",
      category: "teknik",
      description: "Risk att otillräcklig testning leder till produktionsproblem.",
      likelihood: 3,
      impact: 4,
      mitigation: "Kräv testrapporter, acceptanstestperiod och regressionstester.",
      assessmentQuestions: [
        "Har upphandlingen krav på att leverantören ska tillhandahålla testrapporter?",
        "Finns det en dedikerad acceptanstestperiod inplanerad i projektet?",
        "Har organisationen kompetens och resurser för att genomföra egna tester?",
        "Är systemet verksamhetskritiskt där produktionsfel får allvarliga konsekvenser?"
      ],
      indicators: [
        "Leverantören levererar funktionalitet utan medföljande testdokumentation",
        "Buggar som borde fångats i grundläggande testning upptäcks vid acceptanstest",
        "Leverantören motsätter sig eller förkortar föreslagen acceptanstestperiod"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om leverantören inte kan uppvisa testrapporter vid milstolpe eller om acceptanstester visar mer än 10 kritiska defekter."
    },
    {
      title: "Riskmall: Skalbarhetsproblem",
      category: "teknik",
      description: "Risk att systemet inte klarar ökade volymer.",
      likelihood: 2,
      impact: 4,
      mitigation: "Prestandakrav i SLA, lasttester vid leveransgodkännande.",
      assessmentQuestions: [
        "Förväntas antalet användare eller datavolymer öka väsentligt under avtalsperioden?",
        "Finns det perioder med hög belastning (t.ex. säsongsvariation)?",
        "Har leverantören erfarenhet av installationer i samma storleksordning?",
        "Ska systemet hantera realtidsdata eller stora mängder samtida transaktioner?"
      ],
      indicators: [
        "Systemet visar prestandaförsämring redan vid lägre volymer under testperioden",
        "Leverantören kan inte redovisa referensinstallationer med jämförbar storlek",
        "Lasttester visar svarstider som överstiger SLA-nivåer vid förväntad toppbelastning"
      ],
      responseStrategy: "transfer",
      escalationCriteria: "Eskalera till styrgrupp om lasttester visar att systemet inte klarar 150% av förväntad normalbelastning eller om prestandakrav i SLA inte uppfylls vid leveransgodkännande."
    },
    {
      title: "Riskmall: Bristande dokumentation",
      category: "leverans",
      description: "Risk att leverantören inte dokumenterar tillräckligt.",
      likelihood: 3,
      impact: 3,
      mitigation: "Dokumentationskrav i avtal, granskning vid milstolpar.",
      assessmentQuestions: [
        "Ingår tydliga dokumentationskrav i avtalet (system-, drift-, användardokumentation)?",
        "Behöver organisationen kunna förvalta eller vidareutveckla systemet utan leverantören?",
        "Finns det krav på att dokumentation ska levereras på svenska?",
        "Granskas dokumentation som en del av milstolpsgodkännande?"
      ],
      indicators: [
        "Dokumentation saknas eller är ofullständig vid första milstolpsgodkännande",
        "Leverantören hänvisar till online-wiki eller generisk produktdokumentation istället för anpassad",
        "Driftpersonal rapporterar att de inte kan utföra grundläggande administration utan leverantörsstöd"
      ],
      responseStrategy: "transfer",
      escalationCriteria: "Eskalera till styrgrupp om leverantören inte levererar avtalad dokumentation vid två på varandra följande milstolpar."
    },
    {
      title: "Riskmall: Underleverantörsberoende",
      category: "leverans",
      description: "Risk att kritisk funktionalitet hänger på underleverantör.",
      likelihood: 2,
      impact: 4,
      mitigation: "Krav på transparens om underleverantörer, back-to-back-avtal.",
      assessmentQuestions: [
        "Använder leverantören underleverantörer för kritiska delar av leveransen?",
        "Finns det krav på att leverantören ska redovisa underleverantörer i anbudet?",
        "Har organisationen insyn i underleverantörernas kapacitet och stabilitet?",
        "Säkerställer avtalet att leverantören ansvarar för underleverantörers prestation?"
      ],
      indicators: [
        "Leverantören byter eller tappar en underleverantör under implementeringen",
        "Förseningar uppstår på grund av underleverantörens kapacitetsbrister",
        "Underleverantören kommunicerar direkt med beställaren utan leverantörens medverkan"
      ],
      responseStrategy: "transfer",
      escalationCriteria: "Eskalera till styrgrupp om en underleverantör som ansvarar för kritisk funktionalitet visar tecken på instabilitet eller om leverantören vill byta underleverantör utan godkännande."
    },
    {
      title: "Riskmall: Bristande utbildning",
      category: "verksamhet",
      description: "Risk att användare inte får tillräcklig utbildning.",
      likelihood: 3,
      impact: 3,
      mitigation: "Utbildningsplan i avtal, superanvändarstrategi.",
      assessmentQuestions: [
        "Ingår utbildning som en del av leveransen i avtalet?",
        "Finns det en plan för superanvändare som kan stötta kollegor efter go-live?",
        "Har användarna varierande IT-mognad som kräver anpassad utbildning?",
        "Finns det resurser avsatta för fortlöpande utbildning vid uppdateringar?"
      ],
      indicators: [
        "Användare ställer grundläggande frågor som borde ha besvarats i utbildningen",
        "Superanvändare rapporterar att utbildningsmaterialet är otillräckligt eller inaktuellt",
        "Supportärenden ökar kraftigt efter go-live med frågor av utbildningskaraktär"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om utbildningsplanen inte är godkänd senast två månader före go-live eller om utvärdering av pilotutbildning visar att mindre än 70% av deltagarna nådde kunskapsmålen."
    },
    {
      title: "Riskmall: Scope creep",
      category: "ekonomi",
      description: "Risk att projektet växer utanför ursprungligt scope.",
      likelihood: 4,
      impact: 3,
      mitigation: "Tydlig ändringshanteringsprocess, fast scope i avtal.",
      assessmentQuestions: [
        "Finns det en formell ändringshanteringsprocess i projektet?",
        "Är kravbilden tydligt avgränsad med dokumenterat scope-in och scope-out?",
        "Finns det intressenter som förväntas vilja utöka scopet under projektets gång?",
        "Har projektledningen mandat att avslå tilläggsönskemål utan styrgruppsbeslut?"
      ],
      indicators: [
        "Ändringsförfrågningar inkommer redan under tidig implementering",
        "Intressenter lyfter nya behov som inte fanns med i den ursprungliga kravspecifikationen",
        "Leverantören föreslår tilläggsmoduler eller anpassningar utanför avtalat scope"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp om ackumulerade ändringsförfrågningar överstiger 10% av ursprunglig budget eller om scope-ändringar hotar att försena tidplanen med mer än en månad."
    },
    {
      title: "Riskmall: Otillräcklig marknadsanalys",
      category: "verksamhet",
      description: "Risk att kravbilden inte matchar marknadens erbjudande.",
      likelihood: 2,
      impact: 4,
      mitigation: "RFI, marknadsdialog, benchmarking mot liknande upphandlingar.",
      assessmentQuestions: [
        "Har en RFI eller marknadsdialog genomförts före kravställningen?",
        "Baseras kravspecifikationen på kunskap om vad marknaden faktiskt kan erbjuda?",
        "Har liknande upphandlingar inom offentlig sektor analyserats?",
        "Finns det risk att SKA-krav utesluter samtliga eller de flesta leverantörer?"
      ],
      indicators: [
        "Få eller inga anbud inkommer vid anbudstidens utgång",
        "Leverantörer ställer frågor som tyder på att kravnivåerna uppfattas som orealistiska",
        "RFI-svar visar att marknaden inte erbjuder det som efterfrågas som standardfunktion"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp om RFI-svar indikerar att färre än tre leverantörer kan möta grundkraven, eller om inga anbud inkommer."
    },
    {
      title: "Riskmall: Konkurrensbrist",
      category: "juridik",
      description: "Risk att för få anbud leder till dålig konkurrens.",
      likelihood: 3,
      impact: 3,
      mitigation: "Bred annonsering, marknadsbevakning, rimliga kvalificeringskrav.",
      assessmentQuestions: [
        "Är det ett nischat område med få aktörer på marknaden?",
        "Är kvalificeringskraven proportionerliga eller kan de avskräcka leverantörer?",
        "Annonseras upphandlingen i rätt kanaler för att nå internationella aktörer?",
        "Har tidigare liknande upphandlingar lockat tillräckligt med anbud?"
      ],
      indicators: [
        "Få leverantörer laddar ner upphandlingsdokumenten",
        "Leverantörer ställer inga eller mycket få frågor under anbudstiden",
        "Bara ett eller två anbud inkommer"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om färre än tre anbud inkommer, särskilt om prisbilden avviker markant från förväntan."
    },
    {
      title: "Riskmall: Upphovsrättskonflikt",
      category: "juridik",
      description: "Risk att oklart ägande av anpassad kod/konfiguration uppstår.",
      likelihood: 2,
      impact: 3,
      mitigation: "Tydliga IP-klausuler i avtal, escrow-avtal.",
      assessmentQuestions: [
        "Ingår det anpassningsutveckling i leveransen?",
        "Är det tydligt i avtalet vem som äger anpassad kod och konfigurationer?",
        "Kan organisationen behöva överföra anpassningarna till en ny leverantör vid byte?",
        "Använder leverantören öppen källkod i kombination med proprietär kod?"
      ],
      indicators: [
        "Avtalet saknar eller har vaga formuleringar om immateriella rättigheter",
        "Leverantören hävdar äganderätt till anpassningar som beställaren bekostat",
        "Oklarheter om licensvillkor för tredjepartskomponenter i leveransen"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp och juridik om tvist om IP-rättigheter uppstår under implementeringen eller om leverantören vägrar inkludera IP-klausuler i avtalet."
    },
    {
      title: "Riskmall: Driftstörning vid go-live",
      category: "teknik",
      description: "Risk för allvarliga driftstörningar vid produktionssättning.",
      likelihood: 3,
      impact: 5,
      mitigation: "Stegvis utrullning, rollback-plan, extra support under övergångsperiod.",
      assessmentQuestions: [
        "Är systemet verksamhetskritiskt där driftstopp har allvarliga konsekvenser?",
        "Finns det en detaljerad go-live-plan med rollback-strategi?",
        "Planeras en stegvis utrullning eller big-bang-övergång?",
        "Har leverantören tillräcklig supportkapacitet under övergångsperioden?"
      ],
      indicators: [
        "Testmiljön visar instabilitet under de sista veckorna före planerad go-live",
        "Go-live-checklistan har ofullständigt avprickade punkter",
        "Leverantören har inte dedikerat extra supportresurser för go-live-perioden"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera omedelbart till styrgrupp om go-live-kriterierna inte är uppfyllda inom en vecka före planerad produktionssättning eller om rollback-planen inte har testats."
    },
    {
      title: "Riskmall: Bristande interoperabilitet",
      category: "teknik",
      description: "Risk att systemet inte kan kommunicera med befintliga standarder.",
      likelihood: 3,
      impact: 3,
      mitigation: "Krav på öppna standarder (REST, SAML, XML), PoC på integrationer.",
      assessmentQuestions: [
        "Ska systemet utbyta data med andra system via standardiserade protokoll?",
        "Använder organisationen gemensamma standarder (t.ex. SAML för SSO, SCIM)?",
        "Finns det branschspecifika standarder som systemet måste stödja?",
        "Har leverantören dokumenterat vilka standarder deras system stödjer?"
      ],
      indicators: [
        "Leverantören erbjuder egenutvecklade gränssnitt istället för branschstandarder",
        "PoC visar att standardintegration kräver anpassningsutveckling",
        "Befintliga system kan inte kommunicera med leverantörens plattform utan mellanlager"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om PoC visar att kritiska standardintegrationer inte fungerar eller kräver omfattande anpassning som inte ingår i budgeten."
    },
    {
      title: "Riskmall: Leverantörskonkurs",
      category: "leverans",
      description: "Risk att leverantören går i konkurs under avtalsperioden.",
      likelihood: 1,
      impact: 5,
      mitigation: "Kreditupplysning vid kvalificering, escrow-avtal, exit-klausul.",
      assessmentQuestions: [
        "Har leverantörens finansiella stabilitet kontrollerats (kreditupplysning, årsredovisning)?",
        "Är leverantören ett litet bolag med hög beroende av enskilda kunder?",
        "Finns det ett escrow-avtal som ger tillgång till källkod vid konkurs?",
        "Har exit-klausulen i avtalet prövats mot ett konkursscenario?"
      ],
      indicators: [
        "Leverantörens kreditbetyg försämras under avtalsperioden",
        "Nyckelpersoner lämnar leverantören i snabb takt",
        "Leverantören begär förskottsbetalning eller ändrade betalningsvillkor"
      ],
      responseStrategy: "transfer",
      escalationCriteria: "Eskalera omedelbart till styrgrupp om leverantörens kreditvärdighet försämras väsentligt, om det uppstår rykten om ekonomiska svårigheter eller om leverantören begär ändrade betalningsvillkor."
    },
    {
      title: "Riskmall: Bristande datakvalitet vid migrering",
      category: "data_exit",
      description: "Risk att befintlig data har låg kvalitet som försvårar migrering.",
      likelihood: 4,
      impact: 3,
      mitigation: "Datakvalitetsanalys före migrering, datarensningsplan, testmigrering.",
      assessmentQuestions: [
        "Har en datakvalitetsanalys genomförts på befintlig data?",
        "Finns det kända problem med dubbletter, saknade fält eller inkonsistenta format?",
        "Är datamängden stor nog att manuell korrigering är opraktisk?",
        "Har det befintliga systemet genomgått flera uppgraderingar som kan ha påverkat datastrukturen?"
      ],
      indicators: [
        "Datakvalitetsanalys visar mer än 5% felaktiga eller ofullständiga poster",
        "Testmigrering resulterar i att poster inte kan mappas till nytt system",
        "Användare rapporterar att befintlig data redan idag har kvalitetsproblem"
      ],
      responseStrategy: "mitigate",
      escalationCriteria: "Eskalera till styrgrupp om datakvalitetsanalysen visar att mer än 15% av data kräver manuell korrigering eller om datarensning inte kan slutföras inom planerad tidsram."
    },
    {
      title: "Riskmall: Felaktiga kravnivåer",
      category: "verksamhet",
      description: "Risk att SKA-krav ställs för högt och utesluter lämpliga leverantörer.",
      likelihood: 3,
      impact: 4,
      mitigation: "Proportionalitetsbedömning, marknadsdialog, BÖR istället för SKA.",
      assessmentQuestions: [
        "Har proportionalitetsbedömning genomförts för alla SKA-krav?",
        "Har marknadsdialog bekräftat att SKA-kravnivåerna är rimliga?",
        "Finns det SKA-krav som egentligen borde vara BÖR-krav?",
        "Har juridisk granskning bekräftat att kravnivåerna inte strider mot LOU:s proportionalitetsprincip?"
      ],
      indicators: [
        "Leverantörer flaggar att enskilda SKA-krav är oproportionerliga vid marknadsdialog",
        "Färre anbud än förväntat inkommer, med hänvisning till krävande SKA-krav",
        "Utvärderingsgruppen ifrågasätter nödvändigheten av enskilda SKA-krav"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp om marknadsdialogen visar att SKA-kravnivåerna utesluter majoriteten av marknaden eller om proportionalitetsbedömningen inte godkänns av juridik."
    },
    {
      title: "Riskmall: Avtalstolkningskonflikter",
      category: "juridik",
      description: "Risk att otydliga avtalsvillkor leder till tvister.",
      likelihood: 3,
      impact: 3,
      mitigation: "Juridisk granskning av avtal, tydliga definitioner, tolkningsordning.",
      assessmentQuestions: [
        "Har avtalet granskats av juridisk expertis med erfarenhet av IT-upphandling?",
        "Finns det en tydlig tolkningsordning mellan avtalsbilagor?",
        "Är nyckelbegrepp (t.ex. acceptans, driftsättning, fel) tydligt definierade?",
        "Har parterna en gemensam förståelse av vad som ingår i avtalet?"
      ],
      indicators: [
        "Parterna har olika tolkning av avtalets omfattning redan under implementeringen",
        "Leverantören hänvisar till avtalsformuleringar för att undvika leveransåtaganden",
        "Återkommande diskussioner om vad som ingår i grundleveransen kontra tillägg"
      ],
      responseStrategy: "avoid",
      escalationCriteria: "Eskalera till styrgrupp och juridik om tvist uppstår om avtalstolkning som parterna inte kan lösa på projektnivå, eller om leverantören hävdar att centrala leveranser inte ingår i avtalet."
    },
  ];

  for (const tmpl of extraRiskTemplates) {
    await prisma.libraryItem.create({
      data: {
        type: "risk_template", profile: "", cluster: tmpl.category,
        title: tmpl.title, description: tmpl.description,
        content: JSON.stringify({ risk: tmpl }),
        tags: JSON.stringify(["riskmall", tmpl.category]),
      },
    });
  }

  console.log("  ✓ 16 extra riskmallar");

  // ── EXTRA WORKSHOPMALLAR (6 st) ─────────────────────────────

  const extraWorkshopTemplates = [
    {
      title: "Workshopmall: Taxelogik & fakturering (avfall)",
      description: "Workshop för att kartlägga taxemodeller och faktureringsbehov.",
      suggestedParticipants: ["Ekonomichef", "Taxeansvarig", "IT", "Kundtjänst"],
      agenda: ["Genomgång av befintlig taxemodell", "Identifiera förändringsönskemål", "Faktureringskrav", "Integration med ekonomisystem"],
      expectedOutputs: ["Taxemodellspecifikation", "Faktureringskrav"],
      duration: "3h",
      profile: "avfall_nyanskaffning",
      agendaDetailed: [
        { title: "Genomgång av befintlig taxemodell", timeMinutes: 40, purpose: "Skapa en gemensam förståelse av nuvarande taxestruktur: grundavgift, rörlig del, rabatter, tilläggsavgifter och hur dessa beräknas.", method: "Presentation", facilitationQuestions: ["Hur är den nuvarande taxemodellen uppbyggd — vilka komponenter ingår?", "Vilka kundkategorier finns och hur skiljer sig taxan mellan dem?", "Hur hanteras säsongsvariationer, extra hämtningar och avvikelser?", "Vilka delar av taxemodellen skapar mest frågor från kunderna?", "Finns det politiska beslut eller regleringar som styr taxenivåerna?"], tips: "Ha aktuell taxedokumentation utskriven. Rita upp taxemodellen som ett diagram med alla komponenter. Markera vilka delar som är politiskt styrda respektive administrativa." },
        { title: "Identifiera förändringsönskemål", timeMinutes: 35, purpose: "Samla in önskemål om hur taxemodellen bör utvecklas i det nya systemet — nya tjänster, flexibilitet och rättvisa.", method: "Brainstorming", facilitationQuestions: ["Vilka nya tjänster eller abonnemangstyper vill ni kunna erbjuda?", "Behöver taxemodellen kunna hantera viktbaserad debitering eller sorteringsgrad?", "Finns det önskemål om mer flexibla abonnemang (tillval, storleksanpassning)?", "Hur vill ni hantera undantag och specialavtal?"], tips: "Skilj på vad som är möjligt att ändra inom befintligt regelverk och vad som kräver politiska beslut. Fokusera på systemkrav, inte politiska prioriteringar." },
        { title: "Faktureringskrav", timeMinutes: 35, purpose: "Specificera krav på fakturaflödet: format, frekvens, betalningsvillkor, påminnelser och kreditering.", method: "Brainstorming", facilitationQuestions: ["Vilka faktureringsperioder ska stödjas (månadsvis, kvartalsvis, årsvis)?", "Vilka fakturaformat behövs (e-faktura, PDF, Autogiro)?", "Hur ska kreditering och justering av felaktiga fakturor hanteras?", "Vilka krav finns på specificering — vad ska synas på fakturan?", "Hur ska påminnelse- och inkassoprocessen fungera?"], tips: "Tänk på att fakturaformatet ofta regleras av standarder (Peppol BIS). Stäm av med ekonomiavdelningen vilka format som redan används." },
        { title: "Integration med ekonomisystem", timeMinutes: 30, purpose: "Definiera hur avfallssystemets fakturering ska integreras med kommunens ekonomisystem och eventuellt e-faktureringssystem.", method: "Presentation", facilitationQuestions: ["Vilket ekonomisystem ska fakturorna skickas till och i vilket format?", "Hur ska kontering ske — automatiskt eller manuellt?", "Vilka avstämningsrutiner behövs mellan systemen?", "Finns det krav på realtidsöverföring eller räcker batchkörning?"], tips: "Bjud in en representant från ekonomisystemets förvaltning. Stäm av vilka integrationsstandarder som redan finns etablerade i kommunen." },
      ],
      preparation: "Samla in aktuell taxedokumentation och politiska beslut om taxenivåer. Hämta statistik om kundfördelning per abonnemangstyp. Kartlägg nuvarande faktureringsflöde och integration med ekonomisystem.",
      followUp: ["Dokumentera taxemodellspecifikation med alla kundkategorier, komponenter och beräkningsregler", "Specificera faktureringskrav som underlag till kravspecifikationen", "Utred integrationsalternativ med kommunens ekonomisystem", "Validera taxemodellen med politisk nämnd om förändringar krävs"],
      sparkboardSuggestion: [
        { boardTitle: "Taxemodellens brister", questions: ["Vad fungerar dåligt i dagens taxemodell ur kundens perspektiv?", "Vilka beräkningar eller undantag skapar mest manuellt arbete?", "Beskriv ett kundscenario som dagens taxemodell inte hanterar bra."], timeLimit: 8 },
        { boardTitle: "Framtidens taxemodell", questions: ["Vilka nya tjänster eller abonnemang vill du kunna erbjuda kunderna?", "Hur kan taxemodellen uppmuntra bättre sortering och minskat avfall?"], timeLimit: 6 },
      ],
    },
    {
      title: "Workshopmall: Behörighet & loggning (socialtjänst)",
      description: "Workshop för att definiera behörighets- och loggningskrav.",
      suggestedParticipants: ["Enhetschef", "IT-säkerhet", "Dataskyddsombud", "Handläggare"],
      agenda: ["Kartlägg roller och behörighetsnivåer", "Definiera lägsta behörighetsprincipen", "Loggningskrav", "Spärrar och känsliga uppgifter"],
      expectedOutputs: ["Behörighetsmatris", "Loggningskrav", "Spärregler"],
      duration: "3h",
      profile: "socialtjanst_byte",
      agendaDetailed: [
        { title: "Kartlägg roller och behörighetsnivåer", timeMinutes: 45, purpose: "Identifiera alla roller i verksamheten och vilken åtkomst varje roll behöver till systemets olika delar.", method: "Affinity mapping", facilitationQuestions: ["Vilka roller finns i organisationen som behöver tillgång till systemet?", "Vilken information behöver varje roll se — och vad får de absolut inte se?", "Hur hanteras tillfälliga roller (vikarier, konsulter, studenter)?", "Skiljer sig behörigheterna mellan olika verksamhetsgrenar (barn/ungdom, vuxna, funktionshinder)?", "Hur hanteras chefers behörighet jämfört med handläggares?"], tips: "Rita en matris med roller på Y-axeln och systemfunktioner/dataområden på X-axeln. Markera med L (läsa), S (skriva), R (radera) eller - (ingen åtkomst). Testa med verkliga scenarier." },
        { title: "Definiera lägsta behörighetsprincipen", timeMinutes: 30, purpose: "Tillämpa principen om minsta möjliga behörighet — varje användare ska bara ha tillgång till det som krävs för arbetsuppgiften.", method: "Presentation", facilitationQuestions: ["Finns det roller som idag har bredare åtkomst än de behöver?", "Hur hanterar vi att en handläggare byter enhet eller verksamhetsgren?", "Ska behörighet kopplas till organisatorisk tillhörighet, ärendetyp eller geografiskt område?", "Hur hanteras tidsbegränsade behörigheter (t.ex. projektmedlemmar)?"], tips: "Minsta behörighet är en grundprincip i GDPR och informationssäkerhet. Utgå från vad rollen behöver, inte vad den vill ha. Det är lättare att utöka behörighet än att begränsa den i efterhand." },
        { title: "Loggningskrav", timeMinutes: 35, purpose: "Definiera vilka händelser som ska loggas, hur loggar ska skyddas och vem som får granska dem.", method: "Brainstorming", facilitationQuestions: ["Vilka händelser ska loggas — inloggning, läsning av ärende, ändring, utskrift, export?", "Hur länge ska loggar sparas och vem ansvarar för uppföljning?", "Vilka krav ställer IVO och Datainspektionen på loggning inom socialtjänsten?", "Hur ska obehörig åtkomst upptäckas och rapporteras?", "Ska det finnas automatiska varningar vid avvikande beteende (t.ex. ovanligt många sökningar)?"], tips: "Logga minst: vem, vad, när, vilken information. IVO kräver spårbarhet. Överväg automatisk logganalys som kan flagga avvikande åtkomstmönster." },
        { title: "Spärrar och känsliga uppgifter", timeMinutes: 30, purpose: "Definiera regler för hur spärrmarkering, sekretess och skyddade personuppgifter ska hanteras tekniskt.", method: "Brainstorming", facilitationQuestions: ["Hur ska systemet hantera spärrmarkerade personer — vem får se att spärr finns?", "Vilka uppgifter klassas som extra känsliga (t.ex. HIV-status, missbruk, hot)?", "Hur förhindrar vi att en handläggare ser ärenden som rör egna familjemedlemmar (jäv)?", "Ska det finnas olika sekretessnivåer med olika åtkomstkrav?", "Hur hanteras utlämnande av handlingar vid begäran om allmän handling?"], tips: "Spärrar måste fungera i hela systemet — även i sökresultat, rapporter och utskrifter. Testa med konkreta scenarier. En miss kan äventyra personers fysiska säkerhet." },
      ],
      preparation: "Samla in gällande delegeringsordning och befintlig behörighetsmatris. Ta med IVO:s och Datainspektionens vägledning om loggning. Förbered en lista över alla roller och verksamhetsgrenar som finns i organisationen.",
      followUp: ["Skapa en komplett behörighetsmatris med alla roller, funktioner och åtkomstnivåer", "Dokumentera loggningskrav med bevarandetider och uppföljningsansvar", "Definiera spärregler och testa dem mot konkreta scenarier", "Genomför juridisk granskning av behörighets- och loggningskraven"],
      sparkboardSuggestion: [
        { boardTitle: "Behörighetsutmaningar", questions: ["Beskriv en situation där du haft tillgång till information du inte borde sett.", "Vilka behörighetsproblem upplever du i nuvarande system?", "Hur borde systemet hantera att du byter enhet eller roll?"], timeLimit: 8 },
        { boardTitle: "Loggning & kontroll", questions: ["Hur ofta granskas loggarna idag och av vem?", "Vilka typer av obehörig åtkomst oroar dig mest?", "Hur vill du bli varnad om någon obehörig ser ett av dina ärenden?"], timeLimit: 8 },
      ],
    },
    {
      title: "Workshopmall: Rapportering & nyckeltal",
      description: "Workshop för att definiera rapporterings- och nyckeltalbehov.",
      suggestedParticipants: ["Verksamhetschef", "Controller", "IT-ansvarig", "Kvalitetsansvarig"],
      agenda: ["Identifiera nyckeltal per verksamhetsområde", "Rapporteringsfrekvens och format", "Myndighetsrapportering", "Dashboardbehov"],
      expectedOutputs: ["Nyckeltalskatalog", "Rapporteringsplan"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Identifiera nyckeltal per verksamhetsområde", timeMinutes: 50, purpose: "Definiera vilka nyckeltal (KPI:er) som behövs för att styra, följa upp och förbättra verksamheten.", method: "Brainstorming", facilitationQuestions: ["Vilka nyckeltal använder ni idag och vilka saknas?", "Vilka beslut ska nyckeltalen stödja — strategiska, taktiska eller operativa?", "Vilka nyckeltal rapporterar ni till politiken och vilka använder ni internt?", "Hur mäter ni kvalitet, effektivitet och kundnöjdhet idag?", "Finns det branschgemensamma nyckeltal vi bör inkludera (t.ex. Kolada)?"], tips: "Begränsa till 10-15 viktiga nyckeltal. Fler blir ohanterligt. Varje nyckeltal ska ha en tydlig ägare, datakälla och beräkningsformel. Använd SMART-principen." },
        { title: "Rapporteringsfrekvens och format", timeMinutes: 25, purpose: "Bestämma hur ofta rapporter ska produceras, i vilket format och till vilken målgrupp.", method: "Presentation", facilitationQuestions: ["Hur ofta behöver olika intressenter rapporter — dagligen, veckovis, månadsvis, kvartalsvis?", "Vilka rapportformat behövs (PDF, Excel, dashboard, automatiska e-postutskick)?", "Ska rapporter kunna anpassas av användaren (ad hoc) eller vara fasta mallar?", "Hur ska rapporter distribueras — push (automatiska utskick) eller pull (användaren hämtar)?"], tips: "Erbjud en kombination av fasta standardrapporter och möjlighet till ad hoc-analys. De flesta behöver inte bygga egna rapporter — 10-15 väldefinierade standardrapporter täcker 90% av behoven." },
        { title: "Myndighetsrapportering", timeMinutes: 30, purpose: "Identifiera lagstadgade rapporteringskrav till myndigheter som systemet måste stödja.", method: "Presentation", facilitationQuestions: ["Vilka myndighetsrapporter är ni skyldiga att lämna (SCB, Socialstyrelsen, SKR, Avfall Sverige)?", "I vilka format och med vilka tidsramar ska rapporterna levereras?", "Kan rapporterna genereras automatiskt från systemet eller krävs manuell bearbetning?", "Vilka rapporteringskrav förväntas tillkomma de närmaste åren?"], tips: "Kontrollera Socialstyrelsens och SCB:s rapporteringskrav noggrant. Automatiserad myndighetsrapportering sparar enormt med tid och minskar felrisken. Fråga leverantörer om de redan stödjer relevanta rapportformat." },
        { title: "Dashboardbehov", timeMinutes: 25, purpose: "Definiera behov av visuella dashboards för realtidsöverblick och beslutsunderlag.", method: "Brainstorming", facilitationQuestions: ["Vilka nyckeltal vill ni se i realtid på en dashboard?", "Vilka roller behöver dashboards — chefer, handläggare, politiken?", "Behöver dashboards kunna drillas ner (från översikt till detalj)?", "Ska dashboards vara tillgängliga på mobil eller bara på dator?"], tips: "Mindre är mer i dashboards. Max 6-8 nyckeltal per vy. Använd tydlig färgkodning (röd/gul/grön). Separera strategiska dashboards (för ledning) från operativa (för medarbetare)." },
      ],
      preparation: "Samla in befintliga rapporter och nyckeltal. Identifiera lagstadgade rapporteringskrav. Titta på Kolada och andra branschdatabaser för jämförelsetal. Förbered en lista över alla roller som behöver rapportåtkomst.",
      followUp: ["Skapa en nyckeltalskatalog med definition, datakälla, beräkningsformel och ägare per nyckeltal", "Dokumentera myndighetsrapporteringskrav med format och tidsfrister", "Specificera dashboardkrav per roll med prioritering", "Verifiera att alla nyckeltal kan hämtas från det nya systemet"],
      sparkboardSuggestion: [
        { boardTitle: "Rapporteringsbehov", questions: ["Vilken rapport saknar du idag som du verkligen behöver?", "Vilken information behöver du för att kunna styra din verksamhet effektivt?", "Vilka rapporter tar mest tid att ta fram manuellt idag?"], timeLimit: 8 },
        { boardTitle: "Dashboard-vision", questions: ["Om du fick en skärm med realtidsinformation — vilka 5 saker vill du se?", "Vilken information vill du ha tillgänglig på mobilen?"], timeLimit: 6 },
      ],
    },
    {
      title: "Workshopmall: Acceptanstest",
      description: "Workshop för att planera och designa acceptanstester.",
      suggestedParticipants: ["Testledare", "Verksamhetsrepresentanter", "IT", "Leverantör"],
      agenda: ["Definiera testscenarier per kravkategori", "Prioritera tester (kritisk/viktig/nice-to-have)", "Testdatahantering", "Godkännandekriterier"],
      expectedOutputs: ["Testplan", "Testfall", "Godkännandekriterier"],
      duration: "4h",
      profile: "",
      agendaDetailed: [
        { title: "Definiera testscenarier per kravkategori", timeMinutes: 60, purpose: "Bryta ned kraven till konkreta testscenarier som verifierar att systemet fungerar som förväntat i verkliga användarsituationer.", method: "Brainstorming", facilitationQuestions: ["Vilka vardagliga arbetsuppgifter måste systemet klara — beskriv dem steg för steg.", "Vilka ovanliga men kritiska scenarier måste vi testa (fel, undantag, gränsfall)?", "Vilka integrationer måste testas end-to-end?", "Finns det säsongsberoende scenarier (t.ex. årsfakturering, bokslut)?", "Vilka scenarier involverar flera roller eller avdelningar?"], tips: "Skriv testscenarier som berättelser: 'En handläggare tar emot en ansökan, granskar den, fattar beslut och meddelar den sökande.' Det gör dem begripliga för verksamheten." },
        { title: "Prioritera tester (kritisk/viktig/nice-to-have)", timeMinutes: 30, purpose: "Säkerställa att de viktigaste scenarierna testas först och att testinsatsen är proportionerlig.", method: "Dot-voting", facilitationQuestions: ["Vilka testfall är absolut kritiska — systemet får inte godkännas utan dem?", "Vilka testfall är viktiga men inte showstoppers?", "Finns det testfall vi kan skjuta till efter go-live?", "Hur många testcykler hinner vi med innan planerad go-live?"], tips: "Kategorisera: Kritisk = stoppar go-live om underkänt. Viktig = ska testas men har workaround. Nice-to-have = testar om tid finns. Fokusera på kritiska först." },
        { title: "Testdatahantering", timeMinutes: 30, purpose: "Planera hur testdata ska skapas, hanteras och skyddas — särskilt viktigt med personuppgifter.", method: "Presentation", facilitationQuestions: ["Kan vi använda anonymiserad produktionsdata för test eller måste vi skapa syntetisk data?", "Vilka datamängder behövs för att testa realistiskt (antal ärenden, kunder, transaktioner)?", "Hur säkerställer vi att testdata inte innehåller riktiga personuppgifter?", "Vem ansvarar för att testmiljön har aktuell och relevant data?"], tips: "Använd ALDRIG riktig produktionsdata med personuppgifter i testmiljöer utan anonymisering. Planera testdata tidigt — det är ofta en underskattad aktivitet som tar mer tid än förväntat." },
        { title: "Godkännandekriterier", timeMinutes: 30, purpose: "Definiera tydliga kriterier för när acceptanstestet anses godkänt och systemet kan gå i produktion.", method: "Presentation", facilitationQuestions: ["Vilken andel av kritiska testfall måste vara godkända (100%?)?", "Hur hanterar vi kvarvarande fel — vad är acceptabelt vid go-live?", "Vem har mandat att godkänna acceptanstestet och signera leveransen?", "Hur lång tid efter godkänd leverans gäller garantiperioden?", "Vad händer om godkännandekriterierna inte uppnås — vad är plan B?"], tips: "Var tydlig med godkännandekriterierna INNAN testet börjar. 100% godkända kritiska testfall är standard. Definiera en process för felklassificering (A/B/C) där A-fel stoppar go-live." },
      ],
      preparation: "Samla in kravspecifikationen och bryt ned den i testbara enheter. Identifiera verksamhetsrepresentanter som kan delta i testningen. Klargör testmiljö och testdatastrategi med leverantören.",
      followUp: ["Dokumentera testplan med alla testscenarier, prioritering och ansvariga", "Skapa detaljerade testfall med förväntat resultat för varje scenario", "Etablera testmiljö med representativ testdata", "Genomför utbildning av testare i systemet och testverktyget", "Boka testperiod och definiera rapporteringsrutin för testresultat"],
      sparkboardSuggestion: [
        { boardTitle: "Vardagsscenarier att testa", questions: ["Beskriv din vanligaste arbetsuppgift steg för steg — detta blir ett testfall.", "Vilken situation i ditt arbete har flest undantag och specialfall?", "Beskriv det svåraste scenariot du hanterar i nuvarande system."], timeLimit: 10 },
        { boardTitle: "Risker vid test", questions: ["Vad oroar dig mest inför testperioden?", "Vilka delar av systemet tror du kommer vara svårast att testa?"], timeLimit: 6 },
      ],
    },
    {
      title: "Workshopmall: SLA-design",
      description: "Workshop för att designa servicenivåavtal.",
      suggestedParticipants: ["IT-driftansvarig", "Verksamhetschef", "Upphandlare", "Juridik"],
      agenda: ["Definiera tjänstenivåer (gold/silver/bronze)", "Svarstider och tillgänglighet", "Eskaleringsprocess", "Vitesmodell", "Mätning och rapportering"],
      expectedOutputs: ["SLA-specifikation", "Vitesmodell", "Mätplan"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Definiera tjänstenivåer (gold/silver/bronze)", timeMinutes: 30, purpose: "Definiera olika servicenivåer som matchar verksamhetens behov och budget — inte alla system behöver samma SLA.", method: "Presentation", facilitationQuestions: ["Vilka system/tjänster är affärskritiska och kräver högsta servicenivå?", "Vilka tjänster kan ha lägre tillgänglighet utan att verksamheten drabbas allvarligt?", "Vilka öppettider kräver verksamheten — kontorstid, utökad tid, dygnet runt?", "Hur påverkas medborgare/kunder om systemet är nere under olika tidsperioder?"], tips: "Inte allt behöver gold-nivå. Differentiera utifrån verksamhetspåverkan. Gold-SLA kostar typiskt 2-3 gånger mer än bronze. Låt verksamheten motivera varför en tjänst behöver en viss nivå." },
        { title: "Svarstider och tillgänglighet", timeMinutes: 30, purpose: "Specificera konkreta svarstider för felanmälan och krav på systemtillgänglighet.", method: "Brainstorming", facilitationQuestions: ["Vilken tillgänglighet krävs (99%, 99.5%, 99.9%) och vad innebär det i praktiken i stilleståndstid?", "Vilka svarstider är acceptabla för kritiska respektive icke-kritiska fel?", "Hur definierar vi ett kritiskt fel — vad är kriterierna?", "Vilka tider ska undantas från SLA-beräkningen (planerat underhåll, helger)?"], tips: "99% tillgänglighet innebär 87,6 timmar nedtid per år. 99.9% innebär 8,76 timmar. Visa konkreta siffror. Definiera mätfönstret tydligt — per månad, kvartal eller år gör stor skillnad." },
        { title: "Eskaleringsprocess", timeMinutes: 25, purpose: "Definiera tydlig eskaleringskedja med kontaktpersoner, tidsramar och beslutsmandat.", method: "Presentation", facilitationQuestions: ["Vem kontaktas först vid ett driftproblem och inom vilken tid?", "Vad händer om leverantören inte svarar inom avtalad tid — nästa steg?", "Vid vilken punkt eskaleras till ledningsnivå hos leverantören?", "Hur kommunicerar leverantören status under pågående incident?"], tips: "Definiera minst 3 eskaleringsnivåer med tydliga tidsramar. Ange namngivna roller (inte personer) hos båda parter. Kräv proaktiv statuskommunikation — inte att kunden ska behöva ringa och fråga." },
        { title: "Vitesmodell", timeMinutes: 25, purpose: "Designa en vitesmodell som ger leverantören incitament att hålla servicenivåerna utan att vara oproportionerlig.", method: "Brainstorming", facilitationQuestions: ["Vid vilken typ av SLA-brott ska viten utlösas?", "Hur ska viten beräknas — per incident, per timme eller per månad?", "Finns det ett vitestak — och hur högt ska det vara?", "Ska viten kvittas mot fakturan automatiskt eller hanteras separat?", "Ska det finnas bonus vid överprestation?"], tips: "Viten ska vara tillräckligt kännbara för att ge incitament men inte så höga att leverantören höjer priset dramatiskt. 5-15% av månadskostnaden per SLA-brott är rimligt. Undvik att göra vitesmodellen så komplex att den blir omöjlig att administrera." },
        { title: "Mätning och rapportering", timeMinutes: 20, purpose: "Definiera hur SLA:er ska mätas, rapporteras och följas upp.", method: "Presentation", facilitationQuestions: ["Vem ansvarar för att mäta och rapportera SLA-uppfyllnad — leverantören eller vi?", "Vilka mätverktyg och mätpunkter ska användas?", "Hur ofta ska SLA-rapporter levereras och i vilket format?", "Ska det finnas realtidsinstrumentpanel för SLA-status?"], tips: "Kräv att leverantören rapporterar proaktivt. Mätpunkten ska vara oberoende om möjligt — inte leverantörens eget verktyg. Definiera beräkningsmetod exakt i avtalet." },
      ],
      preparation: "Kartlägg verksamhetens tillgänglighetsbehov per system och tidsperiod. Samla in SLA-villkor från liknande upphandlingar som referens. Granska befintliga avtal och identifiera vad som fungerat bra respektive dåligt.",
      followUp: ["Dokumentera komplett SLA-specifikation med tjänstenivåer, svarstider och tillgänglighetskrav", "Utforma vitesmodell med beräkningsexempel och vitestak", "Skapa mätplan med ansvar, verktyg och rapporteringsfrekvens", "Juridisk granskning av SLA-villkor och vitesmodell"],
      sparkboardSuggestion: [
        { boardTitle: "SLA-erfarenheter", questions: ["Beskriv ett tillfälle då bristande SLA påverkade er verksamhet negativt.", "Vilken servicenivå behöver du för att kunna göra ditt jobb utan avbrott?", "Vad fungerar bra respektive dåligt i era nuvarande SLA-avtal?"], timeLimit: 8 },
      ],
    },
    {
      title: "Workshopmall: Datamodell & migration (socialtjänst)",
      description: "Workshop för att analysera datamodellen och planera migration.",
      suggestedParticipants: ["DBA", "Systemförvaltare", "IT-arkitekt", "Verksamhetsexpert"],
      agenda: ["Kartlägg befintlig datamodell", "Identifiera datakvalitetsproblem", "Mappning till nytt system", "Testmigreringsplan", "Gallring och arkivering"],
      expectedOutputs: ["Datamappning", "Kvalitetsrapport", "Migreringsplan"],
      duration: "4h",
      profile: "socialtjanst_byte",
      agendaDetailed: [
        { title: "Kartlägg befintlig datamodell", timeMinutes: 50, purpose: "Dokumentera den befintliga datamodellen med alla tabeller, relationer och datatyper som är relevanta för migrering.", method: "Presentation", facilitationQuestions: ["Vilka huvudentiteter finns i nuvarande system (person, ärende, beslut, insats)?", "Hur är relationerna mellan entiteterna — ett ärende per person eller flera?", "Finns det historikhantering — hur lagras ändringshistorik?", "Vilka fält är obligatoriska respektive valfria?", "Finns det fritexter, bilagor eller dokument som ska migreras?"], tips: "Ha ER-diagrammet från befintligt system utskrivet. Om det inte finns — be DBA:n ta fram det innan workshopen. Markera vilka tabeller som innehåller personuppgifter." },
        { title: "Identifiera datakvalitetsproblem", timeMinutes: 35, purpose: "Kartlägga kända datakvalitetsproblem som kan försvåra migreringen: dubbletter, ofullständig data, felaktiga kopplingar.", method: "Brainstorming", facilitationQuestions: ["Vilka datakvalitetsproblem vet ni om i nuvarande system?", "Finns det dubbletter av personer, ärenden eller andra entiteter?", "Hur stor andel av posterna har ofullständig eller felaktig data?", "Finns det data som lagrats fel (t.ex. i fritext istället för strukturerade fält)?", "Har systemleverantören verktyg för datakvalitetsanalys?"], tips: "Kör om möjligt en automatisk datakvalitetsanalys innan workshopen. SQL-queries som hittar dubbletter, tomma obligatoriska fält och ogiltiga kopplingar ger konkreta siffror att diskutera kring." },
        { title: "Mappning till nytt system", timeMinutes: 50, purpose: "Definiera hur data ska transformeras och mappas från gammalt till nytt system — fält för fält.", method: "Affinity mapping", facilitationQuestions: ["Vilka fält i gamla systemet motsvarar vilka fält i det nya?", "Finns det fält som inte har en direkt motsvarighet — hur hanteras de?", "Behöver data transformeras (t.ex. kodlistor som ändrat format)?", "Hur mappas statusvärden, ärendetyper och kategorier mellan systemen?", "Finns det data i fritext som borde struktureras i det nya systemet?"], tips: "Skapa ett mappningsdokument: gammalt fält, nytt fält, transformation, kommentar. Det är det viktigaste underlaget för migreringsarbetet. Var beredd på att mappningen tar tid — det finns alltid fler specialfall än man tror." },
        { title: "Testmigreringsplan", timeMinutes: 30, purpose: "Planera testmigrering: hur många omgångar, med vilken data, vilka kontroller och vem som verifierar.", method: "Presentation", facilitationQuestions: ["Hur många testmigreringar behöver vi genomföra innan vi är trygga?", "Vilken data ska ingå i testmigreringen — ett urval eller allt?", "Vilka kontroller ska utföras efter varje testmigrering (antal poster, stickprov, checksummor)?", "Vem i verksamheten ska verifiera att data ser korrekt ut i det nya systemet?"], tips: "Planera minst 2-3 testmigreringar. Första omgången avslöjar de största problemen, andra verifierar fixes, tredje är generalrepetition. Involvera verksamheten i verifieringen — de ser fel som IT missar." },
        { title: "Gallring och arkivering", timeMinutes: 25, purpose: "Definiera vilken data som ska gallras, arkiveras eller migreras baserat på regelverk och verksamhetsbehov.", method: "Presentation", facilitationQuestions: ["Vilka gallringsfrister gäller för olika datatyper inom socialtjänsten?", "Finns det data som är gallringspliktig men inte gallrats i nuvarande system?", "Ska all historisk data migreras eller bara aktiva ärenden och viss historik?", "Hur ska arkiverade ärenden göras sökbara i det nya systemet?"], tips: "Kontrollera kommunens dokumenthanteringsplan och arkivreglemente. Socialtjänstdata har ofta långa bevarandetider (ibland 70 år för barnavårdsärenden). Gallring ska alltid dokumenteras." },
      ],
      preparation: "Hämta datamodell/ER-diagram från befintligt system. Kör en grundläggande datakvalitetsanalys (dubbletter, tomma fält, volymer per tabell). Samla in gallringsregler och arkivreglemente. Skaffa tillgång till det nya systemets datamodell.",
      followUp: ["Dokumentera komplett datamappning (gammalt fält till nytt fält med transformationsregler)", "Genomför datakvalitetsanalys och upprätta en datarensningsplan", "Planera och genomför första testmigrering", "Definiera gallrings- och arkiveringsstrategi med juridisk förankring", "Upprätta verifieringsprotokoll för testmigrering"],
      sparkboardSuggestion: [
        { boardTitle: "Datakvalitet", questions: ["Vilka dataproblem stör dig mest i nuvarande system?", "Beskriv ett ärende som du vet har felaktig eller ofullständig data.", "Vilken data är mest kritisk att få rätt vid migreringen?"], timeLimit: 8 },
        { boardTitle: "Migreringsoro", questions: ["Vad oroar dig mest med datamigreringen?", "Vilken information får absolut inte gå förlorad?", "Hur lång tid kan du jobba utan tillgång till historisk data?"], timeLimit: 6 },
      ],
    },
    {
      title: "Workshopmall: Proportionalitetsbedömning",
      description: "Workshop för att bedöma proportionaliteten i kravställningen.",
      suggestedParticipants: ["Upphandlare", "Jurist", "Verksamhetsansvarig", "Leverantörsrepresentant (vid RFI)"],
      agenda: ["Genomgång av SKA-krav", "Bedöm nödvändighet per krav", "Identifiera oproportionerliga krav", "Justera SKA till BÖR vid behov", "Dokumentera motiveringar"],
      expectedOutputs: ["Proportionalitetsanalys", "Reviderad kravlista"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Genomgång av SKA-krav", timeMinutes: 35, purpose: "Skapa en översikt av alla obligatoriska krav (SKA-krav) och deras implikationer för konkurrensen.", method: "Presentation", facilitationQuestions: ["Hur många SKA-krav har vi totalt — är antalet rimligt i förhållande till upphandlingens storlek?", "Vilka SKA-krav härrör från lagkrav och vilka är verksamhetens egna?", "Finns det SKA-krav som tillkommit utan tydlig motivering?", "Hur ser fördelningen ut mellan funktionella, tekniska och icke-funktionella SKA-krav?"], tips: "Presentera en sammanställning: totalt antal krav, antal SKA vs BÖR, fördelning per kategori. Jämför med referensupphandlingar — 30-50 SKA-krav är vanligt för en medelstorIT-upphandling." },
        { title: "Bedöm nödvändighet per krav", timeMinutes: 40, purpose: "Granska varje SKA-krav och bedöma om det verkligen är nödvändigt som obligatoriskt krav.", method: "Dot-voting", facilitationQuestions: ["Vad händer om en leverantör inte uppfyller detta krav — är det verkligen en showstopper?", "Kan vi nå samma mål genom att utvärdera kvaliteten istället för att ställa ett SKA-krav?", "Finns det alternativa sätt att uppfylla det underliggande behovet?", "Är kravet teknikneutralt eller styr det mot en specifik lösning?"], tips: "Använd 'tomtregel-testet': Om kravet inte uppfylls — klarar vi oss ändå i 6 månader? Om ja, överväg BÖR. Var extra kritisk mot tekniska SKA-krav — de begränsar konkurrensen mest." },
        { title: "Identifiera oproportionerliga krav", timeMinutes: 30, purpose: "Hitta krav som är oproportionerliga i förhållande till upphandlingens värde, marknadens mognad eller leverantörernas kapacitet.", method: "Brainstorming", facilitationQuestions: ["Finns det krav som bara en eller två leverantörer kan uppfylla?", "Finns det krav som kräver oproportionerligt hög investering från leverantören?", "Har vi krävt certifieringar eller standarder som begränsar marknaden i onödan?", "Är referenskraven (antal år, antal uppdrag) proportionerliga?"], tips: "Om ett krav utesluter mer än hälften av marknaden, ifrågasätt det. Oproportionerliga krav leder till färre anbud, högre priser och risk för överprövning. Marknadsdialog kan verifiera proportionaliteten." },
        { title: "Justera SKA till BÖR vid behov", timeMinutes: 25, purpose: "Konkret ändra kravnivån från SKA till BÖR för krav som bedömts vara oproportionerliga men fortfarande önskvärda.", method: "Presentation", facilitationQuestions: ["Vilka krav ska ändras från SKA till BÖR — och hur viktar vi dem i utvärderingen?", "Finns det BÖR-krav som borde uppgraderas till SKA baserat på vår analys?", "Hur säkerställer vi att de nya BÖR-kraven ändå prioriteras av leverantörerna?"], tips: "BÖR-krav med hög vikt i utvärderingen ger samma styrande effekt som SKA-krav men utan att utesluta leverantörer. Det är ofta den bästa kompromissen." },
        { title: "Dokumentera motiveringar", timeMinutes: 20, purpose: "Dokumentera motiveringen för varje SKA-krav — både de som behålls och de som ändras till BÖR.", method: "Presentation", facilitationQuestions: ["Kan vi motivera varje kvarvarande SKA-krav inför en överprövning?", "Har vi dokumenterat varför vi ändrade krav från SKA till BÖR?", "Finns det prejudikat eller rättspraxis vi bör referera till?"], tips: "Dokumentationen ska klara en överprövning. Motivera varje SKA-krav med: lagstöd, säkerhetskrav eller dokumenterat affärskritiskt behov. Spara all dokumentation — den kan behövas om upphandlingen överklagas." },
      ],
      preparation: "Sammanställ alla SKA-krav med nuvarande motivering. Förbered en analys av marknadens mognad (vilka leverantörer finns och vad klarar de). Ha referensupphandlingar med kravlistor för jämförelse. Bjud in jurist med LOU-kompetens.",
      followUp: ["Uppdatera kravlistan med alla nivåändringar (SKA till BÖR och vice versa)", "Dokumentera motivering för varje SKA-krav i proportionalitetsanalysen", "Verifiera med juristen att den reviderade kravmassan är LOU-konform", "Kommunicera eventuella kravändringar till berörd verksamhet"],
      sparkboardSuggestion: [
        { boardTitle: "Kravproportionalitet", questions: ["Vilka SKA-krav tror du begränsar konkurrensen mest — och behöver vi dem verkligen?", "Beskriv ett krav som du tror kan vara oproportionerligt.", "Vilket krav vill du absolut inte ge avkall på — och varför?"], timeLimit: 8 },
      ],
    },
    {
      title: "Workshopmall: Go-live planering",
      description: "Workshop för att planera produktionssättning.",
      suggestedParticipants: ["Projektledare", "IT-drift", "Leverantör", "Verksamhetschef", "Superanvändare"],
      agenda: ["Go-live kriterier", "Checklista inför produktionssättning", "Rollback-plan", "Supportplan första veckorna", "Kommunikationsplan"],
      expectedOutputs: ["Go-live plan", "Rollback-plan", "Supportplan"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Go-live kriterier", timeMinutes: 30, purpose: "Definiera tydliga, mätbara kriterier som måste vara uppfyllda innan systemet sätts i produktion.", method: "Brainstorming", facilitationQuestions: ["Vilka testresultat krävs innan vi kan gå live (t.ex. 100% kritiska testfall godkända)?", "Vilka tekniska förutsättningar måste vara på plats (integrationer, prestanda, säkerhet)?", "Vilken utbildningsnivå krävs bland användarna?", "Måste all data vara migrerad eller kan vi gå live med delmängd?", "Vem fattar det slutgiltiga go/no-go-beslutet?"], tips: "Formulera go-live-kriterierna som en checklista med ja/nej. Det ska vara kristallklart om vi är redo eller inte. Undvik subjektiva kriterier som 'tillräckligt testat'. Bestäm i förväg vem som har vetorätt." },
        { title: "Checklista inför produktionssättning", timeMinutes: 30, purpose: "Skapa en detaljerad checklista med alla aktiviteter som ska utföras dagarna före och under go-live.", method: "Affinity mapping", facilitationQuestions: ["Vilka tekniska aktiviteter måste utföras (slutmigrering, DNS-pekare, konfiguration)?", "Vilka verksamhetsaktiviteter måste förberedas (stänga gamla systemet, informera kunder)?", "I vilken ordning ska aktiviteterna utföras och hur lång tid tar varje steg?", "Vilka beroenden finns mellan aktiviteterna?", "Vem ansvarar för varje aktivitet och hur bekräftar de att den är genomförd?"], tips: "Skapa en minutplan för go-live-dagen. Ange exakta tider, ansvarig och hur bekräftelse sker. Ha en kommunikationskanal (t.ex. Teams) där alla rapporterar status i realtid." },
        { title: "Rollback-plan", timeMinutes: 25, purpose: "Ta fram en konkret plan för att rulla tillbaka till gamla systemet om go-live misslyckas.", method: "Brainstorming", facilitationQuestions: ["Vid vilken punkt beslutar vi att rulla tillbaka — vad är triggern?", "Hur lång tid tar en rollback och vad krävs tekniskt?", "Vilken data som skapats i det nya systemet riskeras vid rollback?", "Finns det en point of no return — och när infaller den?", "Vem fattar beslut om rollback och inom vilken tidsram?"], tips: "En rollback-plan du aldrig behöver använda är ändå värd guld — den ger trygghet. Öva rollback-planen innan go-live. Definiera point of no return tydligt — efter den tidpunkten måste vi lösa problemen framåt." },
        { title: "Supportplan första veckorna", timeMinutes: 25, purpose: "Planera förstärkt support under de kritiska första veckorna efter go-live.", method: "Presentation", facilitationQuestions: ["Vilken extrasupport behövs de första dagarna/veckorna — on-site, telefon, chat?", "Vilka superanvändare finns tillgängliga och i vilken omfattning?", "Hur rapporterar användare problem och hur snabbt ska de få svar?", "När kan vi gå tillbaka till normal supportnivå?", "Behöver leverantören vara on-site under go-live-perioden?"], tips: "De första 2 veckorna är kritiska. Ha superanvändare tillgängliga i varje enhet. Leverantören bör ha förstärkt support (kortare svarstider). Dokumentera alla problem — de är värdefull input för förbättringar." },
        { title: "Kommunikationsplan", timeMinutes: 20, purpose: "Planera kommunikation till alla berörda intressenter före, under och efter go-live.", method: "Presentation", facilitationQuestions: ["Vilka grupper behöver informeras om go-live och med vilken framförhållning?", "Hur kommunicerar vi om go-live försenas eller stöter på problem?", "Ska vi informera kunder/medborgare om systembytet?", "Vem är kommunikationsansvarig under go-live-dagen?"], tips: "Skicka ut information minst 2 veckor innan go-live. Förbered kommunikationsmallar: 'Vi har gått live som planerat', 'Vi har stött på problem', 'Vi har beslutat att skjuta upp'. Det sparar tid under press." },
      ],
      preparation: "Samla in testresultat och status på go-live-kriterier. Kartlägg alla tekniska beroenden och förbered rollback-procedurer. Stäm av med leverantören om deras supportinsats under go-live.",
      followUp: ["Dokumentera go-live-plan med tidslinje, ansvariga och beslutskedja", "Testa rollback-planen i testmiljö", "Utse go-live-team med tydliga roller och kontaktuppgifter", "Förbered kommunikationsmallar för olika scenarier (lyckat, försenat, avbrutet)", "Boka extra support och superanvändartid för de första 2 veckorna"],
      sparkboardSuggestion: [
        { boardTitle: "Go-live-beredskap", questions: ["Vad behöver du för att känna dig redo för go-live?", "Vilken information saknar du idag inför produktionssättningen?", "Beskriv ditt största orosmoment inför go-live."], timeLimit: 8 },
        { boardTitle: "Stödbehov", questions: ["Vilken typ av hjälp behöver du de första dagarna med det nya systemet?", "Vem vill du kunna vända dig till vid problem — superanvändare, IT, leverantör?"], timeLimit: 6 },
      ],
    },
    {
      title: "Workshopmall: Nyttorealisering",
      description: "Workshop för att planera och mäta nyttorealisering.",
      suggestedParticipants: ["Verksamhetschef", "Controller", "Projektledare", "Kvalitetsansvarig"],
      agenda: ["Definiera förväntade nyttor", "Etablera baseline (nuläge)", "Definiera mätindikatorer", "Tidplan för mätning", "Ansvar för uppföljning"],
      expectedOutputs: ["Nyttorealiseringsplan", "Mätindikatorer", "Baseline-data"],
      duration: "3h",
      profile: "",
      agendaDetailed: [
        { title: "Definiera förväntade nyttor", timeMinutes: 40, purpose: "Identifiera och formulera alla förväntade nyttor av systembytet — både kvantifierbara och kvalitativa.", method: "Brainstorming", facilitationQuestions: ["Vilka tidsbessparingar förväntar vi oss och i vilka processer?", "Vilka kvalitetsförbättringar hoppas vi uppnå (färre fel, bättre service, snabbare handläggning)?", "Finns det ekonomiska nyttor (minskade licenskostnader, färre manuella moment)?", "Vilka strategiska nyttor ger bytet (bättre beslutsunderlag, ökad digitalisering)?", "Vilka nyttor är svåra att kvantifiera men ändå viktiga (medarbetarnöjdhet, trygghet)?"], tips: "Skilj på direkt kvantifierbara nyttor (tid, pengar) och kvalitativa nyttor (bättre service, ökad trygghet). Båda är viktiga. Var realistisk — överdrivna nyttokalkyler underminerar förtroendet." },
        { title: "Etablera baseline (nuläge)", timeMinutes: 30, purpose: "Dokumentera nuläget för varje nyttomått så att vi har en referenspunkt att mäta förbättringen mot.", method: "Presentation", facilitationQuestions: ["Har vi mätdata för nuläget — t.ex. handläggningstider, antal ärenden, felfrekvens?", "Vilka nulägesmätningar saknas och hur kan vi samla in dem innan go-live?", "Finns det tillförlitliga data eller bygger nulägesbilden på uppskattningar?", "Vilka kostnader har vi idag som kan fungera som baseline (licenser, support, arbetstid)?"], tips: "Baseline måste mätas INNAN det nya systemet lanseras — annars har vi inget att jämföra med. Starta mätningarna 3-6 månader före go-live för att få tillförlitliga siffror." },
        { title: "Definiera mätindikatorer", timeMinutes: 30, purpose: "Skapa konkreta, mätbara indikatorer (KPI:er) för varje identifierad nytta.", method: "Presentation", facilitationQuestions: ["Hur mäter vi varje nytta konkret — vilken indikator och vilken datakälla?", "Är mätmetoden tillförlitlig och reproducerbar?", "Vad är målvärdet — vilken förbättring siktar vi på?", "Behöver vi nya mätverktyg eller kan befintliga system leverera data?"], tips: "Varje nytta ska ha: mätindikator, datakälla, baseline-värde, målvärde och tidpunkt för mätning. Använd SMART-principen: Specifik, Mätbar, Accepterad, Realistisk, Tidsbunden." },
        { title: "Tidplan för mätning", timeMinutes: 20, purpose: "Planera när nyttorna ska mätas: omedelbart efter go-live, efter 6 månader, efter 1 år.", method: "Presentation", facilitationQuestions: ["Hur snart efter go-live kan vi börja mäta nyttor realistiskt?", "Vilka nyttor realiseras tidigt och vilka tar längre tid?", "Hur lång inkörningsperiod behöver vi räkna med innan mätning blir meningsfull?", "Vid vilka tidpunkter ska vi rapportera nyttorealisering till ledning/styrelse?"], tips: "Mät inte för tidigt — de första 3 månaderna är en inlärningsfas där produktiviteten ofta sjunker. Första riktiga mätningen efter 6 månader, uppföljning vid 12 och 24 månader." },
        { title: "Ansvar för uppföljning", timeMinutes: 20, purpose: "Utse ansvariga för att samla in data, beräkna nyttorealisering och rapportera till ledningen.", method: "Presentation", facilitationQuestions: ["Vem ansvarar för att samla in mätdata och beräkna nyttorna?", "Vem ska rapporten ställas till och i vilket forum?", "Vad händer om nyttorna inte realiseras som planerat — vem agerar?", "Ska nyttorealiseringen vara en del av projektets avslut eller pågå efter projektet?"], tips: "Nyttorealisering pågår långt efter att projektet avslutats. Förankra ansvaret i linjeorganisationen, inte i projektorganisationen. Koppla nyttorealiseringen till verksamhetsplanen." },
      ],
      preparation: "Samla in befintliga nyttokalkyler och affärsfall. Identifiera tillgängliga mätdata för nuläget. Förbered en mall för nyttorealiseringsplan. Ha ekonomiska nyckeltal tillgängliga (licenskostnader, personalkostnader per process).",
      followUp: ["Dokumentera nyttorealiseringsplan med alla nyttor, indikatorer, baseline och målvärden", "Starta baseline-mätningar minst 3 månader före go-live", "Utse nyttorealiseringsansvarig i linjeorganisationen", "Boka in mätpunkter i verksamhetskalendern (6, 12, 24 månader efter go-live)", "Rapportera nyttorealiseringsplan till styrgrupp för godkännande"],
      sparkboardSuggestion: [
        { boardTitle: "Förväntade nyttor", questions: ["Vilken enskild förbättring ser du mest fram emot med det nya systemet?", "Hur mycket tid tror du att du kan spara per vecka med ett nytt system?", "Vilken kvalitetsförbättring hoppas du på mest?"], timeLimit: 8 },
        { boardTitle: "Nyttomätning", questions: ["Vilka nyttor tror du blir svårast att mäta — och hur kan vi ändå fånga dem?", "Vad tycker du vore ett realistiskt mål för tidsbesparing inom ditt område?"], timeLimit: 6 },
      ],
    },
  ];

  for (const tmpl of extraWorkshopTemplates) {
    const { profile, ...workshopData } = tmpl;
    await prisma.libraryItem.create({
      data: {
        type: "workshop_template",
        profile: profile ?? "",
        title: tmpl.title, description: tmpl.description,
        content: JSON.stringify({ workshop: workshopData }),
        tags: JSON.stringify(["workshopmall"]),
      },
    });
  }

  console.log("  ✓ 9 extra workshopmallar");

  // ── EXTRA KONTRAKTSKLAUSULER (6 st) ──────────────────────────

  const extraClauses = [
    { title: "Immateriella rättigheter", text: "Beställaren erhåller full nyttjanderätt till alla anpassningar, konfigurationer och integrationer som utvecklas inom ramen för avtalet. Leverantören behåller ägande av standardprodukten.", rationale: "Klarhet om IP vid anpassningar.", cluster: "Kontraktsvillkor", level: "SKA" },
    { title: "Escrow-avtal", text: "Leverantören ska ingå escrow-avtal där källkod deponeras hos oberoende tredje part. Utlämning sker vid konkurs, väsentligt avtalsbrott eller upphörande av underhåll.", rationale: "Skydd mot leverantörskonkurs.", cluster: "Kontraktsvillkor", level: "BOR" },
    { title: "Ansvarsbegränsning och försäkring", text: "Leverantörens skadeståndsansvar begränsas till 200% av årligt avtalsvärde. Leverantören ska upprätthålla relevant ansvarsförsäkring under avtalstiden.", rationale: "Balanserad riskfördelning.", cluster: "Kontraktsvillkor", level: "SKA" },
    { title: "Force majeure", text: "Ingen part ansvarar för underlåtenhet att fullgöra avtalsenliga förpliktelser om det beror på omständigheter utanför partens kontroll. Part ska meddela motparten utan dröjsmål.", rationale: "Standard avtalsvillkor.", cluster: "Kontraktsvillkor", level: "SKA" },
    { title: "Underleverantörskontroll", text: "Leverantören ansvarar för underleverantörers fullgörande som för eget. Byte av underleverantör kräver beställarens skriftliga godkännande.", rationale: "Kontroll över leveranskedjan.", cluster: "Kontraktsvillkor", level: "SKA" },
    { title: "Hävningsgrund", text: "Beställaren har rätt att häva avtalet vid väsentligt avtalsbrott som inte åtgärdas inom 30 dagar efter skriftlig reklamation. Vid hävning ska leverantören medverka till ordnad övergång.", rationale: "Trygghet vid allvarliga brister.", cluster: "Kontraktsvillkor", level: "SKA" },
  ];

  for (const clause of extraClauses) {
    await prisma.libraryItem.create({
      data: {
        type: "contract_clause", profile: "", cluster: clause.cluster,
        title: `Kontraktsklausul: ${clause.title}`,
        description: clause.rationale,
        content: JSON.stringify({ clause }),
        tags: JSON.stringify(["kontraktsvillkor", "avtal"]),
      },
    });
  }

  console.log("  ✓ 6 extra kontraktsklausuler");

  // ── EXTRA KRITERIEBLOCK (4 st) ──────────────────────────────

  const extraCriteriaBlocks = [
    {
      title: "Kriterieblock: Drift & support",
      description: "Utvärderingskriterier för drift, support och SLA",
      criteria: [
        { title: "Driftsäkerhet och SLA", weight: 10, scale: "0-5", scoringGuidance: "Bedöm erbjudna SLA-nivåer, historisk uptime och supportmodell.", anchors: { "0": "Inga SLA erbjudna", "2": "Standard SLA (<99%)", "3": "God SLA (99-99.5%)", "5": "Excellent SLA (>99.9%) med proaktiv övervakning" } },
        { title: "Supportkvalitet", weight: 5, scale: "0-5", scoringGuidance: "Bedöm supportens tillgänglighet, kompetens och svarstider." },
      ],
    },
    {
      title: "Kriterieblock: Integration & teknik",
      description: "Utvärderingskriterier för teknisk plattform och integration",
      criteria: [
        { title: "Integrationskapacitet", weight: 10, scale: "0-5", scoringGuidance: "Bedöm API-bredd, dokumentation och erfarenhet av integrationer med relevanta system.", anchors: { "0": "Inga API:er", "2": "Begränsade API:er", "3": "Fullständiga REST API:er", "5": "Omfattande API + webhooks + standardintegrationer" } },
        { title: "Teknisk plattform", weight: 5, scale: "0-5", scoringGuidance: "Bedöm plattformens modernitet, skalbarhet och framtidssäkerhet." },
      ],
    },
    {
      title: "Kriterieblock: Säkerhet & compliance",
      description: "Utvärderingskriterier för säkerhet och regelefterlevnad",
      criteria: [
        { title: "Säkerhetsarkitektur", weight: 10, scale: "0-5", scoringGuidance: "Bedöm säkerhetslösning: kryptering, åtkomstkontroll, loggning, certifieringar.", anchors: { "0": "Grundläggande brister", "2": "Basalt skydd", "3": "God säkerhet med relevant certifiering", "5": "Excellent med ISO 27001 + SOC2 + proaktiv säkerhet" } },
        { title: "GDPR-mognad", weight: 5, scale: "0-5", scoringGuidance: "Bedöm leverantörens GDPR-kompetens, processer och tekniska stödfunktioner." },
      ],
    },
    {
      title: "Kriterieblock: Avfallsspecifik funktionalitet",
      description: "Utvärderingskriterier specifika för avfallshanteringssystem",
      criteria: [
        { title: "Ruttoptimering", weight: 15, scale: "0-5", scoringGuidance: "Bedöm ruttoptimeringsalgoritm, flexibilitet och praktisk effektivitet.", anchors: { "0": "Ingen ruttoptimering", "2": "Grundläggande ruttplanering", "3": "GIS-baserad optimering", "5": "Avancerad optimering med realtidsanpassning" } },
        { title: "ÅVC-funktionalitet", weight: 10, scale: "0-5", scoringGuidance: "Bedöm stöd för besöksregistrering, fraktionshantering och statistik." },
        { title: "Kundportal", weight: 10, scale: "0-5", scoringGuidance: "Bedöm self-service portal: funktionalitet, användarvänlighet, tillgänglighet." },
      ],
    },
  ];

  for (const block of extraCriteriaBlocks) {
    await prisma.libraryItem.create({
      data: {
        type: "criteria_block", profile: "", cluster: "Utvärdering",
        title: block.title, description: block.description,
        content: JSON.stringify({ criteria: block.criteria }),
        tags: JSON.stringify(["kriterier", "utvärdering"]),
      },
    });
  }

  console.log("  ✓ 4 extra kriterieblock");

  // ── EXTRA FASCHECKLISTOR (2 st branschspecifika) ─────────────

  const extraChecklists = [
    {
      title: "Faschecklista: Avfall — Specifika kontroller",
      description: "Branschspecifika kontroller för avfallsupphandling",
      phase: "B_forbered",
      items: [
        { title: "Ruttplaneringskrav specificerade", description: "GIS, fyllnadsgrad, kapacitetsplanering", required: true },
        { title: "ÅVC-krav definierade", description: "Besöksregistrering, fraktioner, avgiftsmodell", required: true },
        { title: "Taxemodell dokumenterad", description: "Differentierade taxor, perioder, integration", required: true },
        { title: "Kundportalkrav specificerade", description: "Min sida, felanmälan, notiser", required: false },
        { title: "Fordonskommunikation specificerad", description: "Integration med fordonsdatorer och sensorer", required: false },
      ],
    },
    {
      title: "Faschecklista: Socialtjänst — Specifika kontroller",
      description: "Branschspecifika kontroller för socialtjänstupphandling",
      phase: "B_forbered",
      items: [
        { title: "IBIC-stöd verifierat", description: "Livsområden, ICF-kodning, behovsinstrument", required: true },
        { title: "Behörighetsmodell definierad", description: "Roller, delegering, spärrar", required: true },
        { title: "Myndighetsrapportering specificerad", description: "SCB, Öppna jämförelser, egna nyckeltal", required: true },
        { title: "Migreringskrav specificerade", description: "Datamappning, testmigrering, rollback", required: true },
        { title: "Sekretesshantering dokumenterad", description: "Spärrar, försegling, loggning av åtkomst", required: true },
      ],
    },
  ];

  for (const checklist of extraChecklists) {
    await prisma.libraryItem.create({
      data: {
        type: "phase_checklist", profile: "", cluster: checklist.phase,
        title: checklist.title, description: checklist.description,
        content: JSON.stringify({ checklist: { phase: checklist.phase, items: checklist.items } }),
        tags: JSON.stringify(["faschecklista", checklist.phase]),
      },
    });
  }

  console.log("  ✓ 2 extra faschecklistor");

  console.log("Library content seeded. Total: ~100 items");

  // ============================================================
  // Sample Case 1: Avfall nyanskaffning
  // ============================================================

  await prisma.idCounter.deleteMany();

  const case1Id = "CASE-000001";
  await prisma.idCounter.create({ data: { prefix: "CASE", counter: 1 } });

  await prisma.case.create({
    data: {
      id: case1Id,
      name: "Nytt avfallssystem 2026",
      domainProfile: "avfall_nyanskaffning",
      orgName: "Sundsvalls kommun",
      procurementType: "nyanskaffning",
      estimatedValueSek: 5000000,
      goals: JSON.stringify(["Modernisera avfallshantering", "Förbättra kundinformation", "Effektivisera logistik"]),
      scopeIn: JSON.stringify(["Kundregister", "Taxehantering", "Ruttplanering", "Kundportal"]),
      scopeOut: JSON.stringify(["Fordonsinköp", "Fysisk infrastruktur"]),
      status: "active",
      currentPhase: "C_genomfor",
      owner: "Anna Johansson",
      governance: JSON.stringify({ steeringGroup: ["Anna Johansson (PL)", "Erik Svensson (IT-chef)"], projectGroup: ["Maria Lindström", "Per Eriksson"], decisionForums: ["Upphandlingsnämnd"] }),
      timeline: JSON.stringify({ startDate: "2025-10-01", targetAwardDate: "2026-04-15", targetContractDate: "2026-06-01" }),
      evaluationStatus: JSON.stringify({
        announced: true,
        announcedDate: "2026-01-15",
        externalSystem: "TendSign",
        externalRef: "TS-2026-0042",
        checklist: [
          { id: "chk-1", label: "Formell kvalificering genomförd", checked: true, date: "2026-02-05" },
          { id: "chk-2", label: "Kravuppfyllelse bedömd (SKA-krav)", checked: true, date: "2026-02-10" },
          { id: "chk-3", label: "Utvärdering av tilldelningskriterier genomförd", checked: true, date: "2026-02-15" },
          { id: "chk-4", label: "Utvärderingsprotokoll upprättat", checked: true, date: "2026-02-16" },
          { id: "chk-5", label: "Tilldelningsbeslut fattat", checked: false },
          { id: "chk-6", label: "Avtalspärr löpt ut (10 dagar)", checked: false },
        ],
      }),
    },
  });

  // Stakeholders
  await prisma.idCounter.upsert({ where: { prefix: "STAK" }, create: { prefix: "STAK", counter: 3 }, update: { counter: 3 } });
  await prisma.stakeholder.createMany({
    data: [
      { id: "STAK-000001", caseId: case1Id, title: "Anna Johansson", role: "Projektledare", unit: "Avdelning Avfall", influence: 5, interest: 5, engagementStrategy: "Löpande avstämning" },
      { id: "STAK-000002", caseId: case1Id, title: "Erik Svensson", role: "IT-chef", unit: "IT-avdelningen", influence: 4, interest: 4, engagementStrategy: "Tekniska beslut" },
      { id: "STAK-000003", caseId: case1Id, title: "Maria Lindström", role: "Kundtjänstchef", unit: "Kundtjänst", influence: 3, interest: 5, engagementStrategy: "Behovsworkshops" },
    ],
  });

  // Workshops
  await prisma.idCounter.upsert({ where: { prefix: "WORK" }, create: { prefix: "WORK", counter: 2 }, update: { counter: 2 } });
  await prisma.workshop.createMany({
    data: [
      { id: "WORK-000001", caseId: case1Id, title: "Behovsworkshop 1: Kärnbehov", participants: JSON.stringify(["Anna Johansson", "Maria Lindström", "Erik Svensson"]), agenda: JSON.stringify(["Nulägesanalys", "Behov per område", "Prioritering"]), notes: "Identifierade 12 behov varav 5 P1. Konsensus om att kundregister och taxehantering är mest kritiskt.", date: "2025-11-15", tags: JSON.stringify([]) },
      { id: "WORK-000002", caseId: case1Id, title: "Riskworkshop", participants: JSON.stringify(["Anna Johansson", "Erik Svensson"]), agenda: JSON.stringify(["Riskidentifiering", "Bedömning", "Åtgärdsplanering"]), notes: "Identifierade 5 risker. Inlåsning och integrationsmisslyckande bedöms som högst.", date: "2025-12-01", tags: JSON.stringify([]) },
    ],
  });

  // Evidence
  await prisma.idCounter.upsert({ where: { prefix: "EVID" }, create: { prefix: "EVID", counter: 2 }, update: { counter: 2 } });
  await prisma.evidence.createMany({
    data: [
      { id: "EVID-000001", caseId: case1Id, title: "Marknadsanalys avfallssystem 2025", type: "market_note", source: "Analys av 6 leverantörer, deras produkter och prissättning.", tags: JSON.stringify(["marknadsanalys"]) },
      { id: "EVID-000002", caseId: case1Id, title: "Nulägesrapport befintligt system", type: "other", source: "Dokumentation av befintligt systems brister och integrationssvårigheter.", tags: JSON.stringify(["nuläge"]) },
    ],
  });

  // Needs
  await prisma.idCounter.upsert({ where: { prefix: "NEED" }, create: { prefix: "NEED", counter: 5 }, update: { counter: 5 } });
  await prisma.need.createMany({
    data: [
      { id: "NEED-000001", caseId: case1Id, title: "Modernt kundregister", cluster: "Kund & abonnemang", statement: "Vi behöver ett modernt kundregister med fullständig historik.", priority: "P1", consequenceIfNotMet: "Felaktig fakturering, kundklagomål", sources: JSON.stringify(["Workshop 1"]), metrics: JSON.stringify([{ indicator: "Antal kundärenden/mån", baseline: "450", target: "<200" }]) },
      { id: "NEED-000002", caseId: case1Id, title: "Flexibel taxehantering", cluster: "Taxa & fakturering", statement: "Taxeberäkningar måste kunna anpassas utan IT-insats.", priority: "P1", consequenceIfNotMet: "IT-beroende vid taxeändringar, fördröjd implementering", sources: JSON.stringify(["Intervju kundtjänst"]), metrics: JSON.stringify([{ indicator: "Tid för taxeändring", baseline: "2 veckor", target: "<1 dag" }]) },
      { id: "NEED-000003", caseId: case1Id, title: "Digital kundportal", cluster: "Digitala tjänster", statement: "Medborgare ska kunna hantera sitt abonnemang digitalt.", priority: "P2", sources: JSON.stringify(["Behovsworkshop"]) },
      { id: "NEED-000004", caseId: case1Id, title: "Ruttoptimering", cluster: "Logistik/insamling", statement: "Rutter ska kunna optimeras baserat på fyllnadsgrad och geografi.", priority: "P2", sources: JSON.stringify(["Intervju logistik"]) },
      { id: "NEED-000005", caseId: case1Id, title: "Dataexport och portabilitet", cluster: "Data & exit", statement: "All data ska kunna exporteras i öppna format.", priority: "P1", consequenceIfNotMet: "Inlåsning hos leverantör", sources: JSON.stringify(["Digg rekommendation"]) },
    ],
  });

  // Requirements
  await prisma.idCounter.upsert({ where: { prefix: "REQ" }, create: { prefix: "REQ", counter: 5 }, update: { counter: 5 } });
  await prisma.requirement.createMany({
    data: [
      { id: "REQ-000001", caseId: case1Id, title: "Kundregister med historik", reqType: "funktion", cluster: "Kund & abonnemang", level: "SKA", text: "Systemet ska hantera kundregister med fullständig ändringshistorik.", rationale: "Stödjer kundservice och felsökning.", linkedNeeds: JSON.stringify(["NEED-000001"]), verification: JSON.stringify({ bidEvidence: "Demo av kundregister", implementationProof: "Testfall", opsFollowUp: "Årlig granskning" }) },
      { id: "REQ-000002", caseId: case1Id, title: "Konfigurerbar taxeberäkning", reqType: "funktion", cluster: "Taxa & fakturering", level: "SKA", text: "Taxeberäkning ska vara konfigurerbar utan programmeringsinsats.", rationale: "Minskar IT-beroende och snabbar upp taxeändringar.", linkedNeeds: JSON.stringify(["NEED-000002"]), verification: JSON.stringify({ bidEvidence: "Demo av taxekonfig", implementationProof: "Test av taxeändring" }) },
      { id: "REQ-000003", caseId: case1Id, title: "Responsiv kundportal", reqType: "funktion", cluster: "Digitala tjänster", level: "BOR", text: "Kundportal bör vara responsiv och tillgänglig (WCAG 2.1 AA).", rationale: "Digitalisering av kundkommunikation.", linkedNeeds: JSON.stringify(["NEED-000003"]) },
      { id: "REQ-000004", caseId: case1Id, title: "Ruttoptimering med GIS", reqType: "funktion", cluster: "Logistik/insamling", level: "BOR", text: "Systemet bör stödja ruttoptimering med GIS-integration.", rationale: "Effektiviserar insamling.", linkedNeeds: JSON.stringify(["NEED-000004"]) },
      { id: "REQ-000005", caseId: case1Id, title: "Export i öppna format", reqType: "funktion", cluster: "Data & exit", level: "SKA", text: "All data ska kunna exporteras i CSV/JSON.", rationale: "Förhindrar inlåsning.", linkedNeeds: JSON.stringify(["NEED-000005"]), linkedRisks: JSON.stringify(["RISK-000001"]), verification: JSON.stringify({ bidEvidence: "Demo av exportfunktion", opsFollowUp: "Årlig test" }) },
    ],
  });

  // Risks
  await prisma.idCounter.upsert({ where: { prefix: "RISK" }, create: { prefix: "RISK", counter: 3 }, update: { counter: 3 } });
  await prisma.risk.createMany({
    data: [
      { id: "RISK-000001", caseId: case1Id, title: "Inlåsning hos leverantör", category: "data_exit", description: "Risk att dataexport inte fungerar fullgott.", likelihood: 3, impact: 4, score: 12, mitigation: "SKA-krav på export, test vid leverans.", relatedRequirements: JSON.stringify(["REQ-000005"]) },
      { id: "RISK-000002", caseId: case1Id, title: "Integrationer misslyckas", category: "teknik", description: "Risk att GIS-integration och fakturaintegration inte fungerar.", likelihood: 3, impact: 3, score: 9, mitigation: "PoC-krav, tydliga API-specifikationer.", relatedRequirements: JSON.stringify(["REQ-000004"]) },
      { id: "RISK-000003", caseId: case1Id, title: "Leverantörsberoende", category: "leverans", description: "Beroende av enskild leverantör.", likelihood: 2, impact: 3, score: 6, mitigation: "Krav på dokumentation och escrow." },
    ],
  });

  // Criteria
  await prisma.idCounter.upsert({ where: { prefix: "CRIT" }, create: { prefix: "CRIT", counter: 3 }, update: { counter: 3 } });
  await prisma.criterion.createMany({
    data: [
      { id: "CRIT-000001", caseId: case1Id, title: "Funktionalitet", weight: 50, scale: "0-5", scoringGuidance: "Bedöm hur väl SKA- och BÖR-krav uppfylls.", linkedRequirements: JSON.stringify(["REQ-000001", "REQ-000002", "REQ-000003"]), anchors: JSON.stringify({ "0": "Uppfyller inte grundkrav", "3": "Alla SKA-krav uppfyllda", "5": "Alla krav + mervärde" }) },
      { id: "CRIT-000002", caseId: case1Id, title: "Pris", weight: 30, scale: "0-5", scoringGuidance: "Lägst pris ger 5, relativ poäng.", anchors: JSON.stringify({ "0": "Högst pris", "5": "Lägst pris" }) },
      { id: "CRIT-000003", caseId: case1Id, title: "Leverantörskvalitet", weight: 20, scale: "0-5", scoringGuidance: "Referenser, erfarenhet, organisation.", anchors: JSON.stringify({ "0": "Inga relevanta referenser", "3": "God erfarenhet", "5": "Ledande i branschen" }) },
    ],
  });

  // Documents
  await prisma.idCounter.upsert({ where: { prefix: "DOC" }, create: { prefix: "DOC", counter: 1 }, update: { counter: 1 } });
  await prisma.document.createMany({
    data: [
      { id: "DOC-000001", caseId: case1Id, title: "Upphandlingsplan", docType: "upphandlingsplan", description: "Övergripande plan med tidslinje, resurser och milstolpar.", status: "draft", tags: JSON.stringify([]) },
    ],
  });

  // Trace links
  await prisma.traceLink.createMany({
    data: [
      { caseId: case1Id, fromType: "need", fromId: "NEED-000001", toType: "requirement", toId: "REQ-000001", relation: "addresses" },
      { caseId: case1Id, fromType: "need", fromId: "NEED-000002", toType: "requirement", toId: "REQ-000002", relation: "addresses" },
      { caseId: case1Id, fromType: "need", fromId: "NEED-000003", toType: "requirement", toId: "REQ-000003", relation: "addresses" },
      { caseId: case1Id, fromType: "need", fromId: "NEED-000004", toType: "requirement", toId: "REQ-000004", relation: "addresses" },
      { caseId: case1Id, fromType: "need", fromId: "NEED-000005", toType: "requirement", toId: "REQ-000005", relation: "addresses" },
      { caseId: case1Id, fromType: "risk", fromId: "RISK-000001", toType: "requirement", toId: "REQ-000005", relation: "mitigated_by" },
      { caseId: case1Id, fromType: "risk", fromId: "RISK-000002", toType: "requirement", toId: "REQ-000004", relation: "mitigated_by" },
      { caseId: case1Id, fromType: "requirement", fromId: "REQ-000001", toType: "criterion", toId: "CRIT-000001", relation: "evaluated_by" },
      { caseId: case1Id, fromType: "requirement", fromId: "REQ-000002", toType: "criterion", toId: "CRIT-000001", relation: "evaluated_by" },
      { caseId: case1Id, fromType: "requirement", fromId: "REQ-000003", toType: "criterion", toId: "CRIT-000001", relation: "evaluated_by" },
    ],
  });

  // Decisions for Case 1
  await prisma.idCounter.upsert({ where: { prefix: "DEC" }, create: { prefix: "DEC", counter: 2 }, update: { counter: 2 } });
  await prisma.decision.createMany({
    data: [
      { id: "DEC-000001", caseId: case1Id, title: "Val av förfarande", decisionType: "forfarande", chosen: "Öppet förfarande", alternatives: JSON.stringify(["Öppet förfarande", "Selektivt förfarande", "Förenklat förfarande"]), rationale: "Öppet förfarande ger bredast konkurrens. Värdet överstiger direktupphandlingsgränsen.", status: "approved" },
      { id: "DEC-000002", caseId: case1Id, title: "Val av utvärderingsmodell", decisionType: "utvarderingsmodell", chosen: "Bästa förhållande kvalitet/pris", alternatives: JSON.stringify(["Lägsta pris", "Bästa förhållande kvalitet/pris", "Fast pris med kvalitetskonkurrens"]), rationale: "Balanserar funktionalitet mot kostnad. Viktning: 50% funktionalitet, 30% pris, 20% leverantörskvalitet.", status: "approved" },
    ],
  });

  // Bids for Case 1 (3 anbud: 2 kvalificerade, 1 ej)
  await prisma.idCounter.upsert({ where: { prefix: "BID" }, create: { prefix: "BID", counter: 3 }, update: { counter: 3 } });
  await prisma.bid.createMany({
    data: [
      { id: "BID-000001", caseId: case1Id, title: "Anbud: WasteFlow AB", supplierName: "WasteFlow AB", receivedAt: "2026-02-01T10:00:00Z", qualified: true, qualificationNotes: "Uppfyller alla kvalificeringskrav. Etablerad leverantör med 15 kommunreferenser.", externalRef: "TS-2026-0042-A1", status: "active", tags: JSON.stringify(["kvalificerad"]) },
      { id: "BID-000002", caseId: case1Id, title: "Anbud: EcoManage Systems", supplierName: "EcoManage Systems", receivedAt: "2026-02-01T14:30:00Z", qualified: true, qualificationNotes: "Uppfyller kvalificeringskraven. Relativt ny aktör men lovande demo.", externalRef: "TS-2026-0042-A2", status: "active", tags: JSON.stringify(["kvalificerad"]) },
      { id: "BID-000003", caseId: case1Id, title: "Anbud: SmartWaste Nordic", supplierName: "SmartWaste Nordic", receivedAt: "2026-02-01T16:00:00Z", qualified: false, qualificationNotes: "Uppfyller inte SKA-krav REQ-000001 (kundregister med historik). Saknar ändringshistorik.", externalRef: "TS-2026-0042-A3", status: "active", tags: JSON.stringify(["diskvalificerad"]) },
    ],
  });

  // NOTE: BidResponses and Scores removed in hybrid model.
  // Detailed evaluation data lives in external procurement system (TendSign/Mercell).
  // Only traceability skeleton (qualification status, checklist) is kept here.

  // Additional documents for Case 1
  await prisma.idCounter.upsert({ where: { prefix: "DOC" }, update: { counter: 3 }, create: { prefix: "DOC", counter: 3 } });
  await prisma.document.createMany({
    data: [
      { id: "DOC-000002", caseId: case1Id, title: "Utvärderingsprotokoll", docType: "utvarderingsprotokoll", description: "Protokoll från utvärdering av anbud. WasteFlow AB: 84p, EcoManage: 68p.", status: "draft" },
      { id: "DOC-000003", caseId: case1Id, title: "Marknadsanalysrapport", docType: "marknadsanalys", description: "Analys av 6 leverantörer inom avfallssystem för kommunal sektor.", status: "approved" },
    ],
  });

  console.log("  ✓ Case 1 enriched: 2 decisions, 3 bids (hybrid — no responses/scores), 3 documents");

  // ============================================================
  // Sample Case 2: Socialtjänst byte
  // ============================================================

  const case2Id = "CASE-000002";
  await prisma.idCounter.upsert({ where: { prefix: "CASE" }, create: { prefix: "CASE", counter: 2 }, update: { counter: 2 } });

  await prisma.case.create({
    data: {
      id: case2Id,
      name: "Byte av socialtjänstsystem",
      domainProfile: "socialtjanst_byte",
      orgName: "Helsingborgs stad",
      procurementType: "byte",
      estimatedValueSek: 12000000,
      goals: JSON.stringify(["Byta till modernt system", "Förbättra rättssäkerhet", "Säkerställa datamigrering"]),
      scopeIn: JSON.stringify(["Handläggningsstöd", "Journalföring", "Behörighetshantering", "Statistik"]),
      scopeOut: JSON.stringify(["Ekonomisystem", "HR-system"]),
      status: "draft",
      currentPhase: "B0_exit_migrering_forstudie",
      owner: "Karl Bergman",
    },
  });

  await prisma.idCounter.upsert({ where: { prefix: "STAK" }, update: { counter: 7 }, create: { prefix: "STAK", counter: 7 } });
  await prisma.stakeholder.createMany({
    data: [
      { id: "STAK-000004", caseId: case2Id, title: "Karl Bergman", role: "Projektledare", unit: "Socialförvaltningen", influence: 5, interest: 5 },
      { id: "STAK-000005", caseId: case2Id, title: "Lena Ek", role: "Enhetschef IFO", unit: "Individ & Familj", influence: 4, interest: 5 },
      { id: "STAK-000006", caseId: case2Id, title: "Thomas Granlund", role: "IT-arkitekt", unit: "IT-avdelningen", influence: 4, interest: 4 },
      { id: "STAK-000007", caseId: case2Id, title: "Sara Nilsson", role: "Dataskyddsombud", unit: "Juridik", influence: 3, interest: 4 },
    ],
  });

  await prisma.idCounter.upsert({ where: { prefix: "NEED" }, update: { counter: 10 }, create: { prefix: "NEED", counter: 10 } });
  await prisma.need.createMany({
    data: [
      { id: "NEED-000006", caseId: case2Id, title: "Rättssäkra handläggningsflöden", cluster: "Ärende/process", statement: "Systemet måste stödja rättssäkra flöden med spårbarhet.", priority: "P1", consequenceIfNotMet: "Rättsosäkerhet, JO-anmälan", sources: JSON.stringify(["Workshop rättssäkerhet"]) },
      { id: "NEED-000007", caseId: case2Id, title: "Stark behörighetsmodell", cluster: "Behörighet & loggning", statement: "Roll- och delegeringsbaserad behörighet krävs.", priority: "P1", consequenceIfNotMet: "Obehörig åtkomst till känslig data", sources: JSON.stringify(["Kravworkshop"]) },
      { id: "NEED-000008", caseId: case2Id, title: "Komplett loggning", cluster: "Behörighet & loggning", statement: "All åtkomst och ändring ska loggas för granskning.", priority: "P1", consequenceIfNotMet: "Ej möjligt att granska åtkomst", sources: JSON.stringify(["DPO-krav"]) },
      { id: "NEED-000009", caseId: case2Id, title: "Säker datamigrering", cluster: "Migrering/exit", statement: "Befintlig data ska migreras utan förlust.", priority: "P1", consequenceIfNotMet: "Rättsosäkerhet, förlorad dokumentation", sources: JSON.stringify(["IT-analys"]) },
      { id: "NEED-000010", caseId: case2Id, title: "Dataexport vid avslut", cluster: "Data & exit", statement: "All data ska kunna exporteras vid framtida avslut.", priority: "P1", sources: JSON.stringify(["Digg"]) },
    ],
  });

  await prisma.idCounter.upsert({ where: { prefix: "RISK" }, update: { counter: 6 }, create: { prefix: "RISK", counter: 6 } });
  await prisma.risk.createMany({
    data: [
      { id: "RISK-000004", caseId: case2Id, title: "Migreringsfel med datatapp", category: "teknik", description: "Data kan gå förlorad eller korrumperas vid migrering.", likelihood: 3, impact: 5, score: 15, mitigation: "Testmigrering, rollback-plan, data-validering.", relatedRequirements: JSON.stringify(["REQ-000009"]) },
      { id: "RISK-000005", caseId: case2Id, title: "Otillräcklig loggning", category: "sakerhet", description: "Nytt system loggar inte tillräckligt för granskning.", likelihood: 3, impact: 4, score: 12, mitigation: "SKA-krav på loggning, demo vid utvärdering.", relatedRequirements: JSON.stringify(["REQ-000008"]) },
      { id: "RISK-000006", caseId: case2Id, title: "Data/exit-risk", category: "data_exit", description: "Risk att nytt system också saknar fullgod dataexport.", likelihood: 3, impact: 4, score: 12, mitigation: "SKA-krav på export, exit-klausul i avtal.", relatedRequirements: JSON.stringify(["REQ-000010"]) },
    ],
  });

  await prisma.idCounter.upsert({ where: { prefix: "REQ" }, update: { counter: 10 }, create: { prefix: "REQ", counter: 10 } });
  await prisma.requirement.createMany({
    data: [
      { id: "REQ-000006", caseId: case2Id, title: "Rättssäkra handläggningsflöden", reqType: "funktion", cluster: "Ärende/process", level: "SKA", text: "Systemet ska stödja konfigurerbara handläggningsflöden med spårbarhet.", rationale: "Krav från SoL och rättspraxis.", linkedNeeds: JSON.stringify(["NEED-000006"]), verification: JSON.stringify({ bidEvidence: "Demo av flöden", implementationProof: "Testfall" }) },
      { id: "REQ-000007", caseId: case2Id, title: "Rollbaserad behörighet", reqType: "funktion", cluster: "Behörighet & loggning", level: "SKA", text: "Rollbaserad behörighetsmodell med delegering och spärrar.", rationale: "Skydd av känsliga uppgifter.", linkedNeeds: JSON.stringify(["NEED-000007"]), verification: JSON.stringify({ bidEvidence: "Demo" }) },
      { id: "REQ-000008", caseId: case2Id, title: "Komplett händelselogg", reqType: "funktion", cluster: "Behörighet & loggning", level: "SKA", text: "All åtkomst och ändring ska loggas med tidpunkt, användare och motivering.", rationale: "Granskningskrav.", linkedNeeds: JSON.stringify(["NEED-000008"]), verification: JSON.stringify({ bidEvidence: "Demo", opsFollowUp: "Granskning" }) },
      { id: "REQ-000009", caseId: case2Id, title: "Migreringsverktyg", reqType: "funktion", cluster: "Migrering/exit", level: "SKA", text: "Leverantören ska tillhandahålla migreringsverktyg med validering och rollback.", rationale: "Minimerar risk vid datamigrering.", linkedNeeds: JSON.stringify(["NEED-000009"]), verification: JSON.stringify({ bidEvidence: "Migreringsplan", implementationProof: "Testmigrering" }) },
      { id: "REQ-000010", caseId: case2Id, title: "Export av all data", reqType: "funktion", cluster: "Data & exit", level: "SKA", text: "All data ska kunna exporteras i öppna format.", rationale: "Dataportabilitet och framtidssäkring.", linkedNeeds: JSON.stringify(["NEED-000010"]), verification: JSON.stringify({ bidEvidence: "Demo", opsFollowUp: "Årlig test" }) },
    ],
  });

  // Criteria for case 2
  await prisma.idCounter.upsert({ where: { prefix: "CRIT" }, update: { counter: 6 }, create: { prefix: "CRIT", counter: 6 } });
  await prisma.criterion.createMany({
    data: [
      { id: "CRIT-000004", caseId: case2Id, title: "Rättssäkerhet och funktionalitet", weight: 45, scale: "0-5", scoringGuidance: "Bedöm handläggningsstöd, journalföring, behörighet och loggning.", linkedRequirements: JSON.stringify(["REQ-000006", "REQ-000007", "REQ-000008"]), anchors: JSON.stringify({ "0": "Fundamentala brister", "3": "Uppfyller alla SKA-krav", "5": "Excellent rättssäkerhetsstöd" }) },
      { id: "CRIT-000005", caseId: case2Id, title: "Migrering och dataportabilitet", weight: 25, scale: "0-5", scoringGuidance: "Bedöm migreringsverktyg, plan och dataexportkapacitet.", linkedRequirements: JSON.stringify(["REQ-000009", "REQ-000010"]), anchors: JSON.stringify({ "0": "Ingen migreringsplan", "3": "Fullgod plan med verktyg", "5": "Bevisad migreringserfarenhet med referenscase" }) },
      { id: "CRIT-000006", caseId: case2Id, title: "Pris", weight: 30, scale: "0-5", scoringGuidance: "Lägst total ägandekostnad under avtalsperioden.", anchors: JSON.stringify({ "0": "Högst kostnad", "5": "Lägst kostnad" }) },
    ],
  });

  // Trace links for case 2
  await prisma.traceLink.createMany({
    data: [
      { caseId: case2Id, fromType: "need", fromId: "NEED-000006", toType: "requirement", toId: "REQ-000006", relation: "addresses" },
      { caseId: case2Id, fromType: "need", fromId: "NEED-000007", toType: "requirement", toId: "REQ-000007", relation: "addresses" },
      { caseId: case2Id, fromType: "need", fromId: "NEED-000008", toType: "requirement", toId: "REQ-000008", relation: "addresses" },
      { caseId: case2Id, fromType: "need", fromId: "NEED-000009", toType: "requirement", toId: "REQ-000009", relation: "addresses" },
      { caseId: case2Id, fromType: "need", fromId: "NEED-000010", toType: "requirement", toId: "REQ-000010", relation: "addresses" },
      { caseId: case2Id, fromType: "risk", fromId: "RISK-000004", toType: "requirement", toId: "REQ-000009", relation: "mitigated_by" },
      { caseId: case2Id, fromType: "risk", fromId: "RISK-000005", toType: "requirement", toId: "REQ-000008", relation: "mitigated_by" },
      { caseId: case2Id, fromType: "risk", fromId: "RISK-000006", toType: "requirement", toId: "REQ-000010", relation: "mitigated_by" },
      { caseId: case2Id, fromType: "requirement", fromId: "REQ-000006", toType: "criterion", toId: "CRIT-000004", relation: "evaluated_by" },
      { caseId: case2Id, fromType: "requirement", fromId: "REQ-000007", toType: "criterion", toId: "CRIT-000004", relation: "evaluated_by" },
      { caseId: case2Id, fromType: "requirement", fromId: "REQ-000009", toType: "criterion", toId: "CRIT-000005", relation: "evaluated_by" },
      { caseId: case2Id, fromType: "requirement", fromId: "REQ-000010", toType: "criterion", toId: "CRIT-000005", relation: "evaluated_by" },
    ],
  });

  // Additional data for Case 2 — evidence, workshops, decisions
  await prisma.idCounter.upsert({ where: { prefix: "EVID" }, update: { counter: 5 }, create: { prefix: "EVID", counter: 5 } });
  await prisma.evidence.createMany({
    data: [
      { id: "EVID-000003", caseId: case2Id, title: "Systeminventering befintligt system", type: "other", source: "Detaljerad inventering av funktioner, integrationer och datavolymer i befintligt Treserva-system." },
      { id: "EVID-000004", caseId: case2Id, title: "Intervjuprotokoll handläggare IFO", type: "interview", source: "Intervjuer med 8 handläggare om nuvarande system och framtida behov." },
      { id: "EVID-000005", caseId: case2Id, title: "Marknadsnotering socialtjänstsystem", type: "market_note", source: "Analys av 4 leverantörer: Pulsen, Visma, Tieto Evry, Infosoc." },
    ],
  });

  await prisma.idCounter.upsert({ where: { prefix: "WORK" }, update: { counter: 4 }, create: { prefix: "WORK", counter: 4 } });
  await prisma.workshop.createMany({
    data: [
      { id: "WORK-000003", caseId: case2Id, title: "Workshop: Rättssäkra flöden", participants: JSON.stringify(["Karl Bergman", "Lena Ek", "Sara Nilsson"]), agenda: JSON.stringify(["Kartlägg handläggningsflödet", "Identifiera rättssäkerhetskrav", "Behörighet och delegering"]), outputs: JSON.stringify(["Flödesdiagram", "Rättssäkerhetskrav"]), notes: "Identifierade 15 rättssäkerhetskritiska punkter i handläggningsflödet.", date: "2025-11-20" },
      { id: "WORK-000004", caseId: case2Id, title: "Workshop: Migreringsplanering", participants: JSON.stringify(["Thomas Granlund", "Karl Bergman"]), agenda: JSON.stringify(["Kartlägg datamodell", "Identifiera migreringsrisker", "Strategi"]), outputs: JSON.stringify(["Migreringsstrategi"]), notes: "Beslut: testmigrering i 2 omgångar. Rollback-plan för varje steg.", date: "2025-12-10" },
    ],
  });

  await prisma.idCounter.upsert({ where: { prefix: "DEC" }, update: { counter: 3 }, create: { prefix: "DEC", counter: 3 } });
  await prisma.decision.create({
    data: {
      id: "DEC-000003", caseId: case2Id, title: "Val av förfarande", decisionType: "forfarande", chosen: "Selektivt förfarande", alternatives: JSON.stringify(["Öppet förfarande", "Selektivt förfarande"]), rationale: "Selektivt förfarande med prekvalificering minskar risken att okvalificerade leverantörer tar upp utvärderingstid. Branschspecifik kompetens är kritisk.", status: "approved",
    },
  });

  console.log("  ✓ Case 2 enriched: evidence, workshops, decision");

  // ============================================================
  // MATURITY SESSIONS - Example maturity assessments
  // ============================================================

  console.log("Creating maturity sessions...");

  // General maturity session for Case 1
  const generalSession1 = await prisma.maturitySession.create({
    data: {
      caseId: case1Id,
      sessionType: "general",
      name: "Projektledare bedömning",
      shareableLink: "demo-general-session-001",
      status: "completed",
      startedAt: new Date("2025-12-01"),
      completedAt: new Date("2025-12-01"),
    },
  });

  // Add responses for general maturity dimensions
  await prisma.maturityResponse.createMany({
    data: [
      { sessionId: generalSession1.id, dimensionKey: "gdpr", score: 3.5, notes: "GDPR-processer finns men kan förbättras", evidence: "GDPR-dokumentation finns" },
      { sessionId: generalSession1.id, dimensionKey: "security", score: 4.0, notes: "God säkerhetsarkitektur", evidence: "ISO 27001-certifierad" },
      { sessionId: generalSession1.id, dimensionKey: "processes", score: 3.0, notes: "Processer dokumenterade men inte alltid följda", evidence: "Processdokument finns" },
      { sessionId: generalSession1.id, dimensionKey: "quality", score: 3.5, notes: "Kvalitetssystem etablerat", evidence: "Kvalitetsledningssystem" },
      { sessionId: generalSession1.id, dimensionKey: "change_management", score: 2.5, notes: "Förändringsledning behöver utvecklas", evidence: "Tidigare projekt visar utmaningar" },
    ],
  });

  // Second general maturity session for Case 1
  const generalSession2 = await prisma.maturitySession.create({
    data: {
      caseId: case1Id,
      sessionType: "general",
      name: "Verksamhetsföreträdare bedömning",
      shareableLink: "demo-general-session-002",
      status: "completed",
      startedAt: new Date("2025-12-02"),
      completedAt: new Date("2025-12-02"),
    },
  });

  await prisma.maturityResponse.createMany({
    data: [
      { sessionId: generalSession2.id, dimensionKey: "gdpr", score: 3.0, notes: "Medvetenhet finns men mer utbildning behövs" },
      { sessionId: generalSession2.id, dimensionKey: "security", score: 3.5, notes: "Säkerhet tas på allvar" },
      { sessionId: generalSession2.id, dimensionKey: "processes", score: 2.5, notes: "Många ad-hoc lösningar" },
      { sessionId: generalSession2.id, dimensionKey: "quality", score: 3.0, notes: "Kvalitetsfokus varierar mellan team" },
      { sessionId: generalSession2.id, dimensionKey: "change_management", score: 2.0, notes: "Motstånd mot förändring förekommer" },
    ],
  });

  // AI maturity session for Case 1
  const aiSession1 = await prisma.maturitySession.create({
    data: {
      caseId: case1Id,
      sessionType: "ai_maturity",
      name: "IT-chef AI-bedömning",
      shareableLink: "demo-ai-session-001",
      status: "completed",
      startedAt: new Date("2025-12-03"),
      completedAt: new Date("2025-12-03"),
    },
  });

  await prisma.maturityResponse.createMany({
    data: [
      { sessionId: aiSession1.id, dimensionKey: "ai_strategy", score: 2.0, notes: "AI-strategi i tidigt skede", evidence: "Draft AI-strategi finns" },
      { sessionId: aiSession1.id, dimensionKey: "ai_competence", score: 2.5, notes: "Begränsad AI-kompetens", evidence: "2 medarbetare med ML-kunskap" },
      { sessionId: aiSession1.id, dimensionKey: "data_governance", score: 3.0, notes: "Datahantering fungerar bra", evidence: "Datahanteringsplan finns" },
      { sessionId: aiSession1.id, dimensionKey: "ai_infrastructure", score: 1.5, notes: "Ingen AI-specifik infrastruktur", evidence: "Traditionell IT-infrastruktur" },
      { sessionId: aiSession1.id, dimensionKey: "ai_ethics", score: 2.5, notes: "Etiska principer under utveckling", evidence: "AI-etik diskuterad i ledningsgrupp" },
      { sessionId: aiSession1.id, dimensionKey: "ai_adoption", score: 1.0, notes: "Inga AI-lösningar i drift", evidence: "Proof-of-concepts pågår" },
    ],
  });

  // Create an active session without responses (will show warning)
  await prisma.maturitySession.create({
    data: {
      caseId: case1Id,
      sessionType: "general",
      name: "Anonym respondent",
      shareableLink: "demo-general-session-003",
      status: "active",
    },
  });

  console.log("  ✓ Created 4 maturity sessions (3 completed, 1 active)");
  console.log("Seed complete! Created 2 enriched cases with full Phase C data, trace links, maturity sessions, and ~100 library items.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

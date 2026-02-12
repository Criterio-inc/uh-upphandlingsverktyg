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
    { title: "Riskmall: Inlåsning/svag dataexport", category: "data_exit", description: "Risk att leverantören inte erbjuder fullgod dataexport, vilket försvårar byte.", likelihood: 4, impact: 4, mitigation: "Ställ SKA-krav på dataexport i öppna format, testa vid leveransgodkännande." },
    { title: "Riskmall: Migreringsfel/datatapp", category: "teknik", description: "Risk för förlust eller korruption av data vid migrering från befintligt system.", likelihood: 3, impact: 5, mitigation: "Krav på migreringsplan, testmigrering i sandlåda, rollback-plan." },
    { title: "Riskmall: Otillräcklig loggning", category: "sakerhet", description: "Risk att loggning inte möter rättssäkerhetskrav (särskilt socialtjänst).", likelihood: 3, impact: 4, mitigation: "SKA-krav på loggning med granskningsfunktion, demo vid utvärdering." },
    { title: "Riskmall: Leverantörsberoende", category: "leverans", description: "Risk för beroende av en enskild leverantör eller nyckelpersoner.", likelihood: 3, impact: 3, mitigation: "Krav på dokumentation, escrow-avtal, SLA med garanterad kontinuitet." },
    { title: "Riskmall: Integrationsmisslyckande", category: "teknik", description: "Risk att integrationer med befintliga system inte fungerar som förväntat.", likelihood: 3, impact: 4, mitigation: "PoC-krav på kritiska integrationer, tydligt specificerade API-krav." },
    { title: "Riskmall: Säkerhetsbrister", category: "sakerhet", description: "Risk för säkerhetsluckor i systemet eller dess infrastruktur.", likelihood: 2, impact: 5, mitigation: "Krav på säkerhetscertifiering, penetrationstest, incidenthanteringsplan." },
    { title: "Riskmall: Förändringsledning", category: "verksamhet", description: "Risk att organisationen inte klarar övergången till nytt system.", likelihood: 4, impact: 3, mitigation: "Förändringsledningsplan, utbildning, superanvändare, stegvis utrullning." },
    { title: "Riskmall: Användaracceptans", category: "verksamhet", description: "Risk att slutanvändarna inte accepterar det nya systemet.", likelihood: 3, impact: 4, mitigation: "Tidig involvering av användare, användbarhetstester, prototyp." },
    { title: "Riskmall: Kostnadsöverskridning", category: "ekonomi", description: "Risk att projektet överskrider budget på grund av ändrade krav eller tillägg.", likelihood: 3, impact: 3, mitigation: "Fast pris eller takpris, tydlig kravspecifikation, ändringshantering." },
    { title: "Riskmall: Överprövning", category: "juridik", description: "Risk att upphandlingen överprövas med fördröjning som följd.", likelihood: 2, impact: 4, mitigation: "Tydlig dokumentation av utvärdering, transparenta tilldelningskriterier." },
    { title: "Riskmall: Resursbrist i organisationen", category: "verksamhet", description: "Risk att organisationen saknar tillräckliga resurser för att genomföra projektet.", likelihood: 3, impact: 3, mitigation: "Dedikerad projektorganisation, extern projektledning vid behov." },
    { title: "Riskmall: Tidplansglidning", category: "leverans", description: "Risk att leverans försenas med påverkan på verksamheten.", likelihood: 4, impact: 3, mitigation: "Milstolpar med viten, löpande uppföljning, parallella aktiviteter." },
    { title: "Riskmall: Regelverksändring", category: "juridik", description: "Risk att lagändringar påverkar kravbilden under upphandlingen.", likelihood: 2, impact: 3, mitigation: "Bevakning av remisser, flexibla krav med optioner." },
    { title: "Riskmall: Personuppgiftsincident", category: "sakerhet", description: "Risk för oavsiktlig exponering av personuppgifter.", likelihood: 2, impact: 5, mitigation: "DPIA, kryptering, åtkomstkontroll, incidenthanteringsrutin." },
    { title: "Riskmall: Tillgänglighetsbrister", category: "verksamhet", description: "Risk att systemet inte uppfyller tillgänglighetskrav.", likelihood: 3, impact: 3, mitigation: "WCAG 2.1 AA som SKA-krav, oberoende tillgänglighetsgranskning." },
    { title: "Riskmall: Kompetensberoende", category: "verksamhet", description: "Risk att projektets framgång hänger på enskilda nyckelpersoner.", likelihood: 3, impact: 4, mitigation: "Dokumentation av kunskap, par-bemanning, kunskapsdelning." },
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
    { title: "Workshopmall: Behovsworkshop (generisk)", description: "Generisk behovsworkshop för kartläggning och prioritering av behov.", suggestedParticipants: ["Verksamhetsansvarig", "Slutanvändare", "IT-ansvarig", "Ekonomiansvarig"], agenda: ["Introduktion och syfte", "Kartläggning av nuläge", "Identifiera behov och smärtpunkter", "Prioritering (P1/P2/P3)", "Sammanfattning och nästa steg"], expectedOutputs: ["Behovslista", "Prioriteringsmatris"], duration: "3h", profile: "" },
    { title: "Workshopmall: Exit & migrering", description: "Workshop för att planera datamigrering och exit från befintligt system.", suggestedParticipants: ["IT-ansvarig", "Systemförvaltare", "DBA/dataansvarig", "Verksamhetsansvarig"], agenda: ["Systeminventering: vad har vi?", "Dataanalys: volymer, kvalitet, format", "Integrationskartläggning", "Migreringsstrategier", "Risk- och rollback-planering"], expectedOutputs: ["Systeminventeringsdokument", "Migreringsstrategi", "Risklista"], duration: "4h", profile: "" },
    { title: "Workshopmall: Kundresa & självservice (avfall)", description: "Workshop för att kartlägga kundresan och självservicebehov inom avfallshantering.", suggestedParticipants: ["Kundtjänstansvarig", "IT-ansvarig", "Kommunikatör", "Slutanvändare/medborgare"], agenda: ["Kartlägg kundens resa (från anmälan till faktura)", "Identifiera självservicebehov", "Digitala kanaler och tillgänglighet", "Prioritering"], expectedOutputs: ["Kundresekarta", "Självservicekrav"], duration: "3h", profile: "avfall_nyanskaffning" },
    { title: "Workshopmall: Rättssäkra flöden (socialtjänst)", description: "Workshop för att säkerställa rättssäkra handläggningsflöden.", suggestedParticipants: ["Enhetschef", "Handläggare", "Jurist", "IT-ansvarig", "Dataskyddsombud"], agenda: ["Kartlägg handläggningsflödet", "Identifiera rättssäkerhetskrav", "Behörighet och delegering", "Dokumentationskrav", "Spärrar och känsliga uppgifter"], expectedOutputs: ["Flödesdiagram", "Rättssäkerhetskrav", "Behörighetsmatris"], duration: "4h", profile: "socialtjanst_byte" },
    { title: "Workshopmall: Marknadsanalys", description: "Workshop för att analysera marknaden inför upphandling.", suggestedParticipants: ["Upphandlare", "Verksamhetsansvarig", "IT-ansvarig", "Ekonomiansvarig"], agenda: ["Definiera behov och önskat scope", "Identifiera potentiella leverantörer", "Analysera befintliga avtal i branschen", "Benchmark mot liknande organisationer", "RFI-strategi"], expectedOutputs: ["Marknadsanalysrapport", "Leverantörslista", "RFI-underlag"], duration: "3h", profile: "" },
    { title: "Workshopmall: Utvärderingsdesign", description: "Workshop för att designa utvärderingsmodell och kriterier.", suggestedParticipants: ["Upphandlare", "Verksamhetsansvarig", "Jurist", "Kvalitetssäkrare"], agenda: ["Välj utvärderingsmodell (pris/kvalitet-balans)", "Definiera kriterier och vikter", "Skapa poängskalor med ankare", "Granska proportionalitet", "Dokumentera i utvärderingsprotokoll"], expectedOutputs: ["Utvärderingsmodell", "Kriteriematris med vikter", "Poängskalor"], duration: "3h", profile: "" },
    { title: "Workshopmall: Kravrevidering", description: "Workshop för att revidera och kvalitetssäkra krav.", suggestedParticipants: ["Kravansvarig", "Verksamhetsansvarig", "IT-arkitekt", "Juridik"], agenda: ["Gå igenom befintliga krav", "Kontrollera spårbarhet till behov", "Granska SKA/BÖR-nivåer", "Kontrollera verifierbarhet", "Proportionalitetsbedömning"], expectedOutputs: ["Reviderad kravlista", "Spårbarhetsmatris", "Proportionalitetsanalys"], duration: "4h", profile: "" },
    { title: "Workshopmall: Riskworkshop", description: "Workshop för riskidentifiering och riskbedömning.", suggestedParticipants: ["Projektledare", "IT-ansvarig", "Verksamhetsansvarig", "Juridik", "Säkerhetsansvarig"], agenda: ["Brainstorm risker per kategori", "Bedöm sannolikhet och konsekvens", "Prioritera (riskmatris)", "Definiera åtgärder per risk", "Tilldela riskägare"], expectedOutputs: ["Riskregister", "Riskmatris", "Åtgärdsplan"], duration: "3h", profile: "" },
    { title: "Workshopmall: Integrationsplanering", description: "Workshop för att planera systemintegrationer.", suggestedParticipants: ["IT-arkitekt", "Systemförvaltare", "Leverantör (befintliga system)", "Projektledare"], agenda: ["Kartlägg integrationslandskap", "Definiera dataflöden", "API-krav och format", "Autentisering och säkerhet", "Test- och godkännandestrategi"], expectedOutputs: ["Integrationskarta", "API-kravlista", "Testplan"], duration: "4h", profile: "" },
    { title: "Workshopmall: Förändringsledning", description: "Workshop för att planera organisatorisk förändringsledning.", suggestedParticipants: ["Projektledare", "HR", "Enhetschefer", "Kommunikatör", "Fackrepresentant"], agenda: ["Intressentanalys", "Kommunikationsplan", "Utbildningsbehov och -plan", "Superanvändarstrategi", "Motstånd och hantering"], expectedOutputs: ["Förändringsledningsplan", "Kommunikationsplan", "Utbildningsplan"], duration: "3h", profile: "" },
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

  // ── EXTRA RISKMALLAR (10 st) ────────────────────────────────

  const extraRiskTemplates = [
    { title: "Riskmall: Bristande testning", category: "teknik", description: "Risk att otillräcklig testning leder till produktionsproblem.", likelihood: 3, impact: 4, mitigation: "Kräv testrapporter, acceptanstestperiod och regressionstester." },
    { title: "Riskmall: Skalbarhetsproblem", category: "teknik", description: "Risk att systemet inte klarar ökade volymer.", likelihood: 2, impact: 4, mitigation: "Prestandakrav i SLA, lasttester vid leveransgodkännande." },
    { title: "Riskmall: Bristande dokumentation", category: "leverans", description: "Risk att leverantören inte dokumenterar tillräckligt.", likelihood: 3, impact: 3, mitigation: "Dokumentationskrav i avtal, granskning vid milstolpar." },
    { title: "Riskmall: Underleverantörsberoende", category: "leverans", description: "Risk att kritisk funktionalitet hänger på underleverantör.", likelihood: 2, impact: 4, mitigation: "Krav på transparens om underleverantörer, back-to-back-avtal." },
    { title: "Riskmall: Bristande utbildning", category: "verksamhet", description: "Risk att användare inte får tillräcklig utbildning.", likelihood: 3, impact: 3, mitigation: "Utbildningsplan i avtal, superanvändarstrategi." },
    { title: "Riskmall: Scope creep", category: "ekonomi", description: "Risk att projektet växer utanför ursprungligt scope.", likelihood: 4, impact: 3, mitigation: "Tydlig ändringshanteringsprocess, fast scope i avtal." },
    { title: "Riskmall: Otillräcklig marknadsanalys", category: "verksamhet", description: "Risk att kravbilden inte matchar marknadens erbjudande.", likelihood: 2, impact: 4, mitigation: "RFI, marknadsdialog, benchmarking mot liknande upphandlingar." },
    { title: "Riskmall: Konkurrensbrist", category: "juridik", description: "Risk att för få anbud leder till dålig konkurrens.", likelihood: 3, impact: 3, mitigation: "Bred annonsering, marknadsbevakning, rimliga kvalificeringskrav." },
    { title: "Riskmall: Upphovsrättskonflikt", category: "juridik", description: "Risk att oklart ägande av anpassad kod/konfiguration uppstår.", likelihood: 2, impact: 3, mitigation: "Tydliga IP-klausuler i avtal, escrow-avtal." },
    { title: "Riskmall: Driftstörning vid go-live", category: "teknik", description: "Risk för allvarliga driftstörningar vid produktionssättning.", likelihood: 3, impact: 5, mitigation: "Stegvis utrullning, rollback-plan, extra support under övergångsperiod." },
    { title: "Riskmall: Bristande interoperabilitet", category: "teknik", description: "Risk att systemet inte kan kommunicera med befintliga standarder.", likelihood: 3, impact: 3, mitigation: "Krav på öppna standarder (REST, SAML, XML), PoC på integrationer." },
    { title: "Riskmall: Leverantörskonkurs", category: "leverans", description: "Risk att leverantören går i konkurs under avtalsperioden.", likelihood: 1, impact: 5, mitigation: "Kreditupplysning vid kvalificering, escrow-avtal, exit-klausul." },
    { title: "Riskmall: Bristande datakvalitet vid migrering", category: "data_exit", description: "Risk att befintlig data har låg kvalitet som försvårar migrering.", likelihood: 4, impact: 3, mitigation: "Datakvalitetsanalys före migrering, datarensningsplan, testmigrering." },
    { title: "Riskmall: Felaktiga kravnivåer", category: "verksamhet", description: "Risk att SKA-krav ställs för högt och utesluter lämpliga leverantörer.", likelihood: 3, impact: 4, mitigation: "Proportionalitetsbedömning, marknadsdialog, BÖR istället för SKA." },
    { title: "Riskmall: Avtalstolkningskonflikter", category: "juridik", description: "Risk att otydliga avtalsvillkor leder till tvister.", likelihood: 3, impact: 3, mitigation: "Juridisk granskning av avtal, tydliga definitioner, tolkningsordning." },
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
    { title: "Workshopmall: Taxelogik & fakturering (avfall)", description: "Workshop för att kartlägga taxemodeller och faktureringsbehov.", suggestedParticipants: ["Ekonomichef", "Taxeansvarig", "IT", "Kundtjänst"], agenda: ["Genomgång av befintlig taxemodell", "Identifiera förändringsönskemål", "Faktureringskrav", "Integration med ekonomisystem"], expectedOutputs: ["Taxemodellspecifikation", "Faktureringskrav"], duration: "3h", profile: "avfall_nyanskaffning" },
    { title: "Workshopmall: Behörighet & loggning (socialtjänst)", description: "Workshop för att definiera behörighets- och loggningskrav.", suggestedParticipants: ["Enhetschef", "IT-säkerhet", "Dataskyddsombud", "Handläggare"], agenda: ["Kartlägg roller och behörighetsnivåer", "Definiera lägsta behörighetsprincipen", "Loggningskrav", "Spärrar och känsliga uppgifter"], expectedOutputs: ["Behörighetsmatris", "Loggningskrav", "Spärregler"], duration: "3h", profile: "socialtjanst_byte" },
    { title: "Workshopmall: Rapportering & nyckeltal", description: "Workshop för att definiera rapporterings- och nyckeltalbehov.", suggestedParticipants: ["Verksamhetschef", "Controller", "IT-ansvarig", "Kvalitetsansvarig"], agenda: ["Identifiera nyckeltal per verksamhetsområde", "Rapporteringsfrekvens och format", "Myndighetsrapportering", "Dashboardbehov"], expectedOutputs: ["Nyckeltalskatalog", "Rapporteringsplan"], duration: "3h", profile: "" },
    { title: "Workshopmall: Acceptanstest", description: "Workshop för att planera och designa acceptanstester.", suggestedParticipants: ["Testledare", "Verksamhetsrepresentanter", "IT", "Leverantör"], agenda: ["Definiera testscenarier per kravkategori", "Prioritera tester (kritisk/viktig/nice-to-have)", "Testdatahantering", "Godkännandekriterier"], expectedOutputs: ["Testplan", "Testfall", "Godkännandekriterier"], duration: "4h", profile: "" },
    { title: "Workshopmall: SLA-design", description: "Workshop för att designa servicenivåavtal.", suggestedParticipants: ["IT-driftansvarig", "Verksamhetschef", "Upphandlare", "Juridik"], agenda: ["Definiera tjänstenivåer (gold/silver/bronze)", "Svarstider och tillgänglighet", "Eskaleringsprocess", "Vitesmodell", "Mätning och rapportering"], expectedOutputs: ["SLA-specifikation", "Vitesmodell", "Mätplan"], duration: "3h", profile: "" },
    { title: "Workshopmall: Datamodell & migration (socialtjänst)", description: "Workshop för att analysera datamodellen och planera migration.", suggestedParticipants: ["DBA", "Systemförvaltare", "IT-arkitekt", "Verksamhetsexpert"], agenda: ["Kartlägg befintlig datamodell", "Identifiera datakvalitetsproblem", "Mappning till nytt system", "Testmigreringsplan", "Gallring och arkivering"], expectedOutputs: ["Datamappning", "Kvalitetsrapport", "Migreringsplan"], duration: "4h", profile: "socialtjanst_byte" },
    { title: "Workshopmall: Proportionalitetsbedömning", description: "Workshop för att bedöma proportionaliteten i kravställningen.", suggestedParticipants: ["Upphandlare", "Jurist", "Verksamhetsansvarig", "Leverantörsrepresentant (vid RFI)"], agenda: ["Genomgång av SKA-krav", "Bedöm nödvändighet per krav", "Identifiera oproportionerliga krav", "Justera SKA→BÖR vid behov", "Dokumentera motiveringar"], expectedOutputs: ["Proportionalitetsanalys", "Reviderad kravlista"], duration: "3h", profile: "" },
    { title: "Workshopmall: Go-live planering", description: "Workshop för att planera produktionssättning.", suggestedParticipants: ["Projektledare", "IT-drift", "Leverantör", "Verksamhetschef", "Superanvändare"], agenda: ["Go-live kriterier", "Checklista inför produktionssättning", "Rollback-plan", "Supportplan första veckorna", "Kommunikationsplan"], expectedOutputs: ["Go-live plan", "Rollback-plan", "Supportplan"], duration: "3h", profile: "" },
    { title: "Workshopmall: Nyttorealisering", description: "Workshop för att planera och mäta nyttorealisering.", suggestedParticipants: ["Verksamhetschef", "Controller", "Projektledare", "Kvalitetsansvarig"], agenda: ["Definiera förväntade nyttor", "Etablera baseline (nuläge)", "Definiera mätindikatorer", "Tidplan för mätning", "Ansvar för uppföljning"], expectedOutputs: ["Nyttorealiseringsplan", "Mätindikatorer", "Baseline-data"], duration: "3h", profile: "" },
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
      { id: "BID-000001", caseId: case1Id, title: "Anbud: WasteFlow AB", supplierName: "WasteFlow AB", receivedAt: "2026-02-01T10:00:00Z", qualified: true, qualificationNotes: "Uppfyller alla kvalificeringskrav. Etablerad leverantör med 15 kommunreferenser.", status: "active", tags: JSON.stringify(["kvalificerad"]) },
      { id: "BID-000002", caseId: case1Id, title: "Anbud: EcoManage Systems", supplierName: "EcoManage Systems", receivedAt: "2026-02-01T14:30:00Z", qualified: true, qualificationNotes: "Uppfyller kvalificeringskraven. Relativt ny aktör men lovande demo.", status: "active", tags: JSON.stringify(["kvalificerad"]) },
      { id: "BID-000003", caseId: case1Id, title: "Anbud: SmartWaste Nordic", supplierName: "SmartWaste Nordic", receivedAt: "2026-02-01T16:00:00Z", qualified: false, qualificationNotes: "Uppfyller inte SKA-krav REQ-000001 (kundregister med historik). Saknar ändringshistorik.", status: "active", tags: JSON.stringify(["diskvalificerad"]) },
    ],
  });

  // BidResponses for Case 1 — kvalificerade anbud × alla krav
  await prisma.bidResponse.createMany({
    data: [
      // WasteFlow AB responses
      { caseId: case1Id, bidId: "BID-000001", requirementId: "REQ-000001", meets: "yes", supplierStatement: "Fullständigt kundregister med detaljerad ändringshistorik per fält. Audit trail sedan 2018.", reviewNotes: "Verifierat via demo." },
      { caseId: case1Id, bidId: "BID-000001", requirementId: "REQ-000002", meets: "yes", supplierStatement: "Drag-and-drop taxekonfigurator med regelmotor. Ingen kod krävs.", reviewNotes: "Imponerande demo med komplext taxeexempel." },
      { caseId: case1Id, bidId: "BID-000001", requirementId: "REQ-000003", meets: "yes", supplierStatement: "Responsiv kundportal med WCAG 2.1 AA. Tillgänglighetsrapport bifogad.", reviewNotes: "Komplett portal." },
      { caseId: case1Id, bidId: "BID-000001", requirementId: "REQ-000004", meets: "yes", supplierStatement: "GIS-baserad ruttoptimering med stöd för fyllnadsgradsdata.", reviewNotes: "Beprövad modul." },
      { caseId: case1Id, bidId: "BID-000001", requirementId: "REQ-000005", meets: "yes", supplierStatement: "Export i CSV, JSON och XML. API för programmatisk export.", reviewNotes: "Komplett exportfunktion." },
      // EcoManage Systems responses
      { caseId: case1Id, bidId: "BID-000002", requirementId: "REQ-000001", meets: "yes", supplierStatement: "Kundregister med versionshantering. Alla ändringar spåras.", reviewNotes: "Godkänt men enklare historikvy." },
      { caseId: case1Id, bidId: "BID-000002", requirementId: "REQ-000002", meets: "partial", supplierStatement: "Taxekonfig via admin-gränssnitt. Vissa komplexa regler kräver supportinsats.", reviewNotes: "Uppfyller delvis — komplexa taxeändringar kräver leverantörsstöd." },
      { caseId: case1Id, bidId: "BID-000002", requirementId: "REQ-000003", meets: "yes", supplierStatement: "Kundportal med responsiv design. WCAG-granskning planerad Q2 2026.", reviewNotes: "Bra grund men WCAG-granskning ej genomförd." },
      { caseId: case1Id, bidId: "BID-000002", requirementId: "REQ-000004", meets: "partial", supplierStatement: "Basruttplanering finns. GIS-integration planerad i v2.5.", reviewNotes: "Rudimentär ruttplanering utan full GIS." },
      { caseId: case1Id, bidId: "BID-000002", requirementId: "REQ-000005", meets: "yes", supplierStatement: "Export i CSV och JSON. XLSX-export under utveckling.", reviewNotes: "Acceptabel export." },
    ],
  });

  // Scores for Case 1 — kvalificerade anbud × alla kriterier
  await prisma.score.createMany({
    data: [
      // WasteFlow AB scores
      { caseId: case1Id, bidId: "BID-000001", criterionId: "CRIT-000001", rawScore: 5, normalizedScore: 50, justification: "Uppfyller alla SKA- och BÖR-krav med mervärde. Imponerande kundregister och taxekonfigurator.", scorer: "Anna Johansson", scoredAt: "2026-02-15T10:00:00Z" },
      { caseId: case1Id, bidId: "BID-000001", criterionId: "CRIT-000002", rawScore: 3, normalizedScore: 18, justification: "Mellanpris bland anbuden. 4,2 MSEK totalt under 5 år.", scorer: "Anna Johansson", scoredAt: "2026-02-15T10:00:00Z" },
      { caseId: case1Id, bidId: "BID-000001", criterionId: "CRIT-000003", rawScore: 4, normalizedScore: 16, justification: "15 kommunreferenser, lång branscherfarenhet, stabil organisation.", scorer: "Erik Svensson", scoredAt: "2026-02-15T11:00:00Z" },
      // EcoManage Systems scores
      { caseId: case1Id, bidId: "BID-000002", criterionId: "CRIT-000001", rawScore: 3, normalizedScore: 30, justification: "Uppfyller alla SKA-krav men BÖR-krav delvis (taxehantering, GIS-rutter). Grundläggande men kompetent.", scorer: "Anna Johansson", scoredAt: "2026-02-15T10:00:00Z" },
      { caseId: case1Id, bidId: "BID-000002", criterionId: "CRIT-000002", rawScore: 5, normalizedScore: 30, justification: "Lägst pris bland anbuden. 3,1 MSEK totalt under 5 år.", scorer: "Anna Johansson", scoredAt: "2026-02-15T10:00:00Z" },
      { caseId: case1Id, bidId: "BID-000002", criterionId: "CRIT-000003", rawScore: 2, normalizedScore: 8, justification: "Relativt nytt företag, 3 kommunreferenser. God teknisk kompetens men begränsad erfarenhet.", scorer: "Erik Svensson", scoredAt: "2026-02-15T11:00:00Z" },
    ],
  });

  // Additional documents for Case 1
  await prisma.idCounter.upsert({ where: { prefix: "DOC" }, update: { counter: 3 }, create: { prefix: "DOC", counter: 3 } });
  await prisma.document.createMany({
    data: [
      { id: "DOC-000002", caseId: case1Id, title: "Utvärderingsprotokoll", docType: "utvarderingsprotokoll", description: "Protokoll från utvärdering av anbud. WasteFlow AB: 84p, EcoManage: 68p.", status: "draft" },
      { id: "DOC-000003", caseId: case1Id, title: "Marknadsanalysrapport", docType: "marknadsanalys", description: "Analys av 6 leverantörer inom avfallssystem för kommunal sektor.", status: "approved" },
    ],
  });

  console.log("  ✓ Case 1 enriched: 2 decisions, 3 bids, 10 bid responses, 6 scores, 3 documents");

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
  console.log("Seed complete! Created 2 enriched cases with full Phase C data, trace links, and ~100 library items.");
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

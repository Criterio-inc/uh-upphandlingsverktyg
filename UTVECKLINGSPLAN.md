# CRITERO SUITE - UTVECKLINGSPLAN FÖR SÄLJBAR MODULÄR PLATTFORM

**Datum:** 2026-02-14
**Version:** 1.0
**Författare:** Kodbasanalys + AI-driven strategisk planering

---

## EXECUTIVE SUMMARY

Critero Suite är en **välbyggd MVP** med stark teknisk grund och modulär arkitektur. För att bli en **säljbar B2B SaaS-produkt** behövs fokus på:

1. **Multi-tenancy & Organisationshantering** (KRITISKT för B2B)
2. **Billing & Licensiering** (KRITISKT för monetisering)
3. **Förbättrade moduler** (göra befintliga moduler mer kompletta)
4. **Nya säljbara moduler** (utöka suite:n)
5. **Enterprise-funktioner** (audit logging, SSO, compliance)

**Tidsram för marknadslansering:**
- **v2.0 (B2B-redo):** 6-8 veckor
- **v2.5 (Enterprise-redo):** 4-6 månader

---

## NULÄGE - STYRKOR & SVAGHETER

### ✅ STYRKOR

| Område | Status |
|--------|--------|
| **Modulär arkitektur** | ⭐⭐⭐⭐⭐ Feature flags, pluggbar design |
| **Datamodell** | ⭐⭐⭐⭐⭐ 25+ modeller, komplett LOU-kedja |
| **Tech stack** | ⭐⭐⭐⭐⭐ Next.js 16, React 19, Prisma 7, moderna patterns |
| **Domänprofiler** | ⭐⭐⭐⭐ Pluggbar profilstruktur (3 profiler) |
| **Feature flags** | ⭐⭐⭐⭐⭐ Cascade-logik, per-user toggles |
| **UI-komponenter** | ⭐⭐⭐⭐ Generiskt entity-ramverk, DRY |
| **Clerk-integration** | ⭐⭐⭐⭐ Webhook-sync, admin-hantering |

### ⚠️ KRITISKA LUCKOR FÖR B2B SAAS

| Område | Status | Impact |
|--------|--------|--------|
| **Multi-tenancy** | ❌ Saknas | 🔴 BLOCKER för B2B |
| **Data isolation** | ❌ Saknas | 🔴 BLOCKER för compliance |
| **Billing/Licensing** | ❌ Saknas | 🔴 BLOCKER för monetisering |
| **Audit logging** | ❌ Saknas | 🔴 BLOCKER för enterprise |
| **User roles** | ⚠️ Endast admin/user | 🟡 Begränsad team-collab |
| **Org structure** | ❌ Saknas | 🔴 BLOCKER för B2B |

---

## PRIORITERAD ROADMAP

### 🚀 **PRIO 1: B2B SAAS FOUNDATION (v2.0 - 6-8 veckor)**

#### 1.1 Multi-Tenancy & Organisationshantering

**MÅL:** Flera organisationer kan använda samma plattform med isolerad data.

**Implementation:**
```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  industry    String?  // Bransch för smart profil-rekommendation
  settings    Json     @default("{}")

  // Relationer
  users       OrganizationUser[]
  cases       Case[]
  projects    AssessmentProject[]
  features    OrganizationFeature[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model OrganizationUser {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  role           String   // owner, admin, editor, viewer

  organization   Organization @relation(fields: [organizationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])

  @@unique([organizationId, userId])
}

model OrganizationFeature {
  id             String   @id @default(cuid())
  organizationId String
  featureKey     String
  enabled        Boolean  @default(true)
  maxUsage       Int?     // T.ex. max antal cases

  organization   Organization @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, featureKey])
}
```

**Prisma RLS Middleware:**
```typescript
// Automatisk org-filtrering på alla queries
prisma.$use(async (params, next) => {
  const orgId = getCurrentOrgId(); // från session/context

  if (ORG_SCOPED_MODELS.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, organizationId: orgId };
    }
  }

  return next(params);
});
```

**UI:**
- Org-switcher i sidebar (dropdown med användarens orgs)
- Org settings-sida (`/settings/organization`)
- Invite users via email → Clerk invitation flow

**Tidsåtgång:** 2 veckor

---

#### 1.2 Billing & Licensiering (Stripe Integration)

**MÅL:** Monetisera via prenumerationer (Starter, Pro, Enterprise).

**Prissättningsmodell:**

| Tier | Pris/mån | Features |
|------|----------|----------|
| **Starter** | 2 995 kr | 1 org, 3 users, 10 cases, Upphandling + Bibliotek |
| **Pro** | 7 995 kr | 1 org, 10 users, 50 cases, Alla moduler utom AI-Mognadsmätning |
| **Enterprise** | Custom | Unlimited, AI-Mognadsmätning, SSO, Dedicated support |

**Implementation:**
```prisma
model Subscription {
  id               String   @id @default(cuid())
  organizationId   String   @unique

  stripeCustomerId       String?
  stripeSubscriptionId   String?
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?

  plan             String   // starter, pro, enterprise
  status           String   // active, canceled, past_due

  organization     Organization @relation(fields: [organizationId], references: [id])

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model UsageMetric {
  id             String   @id @default(cuid())
  organizationId String
  metricKey      String   // cases_count, users_count, storage_mb
  value          Int
  recordedAt     DateTime @default(now())

  @@index([organizationId, metricKey, recordedAt])
}
```

**Stripe Webhooks:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**UI:**
- `/settings/billing` - Prenumerationshantering
- Upgrade/downgrade-flöden
- Usage dashboards (antal cases/users vs. limit)
- Payment method management (Stripe Elements)

**Tidsåtgång:** 2 veckor

---

#### 1.3 Roller & Behörigheter (RBAC)

**MÅL:** Granulära rättigheter per användare inom org.

**Roller:**

| Roll | Behörigheter |
|------|-------------|
| **Owner** | Full kontroll, billing, delete org |
| **Admin** | Hantera users, features, alla cases |
| **Editor** | Skapa/redigera cases, ej settings |
| **Viewer** | Läs cases, exportera rapporter |
| **Approver** | Som Viewer + godkänna beslut (Fas C gates) |

**Implementation:**
```typescript
// Middleware för route-skydd
export async function requireRole(req: Request, role: OrgRole) {
  const session = await auth();
  const orgUser = await getOrgUser(session.userId, req.orgId);

  if (!hasRole(orgUser.role, role)) {
    throw new UnauthorizedError();
  }
}

// Case-level access (optional future enhancement)
model CaseAccess {
  id       String @id
  caseId   String
  userId   String
  role     String // editor, viewer

  @@unique([caseId, userId])
}
```

**UI:**
- `/settings/team` - User management med roller
- Role badges i UI
- Permission-gated buttons (Edit, Delete, Export)

**Tidsåtgång:** 1.5 veckor

---

#### 1.4 Audit Logging & Compliance

**MÅL:** Spåra alla ändringar för GDPR/SOC2.

**Implementation:**
```prisma
model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  action         String   // create, update, delete, export, login
  entityType     String   // Case, Requirement, User, etc.
  entityId       String?
  changes        Json?    // Old/new values
  ipAddress      String?
  userAgent      String?
  timestamp      DateTime @default(now())

  @@index([organizationId, timestamp])
  @@index([entityType, entityId])
}
```

**Middleware:**
```typescript
// Logga alla mutationer
prisma.$use(async (params, next) => {
  const result = await next(params);

  if (['create', 'update', 'delete'].includes(params.action)) {
    await logAudit({
      action: params.action,
      entityType: params.model,
      entityId: result?.id,
      changes: params.args,
    });
  }

  return result;
});
```

**UI:**
- `/settings/audit-logs` - Filtrerbar logg
- Export audit logs (CSV/JSON)
- Retention policy settings

**Tidsåtgång:** 1 vecka

---

### 🎯 **PRIO 2: MODULFÖRBÄTTRINGAR (v2.0-2.5 - parallellt)**

#### 2.1 Upphandling - Saknade funktioner

**A. Collaborative Editing (Real-time)**
- **Problem:** Ingen real-time co-editing
- **Lösning:** WebSocket via Pusher/Ably eller Supabase Realtime
- **Feature:** Se vem som redigerar (presence), live cursor, konfliktshantering
- **Tidsåtgång:** 3 veckor

**B. Document Auto-Generation**
- **Problem:** Manuella uploads, ingen template-baserad generering
- **Lösning:**
  - Templates för behovsrapport, kravbilaga, utvärderingsprotokoll
  - Docx/PDF-generation via `docxtemplater` + `pdfmake`
  - Merge data från Case → template
- **Tidsåtgång:** 2 veckor

**C. Leverantörsdatabas**
- **Problem:** Ingen historik över leverantörer/anbud
- **Lösning:**
  ```prisma
  model Supplier {
    id              String @id
    name            String
    organizationNr  String @unique
    bids            Bid[]
    contracts       Contract[]
    performanceScore Float? // Calculated from past contracts
  }
  ```
- **Tidsåtgång:** 1 vecka

**D. Integration med TendSign/Mercell**
- **Problem:** Manuell kopiering mellan system
- **Lösning:**
  - Webhook-mottagare för anbud från TendSign
  - Auto-import bid → Bid-entity
  - Sync beslut → TendSign
- **Tidsåtgång:** 3 veckor

---

#### 2.2 Mognadsmätning - Benchmark & Jämförelser

**A. Bransch-Benchmarks**
- **Problem:** Resultat utan kontext (är 3.2 bra eller dåligt?)
- **Lösning:**
  - Aggregera anonymiserad data per bransch
  - Visa percentil i resultat (Du är i 65:e percentilen för kommuner)
  - Maturity trend över tid
- **Tidsåtgång:** 2 veckor

**B. Multi-Respondent Aggregation**
- **Problem:** Enskilda svar, ingen teamvy
- **Lösning:**
  - Aggregerad radar-chart (medel + spridning)
  - Identifiera gap mellan roller (IT vs. Verksamhet)
- **Tidsåtgång:** 1 vecka

**C. Action Plan Generator (AI)**
- **Problem:** Insights är generiska
- **Lösning:**
  - Claude genererar konkret handlingsplan baserat på låga dimensioner
  - Prio-sortering (quick wins vs. strategic)
  - Export som PDF
- **Tidsåtgång:** 1.5 veckor

---

#### 2.3 Verktyg - Nya verktyg

**A. Kontraktshantering & Uppföljning**
- **Nytt verktyg:** Contract Manager
- **Features:**
  - SLA-tracking (responstider, penalties)
  - KPI-dashboard (leveransprecision, kvalitet)
  - Automated alerts vid milestones
- **Tidsåtgång:** 3 veckor

**B. Leverantörsportal (Extern)**
- **Nytt verktyg:** Supplier Portal
- **Features:**
  - Anbudsinlämning via portal
  - Q&A-logg (transparens)
  - Status-tracking för leverantör
- **Tidsåtgång:** 4 veckor

**C. AI-Driven Kravgenerator**
- **Nytt verktyg:** Requirement Generator
- **Features:**
  - Upload behovsdokument (Word/PDF)
  - Claude extraherar behov → genererar krav
  - Suggest SKA/BÖR baserat på proportionalitet
- **Tidsåtgång:** 2 veckor

---

### 🏢 **PRIO 3: ENTERPRISE FEATURES (v2.5 - 4-6 mån)**

#### 3.1 SSO & Enterprise Auth

**Implementation:**
- SAML 2.0 via Clerk Enterprise (eller Auth0)
- LDAP/Active Directory sync
- Automated user provisioning (SCIM)

**Tidsåtgång:** 2 veckor

---

#### 3.2 Advanced Analytics & BI

**Features:**
- Procurement KPI dashboard (cycle time, cost savings, compliance rate)
- Custom reports (Excel/PDF)
- Export to Power BI/Tableau

**Tidsåtgång:** 3 veckor

---

#### 3.3 White-Label & Branding

**Features:**
- Custom logo, färger, domän
- Email templates med org branding
- PDF exports med org header/footer

**Tidsåtgång:** 2 veckor

---

## NYA SÄLJBARA MODULER

### **Modul 5: HÅLLBARHETSMODUL** 🌱

**MÅL:** Stötta hållbarhetskrav i upphandling (EU Green Deal, miljömål).

**Features:**
- **Hållbarhetskriterier:** Fördefinierade krav (CO2, återvinning, sociala villkor)
- **Leverantörscertifiering:** Tracker ISO 14001, Fair Trade, etc.
- **Impact Calculation:** Beräkna CO2-besparingar per anbud
- **ESG-Scoring:** Auto-score leverantörer på ESG-kriterierna

**Integrations:**
- Miljödata från Dun & Bradstreet
- CO2-databaser (EPA, Carbon Footprint APIs)

**Marknadsvärde:** Hög – EU kräver klimatsmarta upphandlingar från 2025+

**Tidsåtgång:** 4 veckor

---

### **Modul 6: SUPPLIER RELATIONSHIP MANAGEMENT (SRM)** 🤝

**MÅL:** Hantera leverantörsrelationer efter kontrakt.

**Features:**
- **Supplier Scorecards:** Performance tracking (kvalitet, leveranstid, pris)
- **Contract Renewal Alerts:** Notifiering 6 mån före utgång
- **Spend Analysis:** Totalkostnad per leverantör/kategori
- **Risk Monitoring:** Automatisk flaggning (konkursstatus, sanktionslistor)

**Integrations:**
- Ekonomisystem (Visma, Fortnox)
- UC/Creditsafe för kreditupplysning

**Marknadsvärde:** Hög – Alla med kontrakt behöver SRM

**Tidsåtgång:** 5 veckor

---

### **Modul 7: E-SIGNING & WORKFLOW AUTOMATION** ✍️

**MÅL:** Digital signering av kontrakt + automated approval flows.

**Features:**
- **E-Sign Integration:** BankID, Scrive, DocuSign
- **Approval Workflows:** Konfigurerbar kedja (Beställare → Chef → Juridik → Ekonomi)
- **Automated Notifications:** Email/SMS vid varje steg
- **Audit Trail:** Signatur-logg med timestamps

**Marknadsvärde:** Medel-Hög – Bekvämlighet, snabbare processer

**Tidsåtgång:** 3 veckor

---

### **Modul 8: TRAINING & CERTIFICATION PLATFORM** 🎓

**MÅL:** Utöka Utbildning-modulen till en fulländad LMS.

**Features:**
- **Certifieringsprogram:** Quiz → Certificate (PDF med QR-verifiering)
- **Progress Tracking:** Per user, per org
- **Custom Courses:** Org-admin kan bygga egna kurser
- **Webinar Integration:** Zoom/Teams-integration för live-sessioner

**Marknadsvärde:** Medel – Recurring revenue via nya kurser

**Tidsåtgång:** 4 veckor

---

## TEKNISKA FÖRBÄTTRINGAR

### A. API Versioning & Documentation

**Problem:** Ingen API-versionering, saknar OpenAPI-spec

**Lösning:**
- Versioned routes: `/api/v1/cases`, `/api/v2/cases`
- Auto-genererad OpenAPI spec (Swagger)
- Public API för integrations (med API keys)

**Tidsåtgång:** 1 vecka

---

### B. Performance Optimization

**Problem:** Potentiella N+1 queries, ingen caching

**Lösning:**
- Prisma query optimization (findMany med includes)
- Redis caching för feature flags, user sessions
- CDN för static assets (Cloudflare)
- Database indexing (saknas på vissa queries)

**Tidsåtgång:** 1.5 veckor

---

### C. Testing & CI/CD

**Problem:** Inga tester, ingen CI pipeline

**Lösning:**
- Unit tests (Vitest) för lib/, validation, gates
- Integration tests (Playwright) för critical flows
- E2E tests för user journeys
- GitHub Actions CI (test → build → deploy)

**Tidsåtgång:** 2 veckor

---

### D. Monitoring & Observability

**Problem:** Basic console logging

**Lösning:**
- Structured logging (Pino)
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics + custom metrics)
- Uptime monitoring (Better Uptime)

**Tidsåtgång:** 1 vecka

---

## PRIORITERAD IMPLEMENTATIONSORDNING

### **SPRINT 1-2 (Vecka 1-4): B2B Foundation**
1. Multi-tenancy schema + migration
2. Org switcher UI
3. Stripe billing integration
4. Basic RBAC (Owner/Admin/Editor/Viewer)

### **SPRINT 3-4 (Vecka 5-8): Enterprise Readiness**
5. Audit logging
6. API versioning + docs
7. Performance optimization
8. Testing setup + CI

### **SPRINT 5-6 (Vecka 9-12): Modulförbättringar**
9. Document auto-generation
10. Mognadsmätning benchmarks
11. AI Kravgenerator
12. Contract Manager (basic)

### **SPRINT 7-10 (Vecka 13-20): Nya Moduler**
13. Hållbarhetsmodul
14. SRM modul (basic)
15. E-Signing integration

---

## MARKNADSFÖRING & SÄLJARGUMENT

### **Unika Säljpunkter (USP)**

1. **MODULÄR FLEXIBILITET**
   - "Betala bara för det du behöver"
   - Starter → Pro → Enterprise upgrade path

2. **SVENSKT & LOU-FOKUSERAT**
   - "Byggt för svensk offentlig upphandling"
   - Juridisk expertis inbyggd (gates, validering)

3. **AI-DRIVEN INSIGHTS**
   - "Claude AI ger konkreta handlingsplaner"
   - Automatisera kravskrivning, riskanalys

4. **ALL-IN-ONE SUITE**
   - "Slipp 5 olika verktyg – allt i Critero Suite"
   - Upphandling + Mognadsmätning + Verktyg + Utbildning

5. **COMPLIANCE-READY**
   - "GDPR, SOC2, audit logs från dag 1"
   - Enterprise-säkert

---

### **Målgrupper & Prissättning**

| Segment | Profil | Rekommenderad Plan | ARR/Kund |
|---------|--------|-------------------|----------|
| **Små kommuner** (< 20k inv) | 1-3 upphandlare | Starter | 35 940 kr |
| **Medelstora kommuner** (20-100k) | 5-10 användare | Pro | 95 940 kr |
| **Stora kommuner/regioner** | 20+ användare | Enterprise | 300 000+ kr |
| **Konsultbolag** | 10-50 konsulter | Pro/Enterprise | 95 940 - 500 000 kr |
| **Statliga myndigheter** | Stora team | Enterprise + White-label | 500 000+ kr |

**Total Addressable Market (Sverige):**
- 290 kommuner × 50 000 kr (medel) = **14.5M kr ARR**
- 21 regioner × 200 000 kr = **4.2M kr ARR**
- 50+ konsultbolag × 100 000 kr = **5M kr ARR**
- **TOTAL TAM: ~24M kr ARR** (konservativ)

---

## KONKURRENSANALYS

### **Huvudkonkurrenter**

| Konkurrent | Styrka | Svaghet |
|-----------|--------|---------|
| **Visma TendSign** | Stor, etablerad | Dyr, komplex, inte modulär |
| **Mercell** | Bred täckning | Klumpig UX, långsam innovation |
| **Opic** | Specialiserad på LOU | Begränsad till upphandling, ingen AI |

### **Critero Suite Differentiation**

✅ **Modulär & flexibel** (betala för vad du använder)
✅ **AI-first** (Claude-driven insights)
✅ **Modern UX** (Next.js, snabb, responsiv)
✅ **Bred suite** (Upphandling + Mognadsmätning + Verktyg)
✅ **Öppen för integration** (API-first)

---

## RISKER & MITIGERING

| Risk | Sannolikhet | Impact | Mitigering |
|------|------------|--------|-----------|
| **Multi-tenancy bugs** | Hög | Hög | Grundlig testing, gradvis rollout |
| **Data breach** | Låg | Kritisk | Penetration testing, SOC2 audit |
| **Stripe integration failure** | Medel | Hög | Sandbox testing, fallback till faktura |
| **Low adoption** | Medel | Hög | Pilot-kunder, case studies, freemium tier |
| **Konkurrent kopierar** | Hög | Medel | Snabb innovation, customer lock-in via data |

---

## SAMMANFATTNING - REKOMMENDATIONER

### **KÖR DESSA 3 SAKER FÖRST:**

1. **Multi-Tenancy + Org Model** (2 veckor)
   - Absolut kritiskt för B2B SaaS
   - Blockar all försäljning utan detta

2. **Stripe Billing** (2 veckor)
   - Monetisering från dag 1
   - Validera pricing via beta-kunder

3. **RBAC + Audit Logging** (2.5 veckor)
   - Nödvändigt för enterprise-kunder
   - Compliance-krav (GDPR)

**TOTAL TID TILL MVP 2.0:** 6-8 veckor

**DÄREFTER (parallellt):**
- Förbättra Upphandling-modulen (doc generation, TendSign integration)
- Lansera Hållbarhetsmodul (högsta marknadsvärde)
- Bygga SRM-modul (recurring revenue)

**LÅNGSIKTIG VISION (12 mån):**
- **Suite med 8 moduler** (Upphandling, Verktyg, 2×Mognadsmätning, Hållbarhet, SRM, E-Sign, Training)
- **500+ organisationer** (kommun/region/konsult)
- **ARR: 10-15M kr**

---

**Nästa steg:**
1. Prioritera roadmap med stakeholders
2. Hitta pilot-kunder för beta (2-3 kommuner)
3. Utveckla v2.0 (multi-tenancy + billing)
4. Soft launch + iterera baserat på feedback
5. Full marknadslansering Q3 2026

---

**Frågor? Kontakta utvecklingsteamet.**

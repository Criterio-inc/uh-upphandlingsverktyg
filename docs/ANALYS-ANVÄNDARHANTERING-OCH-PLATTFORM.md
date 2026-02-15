# Djupanalys: Användarhantering, Kundperspektiv & Plattformsarkitektur

**Datum:** 2026-02-15
**Scope:** Fullständig granskning av Critero Suite — användarhantering, feature-toggling, säkerhet, datamodell och arkitektur

---

## Sammanfattning

Critero Suite är en välstrukturerad plattform med generiskt entity-ramverk, feature-flaggor och domänprofiler. Analysen identifierar **23 konkreta utvecklingsområden** grupperade i 5 huvudkategorier. De mest kritiska handlar om att gå från single-user MVP till en riktig SaaS-plattform med kundhantering, organisationsisolering och flexibel produktpaketering.

---

## 1. ANVÄNDARHANTERING — Nuläge & Brister

### 1.1 Nuvarande modell

```
User (Clerk-synkad)
  ├── id: Clerk userId
  ├── email, firstName, lastName
  ├── isAdmin: boolean (binär — admin eller inte)
  └── features: UserFeature[] (per-nyckel toggle)
```

**Problem:**

| # | Problem | Var i koden | Allvarlighet |
|---|---------|-------------|-------------|
| 1 | **Hardkodad admin-email** — `par.levander@criteroconsulting.se` finns på 3 ställen | `user-features.ts:99`, `admin-content.tsx:9`, `app-sidebar.tsx:33` | Hög |
| 2 | **Binär rollmodell** — bara admin/icke-admin, inga mellannivåer | `User.isAdmin` i schema.prisma | Hög |
| 3 | **Ingen organisationstillhörighet** — alla användare är "lösa" | Saknas helt i datamodellen | Kritisk |
| 4 | **Case saknar ägarkoppling** — `Case.owner` är en fri textsträng, inte FK till User | `schema.prisma:28` | Hög |
| 5 | **Inga API-auktoriseringskontroller** — alla autentiserade användare ser alla cases | `api/cases/route.ts:6-9` | Kritisk |
| 6 | **Fail-open som default** — utan Clerk-nycklar får alla tillgång till allt | `api/features/route.ts:49-50` | Hög |
| 7 | **Ingen inbjudningshantering** — användare skapas via Clerk Dashboard, inte i appen | Admin-tips i `admin-content.tsx:41` | Medium |

### 1.2 Förslag: Ny rollmodell

```
Roller (hierarkiskt):
  ├── platform_admin    — Critero-personal, full åtkomst till allt
  ├── org_admin         — Kundadministratör, hanterar sin organisation
  ├── org_member        — Vanlig användare inom en organisation
  ├── org_viewer        — Läsbehörighet inom en organisation
  └── guest             — Extern respondent (mognadsmätning, enkäter)
```

**Ny datamodell:**

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique   // URL-vänligt namn
  plan        String   @default("trial")  // trial | starter | professional | enterprise
  maxUsers    Int      @default(5)
  settings    String   @default("{}") // JSON: branding, defaults, etc.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  memberships  OrgMembership[]
  cases        Case[]
  features     OrgFeature[]
  invitations  Invitation[]
}

model OrgMembership {
  id        String   @id @default(cuid())
  orgId     String
  userId    String
  role      String   @default("member") // admin | member | viewer
  createdAt DateTime @default(now())

  org  Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([orgId, userId])
}

model OrgFeature {
  id         String   @id @default(cuid())
  orgId      String
  featureKey String
  enabled    Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  org Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([orgId, featureKey])
}

model Invitation {
  id        String   @id @default(cuid())
  orgId     String
  email     String
  role      String   @default("member")
  token     String   @unique @default(cuid())
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  org Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([email])
}
```

---

## 2. FEATURE-TOGGLING — Nuläge & Brister

### 2.1 Nuvarande arkitektur

```
features.ts:
  APP_KEYS = ["upphandling", "verktyg", "mognadmatning", "ai-mognadmatning"]
  ALWAYS_ON = ["cases", "library", "help"]

  Kaskad: app-toggle av → alla sub-features av
  Per-user: UserFeature-tabell i DB
```

**Problem:**

| # | Problem | Detalj |
|---|---------|--------|
| 1 | **"Upphandling" alltid inkluderat** — `ALWAYS_ON` innehåller `cases` och `library` som är kärnan i upphandlingsmodulen | Om admin stänger av `upphandling` försvinner sidebaren men routerna `/cases` och `/library` är fortfarande åtkomliga |
| 2 | **Feature-nivå = per-användare, inte per-organisation** — admin måste toggla varje användare individuellt | Skalerar inte vid 50+ kunder |
| 3 | **Ingen koppling till prisplan/paket** — alla toggles är manuella | Ingen automatisering vid uppgradering/nedgradering |
| 4 | **PATCH /api/features saknar admin-check** — vilken autentiserad användare som helst kan ändra sina egna features | `api/features/route.ts:62-86` |
| 5 | **Inga sub-features för mognadsmätning** — `mognadmatning` och `ai-mognadmatning` har bara master-toggle men underliggande `survey/results`-features i sidebaren som inte matchar | `app-sidebar.tsx:127-139` refererar till `mognadmatning.survey` och `mognadmatning.results` som inte finns i `features.ts` |
| 6 | **Admin-panelen blandar globala defaults med per-user** — UI:t är oklart om vad som påverkar vem | `admin-content.tsx:654-805` |

### 2.2 Förslag: Flernivå feature-modell

```
Nivå 1: Plattformspaket (plan-baserat)
  ├── Trial:        mognadmatning
  ├── Starter:      mognadmatning + ai-mognadmatning
  ├── Professional: + upphandling + verktyg
  └── Enterprise:   allt + custom profiler + API-access

Nivå 2: Organisationsöverstyrning (admin togglar per kund-org)
  └── Critero-admin kan override plan-defaults per kund

Nivå 3: Användarroll
  └── Inom en org avgör rollen vad man kan göra (CRUD vs read-only)
```

**Nytt feature-resolution-flöde:**

```typescript
function resolveFeatures(orgId: string, userId: string): FeatureSet {
  const plan = getPlanFeatures(org.plan);          // Nivå 1: vad planen ger
  const orgOverrides = getOrgFeatures(orgId);      // Nivå 2: admin-override
  const userRole = getUserRole(orgId, userId);     // Nivå 3: rollbaserat

  return {
    ...plan,
    ...orgOverrides,
    permissions: getRolePermissions(userRole),
  };
}
```

### 2.3 Konkret: Ta bort `ALWAYS_ON`

`ALWAYS_ON = ["cases", "library", "help"]` bör tas bort och ersättas med:

```typescript
// Inget är "always on" — allt styrs av organisation + plan
export const PLAN_FEATURES: Record<Plan, FeatureKey[]> = {
  trial:        ["mognadmatning"],
  starter:      ["mognadmatning", "ai-mognadmatning"],
  professional: ["upphandling", "upphandling.training", "verktyg", ...VERKTYG_FEATURES, "mognadmatning", "ai-mognadmatning"],
  enterprise:   ALL_FEATURE_KEYS,
};
```

---

## 3. SÄKERHET & API-LAGER — Kritiska brister

### 3.1 Auktorisering saknas helt på entity-routes

```typescript
// api/cases/route.ts — ALLA cases returneras ofiltrerat
export async function GET() {
  const cases = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(cases);
}
```

**Ingen kontroll av:**
- Är användaren autentiserad?
- Tillhör caset användarens organisation?
- Har användaren rätt att se/redigera just denna entitet?

### 3.2 Förslag: Middleware + per-route guards

```typescript
// lib/auth-guard.ts
export async function requireAuth(): Promise<AuthContext> {
  const userId = await getClerkUserId();
  if (!userId) throw new ApiError(401, "Ej autentiserad");

  const membership = await getActiveMembership(userId);
  if (!membership) throw new ApiError(403, "Ingen organisation");

  return {
    userId,
    orgId: membership.orgId,
    role: membership.role,
  };
}

export async function requireCaseAccess(caseId: string, ctx: AuthContext) {
  const kase = await prisma.case.findUnique({
    where: { id: caseId },
    select: { orgId: true },
  });
  if (!kase || kase.orgId !== ctx.orgId) {
    throw new ApiError(404, "Upphandling hittades inte");
  }
}

// api/cases/route.ts — filtrerat per organisation
export async function GET() {
  const ctx = await requireAuth();
  const cases = await prisma.case.findMany({
    where: { orgId: ctx.orgId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(cases);
}
```

### 3.3 Övriga säkerhetsbrister

| # | Brist | Fil | Åtgärd |
|---|-------|-----|--------|
| 1 | Ingen rate limiting på API:et | Alla routes | Lägg till rate limiter (t.ex. `@upstash/ratelimit`) |
| 2 | Ingen input-validering (Zod/AJV) | `api/cases/route.ts:12-36` | Validera alla POST/PATCH-body med Zod-schemas |
| 3 | PATCH /api/features har ingen admin-check | `api/features/route.ts:62` | Lägg till `requireAdmin()` |
| 4 | Webhooks verifierar inte Svix-signatur korrekt i alla fall | `api/webhooks/` | Verifiera alltid `svix-signature` header |
| 5 | Inga CORS-headers | Alla API-routes | Konfigurera Next.js middleware med CORS |

---

## 4. DATAMODELL — Strukturella förbättringar

### 4.1 Case behöver orgId

```prisma
model Case {
  id    String @id
  orgId String  // NY — FK till Organization
  // ... befintliga fält

  org Organization @relation(fields: [orgId], references: [id])
  @@index([orgId])
}
```

### 4.2 AssessmentProject behöver orgId

`AssessmentProject.ownerId` (Clerk userId) bör bytas till `orgId`:

```prisma
model AssessmentProject {
  orgId String  // istället för ownerId
  // ...
  org Organization @relation(fields: [orgId], references: [id])
}
```

### 4.3 Audit trail saknas

Ingen loggning av vem som gjort vad. Förslag:

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  orgId      String
  userId     String
  action     String   // create | update | delete | export | import
  entityType String
  entityId   String
  changes    String   @default("{}") // JSON diff
  ipAddress  String   @default("")
  createdAt  DateTime @default(now())

  @@index([orgId, createdAt])
  @@index([userId])
  @@index([entityType, entityId])
}
```

### 4.4 JSON-i-SQLite-fält — begränsningar

Nuvarande mönster med JSON-strängar i SQLite-kolumner (`goals`, `governance`, `tags`, etc.) har begränsningar:

- **Inte sökbart** — `WHERE JSON_EXTRACT(...)` fungerar i SQLite men är långsamt
- **Ingen referensintegritet** — `linkedNeeds: string[]` kan referera till borttagna behov
- **Svårt att migrera** — schema-ändringar i JSON-strukturer syns inte i migrationer

**Rekommendation:** Acceptabelt för MVP men vid skalning bör relationstabeller övervägas för `linkedNeeds`, `linkedRisks`, `sources`, etc.

---

## 5. ARKITEKTUR & PRODUKTPAKETERING

### 5.1 Nuvarande vs Önskad arkitektur

**Nuvarande:**
```
Critero Suite (monolitisk)
  ├── Upphandling [alltid inkluderat*]
  ├── Verktyg [togglingsbart]
  ├── Mognadsmätning [togglingsbart]
  └── AI-Mognadsmätning [togglingsbart]

* cases + library är ALWAYS_ON
```

**Önskad:**
```
Critero Suite (modulärt, planbaserat)
  ├── Organisation & Användarhantering [alltid tillgängligt]
  │   ├── Inbjudan/onboarding
  │   ├── Rollhantering
  │   └── Organisationsinställningar
  │
  ├── Upphandling [modul — ingår i Professional+]
  │   ├── Ärendehantering
  │   ├── Bibliotek
  │   ├── Utbildning [sub-modul]
  │   └── Hjälpcenter
  │
  ├── Verktyg [modul — ingår i Professional+]
  │   ├── Nyttokalkyl
  │   ├── Riskmatris
  │   ├── Utvärderingsmodell
  │   ├── Tidslinjeplanerare
  │   ├── Intressentanalys
  │   └── Kunskapsbank
  │
  ├── Mognadsmätning [modul — ingår i Trial+]
  │   ├── Enkäter
  │   ├── Projekt/resultat
  │   └── Delningslänkar
  │
  └── AI-Mognadsmätning [modul — ingår i Starter+]
      ├── Enkäter
      ├── AI-insikter
      └── Projekt/resultat
```

### 5.2 Navigationsförändringar

**Nuvarande `AppSidebar`:**
- Visar alla aktiverade moduler direkt
- Admin-länk hårdkodad med e-post

**Förslag:**
```
Sidebar:
  ├── Hem (dashboard)
  ├── [Dynamiska moduler baserat på org.plan + orgFeatures]
  │   ├── Upphandling (om aktiverad)
  │   ├── Verktyg (om aktiverad)
  │   ├── Mognadsmätning (om aktiverad)
  │   └── AI-Mognadsmätning (om aktiverad)
  ├── ──────────
  ├── Organisation (org_admin+)
  │   ├── Användare
  │   ├── Inbjudningar
  │   └── Inställningar
  └── Admin (platform_admin)
      ├── Kunder/Organisationer
      ├── Prenumerationer
      └── Systemöversikt
```

### 5.3 Pricing & Plan-hantering

**Rekommenderad plan-struktur:**

| Plan | Pris | Moduler | Användare |
|------|------|---------|-----------|
| Trial | Gratis / 30 dagar | Mognadsmätning | 1 |
| Starter | ~2 000 kr/mån | Mognadsmätning + AI-Mognadsmätning | 5 |
| Professional | ~8 000 kr/mån | Allt | 20 |
| Enterprise | Offert | Allt + Custom profiler + API + SSO | Obegränsat |

**Implementering:**

```typescript
// config/plans.ts
export const PLANS = {
  trial: {
    label: "Trial",
    features: ["mognadmatning"],
    maxUsers: 1,
    maxCases: 0,
    maxAssessments: 3,
    durationDays: 30,
  },
  starter: {
    label: "Starter",
    features: ["mognadmatning", "ai-mognadmatning"],
    maxUsers: 5,
    maxCases: 0,
    maxAssessments: -1, // unlimited
  },
  professional: {
    label: "Professional",
    features: ALL_FEATURE_KEYS,
    maxUsers: 20,
    maxCases: -1,
    maxAssessments: -1,
  },
  enterprise: {
    label: "Enterprise",
    features: ALL_FEATURE_KEYS,
    maxUsers: -1,
    maxCases: -1,
    maxAssessments: -1,
    customProfiles: true,
    apiAccess: true,
    sso: true,
  },
} as const;
```

---

## 6. HEMSIDESVY & KUNDUPPLEVELSE

### 6.1 Nuvarande startsida

Startsidan (`src/app/page.tsx`) visar ett grid med 4 appkort. Inget välkomstflöde, ingen onboarding, ingen kontextuell information om organisationen.

### 6.2 Förslag: Organisationskontextuell dashboard

```
Hem-dashboard bör visa:
  ├── Välkommen, [förnamn] — [Organisationsnamn]
  ├── Din plan: Professional (12 av 20 användare)
  │
  ├── Snabbåtkomst (grid)
  │   ├── [Aktiverade moduler som kort]
  │   └── [Upgrade-CTA om features saknas i plan]
  │
  ├── Senaste aktivitet
  │   ├── Case X uppdaterades av Y
  │   ├── Ny mognadsmätning skapad
  │   └── 2 nya respondenter har svarat
  │
  └── Insikter
      ├── 3 upphandlingar i fas B
      ├── 12 obesvarade gate-varningar
      └── Genomsnittlig mognadsnivå: 2.8/5
```

---

## 7. PRIORITERAD HANDLINGSPLAN

### Fas 1 — Grundläggande multi-tenancy (Mest kritiskt)

1. **Skapa Organization-modell** med slug, plan, maxUsers
2. **Skapa OrgMembership** med roller (admin/member/viewer)
3. **Lägg till `orgId` på Case** och alla relaterade modeller
4. **Bygg auth-guard middleware** (`requireAuth`, `requireCaseAccess`, `requireOrgAdmin`)
5. **Filtrera alla API-routes** på `orgId`
6. **Ta bort hardkodad admin-email** — ersätt med rollcheck

### Fas 2 — Feature-system v2

7. **Skapa OrgFeature-tabell** (ersätter UserFeature för modulstyrning)
8. **Implementera plan-baserade feature-defaults** (`config/plans.ts`)
9. **Ta bort `ALWAYS_ON`** — alla moduler styrs av plan + org-override
10. **Fixa saknade feature-keys** för mognadsmätningens sub-features
11. **Lägg till admin-check på PATCH /api/features**

### Fas 3 — Organisations-admin UI

12. **Bygg `/org`-sidor** (användarlista, inbjudningar, inställningar)
13. **Bygg inbjudningsflöde** (e-post + token → onboarding)
14. **Bygg platform-admin** (`/admin/organizations`) för Critero-personal
15. **Lägg till plan-hantering** i platform-admin (ändra plan per kund)

### Fas 4 — Säkerhet & kvalitet

16. **Input-validering med Zod** på alla API-routes
17. **Rate limiting** (`@upstash/ratelimit` eller liknande)
18. **Audit trail** (AuditLog-modell + loggning i mutation-routes)
19. **CORS-konfiguration** i Next.js middleware
20. **Webhook-signaturverifiering** (Svix)

### Fas 5 — Kundupplevelse

21. **Ny onboarding-flow** (skapa org → bjud in → välj plan)
22. **Organisationskontextuell dashboard** (ersätt nuvarande `page.tsx`)
23. **Aktivitetslogg** (senaste händelser per org)

---

## 8. SPECIFIKA KODFIXAR ATT GÖRA OMEDELBART

### 8.1 Hardkodad admin-email (3 ställen)

```
src/lib/user-features.ts:99      → const ADMIN_EMAIL = "par.levander@..."
src/app/admin/admin-content.tsx:9 → const ADMIN_EMAIL = "par.levander@..."
src/components/layout/app-sidebar.tsx:33 → const ADMIN_EMAIL = "par.levander@..."
```

**Fix:** Centralisera till en config-fil eller env-variabel, och ersätt med rollbaserad check:

```typescript
// config/auth.ts
export const PLATFORM_ADMIN_EMAILS = (
  process.env.PLATFORM_ADMIN_EMAILS ?? ""
).split(",").filter(Boolean);

// Bättre: kontrollera mot User.isAdmin i DB istället
```

### 8.2 Saknade feature-keys

`app-sidebar.tsx` refererar till `mognadmatning.survey` och `mognadmatning.results` samt `ai-mognadmatning.survey` och `ai-mognadmatning.results`, men dessa finns inte i `features.ts`:

```typescript
// features.ts — saknar:
| "mognadmatning.survey"
| "mognadmatning.results"
| "ai-mognadmatning.survey"
| "ai-mognadmatning.results"
```

### 8.3 PATCH /api/features utan admin-check

Alla autentiserade användare kan ändra sina egna features. Bör kräva admin-behörighet:

```typescript
// api/features/route.ts
export async function PATCH(req: Request) {
  const ctx = await requireAuth();
  if (!ctx.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // ...
}
```

---

## 9. TEKNISK SKULD & ÖVRIGT

| Område | Observation | Rekommendation |
|--------|-------------|----------------|
| **Error handling** | Inkonsekvent — ibland fail-open, ibland fail-closed | Standardisera: fail-closed för auth, fail-open för features vid dev |
| **TypeScript** | `any`-typer förekommer sparsamt men JSON-fält är effektivt otypade | Skapa Zod-schemas för alla JSON-strukturer |
| **Tester** | Inga automatiska tester synliga | Prioritera API-route-tester (Jest/Vitest) |
| **Caching** | `force-dynamic` överallt — inget cachas | Implementera ISR/stale-while-revalidate för library, courses |
| **Sökning** | Fulltext-sökning i application layer — skalas inte | Överväg SQLite FTS5 extension |
| **Deployment** | Vercel + Turso — bra för MVP | Överväg connection pooling vid >50 concurrent users |

---

## 10. SLUTSATS

Critero Suite har en solid teknisk grund med ett smart generiskt entity-ramverk och modulär profil-arkitektur. De största bristerna handlar om **avsaknad av organisationsisolering** och **bristande auktorisering** — vilket är blockerande för att ta emot flera kunder.

**De tre viktigaste förändringarna i prioritetsordning:**

1. **Inför Organisation-modell med rollbaserad behörighet** — utan detta kan plattformen inte användas av flera kunder utan att de ser varandras data
2. **Ta bort `ALWAYS_ON` och inför planbaserad feature-styrning** — gör alla moduler (inklusive Upphandling) valbara per kund
3. **Lägg till auktoriseringskontroller på alla API-routes** — nuvarande API:er har inga behörighetskontroller alls

Dessa tre förändringar transformerar plattformen från single-user MVP till multi-tenant SaaS.

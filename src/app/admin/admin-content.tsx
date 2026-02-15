"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";

/* ------------------------------------------------------------------ */
/*  Quick links & admin tips                                           */
/* ------------------------------------------------------------------ */

const QUICK_LINKS = [
  {
    label: "Clerk Dashboard",
    description: "Hantera användare, bjud in kollegor, se inloggningshistorik",
    href: "https://dashboard.clerk.com",
    icon: "users",
  },
  {
    label: "Vercel Dashboard",
    description: "Deployments, domäner, miljövariabler, loggar",
    href: "https://vercel.com/dashboard",
    icon: "monitor",
  },
  {
    label: "Turso Dashboard",
    description: "Databas, tabeller, SQL-konsol",
    href: "https://turso.tech/app",
    icon: "database",
  },
  {
    label: "GitHub Repo",
    description: "Källkod, issues, pull requests",
    href: "https://github.com/Criterio-inc/uh-upphandlingsverktyg",
    icon: "git-branch",
  },
];

const ADMIN_TIPS = [
  {
    title: "Skapa ny organisation",
    description:
      "Klicka \"+ Ny organisation\" i organisationssektionen. Ange namn, slug och välj plan. Bjud sedan in medlemmar via Clerk.",
    icon: "building",
  },
  {
    title: "Hantera funktioner per org",
    description:
      "Expandera en organisation och använd toggles för att slå på/av funktioner. Planen ger basutbudet; overrides kan lägga till eller ta bort.",
    icon: "settings",
  },
  {
    title: "Exportera upphandlingsdata",
    description:
      "Öppna en upphandling \u2192 Exportera (XLSX/JSON/CSV). JSON-export kan återställas via import.",
    icon: "file-text",
  },
  {
    title: "Se aktiva sessioner",
    description:
      "Clerk Dashboard \u2192 Users \u2192 klicka på en användare \u2192 Sessions. Se var och när de senast var inloggade.",
    icon: "activity",
  },
];

/* ------------------------------------------------------------------ */
/*  Feature toggle config — mirrors config/features.ts                 */
/* ------------------------------------------------------------------ */

interface FeatureDef {
  key: string;
  label: string;
  description: string;
  icon: string;
  appKey: "upphandling" | "verktyg" | "mognadmatning" | "ai-mognadmatning";
}

const APP_DEFS = [
  {
    key: "upphandling",
    label: "Upphandling",
    description: "LOU-stöd med ärendehantering och bibliotek",
    icon: "clipboard-list",
  },
  {
    key: "verktyg",
    label: "Verktyg",
    description: "Analysverktyg och kunskapsbank",
    icon: "wrench",
  },
  {
    key: "mognadmatning",
    label: "Digital Mognadsmätning",
    description: "22 frågor, 4 dimensioner, 5 mognadsnivåer",
    icon: "bar-chart-3",
  },
  {
    key: "ai-mognadmatning",
    label: "AI-Mognadsmätning",
    description: "32 frågor, 8 dimensioner, AI-fokus",
    icon: "brain",
  },
];

const FEATURE_DEFS: FeatureDef[] = [
  // Upphandling
  { key: "upphandling.cases", label: "Upphandlingsärenden", description: "Skapa och hantera upphandlingsärenden", icon: "clipboard-list", appKey: "upphandling" },
  { key: "upphandling.library", label: "Bibliotek", description: "Delat bibliotek med mallar och referensmaterial", icon: "library", appKey: "upphandling" },
  { key: "upphandling.training", label: "Utbildning", description: "Upphandlingsakademin med kurser, quiz och scenarion", icon: "graduation-cap", appKey: "upphandling" },
  { key: "upphandling.help", label: "Hjälpcenter", description: "Hjälpsidor och dokumentation", icon: "help-circle", appKey: "upphandling" },
  // Verktyg
  { key: "verktyg.benefit-calculator", label: "Nyttokalkyl", description: "Kalkylverktyg för kostnads- och nyttoanalys", icon: "calculator", appKey: "verktyg" },
  { key: "verktyg.risk-matrix", label: "Riskmatris", description: "Riskbedömning med sannolikhet och konsekvens", icon: "shield-alert", appKey: "verktyg" },
  { key: "verktyg.evaluation-model", label: "Utvärderingsmodell", description: "Utvärdering och poängsättning av anbud", icon: "scale", appKey: "verktyg" },
  { key: "verktyg.timeline-planner", label: "Tidslinjeplanerare", description: "Planering och visualisering av upphandlingstidslinje", icon: "clock", appKey: "verktyg" },
  { key: "verktyg.stakeholder-map", label: "Intressentanalys", description: "Kartläggning av intressenter och deras påverkan", icon: "users", appKey: "verktyg" },
  { key: "verktyg.kunskapsbank", label: "Kunskapsbank", description: "Domäner, resonemang och AI-samtalsstöd", icon: "book-open", appKey: "verktyg" },
  // Mognadsmätning
  { key: "mognadmatning.survey", label: "Ny mätning", description: "Starta en ny digital mognadsmätning", icon: "plus-circle", appKey: "mognadmatning" },
  { key: "mognadmatning.results", label: "Projekt & resultat", description: "Visa och jämför mätresultat", icon: "folder", appKey: "mognadmatning" },
  // AI-Mognadsmätning
  { key: "ai-mognadmatning.survey", label: "Ny AI-mätning", description: "Starta en ny AI-mognadsmätning", icon: "plus-circle", appKey: "ai-mognadmatning" },
  { key: "ai-mognadmatning.results", label: "Projekt & resultat", description: "Visa och jämför AI-mätresultat", icon: "folder", appKey: "ai-mognadmatning" },
];

/* ------------------------------------------------------------------ */
/*  Plan labels                                                        */
/* ------------------------------------------------------------------ */

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial",
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

const PLAN_COLORS: Record<string, string> = {
  trial: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  starter: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  professional: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  enterprise: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AdminOrg {
  id: string;
  name: string;
  slug: string;
  plan: string;
  maxUsers: number;
  memberCount: number;
  caseCount: number;
  featureOverrideCount: number;
  createdAt: string;
}

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  plan: string;
  maxUsers: number;
  caseCount: number;
  members: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    role: string;
    joinedAt: string;
  }[];
  features: Record<string, boolean>;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  isAdmin: boolean;
  createdAt: string;
  features: Record<string, boolean>;
  memberships: {
    orgId: string;
    orgName: string;
    orgSlug: string;
    orgPlan: string;
    role: string;
  }[];
}

/* ------------------------------------------------------------------ */
/*  Toggle button component                                            */
/* ------------------------------------------------------------------ */

function ToggleSwitch({
  enabled,
  onToggle,
  disabled,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors cursor-pointer ${
        enabled ? "bg-green-500/20" : "bg-muted"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={`${enabled ? "Stäng av" : "Slå på"} ${label}`}
    >
      <div
        className={`h-4 w-4 rounded-full transition-all ${
          enabled ? "bg-green-500 ml-auto" : "bg-muted-foreground/30 ml-0"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers: check if all sub-features of an app are enabled           */
/* ------------------------------------------------------------------ */

function isAppEnabled(
  appKey: string,
  featureMap: Record<string, boolean>,
): boolean {
  const appFeatures = FEATURE_DEFS.filter((f) => f.appKey === appKey);
  if (appFeatures.length === 0) return featureMap[appKey] !== false;
  return appFeatures.every((f) => featureMap[f.key] !== false);
}

function isAppPartiallyEnabled(
  appKey: string,
  featureMap: Record<string, boolean>,
): boolean {
  const appFeatures = FEATURE_DEFS.filter((f) => f.appKey === appKey);
  if (appFeatures.length === 0) return false;
  const enabledCount = appFeatures.filter(
    (f) => featureMap[f.key] !== false,
  ).length;
  return enabledCount > 0 && enabledCount < appFeatures.length;
}

/* ------------------------------------------------------------------ */
/*  New organization form (inline)                                     */
/* ------------------------------------------------------------------ */

function NewOrgForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState("trial");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const autoSlug = (v: string) =>
    v
      .toLowerCase()
      .replace(/[åä]/g, "a")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slug || slug === autoSlug(name)) {
      setSlug(autoSlug(v));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      setError("Namn och slug krävs");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kunde inte skapa organisation");
        return;
      }
      onCreated();
    } catch {
      setError("Nätverksfel. Försök igen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-sm space-y-4">
      <p className="text-sm font-semibold text-foreground">
        Ny organisation
      </p>
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-50/50 dark:bg-red-950/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Namn
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Acme AB"
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="acme-ab"
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Plan
          </label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="trial">Trial</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancel}
          className="rounded-xl border border-border/60 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer"
        >
          Avbryt
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Skapar..." : "Skapa"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main admin component                                               */
/* ------------------------------------------------------------------ */

export default function AdminContent() {
  const { user, isLoaded } = useUser();

  // Admin check via API
  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null);

  // Organizations
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [orgsLoaded, setOrgsLoaded] = useState(false);
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);
  const [orgDetails, setOrgDetails] = useState<Record<string, OrgDetail>>({});
  const [orgDetailLoading, setOrgDetailLoading] = useState<string | null>(null);
  const [orgFeatureSaving, setOrgFeatureSaving] = useState<string | null>(null);
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [usersError, setUsersError] = useState("");

  // Verify admin status via API
  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/admin/users")
      .then((r) => setIsAdminVerified(r.ok))
      .catch(() => setIsAdminVerified(false));
  }, [user?.id]);

  // Fetch organizations
  const fetchOrgs = useCallback(() => {
    fetch("/api/admin/organizations")
      .then((r) => r.json())
      .then((data) => {
        setOrgs(data.organizations ?? []);
        setOrgsLoaded(true);
      })
      .catch(() => setOrgsLoaded(true));
  }, []);

  useEffect(() => {
    if (isAdminVerified) fetchOrgs();
  }, [isAdminVerified, fetchOrgs]);

  // Fetch org detail when expanding
  const fetchOrgDetail = useCallback(async (orgId: string) => {
    if (orgDetails[orgId]) return; // already cached
    setOrgDetailLoading(orgId);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`);
      const data = await res.json();
      if (data.organization) {
        setOrgDetails((prev) => ({ ...prev, [orgId]: data.organization }));
      }
    } catch (e) {
      console.error("Failed to fetch org detail:", e);
    } finally {
      setOrgDetailLoading(null);
    }
  }, [orgDetails]);

  // Toggle org expand
  const handleOrgExpand = useCallback(
    (orgId: string) => {
      if (expandedOrgId === orgId) {
        setExpandedOrgId(null);
      } else {
        setExpandedOrgId(orgId);
        fetchOrgDetail(orgId);
      }
    },
    [expandedOrgId, fetchOrgDetail],
  );

  // Toggle org feature
  const toggleOrgFeature = useCallback(
    async (orgId: string, featureKey: string) => {
      const detail = orgDetails[orgId];
      if (!detail) return;

      const currentVal = detail.features[featureKey] !== false;
      const newVal = !currentVal;

      // Optimistic update
      setOrgDetails((prev) => ({
        ...prev,
        [orgId]: {
          ...prev[orgId],
          features: { ...prev[orgId].features, [featureKey]: newVal },
        },
      }));
      setOrgFeatureSaving(orgId);

      try {
        await fetch(`/api/admin/organizations/${orgId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: { [featureKey]: newVal } }),
        });
      } catch (e) {
        // Revert on error
        setOrgDetails((prev) => ({
          ...prev,
          [orgId]: {
            ...prev[orgId],
            features: { ...prev[orgId].features, [featureKey]: currentVal },
          },
        }));
        console.error("Failed to toggle org feature:", e);
      } finally {
        setOrgFeatureSaving(null);
      }
    },
    [orgDetails],
  );

  // Toggle all features for an app (org-level)
  const toggleOrgAppFeatures = useCallback(
    async (orgId: string, appKey: string) => {
      const detail = orgDetails[orgId];
      if (!detail) return;

      const appFeatures = FEATURE_DEFS.filter((f) => f.appKey === appKey);
      const allEnabled = isAppEnabled(appKey, detail.features);
      const updates: Record<string, boolean> = {};

      // Also toggle the master app key
      updates[appKey] = !allEnabled;
      for (const f of appFeatures) {
        updates[f.key] = !allEnabled;
      }

      // Optimistic update
      setOrgDetails((prev) => ({
        ...prev,
        [orgId]: {
          ...prev[orgId],
          features: { ...prev[orgId].features, ...updates },
        },
      }));
      setOrgFeatureSaving(orgId);

      try {
        await fetch(`/api/admin/organizations/${orgId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: updates }),
        });
      } catch (e) {
        // Revert: re-fetch the org detail
        setOrgDetails((prev) => {
          const copy = { ...prev };
          delete copy[orgId];
          return copy;
        });
        fetchOrgDetail(orgId);
        console.error("Failed to toggle org app features:", e);
      } finally {
        setOrgFeatureSaving(null);
      }
    },
    [orgDetails, fetchOrgDetail],
  );

  // Fetch users
  const fetchUsers = useCallback(() => {
    setUsersError("");
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setUsersError(data.error);
        } else if (data.warning) {
          setUsersError(data.warning);
        }
        setUsers(data.users ?? []);
        setUsersLoaded(true);
      })
      .catch(() => {
        setUsersError(
          "Kunde inte hämta användare. Kontrollera att databasen är uppdaterad.",
        );
        setUsersLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (isAdminVerified) fetchUsers();
  }, [isAdminVerified, fetchUsers]);

  // Sync users from Clerk
  const syncUsers = useCallback(async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/admin/sync-users", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(data.message);
        fetchUsers();
      } else {
        setSyncMessage(`Fel: ${data.error}`);
      }
    } catch (e) {
      setSyncMessage("Kunde inte synka. Kontrollera CLERK_SECRET_KEY.");
      console.error("Sync error:", e);
    } finally {
      setSyncing(false);
    }
  }, [fetchUsers]);

  // Loading states
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  if (isAdminVerified === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Kontrollerar behörighet...
        </p>
      </div>
    );
  }

  if (!isAdminVerified) {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Hem
            </Link>
            <span>/</span>
            <span className="text-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Icon name="crown" size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Administration
              </h1>
              <p className="text-sm text-muted-foreground">
                Hantera organisationer, funktioner och användare
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-4xl space-y-8">
        {/* ============================================================ */}
        {/*  ORGANISATIONER                                               */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Organisationer
              </h2>
              <p className="text-sm text-muted-foreground">
                Hantera organisationer och deras funktioner
              </p>
            </div>
            <button
              onClick={() => setShowNewOrgForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <Icon name={showNewOrgForm ? "x" : "plus"} size={14} />
              {showNewOrgForm ? "Avbryt" : "+ Ny organisation"}
            </button>
          </div>

          {showNewOrgForm && (
            <NewOrgForm
              onCreated={() => {
                setShowNewOrgForm(false);
                fetchOrgs();
              }}
              onCancel={() => setShowNewOrgForm(false)}
            />
          )}

          {!orgsLoaded ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                Laddar organisationer...
              </p>
            </div>
          ) : orgs.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center space-y-3">
              <Icon
                name="building"
                size={24}
                className="text-muted-foreground/40 mx-auto"
              />
              <p className="text-sm text-muted-foreground">
                Inga organisationer skapade ännu.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Klicka &quot;+ Ny organisation&quot; för att skapa den
                första.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orgs.map((org) => {
                const isExpanded = expandedOrgId === org.id;
                const detail = orgDetails[org.id];
                const isDetailLoading = orgDetailLoading === org.id;
                const saving = orgFeatureSaving === org.id;

                return (
                  <div
                    key={org.id}
                    className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
                  >
                    {/* Org header row */}
                    <button
                      onClick={() => handleOrgExpand(org.id)}
                      className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {org.name[0]?.toUpperCase() ?? "?"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {org.name}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              PLAN_COLORS[org.plan] ?? PLAN_COLORS.trial
                            }`}
                          >
                            {PLAN_LABELS[org.plan] ?? org.plan}
                          </span>
                          {saving && (
                            <span className="text-[10px] text-muted-foreground animate-pulse">
                              Sparar...
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {org.slug}
                        </p>
                      </div>

                      {/* Summary stats */}
                      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="users" size={12} />
                          {org.memberCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clipboard-list" size={12} />
                          {org.caseCount}
                        </span>
                        {org.featureOverrideCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Icon name="settings" size={12} />
                            {org.featureOverrideCount} overrides
                          </span>
                        )}
                      </div>

                      <Icon
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        className="text-muted-foreground/50"
                      />
                    </button>

                    {/* Expanded: org details + feature toggles */}
                    {isExpanded && (
                      <div className="border-t border-border/40 px-5 py-4 space-y-5 bg-muted/10">
                        {isDetailLoading && !detail ? (
                          <p className="text-sm text-muted-foreground animate-pulse text-center py-4">
                            Laddar detaljer...
                          </p>
                        ) : detail ? (
                          <>
                            {/* Feature toggles */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                                Funktioner
                              </p>
                              {APP_DEFS.map((app) => {
                                const appFeatures = FEATURE_DEFS.filter(
                                  (f) => f.appKey === app.key,
                                );
                                const appEnabled = isAppEnabled(
                                  app.key,
                                  detail.features,
                                );
                                const appPartial = isAppPartiallyEnabled(
                                  app.key,
                                  detail.features,
                                );

                                return (
                                  <div key={app.key} className="space-y-1">
                                    {/* App master toggle */}
                                    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/20 transition-colors">
                                      <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                          appEnabled || appPartial
                                            ? "bg-primary/10"
                                            : "bg-muted/50"
                                        }`}
                                      >
                                        <Icon
                                          name={app.icon}
                                          size={14}
                                          className={
                                            appEnabled || appPartial
                                              ? "text-primary"
                                              : "text-muted-foreground/40"
                                          }
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={`text-sm font-semibold transition-colors ${
                                            appEnabled || appPartial
                                              ? "text-foreground"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {app.label}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          {app.description}
                                        </p>
                                      </div>
                                      <ToggleSwitch
                                        enabled={appEnabled}
                                        onToggle={() =>
                                          appFeatures.length > 0
                                            ? toggleOrgAppFeatures(
                                                org.id,
                                                app.key,
                                              )
                                            : toggleOrgFeature(
                                                org.id,
                                                app.key,
                                              )
                                        }
                                        disabled={saving}
                                        label={app.label}
                                      />
                                    </div>

                                    {/* Sub-features */}
                                    {appFeatures.length > 0 && (
                                      <div
                                        className={`ml-6 space-y-1 transition-opacity ${
                                          !appEnabled && !appPartial
                                            ? "opacity-40"
                                            : ""
                                        }`}
                                      >
                                        {appFeatures.map((feat) => {
                                          const enabled =
                                            detail.features[feat.key] !== false;
                                          return (
                                            <div
                                              key={feat.key}
                                              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/20 transition-colors"
                                            >
                                              <div
                                                className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                                                  enabled
                                                    ? "bg-primary/10"
                                                    : "bg-muted/50"
                                                }`}
                                              >
                                                <Icon
                                                  name={feat.icon}
                                                  size={12}
                                                  className={
                                                    enabled
                                                      ? "text-primary"
                                                      : "text-muted-foreground/40"
                                                  }
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p
                                                  className={`text-sm transition-colors ${
                                                    enabled
                                                      ? "text-foreground"
                                                      : "text-muted-foreground"
                                                  }`}
                                                >
                                                  {feat.label}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                  {feat.description}
                                                </p>
                                              </div>
                                              <ToggleSwitch
                                                enabled={enabled}
                                                onToggle={() =>
                                                  toggleOrgFeature(
                                                    org.id,
                                                    feat.key,
                                                  )
                                                }
                                                disabled={saving}
                                                label={feat.label}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Members list */}
                            <div className="space-y-2">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                                Medlemmar ({detail.members.length})
                              </p>
                              {detail.members.length === 0 ? (
                                <p className="text-xs text-muted-foreground/70 px-3 py-2">
                                  Inga medlemmar ännu. Bjud in via Clerk
                                  Dashboard.
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {detail.members.map((m) => {
                                    const memberName =
                                      [m.firstName, m.lastName]
                                        .filter(Boolean)
                                        .join(" ") || m.email;
                                    return (
                                      <div
                                        key={m.userId}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/20 transition-colors"
                                      >
                                        {m.imageUrl ? (
                                          <img
                                            src={m.imageUrl}
                                            alt=""
                                            className="h-7 w-7 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                            {(m.firstName || m.email)[0]
                                              ?.toUpperCase() ?? "?"}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-foreground truncate">
                                            {memberName}
                                          </p>
                                          <p className="text-[11px] text-muted-foreground truncate">
                                            {m.email}
                                          </p>
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                                          {m.role}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Kunde inte ladda detaljer.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/*  ANVÄNDARE                                                    */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Användare
              </h2>
              <p className="text-sm text-muted-foreground">
                Alla registrerade användare med organisationstillhörighet
              </p>
            </div>
            <button
              onClick={syncUsers}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Icon
                name="refresh-cw"
                size={14}
                className={syncing ? "animate-spin" : ""}
              />
              {syncing ? "Synkar..." : "Synka från Clerk"}
            </button>
          </div>

          {syncMessage && (
            <div className="rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
              {syncMessage}
            </div>
          )}

          {usersError && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Icon
                name="alert-triangle"
                size={14}
                className="flex-shrink-0"
              />
              {usersError}
            </div>
          )}

          {!usersLoaded ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                Laddar användare...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center space-y-3">
              <Icon
                name="users"
                size={24}
                className="text-muted-foreground/40 mx-auto"
              />
              <p className="text-sm text-muted-foreground">
                Inga användare synkade ännu.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Klicka &quot;Synka från Clerk&quot; för att hämta alla
                registrerade användare.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => {
                const isExpanded = expandedUserId === u.id;
                const displayName =
                  [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                  u.email;

                return (
                  <div
                    key={u.id}
                    className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
                  >
                    {/* User header row */}
                    <button
                      onClick={() =>
                        setExpandedUserId(isExpanded ? null : u.id)
                      }
                      className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      {u.imageUrl ? (
                        <img
                          src={u.imageUrl}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {(u.firstName || u.email)[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {displayName}
                          </p>
                          {u.isAdmin && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              <Icon name="crown" size={10} />
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.email}
                        </p>
                      </div>

                      {/* Org membership badges */}
                      <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-end">
                        {u.memberships && u.memberships.length > 0 ? (
                          u.memberships.map((m) => (
                            <span
                              key={m.orgId}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                PLAN_COLORS[m.orgPlan] ?? PLAN_COLORS.trial
                              }`}
                            >
                              <Icon name="building" size={10} />
                              {m.orgName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50">
                            Ingen org
                          </span>
                        )}
                      </div>

                      <Icon
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        className="text-muted-foreground/50"
                      />
                    </button>

                    {/* Expanded: user details */}
                    {isExpanded && (
                      <div className="border-t border-border/40 px-5 py-4 space-y-3 bg-muted/10">
                        {/* Org memberships */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                            Organisationsmedlemskap
                          </p>
                          {u.memberships && u.memberships.length > 0 ? (
                            <div className="space-y-1">
                              {u.memberships.map((m) => (
                                <div
                                  key={m.orgId}
                                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/20"
                                >
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon
                                      name="building"
                                      size={14}
                                      className="text-primary"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                      {m.orgName}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {m.orgSlug}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                      PLAN_COLORS[m.orgPlan] ??
                                      PLAN_COLORS.trial
                                    }`}
                                  >
                                    {PLAN_LABELS[m.orgPlan] ?? m.orgPlan}
                                  </span>
                                  <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                                    {m.role}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground/70 px-3 py-2">
                              Användaren tillhör ingen organisation.
                            </p>
                          )}
                        </div>

                        {/* User info */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                            Information
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground px-3">
                            <div>
                              <span className="font-medium text-foreground">
                                Skapad:
                              </span>{" "}
                              {new Date(u.createdAt).toLocaleDateString(
                                "sv-SE",
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">
                                ID:
                              </span>{" "}
                              <span className="font-mono text-[11px]">
                                {u.id.slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/*  SNABBLÄNKAR                                                  */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Snabblänkar
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon
                      name={link.icon}
                      size={18}
                      className="text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">
                        {link.label}
                      </p>
                      <Icon
                        name="external-link"
                        size={12}
                        className="text-muted-foreground/50 group-hover:text-primary transition-colors"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  ADMIN TIPS                                                   */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Administrationstips
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ADMIN_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Icon
                      name={tip.icon}
                      size={14}
                      className="text-primary"
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {tip.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  SYSTEMINFORMATION                                            */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Systeminformation
          </h2>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Stack</p>
                <p className="text-muted-foreground">Next.js 16 + React 19</p>
                <p className="text-muted-foreground">
                  Prisma 7 + Turso (SQLite)
                </p>
                <p className="text-muted-foreground">Tailwind CSS v4</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Auth</p>
                <p className="text-muted-foreground">Clerk (Development)</p>
                <p className="text-muted-foreground">Invitation only</p>
                <p className="text-muted-foreground">E-post + lösenord</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Hosting</p>
                <p className="text-muted-foreground">Vercel (auto-deploy)</p>
                <p className="text-muted-foreground">GitHub → main branch</p>
                <p className="text-muted-foreground">HTTPS / TLS 1.2+</p>
              </div>
            </div>
          </div>
        </section>

        {/* Inloggad som */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-4 text-center">
          <p className="text-[10px] text-muted-foreground/50">
            Inloggad som{" "}
            <span className="font-medium text-foreground/70">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </p>
        </div>

        {/* Tillbaka */}
        <div className="pt-2 pb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="arrow-left" size={14} />
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";

const ADMIN_EMAIL = "par.levander@criteroconsulting.se";

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
    title: "Skapa ny användare",
    description: "Gå till Clerk Dashboard \u2192 Users \u2192 + Create user. Ange e-post och ett tillfälligt lösenord. Klicka sedan \"Synka från Clerk\" här i admin-panelen.",
    icon: "user-plus",
  },
  {
    title: "Ta bort användare",
    description: "Clerk Dashboard \u2192 Users \u2192 klicka på användaren \u2192 Delete user. Synka sedan här för att uppdatera listan.",
    icon: "x",
  },
  {
    title: "Exportera upphandlingsdata",
    description: "Öppna en upphandling \u2192 Exportera (XLSX/JSON/CSV). JSON-export kan återställas via import.",
    icon: "file-text",
  },
  {
    title: "Se aktiva sessioner",
    description: "Clerk Dashboard \u2192 Users \u2192 klicka på en användare \u2192 Sessions. Se var och när de senast var inloggade.",
    icon: "activity",
  },
];

/* ------------------------------------------------------------------ */
/*  Feature toggle config — labels, icons, categories                  */
/* ------------------------------------------------------------------ */

interface FeatureDef {
  key: string;
  label: string;
  description: string;
  icon: string;
  category: "tools" | "training";
}

const FEATURE_DEFS: FeatureDef[] = [
  { key: "tools.benefit-calculator", label: "Nyttokalkyl", description: "Kalkylverktyg för kostnads- och nyttoanalys", icon: "calculator", category: "tools" },
  { key: "tools.risk-matrix", label: "Riskmatris", description: "Riskbedömning med sannolikhet och konsekvens", icon: "shield-alert", category: "tools" },
  { key: "tools.evaluation-model", label: "Utvärderingsmodell", description: "Utvärdering och poängsättning av anbud", icon: "scale", category: "tools" },
  { key: "tools.timeline-planner", label: "Tidslinjeplanerare", description: "Planering och visualisering av upphandlingstidslinje", icon: "clock", category: "tools" },
  { key: "tools.stakeholder-map", label: "Intressentanalys", description: "Kartläggning av intressenter och deras påverkan", icon: "users", category: "tools" },
  { key: "tools.kunskapsbank", label: "Kunskapsbank", description: "Domäner, resonemang och AI-samtalsstöd", icon: "book-open", category: "tools" },
  { key: "training", label: "Utbildning", description: "Upphandlingsakademin med kurser, quiz och scenarion", icon: "graduation-cap", category: "training" },
];

/* ------------------------------------------------------------------ */
/*  User type from admin API                                           */
/* ------------------------------------------------------------------ */

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  isAdmin: boolean;
  createdAt: string;
  features: Record<string, boolean>;
}

/* ------------------------------------------------------------------ */
/*  Toggle button component (reused for both global and per-user)       */
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
/*  Main admin component                                               */
/* ------------------------------------------------------------------ */

export default function AdminContent() {
  const { user, isLoaded } = useUser();

  // Global features (for "default new user" settings)
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [featuresSaving, setFeaturesSaving] = useState(false);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userSaving, setUserSaving] = useState<string | null>(null);
  const [usersError, setUsersError] = useState("");

  // Fetch current global features
  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((data) => {
        setFeatures(data.features ?? {});
        setFeaturesLoaded(true);
      })
      .catch(() => setFeaturesLoaded(true));
  }, []);

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
        setUsersError("Kunde inte hämta användare. Kontrollera att databasen är uppdaterad.");
        setUsersLoaded(true);
      });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle global feature (default for new users)
  const toggleFeature = useCallback(
    async (key: string) => {
      const updated = { ...features, [key]: !features[key] };
      setFeatures(updated);
      setFeaturesSaving(true);
      try {
        await fetch("/api/features", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: updated }),
        });
      } catch (e) {
        setFeatures(features);
        console.error("Failed to save features:", e);
      } finally {
        setFeaturesSaving(false);
      }
    },
    [features],
  );

  // Toggle per-user feature
  const toggleUserFeature = useCallback(
    async (userId: string, key: string) => {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, features: { ...u.features, [key]: !u.features[key] } }
            : u,
        ),
      );
      setUserSaving(userId);

      try {
        const userObj = users.find((u) => u.id === userId);
        const currentVal = userObj?.features[key] ?? true;
        await fetch(`/api/admin/users/${userId}/features`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: { [key]: !currentVal } }),
        });
      } catch (e) {
        // Revert on error
        fetchUsers();
        console.error("Failed to save user feature:", e);
      } finally {
        setUserSaving(null);
      }
    },
    [users, fetchUsers],
  );

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

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  const isAdmin = user?.emailAddresses?.some(
    (e) => e.emailAddress === ADMIN_EMAIL,
  );

  if (!isAdmin) {
    redirect("/cases");
  }

  const toolFeatures = FEATURE_DEFS.filter((f) => f.category === "tools");
  const trainingFeatures = FEATURE_DEFS.filter(
    (f) => f.category === "training",
  );

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link
              href="/cases"
              className="hover:text-foreground transition-colors"
            >
              Upphandlingar
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
                Hantera användare, funktioner och tjänster
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-4xl space-y-8">
        {/* ============================================================ */}
        {/*  ANVÄNDARE — per-user feature toggles                         */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Användare
              </h2>
              <p className="text-sm text-muted-foreground">
                Styr vilka funktioner varje kund har tillgång till
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
              <Icon name="alert-triangle" size={14} className="flex-shrink-0" />
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
                const saving = userSaving === u.id;

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
                      {/* Avatar */}
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
                          {saving && (
                            <span className="text-[10px] text-muted-foreground animate-pulse">
                              Sparar...
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.email}
                        </p>
                      </div>

                      {/* Feature summary — count of enabled */}
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>
                          {
                            Object.values(u.features).filter(Boolean)
                              .length
                          }
                          /{FEATURE_DEFS.length} aktiva
                        </span>
                      </div>

                      <Icon
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        className="text-muted-foreground/50"
                      />
                    </button>

                    {/* Expanded: feature toggles */}
                    {isExpanded && (
                      <div className="border-t border-border/40 px-5 py-4 space-y-2 bg-muted/10">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">
                          Funktioner
                        </p>
                        {FEATURE_DEFS.map((feat) => {
                          const enabled = u.features[feat.key] !== false;
                          return (
                            <div
                              key={feat.key}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/20 transition-colors"
                            >
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                  enabled ? "bg-primary/10" : "bg-muted/50"
                                }`}
                              >
                                <Icon
                                  name={feat.icon}
                                  size={14}
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
                              </div>
                              <ToggleSwitch
                                enabled={enabled}
                                onToggle={() =>
                                  toggleUserFeature(u.id, feat.key)
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
          )}
        </section>

        {/* ============================================================ */}
        {/*  STANDARDINSTÄLLNINGAR — global defaults for new users         */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Standardinställningar
              </h2>
              <p className="text-sm text-muted-foreground">
                Grundinställningar som gäller i dev-läge och för nya användare
                innan de synkats
              </p>
            </div>
            {featuresSaving && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Sparar...
              </span>
            )}
          </div>

          {/* Always-on features */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
              Alltid inkluderat
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  label: "Upphandlingar",
                  icon: "clipboard-list",
                  description: "Upphandlingsärenden med LOU-stöd",
                },
                {
                  label: "Bibliotek",
                  icon: "library",
                  description: "Återanvändbara mallar och kravblock",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon
                      name={item.icon}
                      size={16}
                      className="text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex h-5 w-9 items-center rounded-full bg-green-500/20 px-0.5">
                    <div className="h-4 w-4 rounded-full bg-green-500 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toggleable: Verktyg */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
              Verktyg
            </p>
            <div className="space-y-2">
              {toolFeatures.map((feat) => {
                const enabled = features[feat.key] !== false;
                return (
                  <div
                    key={feat.key}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        enabled ? "bg-primary/10" : "bg-muted/50"
                      }`}
                    >
                      <Icon
                        name={feat.icon}
                        size={16}
                        className={
                          enabled ? "text-primary" : "text-muted-foreground/50"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          enabled ? "text-foreground" : "text-muted-foreground"
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
                      onToggle={() => toggleFeature(feat.key)}
                      disabled={!featuresLoaded}
                      label={feat.label}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggleable: Utbildning */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
              Utbildning
            </p>
            <div className="space-y-2">
              {trainingFeatures.map((feat) => {
                const enabled = features[feat.key] !== false;
                return (
                  <div
                    key={feat.key}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        enabled ? "bg-primary/10" : "bg-muted/50"
                      }`}
                    >
                      <Icon
                        name={feat.icon}
                        size={16}
                        className={
                          enabled ? "text-primary" : "text-muted-foreground/50"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          enabled ? "text-foreground" : "text-muted-foreground"
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
                      onToggle={() => toggleFeature(feat.key)}
                      disabled={!featuresLoaded}
                      label={feat.label}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Snabblänkar */}
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

        {/* Användarhantering — snabbguide */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Användarhantering — snabbguide
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

        {/* Systeminformation */}
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
            href="/cases"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="arrow-left" size={14} />
            Tillbaka till upphandlingar
          </Link>
        </div>
      </div>
    </div>
  );
}

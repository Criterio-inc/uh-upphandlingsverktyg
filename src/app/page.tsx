"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AppCard {
  appKey: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

interface DashboardData {
  org: { name: string; slug: string; plan: string; maxUsers: number; memberCount: number } | null;
  stats: { totalCases: number; draftCases: number; activeCases: number; totalProjects: number };
  recentCases: { id: string; name: string; status: string; currentPhase: string; updatedAt: string }[];
  recentActivity: { action: string; entityType: string; entityId: string; createdAt: string }[];
  userRole: string;
  plan: string;
  isPlatformAdmin: boolean;
  hasOrg: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const APP_CARDS: AppCard[] = [
  {
    appKey: "upphandling",
    title: "Upphandling",
    description: "Stöd för offentlig upphandling enligt LOU med ärendehantering, bibliotek och utbildning.",
    icon: "clipboard-list",
    href: "/cases",
    color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  },
  {
    appKey: "verktyg",
    title: "Verktyg",
    description: "Analysverktyg — nyttokalkyl, riskmatris, utvärdering, tidslinjer, intressentanalys och reflektionsstöd.",
    icon: "wrench",
    href: "/tools/benefit-calculator",
    color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  },
  {
    appKey: "mognadmatning",
    title: "Digital Mognadsmätning",
    description: "Mät organisationens digitala mognad med 22 frågor inom 4 dimensioner. AI-stödda insikter.",
    icon: "bar-chart-3",
    href: "/mognadmatning",
    color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  },
  {
    appKey: "ai-mognadmatning",
    title: "AI-Mognadsmätning",
    description: "Bedöm organisationens AI-mognad med 32 frågor inom 8 dimensioner. Inkl. EU AI Act-aspekter.",
    icon: "brain",
    href: "/ai-mognadmatning",
    color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30",
  },
];

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial", starter: "Starter", professional: "Professional", enterprise: "Enterprise",
};
const PLAN_COLORS: Record<string, string> = {
  trial: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  starter: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  professional: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};
const ACTION_LABELS: Record<string, string> = {
  create: "Skapade", update: "Uppdaterade", delete: "Raderade", import: "Importerade",
};
const ENTITY_LABELS: Record<string, string> = {
  case: "upphandling", need: "behov", requirement: "krav", risk: "risk",
  criterion: "kriterium", stakeholder: "intressent", workshop: "workshop",
  evidence: "evidens", bid: "anbud", decision: "beslut", document: "dokument",
  "trace-link": "spårlänk", organization: "organisation", features: "funktioner",
  invitation: "inbjudan", member: "medlem",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  archived: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

/* ------------------------------------------------------------------ */
/*  Onboarding step config                                             */
/* ------------------------------------------------------------------ */

interface OnboardingStep {
  key: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  done: (d: DashboardData) => boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: "org",
    label: "Skapa organisation",
    description: "Konfigurera din organisation med namn och plan",
    icon: "building-2",
    href: "/org",
    done: (d) => d.hasOrg,
  },
  {
    key: "team",
    label: "Bjud in ditt team",
    description: "Lägg till kollegor så ni kan samarbeta",
    icon: "users",
    href: "/org",
    done: (d) => (d.org?.memberCount ?? 0) > 1,
  },
  {
    key: "case",
    label: "Skapa första upphandlingen",
    description: "Starta ett upphandlingsärende eller en mognadsmatning",
    icon: "clipboard-list",
    href: "/cases/new",
    done: (d) => d.stats.totalCases > 0 || d.stats.totalProjects > 0,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PlatformDashboard() {
  const [features, setFeatures] = useState<Record<string, boolean> | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((data) => setFeatures(data.features ?? {}))
      .catch(() => setFeatures(null));

    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data && !data.error) setDashboard(data);
      })
      .catch(() => {});
  }, []);

  const enabledApps = APP_CARDS.filter((app) => {
    if (!features) return true;
    return features[app.appKey] !== false;
  });

  const org = dashboard?.org;
  const stats = dashboard?.stats;
  const isPlatformAdmin = dashboard?.isPlatformAdmin ?? false;

  // Calculate onboarding progress
  const completedSteps = dashboard
    ? ONBOARDING_STEPS.filter((s) => s.done(dashboard)).length
    : 0;
  const allStepsDone = completedSteps === ONBOARDING_STEPS.length;
  const showOnboarding = dashboard && isPlatformAdmin && !allStepsDone;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white">
              C
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {org ? (
                  <>Välkommen <span className="text-primary">{org.name}</span></>
                ) : (
                  <>Critero <span className="font-light text-muted-foreground">Suite</span></>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {org && (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${PLAN_COLORS[org.plan] ?? PLAN_COLORS.trial}`}>
                    {PLAN_LABELS[org.plan] ?? org.plan}
                  </span>
                )}
                <p className="text-sm text-muted-foreground">
                  {org
                    ? `${org.memberCount} medlem${org.memberCount !== 1 ? "mar" : ""}`
                    : "Upphandling \u00b7 Verktyg \u00b7 Mognadsmätning"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl space-y-8">
        {/* ============================================================ */}
        {/*  Onboarding checklist (admin without complete setup)          */}
        {/* ============================================================ */}
        {showOnboarding && (
          <section className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Icon name="rocket" size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-foreground">Kom igång med Critero Suite</h2>
                <p className="text-xs text-muted-foreground">
                  {completedSteps} av {ONBOARDING_STEPS.length} steg klara
                </p>
              </div>
              {/* Progress bar */}
              <div className="hidden sm:flex items-center gap-2 w-32">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(completedSteps / ONBOARDING_STEPS.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {Math.round((completedSteps / ONBOARDING_STEPS.length) * 100)}%
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {ONBOARDING_STEPS.map((step, i) => {
                const isDone = dashboard ? step.done(dashboard) : false;
                const isNext = !isDone && (i === 0 || ONBOARDING_STEPS[i - 1].done(dashboard!));

                return (
                  <Link
                    key={step.key}
                    href={step.href}
                    className={`group relative rounded-xl border p-4 transition-all ${
                      isDone
                        ? "border-green-500/30 bg-green-500/5"
                        : isNext
                          ? "border-primary/40 bg-card shadow-sm hover:border-primary/60 hover:shadow-md"
                          : "border-border/40 bg-card/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isDone
                          ? "bg-green-500/10"
                          : isNext
                            ? "bg-primary/10 group-hover:bg-primary/20"
                            : "bg-muted/50"
                      }`}>
                        {isDone ? (
                          <Icon name="check" size={16} className="text-green-500" />
                        ) : (
                          <Icon name={step.icon} size={16} className={isNext ? "text-primary" : "text-muted-foreground/40"} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-semibold ${isDone ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
                            {step.label}
                          </p>
                          {isNext && (
                            <Icon name="arrow-right" size={12} className="text-primary/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {isDone ? "Klart!" : step.description}
                        </p>
                      </div>
                    </div>
                    {/* Step number badge */}
                    <div className={`absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isDone
                        ? "bg-green-500 text-white"
                        : isNext
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {isDone ? "\u2713" : i + 1}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Stats row */}
        {stats && (stats.totalCases > 0 || stats.totalProjects > 0) && (
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Upphandlingar", value: stats.totalCases, icon: "clipboard-list", href: "/cases" },
              { label: "Utkast", value: stats.draftCases, icon: "file-edit", href: "/cases" },
              { label: "Aktiva", value: stats.activeCases, icon: "activity", href: "/cases" },
              { label: "Mätningsprojekt", value: stats.totalProjects, icon: "bar-chart-3", href: "/mognadmatning/projekt" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={s.icon} size={14} className="text-muted-foreground/50" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">{s.label}</p>
                </div>
                <p className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">{s.value}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Apps section */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-4">
            Applikationer
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {enabledApps.map((app) => (
              <Link
                key={app.appKey}
                href={app.href}
                className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${app.color} transition-colors`}>
                    <Icon name={app.icon} size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {app.title}
                      </h2>
                      <Icon
                        name="arrow-right"
                        size={14}
                        className="text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {features && enabledApps.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center space-y-3">
              <Icon name="lock" size={24} className="text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Inga applikationer är aktiverade. Kontakta din administratör.
              </p>
            </div>
          )}
        </section>

        {/* Recent cases + Activity in two columns */}
        {dashboard && (dashboard.recentCases.length > 0 || dashboard.recentActivity.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent cases */}
            {dashboard.recentCases.length > 0 && (
              <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Senaste upphandlingar
                  </p>
                  <Link href="/cases" className="text-xs text-primary hover:text-primary/80 transition-colors">
                    Visa alla
                  </Link>
                </div>
                <div className="space-y-2">
                  {dashboard.recentCases.map((c) => (
                    <Link
                      key={c.id}
                      href={`/cases/${c.id}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/50 transition-colors group"
                    >
                      <Icon name="folder" size={14} className="text-muted-foreground/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Uppdaterad {new Date(c.updatedAt).toLocaleDateString("sv-SE")}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[c.status] ?? STATUS_COLORS.draft}`}>
                        {c.status === "draft" ? "Utkast" : c.status === "active" ? "Aktiv" : c.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recent activity */}
            {dashboard.recentActivity.length > 0 && (
              <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-4">
                  Senaste aktivitet
                </p>
                <div className="space-y-2">
                  {dashboard.recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon
                          name={a.action === "create" ? "plus" : a.action === "delete" ? "trash-2" : "pencil"}
                          size={12}
                          className="text-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {ACTION_LABELS[a.action] ?? a.action}{" "}
                          <span className="text-muted-foreground">
                            {ENTITY_LABELS[a.entityType] ?? a.entityType}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {timeAgo(a.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Quick-start for empty state (non-admin users or admin with all setup done) */}
        {stats && stats.totalCases === 0 && stats.totalProjects === 0 && !showOnboarding && enabledApps.length > 0 && (
          <section className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
              <Icon name="rocket" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Kom igång!</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Välkommen till Critero Suite. Välj en applikation ovan för att börja, eller skapa din första upphandling.
              </p>
            </div>
            {features?.upphandling !== false && (
              <Link
                href="/cases/new"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Icon name="plus" size={16} />
                Skapa upphandling
              </Link>
            )}
          </section>
        )}

        {/* Footer info */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Aktiva appar</p>
              <p className="text-muted-foreground">{enabledApps.length} av {APP_CARDS.length}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Plattform</p>
              <p className="text-muted-foreground">Critero Suite v2.0</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Support</p>
              <p className="text-muted-foreground">kontakt@criteroconsulting.se</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just nu";
  if (minutes < 60) return `${minutes} min sedan`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} tim sedan`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} dag${days > 1 ? "ar" : ""} sedan`;
  return new Date(isoDate).toLocaleDateString("sv-SE");
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

interface AppCard {
  appKey: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

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
    description: "Analysverktyg — nyttokalkyl, riskmatris, utvärdering, tidslinjer, intressentanalys och kunskapsbank.",
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

export default function PlatformDashboard() {
  const [features, setFeatures] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((data) => setFeatures(data.features ?? {}))
      .catch(() => setFeatures(null));
  }, []);

  const enabledApps = APP_CARDS.filter((app) => {
    if (!features) return true;
    return features[app.appKey] !== false;
  });

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Icon name="scale" size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Critero
              </h1>
              <p className="text-sm text-muted-foreground">
                Din plattform för verksamhetsstöd och mognadsmätning
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-4xl">
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

        {enabledApps.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border/40 bg-card/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">
              Snabbinfo
            </p>
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Aktiva appar</p>
                <p className="text-muted-foreground">{enabledApps.length} av {APP_CARDS.length}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Plattform</p>
                <p className="text-muted-foreground">Critero v2.0</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Support</p>
                <p className="text-muted-foreground">kontakt@criteroconsulting.se</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

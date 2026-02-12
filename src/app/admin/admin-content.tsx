"use client";

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
    description: "Gå till Clerk Dashboard \u2192 Users \u2192 + Create user. Ange e-post och ett tillfälligt lösenord. Skicka lösenordet privat (SMS/Slack). Användaren byter lösenord via sin profil i appen.",
    icon: "user-plus",
  },
  {
    title: "Ta bort användare",
    description: "Clerk Dashboard \u2192 Users \u2192 klicka på användaren \u2192 Delete user. Åtkomsten försvinner direkt.",
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

export default function AdminContent() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  const isAdmin = user?.emailAddresses?.some(
    (e) => e.emailAddress === ADMIN_EMAIL
  );

  if (!isAdmin) {
    redirect("/cases");
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/cases" className="hover:text-foreground transition-colors">Upphandlingar</Link>
            <span>/</span>
            <span className="text-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Icon name="crown" size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Administration</h1>
              <p className="text-sm text-muted-foreground">
                Snabbåtkomst till alla verktyg och tjänster
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-4xl space-y-8">
        {/* Snabblänkar */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Snabblänkar</h2>
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
                    <Icon name={link.icon} size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">{link.label}</p>
                      <Icon name="external-link" size={12} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{link.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Användarhantering */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Användarhantering — snabbguide</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ADMIN_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Icon name={tip.icon} size={14} className="text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Systeminformation */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Systeminformation</h2>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Stack</p>
                <p className="text-muted-foreground">Next.js 16 + React 19</p>
                <p className="text-muted-foreground">Prisma 7 + Turso (SQLite)</p>
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
            Inloggad som <span className="font-medium text-foreground/70">{user?.primaryEmailAddress?.emailAddress}</span>
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

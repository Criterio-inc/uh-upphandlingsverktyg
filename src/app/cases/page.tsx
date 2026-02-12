import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";

const PROFILE_LABELS: Record<string, string> = {
  generisk_lou: "Generisk LOU",
  avfall_nyanskaffning: "Avfall",
  socialtjanst_byte: "Socialtjänst",
};

const PHASE_LABELS: Record<string, string> = {
  A: "Fas A",
  B: "Fas B",
  C: "Fas C",
  D: "Fas D",
  "A. Förbered & utred": "Fas A",
  "B. Upphandla": "Fas B",
  "C. Utvärdera & tilldela": "Fas C",
  "D. Implementera & följ upp": "Fas D",
};

export default async function CasesPage() {
  const cases: any[] = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const activeCount = cases.filter((c) => c.status === "active" || c.status === "in_review").length;
  const draftCount = cases.filter((c) => c.status === "draft").length;
  const lastUpdated = cases.length > 0 ? formatDate(cases[0].updatedAt) : null;

  return (
    <div className="min-h-screen">
      {/* Header section */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Upphandlingar</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {cases.length > 0
                  ? `${cases.length} upphandlingar totalt`
                  : "Kom igång med din första upphandling"}
              </p>
            </div>
            <Link href="/cases/new">
              <Button className="gap-2">
                <Icon name="plus" size={16} />
                Ny upphandling
              </Button>
            </Link>
          </div>

          {/* KPI stats row */}
          {cases.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Totalt"
                value={cases.length}
                icon="clipboard-list"
              />
              <StatCard
                label="Aktiva"
                value={activeCount}
                icon="zap"
                accent
              />
              <StatCard
                label="Utkast"
                value={draftCount}
                icon="pen-line"
              />
              <StatCard
                label="Senast uppdaterad"
                value={lastUpdated ?? "\u2014"}
                icon="refresh-cw"
                isText
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {cases.length === 0 ? (
          <EmptyState
            icon="clipboard-list"
            title="Inga upphandlingar"
            description="Skapa din första upphandling för att komma igång med behovsanalys, kravställning och utvärdering."
            action={
              <Link href="/cases/new">
                <Button className="gap-2">
                  <Icon name="plus" size={16} />
                  Ny upphandling
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cases.map((c) => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  isText,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent?: boolean;
  isText?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${accent ? "bg-primary/10" : "bg-muted"}`}>
          <Icon name={icon} size={15} className={accent ? "text-primary" : "text-muted-foreground"} />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className={`font-semibold ${isText ? "text-sm" : "text-lg"} text-foreground leading-tight`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CaseCard({ caseData: c }: { caseData: any }) {
  const phaseLabel = PHASE_LABELS[c.currentPhase] ?? c.currentPhase;

  return (
    <Link href={`/cases/${c.id}`} className="group block">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
        {/* Top row: profile + status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {PROFILE_LABELS[c.domainProfile] ?? c.domainProfile}
          </span>
          <StatusBadge status={c.status} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {c.name}
        </h3>

        {/* Phase indicator */}
        {phaseLabel && (
          <div className="mt-2 flex items-center gap-1.5">
            <Icon name="flag" size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{phaseLabel}</span>
          </div>
        )}

        {/* Bottom row: meta info */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Icon name="user" size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{c.owner || "Ingen ansvarig"}</span>
          </div>
          <span className="text-[11px] text-muted-foreground/70">
            {formatDate(c.updatedAt)}
          </span>
        </div>

        {/* ID */}
        <div className="mt-1.5">
          <span className="text-[10px] font-mono text-muted-foreground/50">{c.id}</span>
        </div>
      </div>
    </Link>
  );
}

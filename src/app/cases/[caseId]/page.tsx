import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { getPhases } from "@/config/workflow";
import type { DomainProfile } from "@/types/entities";
import { GateChecklist } from "@/components/workflow/gate-checklist";
import { ValidationPanel } from "@/components/workflow/validation-panel";
import { ExportButtons } from "@/components/workflow/export-buttons";
import { ImportRestore } from "@/components/workflow/import-restore";
import { ImportToCaseDialog } from "@/components/library/import-to-case-dialog";
import { GlobalSearch } from "@/components/search/global-search";
import { MaturityDashboard } from "@/components/maturity/maturity-dashboard";

/** Phase-specific guidance for verksamhetsföreträdare */
const PHASE_GUIDE: Record<string, { verksamhetRole: string; nextActions: { label: string; href: string }[]; tip: string }> = {
  A_start_styrning: {
    verksamhetRole: "Formulera övergripande mål, identifiera kollegor som bör involveras och påbörja riskidentifiering.",
    nextActions: [
      { label: "Lägg till intressenter", href: "stakeholders/new" },
      { label: "Identifiera risker", href: "risks/new" },
      { label: "Planera workshop", href: "workshops/new" },
    ],
    tip: "Tänk brett — vilka kollegor påverkas av det nya systemet? Involvera dem tidigt!",
  },
  B_forbered: {
    verksamhetRole: "Delta aktivt i behovsworkshops, granska och validera krav. DIN INSATS ÄR MEST KRITISK HÄR.",
    nextActions: [
      { label: "Dokumentera behov", href: "needs/new" },
      { label: "Skapa krav", href: "requirements/new" },
      { label: "Importera kravblock", href: "" },
      { label: "Definiera kriterier", href: "criteria/new" },
    ],
    tip: "Beskriv behov som verksamhetsproblem — inte tekniska lösningar. Vad behöver ni i vardagen?",
  },
  B0_exit_migrering_forstudie: {
    verksamhetRole: "Beskriv vad ni använder i befintligt system, vilken data som är kritisk och vilka risker ni ser vid byte.",
    nextActions: [
      { label: "Dokumentera evidens", href: "evidence/new" },
      { label: "Lägg till data/exit-risk", href: "risks/new" },
    ],
    tip: "Kartlägg vilken data som INTE får förloras vid systembytet — det styr migreringskraven.",
  },
  C_genomfor: {
    verksamhetRole: "Bedöm kravuppfyllelse i anbud, delta i poängsättning av kvalitetskriterier.",
    nextActions: [
      { label: "Se anbud", href: "bids" },
      { label: "Gå till utvärdering", href: "evaluation" },
      { label: "Skapa beslut", href: "decisions/new" },
    ],
    tip: "Vid poängsättning — motivera varje poäng skriftligt. Det stärker tilldelningsbeslutet vid överprövning.",
  },
  D_kontrakt_forvaltning: {
    verksamhetRole: "Delta i acceptanstest, utbilda kollegor, äga förvaltningsprocessen efter go-live.",
    nextActions: [
      { label: "Skapa dokument", href: "documents/new" },
      { label: "Registrera beslut", href: "decisions/new" },
    ],
    tip: "Planera utbildning tidigt. Superanvändare i verksamheten bör utses redan nu.",
  },
};

export default async function CaseDashboard({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const c = await prisma.case.findUnique({ where: { id: caseId } });
  if (!c) notFound();

  const phases = getPhases(c.domainProfile as DomainProfile);

  // Count entities
  const [
    stakeholderCount,
    workshopCount,
    evidenceCount,
    needCount,
    riskCount,
    requirementCount,
    criterionCount,
    bidCount,
    decisionCount,
    documentCount,
  ] = await Promise.all([
    prisma.stakeholder.count({ where: { caseId } }),
    prisma.workshop.count({ where: { caseId } }),
    prisma.evidence.count({ where: { caseId } }),
    prisma.need.count({ where: { caseId } }),
    prisma.risk.count({ where: { caseId } }),
    prisma.requirement.count({ where: { caseId } }),
    prisma.criterion.count({ where: { caseId } }),
    prisma.bid.count({ where: { caseId } }),
    prisma.decision.count({ where: { caseId } }),
    prisma.document.count({ where: { caseId } }),
  ]);

  const counts = [
    { label: "Intressenter", count: stakeholderCount, icon: "👥" },
    { label: "Workshops", count: workshopCount, icon: "🏛️" },
    { label: "Evidens", count: evidenceCount, icon: "📎" },
    { label: "Behov", count: needCount, icon: "💡" },
    { label: "Risker", count: riskCount, icon: "⚠️" },
    { label: "Krav", count: requirementCount, icon: "📐" },
    { label: "Kriterier", count: criterionCount, icon: "⚖️" },
    { label: "Anbud", count: bidCount, icon: "📨" },
    { label: "Beslut", count: decisionCount, icon: "🔨" },
    { label: "Dokument", count: documentCount, icon: "📄" },
  ];

  const profileLabels: Record<string, string> = {
    generisk_lou: "Generisk LOU",
    avfall_nyanskaffning: "Avfall – nyanskaffning",
    socialtjanst_byte: "Socialtjänst – byte",
  };

  const totalEntities = counts.reduce((s, item) => s + item.count, 0);
  const currentPhaseIndex = phases.findIndex((p) => p.id === c.currentPhase);
  const progressPercent = phases.length > 0 ? Math.round(((currentPhaseIndex + 1) / phases.length) * 100) : 0;

  return (
    <div>
      <Header
        title={c.name}
        description={`${profileLabels[c.domainProfile] ?? c.domainProfile} · ${c.orgName || "Ingen organisation"}`}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name },
        ]}
        actions={<GlobalSearch caseId={caseId} />}
      />
      <div className="p-6 space-y-6">
        {/* Status overview */}
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={c.status} />
          <span className="text-sm text-muted-foreground">
            Aktuell fas: {phases.find((p) => p.id === c.currentPhase)?.label ?? c.currentPhase}
          </span>
          {c.owner && <span className="text-sm text-muted-foreground">Ansvarig: {c.owner}</span>}
          <span className="text-sm text-muted-foreground">{totalEntities} objekt totalt</span>
        </div>

        {/* Phase guide card for verksamhetsföreträdare */}
        {(() => {
          const guide = PHASE_GUIDE[c.currentPhase];
          const currentPhaseLabel = phases.find((p) => p.id === c.currentPhase)?.label ?? c.currentPhase;
          if (!guide) return null;
          return (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardContent>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">👤</span>
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                        Din roll i {currentPhaseLabel}
                      </div>
                      <p className="text-sm text-blue-900 mt-1">{guide.verksamhetRole}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {guide.nextActions.filter(a => a.href).map((action) => (
                        <Link
                          key={action.label}
                          href={`/cases/${caseId}/${action.href}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-xs font-medium transition-colors"
                        >
                          {action.label} →
                        </Link>
                      ))}
                    </div>
                    <div className="flex items-start gap-1.5 bg-blue-100/50 rounded p-2">
                      <span className="text-xs">💡</span>
                      <span className="text-xs text-blue-800">{guide.tip}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3">
          <ExportButtons caseId={caseId} />
          <div className="h-5 w-px bg-border" />
          <ImportRestore caseId={caseId} />
          <div className="h-5 w-px bg-border" />
          <ImportToCaseDialog caseId={caseId} />
        </div>

        {/* Entity count cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {counts.map((item) => (
            <Card key={item.label} className="p-4">
              <CardContent className="flex items-center gap-3 p-0">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-2xl font-bold">{item.count}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Maturity Measurement */}
        <MaturityDashboard caseId={caseId} />

        {/* Phase overview with progress */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Faser</CardTitle>
              <span className="text-sm text-muted-foreground">{progressPercent}% genomförd</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted mb-4">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="space-y-3">
              {phases.map((phase, index) => {
                const isCurrent = phase.id === c.currentPhase;
                const isPast = index < currentPhaseIndex;
                return (
                  <div
                    key={phase.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      isCurrent
                        ? "border-primary bg-primary/5"
                        : isPast
                          ? "border-green-200 bg-green-50/30"
                          : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isPast
                          ? "bg-green-100 text-green-700"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {isPast ? "✓" : index + 1}
                      </span>
                      <span className={`flex-1 text-sm font-medium ${
                        isCurrent ? "text-primary" : isPast ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {phase.label}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-primary/20 text-primary rounded px-2 py-0.5 font-medium">
                          Aktuell
                        </span>
                      )}
                    </div>
                    {/* Phase description */}
                    <p className={`text-xs mt-2 ml-9 ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {phase.description}
                    </p>
                    {/* Sub-phases */}
                    {phase.subPhases && phase.subPhases.length > 0 && (isCurrent || isPast) && (
                      <div className="mt-3 ml-9 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {phase.subPhases.map((sub) => (
                          <div key={sub.id} className="flex items-start gap-1.5 text-xs">
                            <span className={`mt-0.5 ${isPast ? "text-green-500" : "text-muted-foreground"}`}>
                              {isPast ? "✓" : "○"}
                            </span>
                            <div>
                              <span className={isPast ? "text-foreground" : isCurrent ? "text-foreground" : "text-muted-foreground"}>
                                {sub.label}
                              </span>
                              <span className="text-muted-foreground ml-1">– {sub.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gates + Validation */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold mb-3">Gate-kontroll</h2>
            <GateChecklist caseId={caseId} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">Validering</h2>
            <ValidationPanel caseId={caseId} />
          </div>
        </div>
      </div>
    </div>
  );
}

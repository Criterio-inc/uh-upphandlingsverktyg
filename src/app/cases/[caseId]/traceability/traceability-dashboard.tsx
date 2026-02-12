"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Tabs, TabPanel } from "@/components/ui/tabs";

interface CoverageMetric {
  count: number;
  total: number;
}

interface OrphanEntity {
  id: string;
  title: string;
  priority?: string;
  score?: number;
  level?: string;
}

interface Chain {
  needId: string;
  needTitle: string;
  needPriority: string;
  requirementIds: string[];
  criterionIds: string[];
  complete: boolean;
}

interface TraceabilityData {
  coverage: {
    needsWithReqs: CoverageMetric;
    reqsWithCriteria: CoverageMetric;
    criteriaWithScores: CoverageMetric;
    risksWithMitigation: CoverageMetric;
  };
  orphans: {
    needs: OrphanEntity[];
    requirements: OrphanEntity[];
    risks: OrphanEntity[];
  };
  chains: Chain[];
}

export function TraceabilityDashboard({ caseId }: { caseId: string }) {
  const [data, setData] = useState<TraceabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("coverage");

  useEffect(() => {
    fetch(`/api/cases/${caseId}/traceability`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [caseId]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Laddar spårbarhetsdata...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Kunde inte ladda data.</div>;
  }

  function pct(m: CoverageMetric): number {
    return m.total > 0 ? Math.round((m.count / m.total) * 100) : 100;
  }

  const totalOrphans = data.orphans.needs.length + data.orphans.requirements.length + data.orphans.risks.length;

  const tabs = [
    { id: "coverage", label: "Täckningsgrad", icon: "📊" },
    { id: "orphans", label: `Saknar koppling (${totalOrphans})`, icon: "⚠️" },
    { id: "chains", label: "Spårbarhetskedjor", icon: "🔗" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-4 gap-4">
        <CoverageCard
          label="Behov → Krav"
          metric={data.coverage.needsWithReqs}
          color="blue"
        />
        <CoverageCard
          label="Krav → Kriterier"
          metric={data.coverage.reqsWithCriteria}
          color="green"
        />
        <CoverageCard
          label="Kriterier → Poäng"
          metric={data.coverage.criteriaWithScores}
          color="purple"
        />
        <CoverageCard
          label="Risker → Åtgärd"
          metric={data.coverage.risksWithMitigation}
          color="orange"
        />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Coverage tab */}
      <TabPanel active={activeTab === "coverage"}>
        <div className="space-y-4">
          <CoverageBar label="Behov med kopplade krav" metric={data.coverage.needsWithReqs} />
          <CoverageBar label="BÖR-krav med utvärderingskriterium" metric={data.coverage.reqsWithCriteria} />
          <CoverageBar label="Kriterier med poängsättning" metric={data.coverage.criteriaWithScores} />
          <CoverageBar label="Risker med åtgärdsplan" metric={data.coverage.risksWithMitigation} />
        </div>
      </TabPanel>

      {/* Orphans tab */}
      <TabPanel active={activeTab === "orphans"}>
        {totalOrphans === 0 ? (
          <div className="text-center py-12 text-green-600">
            <div className="text-4xl mb-2">✓</div>
            <p className="font-medium">Alla entiteter är kopplade!</p>
            <p className="text-sm text-muted-foreground mt-1">Ingen föräldralös entitet hittades.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.orphans.needs.length > 0 && (
              <Card>
                <CardContent>
                  <h3 className="text-sm font-semibold mb-3 text-red-600">
                    Behov utan kopplade krav ({data.orphans.needs.length})
                  </h3>
                  <div className="space-y-2">
                    {data.orphans.needs.map((n) => (
                      <div key={n.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{n.id}</span>
                          <span className="text-sm">{n.title}</span>
                          {n.priority === "P1" && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">P1</span>
                          )}
                        </div>
                        <Link
                          href={`/cases/${caseId}/requirements/new`}
                          className="text-xs text-primary hover:underline"
                        >
                          + Skapa krav
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.orphans.requirements.length > 0 && (
              <Card>
                <CardContent>
                  <h3 className="text-sm font-semibold mb-3 text-yellow-600">
                    BÖR-krav utan utvärderingskriterium ({data.orphans.requirements.length})
                  </h3>
                  <div className="space-y-2">
                    {data.orphans.requirements.map((r) => (
                      <div key={r.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                          <span className="text-sm">{r.title}</span>
                        </div>
                        <Link
                          href={`/cases/${caseId}/criteria/new`}
                          className="text-xs text-primary hover:underline"
                        >
                          + Skapa kriterium
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.orphans.risks.length > 0 && (
              <Card>
                <CardContent>
                  <h3 className="text-sm font-semibold mb-3 text-orange-600">
                    Höga risker utan kopplade krav ({data.orphans.risks.length})
                  </h3>
                  <div className="space-y-2">
                    {data.orphans.risks.map((r) => (
                      <div key={r.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                          <span className="text-sm">{r.title}</span>
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            Risk: {r.score}
                          </span>
                        </div>
                        <Link
                          href={`/cases/${caseId}/requirements/new`}
                          className="text-xs text-primary hover:underline"
                        >
                          + Skapa krav
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </TabPanel>

      {/* Chains tab */}
      <TabPanel active={activeTab === "chains"}>
        <div className="space-y-3">
          {data.chains.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Inga behov att spåra.
            </div>
          ) : (
            data.chains.map((chain) => (
              <div
                key={chain.needId}
                className={`border rounded-lg p-4 ${
                  chain.complete ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"
                }`}
              >
                <div className="flex items-center gap-2 text-sm">
                  {/* Need node */}
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs font-medium">
                    <span>📋</span>
                    <Link href={`/cases/${caseId}/needs/${chain.needId}`} className="hover:underline">
                      {chain.needId}
                    </Link>
                  </div>

                  {/* Arrow */}
                  <span className="text-muted-foreground">→</span>

                  {/* Requirements */}
                  {chain.requirementIds.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      {chain.requirementIds.map((rId) => (
                        <Link
                          key={rId}
                          href={`/cases/${caseId}/requirements/${rId}`}
                          className="bg-green-100 text-green-800 rounded-md px-2 py-1 text-xs font-medium hover:underline"
                        >
                          {rId}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="text-red-500 text-xs">✗ Inga krav</span>
                  )}

                  {/* Arrow */}
                  <span className="text-muted-foreground">→</span>

                  {/* Criteria */}
                  {chain.criterionIds.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      {chain.criterionIds.map((cId) => (
                        <Link
                          key={cId}
                          href={`/cases/${caseId}/criteria/${cId}`}
                          className="bg-purple-100 text-purple-800 rounded-md px-2 py-1 text-xs font-medium hover:underline"
                        >
                          {cId}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="text-yellow-600 text-xs">~ Inga kriterier</span>
                  )}

                  {/* Status */}
                  <span className="ml-auto">
                    {chain.complete ? (
                      <span className="text-green-600 text-xs font-medium">✓ Komplett</span>
                    ) : (
                      <span className="text-yellow-600 text-xs font-medium">Ofullständig</span>
                    )}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {chain.needTitle}
                </div>
              </div>
            ))
          )}
        </div>
      </TabPanel>
    </div>
  );
}

function CoverageCard({ label, metric, color }: { label: string; metric: CoverageMetric; color: string }) {
  const pctVal = metric.total > 0 ? Math.round((metric.count / metric.total) * 100) : 100;
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };
  return (
    <Card>
      <CardContent className="py-4">
        <div className={`text-2xl font-bold ${colorMap[color] ?? "text-primary"}`}>{pctVal}%</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {metric.count}/{metric.total}
        </div>
      </CardContent>
    </Card>
  );
}

function CoverageBar({ label, metric }: { label: string; metric: CoverageMetric }) {
  const pctVal = metric.total > 0 ? Math.round((metric.count / metric.total) * 100) : 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">
          {metric.count}/{metric.total} ({pctVal}%)
        </span>
      </div>
      <ProgressBar value={pctVal} showPercent={false} />
    </div>
  );
}

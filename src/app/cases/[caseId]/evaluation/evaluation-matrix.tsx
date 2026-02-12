"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabPanel } from "@/components/ui/tabs";

interface BidInfo {
  id: string;
  title: string;
  supplierName: string;
  qualified: boolean;
}

interface CriterionInfo {
  id: string;
  title: string;
  weight: number;
  scale: string;
}

interface RequirementInfo {
  id: string;
  title: string;
  level: string;
}

interface EvaluationMatrixProps {
  caseId: string;
  bids: BidInfo[];
  criteria: CriterionInfo[];
  requirements: RequirementInfo[];
  scores: Record<string, unknown>[];
  bidResponses: Record<string, unknown>[];
}

export function EvaluationMatrix({
  caseId,
  bids,
  criteria,
  requirements,
  scores,
  bidResponses,
}: EvaluationMatrixProps) {
  const [activeTab, setActiveTab] = useState("scores");

  const qualifiedBids = bids.filter((b) => b.qualified);
  const disqualifiedBids = bids.filter((b) => !b.qualified);

  // Build score lookup: bidId -> criterionId -> { rawScore, normalizedScore, justification }
  const scoreMap = useMemo(() => {
    const map = new Map<string, Map<string, { rawScore: number; normalizedScore: number; justification: string }>>();
    for (const s of scores) {
      const bidId = String(s.bidId);
      const critId = String(s.criterionId);
      if (!map.has(bidId)) map.set(bidId, new Map());
      map.get(bidId)!.set(critId, {
        rawScore: Number(s.rawScore) || 0,
        normalizedScore: Number(s.normalizedScore) || 0,
        justification: String(s.justification || ""),
      });
    }
    return map;
  }, [scores]);

  // Build response lookup: bidId -> requirementId -> { meets }
  const responseMap = useMemo(() => {
    const map = new Map<string, Map<string, { meets: string }>>();
    for (const r of bidResponses) {
      const bidId = String(r.bidId);
      const reqId = String(r.requirementId);
      if (!map.has(bidId)) map.set(bidId, new Map());
      map.get(bidId)!.set(reqId, {
        meets: String(r.meets || "no"),
      });
    }
    return map;
  }, [bidResponses]);

  // Compute totals per bid
  const bidTotals = useMemo(() => {
    const totals: { bidId: string; total: number; rank: number }[] = [];
    for (const bid of qualifiedBids) {
      const bidScores = scoreMap.get(bid.id);
      let total = 0;
      if (bidScores) {
        for (const s of bidScores.values()) {
          total += s.normalizedScore;
        }
      }
      totals.push({ bidId: bid.id, total: Math.round(total * 100) / 100, rank: 0 });
    }
    // Sort by total descending and assign ranks
    totals.sort((a, b) => b.total - a.total);
    totals.forEach((t, i) => (t.rank = i + 1));
    return totals;
  }, [qualifiedBids, scoreMap]);

  // SKA qualification check per bid
  const skaRequirements = requirements.filter((r) => r.level === "SKA");

  function getBidSkaStatus(bidId: string) {
    const bidResp = responseMap.get(bidId);
    if (!bidResp) return { passed: 0, failed: skaRequirements.length, total: skaRequirements.length };
    let passed = 0;
    let failed = 0;
    for (const req of skaRequirements) {
      const resp = bidResp.get(req.id);
      if (resp?.meets === "yes") {
        passed++;
      } else {
        failed++;
      }
    }
    return { passed, failed, total: skaRequirements.length };
  }

  const tabs = [
    { id: "scores", label: "Poängmatris", icon: "📊" },
    { id: "qualification", label: "Kravuppfyllelse", icon: "✅" },
    { id: "ranking", label: "Ranking & tilldelning", icon: "🏆" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold">{bids.length}</div>
            <div className="text-xs text-muted-foreground">Anbud</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-green-600">{qualifiedBids.length}</div>
            <div className="text-xs text-muted-foreground">Kvalificerade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold">{criteria.length}</div>
            <div className="text-xs text-muted-foreground">Kriterier</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold">
              {criteria.reduce((s, c) => s + c.weight, 0)}%
            </div>
            <div className="text-xs text-muted-foreground">Total vikt</div>
          </CardContent>
        </Card>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Score matrix */}
      <TabPanel active={activeTab === "scores"}>
        {qualifiedBids.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Inga kvalificerade anbud att utvärdera.</p>
            <p className="text-xs mt-1">Kvalificera anbud först via Anbud-sidan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Kriterium</th>
                  <th className="text-right py-2 px-3 font-medium w-16">Vikt</th>
                  {qualifiedBids.map((bid) => (
                    <th key={bid.id} className="text-center py-2 px-3 font-medium min-w-[120px]">
                      <Link href={`/cases/${caseId}/bids/${bid.id}`} className="hover:underline">
                        {bid.supplierName || bid.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((crit) => {
                  const maxScale = crit.scale === "0-10" ? 10 : 5;
                  return (
                    <tr key={crit.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{crit.id}</span>
                        {crit.title}
                      </td>
                      <td className="text-right py-2 px-3 text-muted-foreground">{crit.weight}%</td>
                      {qualifiedBids.map((bid) => {
                        const s = scoreMap.get(bid.id)?.get(crit.id);
                        const raw = s?.rawScore ?? 0;
                        const norm = s?.normalizedScore ?? 0;
                        return (
                          <td key={bid.id} className="text-center py-2 px-3">
                            <div className="font-mono font-bold">{raw}/{maxScale}</div>
                            <div className="text-xs text-muted-foreground">{norm}p</div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-3 px-3">Totalpoäng</td>
                  <td className="text-right py-3 px-3">
                    {criteria.reduce((s, c) => s + c.weight, 0)}%
                  </td>
                  {qualifiedBids.map((bid) => {
                    const t = bidTotals.find((bt) => bt.bidId === bid.id);
                    return (
                      <td key={bid.id} className="text-center py-3 px-3">
                        <div className="text-lg text-primary">{t?.total ?? 0}</div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </TabPanel>

      {/* Qualification tab */}
      <TabPanel active={activeTab === "qualification"}>
        {bids.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Inga anbud registrerade.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Disqualified bids */}
            {disqualifiedBids.length > 0 && (
              <Card>
                <CardContent>
                  <h3 className="text-sm font-semibold mb-3 text-red-600">
                    Ej kvalificerade ({disqualifiedBids.length})
                  </h3>
                  <div className="space-y-2">
                    {disqualifiedBids.map((bid) => (
                      <div key={bid.id} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{bid.id}</span>
                        <span>{bid.supplierName || bid.title}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SKA requirement matrix */}
            {skaRequirements.length > 0 && qualifiedBids.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium">SKA-krav</th>
                      {qualifiedBids.map((bid) => (
                        <th key={bid.id} className="text-center py-2 px-3 font-medium min-w-[100px]">
                          {bid.supplierName || bid.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {skaRequirements.map((req) => (
                      <tr key={req.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3">
                          <span className="font-mono text-xs text-muted-foreground mr-2">{req.id}</span>
                          {req.title}
                        </td>
                        {qualifiedBids.map((bid) => {
                          const resp = responseMap.get(bid.id)?.get(req.id);
                          const meets = resp?.meets ?? "no";
                          return (
                            <td key={bid.id} className="text-center py-2 px-3">
                              {meets === "yes" && <span className="text-green-600">✓</span>}
                              {meets === "partial" && <span className="text-yellow-600">~</span>}
                              {meets === "no" && <span className="text-red-600">✗</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-medium">
                      <td className="py-2 px-3">SKA uppfyllda</td>
                      {qualifiedBids.map((bid) => {
                        const status = getBidSkaStatus(bid.id);
                        return (
                          <td key={bid.id} className="text-center py-2 px-3">
                            <span className={status.failed > 0 ? "text-red-600" : "text-green-600"}>
                              {status.passed}/{status.total}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </TabPanel>

      {/* Ranking tab */}
      <TabPanel active={activeTab === "ranking"}>
        {qualifiedBids.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Inga kvalificerade anbud att ranka.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ranking cards */}
            {bidTotals.map((bt) => {
              const bid = bids.find((b) => b.id === bt.bidId)!;
              const skaStatus = getBidSkaStatus(bt.bidId);
              const allSkaOk = skaStatus.failed === 0;

              return (
                <Card key={bt.bidId} className={bt.rank === 1 ? "ring-2 ring-primary" : ""}>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      {/* Rank badge */}
                      <div className={`text-3xl font-bold ${bt.rank === 1 ? "text-primary" : "text-muted-foreground"}`}>
                        #{bt.rank}
                      </div>

                      {/* Bid info */}
                      <div className="flex-1">
                        <div className="font-medium text-lg">
                          <Link href={`/cases/${caseId}/bids/${bid.id}`} className="hover:underline">
                            {bid.supplierName || bid.title}
                          </Link>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                          <span className="font-mono text-xs">{bid.id}</span>
                          <span className={allSkaOk ? "text-green-600" : "text-red-600"}>
                            {allSkaOk ? "✓ Alla SKA uppfyllda" : `✗ ${skaStatus.failed} SKA ej uppfyllda`}
                          </span>
                        </div>
                      </div>

                      {/* Total score */}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{bt.total}</div>
                        <div className="text-xs text-muted-foreground">viktat poäng</div>
                      </div>
                    </div>

                    {/* Score breakdown bar */}
                    <div className="mt-4 flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                      {criteria.map((crit) => {
                        const s = scoreMap.get(bt.bidId)?.get(crit.id);
                        const norm = s?.normalizedScore ?? 0;
                        const maxWeighted = crit.weight;
                        const pct = maxWeighted > 0 ? (norm / maxWeighted) * 100 : 0;
                        return (
                          <div
                            key={crit.id}
                            className="bg-primary/70 rounded-sm"
                            style={{ width: `${crit.weight}%`, opacity: pct / 100 * 0.8 + 0.2 }}
                            title={`${crit.title}: ${norm}/${maxWeighted} (${Math.round(pct)}%)`}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Recommendation */}
            {bidTotals.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent>
                  <h3 className="text-sm font-semibold mb-2">Tilldelningsrekommendation</h3>
                  {(() => {
                    const winner = bidTotals[0];
                    const winnerBid = bids.find((b) => b.id === winner.bidId)!;
                    const skaOk = getBidSkaStatus(winner.bidId).failed === 0;
                    const scoredCriteria = criteria.filter((c) => scoreMap.get(winner.bidId)?.has(c.id));

                    return (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <strong className="text-foreground">{winnerBid.supplierName || winnerBid.title}</strong> har
                          högst viktat totalpoäng ({winner.total}) baserat på {scoredCriteria.length} utvärderade kriterier.
                        </p>
                        {!skaOk && (
                          <p className="text-red-600">
                            ⚠️ OBS: Detta anbud uppfyller inte alla SKA-krav. Kontrollera kravuppfyllelsen.
                          </p>
                        )}
                        {bidTotals.length > 1 && (
                          <p>
                            Skillnad till andraplacerad:{" "}
                            <strong>{Math.round((winner.total - bidTotals[1].total) * 100) / 100} poäng</strong>
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </TabPanel>
    </div>
  );
}

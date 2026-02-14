"use client";

import { useReducer, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { exportToJson, exportToXlsx, exportToPdf, type ExportSheet, type PdfSection, type ExportMetadata } from "@/lib/tools-export";
import { FeatureGate } from "@/components/feature-gate";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type CriterionType = "price" | "quality";

interface Criterion {
  id: string;
  name: string;
  type: CriterionType;
  weight: number; // percentage 0-100
  maxPoints: number; // only used for quality criteria (e.g. 1-10)
}

interface BidValue {
  criterionId: string;
  value: number; // price in SEK for price criteria, score for quality
}

interface Bid {
  id: string;
  supplier: string;
  values: BidValue[];
}

interface EvalState {
  criteria: Criterion[];
  bids: Bid[];
  maxDeductionSEK: number; // for prisavdragsmodell
  fixedPriceSEK: number; // for fastprismodell
  sensitivityCriterionId: string | null;
  sensitivityWeight: number;
}

type Action =
  | { type: "ADD_CRITERION" }
  | { type: "UPDATE_CRITERION"; id: string; field: keyof Criterion; value: string | number }
  | { type: "REMOVE_CRITERION"; id: string }
  | { type: "ADD_BID" }
  | { type: "UPDATE_BID_SUPPLIER"; id: string; supplier: string }
  | { type: "UPDATE_BID_VALUE"; bidId: string; criterionId: string; value: number }
  | { type: "REMOVE_BID"; id: string }
  | { type: "SET_MAX_DEDUCTION"; value: number }
  | { type: "SET_FIXED_PRICE"; value: number }
  | { type: "SET_SENSITIVITY_CRITERION"; id: string | null }
  | { type: "SET_SENSITIVITY_WEIGHT"; value: number }
  | { type: "LOAD_STATE"; state: EvalState };

/* ================================================================== */
/*  Ranking result types                                               */
/* ================================================================== */

interface ModelResult {
  bidId: string;
  supplier: string;
  score: number; // for poang and fastpris: higher is better; for prisavdrag: lower is better
  rank: number;
  details: Record<string, number>; // per-criterion contribution
}

interface ModelOutput {
  name: string;
  description: string;
  higherIsBetter: boolean;
  results: ModelResult[];
  unit: string;
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const fmtSEK = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const fmtNum = new Intl.NumberFormat("sv-SE", {
  maximumFractionDigits: 2,
});

const fmtPct = new Intl.NumberFormat("sv-SE", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/* ================================================================== */
/*  Initial state & reducer                                            */
/* ================================================================== */

function createInitialState(): EvalState {
  return {
    criteria: [],
    bids: [],
    maxDeductionSEK: 100000,
    fixedPriceSEK: 1000000,
    sensitivityCriterionId: null,
    sensitivityWeight: 50,
  };
}

function reducer(state: EvalState, action: Action): EvalState {
  switch (action.type) {
    case "ADD_CRITERION": {
      const newCrit: Criterion = {
        id: uid(),
        name: "",
        type: "quality",
        weight: 0,
        maxPoints: 5,
      };
      // Also add a value entry in each existing bid
      const updatedBids = state.bids.map((b) => ({
        ...b,
        values: [...b.values, { criterionId: newCrit.id, value: 0 }],
      }));
      return { ...state, criteria: [...state.criteria, newCrit], bids: updatedBids };
    }

    case "UPDATE_CRITERION":
      return {
        ...state,
        criteria: state.criteria.map((c) =>
          c.id === action.id ? { ...c, [action.field]: action.value } : c
        ),
      };

    case "REMOVE_CRITERION": {
      const updatedBids = state.bids.map((b) => ({
        ...b,
        values: b.values.filter((v) => v.criterionId !== action.id),
      }));
      return {
        ...state,
        criteria: state.criteria.filter((c) => c.id !== action.id),
        bids: updatedBids,
        sensitivityCriterionId:
          state.sensitivityCriterionId === action.id ? null : state.sensitivityCriterionId,
      };
    }

    case "ADD_BID": {
      const newBid: Bid = {
        id: uid(),
        supplier: "",
        values: state.criteria.map((c) => ({ criterionId: c.id, value: 0 })),
      };
      return { ...state, bids: [...state.bids, newBid] };
    }

    case "UPDATE_BID_SUPPLIER":
      return {
        ...state,
        bids: state.bids.map((b) =>
          b.id === action.id ? { ...b, supplier: action.supplier } : b
        ),
      };

    case "UPDATE_BID_VALUE":
      return {
        ...state,
        bids: state.bids.map((b) => {
          if (b.id !== action.bidId) return b;
          const existing = b.values.find((v) => v.criterionId === action.criterionId);
          if (existing) {
            return {
              ...b,
              values: b.values.map((v) =>
                v.criterionId === action.criterionId ? { ...v, value: action.value } : v
              ),
            };
          }
          return {
            ...b,
            values: [...b.values, { criterionId: action.criterionId, value: action.value }],
          };
        }),
      };

    case "REMOVE_BID":
      return { ...state, bids: state.bids.filter((b) => b.id !== action.id) };

    case "SET_MAX_DEDUCTION":
      return { ...state, maxDeductionSEK: action.value };

    case "SET_FIXED_PRICE":
      return { ...state, fixedPriceSEK: action.value };

    case "SET_SENSITIVITY_CRITERION":
      return {
        ...state,
        sensitivityCriterionId: action.id,
        sensitivityWeight: action.id
          ? state.criteria.find((c) => c.id === action.id)?.weight ?? 50
          : 50,
      };

    case "SET_SENSITIVITY_WEIGHT":
      return { ...state, sensitivityWeight: action.value };

    case "LOAD_STATE":
      return action.state;

    default:
      return state;
  }
}

/* ================================================================== */
/*  Calculation engines                                                */
/* ================================================================== */

function getBidValue(bid: Bid, criterionId: string): number {
  return bid.values.find((v) => v.criterionId === criterionId)?.value ?? 0;
}

function computePoangmodell(
  criteria: Criterion[],
  bids: Bid[]
): ModelOutput {
  if (bids.length === 0 || criteria.length === 0) {
    return { name: "Poängmodell", description: "Viktad poäng", higherIsBetter: true, results: [], unit: "poäng" };
  }

  // Find lowest price for each price criterion
  const lowestPrices: Record<string, number> = {};
  for (const c of criteria) {
    if (c.type === "price") {
      const prices = bids.map((b) => getBidValue(b, c.id)).filter((p) => p > 0);
      lowestPrices[c.id] = prices.length > 0 ? Math.min(...prices) : 1;
    }
  }

  const results: ModelResult[] = bids.map((bid) => {
    const details: Record<string, number> = {};
    let total = 0;

    for (const c of criteria) {
      const val = getBidValue(bid, c.id);
      let contribution = 0;

      if (c.type === "price") {
        const lowest = lowestPrices[c.id] ?? 1;
        contribution = val > 0 ? (lowest / val) * c.weight : 0;
      } else {
        contribution = c.maxPoints > 0 ? (val / c.maxPoints) * c.weight : 0;
      }

      details[c.id] = contribution;
      total += contribution;
    }

    return { bidId: bid.id, supplier: bid.supplier || "Namnlös", score: total, rank: 0, details };
  });

  // Sort by score descending (higher is better)
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => (r.rank = i + 1));

  return { name: "Poängmodell", description: "Viktad poäng", higherIsBetter: true, results, unit: "poäng" };
}

function computePrisavdrag(
  criteria: Criterion[],
  bids: Bid[],
  maxDeductionSEK: number
): ModelOutput {
  if (bids.length === 0 || criteria.length === 0) {
    return { name: "Prisavdragsmodell", description: "Prisavdrag för kvalitet", higherIsBetter: false, results: [], unit: "SEK" };
  }

  // Price criterion to get bid price
  const priceCriteria = criteria.filter((c) => c.type === "price");
  const qualityCriteria = criteria.filter((c) => c.type === "quality");

  // Total quality weight for proportional deduction distribution
  const totalQualityWeight = qualityCriteria.reduce((sum, c) => sum + c.weight, 0);

  const results: ModelResult[] = bids.map((bid) => {
    // Sum of all price criteria values as the bid price
    const bidPrice = priceCriteria.reduce((sum, c) => sum + getBidValue(bid, c.id), 0);

    const details: Record<string, number> = {};
    let totalDeduction = 0;

    for (const c of qualityCriteria) {
      const val = getBidValue(bid, c.id);
      const proportionalWeight = totalQualityWeight > 0 ? c.weight / totalQualityWeight : 0;
      const maxDeductForCriterion = maxDeductionSEK * proportionalWeight;
      const deduction = c.maxPoints > 0 ? (val / c.maxPoints) * maxDeductForCriterion : 0;
      details[c.id] = -deduction; // negative because it reduces price
      totalDeduction += deduction;
    }

    // Include price contributions as-is
    for (const c of priceCriteria) {
      details[c.id] = getBidValue(bid, c.id);
    }

    const adjustedPrice = bidPrice - totalDeduction;
    return { bidId: bid.id, supplier: bid.supplier || "Namnlös", score: adjustedPrice, rank: 0, details };
  });

  // Sort by adjusted price ascending (lower is better)
  results.sort((a, b) => a.score - b.score);
  results.forEach((r, i) => (r.rank = i + 1));

  return { name: "Prisavdragsmodell", description: "Prisavdrag för kvalitet", higherIsBetter: false, results, unit: "SEK" };
}

function computeFastpris(
  criteria: Criterion[],
  bids: Bid[]
): ModelOutput {
  if (bids.length === 0 || criteria.length === 0) {
    return { name: "Fastprismodell", description: "Fast pris, bara kvalitet räknas", higherIsBetter: true, results: [], unit: "poäng" };
  }

  const qualityCriteria = criteria.filter((c) => c.type === "quality");

  const results: ModelResult[] = bids.map((bid) => {
    const details: Record<string, number> = {};
    let total = 0;

    for (const c of qualityCriteria) {
      const val = getBidValue(bid, c.id);
      const contribution = c.maxPoints > 0 ? (val / c.maxPoints) * c.weight : 0;
      details[c.id] = contribution;
      total += contribution;
    }

    return { bidId: bid.id, supplier: bid.supplier || "Namnlös", score: total, rank: 0, details };
  });

  // Sort by score descending (higher is better)
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => (r.rank = i + 1));

  return { name: "Fastprismodell", description: "Fast pris, bara kvalitet räknas", higherIsBetter: true, results, unit: "poäng" };
}

/** Compute poängmodell with one criterion's weight overridden */
function computePoangWithOverride(
  criteria: Criterion[],
  bids: Bid[],
  overrideCriterionId: string,
  overrideWeight: number
): ModelOutput {
  // Redistribute other criteria weights proportionally
  const original = criteria.find((c) => c.id === overrideCriterionId);
  if (!original) return computePoangmodell(criteria, bids);

  const otherTotal = criteria
    .filter((c) => c.id !== overrideCriterionId)
    .reduce((sum, c) => sum + c.weight, 0);

  const remainingWeight = 100 - overrideWeight;
  const adjustedCriteria = criteria.map((c) => {
    if (c.id === overrideCriterionId) {
      return { ...c, weight: overrideWeight };
    }
    const proportion = otherTotal > 0 ? c.weight / otherTotal : 0;
    return { ...c, weight: proportion * remainingWeight };
  });

  return computePoangmodell(adjustedCriteria, bids);
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Section header ---- */

function SectionHeader({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
        {step}
      </span>
      <div>
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Icon name={icon} size={18} className="text-primary" />
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/* ---- Medal badge ---- */

function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Icon name="trophy" size={14} />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Icon name="trophy" size={14} />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
        <Icon name="trophy" size={14} />
      </span>
    );
  }
  return <span className="inline-flex h-6 w-6 items-center justify-center text-xs text-muted-foreground">{rank}</span>;
}

/* ---- Weight validation bar ---- */

function WeightBar({ total }: { total: number }) {
  const isValid = Math.abs(total - 100) < 0.01;
  const pct = Math.min(total, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Totalvikt</span>
        <span className={cn("font-medium", isValid ? "text-green-600 dark:text-green-400" : "text-destructive")}>
          {fmtNum.format(total)}% av 100%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isValid ? "bg-green-500" : total > 100 ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!isValid && (
        <p className="text-xs text-destructive">
          {total > 100
            ? `Vikterna överskrider 100% med ${fmtNum.format(total - 100)} procentenheter.`
            : `Vikterna summerar till ${fmtNum.format(total)}%. Fyll på med ${fmtNum.format(100 - total)} procentenheter.`}
        </p>
      )}
    </div>
  );
}

/* ---- Criteria table ---- */

function CriteriaSection({
  criteria,
  dispatch,
}: {
  criteria: Criterion[];
  dispatch: React.Dispatch<Action>;
}) {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="space-y-4">
      <SectionHeader
        step={1}
        title="Definiera kriterier"
        description="Lägg till utvärderingskriterier med typ och viktning. Vikterna måste summera till 100%."
        icon="scale"
      />

      <Card className="p-5">
        {criteria.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-4">
            Inga kriterier tillagda ännu. Klicka &quot;Lägg till kriterium&quot; för att börja.
          </p>
        ) : (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Kriterium</th>
                  <th className="pb-2 pr-2 font-medium w-36">Typ</th>
                  <th className="pb-2 pr-2 font-medium w-24 text-right">Vikt (%)</th>
                  <th className="pb-2 pr-2 font-medium w-28 text-right">Max poäng</th>
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => (
                  <tr key={c.id} className="border-b border-border/30">
                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                        placeholder="T.ex. Pris, Kvalitet, Leveranstid"
                        value={c.name}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_CRITERION", id: c.id, field: "name", value: e.target.value })
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                        value={c.type}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_CRITERION",
                            id: c.id,
                            field: "type",
                            value: e.target.value as CriterionType,
                          })
                        }
                      >
                        <option value="price">Pris (lägre bättre)</option>
                        <option value="quality">Kvalitet (högre bättre)</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40"
                        type="number"
                        min={0}
                        max={100}
                        value={c.weight || ""}
                        placeholder="0"
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_CRITERION",
                            id: c.id,
                            field: "weight",
                            value: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                          })
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      {c.type === "quality" ? (
                        <input
                          className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40"
                          type="number"
                          min={1}
                          max={100}
                          value={c.maxPoints || ""}
                          placeholder="5"
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_CRITERION",
                              id: c.id,
                              field: "maxPoints",
                              value: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                        />
                      ) : (
                        <span className="block px-2 py-1.5 text-right text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="py-2 text-center">
                      <button
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => dispatch({ type: "REMOVE_CRITERION", id: c.id })}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <WeightBar total={totalWeight} />

        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: "ADD_CRITERION" })}>
            <Icon name="plus" size={14} /> Lägg till kriterium
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ---- Bids table ---- */

function BidsSection({
  criteria,
  bids,
  dispatch,
}: {
  criteria: Criterion[];
  bids: Bid[];
  dispatch: React.Dispatch<Action>;
}) {
  if (criteria.length === 0) {
    return (
      <div className="space-y-4">
        <SectionHeader
          step={2}
          title="Ange anbud"
          description="Definiera kriterier först (steg 1) innan du lägger till anbud."
          icon="bar-chart-3"
        />
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Lägg till minst ett kriterium ovan för att börja ange anbud.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        step={2}
        title="Ange anbud"
        description="Lägg till leverantörernas anbud med värden för varje kriterium."
        icon="bar-chart-3"
      />

      <Card className="p-5">
        {bids.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-4">
            Inga anbud tillagda ännu. Klicka &quot;Lägg till anbud&quot; för att börja.
          </p>
        ) : (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium" style={{ minWidth: 140 }}>Leverantör</th>
                  {criteria.map((c) => (
                    <th key={c.id} className="pb-2 pr-2 font-medium text-right" style={{ minWidth: 100 }}>
                      <div>{c.name || "Namnlöst"}</div>
                      <div className="font-normal text-[10px]">
                        {c.type === "price" ? "SEK" : `1–${c.maxPoints} p`}
                      </div>
                    </th>
                  ))}
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr key={bid.id} className="border-b border-border/30">
                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                        placeholder="Leverantörsnamn"
                        value={bid.supplier}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_BID_SUPPLIER", id: bid.id, supplier: e.target.value })
                        }
                      />
                    </td>
                    {criteria.map((c) => {
                      const val = getBidValue(bid, c.id);
                      return (
                        <td key={c.id} className="py-2 pr-2">
                          <input
                            className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40"
                            type="number"
                            min={0}
                            max={c.type === "quality" ? c.maxPoints : undefined}
                            value={val || ""}
                            placeholder="0"
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_BID_VALUE",
                                bidId: bid.id,
                                criterionId: c.id,
                                value: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                      );
                    })}
                    <td className="py-2 text-center">
                      <button
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => dispatch({ type: "REMOVE_BID", id: bid.id })}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={() => dispatch({ type: "ADD_BID" })}>
          <Icon name="plus" size={14} /> Lägg till anbud
        </Button>
      </Card>
    </div>
  );
}

/* ---- Model settings ---- */

function ModelSettings({
  maxDeductionSEK,
  fixedPriceSEK,
  dispatch,
}: {
  maxDeductionSEK: number;
  fixedPriceSEK: number;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Icon name="settings" size={16} className="text-muted-foreground" />
        Modellinställningar
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Max prisavdrag (SEK) — Prisavdragsmodellen"
          type="number"
          min={0}
          value={maxDeductionSEK || ""}
          placeholder="100000"
          onChange={(e) =>
            dispatch({ type: "SET_MAX_DEDUCTION", value: Math.max(0, Number(e.target.value) || 0) })
          }
        />
        <Input
          label="Fast pris (SEK) — Fastprismodellen"
          type="number"
          min={0}
          value={fixedPriceSEK || ""}
          placeholder="1000000"
          onChange={(e) =>
            dispatch({ type: "SET_FIXED_PRICE", value: Math.max(0, Number(e.target.value) || 0) })
          }
        />
      </div>
    </Card>
  );
}

/* ---- Single model result card ---- */

function ModelCard({ output }: { output: ModelOutput }) {
  if (output.results.length === 0) return null;

  const winner = output.results[0];

  return (
    <Card className="p-5 flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-bold">{output.name}</h3>
        <p className="text-xs text-muted-foreground">{output.description}</p>
      </div>

      <div className="flex-1 space-y-2">
        {output.results.map((r) => {
          const isWinner = r.rank === 1;
          return (
            <div
              key={r.bidId}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                isWinner
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/50"
              )}
            >
              <MedalBadge rank={r.rank} />
              <span className={cn("flex-1 font-medium", isWinner && "text-primary")}>
                {r.supplier}
              </span>
              <span className="tabular-nums font-mono text-xs">
                {output.unit === "SEK" ? fmtSEK.format(r.score) : `${fmtNum.format(r.score)} p`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-border/60">
        <div className="flex items-center gap-2 text-xs">
          <Icon name="trophy" size={12} className="text-yellow-600 dark:text-yellow-400" />
          <span className="font-medium">Vinnare: {winner.supplier}</span>
        </div>
      </div>
    </Card>
  );
}

/* ---- Comparison table ---- */

function ComparisonTable({
  models,
  bids,
}: {
  models: ModelOutput[];
  bids: Bid[];
}) {
  if (bids.length === 0) return null;

  // Check if all models agree on winner
  const winners = models.filter((m) => m.results.length > 0).map((m) => m.results[0]?.bidId);
  const allAgree = winners.length > 0 && winners.every((w) => w === winners[0]);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Icon name="bar-chart-3" size={16} className="text-primary" />
        Jämförelsetabell
      </h3>

      {!allAgree && winners.length > 1 && (
        <div className="mb-3 rounded-xl bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 flex items-center gap-2">
          <Icon name="info" size={14} />
          Modellerna ger olika vinnare! Valet av modell påverkar utfallet.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Leverantör</th>
              {models.map((m) => (
                <th key={m.name} className="pb-2 pr-4 font-medium text-center" style={{ minWidth: 130 }}>
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => {
              const supplierName = bid.supplier || "Namnlös";
              return (
                <tr key={bid.id} className="border-b border-border/30">
                  <td className="py-2 pr-4 font-medium">{supplierName}</td>
                  {models.map((m) => {
                    const result = m.results.find((r) => r.bidId === bid.id);
                    if (!result) {
                      return <td key={m.name} className="py-2 pr-4 text-center text-muted-foreground">—</td>;
                    }
                    const isWinner = result.rank === 1;
                    return (
                      <td key={m.name} className="py-2 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <MedalBadge rank={result.rank} />
                          <span className={cn("tabular-nums", isWinner && "font-bold text-primary")}>
                            #{result.rank}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                          {m.unit === "SEK" ? fmtSEK.format(result.score) : `${fmtNum.format(result.score)} p`}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---- Sensitivity analysis ---- */

function SensitivitySection({
  criteria,
  bids,
  sensitivityCriterionId,
  sensitivityWeight,
  dispatch,
}: {
  criteria: Criterion[];
  bids: Bid[];
  sensitivityCriterionId: string | null;
  sensitivityWeight: number;
  dispatch: React.Dispatch<Action>;
}) {
  const criterionOptions = [
    { value: "", label: "Välj kriterium..." },
    ...criteria.map((c) => ({
      value: c.id,
      label: `${c.name || "Namnlöst"} (${c.weight}%)`,
    })),
  ];

  const overrideResult = useMemo(() => {
    if (!sensitivityCriterionId || bids.length === 0 || criteria.length === 0) return null;
    return computePoangWithOverride(criteria, bids, sensitivityCriterionId, sensitivityWeight);
  }, [criteria, bids, sensitivityCriterionId, sensitivityWeight]);

  const originalResult = useMemo(() => {
    if (bids.length === 0 || criteria.length === 0) return null;
    return computePoangmodell(criteria, bids);
  }, [criteria, bids]);

  const selectedCriterion = criteria.find((c) => c.id === sensitivityCriterionId);

  // Compare rankings
  const rankChanged = useMemo(() => {
    if (!originalResult || !overrideResult) return false;
    if (originalResult.results.length === 0 || overrideResult.results.length === 0) return false;
    return originalResult.results[0]?.bidId !== overrideResult.results[0]?.bidId;
  }, [originalResult, overrideResult]);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Icon name="trending-up" size={16} className="text-primary" />
        Känslighetsanalys
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Justera vikten för ett kriterium och se hur rankingen förändras i poängmodellen.
      </p>

      <div className="space-y-4">
        <Select
          label="Kriterium att analysera"
          options={criterionOptions}
          value={sensitivityCriterionId ?? ""}
          onChange={(e) =>
            dispatch({
              type: "SET_SENSITIVITY_CRITERION",
              id: e.target.value || null,
            })
          }
        />

        {sensitivityCriterionId && selectedCriterion && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Originalvikt: {selectedCriterion.weight}%
                </span>
                <span className="font-medium">
                  Testvikt: {sensitivityWeight}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={sensitivityWeight}
                onChange={(e) =>
                  dispatch({ type: "SET_SENSITIVITY_WEIGHT", value: Number(e.target.value) })
                }
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {rankChanged && (
              <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                <Icon name="info" size={14} />
                Viktändringen ändrar vinnaren! Modellen är känslig för detta kriterium.
              </div>
            )}

            {overrideResult && overrideResult.results.length > 0 && (
              <div className="space-y-1.5">
                {overrideResult.results.map((r) => (
                  <div
                    key={r.bidId}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      r.rank === 1 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                    )}
                  >
                    <MedalBadge rank={r.rank} />
                    <span className={cn("flex-1 font-medium", r.rank === 1 && "text-primary")}>
                      {r.supplier}
                    </span>
                    <span className="tabular-nums font-mono text-xs">
                      {fmtNum.format(r.score)} p
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

/* ---- Insight summary box ---- */

function InsightBox({ models }: { models: ModelOutput[] }) {
  const activeModels = models.filter((m) => m.results.length > 0);
  if (activeModels.length === 0) return null;

  const winners = activeModels.map((m) => ({
    model: m.name,
    bidId: m.results[0]?.bidId,
    supplier: m.results[0]?.supplier,
  }));

  const allAgree = winners.every((w) => w.bidId === winners[0]?.bidId);

  // Which model favors which supplier
  const uniqueWinners = Array.from(new Set(winners.map((w) => w.supplier)));

  const modelsByWinner: Record<string, string[]> = {};
  for (const w of winners) {
    if (w.supplier) {
      if (!modelsByWinner[w.supplier]) modelsByWinner[w.supplier] = [];
      modelsByWinner[w.supplier].push(w.model);
    }
  }

  return (
    <Card className="p-5 bg-primary/5 border-primary/20">
      <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
        <Icon name="lightbulb" size={16} className="text-primary" />
        Sammanfattande insikt
      </h3>

      <div className="space-y-2 text-sm">
        {allAgree ? (
          <p className="text-green-700 dark:text-green-400">
            <Icon name="check" size={14} className="inline mr-1" />
            Alla tre modeller är överens: <strong>{winners[0]?.supplier}</strong> vinner oavsett vilken tilldelningsmodell som används.
            Detta ger en robust grund för tilldelningsbeslutet.
          </p>
        ) : (
          <>
            <p className="text-yellow-700 dark:text-yellow-400">
              <Icon name="info" size={14} className="inline mr-1" />
              Modellerna ger <strong>olika vinnare</strong>. Valet av utvärderingsmodell avgör utfallet:
            </p>
            <ul className="ml-5 space-y-1 list-disc text-xs text-foreground">
              {uniqueWinners.map((supplier) => (
                <li key={supplier}>
                  <strong>{supplier}</strong> vinner med:{" "}
                  {modelsByWinner[supplier]?.join(", ")}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="pt-2 border-t border-border/60 mt-2">
          <p className="text-xs text-muted-foreground">
            <strong>Rekommendation:</strong>{" "}
            {allAgree
              ? "Eftersom alla modeller pekar åt samma håll kan ni välja den modell som bäst kommunicerar utvärderingsgrunderna till anbudsgivarna."
              : "Välj utvärderingsmodell baserat på vad som är viktigast i upphandlingen. Om pris ska vara avgörande, använd poängmodellen. Om ni vill säkerställa hög kvalitet, överväg fastprismodellen. Prisavdragsmodellen ger en balans mellan pris och kvalitet."}
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

const STORAGE_KEY = "critero-evaluation-model";

export default function EvaluationModelPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: "LOAD_STATE", state: JSON.parse(stored) });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Auto-save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable
    }
  }, [state]);

  // Compute all three models
  const poangResult = useMemo(
    () => computePoangmodell(state.criteria, state.bids),
    [state.criteria, state.bids]
  );
  const prisavdragResult = useMemo(
    () => computePrisavdrag(state.criteria, state.bids, state.maxDeductionSEK),
    [state.criteria, state.bids, state.maxDeductionSEK]
  );
  const fastprisResult = useMemo(
    () => computeFastpris(state.criteria, state.bids),
    [state.criteria, state.bids]
  );

  const allModels = [poangResult, prisavdragResult, fastprisResult];
  const hasResults = state.criteria.length > 0 && state.bids.length > 0;
  const totalWeight = state.criteria.reduce((sum, c) => sum + c.weight, 0);
  const weightsValid = Math.abs(totalWeight - 100) < 0.01;

  const handleExportJson = useCallback(() => {
    exportToJson(`utvarderingsmodell-${new Date().toISOString().slice(0, 10)}.json`, state);
  }, [state]);

  const handleExportXlsx = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Utvärderingsmodell",
      exportDate: dateStr,
      subtitle: `${state.criteria.length} kriterier, ${state.bids.length} anbud`,
    };

    const criteriaRows: (string | number)[][] = state.criteria.map((c) => [
      c.name, c.type === "price" ? "Pris" : "Kvalitet", c.weight, c.maxPoints,
    ]);

    const bidRows: (string | number)[][] = state.bids.map((bid) => {
      const vals = state.criteria.map((c) => {
        const v = bid.values.find((bv) => bv.criterionId === c.id);
        return v ? v.value : 0;
      });
      return [bid.supplier || "Namnlös", ...vals];
    });

    const poangRows: (string | number)[][] = poangResult.results.map((r) => [
      r.rank, r.supplier, Number(r.score.toFixed(2)),
    ]);
    const prisavdragRows: (string | number)[][] = prisavdragResult.results.map((r) => [
      r.rank, r.supplier, Number(r.score.toFixed(0)),
    ]);
    const fastprisRows: (string | number)[][] = fastprisResult.results.map((r) => [
      r.rank, r.supplier, Number(r.score.toFixed(2)),
    ]);

    const sheets: ExportSheet[] = [
      { name: "Kriterier", headers: ["Namn", "Typ", "Vikt (%)", "Max poäng"], rows: criteriaRows },
      { name: "Anbud", headers: ["Leverantör", ...state.criteria.map((c) => c.name || "Namnlöst")], rows: bidRows },
      { name: "Poängmodell", headers: ["Rank", "Leverantör", "Poäng"], rows: poangRows },
      { name: "Prisavdragsmodell", headers: ["Rank", "Leverantör", "Justerat pris (SEK)"], rows: prisavdragRows },
      { name: "Fastprismodell", headers: ["Rank", "Leverantör", "Poäng"], rows: fastprisRows },
    ];

    await exportToXlsx(`utvarderingsmodell-${dateStr}.xlsx`, sheets, metadata);
  }, [state, poangResult, prisavdragResult, fastprisResult]);

  const handleExportPdf = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Utvärderingsmodell",
      exportDate: dateStr,
      subtitle: `${state.criteria.length} kriterier, ${state.bids.length} anbud`,
    };

    const sections: PdfSection[] = [
      {
        title: "Kriterier",
        type: "table",
        headers: ["Namn", "Typ", "Vikt (%)", "Max poäng"],
        rows: state.criteria.map((c) => [c.name, c.type === "price" ? "Pris" : "Kvalitet", c.weight, c.maxPoints]),
      },
      {
        title: "Poängmodell — Resultat",
        type: "table",
        headers: ["Rank", "Leverantör", "Poäng"],
        rows: poangResult.results.map((r) => [r.rank, r.supplier, Number(r.score.toFixed(2))]),
      },
      {
        title: "Prisavdragsmodell — Resultat",
        type: "table",
        headers: ["Rank", "Leverantör", "Justerat pris (SEK)"],
        rows: prisavdragResult.results.map((r) => [r.rank, r.supplier, Number(r.score.toFixed(0))]),
      },
      {
        title: "Fastprismodell — Resultat",
        type: "table",
        headers: ["Rank", "Leverantör", "Poäng"],
        rows: fastprisResult.results.map((r) => [r.rank, r.supplier, Number(r.score.toFixed(2))]),
      },
    ];

    await exportToPdf(`utvarderingsmodell-${dateStr}.pdf`, sections, metadata);
  }, [state.criteria, state.bids, poangResult, prisavdragResult, fastprisResult]);

  const handleReset = useCallback(() => {
    dispatch({ type: "LOAD_STATE", state: createInitialState() });
  }, []);

  return (
    <FeatureGate featureKey="verktyg.evaluation-model">
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4">
        <nav className="mb-1 text-xs text-muted-foreground flex items-center gap-1">
          <span>Upphandlingar</span>
          <Icon name="arrow-right" size={10} />
          <span>Verktyg</span>
          <Icon name="arrow-right" size={10} />
          <span className="text-foreground font-medium">Utvärderingsmodell</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="scale" size={20} />
          </span>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Utvärderingsmodell</h1>
            <p className="text-xs text-muted-foreground">
              Jämför poängmodell, prisavdragsmodell och fastprismodell sida vid sida
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Icon name="external-link" size={14} /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXlsx}>
              <Icon name="file-spreadsheet" size={14} /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              <Icon name="file-text" size={14} /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Icon name="refresh-cw" size={14} /> Nollställ
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Step 1: Criteria */}
          <CriteriaSection criteria={state.criteria} dispatch={dispatch} />

          {/* Step 2: Bids */}
          <BidsSection criteria={state.criteria} bids={state.bids} dispatch={dispatch} />

          {/* Model settings (only show if we have both criteria and bids) */}
          {hasResults && (
            <div className="space-y-4">
              <SectionHeader
                step={3}
                title="Resultat"
                description={
                  weightsValid
                    ? "Tre utvärderingsmodeller beräknade parallellt."
                    : "Vikterna summerar inte till 100%. Justera vikterna ovan för korrekta resultat."
                }
                icon="calculator"
              />

              <ModelSettings
                maxDeductionSEK={state.maxDeductionSEK}
                fixedPriceSEK={state.fixedPriceSEK}
                dispatch={dispatch}
              />
            </div>
          )}

          {/* Step 3: Results — three model cards */}
          {hasResults && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ModelCard output={poangResult} />
              <ModelCard output={prisavdragResult} />
              <ModelCard output={fastprisResult} />
            </div>
          )}

          {/* Comparison table */}
          {hasResults && <ComparisonTable models={allModels} bids={state.bids} />}

          {/* Insight box */}
          {hasResults && <InsightBox models={allModels} />}

          {/* Sensitivity analysis */}
          {hasResults && (
            <SensitivitySection
              criteria={state.criteria}
              bids={state.bids}
              sensitivityCriterionId={state.sensitivityCriterionId}
              sensitivityWeight={state.sensitivityWeight}
              dispatch={dispatch}
            />
          )}

          {/* Export card at bottom */}
          {hasResults && (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Exportera utvärdering</h3>
                  <p className="text-xs text-muted-foreground">
                    Ladda ner hela utvärderingen med kriterier, anbud och resultat.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportJson}>
                    <Icon name="external-link" size={14} /> JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportXlsx}>
                    <Icon name="file-spreadsheet" size={14} /> Excel
                  </Button>
                  <Button onClick={handleExportPdf}>
                    <Icon name="file-text" size={14} /> PDF
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}

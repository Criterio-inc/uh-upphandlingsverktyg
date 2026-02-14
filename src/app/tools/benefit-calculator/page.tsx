"use client";

import { useReducer, useEffect, useCallback } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  calculate,
  type CalculationResult,
  type YearlyFlows,
} from "@/lib/cvrf/CalculationEngine";
import { exportToJson, exportToXlsx, exportToPdf, type ExportSheet, type PdfSection, type ExportMetadata } from "@/lib/tools-export";
import { FeatureGate } from "@/components/feature-gate";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface SmartGoal {
  id: string;
  title: string;
  metric: string;
  targetDate: string;
}

interface Stakeholder {
  id: string;
  name: string;
  category: string;
  influence: number;
  interest: number;
}

interface BenefitRow {
  id: string;
  title: string;
  amounts: number[]; // one per year
}

interface CostRow {
  id: string;
  title: string;
  amounts: number[]; // one per year
}

interface BenefitOwnership {
  benefitId: string;
  ownerName: string;
  ownerRole: string;
  baseValue: number;
  targetValue: number;
  kpiDescription: string;
  measureFrequency: string;
}

interface Lesson {
  id: string;
  title: string;
  category: string;
  impact: string;
  description: string;
  recommendation: string;
}

interface AnalysisState {
  id: string;
  phase: number;
  // Fas 1
  name: string;
  problemDescription: string;
  strategicLink: string;
  smartGoals: SmartGoal[];
  // Fas 2
  zeroAlternative: string;
  stakeholders: Stakeholder[];
  // Fas 3
  timeHorizon: number;
  discountRate: number;
  benefits: BenefitRow[];
  costs: CostRow[];
  // Fas 4
  benefitOwnerships: BenefitOwnership[];
  // Fas 5
  lessons: Lesson[];
}

type Action =
  | { type: "SET_PHASE"; phase: number }
  | { type: "SET_FIELD"; field: keyof AnalysisState; value: unknown }
  | { type: "SET_TIME_HORIZON"; value: number }
  | { type: "ADD_SMART_GOAL" }
  | { type: "UPDATE_SMART_GOAL"; id: string; field: keyof SmartGoal; value: string }
  | { type: "REMOVE_SMART_GOAL"; id: string }
  | { type: "ADD_STAKEHOLDER" }
  | { type: "UPDATE_STAKEHOLDER"; id: string; field: keyof Stakeholder; value: string | number }
  | { type: "REMOVE_STAKEHOLDER"; id: string }
  | { type: "ADD_BENEFIT" }
  | { type: "UPDATE_BENEFIT_TITLE"; id: string; title: string }
  | { type: "UPDATE_BENEFIT_AMOUNT"; id: string; yearIndex: number; amount: number }
  | { type: "REMOVE_BENEFIT"; id: string }
  | { type: "ADD_COST" }
  | { type: "UPDATE_COST_TITLE"; id: string; title: string }
  | { type: "UPDATE_COST_AMOUNT"; id: string; yearIndex: number; amount: number }
  | { type: "REMOVE_COST"; id: string }
  | { type: "UPDATE_OWNERSHIP"; benefitId: string; field: keyof BenefitOwnership; value: string | number }
  | { type: "ADD_LESSON" }
  | { type: "UPDATE_LESSON"; id: string; field: keyof Lesson; value: string }
  | { type: "REMOVE_LESSON"; id: string }
  | { type: "LOAD_STATE"; state: AnalysisState };

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const fmt = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const fmtNum = new Intl.NumberFormat("sv-SE", {
  maximumFractionDigits: 2,
});

const fmtPct = new Intl.NumberFormat("sv-SE", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function makeEmptyAmounts(n: number): number[] {
  return Array.from({ length: n }, () => 0);
}

function resizeAmounts(amounts: number[], newLen: number): number[] {
  if (amounts.length === newLen) return amounts;
  if (amounts.length < newLen) return [...amounts, ...makeEmptyAmounts(newLen - amounts.length)];
  return amounts.slice(0, newLen);
}

/* ================================================================== */
/*  Initial state & reducer                                            */
/* ================================================================== */

function createInitialState(): AnalysisState {
  return {
    id: uid(),
    phase: 0,
    name: "",
    problemDescription: "",
    strategicLink: "",
    smartGoals: [],
    zeroAlternative: "",
    stakeholders: [],
    timeHorizon: 6,
    discountRate: 3,
    benefits: [],
    costs: [],
    benefitOwnerships: [],
    lessons: [],
  };
}

function reducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };

    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_TIME_HORIZON": {
      const n = action.value;
      return {
        ...state,
        timeHorizon: n,
        benefits: state.benefits.map((b) => ({ ...b, amounts: resizeAmounts(b.amounts, n) })),
        costs: state.costs.map((c) => ({ ...c, amounts: resizeAmounts(c.amounts, n) })),
      };
    }

    // --- Smart goals ---
    case "ADD_SMART_GOAL":
      return {
        ...state,
        smartGoals: [...state.smartGoals, { id: uid(), title: "", metric: "", targetDate: "" }],
      };
    case "UPDATE_SMART_GOAL":
      return {
        ...state,
        smartGoals: state.smartGoals.map((g) =>
          g.id === action.id ? { ...g, [action.field]: action.value } : g
        ),
      };
    case "REMOVE_SMART_GOAL":
      return { ...state, smartGoals: state.smartGoals.filter((g) => g.id !== action.id) };

    // --- Stakeholders ---
    case "ADD_STAKEHOLDER":
      return {
        ...state,
        stakeholders: [
          ...state.stakeholders,
          { id: uid(), name: "", category: "Organisation", influence: 3, interest: 3 },
        ],
      };
    case "UPDATE_STAKEHOLDER":
      return {
        ...state,
        stakeholders: state.stakeholders.map((s) =>
          s.id === action.id ? { ...s, [action.field]: action.value } : s
        ),
      };
    case "REMOVE_STAKEHOLDER":
      return { ...state, stakeholders: state.stakeholders.filter((s) => s.id !== action.id) };

    // --- Benefits ---
    case "ADD_BENEFIT":
      return {
        ...state,
        benefits: [...state.benefits, { id: uid(), title: "", amounts: makeEmptyAmounts(state.timeHorizon) }],
      };
    case "UPDATE_BENEFIT_TITLE":
      return {
        ...state,
        benefits: state.benefits.map((b) => (b.id === action.id ? { ...b, title: action.title } : b)),
      };
    case "UPDATE_BENEFIT_AMOUNT":
      return {
        ...state,
        benefits: state.benefits.map((b) => {
          if (b.id !== action.id) return b;
          const amounts = [...b.amounts];
          amounts[action.yearIndex] = action.amount;
          return { ...b, amounts };
        }),
      };
    case "REMOVE_BENEFIT":
      return { ...state, benefits: state.benefits.filter((b) => b.id !== action.id) };

    // --- Costs ---
    case "ADD_COST":
      return {
        ...state,
        costs: [...state.costs, { id: uid(), title: "", amounts: makeEmptyAmounts(state.timeHorizon) }],
      };
    case "UPDATE_COST_TITLE":
      return {
        ...state,
        costs: state.costs.map((c) => (c.id === action.id ? { ...c, title: action.title } : c)),
      };
    case "UPDATE_COST_AMOUNT":
      return {
        ...state,
        costs: state.costs.map((c) => {
          if (c.id !== action.id) return c;
          const amounts = [...c.amounts];
          amounts[action.yearIndex] = action.amount;
          return { ...c, amounts };
        }),
      };
    case "REMOVE_COST":
      return { ...state, costs: state.costs.filter((c) => c.id !== action.id) };

    // --- Benefit ownership ---
    case "UPDATE_OWNERSHIP": {
      const exists = state.benefitOwnerships.find((o) => o.benefitId === action.benefitId);
      if (exists) {
        return {
          ...state,
          benefitOwnerships: state.benefitOwnerships.map((o) =>
            o.benefitId === action.benefitId ? { ...o, [action.field]: action.value } : o
          ),
        };
      }
      const newOwnership: BenefitOwnership = {
        benefitId: action.benefitId,
        ownerName: "",
        ownerRole: "",
        baseValue: 0,
        targetValue: 0,
        kpiDescription: "",
        measureFrequency: "quarterly",
        [action.field]: action.value,
      };
      return { ...state, benefitOwnerships: [...state.benefitOwnerships, newOwnership] };
    }

    // --- Lessons ---
    case "ADD_LESSON":
      return {
        ...state,
        lessons: [
          ...state.lessons,
          { id: uid(), title: "", category: "Process", impact: "Positiv", description: "", recommendation: "" },
        ],
      };
    case "UPDATE_LESSON":
      return {
        ...state,
        lessons: state.lessons.map((l) =>
          l.id === action.id ? { ...l, [action.field]: action.value } : l
        ),
      };
    case "REMOVE_LESSON":
      return { ...state, lessons: state.lessons.filter((l) => l.id !== action.id) };

    case "LOAD_STATE":
      return action.state;

    default:
      return state;
  }
}

/* ================================================================== */
/*  Phase definitions                                                  */
/* ================================================================== */

const PHASES = [
  { key: "forsta", label: "Förstå", title: "Förstå", icon: "lightbulb" },
  { key: "kartlagga", label: "Kartlägga", title: "Kartlägga", icon: "users" },
  { key: "berakna", label: "Beräkna", title: "Beräkna", icon: "calculator" },
  { key: "realisera", label: "Realisera", title: "Realisera", icon: "target" },
  { key: "lara", label: "Lära", title: "Lära", icon: "book-open" },
] as const;

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Stepper sidebar ---- */

function Stepper({ phase, onSelect }: { phase: number; onSelect: (p: number) => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {PHASES.map((p, i) => {
        const active = i === phase;
        const done = i < phase;
        return (
          <button
            key={p.key}
            onClick={() => onSelect(i)}
            className={[
              "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-150",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : done
                ? "text-foreground hover:bg-accent"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                active
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : done
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {done ? <Icon name="check" size={14} /> : i + 1}
            </span>
            <span className="hidden lg:inline">{p.title}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---- KPI Card ---- */

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${color}`}>
          <Icon name={icon} size={14} />
        </span>
        {label}
      </div>
      <div className="text-lg font-bold tracking-tight">{value}</div>
    </Card>
  );
}

/* ---- Simple CSS bar chart ---- */

function BarChart({
  netPerYear,
  cumulativePerYear,
  timeHorizon,
}: {
  netPerYear: number[];
  cumulativePerYear: number[];
  timeHorizon: number;
}) {
  const allValues = [...netPerYear, ...cumulativePerYear];
  const maxAbs = Math.max(...allValues.map(Math.abs), 1);

  return (
    <Card className="p-5">
      <h4 className="mb-4 text-sm font-semibold">Kassaflödesdiagram</h4>
      <div className="flex items-end gap-2" style={{ height: 200 }}>
        {Array.from({ length: timeHorizon }).map((_, i) => {
          const net = netPerYear[i] ?? 0;
          const cum = cumulativePerYear[i] ?? 0;
          const barH = Math.abs(net) / maxAbs;
          const isPositive = net >= 0;
          const cumH = Math.abs(cum) / maxAbs;
          const cumPositive = cum >= 0;

          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              {/* bar area */}
              <div className="relative flex w-full flex-col items-center" style={{ height: 160 }}>
                {/* net bar */}
                <div
                  className="absolute bottom-[50%] w-5 rounded-sm transition-all"
                  style={{
                    height: `${barH * 45}%`,
                    ...(isPositive
                      ? { bottom: "50%", backgroundColor: "var(--success)" }
                      : { top: "50%", backgroundColor: "var(--destructive)" }),
                  }}
                  title={`Netto år ${i}: ${fmt.format(net)}`}
                />
                {/* cumulative dot */}
                <div
                  className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-card"
                  style={{
                    backgroundColor: cumPositive ? "var(--primary)" : "var(--warning)",
                    ...(cumPositive
                      ? { bottom: `${50 + cumH * 45}%` }
                      : { bottom: `${50 - cumH * 45}%` }),
                  }}
                  title={`Kumulativt år ${i}: ${fmt.format(cum)}`}
                />
                {/* zero line */}
                <div className="absolute bottom-[50%] left-0 right-0 border-t border-border/40" />
              </div>
              <span className="text-[10px] text-muted-foreground">År {i}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "var(--success)" }} />
          Netto (positiv)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "var(--destructive)" }} />
          Netto (negativ)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
          Kumulativt
        </span>
      </div>
    </Card>
  );
}

/* ---- Phase 1: Förstå ---- */

function PhaseForsta({
  state,
  dispatch,
}: {
  state: AnalysisState;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Fas 1 — Förstå</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Definiera problemet, strategisk koppling och målbild.
        </p>
      </div>

      <Card className="space-y-4 p-5">
        <Input
          label="Namn på analys"
          placeholder="T.ex. Digitalisering av socialtjänsten"
          value={state.name}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "name", value: e.target.value })}
        />
        <Textarea
          label="Problembeskrivning"
          placeholder="Beskriv det problem eller den utmaning som ska lösas..."
          value={state.problemDescription}
          onChange={(e) =>
            dispatch({ type: "SET_FIELD", field: "problemDescription", value: e.target.value })
          }
        />
        <Textarea
          label="Strategisk koppling"
          placeholder="Hur kopplar denna insats till organisationens strategiska mål?"
          value={state.strategicLink}
          onChange={(e) =>
            dispatch({ type: "SET_FIELD", field: "strategicLink", value: e.target.value })
          }
        />
      </Card>

      {/* SMART goals */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">SMART-mål</h3>
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: "ADD_SMART_GOAL" })}>
            <Icon name="plus" size={14} /> Lägg till mål
          </Button>
        </div>

        {state.smartGoals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Inga SMART-mål tillagda ännu. Klicka &quot;Lägg till mål&quot; för att börja.
          </p>
        )}

        <div className="space-y-3">
          {state.smartGoals.map((g) => (
            <div key={g.id} className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1">
                <Input
                  label="Måltitel"
                  placeholder="Minska handläggningstid"
                  value={g.title}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_SMART_GOAL", id: g.id, field: "title", value: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Mätetal"
                  placeholder="Dagar per ärende"
                  value={g.metric}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_SMART_GOAL", id: g.id, field: "metric", value: e.target.value })
                  }
                />
              </div>
              <div className="w-40">
                <Input
                  label="Måldatum"
                  type="date"
                  value={g.targetDate}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_SMART_GOAL",
                      id: g.id,
                      field: "targetDate",
                      value: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => dispatch({ type: "REMOVE_SMART_GOAL", id: g.id })}
              >
                <Icon name="x" size={16} />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---- Phase 2: Kartlägga ---- */

function PhaseKartlagga({
  state,
  dispatch,
}: {
  state: AnalysisState;
  dispatch: React.Dispatch<Action>;
}) {
  const categoryOptions = [
    { value: "Brukare", label: "Brukare" },
    { value: "Medarbetare", label: "Medarbetare" },
    { value: "Organisation", label: "Organisation" },
    { value: "Samhälle", label: "Samhälle" },
    { value: "Partner", label: "Partner" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Fas 2 — Kartlägga</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Beskriv nollalternativet och identifiera intressenter.
        </p>
      </div>

      <Card className="p-5">
        <Textarea
          label="Nollalternativ — vad händer om vi inte gör något?"
          placeholder="Beskriv konsekvenserna av att inte genomföra insatsen..."
          rows={4}
          value={state.zeroAlternative}
          onChange={(e) =>
            dispatch({ type: "SET_FIELD", field: "zeroAlternative", value: e.target.value })
          }
        />
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Intressenter</h3>
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: "ADD_STAKEHOLDER" })}>
            <Icon name="plus" size={14} /> Lägg till
          </Button>
        </div>

        {state.stakeholders.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Inga intressenter tillagda ännu.
          </p>
        )}

        <div className="space-y-3">
          {state.stakeholders.map((s) => (
            <div key={s.id} className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1">
                <Input
                  label="Namn"
                  placeholder="T.ex. Slutanvändare"
                  value={s.name}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_STAKEHOLDER", id: s.id, field: "name", value: e.target.value })
                  }
                />
              </div>
              <div className="w-40">
                <Select
                  label="Kategori"
                  options={categoryOptions}
                  value={s.category}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_STAKEHOLDER", id: s.id, field: "category", value: e.target.value })
                  }
                />
              </div>
              <div className="w-24">
                <Input
                  label="Inflytande"
                  type="number"
                  min={1}
                  max={5}
                  value={s.influence}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_STAKEHOLDER",
                      id: s.id,
                      field: "influence",
                      value: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="w-24">
                <Input
                  label="Intresse"
                  type="number"
                  min={1}
                  max={5}
                  value={s.interest}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_STAKEHOLDER",
                      id: s.id,
                      field: "interest",
                      value: Number(e.target.value),
                    })
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => dispatch({ type: "REMOVE_STAKEHOLDER", id: s.id })}
              >
                <Icon name="x" size={16} />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---- Phase 3: Beräkna ---- */

function PhaseBerakna({
  state,
  dispatch,
  calcResult,
}: {
  state: AnalysisState;
  dispatch: React.Dispatch<Action>;
  calcResult: CalculationResult | null;
}) {
  const years = Array.from({ length: state.timeHorizon }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Fas 3 — Beräkna</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Definiera nyttor, kostnader och beräkna nyckeltal.
        </p>
      </div>

      {/* Settings */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Beräkningsparametrar</h3>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-48">
            <Input
              label="Tidshorisont (år)"
              type="number"
              min={1}
              max={30}
              value={state.timeHorizon}
              onChange={(e) =>
                dispatch({ type: "SET_TIME_HORIZON", value: Math.max(1, Math.min(30, Number(e.target.value) || 1)) })
              }
            />
          </div>
          <div className="w-48">
            <Input
              label="Diskonteringsränta (%)"
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={state.discountRate}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "discountRate",
                  value: Math.max(0, Math.min(20, Number(e.target.value) || 0)),
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Benefits table */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Nyttor (SEK)</h3>
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: "ADD_BENEFIT" })}>
            <Icon name="plus" size={14} /> Lägg till nytta
          </Button>
        </div>

        {state.benefits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga nyttor tillagda ännu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Nytta</th>
                  {years.map((y) => (
                    <th key={y} className="pb-2 pr-1 text-right font-medium" style={{ minWidth: 80 }}>
                      År {y}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {state.benefits.map((b) => (
                  <tr key={b.id} className="border-b border-border/30">
                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                        placeholder="Nyttonamn"
                        value={b.title}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_BENEFIT_TITLE", id: b.id, title: e.target.value })
                        }
                      />
                    </td>
                    {years.map((y) => (
                      <td key={y} className="py-2 pr-1">
                        <input
                          className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40"
                          type="number"
                          min={0}
                          value={b.amounts[y] || ""}
                          placeholder="0"
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_BENEFIT_AMOUNT",
                              id: b.id,
                              yearIndex: y,
                              amount: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                    ))}
                    <td className="py-2 text-center">
                      <button
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => dispatch({ type: "REMOVE_BENEFIT", id: b.id })}
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
      </Card>

      {/* Costs table */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Kostnader (SEK)</h3>
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: "ADD_COST" })}>
            <Icon name="plus" size={14} /> Lägg till kostnad
          </Button>
        </div>

        {state.costs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga kostnader tillagda ännu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Kostnad</th>
                  {years.map((y) => (
                    <th key={y} className="pb-2 pr-1 text-right font-medium" style={{ minWidth: 80 }}>
                      År {y}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {state.costs.map((c) => (
                  <tr key={c.id} className="border-b border-border/30">
                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                        placeholder="Kostnadsnamn"
                        value={c.title}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_COST_TITLE", id: c.id, title: e.target.value })
                        }
                      />
                    </td>
                    {years.map((y) => (
                      <td key={y} className="py-2 pr-1">
                        <input
                          className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40"
                          type="number"
                          min={0}
                          value={c.amounts[y] || ""}
                          placeholder="0"
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_COST_AMOUNT",
                              id: c.id,
                              yearIndex: y,
                              amount: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                    ))}
                    <td className="py-2 text-center">
                      <button
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => dispatch({ type: "REMOVE_COST", id: c.id })}
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
      </Card>

      {/* KPI results */}
      {calcResult && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <KpiCard
              label="NPV"
              value={fmt.format(calcResult.npv)}
              icon="trending-up"
              color={calcResult.npv >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
            />
            <KpiCard
              label="BCR"
              value={fmtNum.format(calcResult.bcr)}
              icon="bar-chart-3"
              color={calcResult.bcr >= 1 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
            />
            <KpiCard
              label="IRR"
              value={calcResult.irr !== null ? fmtPct.format(calcResult.irr) : "N/A"}
              icon="activity"
              color="bg-primary/10 text-primary"
            />
            <KpiCard
              label="SROI"
              value={fmtNum.format(calcResult.sroi)}
              icon="coins"
              color={calcResult.sroi > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
            />
            <KpiCard
              label="Återbetalning"
              value={
                calcResult.paybackYears !== null
                  ? `${fmtNum.format(calcResult.paybackYears)} år`
                  : "N/A"
              }
              icon="flag"
              color="bg-primary/10 text-primary"
            />
          </div>

          <BarChart
            netPerYear={calcResult.netPerYear}
            cumulativePerYear={calcResult.cumulativePerYear}
            timeHorizon={state.timeHorizon}
          />
        </>
      )}
    </div>
  );
}

/* ---- Phase 4: Realisera ---- */

function PhaseRealisera({
  state,
  dispatch,
}: {
  state: AnalysisState;
  dispatch: React.Dispatch<Action>;
}) {
  const freqOptions = [
    { value: "monthly", label: "Månadsvis" },
    { value: "quarterly", label: "Kvartalsvis" },
    { value: "biannual", label: "Halvårsvis" },
    { value: "annual", label: "Årlig" },
  ];

  if (state.benefits.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Fas 4 — Realisera</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tilldela nyttoägare och definiera KPI:er för varje nytta.
          </p>
        </div>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Inga nyttor definierade ännu. Gå tillbaka till Fas 3 för att lägga till nyttor.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Fas 4 — Realisera</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tilldela nyttoägare och definiera KPI:er för varje nytta.
        </p>
      </div>

      {state.benefits.map((b) => {
        const own = state.benefitOwnerships.find((o) => o.benefitId === b.id) ?? {
          benefitId: b.id,
          ownerName: "",
          ownerRole: "",
          baseValue: 0,
          targetValue: 0,
          kpiDescription: "",
          measureFrequency: "quarterly",
        };

        return (
          <Card key={b.id} className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Icon name="target" size={16} className="text-primary" />
              {b.title || "Namnlös nytta"}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nyttoägare (namn)"
                placeholder="Anna Johansson"
                value={own.ownerName}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_OWNERSHIP",
                    benefitId: b.id,
                    field: "ownerName",
                    value: e.target.value,
                  })
                }
              />
              <Input
                label="Roll"
                placeholder="Enhetschef"
                value={own.ownerRole}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_OWNERSHIP",
                    benefitId: b.id,
                    field: "ownerRole",
                    value: e.target.value,
                  })
                }
              />
              <Input
                label="Basvärde"
                type="number"
                value={own.baseValue || ""}
                placeholder="0"
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_OWNERSHIP",
                    benefitId: b.id,
                    field: "baseValue",
                    value: Number(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Målvärde"
                type="number"
                value={own.targetValue || ""}
                placeholder="0"
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_OWNERSHIP",
                    benefitId: b.id,
                    field: "targetValue",
                    value: Number(e.target.value) || 0,
                  })
                }
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="KPI-beskrivning"
                  placeholder="Beskriv hur nyttan mäts..."
                  value={own.kpiDescription}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_OWNERSHIP",
                      benefitId: b.id,
                      field: "kpiDescription",
                      value: e.target.value,
                    })
                  }
                />
              </div>
              <Select
                label="Mätfrekvens"
                options={freqOptions}
                value={own.measureFrequency}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_OWNERSHIP",
                    benefitId: b.id,
                    field: "measureFrequency",
                    value: e.target.value,
                  })
                }
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---- Phase 5: Lära ---- */

function PhaseLara({
  state,
  dispatch,
  calcResult,
}: {
  state: AnalysisState;
  dispatch: React.Dispatch<Action>;
  calcResult: CalculationResult | null;
}) {
  const categoryOptions = [
    { value: "Process", label: "Process" },
    { value: "Teknisk", label: "Teknisk" },
    { value: "Organisation", label: "Organisation" },
    { value: "Finansiell", label: "Finansiell" },
  ];
  const impactOptions = [
    { value: "Positiv", label: "Positiv" },
    { value: "Negativ", label: "Negativ" },
  ];

  const metadata: ExportMetadata = {
    toolName: "Nyttokalkyl — CVRF-analys",
    exportDate: new Date().toISOString().slice(0, 10),
    subtitle: state.name || "Namnlös analys",
  };

  function handleExportJson() {
    exportToJson(`nyttokalkyl-${state.name || state.id}.json`, state);
  }

  async function handleExportXlsx() {
    const sheets: ExportSheet[] = [];

    // Sammanfattning
    sheets.push({
      name: "Sammanfattning",
      headers: ["Fält", "Värde"],
      rows: [
        ["Namn", state.name || ""],
        ["Problembeskrivning", state.problemDescription || ""],
        ["Strategisk koppling", state.strategicLink || ""],
        ["Nollalternativ", state.zeroAlternative || ""],
        ["Tidshorisont (år)", state.timeHorizon],
        ["Diskonteringsränta (%)", state.discountRate],
        ...(calcResult ? [
          ["NPV", fmt.format(calcResult.npv)],
          ["BCR", fmtNum.format(calcResult.bcr)],
          ["IRR", calcResult.irr !== null ? fmtPct.format(calcResult.irr) : "N/A"],
          ["SROI", fmtNum.format(calcResult.sroi)],
          ["Återbetalning (år)", calcResult.paybackYears !== null ? fmtNum.format(calcResult.paybackYears) : "N/A"],
        ] as (string | number)[][] : []),
      ],
    });

    // SMART-mål
    if (state.smartGoals.length > 0) {
      sheets.push({
        name: "SMART-mål",
        headers: ["Måltitel", "Mätetal", "Måldatum"],
        rows: state.smartGoals.map((g) => [g.title, g.metric, g.targetDate]),
      });
    }

    // Intressenter
    if (state.stakeholders.length > 0) {
      sheets.push({
        name: "Intressenter",
        headers: ["Namn", "Kategori", "Inflytande", "Intresse"],
        rows: state.stakeholders.map((s) => [s.name, s.category, s.influence, s.interest]),
      });
    }

    // Nyttor
    if (state.benefits.length > 0) {
      const yearHeaders = Array.from({ length: state.timeHorizon }, (_, i) => `År ${i}`);
      sheets.push({
        name: "Nyttor",
        headers: ["Nytta", ...yearHeaders],
        rows: state.benefits.map((b) => [b.title, ...b.amounts]),
      });
    }

    // Kostnader
    if (state.costs.length > 0) {
      const yearHeaders = Array.from({ length: state.timeHorizon }, (_, i) => `År ${i}`);
      sheets.push({
        name: "Kostnader",
        headers: ["Kostnad", ...yearHeaders],
        rows: state.costs.map((c) => [c.title, ...c.amounts]),
      });
    }

    // Nyttoägare
    if (state.benefitOwnerships.length > 0) {
      sheets.push({
        name: "Nyttoägare",
        headers: ["Nytta", "Ägare", "Roll", "Basvärde", "Målvärde", "KPI", "Mätfrekvens"],
        rows: state.benefitOwnerships.map((o) => {
          const b = state.benefits.find((b) => b.id === o.benefitId);
          return [b?.title || "", o.ownerName, o.ownerRole, o.baseValue, o.targetValue, o.kpiDescription, o.measureFrequency];
        }),
      });
    }

    // Lärdomar
    if (state.lessons.length > 0) {
      sheets.push({
        name: "Lärdomar",
        headers: ["Titel", "Kategori", "Påverkan", "Beskrivning", "Rekommendation"],
        rows: state.lessons.map((l) => [l.title, l.category, l.impact, l.description, l.recommendation]),
      });
    }

    await exportToXlsx(`nyttokalkyl-${state.name || state.id}.xlsx`, sheets, metadata);
  }

  async function handleExportPdf() {
    const sections: PdfSection[] = [];

    // Sammanfattning
    sections.push({
      title: "Sammanfattning",
      type: "keyvalue",
      pairs: [
        { label: "Namn", value: state.name || "Ej angiven" },
        { label: "Problembeskrivning", value: state.problemDescription || "Ej angiven" },
        { label: "Strategisk koppling", value: state.strategicLink || "Ej angiven" },
        { label: "Nollalternativ", value: state.zeroAlternative || "Ej angiven" },
        { label: "Tidshorisont", value: `${state.timeHorizon} år` },
        { label: "Diskonteringsränta", value: `${state.discountRate}%` },
      ],
    });

    // Nyckeltal
    if (calcResult) {
      sections.push({
        title: "Nyckeltal",
        type: "keyvalue",
        pairs: [
          { label: "NPV", value: fmt.format(calcResult.npv) },
          { label: "BCR", value: fmtNum.format(calcResult.bcr) },
          { label: "IRR", value: calcResult.irr !== null ? fmtPct.format(calcResult.irr) : "N/A" },
          { label: "SROI", value: fmtNum.format(calcResult.sroi) },
          { label: "Återbetalning", value: calcResult.paybackYears !== null ? `${fmtNum.format(calcResult.paybackYears)} år` : "N/A" },
          { label: "PV Nyttor", value: fmt.format(calcResult.pvBenefits) },
          { label: "PV Kostnader", value: fmt.format(calcResult.pvCosts) },
        ],
      });
    }

    // SMART-mål
    if (state.smartGoals.length > 0) {
      sections.push({
        title: "SMART-mål",
        type: "table",
        headers: ["Måltitel", "Mätetal", "Måldatum"],
        rows: state.smartGoals.map((g) => [g.title, g.metric, g.targetDate]),
      });
    }

    // Nyttor
    if (state.benefits.length > 0) {
      const yearHeaders = Array.from({ length: state.timeHorizon }, (_, i) => `År ${i}`);
      sections.push({
        title: "Nyttor (SEK)",
        type: "table",
        headers: ["Nytta", ...yearHeaders],
        rows: state.benefits.map((b) => [b.title, ...b.amounts]),
      });
    }

    // Kostnader
    if (state.costs.length > 0) {
      const yearHeaders = Array.from({ length: state.timeHorizon }, (_, i) => `År ${i}`);
      sections.push({
        title: "Kostnader (SEK)",
        type: "table",
        headers: ["Kostnad", ...yearHeaders],
        rows: state.costs.map((c) => [c.title, ...c.amounts]),
      });
    }

    // Lärdomar
    if (state.lessons.length > 0) {
      sections.push({
        title: "Lärdomar",
        type: "table",
        headers: ["Titel", "Kategori", "Påverkan", "Beskrivning"],
        rows: state.lessons.map((l) => [l.title, l.category, l.impact, l.description]),
      });
    }

    await exportToPdf(`nyttokalkyl-${state.name || state.id}.pdf`, sections, metadata);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Fas 5 — Lära</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sammanfattning, lärdomar och export.
        </p>
      </div>

      {/* Summary KPIs */}
      {calcResult && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiCard
            label="NPV"
            value={fmt.format(calcResult.npv)}
            icon="trending-up"
            color={calcResult.npv >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
          />
          <KpiCard
            label="BCR"
            value={fmtNum.format(calcResult.bcr)}
            icon="bar-chart-3"
            color={calcResult.bcr >= 1 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
          />
          <KpiCard
            label="IRR"
            value={calcResult.irr !== null ? fmtPct.format(calcResult.irr) : "N/A"}
            icon="activity"
            color="bg-primary/10 text-primary"
          />
          <KpiCard
            label="SROI"
            value={fmtNum.format(calcResult.sroi)}
            icon="coins"
            color={calcResult.sroi > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
          />
          <KpiCard
            label="Återbetalning"
            value={
              calcResult.paybackYears !== null
                ? `${fmtNum.format(calcResult.paybackYears)} år`
                : "N/A"
            }
            icon="flag"
            color="bg-primary/10 text-primary"
          />
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Analys</div>
          <div className="text-sm font-semibold">{state.name || "Ej namngiven"}</div>
        </Card>
        <Card className="p-4">
          <div className="mb-1 text-xs font-medium text-muted-foreground">SMART-mål</div>
          <div className="text-sm font-semibold">{state.smartGoals.length} st</div>
        </Card>
        <Card className="p-4">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Intressenter</div>
          <div className="text-sm font-semibold">{state.stakeholders.length} st</div>
        </Card>
      </div>

      {calcResult && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">PV-sammanfattning</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">PV Nyttor:</span>{" "}
              <span className="font-medium">{fmt.format(calcResult.pvBenefits)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">PV Kostnader:</span>{" "}
              <span className="font-medium">{fmt.format(calcResult.pvCosts)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Lessons */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Lärdomar</h3>
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: "ADD_LESSON" })}>
            <Icon name="plus" size={14} /> Lägg till
          </Button>
        </div>

        {state.lessons.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Inga lärdomar dokumenterade ännu.
          </p>
        )}

        <div className="space-y-4">
          {state.lessons.map((l) => (
            <div key={l.id} className="rounded-xl border border-border/60 p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Input
                  label="Titel"
                  placeholder="Lärdom titel"
                  value={l.title}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_LESSON", id: l.id, field: "title", value: e.target.value })
                  }
                />
                <button
                  className="mt-5 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => dispatch({ type: "REMOVE_LESSON", id: l.id })}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Kategori"
                  options={categoryOptions}
                  value={l.category}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_LESSON", id: l.id, field: "category", value: e.target.value })
                  }
                />
                <Select
                  label="Påverkan"
                  options={impactOptions}
                  value={l.impact}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_LESSON", id: l.id, field: "impact", value: e.target.value })
                  }
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Beskrivning"
                    placeholder="Beskriv lärdomen..."
                    value={l.description}
                    onChange={(e) =>
                      dispatch({ type: "UPDATE_LESSON", id: l.id, field: "description", value: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Textarea
                    label="Rekommendation"
                    placeholder="Vad bör göras annorlunda nästa gång?"
                    value={l.recommendation}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_LESSON",
                        id: l.id,
                        field: "recommendation",
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Export */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Exportera analys</h3>
            <p className="text-xs text-muted-foreground">Ladda ner analysen som JSON, Excel eller PDF.</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Icon name="external-link" size={14} /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXlsx}>
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

const STORAGE_PREFIX = "critero-nyttokalkyl-";

export default function BenefitCalculatorPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Try loading the most recent analysis, or the one matching current id
      const stored = localStorage.getItem(STORAGE_PREFIX + state.id);
      if (stored) {
        dispatch({ type: "LOAD_STATE", state: JSON.parse(stored) });
        return;
      }
      // Check if there's any analysis stored
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          const data = localStorage.getItem(key);
          if (data) {
            dispatch({ type: "LOAD_STATE", state: JSON.parse(data) });
            return;
          }
        }
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + state.id, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable
    }
  }, [state]);

  // Calculate results for Fas 3 & 5
  const calcResult: CalculationResult | null = (() => {
    if (state.benefits.length === 0 && state.costs.length === 0) return null;
    const flows: YearlyFlows[] = Array.from({ length: state.timeHorizon }, (_, i) => {
      const benefits = state.benefits.reduce((sum, b) => sum + (b.amounts[i] ?? 0), 0);
      const costs = state.costs.reduce((sum, c) => sum + (c.amounts[i] ?? 0), 0);
      return { year: i, benefits, costs };
    });
    return calculate({ flows, discountRate: state.discountRate / 100 });
  })();

  const goNext = useCallback(() => {
    dispatch({ type: "SET_PHASE", phase: Math.min(state.phase + 1, PHASES.length - 1) });
  }, [state.phase]);

  const goPrev = useCallback(() => {
    dispatch({ type: "SET_PHASE", phase: Math.max(state.phase - 1, 0) });
  }, [state.phase]);

  const handleNewAnalysis = useCallback(() => {
    const fresh = createInitialState();
    dispatch({ type: "LOAD_STATE", state: fresh });
  }, []);

  return (
    <FeatureGate featureKey="verktyg.benefit-calculator">
    <div className="flex h-full flex-col">
      {/* Top header */}
      <header className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name="calculator" size={20} />
        </span>
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-tight">Nyttokalkyl</h1>
          <p className="text-xs text-muted-foreground">CVRF-baserad nytto- och kostnadsanalys</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewAnalysis}>
          <Icon name="plus" size={14} /> Ny analys
        </Button>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left stepper sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-border/60 p-4 md:block lg:w-64">
          <Stepper phase={state.phase} onSelect={(p) => dispatch({ type: "SET_PHASE", phase: p })} />
        </aside>

        {/* Mobile stepper (horizontal) */}
        <div className="flex gap-1 border-b border-border/60 px-4 py-2 md:hidden">
          {PHASES.map((p, i) => (
            <button
              key={p.key}
              onClick={() => dispatch({ type: "SET_PHASE", phase: i })}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                i === state.phase
                  ? "bg-primary text-primary-foreground"
                  : i < state.phase
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {i < state.phase ? <Icon name="check" size={12} /> : i + 1}
            </button>
          ))}
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {state.phase === 0 && <PhaseForsta state={state} dispatch={dispatch} />}
            {state.phase === 1 && <PhaseKartlagga state={state} dispatch={dispatch} />}
            {state.phase === 2 && (
              <PhaseBerakna state={state} dispatch={dispatch} calcResult={calcResult} />
            )}
            {state.phase === 3 && <PhaseRealisera state={state} dispatch={dispatch} />}
            {state.phase === 4 && (
              <PhaseLara state={state} dispatch={dispatch} calcResult={calcResult} />
            )}

            {/* Bottom navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
              <Button
                variant="outline"
                disabled={state.phase === 0}
                onClick={goPrev}
              >
                <Icon name="arrow-left" size={14} /> Tillbaka
              </Button>
              <span className="text-xs text-muted-foreground">
                Fas {state.phase + 1} av {PHASES.length}
              </span>
              <Button
                disabled={state.phase === PHASES.length - 1}
                onClick={goNext}
              >
                Nästa fas <Icon name="arrow-right" size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}

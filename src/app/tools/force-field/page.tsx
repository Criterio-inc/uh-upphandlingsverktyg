"use client";

import { useReducer, useEffect, useState, useCallback } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { exportToJson, exportToXlsx, exportToPdf, type ExportSheet, type PdfSection, type ExportMetadata } from "@/lib/tools-export";
import { FeatureGate } from "@/components/feature-gate";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type ForceCategory = "Människor" | "Process" | "Teknik" | "Organisation" | "Ekonomi" | "Kultur";
type ForceType = "driving" | "restraining";
type ActionStatus = "Ej påbörjad" | "Pågående" | "Klar";
type Tab = "diagram" | "atgardsplan" | "sammanfattning";

interface Force {
  id: string;
  text: string;
  strength: number; // 1-5
  type: ForceType;
  category: ForceCategory;
  actionable: boolean;
  action: string;
  responsible: string;
  status: ActionStatus;
}

interface ForceFieldAnalysis {
  id: string;
  title: string;
  changeDescription: string;
  currentState: string;
  desiredState: string;
  forces: Force[];
  conclusion: string;
  createdAt: string;
}

interface ForceFieldState {
  analyses: ForceFieldAnalysis[];
  activeAnalysisId: string | null;
  editingForceId: string | null;
  activeTab: Tab;
  showAddForm: boolean;
  addForceType: ForceType;
}

type Action =
  | { type: "NEW_ANALYSIS" }
  | { type: "SELECT_ANALYSIS"; id: string }
  | { type: "DELETE_ANALYSIS"; id: string }
  | { type: "UPDATE_ANALYSIS"; field: keyof ForceFieldAnalysis; value: string }
  | { type: "ADD_FORCE"; forceType: ForceType }
  | { type: "UPDATE_FORCE"; forceId: string; field: keyof Force; value: unknown }
  | { type: "REMOVE_FORCE"; forceId: string }
  | { type: "EDIT_FORCE"; forceId: string | null }
  | { type: "SET_TAB"; tab: Tab }
  | { type: "TOGGLE_ADD_FORM"; forceType?: ForceType }
  | { type: "LOAD_STATE"; state: ForceFieldState }
  | { type: "RESET" };

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const STORAGE_KEY = "critero-force-field-v1";

const CATEGORIES: { value: ForceCategory; label: string }[] = [
  { value: "Människor", label: "Människor" },
  { value: "Process", label: "Process" },
  { value: "Teknik", label: "Teknik" },
  { value: "Organisation", label: "Organisation" },
  { value: "Ekonomi", label: "Ekonomi" },
  { value: "Kultur", label: "Kultur" },
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

const CATEGORY_ICONS: Record<ForceCategory, string> = {
  Människor: "users",
  Process: "repeat",
  Teknik: "wrench",
  Organisation: "git-branch",
  Ekonomi: "coins",
  Kultur: "brain",
};

const CATEGORY_COLORS: Record<ForceCategory, string> = {
  Människor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Process: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Teknik: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Organisation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Ekonomi: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Kultur: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const STATUS_OPTIONS: { value: ActionStatus; label: string }[] = [
  { value: "Ej påbörjad", label: "Ej påbörjad" },
  { value: "Pågående", label: "Pågående" },
  { value: "Klar", label: "Klar" },
];

const STRENGTH_LABELS: Record<number, string> = {
  1: "Mycket svag",
  2: "Svag",
  3: "Måttlig",
  4: "Stark",
  5: "Mycket stark",
};

const TAB_CONFIG: { value: Tab; label: string; icon: string }[] = [
  { value: "diagram", label: "Diagram", icon: "bar-chart-3" },
  { value: "atgardsplan", label: "Åtgärdsplan", icon: "clipboard-list" },
  { value: "sammanfattning", label: "Sammanfattning", icon: "file-text" },
];

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getActiveAnalysis(state: ForceFieldState): ForceFieldAnalysis | null {
  if (!state.activeAnalysisId) return null;
  return state.analyses.find((a) => a.id === state.activeAnalysisId) ?? null;
}

function getDrivingForces(analysis: ForceFieldAnalysis): Force[] {
  return analysis.forces.filter((f) => f.type === "driving").sort((a, b) => b.strength - a.strength);
}

function getRestrainingForces(analysis: ForceFieldAnalysis): Force[] {
  return analysis.forces.filter((f) => f.type === "restraining").sort((a, b) => b.strength - a.strength);
}

function getTotalScore(forces: Force[]): number {
  return forces.reduce((sum, f) => sum + f.strength, 0);
}

function getBalanceLabel(drivingScore: number, restrainingScore: number): { text: string; color: string; icon: string } {
  if (drivingScore > restrainingScore) {
    return { text: "Förändringen har stöd", color: "text-green-700 dark:text-green-400", icon: "check-circle" };
  }
  if (drivingScore === restrainingScore) {
    return { text: "Balans — ingen tydlig riktning", color: "text-yellow-700 dark:text-yellow-400", icon: "alert-triangle" };
  }
  return { text: "Motstånd dominerar", color: "text-red-700 dark:text-red-400", icon: "shield-alert" };
}

function getBalanceBg(drivingScore: number, restrainingScore: number): string {
  if (drivingScore > restrainingScore) {
    return "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800";
  }
  if (drivingScore === restrainingScore) {
    return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800";
  }
  return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
}

/** Returns a green shade whose intensity scales with strength (1-5). */
function getDrivingColor(strength: number): string {
  const shades: Record<number, string> = {
    1: "bg-green-200 dark:bg-green-900/40",
    2: "bg-green-300 dark:bg-green-800/50",
    3: "bg-green-400 dark:bg-green-700/60",
    4: "bg-green-500 dark:bg-green-600/70",
    5: "bg-green-600 dark:bg-green-500/80",
  };
  return shades[strength] ?? shades[3];
}

/** Returns a red shade whose intensity scales with strength (1-5). */
function getRestrainingColor(strength: number): string {
  const shades: Record<number, string> = {
    1: "bg-red-200 dark:bg-red-900/40",
    2: "bg-red-300 dark:bg-red-800/50",
    3: "bg-red-400 dark:bg-red-700/60",
    4: "bg-red-500 dark:bg-red-600/70",
    5: "bg-red-600 dark:bg-red-500/80",
  };
  return shades[strength] ?? shades[3];
}

function getCategoryScoreBreakdown(forces: Force[]): { category: ForceCategory; driving: number; restraining: number }[] {
  const map: Record<ForceCategory, { driving: number; restraining: number }> = {
    Människor: { driving: 0, restraining: 0 },
    Process: { driving: 0, restraining: 0 },
    Teknik: { driving: 0, restraining: 0 },
    Organisation: { driving: 0, restraining: 0 },
    Ekonomi: { driving: 0, restraining: 0 },
    Kultur: { driving: 0, restraining: 0 },
  };

  for (const f of forces) {
    if (f.type === "driving") map[f.category].driving += f.strength;
    else map[f.category].restraining += f.strength;
  }

  return CATEGORIES.map((c) => ({
    category: c.value,
    ...map[c.value],
  })).filter((row) => row.driving > 0 || row.restraining > 0);
}

/* ================================================================== */
/*  Initial state & reducer                                            */
/* ================================================================== */

function createNewAnalysis(): ForceFieldAnalysis {
  return {
    id: uid(),
    title: "",
    changeDescription: "",
    currentState: "",
    desiredState: "",
    forces: [],
    conclusion: "",
    createdAt: new Date().toISOString(),
  };
}

function createInitialState(): ForceFieldState {
  const analysis = createNewAnalysis();
  return {
    analyses: [analysis],
    activeAnalysisId: analysis.id,
    editingForceId: null,
    activeTab: "diagram",
    showAddForm: false,
    addForceType: "driving",
  };
}

function reducer(state: ForceFieldState, action: Action): ForceFieldState {
  switch (action.type) {
    case "NEW_ANALYSIS": {
      const analysis = createNewAnalysis();
      return {
        ...state,
        analyses: [...state.analyses, analysis],
        activeAnalysisId: analysis.id,
        editingForceId: null,
        showAddForm: false,
        activeTab: "diagram",
      };
    }

    case "SELECT_ANALYSIS":
      return {
        ...state,
        activeAnalysisId: action.id,
        editingForceId: null,
        showAddForm: false,
      };

    case "DELETE_ANALYSIS": {
      const remaining = state.analyses.filter((a) => a.id !== action.id);
      if (remaining.length === 0) {
        const fresh = createNewAnalysis();
        return {
          ...state,
          analyses: [fresh],
          activeAnalysisId: fresh.id,
          editingForceId: null,
          showAddForm: false,
        };
      }
      return {
        ...state,
        analyses: remaining,
        activeAnalysisId:
          state.activeAnalysisId === action.id
            ? remaining[remaining.length - 1].id
            : state.activeAnalysisId,
        editingForceId: null,
        showAddForm: false,
      };
    }

    case "UPDATE_ANALYSIS":
      return {
        ...state,
        analyses: state.analyses.map((a) =>
          a.id === state.activeAnalysisId ? { ...a, [action.field]: action.value } : a
        ),
      };

    case "ADD_FORCE": {
      const newForce: Force = {
        id: uid(),
        text: "",
        strength: 3,
        type: action.forceType,
        category: "Människor",
        actionable: true,
        action: "",
        responsible: "",
        status: "Ej påbörjad",
      };
      return {
        ...state,
        analyses: state.analyses.map((a) =>
          a.id === state.activeAnalysisId
            ? { ...a, forces: [...a.forces, newForce] }
            : a
        ),
        editingForceId: newForce.id,
        showAddForm: false,
      };
    }

    case "UPDATE_FORCE":
      return {
        ...state,
        analyses: state.analyses.map((a) =>
          a.id === state.activeAnalysisId
            ? {
                ...a,
                forces: a.forces.map((f) =>
                  f.id === action.forceId ? { ...f, [action.field]: action.value } : f
                ),
              }
            : a
        ),
      };

    case "REMOVE_FORCE":
      return {
        ...state,
        analyses: state.analyses.map((a) =>
          a.id === state.activeAnalysisId
            ? { ...a, forces: a.forces.filter((f) => f.id !== action.forceId) }
            : a
        ),
        editingForceId: state.editingForceId === action.forceId ? null : state.editingForceId,
      };

    case "EDIT_FORCE":
      return { ...state, editingForceId: action.forceId };

    case "SET_TAB":
      return { ...state, activeTab: action.tab };

    case "TOGGLE_ADD_FORM":
      return {
        ...state,
        showAddForm: !state.showAddForm,
        addForceType: action.forceType ?? state.addForceType,
      };

    case "LOAD_STATE":
      return action.state;

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Force Field Diagram ---- */

function ForceFieldDiagram({
  analysis,
  onEditForce,
}: {
  analysis: ForceFieldAnalysis;
  onEditForce: (id: string) => void;
}) {
  const driving = getDrivingForces(analysis);
  const restraining = getRestrainingForces(analysis);
  const maxRows = Math.max(driving.length, restraining.length, 1);
  const drivingTotal = getTotalScore(driving);
  const restrainingTotal = getTotalScore(restraining);
  const balance = getBalanceLabel(drivingTotal, restrainingTotal);

  return (
    <div className="space-y-4">
      {/* State labels */}
      <div className="flex items-stretch gap-0">
        {/* Left: Current state */}
        <div className="flex-1 rounded-l-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 text-center">
          <p className="text-[11px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
            Nuläge
          </p>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300 line-clamp-2">
            {analysis.currentState || "Beskriv nuläget..."}
          </p>
        </div>

        {/* Center divider */}
        <div className="flex w-12 shrink-0 flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
          <Icon name="git-merge" size={18} className="text-slate-500 dark:text-slate-400" />
        </div>

        {/* Right: Desired state */}
        <div className="flex-1 rounded-r-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 text-center">
          <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            Önskat läge
          </p>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 line-clamp-2">
            {analysis.desiredState || "Beskriv önskat läge..."}
          </p>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-0">
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-green-700 dark:text-green-400">
            Drivande krafter
          </p>
          <p className="text-[11px] text-muted-foreground">Trycker mot förändring →</p>
        </div>
        <div className="w-12 shrink-0" />
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-red-700 dark:text-red-400">
            Motståndskrafter
          </p>
          <p className="text-[11px] text-muted-foreground">← Motverkar förändring</p>
        </div>
      </div>

      {/* Force arrows */}
      <div className="relative">
        {/* Central vertical line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-slate-300 dark:bg-slate-600 rounded-full z-10" />

        <div className="space-y-2">
          {Array.from({ length: maxRows }).map((_, i) => {
            const dForce = driving[i] ?? null;
            const rForce = restraining[i] ?? null;
            return (
              <div key={i} className="flex items-center gap-0">
                {/* Driving force (left side) — arrows point right */}
                <div className="flex flex-1 justify-end">
                  {dForce ? (
                    <ForceArrow
                      force={dForce}
                      direction="right"
                      onClick={() => onEditForce(dForce.id)}
                    />
                  ) : (
                    <div className="h-10" />
                  )}
                </div>

                {/* Center spacer */}
                <div className="w-12 shrink-0" />

                {/* Restraining force (right side) — arrows point left */}
                <div className="flex flex-1 justify-start">
                  {rForce ? (
                    <ForceArrow
                      force={rForce}
                      direction="left"
                      onClick={() => onEditForce(rForce.id)}
                    />
                  ) : (
                    <div className="h-10" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score summary */}
      <div className="flex items-center gap-0 mt-2">
        <div className="flex-1 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-bold text-green-700 dark:text-green-400">
            <Icon name="trending-up" size={16} />
            {drivingTotal} poäng
          </span>
        </div>
        <div className="w-12 shrink-0 text-center">
          <span className="text-xs font-bold text-muted-foreground">vs</span>
        </div>
        <div className="flex-1 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-400">
            <Icon name="shield-alert" size={16} />
            {restrainingTotal} poäng
          </span>
        </div>
      </div>

      {/* Balance indicator */}
      <div className={cn(
        "flex items-center justify-center gap-2 rounded-xl border px-4 py-3",
        getBalanceBg(drivingTotal, restrainingTotal),
      )}>
        <Icon name={balance.icon} size={18} className={balance.color} />
        <span className={cn("text-sm font-bold", balance.color)}>
          {balance.text}
        </span>
        {drivingTotal !== restrainingTotal && (
          <span className={cn("text-sm", balance.color)}>
            (skillnad: {Math.abs(drivingTotal - restrainingTotal)} poäng)
          </span>
        )}
      </div>
    </div>
  );
}

/* ---- Single Force Arrow ---- */

function ForceArrow({
  force,
  direction,
  onClick,
}: {
  force: Force;
  direction: "left" | "right";
  onClick: () => void;
}) {
  // Width is proportional to strength (20% per strength level)
  const widthPercent = force.strength * 20;
  const isRight = direction === "right";
  const colorFn = isRight ? getDrivingColor : getRestrainingColor;
  const barColor = colorFn(force.strength);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]",
        isRight ? "flex-row" : "flex-row-reverse",
      )}
      style={{ width: `${widthPercent}%`, minWidth: "120px" }}
      title={`${force.text} (styrka: ${force.strength}/5) — ${force.category}`}
    >
      {/* Force label + category badge */}
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2.5 py-1.5",
          isRight ? "justify-end text-right" : "justify-start text-left",
        )}
      >
        <span className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded",
          CATEGORY_COLORS[force.category],
        )}>
          <Icon name={CATEGORY_ICONS[force.category]} size={11} />
        </span>
        <span className="truncate text-xs font-medium text-foreground">
          {force.text || "Namnlös kraft"}
        </span>
      </div>

      {/* Arrow bar + arrowhead */}
      <div className={cn(
        "flex shrink-0 items-center",
        isRight ? "flex-row" : "flex-row-reverse",
      )}>
        {/* Bar */}
        <div
          className={cn(
            "h-7 rounded-sm transition-colors",
            barColor,
            "group-hover:brightness-110",
          )}
          style={{ width: `${force.strength * 12 + 16}px` }}
        />
        {/* Arrowhead (CSS triangle) */}
        <div
          className={cn(
            "h-0 w-0 shrink-0",
            isRight
              ? "border-l-[10px] border-y-[8px] border-y-transparent"
              : "border-r-[10px] border-y-[8px] border-y-transparent",
          )}
          style={{
            borderLeftColor: isRight ? (force.strength >= 4 ? "#16a34a" : force.strength >= 2 ? "#4ade80" : "#86efac") : "transparent",
            borderRightColor: !isRight ? (force.strength >= 4 ? "#dc2626" : force.strength >= 2 ? "#f87171" : "#fca5a5") : "transparent",
          }}
        />
      </div>

      {/* Strength badge */}
      <span className={cn(
        "absolute -top-2 shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
        isRight
          ? "right-0 bg-green-600 dark:bg-green-500"
          : "left-0 bg-red-600 dark:bg-red-500",
      )}>
        {force.strength}
      </span>
    </button>
  );
}

/* ---- Force Edit Form ---- */

function ForceEditForm({
  force,
  dispatch,
  onClose,
}: {
  force: Force;
  dispatch: React.Dispatch<Action>;
  onClose: () => void;
}) {
  const isNew = !force.text;
  const isDriving = force.type === "driving";

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon
            name="pen-line"
            size={16}
            className={isDriving ? "text-green-600" : "text-red-600"}
          />
          {isNew ? "Ny" : "Redigera"}{" "}
          {isDriving ? "drivande kraft" : "motståndskraft"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          label="Beskrivning"
          placeholder={
            isDriving
              ? "T.ex. Stark ledningsförankring"
              : "T.ex. Brist på resurser"
          }
          value={force.text}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FORCE", forceId: force.id, field: "text", value: e.target.value })
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Kategori"
            options={CATEGORY_OPTIONS}
            value={force.category}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FORCE", forceId: force.id, field: "category", value: e.target.value })
            }
          />
          <div>
            <Select
              label="Styrka"
              options={[1, 2, 3, 4, 5].map((v) => ({
                value: String(v),
                label: `${v} — ${STRENGTH_LABELS[v]}`,
              }))}
              value={String(force.strength)}
              onChange={(e) =>
                dispatch({ type: "UPDATE_FORCE", forceId: force.id, field: "strength", value: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Strength preview */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Styrka:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <div
                key={v}
                className={cn(
                  "h-3 w-6 rounded-sm transition-colors cursor-pointer",
                  v <= force.strength
                    ? isDriving
                      ? getDrivingColor(v)
                      : getRestrainingColor(v)
                    : "bg-muted",
                )}
                onClick={() =>
                  dispatch({ type: "UPDATE_FORCE", forceId: force.id, field: "strength", value: v })
                }
              />
            ))}
          </div>
          <span className="text-xs font-medium tabular-nums">
            {force.strength}/5
          </span>
        </div>

        {/* Actionable toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={force.actionable}
              onChange={(e) =>
                dispatch({ type: "UPDATE_FORCE", forceId: force.id, field: "actionable", value: e.target.checked })
              }
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-sm font-medium">Åtgärdbar</span>
          </label>
        </div>

        {force.actionable && (
          <>
            <Textarea
              label={isDriving ? "Hur förstärka denna kraft?" : "Hur hantera/minska detta motstånd?"}
              placeholder="Beskriv planerad åtgärd..."
              value={force.action}
              onChange={(e) =>
                dispatch({ type: "UPDATE_FORCE", forceId: force.id, field: "action", value: e.target.value })
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Ansvarig"
                placeholder="Namn"
                value={force.responsible}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_FORCE", forceId: force.id, field: "responsible", value: e.target.value })
                }
              />
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={force.status}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_FORCE", forceId: force.id, field: "status", value: e.target.value })
                }
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "REMOVE_FORCE", forceId: force.id })}
            className="text-destructive hover:bg-destructive/10"
          >
            <Icon name="trash-2" size={14} /> Ta bort
          </Button>
          <Button size="sm" onClick={onClose}>
            <Icon name="check" size={14} /> Klar
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ---- Action Plan Table ---- */

function ActionPlanTab({
  analysis,
  dispatch,
}: {
  analysis: ForceFieldAnalysis;
  dispatch: React.Dispatch<Action>;
}) {
  const actionableForces = analysis.forces.filter((f) => f.actionable);
  const drivingActions = actionableForces.filter((f) => f.type === "driving");
  const restrainingActions = actionableForces.filter((f) => f.type === "restraining");

  if (actionableForces.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon name="clipboard-list" size={28} />
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight">Ingen åtgärdsplan ännu</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Markera krafter som &quot;Åtgärdbar&quot; i diagramvyn och fyll i åtgärder
          för att bygga din åtgärdsplan.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Driving forces actions */}
      {drivingActions.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Icon name="trending-up" size={14} className="text-green-700 dark:text-green-400" />
            </span>
            Förstärka drivande krafter
            <span className="text-xs font-normal text-muted-foreground">({drivingActions.length})</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Kraft</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Kategori</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Styrka</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Åtgärd</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ansvarig</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {drivingActions.map((f) => (
                  <tr key={f.id} className="border-b border-border/30 hover:bg-accent/50">
                    <td className="px-3 py-2.5 font-medium">{f.text || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", CATEGORY_COLORS[f.category])}>
                        <Icon name={CATEGORY_ICONS[f.category]} size={10} />
                        {f.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {f.strength}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 max-w-xs">
                      <Textarea
                        value={f.action}
                        placeholder="Hur förstärka..."
                        className="min-h-[40px] text-xs"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_FORCE", forceId: f.id, field: "action", value: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Input
                        value={f.responsible}
                        placeholder="Namn"
                        className="text-xs"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_FORCE", forceId: f.id, field: "responsible", value: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Select
                        options={STATUS_OPTIONS}
                        value={f.status}
                        className="text-xs"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_FORCE", forceId: f.id, field: "status", value: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Restraining forces actions */}
      {restrainingActions.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <Icon name="shield-alert" size={14} className="text-red-700 dark:text-red-400" />
            </span>
            Hantera motståndskrafter
            <span className="text-xs font-normal text-muted-foreground">({restrainingActions.length})</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Kraft</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Kategori</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Styrka</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Åtgärd</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ansvarig</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {restrainingActions.map((f) => (
                  <tr key={f.id} className="border-b border-border/30 hover:bg-accent/50">
                    <td className="px-3 py-2.5 font-medium">{f.text || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", CATEGORY_COLORS[f.category])}>
                        <Icon name={CATEGORY_ICONS[f.category]} size={10} />
                        {f.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {f.strength}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 max-w-xs">
                      <Textarea
                        value={f.action}
                        placeholder="Hur minska motståndet..."
                        className="min-h-[40px] text-xs"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_FORCE", forceId: f.id, field: "action", value: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Input
                        value={f.responsible}
                        placeholder="Namn"
                        className="text-xs"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_FORCE", forceId: f.id, field: "responsible", value: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Select
                        options={STATUS_OPTIONS}
                        value={f.status}
                        className="text-xs"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_FORCE", forceId: f.id, field: "status", value: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---- Summary Tab ---- */

function SummaryTab({
  analysis,
  dispatch,
}: {
  analysis: ForceFieldAnalysis;
  dispatch: React.Dispatch<Action>;
}) {
  const driving = getDrivingForces(analysis);
  const restraining = getRestrainingForces(analysis);
  const drivingTotal = getTotalScore(driving);
  const restrainingTotal = getTotalScore(restraining);
  const balance = getBalanceLabel(drivingTotal, restrainingTotal);
  const breakdown = getCategoryScoreBreakdown(analysis.forces);
  const maxCatScore = Math.max(
    ...breakdown.map((b) => Math.max(b.driving, b.restraining)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Key findings */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Icon name="lightbulb" size={16} className="text-primary" />
          Nyckelresultat
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 p-4 text-center">
            <p className="text-3xl font-bold tabular-nums text-green-600 dark:text-green-400">
              {driving.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Drivande krafter</p>
            <p className="text-sm font-bold text-green-700 dark:text-green-400 mt-0.5">
              {drivingTotal} poäng totalt
            </p>
          </div>
          <div className="rounded-xl border border-border/60 p-4 text-center">
            <p className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {restraining.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Motståndskrafter</p>
            <p className="text-sm font-bold text-red-700 dark:text-red-400 mt-0.5">
              {restrainingTotal} poäng totalt
            </p>
          </div>
          <div className={cn(
            "rounded-xl border p-4 text-center",
            getBalanceBg(drivingTotal, restrainingTotal),
          )}>
            <div className="flex justify-center mb-1">
              <Icon name={balance.icon} size={28} className={balance.color} />
            </div>
            <p className={cn("text-sm font-bold", balance.color)}>
              {balance.text}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Differens: {Math.abs(drivingTotal - restrainingTotal)} poäng
            </p>
          </div>
        </div>
      </Card>

      {/* Category breakdown */}
      {breakdown.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Icon name="bar-chart-3" size={16} className="text-primary" />
            Poängfördelning per kategori
          </h3>

          <div className="space-y-3">
            {breakdown.map((row) => (
              <div key={row.category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded", CATEGORY_COLORS[row.category])}>
                      <Icon name={CATEGORY_ICONS[row.category]} size={11} />
                    </span>
                    {row.category}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    +{row.driving} / −{row.restraining}
                  </span>
                </div>
                {/* Dual bar */}
                <div className="flex items-center gap-1 h-4">
                  {/* Driving bar (right-aligned, grows left-to-right) */}
                  <div className="flex flex-1 justify-end">
                    <div
                      className="h-full rounded-l-sm bg-green-400 dark:bg-green-500/70 transition-all"
                      style={{ width: `${(row.driving / maxCatScore) * 100}%`, minWidth: row.driving > 0 ? "4px" : "0px" }}
                    />
                  </div>
                  <div className="w-px h-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                  {/* Restraining bar (left-aligned, grows left-to-right) */}
                  <div className="flex flex-1 justify-start">
                    <div
                      className="h-full rounded-r-sm bg-red-400 dark:bg-red-500/70 transition-all"
                      style={{ width: `${(row.restraining / maxCatScore) * 100}%`, minWidth: row.restraining > 0 ? "4px" : "0px" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 border-t border-border/60 pt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              Drivande
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              Motstånd
            </span>
          </div>
        </Card>
      )}

      {/* Strongest forces */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Top driving */}
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Icon name="trending-up" size={16} className="text-green-600" />
            Starkaste drivkrafterna
          </h3>
          {driving.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga drivande krafter ännu.</p>
          ) : (
            <div className="space-y-2">
              {driving.slice(0, 5).map((f, i) => (
                <div key={f.id} className="flex items-center gap-2 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{f.text || "Namnlös"}</span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-green-600 dark:text-green-400">
                    {f.strength}/5
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top restraining */}
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Icon name="shield-alert" size={16} className="text-red-600" />
            Starkaste motståndskrafterna
          </h3>
          {restraining.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga motståndskrafter ännu.</p>
          ) : (
            <div className="space-y-2">
              {restraining.slice(0, 5).map((f, i) => (
                <div key={f.id} className="flex items-center gap-2 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{f.text || "Namnlös"}</span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-red-600 dark:text-red-400">
                    {f.strength}/5
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Icon name="lightbulb" size={16} className="text-primary" />
          Rekommendationer
        </h3>
        <div className="space-y-2 text-sm">
          {drivingTotal > restrainingTotal && (
            <>
              <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3">
                <Icon name="check-circle" size={16} className="mt-0.5 shrink-0 text-green-600" />
                <p className="text-green-800 dark:text-green-300">
                  Analysen visar att förändringen har mer stöd än motstånd. Fokusera på att upprätthålla
                  de drivande krafterna och aktivt arbeta med att minska de identifierade motstånden.
                </p>
              </div>
              {restraining.filter((f) => f.strength >= 4).length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
                  <Icon name="alert-triangle" size={16} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-amber-800 dark:text-amber-300">
                    Obs: Det finns {restraining.filter((f) => f.strength >= 4).length} starka
                    motståndskrafter (styrka 4-5) som kräver särskild uppmärksamhet trots den
                    positiva balansen.
                  </p>
                </div>
              )}
            </>
          )}
          {drivingTotal === restrainingTotal && (
            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-3">
              <Icon name="alert-triangle" size={16} className="mt-0.5 shrink-0 text-yellow-600" />
              <p className="text-yellow-800 dark:text-yellow-300">
                Krafterna är i balans. Förändringen kan gå åt båda hållen. Identifiera och
                förstärk nyckelkrafter som kan tippa balansen till förmån för förändringen.
              </p>
            </div>
          )}
          {drivingTotal < restrainingTotal && (
            <>
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3">
                <Icon name="shield-alert" size={16} className="mt-0.5 shrink-0 text-red-600" />
                <p className="text-red-800 dark:text-red-300">
                  Motståndet överväger de drivande krafterna. Det rekommenderas att aktivt arbeta
                  med att reducera motståndskrafterna innan förändringen genomförs.
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3">
                <Icon name="info" size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <p className="text-blue-800 dark:text-blue-300">
                  Lewins forskning visar att det ofta är mer effektivt att minska motståndskrafter
                  än att öka drivande krafter. Fokusera på dialog, utbildning och att adressera
                  grundorsakerna till motståndet.
                </p>
              </div>
            </>
          )}
          {analysis.forces.filter((f) => f.actionable && !f.action).length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-950/20 p-3">
              <Icon name="clipboard-list" size={16} className="mt-0.5 shrink-0 text-slate-600" />
              <p className="text-slate-800 dark:text-slate-300">
                Det finns {analysis.forces.filter((f) => f.actionable && !f.action).length} åtgärdbara
                krafter utan definierade åtgärder. Komplettera åtgärdsplanen under fliken
                &quot;Åtgärdsplan&quot;.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Conclusion */}
      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Icon name="pen-line" size={16} className="text-primary" />
          Slutsats
        </h3>
        <Textarea
          placeholder="Skriv din slutsats och övergripande bedömning av analysen..."
          value={analysis.conclusion}
          onChange={(e) =>
            dispatch({ type: "UPDATE_ANALYSIS", field: "conclusion", value: e.target.value })
          }
          className="min-h-[120px]"
        />
      </Card>
    </div>
  );
}

/* ---- Force List Sidebar ---- */

function ForceListSidebar({
  analysis,
  editingForceId,
  dispatch,
}: {
  analysis: ForceFieldAnalysis;
  editingForceId: string | null;
  dispatch: React.Dispatch<Action>;
}) {
  const driving = getDrivingForces(analysis);
  const restraining = getRestrainingForces(analysis);

  return (
    <div className="space-y-4">
      {/* Driving forces list */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-green-100 dark:bg-green-900/30">
              <Icon name="trending-up" size={12} className="text-green-700 dark:text-green-400" />
            </span>
            Drivande krafter
            <span className="text-xs font-normal text-muted-foreground">({driving.length})</span>
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "ADD_FORCE", forceType: "driving" })}
          >
            <Icon name="plus" size={14} /> Lägg till
          </Button>
        </div>

        {driving.length === 0 ? (
          <p className="text-xs text-muted-foreground">Inga drivande krafter ännu.</p>
        ) : (
          <div className="space-y-1.5">
            {driving.map((f) => (
              <div
                key={f.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-all",
                  editingForceId === f.id
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20 dark:border-green-700"
                    : "border-border/60 hover:bg-accent/50",
                )}
                onClick={() => dispatch({ type: "EDIT_FORCE", forceId: f.id })}
              >
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded", CATEGORY_COLORS[f.category])}>
                  <Icon name={CATEGORY_ICONS[f.category]} size={11} />
                </span>
                <span className="flex-1 truncate text-xs font-medium">{f.text || "Namnlös"}</span>
                <div className="flex shrink-0 gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <div
                      key={v}
                      className={cn(
                        "h-1.5 w-2 rounded-sm",
                        v <= f.strength ? "bg-green-500" : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "REMOVE_FORCE", forceId: f.id });
                  }}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Restraining forces list */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-red-100 dark:bg-red-900/30">
              <Icon name="shield-alert" size={12} className="text-red-700 dark:text-red-400" />
            </span>
            Motståndskrafter
            <span className="text-xs font-normal text-muted-foreground">({restraining.length})</span>
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "ADD_FORCE", forceType: "restraining" })}
          >
            <Icon name="plus" size={14} /> Lägg till
          </Button>
        </div>

        {restraining.length === 0 ? (
          <p className="text-xs text-muted-foreground">Inga motståndskrafter ännu.</p>
        ) : (
          <div className="space-y-1.5">
            {restraining.map((f) => (
              <div
                key={f.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-all",
                  editingForceId === f.id
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-700"
                    : "border-border/60 hover:bg-accent/50",
                )}
                onClick={() => dispatch({ type: "EDIT_FORCE", forceId: f.id })}
              >
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded", CATEGORY_COLORS[f.category])}>
                  <Icon name={CATEGORY_ICONS[f.category]} size={11} />
                </span>
                <span className="flex-1 truncate text-xs font-medium">{f.text || "Namnlös"}</span>
                <div className="flex shrink-0 gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <div
                      key={v}
                      className={cn(
                        "h-1.5 w-2 rounded-sm",
                        v <= f.strength ? "bg-red-500" : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "REMOVE_FORCE", forceId: f.id });
                  }}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

export default function ForceFieldPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.analyses)) {
          dispatch({ type: "LOAD_STATE", state: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Auto-save on every state change (skip initial render before load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable
    }
  }, [state, loaded]);

  const analysis = getActiveAnalysis(state);

  /* ---- Export handlers ---- */

  const handleExportJson = useCallback(() => {
    if (!analysis) return;
    exportToJson(
      `kraftfaltsanalys-${analysis.title || "analys"}-${new Date().toISOString().slice(0, 10)}.json`,
      analysis,
    );
  }, [analysis]);

  const handleExportXlsx = useCallback(async () => {
    if (!analysis) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const driving = getDrivingForces(analysis);
    const restraining = getRestrainingForces(analysis);

    const metadata: ExportMetadata = {
      toolName: "Kraftfältsanalys",
      exportDate: dateStr,
      subtitle: analysis.title || "Utan titel",
    };

    const overviewPairs: (string | number)[][] = [
      ["Titel", analysis.title || "—"],
      ["Förändringsbeskrivning", analysis.changeDescription || "—"],
      ["Nuläge", analysis.currentState || "—"],
      ["Önskat läge", analysis.desiredState || "—"],
      ["Drivande poäng", getTotalScore(driving)],
      ["Motståndspoäng", getTotalScore(restraining)],
      ["Slutsats", analysis.conclusion || "—"],
    ];

    const forceRows: (string | number)[][] = analysis.forces.map((f) => [
      f.type === "driving" ? "Drivande" : "Motstånd",
      f.text,
      f.category,
      f.strength,
      f.actionable ? "Ja" : "Nej",
      f.action || "—",
      f.responsible || "—",
      f.status,
    ]);

    const sheets: ExportSheet[] = [
      {
        name: "Översikt",
        headers: ["Egenskap", "Värde"],
        rows: overviewPairs,
      },
      {
        name: "Krafter",
        headers: ["Typ", "Beskrivning", "Kategori", "Styrka", "Åtgärdbar", "Åtgärd", "Ansvarig", "Status"],
        rows: forceRows,
      },
    ];

    await exportToXlsx(`kraftfaltsanalys-${dateStr}.xlsx`, sheets, metadata);
  }, [analysis]);

  const handleExportPdf = useCallback(async () => {
    if (!analysis) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const driving = getDrivingForces(analysis);
    const restraining = getRestrainingForces(analysis);

    const metadata: ExportMetadata = {
      toolName: "Kraftfältsanalys",
      exportDate: dateStr,
      subtitle: analysis.title || "Utan titel",
    };

    const sections: PdfSection[] = [
      {
        title: "Analysinformation",
        type: "keyvalue",
        pairs: [
          { label: "Titel", value: analysis.title || "—" },
          { label: "Förändring", value: analysis.changeDescription || "—" },
          { label: "Nuläge", value: analysis.currentState || "—" },
          { label: "Önskat läge", value: analysis.desiredState || "—" },
          { label: "Drivande poäng", value: String(getTotalScore(driving)) },
          { label: "Motståndspoäng", value: String(getTotalScore(restraining)) },
        ],
      },
      {
        title: "Drivande krafter",
        type: "table",
        headers: ["Beskrivning", "Kategori", "Styrka", "Åtgärd", "Ansvarig"],
        rows: driving.map((f) => [f.text, f.category, f.strength, f.action || "—", f.responsible || "—"]),
      },
      {
        title: "Motståndskrafter",
        type: "table",
        headers: ["Beskrivning", "Kategori", "Styrka", "Åtgärd", "Ansvarig"],
        rows: restraining.map((f) => [f.text, f.category, f.strength, f.action || "—", f.responsible || "—"]),
      },
    ];

    if (analysis.conclusion) {
      sections.push({
        title: "Slutsats",
        type: "keyvalue",
        pairs: [{ label: "Slutsats", value: analysis.conclusion }],
      });
    }

    await exportToPdf(`kraftfaltsanalys-${dateStr}.pdf`, sections, metadata);
  }, [analysis]);

  const handleNewAnalysis = useCallback(() => {
    dispatch({ type: "NEW_ANALYSIS" });
  }, []);

  const editingForce = analysis && state.editingForceId
    ? analysis.forces.find((f) => f.id === state.editingForceId) ?? null
    : null;

  const hasForces = analysis ? analysis.forces.length > 0 : false;

  return (
    <FeatureGate featureKey="verktyg.force-field">
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Upphandlingar</span>
          <span>/</span>
          <span>Verktyg</span>
          <span>/</span>
          <span className="text-foreground font-medium">Kraftfältsanalys</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="git-merge" size={20} />
          </span>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Kraftfältsanalys</h1>
            <p className="text-xs text-muted-foreground">
              Analysera drivkrafter och motståndsformande krafter för förändring (Lewins modell)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJson} disabled={!hasForces}>
              <Icon name="external-link" size={14} /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXlsx} disabled={!hasForces}>
              <Icon name="file-text" size={14} /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={!hasForces}>
              <Icon name="file-text" size={14} /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleNewAnalysis}>
              <Icon name="refresh-cw" size={14} /> Ny analys
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Analysis selector + project info */}
          {state.analyses.length > 1 && (
            <div className="flex items-center gap-3">
              <Select
                label="Aktiv analys"
                options={state.analyses.map((a) => ({
                  value: a.id,
                  label: a.title || `Analys (${new Date(a.createdAt).toLocaleDateString("sv-SE")})`,
                }))}
                value={state.activeAnalysisId ?? ""}
                onChange={(e) => dispatch({ type: "SELECT_ANALYSIS", id: e.target.value })}
              />
              {state.analyses.length > 1 && analysis && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5 text-destructive hover:bg-destructive/10"
                  onClick={() => dispatch({ type: "DELETE_ANALYSIS", id: analysis.id })}
                >
                  <Icon name="trash-2" size={14} /> Ta bort
                </Button>
              )}
            </div>
          )}

          {analysis && (
            <>
              {/* Project info form */}
              <Card className="p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Icon name="pen-line" size={16} className="text-primary" />
                  Analysinformation
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Titel"
                    placeholder="T.ex. Införande av nytt e-upphandlingssystem"
                    value={analysis.title}
                    onChange={(e) =>
                      dispatch({ type: "UPDATE_ANALYSIS", field: "title", value: e.target.value })
                    }
                  />
                  <Textarea
                    label="Förändringsbeskrivning"
                    placeholder="Beskriv den förändring som analyseras..."
                    value={analysis.changeDescription}
                    onChange={(e) =>
                      dispatch({ type: "UPDATE_ANALYSIS", field: "changeDescription", value: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Textarea
                      label="Nuläge"
                      placeholder="Beskriv nuvarande situation..."
                      value={analysis.currentState}
                      onChange={(e) =>
                        dispatch({ type: "UPDATE_ANALYSIS", field: "currentState", value: e.target.value })
                      }
                    />
                    <Textarea
                      label="Önskat läge"
                      placeholder="Beskriv det önskade framtida läget..."
                      value={analysis.desiredState}
                      onChange={(e) =>
                        dispatch({ type: "UPDATE_ANALYSIS", field: "desiredState", value: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
                {TAB_CONFIG.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => dispatch({ type: "SET_TAB", tab: tab.value })}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                      state.activeTab === tab.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon name={tab.icon} size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {state.activeTab === "diagram" && (
                <>
                  {/* Empty state */}
                  {!hasForces && !editingForce && (
                    <Card className="mx-auto max-w-lg p-8 text-center">
                      <div className="mb-4 flex justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon name="git-merge" size={28} />
                        </span>
                      </div>
                      <h2 className="text-lg font-bold tracking-tight">Ingen kraftfältsanalys ännu</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Börja med att lägga till drivande krafter och motståndskrafter för att
                        visualisera balansen i din förändringsanalys.
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <Button
                          onClick={() => dispatch({ type: "ADD_FORCE", forceType: "driving" })}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Icon name="plus" size={14} /> Drivande kraft
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => dispatch({ type: "ADD_FORCE", forceType: "restraining" })}
                          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <Icon name="plus" size={14} /> Motståndskraft
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Diagram + sidebar layout */}
                  {(hasForces || editingForce) && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      {/* Main diagram area */}
                      <div className="space-y-4 lg:col-span-8">
                        <Card className="p-5">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-semibold">
                              <Icon name="bar-chart-3" size={16} className="text-primary" />
                              Kraftfältsdiagram
                            </h3>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => dispatch({ type: "ADD_FORCE", forceType: "driving" })}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Icon name="plus" size={14} /> Drivande
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => dispatch({ type: "ADD_FORCE", forceType: "restraining" })}
                                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                <Icon name="plus" size={14} /> Motstånd
                              </Button>
                            </div>
                          </div>
                          <ForceFieldDiagram
                            analysis={analysis}
                            onEditForce={(id) => dispatch({ type: "EDIT_FORCE", forceId: id })}
                          />
                        </Card>

                        {/* Edit form below diagram */}
                        {editingForce && (
                          <ForceEditForm
                            force={editingForce}
                            dispatch={dispatch}
                            onClose={() => dispatch({ type: "EDIT_FORCE", forceId: null })}
                          />
                        )}
                      </div>

                      {/* Sidebar: force lists */}
                      <div className="lg:col-span-4">
                        <ForceListSidebar
                          analysis={analysis}
                          editingForceId={state.editingForceId}
                          dispatch={dispatch}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {state.activeTab === "atgardsplan" && (
                <ActionPlanTab analysis={analysis} dispatch={dispatch} />
              )}

              {state.activeTab === "sammanfattning" && (
                <SummaryTab analysis={analysis} dispatch={dispatch} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}

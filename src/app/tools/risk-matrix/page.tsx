"use client";

import { useReducer, useEffect, useCallback, useMemo } from "react";
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

type RiskCategory = "Juridisk" | "Ekonomisk" | "Teknisk" | "Organisatorisk" | "Leverantör";
type MitigationStatus = "Planerad" | "Pågående" | "Klar";
type RiskLevel = "Låg" | "Medel" | "Hög" | "Kritisk";

interface Mitigation {
  id: string;
  action: string;
  responsible: string;
  deadline: string;
  status: MitigationStatus;
}

interface Risk {
  id: string;
  name: string;
  description: string;
  category: RiskCategory;
  existingMitigations: string;
  sannolikhet: number; // 1-5
  konsekvens: number;  // 1-5
  mitigations: Mitigation[];
}

interface RiskMatrixState {
  risks: Risk[];
  selectedRiskId: string | null;
  selectedCell: { s: number; k: number } | null;
  editingRiskId: string | null;
}

type Action =
  | { type: "ADD_RISK" }
  | { type: "REMOVE_RISK"; id: string }
  | { type: "UPDATE_RISK"; id: string; field: keyof Risk; value: unknown }
  | { type: "SELECT_RISK"; id: string | null }
  | { type: "SELECT_CELL"; cell: { s: number; k: number } | null }
  | { type: "EDIT_RISK"; id: string | null }
  | { type: "ADD_MITIGATION"; riskId: string }
  | { type: "UPDATE_MITIGATION"; riskId: string; mitigationId: string; field: keyof Mitigation; value: string }
  | { type: "REMOVE_MITIGATION"; riskId: string; mitigationId: string }
  | { type: "LOAD_STATE"; state: RiskMatrixState }
  | { type: "RESET" };

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const CATEGORIES: { value: RiskCategory; label: string }[] = [
  { value: "Juridisk", label: "Juridisk" },
  { value: "Ekonomisk", label: "Ekonomisk" },
  { value: "Teknisk", label: "Teknisk" },
  { value: "Organisatorisk", label: "Organisatorisk" },
  { value: "Leverantör", label: "Leverantör" },
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

const SANNOLIKHET_LABELS: Record<number, string> = {
  1: "Mycket osannolikt",
  2: "Osannolikt",
  3: "Möjligt",
  4: "Sannolikt",
  5: "Mycket sannolikt",
};

const KONSEKVENS_LABELS: Record<number, string> = {
  1: "Obetydlig",
  2: "Liten",
  3: "Måttlig",
  4: "Allvarlig",
  5: "Kritisk",
};

const MITIGATION_STATUS_OPTIONS: { value: MitigationStatus; label: string }[] = [
  { value: "Planerad", label: "Planerad" },
  { value: "Pågående", label: "Pågående" },
  { value: "Klar", label: "Klar" },
];

const CATEGORY_ICONS: Record<RiskCategory, string> = {
  Juridisk: "scale",
  Ekonomisk: "coins",
  Teknisk: "wrench",
  Organisatorisk: "users",
  Leverantör: "handshake",
};

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  Juridisk: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Ekonomisk: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Teknisk: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Organisatorisk: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Leverantör: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const STORAGE_KEY = "critero-risk-matrix";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getRiskScore(risk: Risk): number {
  return risk.sannolikhet * risk.konsekvens;
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 4) return "Låg";
  if (score <= 9) return "Medel";
  if (score <= 15) return "Hög";
  return "Kritisk";
}

function getLevelColor(level: RiskLevel): string {
  switch (level) {
    case "Låg":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "Medel":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Hög":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "Kritisk":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
}

function getLevelDotColor(level: RiskLevel): string {
  switch (level) {
    case "Låg":
      return "bg-green-500";
    case "Medel":
      return "bg-yellow-500";
    case "Hög":
      return "bg-orange-500";
    case "Kritisk":
      return "bg-red-500";
  }
}

/** Returns the background color class for a cell at position (sannolikhet, konsekvens) */
function getCellZoneColor(s: number, k: number): string {
  const score = s * k;
  if (score <= 4)  return "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40";
  if (score <= 9)  return "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:hover:bg-yellow-900/40";
  if (score <= 15) return "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-900/40";
  return "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40";
}

function getCellZoneBorder(s: number, k: number): string {
  const score = s * k;
  if (score <= 4)  return "border-green-200 dark:border-green-800";
  if (score <= 9)  return "border-yellow-200 dark:border-yellow-800";
  if (score <= 15) return "border-orange-200 dark:border-orange-800";
  return "border-red-200 dark:border-red-800";
}

/* ================================================================== */
/*  Initial state & reducer                                            */
/* ================================================================== */

function createInitialState(): RiskMatrixState {
  return {
    risks: [],
    selectedRiskId: null,
    selectedCell: null,
    editingRiskId: null,
  };
}

function reducer(state: RiskMatrixState, action: Action): RiskMatrixState {
  switch (action.type) {
    case "ADD_RISK": {
      const newRisk: Risk = {
        id: uid(),
        name: "",
        description: "",
        category: "Juridisk",
        existingMitigations: "",
        sannolikhet: 3,
        konsekvens: 3,
        mitigations: [],
      };
      return {
        ...state,
        risks: [...state.risks, newRisk],
        editingRiskId: newRisk.id,
        selectedRiskId: newRisk.id,
        selectedCell: null,
      };
    }

    case "REMOVE_RISK":
      return {
        ...state,
        risks: state.risks.filter((r) => r.id !== action.id),
        selectedRiskId: state.selectedRiskId === action.id ? null : state.selectedRiskId,
        editingRiskId: state.editingRiskId === action.id ? null : state.editingRiskId,
      };

    case "UPDATE_RISK":
      return {
        ...state,
        risks: state.risks.map((r) =>
          r.id === action.id ? { ...r, [action.field]: action.value } : r
        ),
      };

    case "SELECT_RISK":
      return { ...state, selectedRiskId: action.id, selectedCell: null };

    case "SELECT_CELL":
      return { ...state, selectedCell: action.cell, selectedRiskId: null };

    case "EDIT_RISK":
      return { ...state, editingRiskId: action.id };

    case "ADD_MITIGATION": {
      const newMitigation: Mitigation = {
        id: uid(),
        action: "",
        responsible: "",
        deadline: "",
        status: "Planerad",
      };
      return {
        ...state,
        risks: state.risks.map((r) =>
          r.id === action.riskId
            ? { ...r, mitigations: [...r.mitigations, newMitigation] }
            : r
        ),
      };
    }

    case "UPDATE_MITIGATION":
      return {
        ...state,
        risks: state.risks.map((r) =>
          r.id === action.riskId
            ? {
                ...r,
                mitigations: r.mitigations.map((m) =>
                  m.id === action.mitigationId ? { ...m, [action.field]: action.value } : m
                ),
              }
            : r
        ),
      };

    case "REMOVE_MITIGATION":
      return {
        ...state,
        risks: state.risks.map((r) =>
          r.id === action.riskId
            ? { ...r, mitigations: r.mitigations.filter((m) => m.id !== action.mitigationId) }
            : r
        ),
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

/* ---- Summary Stats ---- */

function SummaryStats({ risks }: { risks: Risk[] }) {
  const total = risks.length;
  const byLevel = useMemo(() => {
    const counts: Record<RiskLevel, number> = { Låg: 0, Medel: 0, Hög: 0, Kritisk: 0 };
    risks.forEach((r) => {
      counts[getRiskLevel(getRiskScore(r))]++;
    });
    return counts;
  }, [risks]);

  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    risks.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [risks]);

  return (
    <Card className="p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon name="bar-chart-3" size={16} className="text-primary" />
        Sammanfattning
      </h3>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl font-bold tabular-nums">{total}</span>
        <span className="text-sm text-muted-foreground">
          {total === 1 ? "risk identifierad" : "risker identifierade"}
        </span>
      </div>

      {/* By level */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Per risknivå</p>
        <div className="grid grid-cols-2 gap-2">
          {(["Kritisk", "Hög", "Medel", "Låg"] as RiskLevel[]).map((level) => (
            <div
              key={level}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium",
                getLevelColor(level)
              )}
            >
              <span>{level}</span>
              <span className="font-bold tabular-nums">{byLevel[level]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* By category */}
      {total > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Per kategori</p>
          <div className="space-y-1.5">
            {CATEGORIES.filter((c) => byCategory[c.value]).map((c) => (
              <div
                key={c.value}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded", CATEGORY_COLORS[c.value])}>
                    <Icon name={CATEGORY_ICONS[c.value]} size={12} />
                  </span>
                  {c.label}
                </span>
                <span className="font-medium tabular-nums text-muted-foreground">
                  {byCategory[c.value]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---- 5x5 Risk Matrix Grid ---- */

function MatrixGrid({
  risks,
  selectedCell,
  selectedRiskId,
  onSelectCell,
  onSelectRisk,
}: {
  risks: Risk[];
  selectedCell: { s: number; k: number } | null;
  selectedRiskId: string | null;
  onSelectCell: (cell: { s: number; k: number } | null) => void;
  onSelectRisk: (id: string | null) => void;
}) {
  // Build a map: `${s}-${k}` -> Risk[]
  const cellMap = useMemo(() => {
    const map: Record<string, Risk[]> = {};
    risks.forEach((r) => {
      const key = `${r.sannolikhet}-${r.konsekvens}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [risks]);

  // Rows go from top (s=5) to bottom (s=1), columns from left (k=1) to right (k=5)
  const rows = [5, 4, 3, 2, 1];
  const cols = [1, 2, 3, 4, 5];

  return (
    <Card className="p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon name="target" size={16} className="text-primary" />
        Riskmatris
      </h3>

      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          {/* Column header: Konsekvens labels */}
          <div className="flex">
            {/* Top-left corner spacer */}
            <div className="w-28 shrink-0" />
            {cols.map((k) => (
              <div
                key={k}
                className="flex-1 px-1 pb-2 text-center"
              >
                <span className="text-[11px] font-medium text-muted-foreground leading-tight block">
                  {k}. {KONSEKVENS_LABELS[k]}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {rows.map((s) => (
            <div key={s} className="flex">
              {/* Row header: Sannolikhet label */}
              <div className="flex w-28 shrink-0 items-center justify-end pr-2">
                <span className="text-[11px] font-medium text-muted-foreground text-right leading-tight">
                  {s}. {SANNOLIKHET_LABELS[s]}
                </span>
              </div>

              {/* Cells */}
              {cols.map((k) => {
                const key = `${s}-${k}`;
                const cellRisks = cellMap[key] || [];
                const isSelected =
                  selectedCell?.s === s && selectedCell?.k === k;

                return (
                  <div key={key} className="flex-1 p-0.5">
                    <button
                      onClick={() => {
                        if (isSelected) {
                          onSelectCell(null);
                        } else {
                          onSelectCell({ s, k });
                        }
                      }}
                      className={cn(
                        "relative flex h-16 w-full flex-col items-center justify-center rounded-lg border transition-all duration-150",
                        getCellZoneColor(s, k),
                        getCellZoneBorder(s, k),
                        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                      )}
                    >
                      {/* Score number in corner */}
                      <span className="absolute top-1 right-1.5 text-[10px] font-medium text-muted-foreground/60 tabular-nums">
                        {s * k}
                      </span>

                      {/* Risk dots */}
                      {cellRisks.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {cellRisks.slice(0, 6).map((r) => {
                            const level = getRiskLevel(getRiskScore(r));
                            const isRiskSelected = selectedRiskId === r.id;
                            return (
                              <button
                                key={r.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectRisk(isRiskSelected ? null : r.id);
                                }}
                                title={r.name || "Namnlös risk"}
                                className={cn(
                                  "h-4 w-4 rounded-full transition-all duration-150",
                                  getLevelDotColor(level),
                                  isRiskSelected
                                    ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-125"
                                    : "hover:scale-110",
                                )}
                              />
                            );
                          })}
                          {cellRisks.length > 6 && (
                            <span className="text-[10px] font-bold text-muted-foreground">
                              +{cellRisks.length - 6}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Axis labels */}
          <div className="mt-2 flex">
            <div className="w-28 shrink-0" />
            <div className="flex-1 text-center">
              <span className="text-xs font-semibold text-muted-foreground">
                Konsekvens →
              </span>
            </div>
          </div>

          {/* Vertical axis label */}
          <div className="mt-1 flex justify-start pl-1">
            <span className="text-xs font-semibold text-muted-foreground">
              ↑ Sannolikhet
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-3">
        <span className="text-[11px] text-muted-foreground font-medium">Risknivå:</span>
        {(["Låg", "Medel", "Hög", "Kritisk"] as RiskLevel[]).map((level) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", getLevelDotColor(level))} />
            <span className="text-[11px] text-muted-foreground">{level}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ---- Cell Detail (when a matrix cell is selected) ---- */

function CellDetail({
  cell,
  risks,
  onSelectRisk,
  onClose,
}: {
  cell: { s: number; k: number };
  risks: Risk[];
  onSelectRisk: (id: string) => void;
  onClose: () => void;
}) {
  const cellRisks = risks.filter(
    (r) => r.sannolikhet === cell.s && r.konsekvens === cell.k
  );
  const score = cell.s * cell.k;
  const level = getRiskLevel(score);

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium", getLevelColor(level))}>
            Poäng {score} — {level}
          </span>
          <span className="text-muted-foreground font-normal">
            Sannolikhet {cell.s} × Konsekvens {cell.k}
          </span>
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      {cellRisks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Inga risker i denna cell.</p>
      ) : (
        <div className="space-y-2">
          {cellRisks.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRisk(r.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg", CATEGORY_COLORS[r.category])}>
                <Icon name={CATEGORY_ICONS[r.category]} size={12} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.name || "Namnlös risk"}</p>
                <p className="text-xs text-muted-foreground truncate">{r.category}</p>
              </div>
              <Icon name="arrow-right" size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---- Risk List Item ---- */

function RiskListItem({
  risk,
  isSelected,
  onSelect,
  onEdit,
  onRemove,
}: {
  risk: Risk;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const score = getRiskScore(risk);
  const level = getRiskLevel(score);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-150 cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/60 hover:border-border hover:bg-accent/50",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", CATEGORY_COLORS[risk.category])}>
          <Icon name={CATEGORY_ICONS[risk.category]} size={14} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">{risk.name || "Namnlös risk"}</p>
            <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium", getLevelColor(level))}>
              {score} — {level}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {risk.category} · S:{risk.sannolikhet} × K:{risk.konsekvens}
          </p>
          {risk.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{risk.description}</p>
          )}
          {risk.mitigations.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Icon name="shield-alert" size={11} />
              {risk.mitigations.length} åtgärd{risk.mitigations.length !== 1 ? "er" : ""}
              {" · "}
              {risk.mitigations.filter((m) => m.status === "Klar").length} klar{risk.mitigations.filter((m) => m.status === "Klar").length !== 1 ? "a" : ""}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Redigera"
          >
            <Icon name="pen-line" size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Ta bort"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Risk Form (Add / Edit) ---- */

function RiskForm({
  risk,
  dispatch,
  onClose,
}: {
  risk: Risk;
  dispatch: React.Dispatch<Action>;
  onClose: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="pen-line" size={16} className="text-primary" />
          {risk.name ? "Redigera risk" : "Ny risk"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          label="Risknamn"
          placeholder="T.ex. Överprövning av tilldelningsbeslut"
          value={risk.name}
          onChange={(e) =>
            dispatch({ type: "UPDATE_RISK", id: risk.id, field: "name", value: e.target.value })
          }
        />

        <Textarea
          label="Beskrivning"
          placeholder="Beskriv risken och dess potentiella påverkan..."
          value={risk.description}
          onChange={(e) =>
            dispatch({ type: "UPDATE_RISK", id: risk.id, field: "description", value: e.target.value })
          }
        />

        <Select
          label="Kategori"
          options={CATEGORY_OPTIONS}
          value={risk.category}
          onChange={(e) =>
            dispatch({ type: "UPDATE_RISK", id: risk.id, field: "category", value: e.target.value })
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Select
              label="Sannolikhet"
              options={[1, 2, 3, 4, 5].map((v) => ({
                value: String(v),
                label: `${v} — ${SANNOLIKHET_LABELS[v]}`,
              }))}
              value={String(risk.sannolikhet)}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_RISK",
                  id: risk.id,
                  field: "sannolikhet",
                  value: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Select
              label="Konsekvens"
              options={[1, 2, 3, 4, 5].map((v) => ({
                value: String(v),
                label: `${v} — ${KONSEKVENS_LABELS[v]}`,
              }))}
              value={String(risk.konsekvens)}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_RISK",
                  id: risk.id,
                  field: "konsekvens",
                  value: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        {/* Computed score */}
        {(() => {
          const score = getRiskScore(risk);
          const level = getRiskLevel(score);
          return (
            <div className={cn("flex items-center gap-2 rounded-xl px-4 py-3", getLevelColor(level))}>
              <Icon name="alert-triangle" size={16} />
              <span className="text-sm font-medium">
                Riskpoäng: {score} — {level}
              </span>
            </div>
          );
        })()}

        <Textarea
          label="Befintliga åtgärder"
          placeholder="Beskriv redan vidtagna åtgärder..."
          value={risk.existingMitigations}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_RISK",
              id: risk.id,
              field: "existingMitigations",
              value: e.target.value,
            })
          }
        />

        <div className="flex justify-end">
          <Button onClick={onClose}>
            <Icon name="check" size={14} /> Klar
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ---- Risk Detail Panel ---- */

function RiskDetailPanel({
  risk,
  dispatch,
  onClose,
  onEdit,
}: {
  risk: Risk;
  dispatch: React.Dispatch<Action>;
  onClose: () => void;
  onEdit: () => void;
}) {
  const score = getRiskScore(risk);
  const level = getRiskLevel(score);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", CATEGORY_COLORS[risk.category])}>
            <Icon name={CATEGORY_ICONS[risk.category]} size={16} />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight">{risk.name || "Namnlös risk"}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", getLevelColor(level))}>
                {score} — {level}
              </span>
              <span className="text-xs text-muted-foreground">
                {risk.category} · S:{risk.sannolikhet} × K:{risk.konsekvens}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} title="Redigera">
            <Icon name="pen-line" size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="x" size={16} />
          </Button>
        </div>
      </div>

      {/* Description */}
      {risk.description && (
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Beskrivning</p>
          <p className="text-sm whitespace-pre-wrap">{risk.description}</p>
        </div>
      )}

      {/* Assessment visual */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Sannolikhet</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <div
                  key={v}
                  className={cn(
                    "h-2 w-5 rounded-sm transition-colors",
                    v <= risk.sannolikhet
                      ? risk.sannolikhet >= 4
                        ? "bg-red-400"
                        : risk.sannolikhet >= 3
                        ? "bg-orange-400"
                        : "bg-green-400"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{risk.sannolikhet}/5</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{SANNOLIKHET_LABELS[risk.sannolikhet]}</p>
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Konsekvens</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <div
                  key={v}
                  className={cn(
                    "h-2 w-5 rounded-sm transition-colors",
                    v <= risk.konsekvens
                      ? risk.konsekvens >= 4
                        ? "bg-red-400"
                        : risk.konsekvens >= 3
                        ? "bg-orange-400"
                        : "bg-green-400"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{risk.konsekvens}/5</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{KONSEKVENS_LABELS[risk.konsekvens]}</p>
        </div>
      </div>

      {/* Existing mitigations */}
      {risk.existingMitigations && (
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Befintliga åtgärder</p>
          <p className="text-sm whitespace-pre-wrap">{risk.existingMitigations}</p>
        </div>
      )}

      {/* Mitigation planning */}
      <div className="border-t border-border/60 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="shield-alert" size={14} className="text-primary" />
            Åtgärdsplanering
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "ADD_MITIGATION", riskId: risk.id })}
          >
            <Icon name="plus" size={14} /> Lägg till åtgärd
          </Button>
        </div>

        {risk.mitigations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Inga planerade åtgärder ännu. Lägg till en åtgärd för att hantera denna risk.
          </p>
        ) : (
          <div className="space-y-3">
            {risk.mitigations.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border/60 p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <Input
                      label="Åtgärd"
                      placeholder="Beskriv planerad åtgärd..."
                      value={m.action}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_MITIGATION",
                          riskId: risk.id,
                          mitigationId: m.id,
                          field: "action",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_MITIGATION", riskId: risk.id, mitigationId: m.id })
                    }
                    className="mt-5 shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input
                    label="Ansvarig"
                    placeholder="Namn"
                    value={m.responsible}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_MITIGATION",
                        riskId: risk.id,
                        mitigationId: m.id,
                        field: "responsible",
                        value: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Deadline"
                    type="date"
                    value={m.deadline}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_MITIGATION",
                        riskId: risk.id,
                        mitigationId: m.id,
                        field: "deadline",
                        value: e.target.value,
                      })
                    }
                  />
                  <Select
                    label="Status"
                    options={MITIGATION_STATUS_OPTIONS}
                    value={m.status}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_MITIGATION",
                        riskId: risk.id,
                        mitigationId: m.id,
                        field: "status",
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

export default function RiskMatrixPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.risks)) {
          dispatch({ type: "LOAD_STATE", state: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Auto-save on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable
    }
  }, [state]);

  const handleExportJson = useCallback(() => {
    exportToJson(`riskmatris-${new Date().toISOString().slice(0, 10)}.json`, state.risks);
  }, [state.risks]);

  const handleExportXlsx = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Riskmatris",
      exportDate: dateStr,
      subtitle: `${state.risks.length} risker identifierade`,
    };

    const riskRows: (string | number)[][] = state.risks.map((r) => {
      const score = getRiskScore(r);
      const level = getRiskLevel(score);
      return [r.name, r.category, r.sannolikhet, r.konsekvens, score, level, r.description, r.existingMitigations];
    });

    const mitigationRows: (string | number)[][] = [];
    for (const r of state.risks) {
      for (const m of r.mitigations) {
        mitigationRows.push([r.name, m.action, m.responsible, m.deadline, m.status]);
      }
    }

    const sheets: ExportSheet[] = [
      {
        name: "Risker",
        headers: ["Namn", "Kategori", "Sannolikhet", "Konsekvens", "Poäng", "Nivå", "Beskrivning", "Befintliga åtgärder"],
        rows: riskRows,
      },
      {
        name: "Åtgärder",
        headers: ["Risk", "Åtgärd", "Ansvarig", "Deadline", "Status"],
        rows: mitigationRows,
      },
    ];

    await exportToXlsx(`riskmatris-${dateStr}.xlsx`, sheets, metadata);
  }, [state.risks]);

  const handleExportPdf = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Riskmatris",
      exportDate: dateStr,
      subtitle: `${state.risks.length} risker identifierade`,
    };

    const sections: PdfSection[] = [
      {
        title: "Risköversikt",
        type: "table",
        headers: ["Namn", "Kategori", "S", "K", "Poäng", "Nivå"],
        rows: state.risks.map((r) => {
          const score = getRiskScore(r);
          return [r.name, r.category, r.sannolikhet, r.konsekvens, score, getRiskLevel(score)];
        }),
      },
    ];

    const mitigationRows: (string | number)[][] = [];
    for (const r of state.risks) {
      for (const m of r.mitigations) {
        mitigationRows.push([r.name, m.action, m.responsible, m.deadline, m.status]);
      }
    }
    if (mitigationRows.length > 0) {
      sections.push({
        title: "Åtgärdsplan",
        type: "table",
        headers: ["Risk", "Åtgärd", "Ansvarig", "Deadline", "Status"],
        rows: mitigationRows,
      });
    }

    await exportToPdf(`riskmatris-${dateStr}.pdf`, sections, metadata);
  }, [state.risks]);

  const handleNewAnalysis = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const selectedRisk = state.selectedRiskId
    ? state.risks.find((r) => r.id === state.selectedRiskId) ?? null
    : null;

  const editingRisk = state.editingRiskId
    ? state.risks.find((r) => r.id === state.editingRiskId) ?? null
    : null;

  // Sort risks by score (highest first)
  const sortedRisks = useMemo(
    () => [...state.risks].sort((a, b) => getRiskScore(b) - getRiskScore(a)),
    [state.risks]
  );

  return (
    <FeatureGate featureKey="verktyg.risk-matrix">
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Upphandlingar</span>
          <span>/</span>
          <span>Verktyg</span>
          <span>/</span>
          <span className="text-foreground font-medium">Riskmatris</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="shield-alert" size={20} />
          </span>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Riskmatris</h1>
            <p className="text-xs text-muted-foreground">
              Identifiera, bedöm och hantera risker i upphandlingsprocessen
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJson} disabled={state.risks.length === 0}>
              <Icon name="external-link" size={14} /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXlsx} disabled={state.risks.length === 0}>
              <Icon name="file-spreadsheet" size={14} /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={state.risks.length === 0}>
              <Icon name="file-text" size={14} /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleNewAnalysis}>
              <Icon name="refresh-cw" size={14} /> Ny analys
            </Button>
            <Button size="sm" onClick={() => dispatch({ type: "ADD_RISK" })}>
              <Icon name="plus" size={14} /> Lägg till risk
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          {/* Empty state */}
          {state.risks.length === 0 && !editingRisk && (
            <Card className="mx-auto max-w-lg p-8 text-center">
              <div className="mb-4 flex justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name="shield-alert" size={28} />
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">Ingen riskanalys ännu</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Börja med att lägga till risker för att bygga din riskmatris. Bedöm sannolikhet och
                konsekvens för varje risk, och planera åtgärder.
              </p>
              <div className="mt-6">
                <Button onClick={() => dispatch({ type: "ADD_RISK" })}>
                  <Icon name="plus" size={14} /> Lägg till första risken
                </Button>
              </div>
            </Card>
          )}

          {/* Two-column layout when risks exist */}
          {(state.risks.length > 0 || editingRisk) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left column: Matrix + Stats */}
              <div className="space-y-6 lg:col-span-7">
                <MatrixGrid
                  risks={state.risks}
                  selectedCell={state.selectedCell}
                  selectedRiskId={state.selectedRiskId}
                  onSelectCell={(cell) => dispatch({ type: "SELECT_CELL", cell })}
                  onSelectRisk={(id) => dispatch({ type: "SELECT_RISK", id })}
                />

                <SummaryStats risks={state.risks} />
              </div>

              {/* Right column: Risk list + Add/Edit */}
              <div className="space-y-4 lg:col-span-5">
                {/* Editing form */}
                {editingRisk && (
                  <RiskForm
                    risk={editingRisk}
                    dispatch={dispatch}
                    onClose={() => dispatch({ type: "EDIT_RISK", id: null })}
                  />
                )}

                {/* Risk list */}
                <Card className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Icon name="clipboard-list" size={16} className="text-primary" />
                      Risklista
                      {state.risks.length > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                          ({state.risks.length})
                        </span>
                      )}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: "ADD_RISK" })}
                    >
                      <Icon name="plus" size={14} /> Lägg till
                    </Button>
                  </div>

                  {state.risks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Inga risker tillagda ännu.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sortedRisks.map((r) => (
                        <RiskListItem
                          key={r.id}
                          risk={r}
                          isSelected={state.selectedRiskId === r.id}
                          onSelect={() => dispatch({ type: "SELECT_RISK", id: r.id })}
                          onEdit={() => {
                            dispatch({ type: "SELECT_RISK", id: r.id });
                            dispatch({ type: "EDIT_RISK", id: r.id });
                          }}
                          onRemove={() => dispatch({ type: "REMOVE_RISK", id: r.id })}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Bottom panel: Cell detail or Risk detail */}
          {state.selectedCell && !selectedRisk && (
            <div className="mt-6">
              <CellDetail
                cell={state.selectedCell}
                risks={state.risks}
                onSelectRisk={(id) => dispatch({ type: "SELECT_RISK", id })}
                onClose={() => dispatch({ type: "SELECT_CELL", cell: null })}
              />
            </div>
          )}

          {selectedRisk && !editingRisk && (
            <div className="mt-6">
              <RiskDetailPanel
                risk={selectedRisk}
                dispatch={dispatch}
                onClose={() => dispatch({ type: "SELECT_RISK", id: null })}
                onEdit={() => dispatch({ type: "EDIT_RISK", id: selectedRisk.id })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}

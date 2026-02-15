"use client";

import { useReducer, useEffect, useState, useCallback } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  exportToJson,
  exportToXlsx,
  exportToPdf,
  type ExportSheet,
  type PdfSection,
  type ExportMetadata,
} from "@/lib/tools-export";
import { FeatureGate } from "@/components/feature-gate";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type Category =
  | "Människa"
  | "Metod"
  | "Maskin"
  | "Material"
  | "Miljö"
  | "Mätning";

type ActionStatus = "Ej påbörjad" | "Pågående" | "Klar";

interface Cause {
  id: string;
  text: string;
  category: Category;
}

interface WhyStep {
  id: string;
  question: string;
  answer: string;
}

interface ActionItem {
  id: string;
  text: string;
  responsible: string;
  deadline: string;
  status: ActionStatus;
}

interface Analysis {
  id: string;
  title: string;
  problemDescription: string;
  causes: Cause[];
  whyChain: WhyStep[];
  rootCause: string;
  actions: ActionItem[];
  createdAt: string;
}

type Tab = "fishbone" | "whys" | "actions";

interface RootCauseState {
  analyses: Analysis[];
  activeAnalysisId: string | null;
  activeTab: Tab;
}

type Action =
  | { type: "CREATE_ANALYSIS" }
  | { type: "DELETE_ANALYSIS"; id: string }
  | { type: "SELECT_ANALYSIS"; id: string }
  | { type: "SET_TAB"; tab: Tab }
  | { type: "UPDATE_TITLE"; title: string }
  | { type: "UPDATE_PROBLEM"; description: string }
  | { type: "ADD_CAUSE"; cause: Cause }
  | { type: "UPDATE_CAUSE"; id: string; text: string }
  | { type: "REMOVE_CAUSE"; id: string }
  | { type: "ADD_WHY_STEP" }
  | { type: "UPDATE_WHY_STEP"; id: string; field: "question" | "answer"; value: string }
  | { type: "REMOVE_WHY_STEP"; id: string }
  | { type: "SET_ROOT_CAUSE"; value: string }
  | { type: "ADD_ACTION" }
  | { type: "UPDATE_ACTION"; id: string; field: keyof ActionItem; value: string }
  | { type: "REMOVE_ACTION"; id: string }
  | { type: "LOAD_STATE"; state: RootCauseState };

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const STORAGE_KEY = "critero-root-cause-v1";

const CATEGORIES: Category[] = [
  "Människa",
  "Metod",
  "Maskin",
  "Material",
  "Miljö",
  "Mätning",
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; dot: string }> = {
  Människa: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
    dot: "bg-blue-500",
  },
  Metod: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-300 dark:border-emerald-700",
    dot: "bg-emerald-500",
  },
  Maskin: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-300 dark:border-purple-700",
    dot: "bg-purple-500",
  },
  Material: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-300 dark:border-amber-700",
    dot: "bg-amber-500",
  },
  Miljö: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-300 dark:border-teal-700",
    dot: "bg-teal-500",
  },
  Mätning: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-300 dark:border-rose-700",
    dot: "bg-rose-500",
  },
};

const CATEGORY_ICONS: Record<Category, string> = {
  Människa: "users",
  Metod: "git-branch",
  Maskin: "monitor",
  Material: "database",
  Miljö: "activity",
  Mätning: "gauge",
};

const STATUS_OPTIONS: { value: ActionStatus; label: string }[] = [
  { value: "Ej påbörjad", label: "Ej påbörjad" },
  { value: "Pågående", label: "Pågående" },
  { value: "Klar", label: "Klar" },
];

const STATUS_COLORS: Record<ActionStatus, string> = {
  "Ej påbörjad": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  Pågående: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Klar: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getActiveAnalysis(state: RootCauseState): Analysis | null {
  if (!state.activeAnalysisId) return null;
  return state.analyses.find((a) => a.id === state.activeAnalysisId) ?? null;
}

function updateActiveAnalysis(
  state: RootCauseState,
  updater: (a: Analysis) => Analysis,
): RootCauseState {
  return {
    ...state,
    analyses: state.analyses.map((a) =>
      a.id === state.activeAnalysisId ? updater(a) : a,
    ),
  };
}

/* ================================================================== */
/*  Initial state & reducer                                            */
/* ================================================================== */

function createInitialState(): RootCauseState {
  return {
    analyses: [],
    activeAnalysisId: null,
    activeTab: "fishbone",
  };
}

function reducer(state: RootCauseState, action: Action): RootCauseState {
  switch (action.type) {
    case "CREATE_ANALYSIS": {
      const newAnalysis: Analysis = {
        id: uid(),
        title: "",
        problemDescription: "",
        causes: [],
        whyChain: [],
        rootCause: "",
        actions: [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        analyses: [newAnalysis, ...state.analyses],
        activeAnalysisId: newAnalysis.id,
        activeTab: "fishbone",
      };
    }

    case "DELETE_ANALYSIS": {
      const remaining = state.analyses.filter((a) => a.id !== action.id);
      return {
        ...state,
        analyses: remaining,
        activeAnalysisId:
          state.activeAnalysisId === action.id
            ? remaining[0]?.id ?? null
            : state.activeAnalysisId,
      };
    }

    case "SELECT_ANALYSIS":
      return { ...state, activeAnalysisId: action.id };

    case "SET_TAB":
      return { ...state, activeTab: action.tab };

    case "UPDATE_TITLE":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        title: action.title,
      }));

    case "UPDATE_PROBLEM":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        problemDescription: action.description,
      }));

    case "ADD_CAUSE":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        causes: [...a.causes, action.cause],
      }));

    case "UPDATE_CAUSE":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        causes: a.causes.map((c) =>
          c.id === action.id ? { ...c, text: action.text } : c,
        ),
      }));

    case "REMOVE_CAUSE":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        causes: a.causes.filter((c) => c.id !== action.id),
      }));

    case "ADD_WHY_STEP": {
      const analysis = getActiveAnalysis(state);
      if (!analysis) return state;
      const stepNumber = analysis.whyChain.length + 1;
      const newStep: WhyStep = {
        id: uid(),
        question: `Varför ${stepNumber === 1 ? "uppstår problemet" : "det"}?`,
        answer: "",
      };
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        whyChain: [...a.whyChain, newStep],
      }));
    }

    case "UPDATE_WHY_STEP":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        whyChain: a.whyChain.map((w) =>
          w.id === action.id ? { ...w, [action.field]: action.value } : w,
        ),
      }));

    case "REMOVE_WHY_STEP":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        whyChain: a.whyChain.filter((w) => w.id !== action.id),
      }));

    case "SET_ROOT_CAUSE":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        rootCause: action.value,
      }));

    case "ADD_ACTION": {
      const newAction: ActionItem = {
        id: uid(),
        text: "",
        responsible: "",
        deadline: "",
        status: "Ej påbörjad",
      };
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        actions: [...a.actions, newAction],
      }));
    }

    case "UPDATE_ACTION":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        actions: a.actions.map((act) =>
          act.id === action.id
            ? { ...act, [action.field]: action.value }
            : act,
        ),
      }));

    case "REMOVE_ACTION":
      return updateActiveAnalysis(state, (a) => ({
        ...a,
        actions: a.actions.filter((act) => act.id !== action.id),
      }));

    case "LOAD_STATE":
      return action.state;

    default:
      return state;
  }
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Analysis List (left sidebar) ---- */

function AnalysisList({
  analyses,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: {
  analyses: Analysis[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="folder" size={16} className="text-primary" />
          Analyser
          {analyses.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({analyses.length})
            </span>
          )}
        </h3>
        <Button variant="outline" size="sm" onClick={onCreate}>
          <Icon name="plus" size={14} /> Ny
        </Button>
      </div>

      {analyses.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Inga analyser skapade.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto">
          {analyses.map((a) => (
            <div
              key={a.id}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150",
                activeId === a.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-accent border border-transparent",
              )}
              onClick={() => onSelect(a.id)}
            >
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    activeId === a.id && "text-primary",
                  )}
                >
                  {a.title || "Namnlös analys"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {new Date(a.createdAt).toLocaleDateString("sv-SE")} ·{" "}
                  {a.causes.length} orsak{a.causes.length !== 1 ? "er" : ""} ·{" "}
                  {a.whyChain.length} varför
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(a.id);
                }}
                className="shrink-0 rounded-lg p-1 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                title="Ta bort analys"
              >
                <Icon name="trash-2" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---- Tab Navigation ---- */

function TabNav({
  activeTab,
  onSetTab,
  analysis,
}: {
  activeTab: Tab;
  onSetTab: (tab: Tab) => void;
  analysis: Analysis;
}) {
  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    {
      key: "fishbone",
      label: "Fiskben",
      icon: "git-branch",
      count: analysis.causes.length,
    },
    {
      key: "whys",
      label: "5 Varför",
      icon: "help-circle",
      count: analysis.whyChain.length,
    },
    {
      key: "actions",
      label: "Åtgärder",
      icon: "check-circle",
      count: analysis.actions.length,
    },
  ];

  return (
    <div className="flex gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onSetTab(t.key)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150",
            activeTab === t.key
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50",
          )}
        >
          <Icon name={t.icon} size={14} />
          {t.label}
          {t.count !== undefined && t.count > 0 && (
            <span
              className={cn(
                "ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-medium tabular-nums",
                activeTab === t.key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---- Fishbone Diagram ---- */

function FishboneDiagram({
  analysis,
  dispatch,
}: {
  analysis: Analysis;
  dispatch: React.Dispatch<Action>;
}) {
  const [newCauseText, setNewCauseText] = useState("");
  const [newCauseCategory, setNewCauseCategory] = useState<Category>("Människa");

  const handleAddCause = useCallback(() => {
    if (!newCauseText.trim()) return;
    dispatch({
      type: "ADD_CAUSE",
      cause: { id: uid(), text: newCauseText.trim(), category: newCauseCategory },
    });
    setNewCauseText("");
  }, [newCauseText, newCauseCategory, dispatch]);

  const topCategories: Category[] = ["Människa", "Metod", "Maskin"];
  const bottomCategories: Category[] = ["Material", "Miljö", "Mätning"];

  const causesByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = analysis.causes.filter((c) => c.category === cat);
      return acc;
    },
    {} as Record<Category, Cause[]>,
  );

  return (
    <div className="space-y-6">
      {/* The visual fishbone diagram */}
      <Card className="p-6 overflow-x-auto">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Icon name="git-branch" size={16} className="text-primary" />
          Ishikawa-diagram (Fiskbensdiagram)
        </h3>

        {!analysis.problemDescription ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon
              name="alert-triangle"
              size={32}
              className="text-muted-foreground/40 mb-3"
            />
            <p className="text-sm text-muted-foreground">
              Ange en problembeskrivning ovan för att starta diagrammet.
            </p>
          </div>
        ) : (
          <div className="relative min-w-[700px]" style={{ height: "460px" }}>
            {/* ---- Central horizontal spine ---- */}
            <div
              className="absolute left-0 right-[200px] top-1/2 h-[3px] bg-foreground/20"
              style={{ transform: "translateY(-50%)" }}
            />

            {/* ---- Arrowhead (right end of spine) ---- */}
            <div
              className="absolute top-1/2"
              style={{
                right: "200px",
                transform: "translateY(-50%)",
              }}
            >
              <div
                className="h-0 w-0"
                style={{
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderLeft: "12px solid var(--color-foreground)",
                  opacity: 0.2,
                }}
              />
            </div>

            {/* ---- Problem box (right end) ---- */}
            <div
              className="absolute right-0 top-1/2 w-[190px] -translate-y-1/2 rounded-xl border-2 border-primary bg-primary/10 p-3"
            >
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
                Problem
              </p>
              <p className="text-sm font-medium leading-snug line-clamp-4">
                {analysis.problemDescription}
              </p>
            </div>

            {/* ---- Top branches (Människa, Metod, Maskin) ---- */}
            {topCategories.map((cat, idx) => {
              const colors = CATEGORY_COLORS[cat];
              const causes = causesByCategory[cat];
              // Positions: 3 branches evenly spaced across the left part
              const leftPercent = 10 + idx * 25;

              return (
                <div key={cat}>
                  {/* Branch label at top */}
                  <div
                    className="absolute"
                    style={{
                      left: `${leftPercent}%`,
                      top: "20px",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
                        colors.bg,
                        colors.text,
                      )}
                    >
                      <Icon name={CATEGORY_ICONS[cat]} size={12} />
                      {cat}
                    </div>
                  </div>

                  {/* Diagonal branch line (from label to spine) */}
                  <div
                    className="absolute"
                    style={{
                      left: `${leftPercent}%`,
                      top: "50px",
                      width: "2px",
                      height: "calc(50% - 50px)",
                      transformOrigin: "bottom center",
                      transform: "rotate(15deg)",
                    }}
                  >
                    <div className={cn("h-full w-full", colors.dot, "opacity-40")} />
                  </div>

                  {/* Causes branching off */}
                  {causes.map((cause, ci) => (
                    <div
                      key={cause.id}
                      className="absolute"
                      style={{
                        left: `${leftPercent - 6 + ci * 2}%`,
                        top: `${70 + ci * 28}px`,
                        maxWidth: "140px",
                      }}
                    >
                      <div
                        className={cn(
                          "group relative rounded-lg border px-2 py-1 text-[11px] leading-tight",
                          colors.bg,
                          colors.text,
                          colors.border,
                        )}
                      >
                        <span>{cause.text}</span>
                        <button
                          onClick={() =>
                            dispatch({ type: "REMOVE_CAUSE", id: cause.id })
                          }
                          className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] group-hover:flex"
                          title="Ta bort"
                        >
                          <Icon name="x" size={8} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* ---- Bottom branches (Material, Miljö, Mätning) ---- */}
            {bottomCategories.map((cat, idx) => {
              const colors = CATEGORY_COLORS[cat];
              const causes = causesByCategory[cat];
              const leftPercent = 10 + idx * 25;

              return (
                <div key={cat}>
                  {/* Branch label at bottom */}
                  <div
                    className="absolute"
                    style={{
                      left: `${leftPercent}%`,
                      bottom: "20px",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
                        colors.bg,
                        colors.text,
                      )}
                    >
                      <Icon name={CATEGORY_ICONS[cat]} size={12} />
                      {cat}
                    </div>
                  </div>

                  {/* Diagonal branch line (from spine to label) */}
                  <div
                    className="absolute"
                    style={{
                      left: `${leftPercent}%`,
                      top: "50%",
                      width: "2px",
                      height: "calc(50% - 50px)",
                      transformOrigin: "top center",
                      transform: "rotate(-15deg)",
                    }}
                  >
                    <div className={cn("h-full w-full", colors.dot, "opacity-40")} />
                  </div>

                  {/* Causes branching off */}
                  {causes.map((cause, ci) => (
                    <div
                      key={cause.id}
                      className="absolute"
                      style={{
                        left: `${leftPercent - 6 + ci * 2}%`,
                        bottom: `${70 + ci * 28}px`,
                        maxWidth: "140px",
                      }}
                    >
                      <div
                        className={cn(
                          "group relative rounded-lg border px-2 py-1 text-[11px] leading-tight",
                          colors.bg,
                          colors.text,
                          colors.border,
                        )}
                      >
                        <span>{cause.text}</span>
                        <button
                          onClick={() =>
                            dispatch({ type: "REMOVE_CAUSE", id: cause.id })
                          }
                          className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] group-hover:flex"
                          title="Ta bort"
                        >
                          <Icon name="x" size={8} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Category legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-3">
          <span className="text-[11px] text-muted-foreground font-medium">
            Kategorier:
          </span>
          {CATEGORIES.map((cat) => {
            const count = causesByCategory[cat].length;
            return (
              <span key={cat} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    CATEGORY_COLORS[cat].dot,
                  )}
                />
                <span className="text-[11px] text-muted-foreground">
                  {cat} ({count})
                </span>
              </span>
            );
          })}
        </div>
      </Card>

      {/* Add cause form */}
      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Icon name="plus-circle" size={16} className="text-primary" />
          Lägg till orsak
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Orsak"
              placeholder="Beskriv orsaken..."
              value={newCauseText}
              onChange={(e) => setNewCauseText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCause();
              }}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              label="Kategori"
              options={CATEGORY_OPTIONS}
              value={newCauseCategory}
              onChange={(e) =>
                setNewCauseCategory(e.target.value as Category)
              }
            />
          </div>
          <Button onClick={handleAddCause} disabled={!newCauseText.trim()}>
            <Icon name="plus" size={14} /> Lägg till
          </Button>
        </div>
      </Card>

      {/* Cause list (editable) */}
      {analysis.causes.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Icon name="clipboard-list" size={16} className="text-primary" />
            Alla orsaker ({analysis.causes.length})
          </h3>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => {
              const causes = causesByCategory[cat];
              if (causes.length === 0) return null;
              const colors = CATEGORY_COLORS[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded",
                        colors.bg,
                        colors.text,
                      )}
                    >
                      <Icon name={CATEGORY_ICONS[cat]} size={11} />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {cat}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3 ml-7">
                    {causes.map((cause) => (
                      <div
                        key={cause.id}
                        className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5"
                      >
                        <input
                          className="flex-1 bg-transparent text-sm outline-none"
                          value={cause.text}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_CAUSE",
                              id: cause.id,
                              text: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() =>
                            dispatch({ type: "REMOVE_CAUSE", id: cause.id })
                          }
                          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---- 5 Whys Tab ---- */

function FiveWhysTab({
  analysis,
  dispatch,
}: {
  analysis: Analysis;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="space-y-6">
      {/* Intro card */}
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="help-circle" size={18} />
          </span>
          <div>
            <h3 className="text-sm font-semibold">5 Varför-metoden</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Utgå från problemet och fråga &quot;Varför?&quot; upprepade gånger
              tills du når grundorsaken. Vanligtvis räcker 5 steg, men du kan
              lägga till fler eller färre efter behov.
            </p>
          </div>
        </div>
      </Card>

      {/* Problem statement */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
            P
          </span>
          <span className="text-sm font-semibold">Problemet</span>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="text-sm">
            {analysis.problemDescription || (
              <span className="text-muted-foreground italic">
                Ingen problembeskrivning angiven. Gå till fliken ovan och fyll i
                en.
              </span>
            )}
          </p>
        </div>
      </Card>

      {/* Why chain */}
      {analysis.whyChain.length > 0 && (
        <div className="space-y-0">
          {analysis.whyChain.map((step, idx) => (
            <div key={step.id} className="relative">
              {/* Vertical connector line */}
              {idx > 0 && (
                <div className="absolute left-[27px] -top-3 h-3 w-[2px] bg-border" />
              )}
              {idx < analysis.whyChain.length - 1 && (
                <div className="absolute left-[27px] -bottom-3 h-3 w-[2px] bg-border" />
              )}

              <Card className="p-5 mb-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-3">
                    <Input
                      label={`Varför ${idx + 1}`}
                      placeholder="Varför...?"
                      value={step.question}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_WHY_STEP",
                          id: step.id,
                          field: "question",
                          value: e.target.value,
                        })
                      }
                    />
                    <Textarea
                      label="Svar"
                      placeholder="Eftersom..."
                      value={step.answer}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_WHY_STEP",
                          id: step.id,
                          field: "answer",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_WHY_STEP", id: step.id })
                    }
                    className="mt-6 shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Ta bort steg"
                  >
                    <Icon name="trash-2" size={14} />
                  </button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add why button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "ADD_WHY_STEP" })}
        >
          <Icon name="plus" size={14} /> Lägg till &quot;Varför?&quot;
        </Button>
      </div>

      {/* Root cause conclusion */}
      <Card className="p-5 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Icon name="target" size={14} />
          </span>
          <span className="text-sm font-semibold">Identifierad grundorsak</span>
        </div>
        <Textarea
          placeholder="Sammanfatta den identifierade grundorsaken baserat på varför-kedjan..."
          value={analysis.rootCause}
          onChange={(e) =>
            dispatch({ type: "SET_ROOT_CAUSE", value: e.target.value })
          }
        />
        {analysis.rootCause && (
          <div className="mt-3 flex items-center gap-2">
            <Icon name="check-circle" size={14} className="text-green-600 dark:text-green-400" />
            <span className="text-xs text-muted-foreground">
              Grundorsak dokumenterad. Gå till Åtgärder för att planera åtgärder.
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---- Actions Tab ---- */

function ActionsTab({
  analysis,
  dispatch,
}: {
  analysis: Analysis;
  dispatch: React.Dispatch<Action>;
}) {
  const completedCount = analysis.actions.filter(
    (a) => a.status === "Klar",
  ).length;
  const totalCount = analysis.actions.length;

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="check-circle" size={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Åtgärdsplan</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Planera och följ upp åtgärder baserat på identifierade orsaker
                och grundorsak.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => dispatch({ type: "ADD_ACTION" })}
          >
            <Icon name="plus" size={14} /> Ny åtgärd
          </Button>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Framsteg</span>
              <span className="text-xs font-medium tabular-nums">
                {completedCount}/{totalCount} klara
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Root cause reminder */}
      {analysis.rootCause && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <Icon name="target" size={14} className="text-primary shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-primary uppercase tracking-wider">
                Grundorsak
              </p>
              <p className="text-sm mt-0.5">{analysis.rootCause}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Action items */}
      {analysis.actions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mb-3 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
              <Icon
                name="clipboard-list"
                size={24}
                className="text-muted-foreground/40"
              />
            </span>
          </div>
          <p className="text-sm font-medium">Inga åtgärder ännu</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Lägg till åtgärder för att hantera de identifierade orsakerna.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "ADD_ACTION" })}
            >
              <Icon name="plus" size={14} /> Lägg till åtgärd
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {analysis.actions.map((action, idx) => (
            <Card key={action.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium",
                      STATUS_COLORS[action.status],
                    )}
                  >
                    {action.status}
                  </span>
                </div>
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_ACTION", id: action.id })
                  }
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Ta bort åtgärd"
                >
                  <Icon name="trash-2" size={14} />
                </button>
              </div>

              <div className="space-y-3">
                <Textarea
                  label="Åtgärd"
                  placeholder="Beskriv åtgärden som ska vidtas..."
                  value={action.text}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_ACTION",
                      id: action.id,
                      field: "text",
                      value: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input
                    label="Ansvarig"
                    placeholder="Namn"
                    value={action.responsible}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ACTION",
                        id: action.id,
                        field: "responsible",
                        value: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Deadline"
                    type="date"
                    value={action.deadline}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ACTION",
                        id: action.id,
                        field: "deadline",
                        value: e.target.value,
                      })
                    }
                  />
                  <Select
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={action.status}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_ACTION",
                        id: action.id,
                        field: "status",
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

export default function RootCausePage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
  }, []);

  // Auto-save on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable
    }
  }, [state]);

  const activeAnalysis = getActiveAnalysis(state);

  /* ---- Export handlers ---- */

  const handleExportJson = useCallback(() => {
    if (!activeAnalysis) return;
    exportToJson(
      `orsaksanalys-${activeAnalysis.title || "namnlös"}-${new Date().toISOString().slice(0, 10)}.json`,
      activeAnalysis,
    );
  }, [activeAnalysis]);

  const handleExportXlsx = useCallback(async () => {
    if (!activeAnalysis) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Problem- & Orsaksanalys",
      exportDate: dateStr,
      subtitle: activeAnalysis.title || "Namnlös analys",
    };

    const causeRows: (string | number)[][] = activeAnalysis.causes.map((c) => [
      c.category,
      c.text,
    ]);

    const whyRows: (string | number)[][] = activeAnalysis.whyChain.map(
      (w, i) => [i + 1, w.question, w.answer],
    );

    const actionRows: (string | number)[][] = activeAnalysis.actions.map(
      (a) => [a.text, a.responsible, a.deadline, a.status],
    );

    const sheets: ExportSheet[] = [
      {
        name: "Orsaker",
        headers: ["Kategori", "Orsak"],
        rows: causeRows,
      },
      {
        name: "5 Varför",
        headers: ["Steg", "Fråga", "Svar"],
        rows: whyRows,
      },
      {
        name: "Åtgärder",
        headers: ["Åtgärd", "Ansvarig", "Deadline", "Status"],
        rows: actionRows,
      },
    ];

    await exportToXlsx(
      `orsaksanalys-${activeAnalysis.title || "namnlös"}-${dateStr}.xlsx`,
      sheets,
      metadata,
    );
  }, [activeAnalysis]);

  const handleExportPdf = useCallback(async () => {
    if (!activeAnalysis) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Problem- & Orsaksanalys",
      exportDate: dateStr,
      subtitle: activeAnalysis.title || "Namnlös analys",
    };

    const sections: PdfSection[] = [
      {
        title: "Problem",
        type: "keyvalue",
        pairs: [
          {
            label: "Problembeskrivning",
            value: activeAnalysis.problemDescription || "-",
          },
          {
            label: "Grundorsak",
            value: activeAnalysis.rootCause || "-",
          },
        ],
      },
      {
        title: "Orsaker (Ishikawa)",
        type: "table",
        headers: ["Kategori", "Orsak"],
        rows: activeAnalysis.causes.map((c) => [c.category, c.text]),
      },
    ];

    if (activeAnalysis.whyChain.length > 0) {
      sections.push({
        title: "5 Varför",
        type: "table",
        headers: ["Steg", "Fråga", "Svar"],
        rows: activeAnalysis.whyChain.map((w, i) => [
          i + 1,
          w.question,
          w.answer,
        ]),
      });
    }

    if (activeAnalysis.actions.length > 0) {
      sections.push({
        title: "Åtgärdsplan",
        type: "table",
        headers: ["Åtgärd", "Ansvarig", "Deadline", "Status"],
        rows: activeAnalysis.actions.map((a) => [
          a.text,
          a.responsible,
          a.deadline,
          a.status,
        ]),
      });
    }

    await exportToPdf(
      `orsaksanalys-${activeAnalysis.title || "namnlös"}-${dateStr}.pdf`,
      sections,
      metadata,
    );
  }, [activeAnalysis]);

  const handleDeleteAnalysis = useCallback(
    (id: string) => {
      if (confirmDeleteId === id) {
        dispatch({ type: "DELETE_ANALYSIS", id });
        setConfirmDeleteId(null);
      } else {
        setConfirmDeleteId(id);
        // Auto-clear confirm after 3 seconds
        setTimeout(() => setConfirmDeleteId(null), 3000);
      }
    },
    [confirmDeleteId],
  );

  return (
    <FeatureGate featureKey="verktyg.root-cause">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="border-b border-border/60 px-6 py-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Upphandlingar</span>
            <span>/</span>
            <span>Verktyg</span>
            <span>/</span>
            <span className="text-foreground font-medium">
              Problem- & Orsaksanalys
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="search" size={20} />
            </span>
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight">
                Problem- & Orsaksanalys
              </h1>
              <p className="text-xs text-muted-foreground">
                Ishikawa-diagram och 5 Varför-metoden för att identifiera
                grundorsaker
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                disabled={!activeAnalysis}
              >
                <Icon name="external-link" size={14} /> JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportXlsx}
                disabled={!activeAnalysis}
              >
                <Icon name="file-text" size={14} /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={!activeAnalysis}
              >
                <Icon name="file-text" size={14} /> PDF
              </Button>
              <Button
                size="sm"
                onClick={() => dispatch({ type: "CREATE_ANALYSIS" })}
              >
                <Icon name="plus" size={14} /> Ny analys
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {/* Empty state: no analyses at all */}
            {state.analyses.length === 0 && (
              <Card className="mx-auto max-w-lg p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon name="search" size={28} />
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight">
                  Ingen orsaksanalys ännu
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Starta en ny analys för att identifiera grundorsaker till
                  problem i upphandlingsprocessen med Ishikawa-diagram och
                  5 Varför-metoden.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => dispatch({ type: "CREATE_ANALYSIS" })}
                  >
                    <Icon name="plus" size={14} /> Skapa första analysen
                  </Button>
                </div>
              </Card>
            )}

            {/* Main two-column layout */}
            {state.analyses.length > 0 && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left sidebar: Analysis list */}
                <div className="lg:col-span-3">
                  <AnalysisList
                    analyses={state.analyses}
                    activeId={state.activeAnalysisId}
                    onSelect={(id) =>
                      dispatch({ type: "SELECT_ANALYSIS", id })
                    }
                    onCreate={() => dispatch({ type: "CREATE_ANALYSIS" })}
                    onDelete={handleDeleteAnalysis}
                  />
                </div>

                {/* Right main area */}
                <div className="lg:col-span-9 space-y-6">
                  {activeAnalysis ? (
                    <>
                      {/* Analysis header: title + problem */}
                      <Card className="p-5">
                        <div className="space-y-4">
                          <Input
                            label="Analysnamn"
                            placeholder="T.ex. Försening i upphandling IT-system"
                            value={activeAnalysis.title}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_TITLE",
                                title: e.target.value,
                              })
                            }
                          />
                          <Textarea
                            label="Problembeskrivning"
                            placeholder="Beskriv problemet som ska analyseras..."
                            value={activeAnalysis.problemDescription}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_PROBLEM",
                                description: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* Summary stats */}
                        <div className="mt-4 flex flex-wrap gap-4 border-t border-border/60 pt-4">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <Icon name="git-branch" size={12} />
                            </span>
                            <span className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {activeAnalysis.causes.length}
                              </span>{" "}
                              orsak
                              {activeAnalysis.causes.length !== 1 ? "er" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                              <Icon name="help-circle" size={12} />
                            </span>
                            <span className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {activeAnalysis.whyChain.length}
                              </span>{" "}
                              varför-steg
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              <Icon name="check-circle" size={12} />
                            </span>
                            <span className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {
                                  activeAnalysis.actions.filter(
                                    (a) => a.status === "Klar",
                                  ).length
                                }
                                /{activeAnalysis.actions.length}
                              </span>{" "}
                              åtgärder klara
                            </span>
                          </div>
                          {activeAnalysis.rootCause && (
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon name="target" size={12} />
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Grundorsak identifierad
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Tabs */}
                      <TabNav
                        activeTab={state.activeTab}
                        onSetTab={(tab) =>
                          dispatch({ type: "SET_TAB", tab })
                        }
                        analysis={activeAnalysis}
                      />

                      {/* Tab content */}
                      {state.activeTab === "fishbone" && (
                        <FishboneDiagram
                          analysis={activeAnalysis}
                          dispatch={dispatch}
                        />
                      )}

                      {state.activeTab === "whys" && (
                        <FiveWhysTab
                          analysis={activeAnalysis}
                          dispatch={dispatch}
                        />
                      )}

                      {state.activeTab === "actions" && (
                        <ActionsTab
                          analysis={activeAnalysis}
                          dispatch={dispatch}
                        />
                      )}
                    </>
                  ) : (
                    <Card className="p-8 text-center">
                      <div className="mb-3 flex justify-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                          <Icon
                            name="arrow-left"
                            size={24}
                            className="text-muted-foreground/40"
                          />
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        Välj en analys i listan till vänster
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Eller skapa en ny analys för att komma igång.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

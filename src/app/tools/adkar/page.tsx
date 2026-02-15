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

type Dimension = "awareness" | "desire" | "knowledge" | "ability" | "reinforcement";
type ActionStatus = "Ej påbörjad" | "Pågående" | "Klar";
type TabKey = "overview" | "assessment" | "actionplan";

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  group: string;
}

interface AdkarScore {
  stakeholderId: string;
  awareness: number;
  desire: number;
  knowledge: number;
  ability: number;
  reinforcement: number;
  notes: Record<string, string>;
}

interface Action {
  id: string;
  dimension: Dimension;
  text: string;
  responsible: string;
  targetGroup: string;
  deadline: string;
  status: ActionStatus;
}

interface ChangeProject {
  id: string;
  name: string;
  description: string;
  sponsor: string;
  startDate: string;
  stakeholders: Stakeholder[];
  scores: AdkarScore[];
  actions: Action[];
  createdAt: string;
}

interface AdkarState {
  projects: ChangeProject[];
  activeProjectId: string | null;
  activeTab: TabKey;
  showNewProject: boolean;
  showAddStakeholder: boolean;
  showAddAction: boolean;
  editingScoreId: string | null;
  expandedDimension: Dimension | null;
}

type ReducerAction =
  | { type: "LOAD_STATE"; projects: ChangeProject[] }
  | { type: "ADD_PROJECT"; project: ChangeProject }
  | { type: "UPDATE_PROJECT"; id: string; updates: Partial<ChangeProject> }
  | { type: "DELETE_PROJECT"; id: string }
  | { type: "SET_ACTIVE_PROJECT"; id: string | null }
  | { type: "SET_TAB"; tab: TabKey }
  | { type: "TOGGLE_NEW_PROJECT" }
  | { type: "TOGGLE_ADD_STAKEHOLDER" }
  | { type: "TOGGLE_ADD_ACTION" }
  | { type: "ADD_STAKEHOLDER"; projectId: string; stakeholder: Stakeholder; score: AdkarScore }
  | { type: "REMOVE_STAKEHOLDER"; projectId: string; stakeholderId: string }
  | { type: "UPDATE_SCORE"; projectId: string; stakeholderId: string; dimension: Dimension; value: number }
  | { type: "UPDATE_SCORE_NOTE"; projectId: string; stakeholderId: string; dimension: Dimension; note: string }
  | { type: "SET_EDITING_SCORE"; id: string | null }
  | { type: "ADD_ACTION"; projectId: string; action: Action }
  | { type: "UPDATE_ACTION"; projectId: string; actionId: string; updates: Partial<Action> }
  | { type: "REMOVE_ACTION"; projectId: string; actionId: string }
  | { type: "TOGGLE_DIMENSION"; dimension: Dimension | null };

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const STORAGE_KEY = "critero-adkar-v1";

const DIMENSIONS: { key: Dimension; letter: string; label: string; description: string }[] = [
  { key: "awareness", letter: "A", label: "Medvetenhet", description: "Förståelse för varför förändringen behövs" },
  { key: "desire", letter: "D", label: "Vilja", description: "Personlig motivation och önskan att delta" },
  { key: "knowledge", letter: "K", label: "Kunskap", description: "Vetskap om hur man förändrar" },
  { key: "ability", letter: "A", label: "Förmåga", description: "Faktisk förmåga att genomföra förändringen" },
  { key: "reinforcement", letter: "R", label: "Förstärkning", description: "Mekanismer för att upprätthålla förändringen" },
];

const DIMENSION_GUIDANCE: Record<Dimension, { title: string; text: string }> = {
  awareness: {
    title: "Medvetenhet",
    text: "Har personen förstått varför förändringen behövs? Nyckelfrågor: Vad förändras? Varför nu? Vad händer om vi inte förändrar?",
  },
  desire: {
    title: "Vilja",
    text: "Vill personen aktivt delta i förändringen? Nyckelfrågor: Vad vinner jag? Vilka risker ser jag? Litar jag på ledarskapet?",
  },
  knowledge: {
    title: "Kunskap",
    text: "Vet personen hur förändringen ska genomföras? Nyckelfrågor: Vilka nya färdigheter behövs? Vilken utbildning ges? Var hittar jag stöd?",
  },
  ability: {
    title: "Förmåga",
    text: "Kan personen faktiskt genomföra förändringen? Nyckelfrågor: Har jag rätt verktyg? Finns tid? Fungerar det i praktiken?",
  },
  reinforcement: {
    title: "Förstärkning",
    text: "Finns mekanismer för att bibehålla förändringen? Nyckelfrågor: Firas framgångar? Mäts resultaten? Justeras vid behov?",
  },
};

const STATUS_OPTIONS: { value: ActionStatus; label: string }[] = [
  { value: "Ej påbörjad", label: "Ej påbörjad" },
  { value: "Pågående", label: "Pågående" },
  { value: "Klar", label: "Klar" },
];

const DIMENSION_OPTIONS: { value: Dimension; label: string }[] = DIMENSIONS.map((d) => ({
  value: d.key,
  label: `${d.letter} - ${d.label}`,
}));

const TAB_ITEMS: { key: TabKey; label: string; icon: string }[] = [
  { key: "overview", label: "Översikt", icon: "layout-dashboard" },
  { key: "assessment", label: "Bedömning", icon: "clipboard-list" },
  { key: "actionplan", label: "Åtgärdsplan", icon: "flag" },
];

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function scoreColor(score: number): string {
  if (score <= 2) return "bg-red-500";
  if (score <= 3) return "bg-amber-400";
  return "bg-emerald-500";
}

function scoreTextColor(score: number): string {
  if (score <= 2) return "text-red-600 dark:text-red-400";
  if (score <= 3) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function scoreBgLight(score: number): string {
  if (score <= 2) return "bg-red-100 dark:bg-red-950/30";
  if (score <= 3) return "bg-amber-100 dark:bg-amber-950/30";
  return "bg-emerald-100 dark:bg-emerald-950/30";
}

function dimensionLabel(dim: Dimension): string {
  return DIMENSIONS.find((d) => d.key === dim)?.label ?? dim;
}

function dimensionLetter(dim: Dimension): string {
  return DIMENSIONS.find((d) => d.key === dim)?.letter ?? "?";
}

function getAverageScore(scores: AdkarScore[], dimension: Dimension): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s[dimension], 0);
  return sum / scores.length;
}

function getAllDimensionAverages(scores: AdkarScore[]): Record<Dimension, number> {
  return {
    awareness: getAverageScore(scores, "awareness"),
    desire: getAverageScore(scores, "desire"),
    knowledge: getAverageScore(scores, "knowledge"),
    ability: getAverageScore(scores, "ability"),
    reinforcement: getAverageScore(scores, "reinforcement"),
  };
}

function getBarrierPoint(averages: Record<Dimension, number>): Dimension | null {
  let minDim: Dimension | null = null;
  let minVal = Infinity;
  for (const d of DIMENSIONS) {
    if (averages[d.key] > 0 && averages[d.key] < minVal) {
      minVal = averages[d.key];
      minDim = d.key;
    }
  }
  return minDim;
}

function createEmptyProject(): ChangeProject {
  return {
    id: uid(),
    name: "",
    description: "",
    sponsor: "",
    startDate: new Date().toISOString().slice(0, 10),
    stakeholders: [],
    scores: [],
    actions: [],
    createdAt: new Date().toISOString(),
  };
}

function createEmptyScore(stakeholderId: string): AdkarScore {
  return {
    stakeholderId,
    awareness: 3,
    desire: 3,
    knowledge: 3,
    ability: 3,
    reinforcement: 3,
    notes: {},
  };
}

function createEmptyAction(): Action {
  return {
    id: uid(),
    dimension: "awareness",
    text: "",
    responsible: "",
    targetGroup: "",
    deadline: "",
    status: "Ej påbörjad",
  };
}

/* ================================================================== */
/*  Reducer                                                            */
/* ================================================================== */

function createInitialState(): AdkarState {
  return {
    projects: [],
    activeProjectId: null,
    activeTab: "overview",
    showNewProject: false,
    showAddStakeholder: false,
    showAddAction: false,
    editingScoreId: null,
    expandedDimension: null,
  };
}

function reducer(state: AdkarState, action: ReducerAction): AdkarState {
  switch (action.type) {
    case "LOAD_STATE":
      return {
        ...state,
        projects: action.projects,
        activeProjectId: action.projects.length > 0 ? action.projects[0].id : null,
      };

    case "ADD_PROJECT":
      return {
        ...state,
        projects: [...state.projects, action.project],
        activeProjectId: action.project.id,
        showNewProject: false,
      };

    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.id ? { ...p, ...action.updates } : p
        ),
      };

    case "DELETE_PROJECT": {
      const remaining = state.projects.filter((p) => p.id !== action.id);
      return {
        ...state,
        projects: remaining,
        activeProjectId:
          state.activeProjectId === action.id
            ? (remaining.length > 0 ? remaining[0].id : null)
            : state.activeProjectId,
      };
    }

    case "SET_ACTIVE_PROJECT":
      return { ...state, activeProjectId: action.id, activeTab: "overview" };

    case "SET_TAB":
      return { ...state, activeTab: action.tab };

    case "TOGGLE_NEW_PROJECT":
      return { ...state, showNewProject: !state.showNewProject };

    case "TOGGLE_ADD_STAKEHOLDER":
      return { ...state, showAddStakeholder: !state.showAddStakeholder };

    case "TOGGLE_ADD_ACTION":
      return { ...state, showAddAction: !state.showAddAction };

    case "ADD_STAKEHOLDER":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                stakeholders: [...p.stakeholders, action.stakeholder],
                scores: [...p.scores, action.score],
              }
            : p
        ),
        showAddStakeholder: false,
      };

    case "REMOVE_STAKEHOLDER":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                stakeholders: p.stakeholders.filter((s) => s.id !== action.stakeholderId),
                scores: p.scores.filter((s) => s.stakeholderId !== action.stakeholderId),
              }
            : p
        ),
        editingScoreId: state.editingScoreId === action.stakeholderId ? null : state.editingScoreId,
      };

    case "UPDATE_SCORE":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                scores: p.scores.map((s) =>
                  s.stakeholderId === action.stakeholderId
                    ? { ...s, [action.dimension]: action.value }
                    : s
                ),
              }
            : p
        ),
      };

    case "UPDATE_SCORE_NOTE":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                scores: p.scores.map((s) =>
                  s.stakeholderId === action.stakeholderId
                    ? { ...s, notes: { ...s.notes, [action.dimension]: action.note } }
                    : s
                ),
              }
            : p
        ),
      };

    case "SET_EDITING_SCORE":
      return { ...state, editingScoreId: action.id };

    case "ADD_ACTION":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? { ...p, actions: [...p.actions, action.action] }
            : p
        ),
        showAddAction: false,
      };

    case "UPDATE_ACTION":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                actions: p.actions.map((a) =>
                  a.id === action.actionId ? { ...a, ...action.updates } : a
                ),
              }
            : p
        ),
      };

    case "REMOVE_ACTION":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? { ...p, actions: p.actions.filter((a) => a.id !== action.actionId) }
            : p
        ),
      };

    case "TOGGLE_DIMENSION":
      return {
        ...state,
        expandedDimension: state.expandedDimension === action.dimension ? null : action.dimension,
      };

    default:
      return state;
  }
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- ADKAR Progress Bar ---- */

function AdkarProgressBar({ scores }: { scores: AdkarScore[] }) {
  const averages = getAllDimensionAverages(scores);
  const barrier = getBarrierPoint(averages);
  const hasData = scores.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {DIMENSIONS.map((dim, idx) => {
          const avg = hasData ? averages[dim.key] : 0;
          const isBarrier = barrier === dim.key;
          const fillPct = hasData ? (avg / 5) * 100 : 0;

          return (
            <div key={dim.key} className="relative flex-1">
              {/* Connector between segments */}
              {idx > 0 && (
                <div className="absolute -left-0.5 top-1/2 z-10 h-3 w-1 -translate-y-1/2 bg-border" />
              )}

              <div
                className={cn(
                  "relative overflow-hidden rounded-lg border-2 transition-all duration-300",
                  isBarrier
                    ? "border-red-400 dark:border-red-500 ring-2 ring-red-200 dark:ring-red-900/40"
                    : "border-border/60"
                )}
                style={{ minHeight: 56 }}
              >
                {/* Background fill */}
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-500",
                    hasData ? scoreColor(avg) : "bg-muted/30",
                    hasData ? "opacity-20" : "opacity-100"
                  )}
                  style={{ width: `${fillPct}%` }}
                />

                {/* Content */}
                <div className="relative flex flex-col items-center justify-center py-2 px-1">
                  <span className={cn(
                    "text-lg font-bold",
                    hasData ? scoreTextColor(avg) : "text-muted-foreground"
                  )}>
                    {dim.letter}
                  </span>
                  <span className={cn(
                    "text-xs font-medium",
                    hasData ? scoreTextColor(avg) : "text-muted-foreground"
                  )}>
                    {hasData ? avg.toFixed(1) : "-"}
                  </span>
                </div>

                {/* Barrier marker */}
                {isBarrier && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <div className="flex flex-col items-center">
                      <Icon name="alert-triangle" size={12} className="text-red-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Dimension label below */}
              <div className="mt-1 text-center">
                <span className="text-[10px] text-muted-foreground">{dim.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {barrier && hasData && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs">
          <Icon name="alert-triangle" size={14} className="text-red-500 shrink-0" />
          <span className="text-red-700 dark:text-red-400">
            <strong>Barriärpunkt:</strong> {dimensionLabel(barrier)} ({averages[barrier].toFixed(1)}) --
            fokusera insatser här innan ni kan gå vidare.
          </span>
        </div>
      )}
    </div>
  );
}

/* ---- Heatmap Table ---- */

function HeatmapTable({
  project,
  dispatch,
  editingScoreId,
}: {
  project: ChangeProject;
  dispatch: React.Dispatch<ReducerAction>;
  editingScoreId: string | null;
}) {
  if (project.stakeholders.length === 0) {
    return (
      <Card className="p-5">
        <p className="text-center text-sm text-muted-foreground">
          Lägg till intressenter för att visa bedömningsmatrisen.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground min-w-[160px]">
                Intressent
              </th>
              {DIMENSIONS.map((dim) => (
                <th
                  key={dim.key}
                  className="px-3 py-3 text-center text-xs font-medium text-muted-foreground min-w-[72px]"
                  title={dim.description}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold">{dim.letter}</span>
                    <span className="text-[10px]">{dim.label}</span>
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground min-w-[60px]">
                Snitt
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground min-w-[48px]" />
            </tr>
          </thead>
          <tbody>
            {project.stakeholders.map((stakeholder) => {
              const score = project.scores.find((s) => s.stakeholderId === stakeholder.id);
              if (!score) return null;
              const avg =
                (score.awareness + score.desire + score.knowledge + score.ability + score.reinforcement) / 5;
              const isEditing = editingScoreId === stakeholder.id;

              return (
                <tr key={stakeholder.id} className={cn(
                  "border-b border-border/30 transition-colors",
                  isEditing && "bg-primary/5"
                )}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{stakeholder.name}</div>
                    <div className="text-xs text-muted-foreground">{stakeholder.role}</div>
                    {stakeholder.group && (
                      <div className="text-[10px] text-muted-foreground">{stakeholder.group}</div>
                    )}
                  </td>
                  {DIMENSIONS.map((dim) => {
                    const val = score[dim.key];
                    return (
                      <td key={dim.key} className="px-1 py-2 text-center">
                        <button
                          onClick={() => {
                            if (isEditing) {
                              const next = val >= 5 ? 1 : val + 1;
                              dispatch({
                                type: "UPDATE_SCORE",
                                projectId: project.id,
                                stakeholderId: stakeholder.id,
                                dimension: dim.key,
                                value: next,
                              });
                            } else {
                              dispatch({ type: "SET_EDITING_SCORE", id: stakeholder.id });
                            }
                          }}
                          className={cn(
                            "mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all",
                            scoreBgLight(val),
                            scoreTextColor(val),
                            isEditing && "ring-2 ring-primary/40 hover:scale-110 cursor-pointer",
                            !isEditing && "cursor-pointer hover:opacity-80"
                          )}
                          title={`${dim.label}: ${val}/5 - Klicka för att ${isEditing ? "ändra" : "redigera"}`}
                        >
                          {val}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    <span className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      scoreBgLight(avg),
                      scoreTextColor(avg)
                    )}>
                      {avg.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          dispatch({
                            type: "SET_EDITING_SCORE",
                            id: isEditing ? null : stakeholder.id,
                          })
                        }
                        title={isEditing ? "Stäng redigering" : "Redigera bedömning"}
                      >
                        <Icon name={isEditing ? "check" : "pencil"} size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          dispatch({
                            type: "REMOVE_STAKEHOLDER",
                            projectId: project.id,
                            stakeholderId: stakeholder.id,
                          })
                        }
                        title="Ta bort intressent"
                      >
                        <Icon name="trash-2" size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Averages row */}
            <tr className="bg-muted/20 font-medium">
              <td className="px-4 py-3 text-xs text-muted-foreground">Genomsnitt</td>
              {DIMENSIONS.map((dim) => {
                const avg = getAverageScore(project.scores, dim.key);
                return (
                  <td key={dim.key} className="px-1 py-2 text-center">
                    <span className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                      scoreBgLight(avg),
                      scoreTextColor(avg)
                    )}>
                      {avg > 0 ? avg.toFixed(1) : "-"}
                    </span>
                  </td>
                );
              })}
              <td className="px-3 py-3 text-center">
                {(() => {
                  const avgs = getAllDimensionAverages(project.scores);
                  const vals = Object.values(avgs).filter((v) => v > 0);
                  if (vals.length === 0) return <span className="text-muted-foreground">-</span>;
                  const total = vals.reduce((a, b) => a + b, 0) / vals.length;
                  return (
                    <span className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      scoreBgLight(total),
                      scoreTextColor(total)
                    )}>
                      {total.toFixed(1)}
                    </span>
                  );
                })()}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---- Score Detail Panel (per-dimension notes when editing) ---- */

function ScoreDetailPanel({
  project,
  stakeholderId,
  dispatch,
}: {
  project: ChangeProject;
  stakeholderId: string;
  dispatch: React.Dispatch<ReducerAction>;
}) {
  const stakeholder = project.stakeholders.find((s) => s.id === stakeholderId);
  const score = project.scores.find((s) => s.stakeholderId === stakeholderId);
  if (!stakeholder || !score) return null;

  return (
    <Card className="border-primary/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="pencil" size={16} className="text-primary" />
          Detaljbedömning: {stakeholder.name}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch({ type: "SET_EDITING_SCORE", id: null })}
        >
          <Icon name="x" size={16} />
        </Button>
      </div>

      <div className="space-y-4">
        {DIMENSIONS.map((dim) => {
          const val = score[dim.key];
          const note = score.notes[dim.key] || "";

          return (
            <div key={dim.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white",
                    scoreColor(val)
                  )}>
                    {dim.letter}
                  </span>
                  {dim.label}
                </label>
                <span className={cn("text-sm font-bold", scoreTextColor(val))}>{val}/5</span>
              </div>

              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={val}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SCORE",
                    projectId: project.id,
                    stakeholderId,
                    dimension: dim.key,
                    value: Number(e.target.value),
                  })
                }
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>

              <Textarea
                placeholder={`Anteckningar om ${dim.label.toLowerCase()}...`}
                value={note}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SCORE_NOTE",
                    projectId: project.id,
                    stakeholderId,
                    dimension: dim.key,
                    note: e.target.value,
                  })
                }
                className="min-h-[48px] text-xs"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---- Spider / Radar Chart (CSS Pentagon) ---- */

function RadarChart({ scores, label }: { scores: AdkarScore[]; label: string }) {
  const averages = getAllDimensionAverages(scores);
  const hasData = scores.length > 0;

  // Pentagon with 5 axes at 72-degree intervals, starting from top
  const size = 200;
  const center = size / 2;
  const maxRadius = 80;

  function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  }

  const angles = [0, 72, 144, 216, 288];

  // Pentagon grid lines (at 20%, 40%, 60%, 80%, 100%)
  const gridLevels = [1, 2, 3, 4, 5];

  // Data points
  const dataPoints = DIMENSIONS.map((dim, i) => {
    const score = hasData ? averages[dim.key] : 0;
    const radius = (score / 5) * maxRadius;
    return polarToCartesian(angles[i], radius);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex flex-col items-center">
      <span className="mb-2 text-xs font-medium text-muted-foreground">{label}</span>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid pentagons */}
        {gridLevels.map((level) => {
          const radius = (level / 5) * maxRadius;
          const points = angles.map((a) => polarToCartesian(a, radius));
          const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return (
            <path
              key={level}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-border"
              opacity={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {angles.map((angle, i) => {
          const end = polarToCartesian(angle, maxRadius);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-border"
              opacity={0.5}
            />
          );
        })}

        {/* Data area */}
        {hasData && (
          <path
            d={dataPath}
            fill="currentColor"
            className="text-primary"
            fillOpacity={0.15}
            stroke="currentColor"
            strokeWidth={2}
            opacity={0.8}
          />
        )}

        {/* Data dots */}
        {hasData &&
          dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="currentColor"
              className="text-primary"
            />
          ))}

        {/* Dimension labels */}
        {DIMENSIONS.map((dim, i) => {
          const labelPos = polarToCartesian(angles[i], maxRadius + 18);
          const avg = hasData ? averages[dim.key] : 0;
          return (
            <text
              key={dim.key}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn("text-[11px] font-semibold", hasData ? scoreTextColor(avg) : "fill-muted-foreground")}
              fill="currentColor"
            >
              {dim.letter} ({hasData ? avg.toFixed(1) : "-"})
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ---- Dimension Guidance Expandable ---- */

function DimensionGuidance({
  expandedDimension,
  dispatch,
}: {
  expandedDimension: Dimension | null;
  dispatch: React.Dispatch<ReducerAction>;
}) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon name="book-open" size={16} className="text-primary" />
        ADKAR-vägledning
      </h3>
      <div className="space-y-1">
        {DIMENSIONS.map((dim) => {
          const guidance = DIMENSION_GUIDANCE[dim.key];
          const isExpanded = expandedDimension === dim.key;

          return (
            <div key={dim.key} className="rounded-xl border border-border/60 overflow-hidden">
              <button
                onClick={() => dispatch({ type: "TOGGLE_DIMENSION", dimension: dim.key })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
              >
                <span className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                  "bg-primary"
                )}>
                  {dim.letter}
                </span>
                <span className="flex-1 font-medium">{guidance.title}</span>
                <Icon
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  className="text-muted-foreground"
                />
              </button>
              {isExpanded && (
                <div className="border-t border-border/40 bg-muted/20 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                  {guidance.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Add Stakeholder Form ---- */

function AddStakeholderForm({
  projectId,
  dispatch,
}: {
  projectId: string;
  dispatch: React.Dispatch<ReducerAction>;
}) {
  const [form, setForm] = useState<Stakeholder>({
    id: uid(),
    name: "",
    role: "",
    group: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const stakeholder = { ...form, id: uid() };
    dispatch({
      type: "ADD_STAKEHOLDER",
      projectId,
      stakeholder,
      score: createEmptyScore(stakeholder.id),
    });
    setForm({ id: uid(), name: "", role: "", group: "" });
  };

  return (
    <Card className="border-primary/30 p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="user-plus" size={16} className="text-primary" />
            Lägg till intressent
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_ADD_STAKEHOLDER" })}
          >
            <Icon name="x" size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Namn *"
            placeholder="T.ex. Anna Johansson"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Roll/Titel"
            placeholder="T.ex. Projektledare"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <Input
            label="Grupp"
            placeholder="T.ex. Ledningsgruppen"
            value={form.group}
            onChange={(e) => setForm({ ...form, group: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={!form.name.trim()}>
            <Icon name="plus" size={14} /> Lägg till
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch({ type: "TOGGLE_ADD_STAKEHOLDER" })}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ---- Add Action Form ---- */

function AddActionForm({
  projectId,
  dispatch,
}: {
  projectId: string;
  dispatch: React.Dispatch<ReducerAction>;
}) {
  const [form, setForm] = useState<Action>(createEmptyAction);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    dispatch({
      type: "ADD_ACTION",
      projectId,
      action: { ...form, id: uid() },
    });
    setForm(createEmptyAction());
  };

  return (
    <Card className="border-primary/30 p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="plus-circle" size={16} className="text-primary" />
            Lägg till åtgärd
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_ADD_ACTION" })}
          >
            <Icon name="x" size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Dimension"
            options={DIMENSION_OPTIONS}
            value={form.dimension}
            onChange={(e) => setForm({ ...form, dimension: e.target.value as Dimension })}
          />
          <Input
            label="Ansvarig"
            placeholder="Namn eller roll"
            value={form.responsible}
            onChange={(e) => setForm({ ...form, responsible: e.target.value })}
          />
          <Input
            label="Målgrupp"
            placeholder="T.ex. Alla chefer"
            value={form.targetGroup}
            onChange={(e) => setForm({ ...form, targetGroup: e.target.value })}
          />
          <Input
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </div>

        <Textarea
          label="Åtgärdsbeskrivning *"
          placeholder="Beskriv åtgärden som ska genomföras..."
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={!form.text.trim()}>
            <Icon name="plus" size={14} /> Lägg till åtgärd
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch({ type: "TOGGLE_ADD_ACTION" })}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ---- Action Plan Table ---- */

function ActionPlanTable({
  project,
  dispatch,
}: {
  project: ChangeProject;
  dispatch: React.Dispatch<ReducerAction>;
}) {
  const actionsByDimension = DIMENSIONS.map((dim) => ({
    dimension: dim,
    actions: project.actions.filter((a) => a.dimension === dim.key),
  })).filter((group) => group.actions.length > 0);

  const totalActions = project.actions.length;
  const completedActions = project.actions.filter((a) => a.status === "Klar").length;
  const inProgressActions = project.actions.filter((a) => a.status === "Pågående").length;

  if (totalActions === 0) {
    return (
      <Card className="p-5">
        <p className="text-center text-sm text-muted-foreground">
          Inga åtgärder tillagda ännu. Klicka &quot;Lägg till åtgärd&quot; för att börja.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name="clipboard-list" size={14} />
            </span>
            Totalt
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{totalActions}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
              <Icon name="clock" size={14} />
            </span>
            Pågående
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{inProgressActions}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
              <Icon name="check-circle" size={14} />
            </span>
            Klara
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{completedActions}</div>
        </Card>
      </div>

      {/* Overall progress bar */}
      {totalActions > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Genomförande</span>
            <span>{Math.round((completedActions / totalActions) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(completedActions / totalActions) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Grouped by dimension */}
      {actionsByDimension.map(({ dimension, actions }) => (
        <div key={dimension.key}>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white bg-primary"
            )}>
              {dimension.letter}
            </span>
            {dimension.label}
            <span className="text-xs font-normal text-muted-foreground">({actions.length} åtgärder)</span>
          </h4>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Åtgärd</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Ansvarig</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Målgrupp</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Deadline</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action) => (
                    <tr key={action.id} className="border-b border-border/30">
                      <td className="px-4 py-3 max-w-[240px]">
                        <span className="text-sm">{action.text}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{action.responsible || "-"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{action.targetGroup || "-"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{action.deadline || "-"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={action.status}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_ACTION",
                              projectId: project.id,
                              actionId: action.id,
                              updates: { status: e.target.value as ActionStatus },
                            })
                          }
                          className={cn(
                            "rounded-lg border border-input bg-card px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring/40",
                            action.status === "Klar" && "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400",
                            action.status === "Pågående" && "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            dispatch({
                              type: "REMOVE_ACTION",
                              projectId: project.id,
                              actionId: action.id,
                            })
                          }
                          title="Ta bort åtgärd"
                        >
                          <Icon name="trash-2" size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

/* ---- New Project Form ---- */

function NewProjectForm({
  dispatch,
}: {
  dispatch: React.Dispatch<ReducerAction>;
}) {
  const [form, setForm] = useState<ChangeProject>(createEmptyProject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    dispatch({ type: "ADD_PROJECT", project: { ...form, id: uid(), createdAt: new Date().toISOString() } });
    setForm(createEmptyProject());
  };

  return (
    <Card className="border-primary/30 p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="plus-circle" size={16} className="text-primary" />
            Nytt förändringsprojekt
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_NEW_PROJECT" })}
          >
            <Icon name="x" size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Projektnamn *"
            placeholder="T.ex. Nytt upphandlingssystem"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Sponsor / Ägare"
            placeholder="T.ex. IT-chef Maria Svensson"
            value={form.sponsor}
            onChange={(e) => setForm({ ...form, sponsor: e.target.value })}
          />
          <Input
            label="Startdatum"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>

        <Textarea
          label="Beskrivning"
          placeholder="Beskriv förändringen som ska genomföras..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={!form.name.trim()}>
            <Icon name="plus" size={14} /> Skapa projekt
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch({ type: "TOGGLE_NEW_PROJECT" })}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ---- Overview Tab ---- */

function OverviewTab({
  project,
  dispatch,
  expandedDimension,
}: {
  project: ChangeProject;
  dispatch: React.Dispatch<ReducerAction>;
  expandedDimension: Dimension | null;
}) {
  const averages = getAllDimensionAverages(project.scores);
  const barrier = getBarrierPoint(averages);
  const hasScores = project.scores.length > 0;

  const totalActions = project.actions.length;
  const completedActions = project.actions.filter((a) => a.status === "Klar").length;

  return (
    <div className="space-y-6">
      {/* Project info */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">{project.name}</h2>
            {project.description && (
              <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {project.sponsor && (
                <span className="flex items-center gap-1">
                  <Icon name="user" size={12} />
                  Sponsor: {project.sponsor}
                </span>
              )}
              {project.startDate && (
                <span className="flex items-center gap-1">
                  <Icon name="clock" size={12} />
                  Start: {project.startDate}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Icon name="users" size={12} />
                {project.stakeholders.length} intressenter
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (confirm("Är du säker på att du vill ta bort detta projekt?")) {
                dispatch({ type: "DELETE_PROJECT", id: project.id });
              }
            }}
            title="Ta bort projekt"
          >
            <Icon name="trash-2" size={16} />
          </Button>
        </div>
      </Card>

      {/* ADKAR Progress Bar */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Icon name="activity" size={16} className="text-primary" />
          ADKAR-profil
        </h3>
        <Card className="p-5">
          <AdkarProgressBar scores={project.scores} />
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name="users" size={14} />
            </span>
            Intressenter
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{project.stakeholders.length}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name="bar-chart-3" size={14} />
            </span>
            Snittvärde
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight">
            {hasScores
              ? (Object.values(averages).reduce((a, b) => a + b, 0) / 5).toFixed(1)
              : "-"}
          </div>
        </Card>

        <Card className={cn("p-4", barrier && "border-red-300 dark:border-red-800")}>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-lg",
              barrier
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-primary/10 text-primary"
            )}>
              <Icon name="alert-triangle" size={14} />
            </span>
            Barriär
          </div>
          <div className="mt-1 text-sm font-semibold">
            {barrier ? (
              <span className="text-red-600 dark:text-red-400">
                {dimensionLabel(barrier)} ({averages[barrier].toFixed(1)})
              </span>
            ) : (
              <span className="text-muted-foreground">Ingen data</span>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
              <Icon name="check-circle" size={14} />
            </span>
            Åtgärder
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight">
            {completedActions}/{totalActions}
          </div>
        </Card>
      </div>

      {/* Radar chart + Barrier analysis side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex items-center justify-center p-5">
          <RadarChart scores={project.scores} label="Genomsnittlig ADKAR-profil" />
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Icon name="search" size={16} className="text-primary" />
            Barriäranalys
          </h3>
          {!hasScores ? (
            <p className="text-sm text-muted-foreground">
              Lägg till intressenter och bedöm dem för att se barriäranalysen.
            </p>
          ) : (
            <div className="space-y-3">
              {DIMENSIONS.map((dim) => {
                const avg = averages[dim.key];
                const isBarrier = barrier === dim.key;
                const pct = (avg / 5) * 100;

                return (
                  <div key={dim.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium">
                        <span className={cn(
                          "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white",
                          scoreColor(avg)
                        )}>
                          {dim.letter}
                        </span>
                        {dim.label}
                        {isBarrier && (
                          <span className="rounded-full bg-red-100 dark:bg-red-950/30 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                            Barriär
                          </span>
                        )}
                      </span>
                      <span className={cn("font-bold", scoreTextColor(avg))}>
                        {avg.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", scoreColor(avg))}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Guidance */}
      <DimensionGuidance expandedDimension={expandedDimension} dispatch={dispatch} />
    </div>
  );
}

/* ---- Assessment Tab ---- */

function AssessmentTab({
  project,
  dispatch,
  editingScoreId,
}: {
  project: ChangeProject;
  dispatch: React.Dispatch<ReducerAction>;
  editingScoreId: string | null;
}) {
  return (
    <div className="space-y-6">
      {/* Add stakeholder button */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="clipboard-list" size={16} className="text-primary" />
          Intressentbedömning
        </h3>
        <Button
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_ADD_STAKEHOLDER" })}
        >
          <Icon name="user-plus" size={14} /> Lägg till intressent
        </Button>
      </div>

      {/* Heatmap */}
      <HeatmapTable
        project={project}
        dispatch={dispatch}
        editingScoreId={editingScoreId}
      />

      {/* Score detail panel when editing */}
      {editingScoreId && (
        <ScoreDetailPanel
          project={project}
          stakeholderId={editingScoreId}
          dispatch={dispatch}
        />
      )}

      {/* Group-level radar charts */}
      {project.stakeholders.length > 0 && (() => {
        const groups = Array.from(new Set(project.stakeholders.map((s) => s.group).filter(Boolean)));
        if (groups.length === 0) return null;

        return (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Icon name="bar-chart-3" size={16} className="text-primary" />
              ADKAR-profil per grupp
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => {
                const groupStakeholders = project.stakeholders.filter((s) => s.group === group);
                const groupScores = project.scores.filter((sc) =>
                  groupStakeholders.some((s) => s.id === sc.stakeholderId)
                );
                return (
                  <Card key={group} className="p-4">
                    <RadarChart scores={groupScores} label={group} />
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ADKAR Progress Bar (compact) */}
      {project.scores.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Icon name="activity" size={16} className="text-primary" />
            Samlad ADKAR-profil
          </h3>
          <AdkarProgressBar scores={project.scores} />
        </Card>
      )}
    </div>
  );
}

/* ---- Action Plan Tab ---- */

function ActionPlanTab({
  project,
  dispatch,
}: {
  project: ChangeProject;
  dispatch: React.Dispatch<ReducerAction>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="flag" size={16} className="text-primary" />
          Åtgärdsplan
        </h3>
        <Button
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_ADD_ACTION" })}
        >
          <Icon name="plus" size={14} /> Lägg till åtgärd
        </Button>
      </div>

      <ActionPlanTable project={project} dispatch={dispatch} />
    </div>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

export default function AdkarPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "LOAD_STATE", projects: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects));
    } catch {
      // localStorage full or unavailable
    }
  }, [state.projects, loaded]);

  const activeProject = state.projects.find((p) => p.id === state.activeProjectId) ?? null;

  /* ---- Export handlers ---- */

  const handleExportJson = useCallback(() => {
    if (!activeProject) return;
    const exportData = {
      exportDate: new Date().toISOString(),
      tool: "ADKAR Förändringsledning",
      project: activeProject,
    };
    exportToJson(
      `adkar-${activeProject.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`,
      exportData
    );
  }, [activeProject]);

  const handleExportXlsx = useCallback(async () => {
    if (!activeProject) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "ADKAR Förändringsledning",
      exportDate: dateStr,
      subtitle: activeProject.name,
    };

    const stakeholderRows: (string | number)[][] = activeProject.stakeholders.map((s) => {
      const score = activeProject.scores.find((sc) => sc.stakeholderId === s.id);
      if (!score) return [s.name, s.role, s.group, "-", "-", "-", "-", "-", "-"];
      const avg = (score.awareness + score.desire + score.knowledge + score.ability + score.reinforcement) / 5;
      return [
        s.name,
        s.role,
        s.group,
        score.awareness,
        score.desire,
        score.knowledge,
        score.ability,
        score.reinforcement,
        Number(avg.toFixed(1)),
      ];
    });

    const actionRows: (string | number)[][] = activeProject.actions.map((a) => [
      dimensionLabel(a.dimension),
      a.text,
      a.responsible,
      a.targetGroup,
      a.deadline,
      a.status,
    ]);

    const sheets: ExportSheet[] = [
      {
        name: "ADKAR Bedömning",
        headers: ["Namn", "Roll", "Grupp", "Medvetenhet", "Vilja", "Kunskap", "Förmåga", "Förstärkning", "Snitt"],
        rows: stakeholderRows,
      },
      {
        name: "Åtgärdsplan",
        headers: ["Dimension", "Åtgärd", "Ansvarig", "Målgrupp", "Deadline", "Status"],
        rows: actionRows,
      },
    ];

    await exportToXlsx(
      `adkar-${activeProject.name.replace(/\s+/g, "-").toLowerCase()}-${dateStr}.xlsx`,
      sheets,
      metadata
    );
  }, [activeProject]);

  const handleExportPdf = useCallback(async () => {
    if (!activeProject) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "ADKAR Förändringsledning",
      exportDate: dateStr,
      subtitle: activeProject.name,
    };

    const averages = getAllDimensionAverages(activeProject.scores);
    const barrier = getBarrierPoint(averages);

    const sections: PdfSection[] = [
      {
        title: "Projektinformation",
        type: "keyvalue",
        pairs: [
          { label: "Projektnamn", value: activeProject.name },
          { label: "Beskrivning", value: activeProject.description || "-" },
          { label: "Sponsor", value: activeProject.sponsor || "-" },
          { label: "Startdatum", value: activeProject.startDate || "-" },
          { label: "Barriärpunkt", value: barrier ? `${dimensionLabel(barrier)} (${averages[barrier].toFixed(1)})` : "Ingen identifierad" },
        ],
      },
      {
        title: "ADKAR Genomsnitt",
        type: "table",
        headers: ["Dimension", "Medelvärde", "Färgnivå"],
        rows: DIMENSIONS.map((dim) => {
          const avg = averages[dim.key];
          const level = avg <= 2 ? "Röd (Kritisk)" : avg <= 3 ? "Gul (Varning)" : "Grön (Bra)";
          return [dim.label, avg > 0 ? avg.toFixed(1) : "-", level];
        }),
      },
      {
        title: "Intressentbedömning",
        type: "table",
        headers: ["Namn", "Roll", "Grupp", "A", "D", "K", "A", "R", "Snitt"],
        rows: activeProject.stakeholders.map((s) => {
          const score = activeProject.scores.find((sc) => sc.stakeholderId === s.id);
          if (!score) return [s.name, s.role, s.group, "-", "-", "-", "-", "-", "-"];
          const avg = (score.awareness + score.desire + score.knowledge + score.ability + score.reinforcement) / 5;
          return [
            s.name,
            s.role,
            s.group,
            score.awareness,
            score.desire,
            score.knowledge,
            score.ability,
            score.reinforcement,
            avg.toFixed(1),
          ];
        }),
      },
      {
        title: "Åtgärdsplan",
        type: "table",
        headers: ["Dimension", "Åtgärd", "Ansvarig", "Målgrupp", "Deadline", "Status"],
        rows: activeProject.actions.map((a) => [
          dimensionLabel(a.dimension),
          a.text,
          a.responsible,
          a.targetGroup,
          a.deadline,
          a.status,
        ]),
      },
    ];

    await exportToPdf(
      `adkar-${activeProject.name.replace(/\s+/g, "-").toLowerCase()}-${dateStr}.pdf`,
      sections,
      metadata
    );
  }, [activeProject]);

  return (
    <FeatureGate featureKey="verktyg.adkar">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="border-b border-border/60 px-6 py-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Upphandlingar</span>
            <span>/</span>
            <span>Verktyg</span>
            <span>/</span>
            <span className="text-foreground">ADKAR Förändringsledning</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="refresh-cw" size={20} />
            </span>
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight">ADKAR Förändringsledning</h1>
              <p className="text-xs text-muted-foreground">
                Bedöm och hantera förändringsberedskap med Proscis ADKAR-modell
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportJson} disabled={!activeProject}>
                <Icon name="external-link" size={14} /> JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportXlsx} disabled={!activeProject}>
                <Icon name="file-text" size={14} /> Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={!activeProject}>
                <Icon name="file-text" size={14} /> PDF
              </Button>
              <Button
                size="sm"
                onClick={() => dispatch({ type: "TOGGLE_NEW_PROJECT" })}
              >
                <Icon name="plus" size={14} /> Nytt projekt
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* New project form */}
            {state.showNewProject && <NewProjectForm dispatch={dispatch} />}

            {/* Project selector */}
            {state.projects.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Projekt:</span>
                {state.projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => dispatch({ type: "SET_ACTIVE_PROJECT", id: p.id })}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-sm font-medium transition-all",
                      p.id === state.activeProjectId
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {p.name || "Namnlöst projekt"}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {state.projects.length === 0 && !state.showNewProject && (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                    <Icon name="refresh-cw" size={28} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight mb-2">
                    Kom igång med ADKAR
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md mb-4">
                    ADKAR-modellen hjälper dig att bedöma och hantera förändringsberedskap hos
                    intressenter genom fem dimensioner: Medvetenhet, Vilja, Kunskap, Förmåga och
                    Förstärkning.
                  </p>
                  <Button onClick={() => dispatch({ type: "TOGGLE_NEW_PROJECT" })}>
                    <Icon name="plus" size={14} /> Skapa ditt första projekt
                  </Button>
                </div>
              </Card>
            )}

            {/* Active project content */}
            {activeProject && (
              <>
                {/* Tab bar */}
                <div className="flex items-center gap-1 border-b border-border/60 pb-0">
                  {TAB_ITEMS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => dispatch({ type: "SET_TAB", tab: tab.key })}
                      className={cn(
                        "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                        state.activeTab === tab.key
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      <Icon name={tab.icon} size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Add stakeholder form (assessment tab) */}
                {state.showAddStakeholder && state.activeTab === "assessment" && (
                  <AddStakeholderForm projectId={activeProject.id} dispatch={dispatch} />
                )}

                {/* Add action form (actionplan tab) */}
                {state.showAddAction && state.activeTab === "actionplan" && (
                  <AddActionForm projectId={activeProject.id} dispatch={dispatch} />
                )}

                {/* Tab content */}
                {state.activeTab === "overview" && (
                  <OverviewTab project={activeProject} dispatch={dispatch} expandedDimension={state.expandedDimension} />
                )}

                {state.activeTab === "assessment" && (
                  <AssessmentTab
                    project={activeProject}
                    dispatch={dispatch}
                    editingScoreId={state.editingScoreId}
                  />
                )}

                {state.activeTab === "actionplan" && (
                  <ActionPlanTab project={activeProject} dispatch={dispatch} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

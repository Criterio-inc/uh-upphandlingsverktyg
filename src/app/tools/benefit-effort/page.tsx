"use client";

import { useReducer, useEffect, useState, useCallback, useRef } from "react";
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

type InitiativeStatus = "Ny" | "Beslutad" | "Pågående" | "Klar" | "Parkerad";
type InitiativePriority = "Hög" | "Medel" | "Låg";
type InitiativeCategory =
  | "Digitalisering"
  | "Organisation"
  | "Process"
  | "Upphandling"
  | "Utbildning"
  | "Infrastruktur"
  | "Annat";

interface Initiative {
  id: string;
  title: string;
  description: string;
  benefit: number; // 1-10
  effort: number; // 1-10
  category: InitiativeCategory;
  status: InitiativeStatus;
  priority: InitiativePriority;
  estimatedCost: string;
  estimatedTime: string;
  responsible: string;
  notes: string;
}

interface BenefitEffortState {
  initiatives: Initiative[];
  selectedInitiativeId: string | null;
  editingInitiativeId: string | null;
  filterCategory: string;
  filterStatus: string;
}

type Action =
  | { type: "ADD_INITIATIVE" }
  | { type: "REMOVE_INITIATIVE"; id: string }
  | { type: "UPDATE_INITIATIVE"; id: string; field: keyof Initiative; value: unknown }
  | { type: "SELECT_INITIATIVE"; id: string | null }
  | { type: "EDIT_INITIATIVE"; id: string | null }
  | { type: "SET_FILTER_CATEGORY"; value: string }
  | { type: "SET_FILTER_STATUS"; value: string }
  | { type: "LOAD_STATE"; state: BenefitEffortState }
  | { type: "RESET" };

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const CATEGORIES: { value: InitiativeCategory; label: string }[] = [
  { value: "Digitalisering", label: "Digitalisering" },
  { value: "Organisation", label: "Organisation" },
  { value: "Process", label: "Process" },
  { value: "Upphandling", label: "Upphandling" },
  { value: "Utbildning", label: "Utbildning" },
  { value: "Infrastruktur", label: "Infrastruktur" },
  { value: "Annat", label: "Annat" },
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

const STATUS_OPTIONS: { value: InitiativeStatus; label: string }[] = [
  { value: "Ny", label: "Ny" },
  { value: "Beslutad", label: "Beslutad" },
  { value: "Pågående", label: "Pågående" },
  { value: "Klar", label: "Klar" },
  { value: "Parkerad", label: "Parkerad" },
];

const PRIORITY_OPTIONS: { value: InitiativePriority; label: string }[] = [
  { value: "Hög", label: "Hög" },
  { value: "Medel", label: "Medel" },
  { value: "Låg", label: "Låg" },
];

const CATEGORY_ICONS: Record<InitiativeCategory, string> = {
  Digitalisering: "monitor",
  Organisation: "users",
  Process: "git-branch",
  Upphandling: "gavel",
  Utbildning: "graduation-cap",
  Infrastruktur: "server-cog",
  Annat: "folder",
};

const CATEGORY_COLORS: Record<InitiativeCategory, string> = {
  Digitalisering: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Organisation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Process: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Upphandling: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Utbildning: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Infrastruktur: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Annat: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
};

const CATEGORY_DOT_COLORS: Record<InitiativeCategory, string> = {
  Digitalisering: "bg-blue-500",
  Organisation: "bg-amber-500",
  Process: "bg-purple-500",
  Upphandling: "bg-emerald-500",
  Utbildning: "bg-cyan-500",
  Infrastruktur: "bg-rose-500",
  Annat: "bg-gray-500",
};

const STATUS_COLORS: Record<InitiativeStatus, string> = {
  Ny: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  Beslutad: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Pågående: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Klar: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Parkerad: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const PRIORITY_COLORS: Record<InitiativePriority, string> = {
  Hög: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Medel: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Låg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const STORAGE_KEY = "critero-benefit-effort-v1";

/* ================================================================== */
/*  Quadrant definitions                                               */
/* ================================================================== */

interface QuadrantDef {
  key: string;
  label: string;
  strategy: string;
  action: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconName: string;
}

const QUADRANTS: Record<string, QuadrantDef> = {
  "quick-wins": {
    key: "quick-wins",
    label: "Snabba vinster",
    strategy: "GÖR FÖRST",
    action: "Hög nytta, låg insats",
    bgClass: "bg-green-50/50 dark:bg-green-950/20",
    borderClass: "border-green-200/60 dark:border-green-800/40",
    textClass: "text-green-900 dark:text-green-400",
    iconName: "zap",
  },
  "strategic": {
    key: "strategic",
    label: "Stora projekt",
    strategy: "PLANERA",
    action: "Hög nytta, hög insats",
    bgClass: "bg-blue-50/50 dark:bg-blue-950/20",
    borderClass: "border-blue-200/60 dark:border-blue-800/40",
    textClass: "text-blue-900 dark:text-blue-400",
    iconName: "rocket",
  },
  "fill-in": {
    key: "fill-in",
    label: "Utfyllnadsprojekt",
    strategy: "ÖVERVÄG",
    action: "Låg nytta, låg insats",
    bgClass: "bg-yellow-50/50 dark:bg-yellow-950/20",
    borderClass: "border-yellow-200/60 dark:border-yellow-800/40",
    textClass: "text-yellow-900 dark:text-yellow-400",
    iconName: "clock",
  },
  "avoid": {
    key: "avoid",
    label: "Tidsslukare",
    strategy: "UNDVIK",
    action: "Låg nytta, hög insats",
    bgClass: "bg-red-50/50 dark:bg-red-950/20",
    borderClass: "border-red-200/60 dark:border-red-800/40",
    textClass: "text-red-900 dark:text-red-400",
    iconName: "alert-triangle",
  },
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getQuadrant(initiative: Initiative): QuadrantDef {
  const highBenefit = initiative.benefit > 5;
  const highEffort = initiative.effort > 5;

  if (highBenefit && !highEffort) return QUADRANTS["quick-wins"];
  if (highBenefit && highEffort) return QUADRANTS["strategic"];
  if (!highBenefit && !highEffort) return QUADRANTS["fill-in"];
  return QUADRANTS["avoid"];
}

function getQuadrantKey(initiative: Initiative): string {
  return getQuadrant(initiative).key;
}

function getBenefitLabel(value: number): string {
  if (value <= 2) return "Minimal";
  if (value <= 4) return "Låg";
  if (value <= 6) return "Måttlig";
  if (value <= 8) return "Hög";
  return "Transformativ";
}

function getEffortLabel(value: number): string {
  if (value <= 2) return "Minimal";
  if (value <= 4) return "Låg";
  if (value <= 6) return "Måttlig";
  if (value <= 8) return "Hög";
  return "Mycket hög";
}

function getEfficiencyScore(initiative: Initiative): number {
  if (initiative.effort === 0) return initiative.benefit;
  return Math.round((initiative.benefit / initiative.effort) * 100) / 100;
}

/* ================================================================== */
/*  Initial state & reducer                                            */
/* ================================================================== */

function createInitialState(): BenefitEffortState {
  return {
    initiatives: [],
    selectedInitiativeId: null,
    editingInitiativeId: null,
    filterCategory: "",
    filterStatus: "",
  };
}

function reducer(state: BenefitEffortState, action: Action): BenefitEffortState {
  switch (action.type) {
    case "ADD_INITIATIVE": {
      const newInitiative: Initiative = {
        id: uid(),
        title: "",
        description: "",
        benefit: 5,
        effort: 5,
        category: "Annat",
        status: "Ny",
        priority: "Medel",
        estimatedCost: "",
        estimatedTime: "",
        responsible: "",
        notes: "",
      };
      return {
        ...state,
        initiatives: [...state.initiatives, newInitiative],
        editingInitiativeId: newInitiative.id,
        selectedInitiativeId: newInitiative.id,
      };
    }

    case "REMOVE_INITIATIVE":
      return {
        ...state,
        initiatives: state.initiatives.filter((i) => i.id !== action.id),
        selectedInitiativeId:
          state.selectedInitiativeId === action.id ? null : state.selectedInitiativeId,
        editingInitiativeId:
          state.editingInitiativeId === action.id ? null : state.editingInitiativeId,
      };

    case "UPDATE_INITIATIVE":
      return {
        ...state,
        initiatives: state.initiatives.map((i) =>
          i.id === action.id ? { ...i, [action.field]: action.value } : i
        ),
      };

    case "SELECT_INITIATIVE":
      return { ...state, selectedInitiativeId: action.id };

    case "EDIT_INITIATIVE":
      return { ...state, editingInitiativeId: action.id };

    case "SET_FILTER_CATEGORY":
      return { ...state, filterCategory: action.value };

    case "SET_FILTER_STATUS":
      return { ...state, filterStatus: action.value };

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

/* ---- Matrix Visualization ---- */

function MatrixVisualization({
  initiatives,
  selectedInitiativeId,
  onSelectInitiative,
}: {
  initiatives: Initiative[];
  selectedInitiativeId: string | null;
  onSelectInitiative: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleDotMouseEnter = useCallback(
    (e: React.MouseEvent, id: string) => {
      setHoveredId(id);
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setTooltipPos({
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top,
        });
      }
    },
    []
  );

  const handleDotMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltipPos(null);
  }, []);

  const hoveredInitiative = hoveredId
    ? initiatives.find((i) => i.id === hoveredId) ?? null
    : null;

  return (
    <Card className="p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon name="target" size={16} className="text-primary" />
        Nytto-insats-matris
      </h3>

      <div ref={containerRef} className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider">
            NYTTA
          </span>
        </div>

        {/* Main matrix area */}
        <div className="ml-6">
          {/* Y-axis scale labels */}
          <div className="flex">
            <div className="w-8 shrink-0 flex flex-col justify-between pr-1 py-1">
              <span className="text-[10px] text-muted-foreground text-right">10</span>
              <span className="text-[10px] text-muted-foreground text-right">8</span>
              <span className="text-[10px] text-muted-foreground text-right">6</span>
              <span className="text-[10px] text-muted-foreground text-right">5</span>
              <span className="text-[10px] text-muted-foreground text-right">4</span>
              <span className="text-[10px] text-muted-foreground text-right">2</span>
              <span className="text-[10px] text-muted-foreground text-right">1</span>
            </div>

            {/* 2x2 quadrant grid */}
            <div className="flex-1 grid grid-cols-2 grid-rows-2 border border-border/60 rounded-xl overflow-hidden"
              style={{ aspectRatio: "1.4 / 1", minHeight: 340 }}
            >
              {/* Top-Left: Quick Wins (Hog nytta, Lag insats) */}
              <div className={cn(
                "relative border-r border-b border-border/40 p-3",
                QUADRANTS["quick-wins"].bgClass,
              )}>
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1.5">
                    <Icon name={QUADRANTS["quick-wins"].iconName} size={12} className={QUADRANTS["quick-wins"].textClass} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", QUADRANTS["quick-wins"].textClass)}>
                      {QUADRANTS["quick-wins"].strategy}
                    </span>
                  </div>
                  <p className={cn("text-[10px] mt-0.5", QUADRANTS["quick-wins"].textClass, "opacity-70")}>
                    {QUADRANTS["quick-wins"].label}
                  </p>
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical midline */}
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-border/20" />
                  {/* Horizontal midline */}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border/20" />
                </div>

                {/* Initiative dots for this quadrant */}
                {initiatives
                  .filter((i) => getQuadrantKey(i) === "quick-wins")
                  .map((initiative) => {
                    // Position within this quadrant: effort 1-5 maps to X 0%-100%, benefit 6-10 maps to Y 100%-0%
                    const xPercent = ((initiative.effort - 1) / 4) * 100;
                    const yPercent = ((10 - initiative.benefit) / 4) * 100;
                    const isSelected = selectedInitiativeId === initiative.id;

                    return (
                      <button
                        key={initiative.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInitiative(isSelected ? null : initiative.id);
                        }}
                        onMouseEnter={(e) => handleDotMouseEnter(e, initiative.id)}
                        onMouseLeave={handleDotMouseLeave}
                        className={cn(
                          "absolute z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-150",
                          CATEGORY_DOT_COLORS[initiative.category],
                          isSelected
                            ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-125 z-20"
                            : "hover:scale-110",
                        )}
                        style={{
                          left: `calc(${Math.min(Math.max(xPercent, 8), 92)}% - 14px)`,
                          top: `calc(${Math.min(Math.max(yPercent, 8), 92)}% - 14px)`,
                        }}
                        title={initiative.title || "Namnlöst initiativ"}
                      >
                        <span className="text-[9px] font-bold text-white">
                          {initiative.title ? initiative.title.charAt(0).toUpperCase() : "?"}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {/* Top-Right: Strategic (Hog nytta, Hog insats) */}
              <div className={cn(
                "relative border-b border-border/40 p-3",
                QUADRANTS["strategic"].bgClass,
              )}>
                <div className="absolute top-2 right-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", QUADRANTS["strategic"].textClass)}>
                      {QUADRANTS["strategic"].strategy}
                    </span>
                    <Icon name={QUADRANTS["strategic"].iconName} size={12} className={QUADRANTS["strategic"].textClass} />
                  </div>
                  <p className={cn("text-[10px] mt-0.5", QUADRANTS["strategic"].textClass, "opacity-70")}>
                    {QUADRANTS["strategic"].label}
                  </p>
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-border/20" />
                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border/20" />
                </div>

                {initiatives
                  .filter((i) => getQuadrantKey(i) === "strategic")
                  .map((initiative) => {
                    const xPercent = ((initiative.effort - 6) / 4) * 100;
                    const yPercent = ((10 - initiative.benefit) / 4) * 100;
                    const isSelected = selectedInitiativeId === initiative.id;

                    return (
                      <button
                        key={initiative.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInitiative(isSelected ? null : initiative.id);
                        }}
                        onMouseEnter={(e) => handleDotMouseEnter(e, initiative.id)}
                        onMouseLeave={handleDotMouseLeave}
                        className={cn(
                          "absolute z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-150",
                          CATEGORY_DOT_COLORS[initiative.category],
                          isSelected
                            ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-125 z-20"
                            : "hover:scale-110",
                        )}
                        style={{
                          left: `calc(${Math.min(Math.max(xPercent, 8), 92)}% - 14px)`,
                          top: `calc(${Math.min(Math.max(yPercent, 8), 92)}% - 14px)`,
                        }}
                        title={initiative.title || "Namnlöst initiativ"}
                      >
                        <span className="text-[9px] font-bold text-white">
                          {initiative.title ? initiative.title.charAt(0).toUpperCase() : "?"}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {/* Bottom-Left: Fill-in (Lag nytta, Lag insats) */}
              <div className={cn(
                "relative border-r border-border/40 p-3",
                QUADRANTS["fill-in"].bgClass,
              )}>
                <div className="absolute bottom-2 left-2">
                  <div className="flex items-center gap-1.5">
                    <Icon name={QUADRANTS["fill-in"].iconName} size={12} className={QUADRANTS["fill-in"].textClass} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", QUADRANTS["fill-in"].textClass)}>
                      {QUADRANTS["fill-in"].strategy}
                    </span>
                  </div>
                  <p className={cn("text-[10px] mt-0.5", QUADRANTS["fill-in"].textClass, "opacity-70")}>
                    {QUADRANTS["fill-in"].label}
                  </p>
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-border/20" />
                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border/20" />
                </div>

                {initiatives
                  .filter((i) => getQuadrantKey(i) === "fill-in")
                  .map((initiative) => {
                    const xPercent = ((initiative.effort - 1) / 4) * 100;
                    const yPercent = ((5 - initiative.benefit) / 4) * 100;
                    const isSelected = selectedInitiativeId === initiative.id;

                    return (
                      <button
                        key={initiative.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInitiative(isSelected ? null : initiative.id);
                        }}
                        onMouseEnter={(e) => handleDotMouseEnter(e, initiative.id)}
                        onMouseLeave={handleDotMouseLeave}
                        className={cn(
                          "absolute z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-150",
                          CATEGORY_DOT_COLORS[initiative.category],
                          isSelected
                            ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-125 z-20"
                            : "hover:scale-110",
                        )}
                        style={{
                          left: `calc(${Math.min(Math.max(xPercent, 8), 92)}% - 14px)`,
                          top: `calc(${Math.min(Math.max(yPercent, 8), 92)}% - 14px)`,
                        }}
                        title={initiative.title || "Namnlöst initiativ"}
                      >
                        <span className="text-[9px] font-bold text-white">
                          {initiative.title ? initiative.title.charAt(0).toUpperCase() : "?"}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {/* Bottom-Right: Avoid (Lag nytta, Hog insats) */}
              <div className={cn(
                "relative p-3",
                QUADRANTS["avoid"].bgClass,
              )}>
                <div className="absolute bottom-2 right-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", QUADRANTS["avoid"].textClass)}>
                      {QUADRANTS["avoid"].strategy}
                    </span>
                    <Icon name={QUADRANTS["avoid"].iconName} size={12} className={QUADRANTS["avoid"].textClass} />
                  </div>
                  <p className={cn("text-[10px] mt-0.5", QUADRANTS["avoid"].textClass, "opacity-70")}>
                    {QUADRANTS["avoid"].label}
                  </p>
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-border/20" />
                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border/20" />
                </div>

                {initiatives
                  .filter((i) => getQuadrantKey(i) === "avoid")
                  .map((initiative) => {
                    const xPercent = ((initiative.effort - 6) / 4) * 100;
                    const yPercent = ((5 - initiative.benefit) / 4) * 100;
                    const isSelected = selectedInitiativeId === initiative.id;

                    return (
                      <button
                        key={initiative.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInitiative(isSelected ? null : initiative.id);
                        }}
                        onMouseEnter={(e) => handleDotMouseEnter(e, initiative.id)}
                        onMouseLeave={handleDotMouseLeave}
                        className={cn(
                          "absolute z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-150",
                          CATEGORY_DOT_COLORS[initiative.category],
                          isSelected
                            ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-125 z-20"
                            : "hover:scale-110",
                        )}
                        style={{
                          left: `calc(${Math.min(Math.max(xPercent, 8), 92)}% - 14px)`,
                          top: `calc(${Math.min(Math.max(yPercent, 8), 92)}% - 14px)`,
                        }}
                        title={initiative.title || "Namnlöst initiativ"}
                      >
                        <span className="text-[9px] font-bold text-white">
                          {initiative.title ? initiative.title.charAt(0).toUpperCase() : "?"}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* X-axis scale labels */}
          <div className="flex mt-1">
            <div className="w-8 shrink-0" />
            <div className="flex-1 flex justify-between px-1">
              <span className="text-[10px] text-muted-foreground">1</span>
              <span className="text-[10px] text-muted-foreground">3</span>
              <span className="text-[10px] text-muted-foreground">5</span>
              <span className="text-[10px] text-muted-foreground">7</span>
              <span className="text-[10px] text-muted-foreground">10</span>
            </div>
          </div>

          {/* X-axis label */}
          <div className="flex justify-center mt-1">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider">
              INSATS
            </span>
          </div>
        </div>

        {/* Hover tooltip */}
        {hoveredInitiative && tooltipPos && (
          <div
            className="absolute z-50 pointer-events-none rounded-lg border border-border bg-card px-3 py-2 shadow-lg"
            style={{
              left: Math.min(tooltipPos.x + 12, (containerRef.current?.clientWidth ?? 400) - 200),
              top: tooltipPos.y - 50,
            }}
          >
            <p className="text-sm font-medium truncate max-w-[180px]">
              {hoveredInitiative.title || "Namnlöst initiativ"}
            </p>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>Nytta: {hoveredInitiative.benefit}/10</span>
              <span>Insats: {hoveredInitiative.effort}/10</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", CATEGORY_COLORS[hoveredInitiative.category])}>
                {hoveredInitiative.category}
              </span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", getQuadrant(hoveredInitiative).textClass)}>
                {getQuadrant(hoveredInitiative).label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-3">
        <span className="text-[11px] text-muted-foreground font-medium">Kategori:</span>
        {CATEGORIES.map((c) => (
          <span key={c.value} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", CATEGORY_DOT_COLORS[c.value])} />
            <span className="text-[11px] text-muted-foreground">{c.label}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ---- Scoring Helper ---- */

function ScoringHelper({
  label,
  value,
  descriptions,
}: {
  label: string;
  value: number;
  descriptions: { range: string; text: string }[];
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
      <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
        {label}: {value}/10
      </p>
      <div className="space-y-0.5">
        {descriptions.map((d) => (
          <p key={d.range} className="text-[10px] text-muted-foreground">
            <span className="font-medium">{d.range}</span> {d.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ---- Initiative Form ---- */

function InitiativeForm({
  initiative,
  dispatch,
  onClose,
}: {
  initiative: Initiative;
  dispatch: React.Dispatch<Action>;
  onClose: () => void;
}) {
  const quadrant = getQuadrant(initiative);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="pen-line" size={16} className="text-primary" />
          {initiative.title ? "Redigera initiativ" : "Nytt initiativ"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          label="Titel"
          placeholder="T.ex. Digitalisera anbudsprocessen"
          value={initiative.title}
          onChange={(e) =>
            dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "title", value: e.target.value })
          }
        />

        <Textarea
          label="Beskrivning"
          placeholder="Beskriv initiativet och dess förväntade effekt..."
          value={initiative.description}
          onChange={(e) =>
            dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "description", value: e.target.value })
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Kategori"
            options={CATEGORY_OPTIONS}
            value={initiative.category}
            onChange={(e) =>
              dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "category", value: e.target.value })
            }
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
            value={initiative.status}
            onChange={(e) =>
              dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "status", value: e.target.value })
            }
          />
        </div>

        {/* Benefit scoring */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nytta (1-10): {initiative.benefit}
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={initiative.benefit}
            onChange={(e) =>
              dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "benefit", value: Number(e.target.value) })
            }
            className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer bg-muted"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">1 - Låg</span>
            <span className="text-[10px] text-muted-foreground">5 - Medel</span>
            <span className="text-[10px] text-muted-foreground">10 - Hög</span>
          </div>
          <ScoringHelper
            label="Nyttovärde"
            value={initiative.benefit}
            descriptions={[
              { range: "1-2:", text: "Minimal förbättring" },
              { range: "3-4:", text: "Liten förbättring" },
              { range: "5-6:", text: "Märkbar förbättring" },
              { range: "7-8:", text: "Betydande förbättring" },
              { range: "9-10:", text: "Transformativ påverkan" },
            ]}
          />
        </div>

        {/* Effort scoring */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Insats (1-10): {initiative.effort}
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={initiative.effort}
            onChange={(e) =>
              dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "effort", value: Number(e.target.value) })
            }
            className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer bg-muted"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">1 - Låg</span>
            <span className="text-[10px] text-muted-foreground">5 - Medel</span>
            <span className="text-[10px] text-muted-foreground">10 - Hög</span>
          </div>
          <ScoringHelper
            label="Insatsnivå"
            value={initiative.effort}
            descriptions={[
              { range: "1-2:", text: "Minimal ansträngning" },
              { range: "3-4:", text: "Låg ansträngning" },
              { range: "5-6:", text: "Medelhög ansträngning" },
              { range: "7-8:", text: "Hög ansträngning" },
              { range: "9-10:", text: "Mycket omfattande" },
            ]}
          />
        </div>

        {/* Computed quadrant preview */}
        <div className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 border",
          quadrant.bgClass,
          quadrant.borderClass,
        )}>
          <Icon name={quadrant.iconName} size={18} className={quadrant.textClass} />
          <div>
            <p className={cn("text-sm font-semibold", quadrant.textClass)}>
              {quadrant.label}
            </p>
            <p className={cn("text-xs", quadrant.textClass, "opacity-70")}>
              Rekommendation: {quadrant.strategy}
            </p>
          </div>
        </div>

        <Select
          label="Prioritet"
          options={PRIORITY_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
          value={initiative.priority}
          onChange={(e) =>
            dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "priority", value: e.target.value })
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Uppskattad kostnad"
            placeholder="T.ex. 500 000 SEK"
            value={initiative.estimatedCost}
            onChange={(e) =>
              dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "estimatedCost", value: e.target.value })
            }
          />
          <Input
            label="Uppskattad tid"
            placeholder="T.ex. 3 månader"
            value={initiative.estimatedTime}
            onChange={(e) =>
              dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "estimatedTime", value: e.target.value })
            }
          />
        </div>

        <Input
          label="Ansvarig"
          placeholder="Namn eller roll"
          value={initiative.responsible}
          onChange={(e) =>
            dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "responsible", value: e.target.value })
          }
        />

        <Textarea
          label="Anteckningar"
          placeholder="Övriga anteckningar, beroenden, risker..."
          value={initiative.notes}
          onChange={(e) =>
            dispatch({ type: "UPDATE_INITIATIVE", id: initiative.id, field: "notes", value: e.target.value })
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

/* ---- Initiative List Item ---- */

function InitiativeListItem({
  initiative,
  isSelected,
  onSelect,
  onEdit,
  onRemove,
}: {
  initiative: Initiative;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const quadrant = getQuadrant(initiative);

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
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            CATEGORY_COLORS[initiative.category],
          )}
        >
          <Icon name={CATEGORY_ICONS[initiative.category]} size={14} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">
              {initiative.title || "Namnlöst initiativ"}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                quadrant.textClass,
                quadrant.bgClass,
              )}
            >
              {quadrant.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {initiative.category} &middot; N:{initiative.benefit} I:{initiative.effort} &middot;{" "}
            <span className={cn("font-medium", PRIORITY_COLORS[initiative.priority]?.split(" ")[1])}>
              {initiative.priority}
            </span>
          </p>
          {initiative.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {initiative.description}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                STATUS_COLORS[initiative.status],
              )}
            >
              {initiative.status}
            </span>
            {initiative.responsible && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Icon name="user" size={10} />
                {initiative.responsible}
              </span>
            )}
          </div>
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

/* ---- Initiative Detail Panel ---- */

function InitiativeDetailPanel({
  initiative,
  onClose,
  onEdit,
}: {
  initiative: Initiative;
  onClose: () => void;
  onEdit: () => void;
}) {
  const quadrant = getQuadrant(initiative);
  const efficiency = getEfficiencyScore(initiative);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              CATEGORY_COLORS[initiative.category],
            )}
          >
            <Icon name={CATEGORY_ICONS[initiative.category]} size={16} />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              {initiative.title || "Namnlöst initiativ"}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium",
                  quadrant.textClass,
                  quadrant.bgClass,
                )}
              >
                {quadrant.label} &mdash; {quadrant.strategy}
              </span>
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", STATUS_COLORS[initiative.status])}>
                {initiative.status}
              </span>
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", PRIORITY_COLORS[initiative.priority])}>
                Prioritet: {initiative.priority}
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
      {initiative.description && (
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Beskrivning</p>
          <p className="text-sm whitespace-pre-wrap">{initiative.description}</p>
        </div>
      )}

      {/* Scoring visual */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Nytta</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                <div
                  key={v}
                  className={cn(
                    "h-2 w-2.5 rounded-sm transition-colors",
                    v <= initiative.benefit
                      ? initiative.benefit >= 8
                        ? "bg-green-500"
                        : initiative.benefit >= 5
                        ? "bg-blue-400"
                        : "bg-gray-400"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{initiative.benefit}/10</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{getBenefitLabel(initiative.benefit)}</p>
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Insats</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                <div
                  key={v}
                  className={cn(
                    "h-2 w-2.5 rounded-sm transition-colors",
                    v <= initiative.effort
                      ? initiative.effort >= 8
                        ? "bg-red-400"
                        : initiative.effort >= 5
                        ? "bg-orange-400"
                        : "bg-green-400"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{initiative.effort}/10</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{getEffortLabel(initiative.effort)}</p>
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Effektivitet</p>
          <p className="text-lg font-bold tabular-nums">{efficiency}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Nytta / Insats</p>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {initiative.estimatedCost && (
          <div className="rounded-xl border border-border/60 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Uppskattad kostnad</p>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Icon name="coins" size={13} className="text-muted-foreground" />
              {initiative.estimatedCost}
            </p>
          </div>
        )}
        {initiative.estimatedTime && (
          <div className="rounded-xl border border-border/60 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Uppskattad tid</p>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Icon name="clock" size={13} className="text-muted-foreground" />
              {initiative.estimatedTime}
            </p>
          </div>
        )}
        {initiative.responsible && (
          <div className="rounded-xl border border-border/60 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Ansvarig</p>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Icon name="user" size={13} className="text-muted-foreground" />
              {initiative.responsible}
            </p>
          </div>
        )}
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Kategori</p>
          <p className="text-sm font-medium flex items-center gap-1.5">
            <span className={cn("flex h-4 w-4 items-center justify-center rounded", CATEGORY_COLORS[initiative.category])}>
              <Icon name={CATEGORY_ICONS[initiative.category]} size={10} />
            </span>
            {initiative.category}
          </p>
        </div>
      </div>

      {/* Notes */}
      {initiative.notes && (
        <div className="border-t border-border/60 pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Anteckningar</p>
          <p className="text-sm whitespace-pre-wrap">{initiative.notes}</p>
        </div>
      )}
    </Card>
  );
}

/* ---- Summary Statistics ---- */

function SummaryStats({ initiatives }: { initiatives: Initiative[] }) {
  const total = initiatives.length;

  const byQuadrant = {
    "quick-wins": 0,
    strategic: 0,
    "fill-in": 0,
    avoid: 0,
  };
  initiatives.forEach((i) => {
    const key = getQuadrantKey(i);
    byQuadrant[key as keyof typeof byQuadrant]++;
  });

  const byPriority: Record<InitiativePriority, number> = { "Hög": 0, Medel: 0, "Låg": 0 };
  initiatives.forEach((i) => {
    byPriority[i.priority]++;
  });

  const byStatus: Record<string, number> = {};
  initiatives.forEach((i) => {
    byStatus[i.status] = (byStatus[i.status] || 0) + 1;
  });

  const byCategory: Record<string, number> = {};
  initiatives.forEach((i) => {
    byCategory[i.category] = (byCategory[i.category] || 0) + 1;
  });

  const avgBenefit = total > 0
    ? Math.round((initiatives.reduce((sum, i) => sum + i.benefit, 0) / total) * 10) / 10
    : 0;
  const avgEffort = total > 0
    ? Math.round((initiatives.reduce((sum, i) => sum + i.effort, 0) / total) * 10) / 10
    : 0;

  return (
    <Card className="p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon name="bar-chart-3" size={16} className="text-primary" />
        Sammanfattning
      </h3>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl font-bold tabular-nums">{total}</span>
        <span className="text-sm text-muted-foreground">
          {total === 1 ? "initiativ" : "initiativ"}
        </span>
      </div>

      {/* Average scores */}
      {total > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border/60 p-2.5 text-center">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Snitt nytta
            </p>
            <p className="text-lg font-bold tabular-nums">{avgBenefit}</p>
          </div>
          <div className="rounded-xl border border-border/60 p-2.5 text-center">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Snitt insats
            </p>
            <p className="text-lg font-bold tabular-nums">{avgEffort}</p>
          </div>
        </div>
      )}

      {/* By quadrant */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Per kvadrant
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["quick-wins", "strategic", "fill-in", "avoid"] as const).map((key) => {
            const q = QUADRANTS[key];
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium border",
                  q.bgClass,
                  q.borderClass,
                  q.textClass,
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Icon name={q.iconName} size={12} />
                  <span className="text-xs">{q.label}</span>
                </span>
                <span className="font-bold tabular-nums">{byQuadrant[key]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* By priority */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Per prioritet
        </p>
        <div className="space-y-1.5">
          {(["Hög", "Medel", "Låg"] as InitiativePriority[]).map((priority) => (
            <div
              key={priority}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                    PRIORITY_COLORS[priority],
                  )}
                >
                  {priority.charAt(0)}
                </span>
                {priority}
              </span>
              <span className="font-medium tabular-nums text-muted-foreground">
                {byPriority[priority]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* By status */}
      {total > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Per status
          </p>
          <div className="space-y-1.5">
            {STATUS_OPTIONS.filter((s) => byStatus[s.value]).map((s) => (
              <div
                key={s.value}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", STATUS_COLORS[s.value])}>
                    {s.label}
                  </span>
                </span>
                <span className="font-medium tabular-nums text-muted-foreground">
                  {byStatus[s.value]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By category */}
      {total > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Per kategori
          </p>
          <div className="space-y-1.5">
            {CATEGORIES.filter((c) => byCategory[c.value]).map((c) => (
              <div
                key={c.value}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded",
                      CATEGORY_COLORS[c.value as InitiativeCategory],
                    )}
                  >
                    <Icon name={CATEGORY_ICONS[c.value as InitiativeCategory]} size={12} />
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

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

export default function BenefitEffortPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.initiatives)) {
          dispatch({ type: "LOAD_STATE", state: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  // Auto-save on every state change (skip initial render)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable
    }
  }, [state, isLoaded]);

  // Filtered initiatives
  const filteredInitiatives = state.initiatives.filter((i) => {
    if (state.filterCategory && i.category !== state.filterCategory) return false;
    if (state.filterStatus && i.status !== state.filterStatus) return false;
    return true;
  });

  // Sort by efficiency (benefit/effort ratio, highest first)
  const sortedInitiatives = [...filteredInitiatives].sort((a, b) => {
    return getEfficiencyScore(b) - getEfficiencyScore(a);
  });

  const selectedInitiative = state.selectedInitiativeId
    ? state.initiatives.find((i) => i.id === state.selectedInitiativeId) ?? null
    : null;

  const editingInitiative = state.editingInitiativeId
    ? state.initiatives.find((i) => i.id === state.editingInitiativeId) ?? null
    : null;

  /* ---- Export handlers ---- */

  const handleExportJson = useCallback(() => {
    exportToJson(
      `nytto-insats-${new Date().toISOString().slice(0, 10)}.json`,
      state.initiatives,
    );
  }, [state.initiatives]);

  const handleExportXlsx = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Nytto-insats-analys",
      exportDate: dateStr,
      subtitle: `${state.initiatives.length} initiativ analyserade`,
    };

    const initiativeRows: (string | number)[][] = state.initiatives.map((i) => {
      const q = getQuadrant(i);
      return [
        i.title,
        i.category,
        i.benefit,
        i.effort,
        getEfficiencyScore(i),
        q.label,
        q.strategy,
        i.priority,
        i.status,
        i.estimatedCost,
        i.estimatedTime,
        i.responsible,
        i.description,
        i.notes,
      ];
    });

    const sheets: ExportSheet[] = [
      {
        name: "Initiativ",
        headers: [
          "Titel",
          "Kategori",
          "Nytta",
          "Insats",
          "Effektivitet",
          "Kvadrant",
          "Rekommendation",
          "Prioritet",
          "Status",
          "Uppskattad kostnad",
          "Uppskattad tid",
          "Ansvarig",
          "Beskrivning",
          "Anteckningar",
        ],
        rows: initiativeRows,
      },
    ];

    // Quadrant summary sheet
    const quadrantSummary: (string | number)[][] = [
      ["Snabba vinster", state.initiatives.filter((i) => getQuadrantKey(i) === "quick-wins").length, "Gör först"],
      ["Stora projekt", state.initiatives.filter((i) => getQuadrantKey(i) === "strategic").length, "Planera"],
      ["Utfyllnadsprojekt", state.initiatives.filter((i) => getQuadrantKey(i) === "fill-in").length, "Överväg"],
      ["Tidsslukare", state.initiatives.filter((i) => getQuadrantKey(i) === "avoid").length, "Undvik"],
    ];

    sheets.push({
      name: "Kvadrantsammanfattning",
      headers: ["Kvadrant", "Antal", "Rekommendation"],
      rows: quadrantSummary,
    });

    await exportToXlsx(`nytto-insats-${dateStr}.xlsx`, sheets, metadata);
  }, [state.initiatives]);

  const handleExportPdf = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Nytto-insats-analys",
      exportDate: dateStr,
      subtitle: `${state.initiatives.length} initiativ analyserade`,
    };

    const sections: PdfSection[] = [];

    // Overview table
    sections.push({
      title: "Initiativöversikt",
      type: "table",
      headers: ["Titel", "Kategori", "Nytta", "Insats", "Effektivitet", "Kvadrant", "Prioritet", "Status"],
      rows: state.initiatives.map((i) => {
        const q = getQuadrant(i);
        return [
          i.title || "(Namnlöst)",
          i.category,
          i.benefit,
          i.effort,
          getEfficiencyScore(i),
          q.label,
          i.priority,
          i.status,
        ];
      }),
    });

    // Quadrant summary
    sections.push({
      title: "Kvadrantsammanfattning",
      type: "keyvalue",
      pairs: [
        {
          label: "Snabba vinster (Gör först)",
          value: `${state.initiatives.filter((i) => getQuadrantKey(i) === "quick-wins").length} initiativ`,
        },
        {
          label: "Stora projekt (Planera)",
          value: `${state.initiatives.filter((i) => getQuadrantKey(i) === "strategic").length} initiativ`,
        },
        {
          label: "Utfyllnadsprojekt (Överväg)",
          value: `${state.initiatives.filter((i) => getQuadrantKey(i) === "fill-in").length} initiativ`,
        },
        {
          label: "Tidsslukare (Undvik)",
          value: `${state.initiatives.filter((i) => getQuadrantKey(i) === "avoid").length} initiativ`,
        },
      ],
    });

    // Individual details for high-priority initiatives
    const highPriority = state.initiatives.filter(
      (i) => i.priority === "Hög" || getQuadrantKey(i) === "quick-wins",
    );
    if (highPriority.length > 0) {
      sections.push({
        title: "Högprioriterade initiativ - Detaljer",
        type: "table",
        headers: ["Titel", "Beskrivning", "Kostnad", "Tid", "Ansvarig"],
        rows: highPriority.map((i) => [
          i.title || "(Namnlöst)",
          i.description || "-",
          i.estimatedCost || "-",
          i.estimatedTime || "-",
          i.responsible || "-",
        ]),
      });
    }

    await exportToPdf(`nytto-insats-${dateStr}.pdf`, sections, metadata);
  }, [state.initiatives]);

  const handleNewAnalysis = useCallback(() => {
    if (state.initiatives.length > 0) {
      const confirmed = window.confirm(
        "Är du säker på att du vill börja om? All data raderas.",
      );
      if (!confirmed) return;
    }
    dispatch({ type: "RESET" });
  }, [state.initiatives.length]);

  return (
    <FeatureGate featureKey="verktyg.benefit-effort">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="border-b border-border/60 px-6 py-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Upphandlingar</span>
            <span>/</span>
            <span>Verktyg</span>
            <span>/</span>
            <span className="text-foreground font-medium">Nytto-insats-analys</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="target" size={20} />
            </span>
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight">Nytto-insats-analys</h1>
              <p className="text-xs text-muted-foreground">
                Prioritera initiativ baserat på förväntad nytta och nödvändig insats
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                disabled={state.initiatives.length === 0}
              >
                <Icon name="external-link" size={14} /> JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportXlsx}
                disabled={state.initiatives.length === 0}
              >
                <Icon name="file-text" size={14} /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={state.initiatives.length === 0}
              >
                <Icon name="file-text" size={14} /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleNewAnalysis}>
                <Icon name="refresh-cw" size={14} /> Ny analys
              </Button>
              <Button size="sm" onClick={() => dispatch({ type: "ADD_INITIATIVE" })}>
                <Icon name="plus" size={14} /> Lägg till initiativ
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {/* Empty state */}
            {state.initiatives.length === 0 && !editingInitiative && (
              <Card className="mx-auto max-w-lg p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon name="target" size={28} />
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight">Ingen analys ännu</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Börja med att lägga till initiativ för att bygga din nytto-insats-matris.
                  Bedöm förväntad nytta och nödvändig insats för varje initiativ, och få en
                  tydlig bild av vad som bör prioriteras.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                  {(["quick-wins", "strategic", "fill-in", "avoid"] as const).map((key) => {
                    const q = QUADRANTS[key];
                    return (
                      <div
                        key={key}
                        className={cn("rounded-xl border p-3", q.bgClass, q.borderClass)}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon name={q.iconName} size={14} className={q.textClass} />
                          <span className={cn("text-xs font-bold", q.textClass)}>
                            {q.label}
                          </span>
                        </div>
                        <p className={cn("text-[11px]", q.textClass, "opacity-70")}>
                          {q.action}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <Button onClick={() => dispatch({ type: "ADD_INITIATIVE" })}>
                    <Icon name="plus" size={14} /> Lägg till första initiativet
                  </Button>
                </div>
              </Card>
            )}

            {/* Two-column layout when initiatives exist */}
            {(state.initiatives.length > 0 || editingInitiative) && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left column: Matrix + Stats */}
                <div className="space-y-6 lg:col-span-7">
                  <MatrixVisualization
                    initiatives={state.initiatives}
                    selectedInitiativeId={state.selectedInitiativeId}
                    onSelectInitiative={(id) =>
                      dispatch({ type: "SELECT_INITIATIVE", id })
                    }
                  />

                  <SummaryStats initiatives={state.initiatives} />
                </div>

                {/* Right column: Filters + List + Form + Detail */}
                <div className="space-y-4 lg:col-span-5">
                  {/* Editing form */}
                  {editingInitiative && (
                    <InitiativeForm
                      initiative={editingInitiative}
                      dispatch={dispatch}
                      onClose={() =>
                        dispatch({ type: "EDIT_INITIATIVE", id: null })
                      }
                    />
                  )}

                  {/* Selected initiative detail */}
                  {selectedInitiative && !editingInitiative && (
                    <InitiativeDetailPanel
                      initiative={selectedInitiative}
                      onClose={() =>
                        dispatch({ type: "SELECT_INITIATIVE", id: null })
                      }
                      onEdit={() =>
                        dispatch({
                          type: "EDIT_INITIATIVE",
                          id: selectedInitiative.id,
                        })
                      }
                    />
                  )}

                  {/* Initiative list */}
                  <Card className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <Icon name="clipboard-list" size={16} className="text-primary" />
                        Initiativlista
                        {state.initiatives.length > 0 && (
                          <span className="text-xs font-normal text-muted-foreground">
                            ({filteredInitiatives.length}
                            {filteredInitiatives.length !== state.initiatives.length &&
                              ` av ${state.initiatives.length}`}
                            )
                          </span>
                        )}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch({ type: "ADD_INITIATIVE" })}
                      >
                        <Icon name="plus" size={14} /> Lägg till
                      </Button>
                    </div>

                    {/* Filters */}
                    {state.initiatives.length > 0 && (
                      <div className="mb-3 flex gap-2">
                        <div className="flex-1">
                          <Select
                            options={[
                              { value: "", label: "Alla kategorier" },
                              ...CATEGORY_OPTIONS,
                            ]}
                            value={state.filterCategory}
                            onChange={(e) =>
                              dispatch({
                                type: "SET_FILTER_CATEGORY",
                                value: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <Select
                            options={[
                              { value: "", label: "Alla statusar" },
                              ...STATUS_OPTIONS.map((s) => ({
                                value: s.value,
                                label: s.label,
                              })),
                            ]}
                            value={state.filterStatus}
                            onChange={(e) =>
                              dispatch({
                                type: "SET_FILTER_STATUS",
                                value: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {state.initiatives.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Inga initiativ tillagda ännu.
                      </p>
                    ) : filteredInitiatives.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Inga initiativ matchar filtreringen.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {sortedInitiatives.map((initiative) => (
                          <InitiativeListItem
                            key={initiative.id}
                            initiative={initiative}
                            isSelected={
                              state.selectedInitiativeId === initiative.id
                            }
                            onSelect={() =>
                              dispatch({
                                type: "SELECT_INITIATIVE",
                                id: initiative.id,
                              })
                            }
                            onEdit={() => {
                              dispatch({
                                type: "SELECT_INITIATIVE",
                                id: initiative.id,
                              });
                              dispatch({
                                type: "EDIT_INITIATIVE",
                                id: initiative.id,
                              });
                            }}
                            onRemove={() =>
                              dispatch({
                                type: "REMOVE_INITIATIVE",
                                id: initiative.id,
                              })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

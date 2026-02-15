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

type StepType = "start" | "process" | "decision" | "delay" | "document" | "end";

interface ProcessStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  responsible: string;
  timeEstimate: string;
  issues: string;
  improvements: string;
  nextStepId: string | null;
  altNextStepId: string | null;
  decisionYesLabel: string;
  decisionNoLabel: string;
}

interface ProcessFlow {
  id: string;
  name: string;
  description: string;
  steps: ProcessStep[];
  createdAt: string;
}

type ActiveTab = "flowchart" | "details";

interface ProcessFlowState {
  flows: ProcessFlow[];
  activeFlowId: string | null;
  selectedStepId: string | null;
  activeTab: ActiveTab;
  showAddFlow: boolean;
}

type Action =
  | { type: "ADD_FLOW"; flow: ProcessFlow }
  | { type: "UPDATE_FLOW"; id: string; updates: Partial<ProcessFlow> }
  | { type: "DELETE_FLOW"; id: string }
  | { type: "SET_ACTIVE_FLOW"; id: string | null }
  | { type: "ADD_STEP"; flowId: string; step: ProcessStep; afterIndex: number }
  | { type: "UPDATE_STEP"; flowId: string; stepId: string; updates: Partial<ProcessStep> }
  | { type: "DELETE_STEP"; flowId: string; stepId: string }
  | { type: "MOVE_STEP"; flowId: string; stepId: string; direction: "up" | "down" }
  | { type: "SELECT_STEP"; id: string | null }
  | { type: "SET_TAB"; tab: ActiveTab }
  | { type: "TOGGLE_ADD_FLOW" }
  | { type: "LOAD_STATE"; flows: ProcessFlow[] };

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const STORAGE_KEY = "critero-process-flow-v1";

const STEP_TYPE_META: Record<
  StepType,
  { label: string; icon: string; color: string; bgColor: string; borderColor: string; textColor: string }
> = {
  start: {
    label: "Start",
    icon: "play",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    textColor: "text-emerald-800 dark:text-emerald-200",
  },
  process: {
    label: "Process",
    icon: "cog",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    textColor: "text-blue-800 dark:text-blue-200",
  },
  decision: {
    label: "Beslut",
    icon: "help-circle",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    textColor: "text-amber-800 dark:text-amber-200",
  },
  delay: {
    label: "Väntan",
    icon: "clock",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/30",
    borderColor: "border-gray-300 dark:border-gray-600",
    textColor: "text-gray-800 dark:text-gray-200",
  },
  document: {
    label: "Dokument",
    icon: "file-text",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-300 dark:border-purple-700",
    textColor: "text-purple-800 dark:text-purple-200",
  },
  end: {
    label: "Slut",
    icon: "square",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-300 dark:border-red-700",
    textColor: "text-red-800 dark:text-red-200",
  },
};

const STEP_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "start", label: "Start" },
  { value: "process", label: "Process" },
  { value: "decision", label: "Beslut" },
  { value: "delay", label: "Väntan" },
  { value: "document", label: "Dokument" },
  { value: "end", label: "Slut" },
];

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyStep(type: StepType = "process"): ProcessStep {
  return {
    id: uid(),
    type,
    title: "",
    description: "",
    responsible: "",
    timeEstimate: "",
    issues: "",
    improvements: "",
    nextStepId: null,
    altNextStepId: null,
    decisionYesLabel: "Ja",
    decisionNoLabel: "Nej",
  };
}

function createEmptyFlow(): ProcessFlow {
  const startStep = createEmptyStep("start");
  startStep.title = "Start";
  const endStep = createEmptyStep("end");
  endStep.title = "Slut";
  return {
    id: uid(),
    name: "",
    description: "",
    steps: [startStep, endStep],
    createdAt: new Date().toISOString(),
  };
}

function parseTimeEstimate(est: string): number {
  if (!est) return 0;
  const lower = est.toLowerCase().trim();
  // Try to parse "Xh", "X h", "X timmar", "X min", "X dagar", "X d"
  const hourMatch = lower.match(/^(\d+(?:[.,]\d+)?)\s*(?:h|tim|timmar?)$/);
  if (hourMatch) return parseFloat(hourMatch[1].replace(",", ".")) * 60;
  const minMatch = lower.match(/^(\d+(?:[.,]\d+)?)\s*(?:m|min|minuter?)$/);
  if (minMatch) return parseFloat(minMatch[1].replace(",", "."));
  const dayMatch = lower.match(/^(\d+(?:[.,]\d+)?)\s*(?:d|dag|dagar?)$/);
  if (dayMatch) return parseFloat(dayMatch[1].replace(",", ".")) * 480;
  // Plain number -> assume minutes
  const plain = parseFloat(lower.replace(",", "."));
  if (!isNaN(plain)) return plain;
  return 0;
}

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes === 0) return "0 min";
  const days = Math.floor(totalMinutes / 480);
  const hours = Math.floor((totalMinutes % 480) / 60);
  const mins = Math.round(totalMinutes % 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} d`);
  if (hours > 0) parts.push(`${hours} h`);
  if (mins > 0) parts.push(`${mins} min`);
  return parts.join(" ");
}

/* ================================================================== */
/*  Reducer                                                            */
/* ================================================================== */

function createInitialState(): ProcessFlowState {
  return {
    flows: [],
    activeFlowId: null,
    selectedStepId: null,
    activeTab: "flowchart",
    showAddFlow: false,
  };
}

function reducer(state: ProcessFlowState, action: Action): ProcessFlowState {
  switch (action.type) {
    case "ADD_FLOW":
      return {
        ...state,
        flows: [...state.flows, action.flow],
        activeFlowId: action.flow.id,
        showAddFlow: false,
        selectedStepId: null,
      };

    case "UPDATE_FLOW":
      return {
        ...state,
        flows: state.flows.map((f) =>
          f.id === action.id ? { ...f, ...action.updates } : f
        ),
      };

    case "DELETE_FLOW": {
      const remaining = state.flows.filter((f) => f.id !== action.id);
      return {
        ...state,
        flows: remaining,
        activeFlowId:
          state.activeFlowId === action.id
            ? remaining.length > 0
              ? remaining[0].id
              : null
            : state.activeFlowId,
        selectedStepId:
          state.activeFlowId === action.id ? null : state.selectedStepId,
      };
    }

    case "SET_ACTIVE_FLOW":
      return { ...state, activeFlowId: action.id, selectedStepId: null };

    case "ADD_STEP":
      return {
        ...state,
        flows: state.flows.map((f) => {
          if (f.id !== action.flowId) return f;
          const newSteps = [...f.steps];
          newSteps.splice(action.afterIndex + 1, 0, action.step);
          return { ...f, steps: newSteps };
        }),
        selectedStepId: action.step.id,
      };

    case "UPDATE_STEP":
      return {
        ...state,
        flows: state.flows.map((f) => {
          if (f.id !== action.flowId) return f;
          return {
            ...f,
            steps: f.steps.map((s) =>
              s.id === action.stepId ? { ...s, ...action.updates } : s
            ),
          };
        }),
      };

    case "DELETE_STEP":
      return {
        ...state,
        flows: state.flows.map((f) => {
          if (f.id !== action.flowId) return f;
          return { ...f, steps: f.steps.filter((s) => s.id !== action.stepId) };
        }),
        selectedStepId:
          state.selectedStepId === action.stepId ? null : state.selectedStepId,
      };

    case "MOVE_STEP":
      return {
        ...state,
        flows: state.flows.map((f) => {
          if (f.id !== action.flowId) return f;
          const idx = f.steps.findIndex((s) => s.id === action.stepId);
          if (idx < 0) return f;
          const newIdx = action.direction === "up" ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= f.steps.length) return f;
          const newSteps = [...f.steps];
          [newSteps[idx], newSteps[newIdx]] = [newSteps[newIdx], newSteps[idx]];
          return { ...f, steps: newSteps };
        }),
      };

    case "SELECT_STEP":
      return { ...state, selectedStepId: action.id };

    case "SET_TAB":
      return { ...state, activeTab: action.tab };

    case "TOGGLE_ADD_FLOW":
      return { ...state, showAddFlow: !state.showAddFlow };

    case "LOAD_STATE":
      return {
        ...state,
        flows: action.flows,
        activeFlowId: action.flows.length > 0 ? action.flows[0].id : null,
      };

    default:
      return state;
  }
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Flow Sidebar ---- */

function FlowSidebar({
  flows,
  activeFlowId,
  showAddFlow,
  dispatch,
}: {
  flows: ProcessFlow[];
  activeFlowId: string | null;
  showAddFlow: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    const flow = createEmptyFlow();
    flow.name = newName.trim();
    flow.description = newDescription.trim();
    dispatch({ type: "ADD_FLOW", flow });
    setNewName("");
    setNewDescription("");
  };

  return (
    <div className="w-64 shrink-0 border-r border-border/60 bg-muted/20">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <h2 className="text-sm font-semibold">Flöden</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch({ type: "TOGGLE_ADD_FLOW" })}
          title="Nytt flöde"
        >
          <Icon name="plus" size={16} />
        </Button>
      </div>

      {showAddFlow && (
        <div className="border-b border-border/40 p-3 space-y-2">
          <Input
            placeholder="Flödesnamn"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Input
            placeholder="Beskrivning (valfritt)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
              Skapa
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatch({ type: "TOGGLE_ADD_FLOW" })}
            >
              Avbryt
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-y-auto p-2 space-y-1" style={{ maxHeight: "calc(100vh - 200px)" }}>
        {flows.length === 0 && !showAddFlow && (
          <p className="px-2 py-8 text-center text-xs text-muted-foreground">
            Inga flöden skapade.
            <br />
            Klicka + för att börja.
          </p>
        )}
        {flows.map((flow) => (
          <button
            key={flow.id}
            onClick={() => dispatch({ type: "SET_ACTIVE_FLOW", id: flow.id })}
            className={cn(
              "w-full rounded-xl px-3 py-2.5 text-left transition-colors",
              flow.id === activeFlowId
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/60 text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon name="git-branch" size={14} className="shrink-0" />
              <span className="text-sm font-medium truncate">
                {flow.name || "Namnlöst flöde"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {flow.steps.length} steg
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- Step Shape Components ---- */

function StepShape({
  step,
  isSelected,
  onClick,
}: {
  step: ProcessStep;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meta = STEP_TYPE_META[step.type];

  if (step.type === "start" || step.type === "end") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 px-8 py-3 min-w-[160px] transition-all",
          meta.bgColor,
          meta.borderColor,
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          "hover:shadow-md cursor-pointer"
        )}
      >
        <Icon name={meta.icon} size={16} className={cn(meta.color, "mr-2 shrink-0")} />
        <span className={cn("text-sm font-semibold", meta.textColor)}>
          {step.title || meta.label}
        </span>
      </button>
    );
  }

  if (step.type === "decision") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative cursor-pointer transition-all",
          isSelected && "filter drop-shadow-lg"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center border-2",
            meta.bgColor,
            meta.borderColor,
            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            "w-[160px] h-[160px] rotate-45 rounded-xl"
          )}
        >
          <div className="-rotate-45 flex flex-col items-center gap-1 p-2 max-w-[120px]">
            <Icon name={meta.icon} size={16} className={meta.color} />
            <span className={cn("text-xs font-semibold text-center leading-tight", meta.textColor)}>
              {step.title || "Beslut?"}
            </span>
          </div>
        </div>
      </button>
    );
  }

  if (step.type === "delay") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative flex items-center gap-2 border-2 px-6 py-3 min-w-[160px] transition-all",
          "rounded-l-full rounded-r-xl",
          meta.bgColor,
          meta.borderColor,
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          "hover:shadow-md cursor-pointer"
        )}
      >
        <Icon name={meta.icon} size={16} className={cn(meta.color, "shrink-0")} />
        <div className="text-left">
          <span className={cn("text-sm font-semibold block", meta.textColor)}>
            {step.title || "Väntan"}
          </span>
          {step.timeEstimate && (
            <span className="text-xs text-muted-foreground">{step.timeEstimate}</span>
          )}
        </div>
      </button>
    );
  }

  if (step.type === "document") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative flex items-center gap-2 border-2 px-6 py-3 min-w-[160px] transition-all",
          "rounded-xl",
          meta.bgColor,
          meta.borderColor,
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          "hover:shadow-md cursor-pointer"
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 h-2 overflow-hidden rounded-b-xl">
          <svg viewBox="0 0 200 10" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,5 Q25,0 50,5 T100,5 T150,5 T200,5 L200,10 L0,10 Z"
              className="fill-purple-200 dark:fill-purple-800"
            />
          </svg>
        </div>
        <Icon name={meta.icon} size={16} className={cn(meta.color, "shrink-0")} />
        <div className="text-left">
          <span className={cn("text-sm font-semibold block", meta.textColor)}>
            {step.title || "Dokument"}
          </span>
          {step.responsible && (
            <span className="text-xs text-muted-foreground">{step.responsible}</span>
          )}
        </div>
      </button>
    );
  }

  // Default: process step (rectangle)
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 border-2 px-6 py-3 min-w-[180px] transition-all rounded-xl",
        meta.bgColor,
        meta.borderColor,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        "hover:shadow-md cursor-pointer"
      )}
    >
      <Icon name={meta.icon} size={16} className={cn(meta.color, "shrink-0")} />
      <div className="text-left">
        <span className={cn("text-sm font-semibold block", meta.textColor)}>
          {step.title || "Process"}
        </span>
        {step.responsible && (
          <span className="text-xs text-muted-foreground">{step.responsible}</span>
        )}
        {step.timeEstimate && (
          <span className="text-xs text-muted-foreground block">{step.timeEstimate}</span>
        )}
      </div>
      {step.issues && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
          !
        </span>
      )}
    </button>
  );
}

/* ---- Add Step Button (between steps) ---- */

function AddStepButton({
  onAdd,
}: {
  onAdd: (type: StepType) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center py-1 relative">
      {/* Vertical connector arrow */}
      <div className="text-muted-foreground/50 text-lg leading-none select-none">
        &#9660;
      </div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed transition-all",
          "border-muted-foreground/30 text-muted-foreground/50 hover:border-primary hover:text-primary hover:bg-primary/5",
          open && "border-primary text-primary bg-primary/5"
        )}
        title="Lägg till steg"
      >
        <Icon name="plus" size={14} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 z-20 flex flex-col rounded-xl border border-border bg-card shadow-lg p-1.5 min-w-[140px]">
          {(Object.keys(STEP_TYPE_META) as StepType[]).map((stepType) => {
            const m = STEP_TYPE_META[stepType];
            return (
              <button
                key={stepType}
                onClick={() => {
                  onAdd(stepType);
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-muted/60 transition-colors text-left"
              >
                <Icon name={m.icon} size={14} className={m.color} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- Visual Flowchart ---- */

function FlowchartView({
  flow,
  selectedStepId,
  dispatch,
}: {
  flow: ProcessFlow;
  selectedStepId: string | null;
  dispatch: React.Dispatch<Action>;
}) {
  const handleAddStep = useCallback(
    (afterIndex: number, type: StepType) => {
      const step = createEmptyStep(type);
      step.title = STEP_TYPE_META[type].label;
      dispatch({ type: "ADD_STEP", flowId: flow.id, step, afterIndex });
    },
    [dispatch, flow.id]
  );

  if (flow.steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Icon name="git-branch" size={40} className="mb-4 opacity-30" />
        <p className="text-sm">Inga steg i detta flöde.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            const step = createEmptyStep("start");
            step.title = "Start";
            dispatch({ type: "ADD_STEP", flowId: flow.id, step, afterIndex: -1 });
          }}
        >
          <Icon name="plus" size={14} /> Lägg till startsteg
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 px-4">
      {flow.steps.map((step, index) => (
        <div key={step.id} className="flex flex-col items-center">
          {/* The step shape */}
          <div className="relative">
            <StepShape
              step={step}
              isSelected={step.id === selectedStepId}
              onClick={() =>
                dispatch({
                  type: "SELECT_STEP",
                  id: step.id === selectedStepId ? null : step.id,
                })
              }
            />

            {/* Decision branch labels */}
            {step.type === "decision" && (
              <>
                <div className="absolute left-[-80px] top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                    {step.decisionNoLabel || "Nej"}
                  </span>
                  <span className="text-muted-foreground/50 text-xs">&#9664;</span>
                </div>
                <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-muted-foreground/50 text-xs">&#9654;</span>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                    {step.decisionYesLabel || "Ja"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Add step button between steps (not after the last step) */}
          {index < flow.steps.length - 1 && (
            <AddStepButton onAdd={(type) => handleAddStep(index, type)} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---- Step Details Table ---- */

function StepDetailsTable({
  flow,
  selectedStepId,
  dispatch,
}: {
  flow: ProcessFlow;
  selectedStepId: string | null;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Typ</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Titel</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ansvarig</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Tidsuppskattning</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Problem</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Förbättringar</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Åtgärder</th>
          </tr>
        </thead>
        <tbody>
          {flow.steps.map((step, index) => {
            const meta = STEP_TYPE_META[step.type];
            const isSelected = step.id === selectedStepId;
            return (
              <tr
                key={step.id}
                className={cn(
                  "border-b border-border/30 transition-colors cursor-pointer",
                  isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                )}
                onClick={() =>
                  dispatch({
                    type: "SELECT_STEP",
                    id: isSelected ? null : step.id,
                  })
                }
              >
                <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      meta.bgColor,
                      meta.textColor
                    )}
                  >
                    <Icon name={meta.icon} size={12} />
                    {meta.label}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium">{step.title || "-"}</td>
                <td className="px-3 py-2 text-muted-foreground">{step.responsible || "-"}</td>
                <td className="px-3 py-2 text-muted-foreground">{step.timeEstimate || "-"}</td>
                <td className="px-3 py-2">
                  {step.issues ? (
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                      <Icon name="alert-triangle" size={12} />
                      <span className="truncate max-w-[150px]">{step.issues}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {step.improvements ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Icon name="lightbulb" size={12} />
                      <span className="truncate max-w-[150px]">{step.improvements}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        dispatch({
                          type: "MOVE_STEP",
                          flowId: flow.id,
                          stepId: step.id,
                          direction: "up",
                        })
                      }
                      disabled={index === 0}
                      title="Flytta upp"
                    >
                      <Icon name="chevron-up" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        dispatch({
                          type: "MOVE_STEP",
                          flowId: flow.id,
                          stepId: step.id,
                          direction: "down",
                        })
                      }
                      disabled={index === flow.steps.length - 1}
                      title="Flytta ner"
                    >
                      <Icon name="chevron-down" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() =>
                        dispatch({
                          type: "DELETE_STEP",
                          flowId: flow.id,
                          stepId: step.id,
                        })
                      }
                      title="Ta bort"
                    >
                      <Icon name="trash-2" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {flow.steps.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Inga steg i detta flöde.
        </p>
      )}
    </div>
  );
}

/* ---- Step Edit Panel ---- */

function StepEditPanel({
  step,
  flowId,
  dispatch,
  onClose,
}: {
  step: ProcessStep;
  flowId: string;
  dispatch: React.Dispatch<Action>;
  onClose: () => void;
}) {
  const meta = STEP_TYPE_META[step.type];

  const updateField = (field: keyof ProcessStep, value: string) => {
    dispatch({
      type: "UPDATE_STEP",
      flowId,
      stepId: step.id,
      updates: { [field]: value },
    });
  };

  return (
    <div className="w-80 shrink-0 border-l border-border/60 bg-muted/20 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon name={meta.icon} size={16} className={meta.color} />
          <h3 className="text-sm font-semibold">Redigera steg</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <Icon name="x" size={14} />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <Select
          label="Stegtyp"
          id="step-type"
          options={STEP_TYPE_OPTIONS}
          value={step.type}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_STEP",
              flowId,
              stepId: step.id,
              updates: { type: e.target.value as StepType },
            })
          }
        />

        <Input
          label="Titel"
          id="step-title"
          value={step.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Namnge steget"
        />

        <Textarea
          label="Beskrivning"
          id="step-description"
          value={step.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Beskriv vad som händer i detta steg"
          className="min-h-[60px]"
        />

        <Input
          label="Ansvarig"
          id="step-responsible"
          value={step.responsible}
          onChange={(e) => updateField("responsible", e.target.value)}
          placeholder="Vem ansvarar?"
        />

        <Input
          label="Tidsuppskattning"
          id="step-time"
          value={step.timeEstimate}
          onChange={(e) => updateField("timeEstimate", e.target.value)}
          placeholder="t.ex. 30 min, 2 h, 1 d"
        />

        {step.type === "decision" && (
          <div className="space-y-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Beslutsgrenar</p>
            <Input
              label="Ja-gren (etikett)"
              id="yes-label"
              value={step.decisionYesLabel}
              onChange={(e) => updateField("decisionYesLabel", e.target.value)}
              placeholder="Ja"
            />
            <Input
              label="Nej-gren (etikett)"
              id="no-label"
              value={step.decisionNoLabel}
              onChange={(e) => updateField("decisionNoLabel", e.target.value)}
              placeholder="Nej"
            />
          </div>
        )}

        <div className="border-t border-border/40 pt-4 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Analys
          </h4>

          <Textarea
            label="Problem / smärtpunkter"
            id="step-issues"
            value={step.issues}
            onChange={(e) => updateField("issues", e.target.value)}
            placeholder="Vilka problem finns med detta steg?"
            className="min-h-[60px]"
          />

          <Textarea
            label="Föreslagna förbättringar"
            id="step-improvements"
            value={step.improvements}
            onChange={(e) => updateField("improvements", e.target.value)}
            placeholder="Hur kan steget förbättras?"
            className="min-h-[60px]"
          />
        </div>

        <div className="border-t border-border/40 pt-4">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => {
              dispatch({
                type: "DELETE_STEP",
                flowId,
                stepId: step.id,
              });
              onClose();
            }}
          >
            <Icon name="trash-2" size={14} /> Ta bort steg
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---- Process Analysis Summary ---- */

function ProcessAnalysis({ flow }: { flow: ProcessFlow }) {
  const totalSteps = flow.steps.length;
  const totalMinutes = flow.steps.reduce(
    (sum, s) => sum + parseTimeEstimate(s.timeEstimate),
    0
  );
  const stepsWithIssues = flow.steps.filter((s) => s.issues.trim().length > 0).length;
  const stepsWithImprovements = flow.steps.filter(
    (s) => s.improvements.trim().length > 0
  ).length;

  // Value stream: process/document are "value-adding", delay is "non-value-adding",
  // decision/start/end are neutral
  const valueAdding = flow.steps.filter(
    (s) => s.type === "process" || s.type === "document"
  ).length;
  const nonValueAdding = flow.steps.filter((s) => s.type === "delay").length;
  const neutralSteps = totalSteps - valueAdding - nonValueAdding;
  const valueRatio =
    valueAdding + nonValueAdding > 0
      ? Math.round((valueAdding / (valueAdding + nonValueAdding)) * 100)
      : 100;

  return (
    <Card className="p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon name="bar-chart-3" size={16} className="text-primary" />
        Processanalys
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Total steps */}
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3">
          <p className="text-xs text-muted-foreground">Totalt antal steg</p>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
            {totalSteps}
          </p>
        </div>

        {/* Total time */}
        <div className="rounded-xl bg-purple-50 dark:bg-purple-950/20 p-3">
          <p className="text-xs text-muted-foreground">Uppskattad total tid</p>
          <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">
            {formatMinutes(totalMinutes)}
          </p>
        </div>

        {/* Issues */}
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3">
          <p className="text-xs text-muted-foreground">Steg med problem</p>
          <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">
            {stepsWithIssues}
          </p>
          {stepsWithImprovements > 0 && (
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {stepsWithImprovements} med förslag
            </p>
          )}
        </div>

        {/* Value stream */}
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3">
          <p className="text-xs text-muted-foreground">Värdeskapande</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {valueRatio}%
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {valueAdding} värde / {nonValueAdding} väntan
          </p>
        </div>

        {/* Step breakdown */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/20 p-3">
          <p className="text-xs text-muted-foreground">Stegtyper</p>
          <div className="mt-1 space-y-0.5">
            {(Object.keys(STEP_TYPE_META) as StepType[]).map((t) => {
              const count = flow.steps.filter((s) => s.type === t).length;
              if (count === 0) return null;
              const m = STEP_TYPE_META[t];
              return (
                <div key={t} className="flex items-center gap-1.5 text-xs">
                  <Icon name={m.icon} size={10} className={m.color} />
                  <span className="text-muted-foreground">
                    {m.label}: {count}
                  </span>
                </div>
              );
            })}
            {neutralSteps > 0 && null}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---- Flow Header (name/description editing) ---- */

function FlowHeader({
  flow,
  dispatch,
}: {
  flow: ProcessFlow;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="border-b border-border/40 px-6 py-3 flex items-center gap-4">
      <div className="flex-1 space-y-1">
        <input
          className="bg-transparent text-base font-bold tracking-tight outline-none w-full placeholder:text-muted-foreground/50"
          value={flow.name}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_FLOW",
              id: flow.id,
              updates: { name: e.target.value },
            })
          }
          placeholder="Namnge flödet..."
        />
        <input
          className="bg-transparent text-xs text-muted-foreground outline-none w-full placeholder:text-muted-foreground/40"
          value={flow.description}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_FLOW",
              id: flow.id,
              updates: { description: e.target.value },
            })
          }
          placeholder="Beskrivning (valfritt)..."
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">
          Skapad {new Date(flow.createdAt).toLocaleDateString("sv-SE")}
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm("Är du säker på att du vill ta bort detta flöde?")) {
              dispatch({ type: "DELETE_FLOW", id: flow.id });
            }
          }}
        >
          <Icon name="trash-2" size={14} /> Ta bort
        </Button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Page Component                                                */
/* ================================================================== */

export default function ProcessFlowPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.flows && Array.isArray(parsed.flows)) {
          dispatch({ type: "LOAD_STATE", flows: parsed.flows });
        }
      }
    } catch {
      // Ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ flows: state.flows })
      );
    } catch {
      // Ignore storage errors
    }
  }, [state.flows, loaded]);

  // Active flow
  const activeFlow = state.flows.find((f) => f.id === state.activeFlowId) ?? null;

  // Selected step
  const selectedStep =
    activeFlow?.steps.find((s) => s.id === state.selectedStepId) ?? null;

  /* ---- Export handlers ---- */

  const handleExportJson = useCallback(() => {
    if (!activeFlow) return;
    const exportData = {
      exportDate: new Date().toISOString(),
      tool: "Processflödeshjälpen",
      flow: {
        name: activeFlow.name,
        description: activeFlow.description,
        createdAt: activeFlow.createdAt,
        steps: activeFlow.steps.map((s, i) => ({
          order: i + 1,
          type: s.type,
          typeLabel: STEP_TYPE_META[s.type].label,
          title: s.title,
          description: s.description,
          responsible: s.responsible,
          timeEstimate: s.timeEstimate,
          issues: s.issues,
          improvements: s.improvements,
          ...(s.type === "decision"
            ? {
                decisionYesLabel: s.decisionYesLabel,
                decisionNoLabel: s.decisionNoLabel,
              }
            : {}),
        })),
      },
    };
    exportToJson(
      `processflode-${activeFlow.name || "namnlost"}-${new Date().toISOString().slice(0, 10)}.json`,
      exportData
    );
  }, [activeFlow]);

  const handleExportXlsx = useCallback(async () => {
    if (!activeFlow) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Processflödeshjälpen",
      exportDate: dateStr,
      subtitle: activeFlow.name || "Namnlöst flöde",
    };

    const stepRows: (string | number)[][] = activeFlow.steps.map((s, i) => [
      i + 1,
      STEP_TYPE_META[s.type].label,
      s.title,
      s.description,
      s.responsible,
      s.timeEstimate,
      s.issues,
      s.improvements,
    ]);

    const analysisRows: (string | number)[][] = activeFlow.steps
      .filter((s) => s.issues || s.improvements)
      .map((s, i) => [
        i + 1,
        s.title,
        STEP_TYPE_META[s.type].label,
        s.issues,
        s.improvements,
      ]);

    const sheets: ExportSheet[] = [
      {
        name: "Processsteg",
        headers: [
          "#",
          "Typ",
          "Titel",
          "Beskrivning",
          "Ansvarig",
          "Tidsuppskattning",
          "Problem",
          "Förbättringar",
        ],
        rows: stepRows,
      },
      {
        name: "Problemanalys",
        headers: ["#", "Steg", "Typ", "Problem", "Förbättringsförslag"],
        rows: analysisRows,
      },
    ];

    await exportToXlsx(
      `processflode-${activeFlow.name || "namnlost"}-${dateStr}.xlsx`,
      sheets,
      metadata
    );
  }, [activeFlow]);

  const handleExportPdf = useCallback(async () => {
    if (!activeFlow) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Processflödeshjälpen",
      exportDate: dateStr,
      subtitle: activeFlow.name || "Namnlöst flöde",
    };

    const totalMinutes = activeFlow.steps.reduce(
      (sum, s) => sum + parseTimeEstimate(s.timeEstimate),
      0
    );
    const stepsWithIssues = activeFlow.steps.filter(
      (s) => s.issues.trim().length > 0
    ).length;
    const valueAdding = activeFlow.steps.filter(
      (s) => s.type === "process" || s.type === "document"
    ).length;
    const nonValueAdding = activeFlow.steps.filter(
      (s) => s.type === "delay"
    ).length;
    const valueRatio =
      valueAdding + nonValueAdding > 0
        ? Math.round((valueAdding / (valueAdding + nonValueAdding)) * 100)
        : 100;

    const sections: PdfSection[] = [
      {
        title: "Sammanfattning",
        type: "keyvalue",
        pairs: [
          { label: "Flödesnamn", value: activeFlow.name || "Namnlöst" },
          {
            label: "Beskrivning",
            value: activeFlow.description || "Ingen beskrivning",
          },
          { label: "Antal steg", value: String(activeFlow.steps.length) },
          { label: "Uppskattad total tid", value: formatMinutes(totalMinutes) },
          { label: "Steg med problem", value: String(stepsWithIssues) },
          {
            label: "Värdeskapande andel",
            value: `${valueRatio}% (${valueAdding} värdeskapande, ${nonValueAdding} väntan)`,
          },
        ],
      },
      {
        title: "Processsteg",
        type: "table",
        headers: [
          "#",
          "Typ",
          "Titel",
          "Ansvarig",
          "Tid",
          "Problem",
          "Förbättringar",
        ],
        rows: activeFlow.steps.map((s, i) => [
          i + 1,
          STEP_TYPE_META[s.type].label,
          s.title,
          s.responsible,
          s.timeEstimate,
          s.issues,
          s.improvements,
        ]),
      },
    ];

    // Add issue analysis if there are issues
    const issueSteps = activeFlow.steps.filter(
      (s) => s.issues.trim().length > 0
    );
    if (issueSteps.length > 0) {
      sections.push({
        title: "Identifierade problem",
        type: "table",
        headers: ["Steg", "Typ", "Problem", "Förbättringsförslag"],
        rows: issueSteps.map((s) => [
          s.title,
          STEP_TYPE_META[s.type].label,
          s.issues,
          s.improvements,
        ]),
      });
    }

    await exportToPdf(
      `processflode-${activeFlow.name || "namnlost"}-${dateStr}.pdf`,
      sections,
      metadata
    );
  }, [activeFlow]);

  /* ---- Render ---- */

  return (
    <FeatureGate featureKey="verktyg.process-flow">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="border-b border-border/60 px-6 py-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Upphandlingar</span>
            <span>/</span>
            <span>Verktyg</span>
            <span>/</span>
            <span className="text-foreground">Processflödeshjälpen</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="git-branch" size={20} />
            </span>
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight">
                Processflödeshjälpen
              </h1>
              <p className="text-xs text-muted-foreground">
                Kartlägg, visualisera och analysera affärsprocesser
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                disabled={!activeFlow}
              >
                <Icon name="download" size={14} /> JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportXlsx}
                disabled={!activeFlow}
              >
                <Icon name="download" size={14} /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={!activeFlow}
              >
                <Icon name="download" size={14} /> PDF
              </Button>
              <Button
                size="sm"
                onClick={() => dispatch({ type: "TOGGLE_ADD_FLOW" })}
              >
                <Icon name="plus" size={14} /> Nytt flöde
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar: Flow list */}
          <FlowSidebar
            flows={state.flows}
            activeFlowId={state.activeFlowId}
            showAddFlow={state.showAddFlow}
            dispatch={dispatch}
          />

          {/* Center: Flow content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {activeFlow ? (
              <>
                {/* Flow name / description */}
                <FlowHeader flow={activeFlow} dispatch={dispatch} />

                {/* Tabs */}
                <div className="border-b border-border/60 px-6">
                  <div className="flex gap-1">
                    <button
                      onClick={() => dispatch({ type: "SET_TAB", tab: "flowchart" })}
                      className={cn(
                        "px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
                        state.activeTab === "flowchart"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon name="git-branch" size={14} />
                        Flödesschema
                      </span>
                    </button>
                    <button
                      onClick={() => dispatch({ type: "SET_TAB", tab: "details" })}
                      className={cn(
                        "px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
                        state.activeTab === "details"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon name="clipboard-list" size={14} />
                        Stegdetaljer
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tab content */}
                <div className="flex flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    {state.activeTab === "flowchart" ? (
                      <FlowchartView
                        flow={activeFlow}
                        selectedStepId={state.selectedStepId}
                        dispatch={dispatch}
                      />
                    ) : (
                      <div className="p-6">
                        <Card className="p-0 overflow-hidden">
                          <StepDetailsTable
                            flow={activeFlow}
                            selectedStepId={state.selectedStepId}
                            dispatch={dispatch}
                          />
                        </Card>
                      </div>
                    )}

                    {/* Process analysis summary */}
                    <div className="px-6 pb-6">
                      <ProcessAnalysis flow={activeFlow} />
                    </div>
                  </div>

                  {/* Right panel: Step editor */}
                  {selectedStep && (
                    <StepEditPanel
                      step={selectedStep}
                      flowId={activeFlow.id}
                      dispatch={dispatch}
                      onClose={() =>
                        dispatch({ type: "SELECT_STEP", id: null })
                      }
                    />
                  )}
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-6">
                  <Icon
                    name="git-branch"
                    size={36}
                    className="text-muted-foreground/40"
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Kartlägg dina processer
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  Skapa ett nytt processflöde för att visualisera, analysera och
                  förbättra dina affärsprocesser. Identifiera flaskhalsar,
                  smärtpunkter och förbättringsmöjligheter.
                </p>
                <div className="flex flex-col gap-3 items-center">
                  <Button
                    onClick={() => dispatch({ type: "TOGGLE_ADD_FLOW" })}
                  >
                    <Icon name="plus" size={14} /> Skapa nytt flöde
                  </Button>
                  <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg">
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3 text-center">
                      <Icon
                        name="cog"
                        size={20}
                        className="mx-auto mb-1 text-blue-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Definiera processsteg
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 text-center">
                      <Icon
                        name="help-circle"
                        size={20}
                        className="mx-auto mb-1 text-amber-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Modellera beslutspunkter
                      </p>
                    </div>
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3 text-center">
                      <Icon
                        name="alert-triangle"
                        size={20}
                        className="mx-auto mb-1 text-red-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Identifiera problem
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

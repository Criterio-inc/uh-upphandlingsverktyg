"use client";

import { useReducer, useEffect, useState, useCallback, useMemo } from "react";
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

type Kategori =
  | "Beslutsfattare"
  | "Användare"
  | "Expert"
  | "Leverantör"
  | "Facklig representant"
  | "Extern intressent";

type Inställning = "Positiv" | "Neutral" | "Negativ" | "Okänd";

type Quadrant = "engagera" | "nöjda" | "informerade" | "övervaka";

type KommunikationsStatus = "Ej påbörjad" | "Pågående" | "Klar";

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  category: Kategori;
  inflytande: number; // 1-5
  intresse: number; // 1-5
  inställning: Inställning;
  notes: string;
  kommunikationsStatus: KommunikationsStatus;
}

interface StakeholderMapState {
  stakeholders: Stakeholder[];
  selectedId: string | null;
  filterCategory: string;
  filterQuadrant: string;
  filterInställning: string;
  showAddForm: boolean;
}

type Action =
  | { type: "ADD_STAKEHOLDER"; stakeholder: Stakeholder }
  | { type: "UPDATE_STAKEHOLDER"; id: string; updates: Partial<Stakeholder> }
  | { type: "DELETE_STAKEHOLDER"; id: string }
  | { type: "SELECT_STAKEHOLDER"; id: string | null }
  | { type: "SET_FILTER_CATEGORY"; value: string }
  | { type: "SET_FILTER_QUADRANT"; value: string }
  | { type: "SET_FILTER_INSTÄLLNING"; value: string }
  | { type: "TOGGLE_ADD_FORM" }
  | { type: "LOAD_STATE"; stakeholders: Stakeholder[] };

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const STORAGE_KEY = "critero-stakeholder-map";

const CATEGORY_OPTIONS: { value: Kategori; label: string }[] = [
  { value: "Beslutsfattare", label: "Beslutsfattare" },
  { value: "Användare", label: "Användare" },
  { value: "Expert", label: "Expert" },
  { value: "Leverantör", label: "Leverantör" },
  { value: "Facklig representant", label: "Facklig representant" },
  { value: "Extern intressent", label: "Extern intressent" },
];

const INSTÄLLNING_OPTIONS: { value: Inställning; label: string }[] = [
  { value: "Positiv", label: "Positiv" },
  { value: "Neutral", label: "Neutral" },
  { value: "Negativ", label: "Negativ" },
  { value: "Okänd", label: "Okänd" },
];

const STATUS_OPTIONS: { value: KommunikationsStatus; label: string }[] = [
  { value: "Ej påbörjad", label: "Ej påbörjad" },
  { value: "Pågående", label: "Pågående" },
  { value: "Klar", label: "Klar" },
];

const QUADRANT_INFO: Record<
  Quadrant,
  {
    label: string;
    description: string;
    frequency: string;
    channel: string;
    bgClass: string;
    icon: string;
  }
> = {
  engagera: {
    label: "Engagera aktivt",
    description:
      "Dessa intressenter har stort inflytande och högt intresse. Involvera dem tidigt, konsultera regelbundet, och säkerställ deras stöd.",
    frequency: "Veckovis",
    channel: "Personliga möten, workshops",
    bgClass: "bg-orange-50 dark:bg-orange-950/20",
    icon: "handshake",
  },
  nöjda: {
    label: "Håll nöjda",
    description:
      "Dessa har stort inflytande men lågt intresse. Informera om stora beslut, undvik att överbelasta med detaljer.",
    frequency: "Månadsvis",
    channel: "Sammanfattande rapporter, statusmöten",
    bgClass: "bg-blue-50 dark:bg-blue-950/20",
    icon: "crown",
  },
  informerade: {
    label: "Håll informerade",
    description:
      "Dessa har högt intresse men lågt inflytande. Ge regelbundna uppdateringar, lyssna på deras feedback.",
    frequency: "Varannan vecka",
    channel: "Nyhetsbrev, informationsmöten",
    bgClass: "bg-green-50 dark:bg-green-950/20",
    icon: "info",
  },
  övervaka: {
    label: "Övervaka",
    description:
      "Dessa har lågt inflytande och intresse. Övervaka för förändringar, minimal kommunikationsinsats.",
    frequency: "Kvartalsvis",
    channel: "Generell kommunikation",
    bgClass: "bg-gray-50 dark:bg-gray-900/20",
    icon: "search",
  },
};

const INSTÄLLNING_COLORS: Record<Inställning, { dot: string; bg: string; text: string }> = {
  Positiv: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  Neutral: {
    dot: "bg-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800/40",
    text: "text-gray-600 dark:text-gray-400",
  },
  Negativ: {
    dot: "bg-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
  Okänd: {
    dot: "bg-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getQuadrant(inflytande: number, intresse: number): Quadrant {
  const highInfluence = inflytande >= 3.5;
  const highInterest = intresse >= 3.5;
  if (highInfluence && highInterest) return "engagera";
  if (highInfluence && !highInterest) return "nöjda";
  if (!highInfluence && highInterest) return "informerade";
  return "övervaka";
}

function createEmptyStakeholder(): Stakeholder {
  return {
    id: uid(),
    name: "",
    role: "",
    organization: "",
    category: "Användare",
    inflytande: 3,
    intresse: 3,
    inställning: "Okänd",
    notes: "",
    kommunikationsStatus: "Ej påbörjad",
  };
}

/* ================================================================== */
/*  Reducer                                                            */
/* ================================================================== */

function createInitialState(): StakeholderMapState {
  return {
    stakeholders: [],
    selectedId: null,
    filterCategory: "all",
    filterQuadrant: "all",
    filterInställning: "all",
    showAddForm: false,
  };
}

function reducer(state: StakeholderMapState, action: Action): StakeholderMapState {
  switch (action.type) {
    case "ADD_STAKEHOLDER":
      return {
        ...state,
        stakeholders: [...state.stakeholders, action.stakeholder],
        showAddForm: false,
      };

    case "UPDATE_STAKEHOLDER":
      return {
        ...state,
        stakeholders: state.stakeholders.map((s) =>
          s.id === action.id ? { ...s, ...action.updates } : s
        ),
      };

    case "DELETE_STAKEHOLDER":
      return {
        ...state,
        stakeholders: state.stakeholders.filter((s) => s.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };

    case "SELECT_STAKEHOLDER":
      return { ...state, selectedId: action.id };

    case "SET_FILTER_CATEGORY":
      return { ...state, filterCategory: action.value };

    case "SET_FILTER_QUADRANT":
      return { ...state, filterQuadrant: action.value };

    case "SET_FILTER_INSTÄLLNING":
      return { ...state, filterInställning: action.value };

    case "TOGGLE_ADD_FORM":
      return { ...state, showAddForm: !state.showAddForm };

    case "LOAD_STATE":
      return { ...state, stakeholders: action.stakeholders };

    default:
      return state;
  }
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Summary Statistics ---- */

function SummaryStats({ stakeholders }: { stakeholders: Stakeholder[] }) {
  const byInställning = useMemo(() => {
    const counts: Record<Inställning, number> = {
      Positiv: 0,
      Neutral: 0,
      Negativ: 0,
      Okänd: 0,
    };
    stakeholders.forEach((s) => {
      counts[s.inställning]++;
    });
    return counts;
  }, [stakeholders]);

  const byQuadrant = useMemo(() => {
    const counts: Record<Quadrant, number> = {
      engagera: 0,
      nöjda: 0,
      informerade: 0,
      övervaka: 0,
    };
    stakeholders.forEach((s) => {
      counts[getQuadrant(s.inflytande, s.intresse)]++;
    });
    return counts;
  }, [stakeholders]);

  const negativeInEngagera = useMemo(() => {
    return stakeholders.filter(
      (s) =>
        s.inställning === "Negativ" && getQuadrant(s.inflytande, s.intresse) === "engagera"
    ).length;
  }, [stakeholders]);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="users" size={14} />
          </span>
          Totalt
        </div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{stakeholders.length}</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="flag" size={14} />
          </span>
          Inställning
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(Object.entries(byInställning) as [Inställning, number][]).map(
            ([key, count]) => (
              <span
                key={key}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  INSTÄLLNING_COLORS[key].bg,
                  INSTÄLLNING_COLORS[key].text
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", INSTÄLLNING_COLORS[key].dot)} />
                {count}
              </span>
            )
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="target" size={14} />
          </span>
          Per kvadrant
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
          <span className="text-muted-foreground">
            Engagera: <strong className="text-foreground">{byQuadrant.engagera}</strong>
          </span>
          <span className="text-muted-foreground">
            Nöjda: <strong className="text-foreground">{byQuadrant.nöjda}</strong>
          </span>
          <span className="text-muted-foreground">
            Inform.: <strong className="text-foreground">{byQuadrant.informerade}</strong>
          </span>
          <span className="text-muted-foreground">
            Övervaka: <strong className="text-foreground">{byQuadrant.övervaka}</strong>
          </span>
        </div>
      </Card>

      <Card className={cn("p-4", negativeInEngagera > 0 && "border-red-300 dark:border-red-800")}>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-lg",
              negativeInEngagera > 0
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon name={negativeInEngagera > 0 ? "alert-triangle" : "shield-alert"} size={14} />
          </span>
          Riskindikator
        </div>
        <div className="mt-1 text-sm">
          {negativeInEngagera > 0 ? (
            <span className="font-semibold text-red-600 dark:text-red-400">
              {negativeInEngagera} negativ{negativeInEngagera > 1 ? "a" : ""} i
              &quot;Engagera aktivt&quot;
            </span>
          ) : (
            <span className="text-muted-foreground">Inga risker identifierade</span>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ---- 2x2 Matrix Visualization ---- */

function StakeholderMatrix({
  stakeholders,
  selectedId,
  onSelect,
}: {
  stakeholders: Stakeholder[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Y-axis label */}
      <div className="mb-2 flex items-center gap-2">
        <Icon name="trending-up" size={14} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Inflytande (lågt → högt)
        </span>
      </div>

      <div className="relative" style={{ minHeight: 440 }}>
        {/* Y-axis markers */}
        <div className="absolute -left-7 top-0 bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground">
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>

        {/* The 2x2 grid */}
        <div className="ml-0 grid grid-cols-2 grid-rows-2 rounded-2xl border border-border/60 overflow-hidden" style={{ minHeight: 440 }}>
          {/* Top-left: Håll nöjda (high influence, low interest) */}
          <div className={cn("relative border-r border-b border-border/40 p-3", QUADRANT_INFO.nöjda.bgClass)}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
              <Icon name={QUADRANT_INFO.nöjda.icon} size={12} />
              {QUADRANT_INFO.nöjda.label}
            </div>
            {/* Dots positioned: intresse 1-2.5 maps to this quadrant, inflytande 3.5-5 */}
            {stakeholders
              .filter((s) => getQuadrant(s.inflytande, s.intresse) === "nöjda")
              .map((s) => {
                // Within this quadrant: x from intresse 1-3.49 -> 0-100%, y from inflytande 5-3.5 -> 0-100%
                const xPct = ((s.intresse - 1) / 2.5) * 100;
                const yPct = ((5 - s.inflytande) / 1.5) * 100;
                return (
                  <QuadrantDot
                    key={s.id}
                    stakeholder={s}
                    xPct={Math.max(5, Math.min(95, xPct))}
                    yPct={Math.max(10, Math.min(90, yPct))}
                    isSelected={selectedId === s.id}
                    onSelect={() => onSelect(selectedId === s.id ? null : s.id)}
                  />
                );
              })}
          </div>

          {/* Top-right: Engagera aktivt (high influence, high interest) */}
          <div className={cn("relative border-b border-border/40 p-3", QUADRANT_INFO.engagera.bgClass)}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
              <Icon name={QUADRANT_INFO.engagera.icon} size={12} />
              {QUADRANT_INFO.engagera.label}
            </div>
            {stakeholders
              .filter((s) => getQuadrant(s.inflytande, s.intresse) === "engagera")
              .map((s) => {
                const xPct = ((s.intresse - 3.5) / 1.5) * 100;
                const yPct = ((5 - s.inflytande) / 1.5) * 100;
                return (
                  <QuadrantDot
                    key={s.id}
                    stakeholder={s}
                    xPct={Math.max(5, Math.min(95, xPct))}
                    yPct={Math.max(10, Math.min(90, yPct))}
                    isSelected={selectedId === s.id}
                    onSelect={() => onSelect(selectedId === s.id ? null : s.id)}
                  />
                );
              })}
          </div>

          {/* Bottom-left: Övervaka (low influence, low interest) */}
          <div className={cn("relative border-r border-border/40 p-3", QUADRANT_INFO.övervaka.bgClass)}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <Icon name={QUADRANT_INFO.övervaka.icon} size={12} />
              {QUADRANT_INFO.övervaka.label}
            </div>
            {stakeholders
              .filter((s) => getQuadrant(s.inflytande, s.intresse) === "övervaka")
              .map((s) => {
                const xPct = ((s.intresse - 1) / 2.5) * 100;
                const yPct = ((3.5 - s.inflytande) / 2.5) * 100;
                return (
                  <QuadrantDot
                    key={s.id}
                    stakeholder={s}
                    xPct={Math.max(5, Math.min(95, xPct))}
                    yPct={Math.max(10, Math.min(90, yPct))}
                    isSelected={selectedId === s.id}
                    onSelect={() => onSelect(selectedId === s.id ? null : s.id)}
                  />
                );
              })}
          </div>

          {/* Bottom-right: Håll informerade (low influence, high interest) */}
          <div className={cn("relative p-3", QUADRANT_INFO.informerade.bgClass)}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
              <Icon name={QUADRANT_INFO.informerade.icon} size={12} />
              {QUADRANT_INFO.informerade.label}
            </div>
            {stakeholders
              .filter((s) => getQuadrant(s.inflytande, s.intresse) === "informerade")
              .map((s) => {
                const xPct = ((s.intresse - 3.5) / 1.5) * 100;
                const yPct = ((3.5 - s.inflytande) / 2.5) * 100;
                return (
                  <QuadrantDot
                    key={s.id}
                    stakeholder={s}
                    xPct={Math.max(5, Math.min(95, xPct))}
                    yPct={Math.max(10, Math.min(90, yPct))}
                    isSelected={selectedId === s.id}
                    onSelect={() => onSelect(selectedId === s.id ? null : s.id)}
                  />
                );
              })}
          </div>
        </div>

        {/* X-axis markers */}
        <div className="mt-1 ml-0 flex justify-between text-[10px] text-muted-foreground px-1">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      {/* X-axis label */}
      <div className="mt-1 flex items-center justify-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Intresse (lågt → högt)
        </span>
        <Icon name="arrow-right" size={14} className="text-muted-foreground" />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        {(Object.entries(INSTÄLLNING_COLORS) as [Inställning, typeof INSTÄLLNING_COLORS.Positiv][]).map(
          ([key, colors]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={cn("h-3 w-3 rounded-full", colors.dot)} />
              {key}
            </span>
          )
        )}
      </div>
    </div>
  );
}

/* ---- Quadrant Dot ---- */

function QuadrantDot({
  stakeholder,
  xPct,
  yPct,
  isSelected,
  onSelect,
}: {
  stakeholder: Stakeholder;
  xPct: number;
  yPct: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = INSTÄLLNING_COLORS[stakeholder.inställning];

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, -50%)",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onSelect}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm transition-all duration-150",
          colors.dot,
          isSelected
            ? "scale-125 border-primary ring-2 ring-primary/30"
            : "border-white dark:border-gray-800 hover:scale-110"
        )}
        title={stakeholder.name}
      >
        <span className="text-white drop-shadow-sm">
          {stakeholder.name ? stakeholder.name.charAt(0).toUpperCase() : "?"}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
          <div className="font-semibold">{stakeholder.name || "Namnlös"}</div>
          {stakeholder.role && <div className="text-muted-foreground">{stakeholder.role}</div>}
          {stakeholder.organization && (
            <div className="text-muted-foreground">{stakeholder.organization}</div>
          )}
          <div className="mt-1 flex items-center gap-2">
            <span>Inflytande: {stakeholder.inflytande}</span>
            <span>Intresse: {stakeholder.intresse}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
            <span>{stakeholder.inställning}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Add Stakeholder Form ---- */

function AddStakeholderForm({
  onAdd,
  onCancel,
}: {
  onAdd: (s: Stakeholder) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Stakeholder>(createEmptyStakeholder);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd(form);
    setForm(createEmptyStakeholder());
  };

  return (
    <Card className="border-primary/30 p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="user-plus" size={16} className="text-primary" />
            Lägg till intressent
          </h3>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <Icon name="x" size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            label="Organisation"
            placeholder="T.ex. Kommunen"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
          />
          <Select
            label="Kategori"
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Kategori })}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              Inflytande: {form.inflytande}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={form.inflytande}
              onChange={(e) => setForm({ ...form, inflytande: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Lågt</span>
              <span>Högt</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              Intresse: {form.intresse}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={form.intresse}
              onChange={(e) => setForm({ ...form, intresse: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Lågt</span>
              <span>Högt</span>
            </div>
          </div>
          <Select
            label="Inställning"
            options={INSTÄLLNING_OPTIONS}
            value={form.inställning}
            onChange={(e) => setForm({ ...form, inställning: e.target.value as Inställning })}
          />
        </div>

        <Textarea
          label="Anteckningar / Kommunikationsplan"
          placeholder="Beskriv hur denna intressent bör hanteras..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={!form.name.trim()}>
            <Icon name="plus" size={14} /> Lägg till
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Avbryt
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ---- Stakeholder Detail Panel ---- */

function StakeholderDetail({
  stakeholder,
  dispatch,
  onClose,
}: {
  stakeholder: Stakeholder;
  dispatch: React.Dispatch<Action>;
  onClose: () => void;
}) {
  const quadrant = getQuadrant(stakeholder.inflytande, stakeholder.intresse);
  const qInfo = QUADRANT_INFO[quadrant];
  const colors = INSTÄLLNING_COLORS[stakeholder.inställning];

  return (
    <Card className="border-primary/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="user" size={16} className="text-primary" />
          Redigera intressent
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => dispatch({ type: "DELETE_STAKEHOLDER", id: stakeholder.id })}
          >
            <Icon name="x" size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="arrow-left" size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Namn"
            value={stakeholder.name}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_STAKEHOLDER",
                id: stakeholder.id,
                updates: { name: e.target.value },
              })
            }
          />
          <Input
            label="Roll/Titel"
            value={stakeholder.role}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_STAKEHOLDER",
                id: stakeholder.id,
                updates: { role: e.target.value },
              })
            }
          />
          <Input
            label="Organisation"
            value={stakeholder.organization}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_STAKEHOLDER",
                id: stakeholder.id,
                updates: { organization: e.target.value },
              })
            }
          />
          <Select
            label="Kategori"
            options={CATEGORY_OPTIONS}
            value={stakeholder.category}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_STAKEHOLDER",
                id: stakeholder.id,
                updates: { category: e.target.value as Kategori },
              })
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              Inflytande: {stakeholder.inflytande}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={stakeholder.inflytande}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_STAKEHOLDER",
                  id: stakeholder.id,
                  updates: { inflytande: Number(e.target.value) },
                })
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Lågt</span>
              <span>Högt</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              Intresse: {stakeholder.intresse}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={stakeholder.intresse}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_STAKEHOLDER",
                  id: stakeholder.id,
                  updates: { intresse: Number(e.target.value) },
                })
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Lågt</span>
              <span>Högt</span>
            </div>
          </div>
          <Select
            label="Inställning"
            options={INSTÄLLNING_OPTIONS}
            value={stakeholder.inställning}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_STAKEHOLDER",
                id: stakeholder.id,
                updates: { inställning: e.target.value as Inställning },
              })
            }
          />
        </div>

        {/* Quadrant strategy info */}
        <div className={cn("rounded-xl p-3 text-sm", qInfo.bgClass)}>
          <div className="flex items-center gap-1.5 font-semibold">
            <Icon name={qInfo.icon} size={14} />
            Strategi: {qInfo.label}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{qInfo.description}</p>
          <div className="mt-2 flex gap-4 text-xs">
            <span>
              <strong>Frekvens:</strong> {qInfo.frequency}
            </span>
            <span>
              <strong>Kanal:</strong> {qInfo.channel}
            </span>
          </div>
        </div>

        {/* Inställning badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Inställning:</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              colors.bg,
              colors.text
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
            {stakeholder.inställning}
          </span>
        </div>

        <Textarea
          label="Anteckningar / Kommunikationsplan"
          value={stakeholder.notes}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_STAKEHOLDER",
              id: stakeholder.id,
              updates: { notes: e.target.value },
            })
          }
        />
      </div>
    </Card>
  );
}

/* ---- Stakeholder List ---- */

function StakeholderList({
  stakeholders,
  selectedId,
  onSelect,
  filterCategory,
  filterQuadrant,
  filterInställning,
  dispatch,
}: {
  stakeholders: Stakeholder[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  filterCategory: string;
  filterQuadrant: string;
  filterInställning: string;
  dispatch: React.Dispatch<Action>;
}) {
  const filtered = useMemo(() => {
    return stakeholders.filter((s) => {
      if (filterCategory !== "all" && s.category !== filterCategory) return false;
      if (filterQuadrant !== "all" && getQuadrant(s.inflytande, s.intresse) !== filterQuadrant)
        return false;
      if (filterInställning !== "all" && s.inställning !== filterInställning) return false;
      return true;
    });
  }, [stakeholders, filterCategory, filterQuadrant, filterInställning]);

  const quadrantFilterOptions = [
    { value: "all", label: "Alla kvadranter" },
    { value: "engagera", label: "Engagera aktivt" },
    { value: "nöjda", label: "Håll nöjda" },
    { value: "informerade", label: "Håll informerade" },
    { value: "övervaka", label: "Övervaka" },
  ];

  const categoryFilterOptions = [
    { value: "all", label: "Alla kategorier" },
    ...CATEGORY_OPTIONS,
  ];

  const inställningFilterOptions = [
    { value: "all", label: "Alla inställningar" },
    ...INSTÄLLNING_OPTIONS,
  ];

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="w-full sm:w-auto sm:flex-1">
          <Select
            options={categoryFilterOptions}
            value={filterCategory}
            onChange={(e) => dispatch({ type: "SET_FILTER_CATEGORY", value: e.target.value })}
          />
        </div>
        <div className="w-full sm:w-auto sm:flex-1">
          <Select
            options={quadrantFilterOptions}
            value={filterQuadrant}
            onChange={(e) => dispatch({ type: "SET_FILTER_QUADRANT", value: e.target.value })}
          />
        </div>
        <div className="w-full sm:w-auto sm:flex-1">
          <Select
            options={inställningFilterOptions}
            value={filterInställning}
            onChange={(e) => dispatch({ type: "SET_FILTER_INSTÄLLNING", value: e.target.value })}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {stakeholders.length === 0
            ? "Inga intressenter tillagda ännu. Klicka \"Lägg till\" för att börja."
            : "Inga intressenter matchar filtren."}
        </p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((s) => {
            const quadrant = getQuadrant(s.inflytande, s.intresse);
            const colors = INSTÄLLNING_COLORS[s.inställning];
            const isSelected = selectedId === s.id;

            return (
              <button
                key={s.id}
                onClick={() => onSelect(isSelected ? null : s.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-150",
                  isSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 bg-card hover:bg-accent"
                )}
              >
                <span className={cn("h-3 w-3 shrink-0 rounded-full", colors.dot)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{s.name || "Namnlös"}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {s.category}
                    </span>
                  </div>
                  {s.role && (
                    <div className="truncate text-xs text-muted-foreground">{s.role}</div>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {QUADRANT_INFO[quadrant].label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- Strategy Recommendations ---- */

function StrategyRecommendations({ stakeholders }: { stakeholders: Stakeholder[] }) {
  const quadrants: Quadrant[] = ["engagera", "nöjda", "informerade", "övervaka"];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {quadrants.map((q) => {
        const info = QUADRANT_INFO[q];
        const count = stakeholders.filter(
          (s) => getQuadrant(s.inflytande, s.intresse) === q
        ).length;

        return (
          <Card key={q} className={cn("p-4", info.bgClass)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon name={info.icon} size={16} />
                {info.label}
              </div>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium">
                {count} st
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{info.description}</p>
            <div className="mt-2 flex gap-4 text-xs">
              <span>
                <strong>Frekvens:</strong> {info.frequency}
              </span>
              <span>
                <strong>Kanal:</strong> {info.channel}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---- Communication Plan Table ---- */

function CommunicationPlanTable({
  stakeholders,
  dispatch,
}: {
  stakeholders: Stakeholder[];
  dispatch: React.Dispatch<Action>;
}) {
  if (stakeholders.length === 0) {
    return (
      <Card className="p-5">
        <p className="text-center text-sm text-muted-foreground">
          Lägg till intressenter för att generera kommunikationsplanen.
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
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Intressent
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Strategi
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Frekvens
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Kanal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Inställning
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.map((s) => {
              const quadrant = getQuadrant(s.inflytande, s.intresse);
              const info = QUADRANT_INFO[quadrant];
              const colors = INSTÄLLNING_COLORS[s.inställning];

              return (
                <tr key={s.id} className="border-b border-border/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.name || "Namnlös"}</div>
                    {s.role && (
                      <div className="text-xs text-muted-foreground">{s.role}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Icon name={info.icon} size={12} />
                      {info.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{info.frequency}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{info.channel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        colors.bg,
                        colors.text
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                      {s.inställning}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={s.kommunikationsStatus}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_STAKEHOLDER",
                          id: s.id,
                          updates: { kommunikationsStatus: e.target.value as KommunikationsStatus },
                        })
                      }
                      className="rounded-lg border border-input bg-card px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

export default function StakeholderMapPage() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "LOAD_STATE", stakeholders: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stakeholders));
    } catch {
      // localStorage full or unavailable
    }
  }, [state.stakeholders]);

  const selectedStakeholder = useMemo(() => {
    if (!state.selectedId) return null;
    return state.stakeholders.find((s) => s.id === state.selectedId) ?? null;
  }, [state.selectedId, state.stakeholders]);

  const handleExportJson = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      tool: "Intressentanalys",
      stakeholders: state.stakeholders.map((s) => ({
        ...s,
        quadrant: QUADRANT_INFO[getQuadrant(s.inflytande, s.intresse)].label,
        strategy: QUADRANT_INFO[getQuadrant(s.inflytande, s.intresse)].description,
        recommendedFrequency: QUADRANT_INFO[getQuadrant(s.inflytande, s.intresse)].frequency,
      })),
    };
    exportToJson(`intressentanalys-${new Date().toISOString().slice(0, 10)}.json`, exportData);
  }, [state.stakeholders]);

  const handleExportXlsx = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Intressentanalys",
      exportDate: dateStr,
      subtitle: `${state.stakeholders.length} intressenter`,
    };

    const stakeholderRows: (string | number)[][] = state.stakeholders.map((s) => {
      const q = getQuadrant(s.inflytande, s.intresse);
      return [s.name, s.role, s.organization, s.category, s.inflytande, s.intresse, s.inställning, QUADRANT_INFO[q].label];
    });

    const commRows: (string | number)[][] = state.stakeholders.map((s) => {
      const q = getQuadrant(s.inflytande, s.intresse);
      const info = QUADRANT_INFO[q];
      return [s.name, info.label, info.frequency, info.channel, s.inställning, s.kommunikationsStatus, s.notes];
    });

    const sheets: ExportSheet[] = [
      {
        name: "Intressenter",
        headers: ["Namn", "Roll", "Organisation", "Kategori", "Inflytande", "Intresse", "Inställning", "Kvadrant"],
        rows: stakeholderRows,
      },
      {
        name: "Kommunikationsplan",
        headers: ["Namn", "Strategi", "Frekvens", "Kanal", "Inställning", "Status", "Anteckningar"],
        rows: commRows,
      },
    ];

    await exportToXlsx(`intressentanalys-${dateStr}.xlsx`, sheets, metadata);
  }, [state.stakeholders]);

  const handleExportPdf = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const metadata: ExportMetadata = {
      toolName: "Intressentanalys",
      exportDate: dateStr,
      subtitle: `${state.stakeholders.length} intressenter`,
    };

    const sections: PdfSection[] = [
      {
        title: "Intressentöversikt",
        type: "table",
        headers: ["Namn", "Kategori", "Inflytande", "Intresse", "Inställning", "Kvadrant"],
        rows: state.stakeholders.map((s) => {
          const q = getQuadrant(s.inflytande, s.intresse);
          return [s.name, s.category, s.inflytande, s.intresse, s.inställning, QUADRANT_INFO[q].label];
        }),
      },
      {
        title: "Kommunikationsplan",
        type: "table",
        headers: ["Namn", "Strategi", "Frekvens", "Kanal", "Status"],
        rows: state.stakeholders.map((s) => {
          const q = getQuadrant(s.inflytande, s.intresse);
          const info = QUADRANT_INFO[q];
          return [s.name, info.label, info.frequency, info.channel, s.kommunikationsStatus];
        }),
      },
    ];

    await exportToPdf(`intressentanalys-${dateStr}.pdf`, sections, metadata);
  }, [state.stakeholders]);

  return (
    <FeatureGate featureKey="verktyg.stakeholder-map">
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Upphandlingar</span>
          <span>/</span>
          <span>Verktyg</span>
          <span>/</span>
          <span className="text-foreground">Intressentanalys</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="users" size={20} />
          </span>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Intressentanalys</h1>
            <p className="text-xs text-muted-foreground">
              Kartlägg och analysera intressenter med 2x2-matris och strategirekommendationer
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
            <Button
              size="sm"
              onClick={() => dispatch({ type: "TOGGLE_ADD_FORM" })}
            >
              <Icon name="user-plus" size={14} /> Lägg till
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Summary stats */}
          <SummaryStats stakeholders={state.stakeholders} />

          {/* Two-column layout: Matrix + List */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            {/* Left: Matrix */}
            <div className="xl:col-span-3">
              <Card className="p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Icon name="target" size={16} className="text-primary" />
                  Intressentmatris
                </h2>
                <StakeholderMatrix
                  stakeholders={state.stakeholders}
                  selectedId={state.selectedId}
                  onSelect={(id) => dispatch({ type: "SELECT_STAKEHOLDER", id })}
                />
              </Card>
            </div>

            {/* Right: List + Add/Edit form */}
            <div className="space-y-4 xl:col-span-2">
              {/* Add form */}
              {state.showAddForm && (
                <AddStakeholderForm
                  onAdd={(s) => dispatch({ type: "ADD_STAKEHOLDER", stakeholder: s })}
                  onCancel={() => dispatch({ type: "TOGGLE_ADD_FORM" })}
                />
              )}

              {/* Detail panel */}
              {selectedStakeholder && !state.showAddForm && (
                <StakeholderDetail
                  stakeholder={selectedStakeholder}
                  dispatch={dispatch}
                  onClose={() => dispatch({ type: "SELECT_STAKEHOLDER", id: null })}
                />
              )}

              {/* Stakeholder list */}
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <Icon name="users" size={16} className="text-primary" />
                    Intressenter ({state.stakeholders.length})
                  </h2>
                  {!state.showAddForm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: "TOGGLE_ADD_FORM" })}
                    >
                      <Icon name="plus" size={14} /> Lägg till
                    </Button>
                  )}
                </div>
                <StakeholderList
                  stakeholders={state.stakeholders}
                  selectedId={state.selectedId}
                  onSelect={(id) => dispatch({ type: "SELECT_STAKEHOLDER", id })}
                  filterCategory={state.filterCategory}
                  filterQuadrant={state.filterQuadrant}
                  filterInställning={state.filterInställning}
                  dispatch={dispatch}
                />
              </Card>
            </div>
          </div>

          {/* Strategy Recommendations */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Icon name="lightbulb" size={16} className="text-primary" />
              Strategirekommendationer per kvadrant
            </h2>
            <StrategyRecommendations stakeholders={state.stakeholders} />
          </div>

          {/* Communication Plan */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Icon name="flag" size={16} className="text-primary" />
              Kommunikationsplan
            </h2>
            <CommunicationPlanTable stakeholders={state.stakeholders} dispatch={dispatch} />
          </div>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}

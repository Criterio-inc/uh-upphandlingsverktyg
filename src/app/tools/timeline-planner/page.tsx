"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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

type ProcedureType = "open" | "selective" | "simplified" | "negotiated";
type ThresholdType = "over" | "under";

interface PhaseDefinition {
  id: string;
  name: string;
  minDays: number;
  defaultDays: number;
  adjustable: boolean;
  color: string;
  legalBasis: string;
}

interface TimelinePhase {
  id: string;
  name: string;
  days: number;
  minDays: number;
  adjustable: boolean;
  color: string;
  legalBasis: string;
  startDate: Date;
  endDate: Date;
}

interface PlannerState {
  procedureType: ProcedureType;
  threshold: ThresholdType;
  contractDate: string;
  eSubmission: boolean;
  preAnnouncement: boolean;
  postalNotification: boolean;
  customDurations: Record<string, number>;
}

/* ================================================================== */
/*  Phase definitions per procedure type                                */
/* ================================================================== */

function getPhaseDefinitions(
  procedureType: ProcedureType,
  threshold: ThresholdType,
  eSubmission: boolean,
  preAnnouncement: boolean,
  postalNotification: boolean
): PhaseDefinition[] {
  if (procedureType === "open" && threshold === "over") {
    let announceDays = 30;
    if (!eSubmission) announceDays = 35;
    if (preAnnouncement) announceDays = 22;
    const standstillDays = postalNotification ? 15 : 10;

    return [
      {
        id: "preparation",
        name: "Förberedelse & kravställning",
        minDays: 1,
        defaultDays: 30,
        adjustable: true,
        color: "bg-blue-500",
        legalBasis: "Ingen lagstadgad minimtid — anpassas efter komplexitet",
      },
      {
        id: "announcement",
        name: "Annonsering & anbudstid",
        minDays: announceDays,
        defaultDays: announceDays,
        adjustable: true,
        color: "bg-orange-500",
        legalBasis: `LOU 11 kap. 1§ — minst ${announceDays} dagar${
          preAnnouncement
            ? " (förkortat med förhandsannonsering)"
            : !eSubmission
            ? " (utan e-upphandling)"
            : ""
        }`,
      },
      {
        id: "evaluation",
        name: "Anbudsutvärdering",
        minDays: 1,
        defaultDays: 20,
        adjustable: true,
        color: "bg-emerald-500",
        legalBasis: "Ingen lagstadgad minimtid — anpassas efter omfattning",
      },
      {
        id: "award",
        name: "Tilldelningsbeslut",
        minDays: 1,
        defaultDays: 1,
        adjustable: false,
        color: "bg-violet-500",
        legalBasis: "LOU 12 kap. 12§ — tilldelningsbeslut ska meddelas skriftligt",
      },
      {
        id: "standstill",
        name: "Avtalsspärr (standstill)",
        minDays: standstillDays,
        defaultDays: standstillDays,
        adjustable: false,
        color: "bg-red-500",
        legalBasis: `LOU 20 kap. 1§ — ${standstillDays} dagars avtalsspärr${
          postalNotification ? " (brevdelgivning)" : " (elektronisk delgivning)"
        }`,
      },
      {
        id: "signing",
        name: "Avtalstecknande",
        minDays: 1,
        defaultDays: 5,
        adjustable: true,
        color: "bg-gray-500",
        legalBasis: "Ingen lagstadgad minimtid",
      },
    ];
  }

  if (procedureType === "simplified" || (procedureType === "open" && threshold === "under")) {
    return [
      {
        id: "preparation",
        name: "Förberedelse & kravställning",
        minDays: 1,
        defaultDays: 20,
        adjustable: true,
        color: "bg-blue-500",
        legalBasis: "Ingen lagstadgad minimtid — anpassas efter komplexitet",
      },
      {
        id: "announcement",
        name: "Annonsering & anbudstid",
        minDays: 14,
        defaultDays: 14,
        adjustable: true,
        color: "bg-orange-500",
        legalBasis: "LOU 19 kap. 8§ — minst 14 dagar (förenklat förfarande)",
      },
      {
        id: "evaluation",
        name: "Anbudsutvärdering",
        minDays: 1,
        defaultDays: 15,
        adjustable: true,
        color: "bg-emerald-500",
        legalBasis: "Ingen lagstadgad minimtid — anpassas efter omfattning",
      },
      {
        id: "award",
        name: "Tilldelningsbeslut",
        minDays: 1,
        defaultDays: 1,
        adjustable: false,
        color: "bg-violet-500",
        legalBasis: "LOU 12 kap. 12§ — tilldelningsbeslut ska meddelas skriftligt",
      },
      {
        id: "standstill",
        name: "Avtalsspärr (standstill)",
        minDays: 10,
        defaultDays: 10,
        adjustable: false,
        color: "bg-red-500",
        legalBasis: "LOU 20 kap. 1§ — 10 dagars avtalsspärr",
      },
      {
        id: "signing",
        name: "Avtalstecknande",
        minDays: 1,
        defaultDays: 5,
        adjustable: true,
        color: "bg-gray-500",
        legalBasis: "Ingen lagstadgad minimtid",
      },
    ];
  }

  if (procedureType === "selective") {
    let applicationDays = 30;
    let tenderDays = 25;
    if (preAnnouncement) tenderDays = 10;
    if (threshold === "under") {
      applicationDays = 15;
      tenderDays = 15;
    }
    const standstillDays = postalNotification ? 15 : 10;

    return [
      {
        id: "preparation",
        name: "Förberedelse",
        minDays: 1,
        defaultDays: 30,
        adjustable: true,
        color: "bg-blue-500",
        legalBasis: "Ingen lagstadgad minimtid — anpassas efter komplexitet",
      },
      {
        id: "application",
        name: "Annonsering & ansökningstid",
        minDays: applicationDays,
        defaultDays: applicationDays,
        adjustable: true,
        color: "bg-orange-500",
        legalBasis: `LOU 11 kap. 3§ — minst ${applicationDays} dagar för ansökningar`,
      },
      {
        id: "qualification",
        name: "Kvalificering",
        minDays: 1,
        defaultDays: 15,
        adjustable: true,
        color: "bg-cyan-500",
        legalBasis: "Ingen lagstadgad minimtid — kvalificering av sökande",
      },
      {
        id: "tender-invite",
        name: "Anbudsinbjudan & anbudstid",
        minDays: tenderDays,
        defaultDays: tenderDays,
        adjustable: true,
        color: "bg-amber-500",
        legalBasis: `LOU 11 kap. 4§ — minst ${tenderDays} dagar${
          preAnnouncement ? " (förkortat med förhandsannonsering)" : ""
        }`,
      },
      {
        id: "evaluation",
        name: "Utvärdering",
        minDays: 1,
        defaultDays: 20,
        adjustable: true,
        color: "bg-emerald-500",
        legalBasis: "Ingen lagstadgad minimtid — anpassas efter omfattning",
      },
      {
        id: "award",
        name: "Tilldelningsbeslut",
        minDays: 1,
        defaultDays: 1,
        adjustable: false,
        color: "bg-violet-500",
        legalBasis: "LOU 12 kap. 12§ — tilldelningsbeslut ska meddelas skriftligt",
      },
      {
        id: "standstill",
        name: "Avtalsspärr (standstill)",
        minDays: standstillDays,
        defaultDays: standstillDays,
        adjustable: false,
        color: "bg-red-500",
        legalBasis: `LOU 20 kap. 1§ — ${standstillDays} dagars avtalsspärr`,
      },
      {
        id: "signing",
        name: "Avtalstecknande",
        minDays: 1,
        defaultDays: 5,
        adjustable: true,
        color: "bg-gray-500",
        legalBasis: "Ingen lagstadgad minimtid",
      },
    ];
  }

  // Negotiated procedure
  if (procedureType === "negotiated") {
    const applicationDays = threshold === "over" ? 30 : 15;
    const standstillDays = postalNotification ? 15 : 10;

    return [
      {
        id: "preparation",
        name: "Förberedelse",
        minDays: 1,
        defaultDays: 30,
        adjustable: true,
        color: "bg-blue-500",
        legalBasis: "Ingen lagstadgad minimtid — anpassas efter komplexitet",
      },
      {
        id: "application",
        name: "Annonsering & ansökningstid",
        minDays: applicationDays,
        defaultDays: applicationDays,
        adjustable: true,
        color: "bg-orange-500",
        legalBasis: `LOU 11 kap. 3§ — minst ${applicationDays} dagar för ansökningar`,
      },
      {
        id: "qualification",
        name: "Kvalificering",
        minDays: 1,
        defaultDays: 15,
        adjustable: true,
        color: "bg-cyan-500",
        legalBasis: "Ingen lagstadgad minimtid — kvalificering av sökande",
      },
      {
        id: "negotiation",
        name: "Förhandlingsrundor",
        minDays: 1,
        defaultDays: 30,
        adjustable: true,
        color: "bg-pink-500",
        legalBasis: "Ingen lagstadgad minimtid — beror på förhandlingens omfattning",
      },
      {
        id: "final-tender",
        name: "Slutgiltigt anbud",
        minDays: 1,
        defaultDays: 10,
        adjustable: true,
        color: "bg-amber-500",
        legalBasis: "Ingen lagstadgad minimtid — skälig tid för slutgiltigt anbud",
      },
      {
        id: "evaluation",
        name: "Utvärdering",
        minDays: 1,
        defaultDays: 20,
        adjustable: true,
        color: "bg-emerald-500",
        legalBasis: "Ingen lagstadgad minimtid — anpassas efter omfattning",
      },
      {
        id: "award",
        name: "Tilldelningsbeslut",
        minDays: 1,
        defaultDays: 1,
        adjustable: false,
        color: "bg-violet-500",
        legalBasis: "LOU 12 kap. 12§ — tilldelningsbeslut ska meddelas skriftligt",
      },
      {
        id: "standstill",
        name: "Avtalsspärr (standstill)",
        minDays: standstillDays,
        defaultDays: standstillDays,
        adjustable: false,
        color: "bg-red-500",
        legalBasis: `LOU 20 kap. 1§ — ${standstillDays} dagars avtalsspärr`,
      },
      {
        id: "signing",
        name: "Avtalstecknande",
        minDays: 1,
        defaultDays: 5,
        adjustable: true,
        color: "bg-gray-500",
        legalBasis: "Ingen lagstadgad minimtid",
      },
    ];
  }

  return [];
}

/* ================================================================== */
/*  Date helpers                                                        */
/* ================================================================== */

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ================================================================== */
/*  Build timeline (backwards from contract date)                       */
/* ================================================================== */

function buildTimeline(
  definitions: PhaseDefinition[],
  contractDate: Date,
  customDurations: Record<string, number>
): TimelinePhase[] {
  const phases: TimelinePhase[] = [];
  let currentEnd = startOfDay(contractDate);

  // Work backwards from contract date
  for (let i = definitions.length - 1; i >= 0; i--) {
    const def = definitions[i];
    const customDays = customDurations[def.id];
    const days = customDays !== undefined ? Math.max(customDays, def.minDays) : def.defaultDays;

    const endDate = new Date(currentEnd);
    const startDate = subtractDays(endDate, days);

    phases.unshift({
      id: def.id,
      name: def.name,
      days,
      minDays: def.minDays,
      adjustable: def.adjustable,
      color: def.color,
      legalBasis: def.legalBasis,
      startDate,
      endDate,
    });

    currentEnd = startDate;
  }

  return phases;
}

/* ================================================================== */
/*  Sub-components                                                      */
/* ================================================================== */

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <a href="/cases" className="hover:text-foreground transition-colors">
        Upphandlingar
      </a>
      <span>/</span>
      <a href="/tools/timeline-planner" className="hover:text-foreground transition-colors">
        Verktyg
      </a>
      <span>/</span>
      <span className="text-foreground font-medium">Tidslinjeplanerare</span>
    </nav>
  );
}

/* ---- Gantt chart ---- */

function GanttChart({
  phases,
  contractDate,
}: {
  phases: TimelinePhase[];
  contractDate: Date;
}) {
  if (phases.length === 0) return null;

  const timelineStart = phases[0].startDate;
  const timelineEnd = phases[phases.length - 1].endDate;
  const totalDays = daysBetween(timelineStart, timelineEnd);
  const today = startOfDay(new Date());
  const todayOffset = daysBetween(timelineStart, today);
  const todayPct = totalDays > 0 ? (todayOffset / totalDays) * 100 : 0;
  const showTodayLine = todayPct >= 0 && todayPct <= 100;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Icon name="bar-chart-3" size={16} className="text-primary" />
          Visuell tidslinje
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          Totalt: {totalDays} dagar ({Math.round(totalDays / 30.44)} mån)
        </span>
      </div>

      {/* Date range labels */}
      <div className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
        <span>{formatDate(timelineStart)}</span>
        <span>{formatDate(timelineEnd)}</span>
      </div>

      {/* Gantt bars */}
      <div className="relative space-y-1.5">
        {/* Today line */}
        {showTodayLine && (
          <div
            className="absolute top-0 bottom-0 z-10 border-l-2 border-dashed border-primary/70"
            style={{ left: `${todayPct}%` }}
          >
            <span className="absolute -top-5 left-1 text-[9px] font-bold text-primary whitespace-nowrap">
              Idag
            </span>
          </div>
        )}

        {phases.map((phase) => {
          const phaseStart = daysBetween(timelineStart, phase.startDate);
          const phaseDuration = phase.days;
          const leftPct = totalDays > 0 ? (phaseStart / totalDays) * 100 : 0;
          const widthPct = totalDays > 0 ? (phaseDuration / totalDays) * 100 : 0;

          return (
            <div key={phase.id} className="flex items-center gap-2">
              <div className="w-44 shrink-0 text-right">
                <span className="text-[11px] text-muted-foreground truncate block">
                  {phase.name}
                </span>
              </div>
              <div className="relative flex-1 h-7 rounded-lg bg-muted/30">
                <div
                  className={cn(
                    "absolute top-0 h-full rounded-md flex items-center justify-center text-white text-[10px] font-medium transition-all duration-300 min-w-[2px]",
                    phase.color
                  )}
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 0.5)}%`,
                  }}
                  title={`${phase.name}: ${formatDate(phase.startDate)} — ${formatDate(phase.endDate)} (${phase.days} dagar)`}
                >
                  {widthPct > 8 && (
                    <span className="truncate px-1">{phase.days}d</span>
                  )}
                </div>
              </div>
              <div className="w-36 shrink-0">
                <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatDate(phase.startDate)} — {formatDate(phase.endDate)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Förberedelse
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> Annonsering
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Utvärdering
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Avtalsspärr
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-gray-500" /> Avtalstecknande
        </span>
        {showTodayLine && (
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-0 border-l-2 border-dashed border-primary" /> Idag
          </span>
        )}
      </div>
    </Card>
  );
}

/* ---- Phase card ---- */

function PhaseCard({
  phase,
  onDurationChange,
}: {
  phase: TimelinePhase;
  onDurationChange: (id: string, days: number) => void;
}) {
  const isPastStart = phase.startDate < startOfDay(new Date());
  const isLocked = !phase.adjustable;

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200",
        isPastStart && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Color indicator */}
        <div className={cn("mt-1 h-10 w-1.5 rounded-full shrink-0", phase.color)} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold truncate">{phase.name}</h4>
            {isLocked && (
              <span
                className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                title="Lagstadgad minimtid — kan ej förkortas"
              >
                <Icon name="shield-alert" size={12} />
                Låst
              </span>
            )}
            {isPastStart && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-destructive">
                <Icon name="alert-triangle" size={12} />
                Passerat
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2 tabular-nums">
            <span className="flex items-center gap-1">
              <Icon name="clock" size={12} />
              {formatDate(phase.startDate)}
            </span>
            <span className="text-muted-foreground/50">→</span>
            <span>{formatDate(phase.endDate)}</span>
          </div>

          {/* Legal basis info */}
          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
            <Icon name="info" size={12} className="mt-0.5 shrink-0 text-primary" />
            <span>{phase.legalBasis}</span>
          </div>
        </div>

        {/* Duration editor */}
        <div className="shrink-0 text-right">
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">
            Dagar
          </label>
          {phase.adjustable ? (
            <input
              type="number"
              min={phase.minDays}
              max={365}
              value={phase.days}
              onChange={(e) => {
                const val = parseInt(e.target.value) || phase.minDays;
                onDurationChange(phase.id, Math.max(val, phase.minDays));
              }}
              className="w-16 rounded-lg border border-input bg-card px-2 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          ) : (
            <div className="flex items-center justify-end gap-1">
              <span className="text-sm font-bold tabular-nums">{phase.days}</span>
              <Icon name="shield-alert" size={12} className="text-amber-500" />
            </div>
          )}
          {phase.adjustable && phase.minDays > 1 && (
            <span className="block text-[9px] text-muted-foreground mt-0.5">
              min {phase.minDays}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ---- Key dates summary ---- */

function KeyDatesSummary({
  phases,
  contractDate,
}: {
  phases: TimelinePhase[];
  contractDate: Date;
}) {
  if (phases.length === 0) return null;

  const today = startOfDay(new Date());
  const timelineStart = phases[0].startDate;
  const totalDays = daysBetween(timelineStart, phases[phases.length - 1].endDate);
  const startInPast = timelineStart < today;

  // Find key phases
  const announcementPhase = phases.find(
    (p) => p.id === "announcement" || p.id === "application"
  );
  const tenderDeadline = phases.find(
    (p) => p.id === "announcement" || p.id === "tender-invite"
  );
  const awardPhase = phases.find((p) => p.id === "award");
  const standstillPhase = phases.find((p) => p.id === "standstill");

  const keyDates = [
    {
      label: "Senast annonsering",
      date: announcementPhase?.startDate,
      icon: "flag",
      colorClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
      label: "Sista anbudsdag",
      date: tenderDeadline?.endDate,
      icon: "clock",
      colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Tilldelningsbeslut",
      date: awardPhase?.startDate,
      icon: "gavel",
      colorClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    },
    {
      label: "Avtalsspärr slut",
      date: standstillPhase?.endDate,
      icon: "shield-alert",
      colorClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      label: "Avtalstart",
      date: contractDate,
      icon: "check",
      colorClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
  ];

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Icon name="target" size={16} className="text-primary" />
          Sammanfattning
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            Totalt: <strong className="text-foreground">{totalDays} dagar</strong> ({Math.round(totalDays / 30.44)} mån)
          </span>
        </div>
      </div>

      {startInPast && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <Icon name="alert-triangle" size={16} />
          <span>
            <strong>Varning:</strong> Tidslinjen kräver att arbetet påbörjas{" "}
            {formatDate(timelineStart)}, vilket redan har passerat. Justera avtalsdatumet
            eller förkorta faserna.
          </span>
        </div>
      )}

      {/* Key dates grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {keyDates.map(
          (kd) =>
            kd.date && (
              <div key={kd.label} className="text-center">
                <div
                  className={cn(
                    "mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl",
                    kd.colorClass
                  )}
                >
                  <Icon name={kd.icon} size={16} />
                </div>
                <div className="text-[11px] font-medium text-muted-foreground mb-0.5">
                  {kd.label}
                </div>
                <div className="text-sm font-bold tabular-nums">{formatDate(kd.date)}</div>
              </div>
            )
        )}
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

const STORAGE_KEY = "critero-timeline-planner";

const PROCEDURE_OPTIONS = [
  { value: "open", label: "Öppet förfarande" },
  { value: "selective", label: "Selektivt förfarande" },
  { value: "simplified", label: "Förenklat förfarande" },
  { value: "negotiated", label: "Förhandlat förfarande" },
];

const THRESHOLD_OPTIONS = [
  { value: "over", label: "Över EU-tröskelvärdet" },
  { value: "under", label: "Under EU-tröskelvärdet" },
];

function getDefaultContractDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split("T")[0];
}

export default function TimelinePlannerPage() {
  const [procedureType, setProcedureType] = useState<ProcedureType>("open");
  const [threshold, setThreshold] = useState<ThresholdType>("over");
  const [contractDate, setContractDate] = useState(getDefaultContractDate);
  const [eSubmission, setESubmission] = useState(true);
  const [preAnnouncement, setPreAnnouncement] = useState(false);
  const [postalNotification, setPostalNotification] = useState(false);
  const [customDurations, setCustomDurations] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: PlannerState = JSON.parse(stored);
        setProcedureType(data.procedureType);
        setThreshold(data.threshold);
        setContractDate(data.contractDate);
        setESubmission(data.eSubmission);
        setPreAnnouncement(data.preAnnouncement);
        setPostalNotification(data.postalNotification);
        setCustomDurations(data.customDurations || {});
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      const data: PlannerState = {
        procedureType,
        threshold,
        contractDate,
        eSubmission,
        preAnnouncement,
        postalNotification,
        customDurations,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage full or unavailable
    }
  }, [loaded, procedureType, threshold, contractDate, eSubmission, preAnnouncement, postalNotification, customDurations]);

  // Compute phase definitions
  const definitions = useMemo(
    () => getPhaseDefinitions(procedureType, threshold, eSubmission, preAnnouncement, postalNotification),
    [procedureType, threshold, eSubmission, preAnnouncement, postalNotification]
  );

  // Build timeline phases
  const phases = useMemo(() => {
    if (!contractDate) return [];
    const cd = new Date(contractDate + "T00:00:00");
    if (isNaN(cd.getTime())) return [];
    return buildTimeline(definitions, cd, customDurations);
  }, [definitions, contractDate, customDurations]);

  // Handle duration changes
  const handleDurationChange = useCallback(
    (phaseId: string, days: number) => {
      setCustomDurations((prev) => ({
        ...prev,
        [phaseId]: days,
      }));
    },
    []
  );

  // Reset custom durations when procedure type changes
  const handleProcedureChange = useCallback((newType: ProcedureType) => {
    setProcedureType(newType);
    setCustomDurations({});
  }, []);

  // Reset custom durations when threshold changes
  const handleThresholdChange = useCallback((newThreshold: ThresholdType) => {
    setThreshold(newThreshold);
    setCustomDurations({});
  }, []);

  const handleExportJson = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      settings: { procedureType, threshold, contractDate, eSubmission, preAnnouncement, postalNotification },
      phases: phases.map((p) => ({
        id: p.id, name: p.name, days: p.days, minDays: p.minDays,
        startDate: formatDate(p.startDate), endDate: formatDate(p.endDate), legalBasis: p.legalBasis,
      })),
      totalDays: phases.length > 0 ? daysBetween(phases[0].startDate, phases[phases.length - 1].endDate) : 0,
    };
    exportToJson(`tidslinjeplan-${procedureType}-${contractDate}.json`, exportData);
  }, [procedureType, threshold, contractDate, eSubmission, preAnnouncement, postalNotification, phases]);

  const handleExportXlsx = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const totalDays = phases.length > 0 ? daysBetween(phases[0].startDate, phases[phases.length - 1].endDate) : 0;
    const procLabel = PROCEDURE_OPTIONS.find((o) => o.value === procedureType)?.label ?? procedureType;
    const thresholdLabel = THRESHOLD_OPTIONS.find((o) => o.value === threshold)?.label ?? threshold;

    const metadata: ExportMetadata = {
      toolName: "Tidslinjeplanerare",
      exportDate: dateStr,
      subtitle: `${procLabel}, ${thresholdLabel} — Totalt ${totalDays} dagar`,
    };

    const settingsRows: (string | number)[][] = [
      ["Upphandlingstyp", procLabel],
      ["EU-tröskelvärde", thresholdLabel],
      ["Önskat avtalsdatum", contractDate],
      ["E-upphandling", eSubmission ? "Ja" : "Nej"],
      ["Förhandsannonsering", preAnnouncement ? "Ja" : "Nej"],
      ["Brevdelgivning", postalNotification ? "Ja" : "Nej"],
    ];

    const phaseRows: (string | number)[][] = phases.map((p) => [
      p.name, p.days, p.minDays, formatDate(p.startDate), formatDate(p.endDate), p.legalBasis,
    ]);

    const sheets: ExportSheet[] = [
      { name: "Inställningar", headers: ["Egenskap", "Värde"], rows: settingsRows },
      { name: "Faser", headers: ["Fas", "Dagar", "Min dagar", "Startdatum", "Slutdatum", "Lagstöd"], rows: phaseRows },
    ];

    await exportToXlsx(`tidslinjeplan-${procedureType}-${contractDate}.xlsx`, sheets, metadata);
  }, [procedureType, threshold, contractDate, eSubmission, preAnnouncement, postalNotification, phases]);

  const handleExportPdf = useCallback(async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const totalDays = phases.length > 0 ? daysBetween(phases[0].startDate, phases[phases.length - 1].endDate) : 0;
    const procLabel = PROCEDURE_OPTIONS.find((o) => o.value === procedureType)?.label ?? procedureType;
    const thresholdLabel = THRESHOLD_OPTIONS.find((o) => o.value === threshold)?.label ?? threshold;

    const metadata: ExportMetadata = {
      toolName: "Tidslinjeplanerare",
      exportDate: dateStr,
      subtitle: `${procLabel}, ${thresholdLabel} — Totalt ${totalDays} dagar`,
    };

    const sections: PdfSection[] = [
      {
        title: "Upphandlingsinställningar",
        type: "keyvalue",
        pairs: [
          { label: "Upphandlingstyp", value: procLabel },
          { label: "EU-tröskelvärde", value: thresholdLabel },
          { label: "Önskat avtalsdatum", value: contractDate },
          { label: "E-upphandling", value: eSubmission ? "Ja" : "Nej" },
          { label: "Förhandsannonsering", value: preAnnouncement ? "Ja" : "Nej" },
          { label: "Brevdelgivning", value: postalNotification ? "Ja" : "Nej" },
        ],
      },
      {
        title: "Fasöversikt",
        type: "table",
        headers: ["Fas", "Dagar", "Startdatum", "Slutdatum", "Lagstöd"],
        rows: phases.map((p) => [p.name, p.days, formatDate(p.startDate), formatDate(p.endDate), p.legalBasis]),
      },
    ];

    await exportToPdf(`tidslinjeplan-${procedureType}-${contractDate}.pdf`, sections, metadata);
  }, [procedureType, threshold, contractDate, eSubmission, preAnnouncement, postalNotification, phases]);

  // Reset all to defaults
  const handleReset = useCallback(() => {
    setCustomDurations({});
  }, []);

  const parsedContractDate = contractDate ? new Date(contractDate + "T00:00:00") : null;

  return (
    <FeatureGate featureKey="verktyg.timeline-planner">
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4">
        <Breadcrumb />
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="clock" size={22} />
          </span>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">Tidslinjeplanerare</h1>
            <p className="text-sm text-muted-foreground">
              Planera upphandlingstidslinjen bakåt från önskat avtalsdatum med korrekta lagstadgade minimtider enligt LOU
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Icon name="refresh-cw" size={14} />
              Återställ
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Icon name="external-link" size={14} /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXlsx}>
              <Icon name="file-spreadsheet" size={14} /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              <Icon name="file-text" size={14} /> PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          {/* Input section */}
          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
              <Icon name="settings" size={16} className="text-primary" />
              Upphandlingsinställningar
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                label="Upphandlingstyp"
                id="procedure-type"
                options={PROCEDURE_OPTIONS}
                value={procedureType}
                onChange={(e) => handleProcedureChange(e.target.value as ProcedureType)}
              />
              <Select
                label="EU-tröskelvärde"
                id="threshold"
                options={THRESHOLD_OPTIONS}
                value={threshold}
                onChange={(e) => handleThresholdChange(e.target.value as ThresholdType)}
              />
              <Input
                label="Önskat avtalsdatum"
                id="contract-date"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
              />
            </div>

            {/* Toggle options */}
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={eSubmission}
                  onChange={(e) => setESubmission(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span>E-upphandling</span>
                <span className="text-[10px] text-muted-foreground">(förkortar anbudstiden)</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={preAnnouncement}
                  onChange={(e) => setPreAnnouncement(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span>Förhandsannonsering</span>
                <span className="text-[10px] text-muted-foreground">(förkortar anbudstiden)</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={postalNotification}
                  onChange={(e) => setPostalNotification(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span>Brevdelgivning</span>
                <span className="text-[10px] text-muted-foreground">(15 dagars avtalsspärr)</span>
              </label>
            </div>

            {/* Quick info about selected procedure */}
            <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
              <div className="flex items-start gap-2">
                <Icon name="lightbulb" size={14} className="mt-0.5 text-primary shrink-0" />
                <div className="text-xs text-muted-foreground">
                  {procedureType === "open" && (
                    <>
                      <strong className="text-foreground">Öppet förfarande:</strong>{" "}
                      Alla leverantörer får lämna anbud direkt. Vanligast för standardiserade upphandlingar
                      {threshold === "over" ? " över" : " under"} EU:s tröskelvärde.
                    </>
                  )}
                  {procedureType === "selective" && (
                    <>
                      <strong className="text-foreground">Selektivt förfarande:</strong>{" "}
                      Tvåstegsprocess med först ansökan om att delta, sedan anbudsinbjudan till kvalificerade leverantörer.
                    </>
                  )}
                  {procedureType === "simplified" && (
                    <>
                      <strong className="text-foreground">Förenklat förfarande:</strong>{" "}
                      Används under EU:s tröskelvärde med kortare tidsfrister och enklare regler.
                    </>
                  )}
                  {procedureType === "negotiated" && (
                    <>
                      <strong className="text-foreground">Förhandlat förfarande:</strong>{" "}
                      Möjlighet att förhandla med utvalda leverantörer. Kräver särskilda förutsättningar enligt LOU.
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Gantt chart */}
          {phases.length > 0 && (
            <GanttChart
              phases={phases}
              contractDate={parsedContractDate!}
            />
          )}

          {/* Phase detail cards */}
          {phases.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <Icon name="clipboard-list" size={16} className="text-primary" />
                Fasdetaljer
                <span className="text-xs font-normal text-muted-foreground">
                  — justera varaktigheten för anpassningsbara faser
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {phases.map((phase) => (
                  <PhaseCard
                    key={phase.id}
                    phase={phase}
                    onDurationChange={handleDurationChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Summary section */}
          {phases.length > 0 && parsedContractDate && (
            <KeyDatesSummary phases={phases} contractDate={parsedContractDate} />
          )}

          {/* Export section */}
          {phases.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Exportera tidslinje</h3>
                  <p className="text-xs text-muted-foreground">
                    Ladda ner tidslinjen med alla faser, datum och lagstöd.
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

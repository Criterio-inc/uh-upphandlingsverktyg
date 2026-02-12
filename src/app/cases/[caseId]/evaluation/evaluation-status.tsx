"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ProgressBar } from "@/components/ui/progress-bar";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  date?: string;
}

interface EvaluationStatusData {
  announced?: boolean;
  announcedDate?: string;
  externalSystem?: string;
  externalRef?: string;
  winner?: string;
  winnerMotivation?: string;
  awardDate?: string;
  checklist?: ChecklistItem[];
}

interface EvaluationStatusProps {
  caseId: string;
  caseName: string;
  evaluationStatus: EvaluationStatusData;
  bidCount: number;
  qualifiedCount: number;
  disqualifiedCount: number;
  requirementCount: number;
  criterionCount: number;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "chk-1", label: "Formell kvalificering genomförd", checked: false },
  { id: "chk-2", label: "Kravuppfyllelse bedömd (SKA-krav)", checked: false },
  { id: "chk-3", label: "Utvärdering av tilldelningskriterier genomförd", checked: false },
  { id: "chk-4", label: "Utvärderingsprotokoll upprättat", checked: false },
  { id: "chk-5", label: "Tilldelningsbeslut fattat", checked: false },
  { id: "chk-6", label: "Avtalsspärr löpt ut (10 dagar)", checked: false },
];

export function EvaluationStatus({
  caseId,
  caseName,
  evaluationStatus,
  bidCount,
  qualifiedCount,
  disqualifiedCount,
  requirementCount,
  criterionCount,
}: EvaluationStatusProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Local state from props
  const [announced, setAnnounced] = useState(evaluationStatus.announced ?? false);
  const [announcedDate, setAnnouncedDate] = useState(evaluationStatus.announcedDate ?? "");
  const [externalSystem, setExternalSystem] = useState(evaluationStatus.externalSystem ?? "");
  const [externalRef, setExternalRef] = useState(evaluationStatus.externalRef ?? "");
  const [winner, setWinner] = useState(evaluationStatus.winner ?? "");
  const [winnerMotivation, setWinnerMotivation] = useState(evaluationStatus.winnerMotivation ?? "");
  const [awardDate, setAwardDate] = useState(evaluationStatus.awardDate ?? "");

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    if (evaluationStatus.checklist && evaluationStatus.checklist.length > 0) {
      return evaluationStatus.checklist;
    }
    return DEFAULT_CHECKLIST;
  });

  // Debounce timer ref for blur saves
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveNow = useCallback(async (payload?: Record<string, unknown>) => {
    setSaving(true);
    try {
      const body = payload ?? {
        evaluationStatus: JSON.stringify({
          announced,
          announcedDate,
          externalSystem,
          externalRef,
          winner,
          winnerMotivation,
          awardDate,
          checklist,
        }),
      };
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const now = new Date();
        setLastSaved(
          `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
        );
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [caseId, announced, announcedDate, externalSystem, externalRef, winner, winnerMotivation, awardDate, checklist, router]);

  // Save on blur for text inputs (debounced)
  const handleBlurSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveNow();
    }, 300);
  }, [saveNow]);

  // Immediate save for checkbox/toggle changes
  const handleChecklistToggle = useCallback((itemId: string) => {
    setChecklist((prev) => {
      const updated = prev.map((item) => {
        if (item.id === itemId) {
          const nowChecked = !item.checked;
          return {
            ...item,
            checked: nowChecked,
            date: nowChecked ? new Date().toISOString().slice(0, 10) : undefined,
          };
        }
        return item;
      });

      // Schedule save with updated checklist
      setTimeout(() => {
        const payload = {
          evaluationStatus: JSON.stringify({
            announced,
            announcedDate,
            externalSystem,
            externalRef,
            winner,
            winnerMotivation,
            awardDate,
            checklist: updated,
          }),
        };
        saveNow(payload);
      }, 100);

      return updated;
    });
  }, [announced, announcedDate, externalSystem, externalRef, winner, winnerMotivation, awardDate, saveNow]);

  const handleAnnouncedToggle = useCallback(() => {
    const newVal = !announced;
    setAnnounced(newVal);

    setTimeout(() => {
      const payload = {
        evaluationStatus: JSON.stringify({
          announced: newVal,
          announcedDate,
          externalSystem,
          externalRef,
          winner,
          winnerMotivation,
          awardDate,
          checklist,
        }),
      };
      saveNow(payload);
    }, 100);
  }, [announced, announcedDate, externalSystem, externalRef, winner, winnerMotivation, awardDate, checklist, saveNow]);

  // Compute checklist progress
  const checkedCount = checklist.filter((c) => c.checked).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Check if "Tilldelningsbeslut fattat" is checked
  const awardDecisionMade = checklist.find((c) => c.id === "chk-5")?.checked ?? false;

  return (
    <div className="space-y-6">
      {/* Save status indicator */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        {saving && <span>Sparar...</span>}
        {lastSaved && !saving && <span>Senast sparat {lastSaved}</span>}
      </div>

      {/* Section 1: Info banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <div className="shrink-0 text-blue-600 mt-0.5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            {"Detaljerad anbudsutvärdering sker i ert upphandlingssystem (TendSign, Mercell etc.). Här registreras övergripande status och beslut för spårbarhet genom hela upphandlingskedjan."}
          </div>
        </div>
      </div>

      {/* Section 2: Annonsering & extern referens */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold mb-4">Annonsering & extern referens</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Annonserad toggle */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Annonserad</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAnnouncedToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    announced ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      announced ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-muted-foreground">
                  {announced ? "Ja" : "Nej"}
                </span>
              </div>
            </div>

            <Input
              id="announcedDate"
              label="Annonseringsdatum"
              type="date"
              value={announcedDate}
              onChange={(e) => setAnnouncedDate(e.target.value)}
              onBlur={handleBlurSave}
            />

            <Input
              id="externalSystem"
              label="Upphandlingssystem"
              placeholder="TendSign, Mercell, etc."
              value={externalSystem}
              onChange={(e) => setExternalSystem(e.target.value)}
              onBlur={handleBlurSave}
            />

            <Input
              id="externalRef"
              label="Extern referens"
              placeholder="Diarienummer, upphandlings-ID, etc."
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              onBlur={handleBlurSave}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Anbudsstatus */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold mb-4">Anbudsstatus</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{bidCount}</div>
              <div className="text-xs text-muted-foreground">Anbud mottagna</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">{qualifiedCount}</div>
              <div className="text-xs text-muted-foreground">Kvalificerade</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-red-600">{disqualifiedCount}</div>
              <div className="text-xs text-muted-foreground">Avvisade</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-2">
                <div>
                  <span className="text-lg font-bold">{requirementCount}</span>
                  <span className="text-xs text-muted-foreground ml-1">krav</span>
                </div>
                <span className="text-muted-foreground">/</span>
                <div>
                  <span className="text-lg font-bold">{criterionCount}</span>
                  <span className="text-xs text-muted-foreground ml-1">kriterier</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Underlag</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href={`/cases/${caseId}/bids`}>
              <Button variant="outline" size="sm">
                Visa anbud
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Utvärderingschecklista */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Utvärderingschecklista</h3>
            <Badge variant="outline">
              {checkedCount}/{totalCount} klara
            </Badge>
          </div>

          <ProgressBar
            value={progressPercent}
            size="sm"
            className="mb-4"
          />

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                  item.checked
                    ? "border-green-200 bg-green-50"
                    : "border-border bg-background"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleChecklistToggle(item.id)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50 accent-primary"
                />
                <span
                  className={`flex-1 text-sm ${
                    item.checked ? "text-green-800 line-through" : "text-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {item.checked && item.date && (
                  <span className="text-xs text-muted-foreground">
                    {item.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Tilldelning (only visible when award decision is checked) */}
      {awardDecisionMade && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent>
            <h3 className="text-sm font-semibold mb-4">Tilldelning</h3>
            <div className="space-y-3">
              <Input
                id="winner"
                label="Vinnande leverantör"
                placeholder="Leverantörens namn"
                value={winner}
                onChange={(e) => setWinner(e.target.value)}
                onBlur={handleBlurSave}
              />

              <Textarea
                id="winnerMotivation"
                label="Motivering"
                placeholder="Kort motivering till tilldelningsbeslutet..."
                value={winnerMotivation}
                onChange={(e) => setWinnerMotivation(e.target.value)}
                onBlur={handleBlurSave}
                rows={3}
              />

              <Input
                id="awardDate"
                label="Tilldelningsdatum"
                type="date"
                value={awardDate}
                onChange={(e) => setAwardDate(e.target.value)}
                onBlur={handleBlurSave}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 6: Export-uthopp */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold mb-4">Export</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Exportera underlag för användning i externt upphandlingssystem.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`/api/cases/${caseId}/export?format=xlsx&entity=requirements`}>
              <Button variant="outline" size="sm">
                Exportera kravspecifikation (XLSX)
              </Button>
            </a>
            <a href={`/api/cases/${caseId}/export?format=xlsx&entity=criteria`}>
              <Button variant="outline" size="sm">
                Exportera utvärderingskriterier (XLSX)
              </Button>
            </a>
            <a href={`/api/cases/${caseId}/export?format=json`}>
              <Button variant="outline" size="sm">
                Exportera allt (JSON)
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

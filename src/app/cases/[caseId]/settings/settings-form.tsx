"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TagListEditor } from "@/components/ui/tag-list-editor";
import { ProgressBar } from "@/components/ui/progress-bar";
import { parseJsonArray, parseJsonObject } from "@/lib/utils";

const PROFILE_OPTIONS = [
  { value: "generisk_lou", label: "Generisk LOU" },
  { value: "avfall_nyanskaffning", label: "Avfall – nyanskaffning" },
  { value: "socialtjanst_byte", label: "Socialtjänst – byte" },
];

const PROCUREMENT_TYPE_OPTIONS = [
  { value: "nyanskaffning", label: "Nyanskaffning" },
  { value: "byte", label: "Byte" },
  { value: "utokning", label: "Utökning" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Utkast" },
  { value: "active", label: "Aktiv" },
  { value: "completed", label: "Avslutad" },
  { value: "archived", label: "Arkiverad" },
];

interface PhaseGateData {
  phaseId: string;
  label: string;
  gateResults: {
    ruleId: string;
    label: string;
    passed: boolean;
    severity: "blocker" | "warning";
    helpText?: string;
  }[];
  allBlockersPassed: boolean;
  allWarningsPassed: boolean;
  completionPercent: number;
}

interface CaseSettingsFormProps {
  caseId: string;
  initialData: {
    name: string;
    domainProfile: string;
    orgName: string;
    procurementType: string;
    estimatedValueSek: number;
    owner: string;
    status: string;
    currentPhase: string;
    goals: string;
    scopeIn: string;
    scopeOut: string;
    governance: string;
    timeline: string;
  };
}

export function CaseSettingsForm({ caseId, initialData }: CaseSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const governance = parseJsonObject<{ steeringGroup?: string[]; projectGroup?: string[]; decisionForums?: string[] }>(initialData.governance);
  const timeline = parseJsonObject<{ startDate?: string; targetAwardDate?: string; targetContractDate?: string }>(initialData.timeline);

  const [name, setName] = useState(initialData.name);
  const [domainProfile, setDomainProfile] = useState(initialData.domainProfile);
  const [orgName, setOrgName] = useState(initialData.orgName);
  const [procurementType, setProcurementType] = useState(initialData.procurementType);
  const [estimatedValueSek, setEstimatedValueSek] = useState(String(initialData.estimatedValueSek || ""));
  const [owner, setOwner] = useState(initialData.owner);
  const [status, setStatus] = useState(initialData.status);

  const [goals, setGoals] = useState<string[]>(parseJsonArray(initialData.goals));
  const [scopeIn, setScopeIn] = useState<string[]>(parseJsonArray(initialData.scopeIn));
  const [scopeOut, setScopeOut] = useState<string[]>(parseJsonArray(initialData.scopeOut));

  const [steeringGroup, setSteeringGroup] = useState<string[]>(governance.steeringGroup ?? []);
  const [projectGroup, setProjectGroup] = useState<string[]>(governance.projectGroup ?? []);
  const [decisionForums, setDecisionForums] = useState<string[]>(governance.decisionForums ?? []);

  const [startDate, setStartDate] = useState(timeline.startDate ?? "");
  const [targetAwardDate, setTargetAwardDate] = useState(timeline.targetAwardDate ?? "");
  const [targetContractDate, setTargetContractDate] = useState(timeline.targetContractDate ?? "");

  // Phase advancement
  const [phaseData, setPhaseData] = useState<PhaseGateData[]>([]);
  const [phaseLoading, setPhaseLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(initialData.currentPhase);

  useEffect(() => {
    fetch(`/api/cases/${caseId}/gates`)
      .then((r) => r.json())
      .then((data: PhaseGateData[]) => {
        setPhaseData(data);
        setPhaseLoading(false);
      });
  }, [caseId, currentPhase]);

  const currentPhaseIndex = phaseData.findIndex((p) => p.phaseId === currentPhase);
  const currentPhaseData = phaseData[currentPhaseIndex];
  const nextPhaseData = currentPhaseIndex >= 0 && currentPhaseIndex < phaseData.length - 1
    ? phaseData[currentPhaseIndex + 1]
    : null;
  const prevPhaseData = currentPhaseIndex > 0
    ? phaseData[currentPhaseIndex - 1]
    : null;
  const canAdvance = currentPhaseData?.allBlockersPassed === true && nextPhaseData != null;

  async function handleAdvancePhase() {
    if (!nextPhaseData) return;
    setAdvancing(true);
    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPhase: nextPhaseData.phaseId }),
    });
    if (res.ok) {
      setCurrentPhase(nextPhaseData.phaseId);
    }
    setAdvancing(false);
  }

  async function handleRevertPhase() {
    if (!prevPhaseData) return;
    setAdvancing(true);
    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPhase: prevPhaseData.phaseId }),
    });
    if (res.ok) {
      setCurrentPhase(prevPhaseData.phaseId);
    }
    setAdvancing(false);
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const body = {
      name,
      domainProfile,
      orgName,
      procurementType,
      estimatedValueSek: Number(estimatedValueSek) || 0,
      owner,
      status,
      goals,
      scopeIn,
      scopeOut,
      governance: { steeringGroup, projectGroup, decisionForums },
      timeline: {
        startDate: startDate || undefined,
        targetAwardDate: targetAwardDate || undefined,
        targetContractDate: targetContractDate || undefined,
      },
    };

    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold mb-4">Grunduppgifter</h3>
          <div className="space-y-3">
            <Input id="name" label="Namn" value={name} onChange={(e) => setName(e.target.value)} />
            <Select id="domainProfile" label="Domänprofil" options={PROFILE_OPTIONS} value={domainProfile} onChange={(e) => setDomainProfile(e.target.value)} />
            <Input id="orgName" label="Organisation" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            <Select id="procurementType" label="Typ" options={PROCUREMENT_TYPE_OPTIONS} value={procurementType} onChange={(e) => setProcurementType(e.target.value)} />
            <Input id="estimatedValueSek" label="Uppskattat värde (SEK)" type="number" value={estimatedValueSek} onChange={(e) => setEstimatedValueSek(e.target.value)} />
            <Input id="owner" label="Ansvarig" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <Select id="status" label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Goals & Scope */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold mb-4">Mål & avgränsning</h3>
          <div className="space-y-3">
            <TagListEditor label="Mål" value={goals} onChange={setGoals} placeholder="Lägg till mål..." />
            <TagListEditor label="Ingår" value={scopeIn} onChange={setScopeIn} placeholder="Vad ingår..." />
            <TagListEditor label="Ingår inte" value={scopeOut} onChange={setScopeOut} placeholder="Vad ingår inte..." />
          </div>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold mb-4">Organisation</h3>
          <div className="space-y-3">
            <TagListEditor label="Styrgrupp" value={steeringGroup} onChange={setSteeringGroup} placeholder="Namn och roll..." />
            <TagListEditor label="Projektgrupp" value={projectGroup} onChange={setProjectGroup} placeholder="Namn och roll..." />
            <TagListEditor label="Beslutsforum" value={decisionForums} onChange={setDecisionForums} placeholder="Forum..." />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold mb-4">Tidplan</h3>
          <div className="space-y-3">
            <Input id="startDate" label="Startdatum" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input id="targetAwardDate" label="Planerad tilldelning" type="date" value={targetAwardDate} onChange={(e) => setTargetAwardDate(e.target.value)} />
            <Input id="targetContractDate" label="Planerad avtalsstart" type="date" value={targetContractDate} onChange={(e) => setTargetContractDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Phase advancement */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold mb-4">Fasavancering</h3>
          {phaseLoading ? (
            <div className="text-sm text-muted-foreground">Laddar fas-status...</div>
          ) : (
            <div className="space-y-4">
              {/* Phase timeline */}
              <div className="flex items-center gap-1">
                {phaseData.map((phase, idx) => {
                  const isCurrent = phase.phaseId === currentPhase;
                  const isPast = idx < currentPhaseIndex;
                  return (
                    <div key={phase.phaseId} className="flex items-center gap-1">
                      {idx > 0 && <span className="text-muted-foreground text-xs px-1">→</span>}
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isCurrent
                            ? "bg-primary text-primary-foreground"
                            : isPast
                              ? "bg-green-100 text-green-800"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isPast && "✓ "}{phase.label.split(".")[0]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current phase details */}
              {currentPhaseData && (
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{currentPhaseData.label}</div>
                      <div className="text-xs text-muted-foreground">Aktuell fas</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{currentPhaseData.completionPercent}%</div>
                      <div className="text-xs text-muted-foreground">gates klara</div>
                    </div>
                  </div>

                  <ProgressBar value={currentPhaseData.completionPercent} showPercent={false} size="sm" />

                  {/* Gate results */}
                  <div className="space-y-1.5">
                    {currentPhaseData.gateResults.map((gate) => (
                      <div
                        key={gate.ruleId}
                        className={`flex items-center gap-2 text-xs rounded px-2 py-1.5 ${
                          gate.passed
                            ? "bg-green-50 text-green-800"
                            : gate.severity === "blocker"
                              ? "bg-red-50 text-red-800"
                              : "bg-yellow-50 text-yellow-800"
                        }`}
                      >
                        <span>{gate.passed ? "✓" : gate.severity === "blocker" ? "✗" : "⚠"}</span>
                        <span className="flex-1">{gate.label}</span>
                        {gate.severity === "blocker" && !gate.passed && (
                          <span className="text-[10px] font-medium bg-red-200 px-1 rounded">BLOCKERARE</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Advance / Revert buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      {prevPhaseData && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRevertPhase}
                          disabled={advancing}
                        >
                          ← Tillbaka till {prevPhaseData.label.split(".")[0]}
                        </Button>
                      )}
                    </div>
                    <div>
                      {nextPhaseData ? (
                        <div className="flex items-center gap-2">
                          {!canAdvance && (
                            <span className="text-xs text-red-600">Blockerande gates ej klara</span>
                          )}
                          <Button
                            size="sm"
                            onClick={handleAdvancePhase}
                            disabled={advancing || !canAdvance}
                          >
                            {advancing ? "Avancerar..." : `Avancera till ${nextPhaseData.label.split(".")[0]} →`}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">Sista fasen</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Sparar..." : "Spara inställningar"}
        </Button>
        {saved && <span className="text-sm text-green-600">Sparat!</span>}
      </div>
    </div>
  );
}

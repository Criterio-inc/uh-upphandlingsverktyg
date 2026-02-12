"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LevelBadge } from "@/components/ui/badge";

interface Requirement {
  id: string;
  title: string;
  level: string;
  reqType: string;
  cluster: string;
}

interface BidResponsesFormProps {
  caseId: string;
  bidId: string;
  requirements: Requirement[];
  existingResponses: Record<string, unknown>[];
}

const MEETS_OPTIONS = [
  { value: "yes", label: "Ja", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "partial", label: "Delvis", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "no", label: "Nej", color: "bg-red-100 text-red-800 border-red-300" },
];

export function BidResponsesForm({ caseId, bidId, requirements, existingResponses }: BidResponsesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Build initial state from existing responses
  const responseMap = new Map<string, { meets: string; supplierStatement: string; reviewNotes: string }>();
  for (const resp of existingResponses) {
    responseMap.set(String(resp.requirementId), {
      meets: String(resp.meets || "no"),
      supplierStatement: String(resp.supplierStatement || ""),
      reviewNotes: String(resp.reviewNotes || ""),
    });
  }

  const [responses, setResponses] = useState<
    Map<string, { meets: string; supplierStatement: string; reviewNotes: string }>
  >(responseMap);

  function getResponse(reqId: string) {
    return responses.get(reqId) ?? { meets: "no", supplierStatement: "", reviewNotes: "" };
  }

  function updateResponse(reqId: string, field: string, value: string) {
    setResponses((prev) => {
      const next = new Map(prev);
      const current = next.get(reqId) ?? { meets: "no", supplierStatement: "", reviewNotes: "" };
      next.set(reqId, { ...current, [field]: value });
      return next;
    });
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const payload = requirements.map((req) => {
      const resp = getResponse(req.id);
      return {
        requirementId: req.id,
        meets: resp.meets,
        supplierStatement: resp.supplierStatement,
        reviewNotes: resp.reviewNotes,
      };
    });

    const res = await fetch(`/api/cases/${caseId}/bids/${bidId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  // Group requirements by cluster
  const clusters = new Map<string, Requirement[]>();
  for (const req of requirements) {
    const cluster = req.cluster || "Övrigt";
    if (!clusters.has(cluster)) clusters.set(cluster, []);
    clusters.get(cluster)!.push(req);
  }

  // Separate SKA and BÖR
  const skaCount = requirements.filter((r) => r.level === "SKA").length;
  const borCount = requirements.filter((r) => r.level === "BOR").length;

  // Count completion
  const answeredCount = Array.from(responses.values()).filter((r) => r.meets !== "no" || r.supplierStatement).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{requirements.length} krav totalt</span>
        <span>•</span>
        <span>{skaCount} SKA</span>
        <span>•</span>
        <span>{borCount} BÖR</span>
        <span>•</span>
        <span className="text-foreground font-medium">{answeredCount} besvarade</span>
      </div>

      {/* Requirements grouped by cluster */}
      {Array.from(clusters.entries()).map(([cluster, reqs]) => (
        <Card key={cluster}>
          <CardContent>
            <h3 className="text-sm font-semibold mb-4">{cluster}</h3>
            <div className="space-y-4">
              {reqs.map((req) => {
                const resp = getResponse(req.id);
                return (
                  <div key={req.id} className="border border-border rounded-lg p-4 space-y-3">
                    {/* Requirement header */}
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs text-muted-foreground shrink-0">
                        {req.id}
                      </span>
                      <LevelBadge level={req.level} />
                      <span className="font-medium text-sm">{req.title}</span>
                    </div>

                    {/* Meets selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">Uppfyller:</span>
                      <div className="flex gap-1">
                        {MEETS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateResponse(req.id, "meets", opt.value)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                              resp.meets === opt.value
                                ? opt.color + " font-medium"
                                : "bg-background text-muted-foreground border-border hover:bg-muted"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Supplier statement */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Leverantörens svar
                      </label>
                      <textarea
                        value={resp.supplierStatement}
                        onChange={(e) => updateResponse(req.id, "supplierStatement", e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Hur leverantören beskriver sin lösning..."
                      />
                    </div>

                    {/* Review notes */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Bedömningsanteckning
                      </label>
                      <textarea
                        value={resp.reviewNotes}
                        onChange={(e) => updateResponse(req.id, "reviewNotes", e.target.value)}
                        rows={1}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Intern bedömning..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Save button */}
      <div className="flex items-center gap-3 sticky bottom-4 bg-background/95 backdrop-blur py-3 px-4 -mx-4 border-t border-border">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Sparar..." : "Spara kravuppfyllelse"}
        </Button>
        {saved && <span className="text-sm text-green-600">Sparat!</span>}
        <span className="ml-auto text-xs text-muted-foreground">
          {answeredCount}/{requirements.length} besvarade
        </span>
      </div>
    </div>
  );
}

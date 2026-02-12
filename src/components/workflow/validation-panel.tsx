"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { ValidationWarning, ValidationInsight } from "@/lib/validation";

const ENTITY_LABELS: Record<string, string> = {
  need: "Behov",
  requirement: "Krav",
  risk: "Risker",
  criterion: "Kriterier",
  score: "Poäng",
  bid: "Anbud",
  workshop: "Workshops",
  decision: "Beslut",
  document: "Dokument",
};

/** Maps entity type to route segment (pluralized) */
const ENTITY_ROUTE: Record<string, string> = {
  need: "needs",
  requirement: "requirements",
  risk: "risks",
  criterion: "criteria",
  score: "scores",
  bid: "bids",
  workshop: "workshops",
  decision: "decisions",
  document: "documents",
  stakeholder: "stakeholders",
  evidence: "evidence",
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  coverage: { label: "Täckningsgrad", icon: "📊" },
  quality: { label: "Kvalitet", icon: "✅" },
  balance: { label: "Balans", icon: "⚖️" },
  readiness: { label: "Beredskap", icon: "🚀" },
  tip: { label: "Tips", icon: "💡" },
};

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "✓" },
  warning: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: "⚠" },
  info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: "ℹ" },
  error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "✕" },
};

export function ValidationPanel({ caseId }: { caseId: string }) {
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [insights, setInsights] = useState<ValidationInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarnings, setShowWarnings] = useState(false);

  useEffect(() => {
    fetch(`/api/cases/${caseId}/validate?insights=true`)
      .then((r) => r.json())
      .then((data) => {
        setWarnings(data.warnings ?? []);
        setInsights(data.insights ?? []);
        setLoading(false);
      });
  }, [caseId]);

  if (loading) return <p className="text-sm text-muted-foreground p-4">Validerar...</p>;
  if (warnings.length === 0 && insights.length === 0) return null;

  const warningCount = warnings.filter(w => w.severity === "warning").length;
  const infoCount = warnings.filter(w => w.severity === "info").length;

  const byEntity = warnings.reduce<Record<string, ValidationWarning[]>>((acc, w) => {
    const key = w.entityType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  // Group insights by category
  const insightsByCategory = insights.reduce<Record<string, ValidationInsight[]>>((acc, ins) => {
    if (!acc[ins.category]) acc[ins.category] = [];
    acc[ins.category].push(ins);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Business Insights */}
      {insights.length > 0 && (
        <Card>
          <CardContent>
            <CardTitle className="mb-4 flex items-center gap-2">
              <span>📋</span>
              Verksamhetsanalys
            </CardTitle>
            <div className="space-y-4">
              {Object.entries(insightsByCategory).map(([category, items]) => {
                const catMeta = CATEGORY_LABELS[category] ?? { label: category, icon: "📌" };
                return (
                  <div key={category}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">{catMeta.icon}</span>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {catMeta.label}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {items.map((insight, i) => {
                        const style = SEVERITY_STYLES[insight.severity] ?? SEVERITY_STYLES.info;
                        return (
                          <div
                            key={`${category}-${i}`}
                            className={`rounded-lg border p-3 ${style.bg} ${style.border}`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`text-sm font-bold ${style.text} mt-0.5`}>
                                {style.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-medium ${style.text}`}>
                                    {insight.title}
                                  </span>
                                  {insight.progress !== undefined && (
                                    <span className={`text-xs font-bold ${style.text}`}>
                                      {insight.progress}%
                                    </span>
                                  )}
                                </div>
                                {insight.progress !== undefined && (
                                  <div className="h-1.5 w-full rounded-full bg-white/60 mt-1.5 mb-1">
                                    <div
                                      className={`h-1.5 rounded-full transition-all ${
                                        insight.severity === "success"
                                          ? "bg-green-500"
                                          : insight.severity === "error"
                                          ? "bg-red-500"
                                          : "bg-yellow-500"
                                      }`}
                                      style={{ width: `${insight.progress}%` }}
                                    />
                                  </div>
                                )}
                                <p className={`text-xs ${style.text} mt-0.5 leading-relaxed`}>
                                  {insight.message}
                                </p>
                                {insight.action && (
                                  <Link
                                    href={insight.action.href}
                                    className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded text-xs font-medium transition-colors ${style.text} bg-white/50 hover:bg-white/80`}
                                  >
                                    {insight.action.label} →
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Warnings (collapsible) */}
      {warnings.length > 0 && (
        <Card>
          <CardContent>
            <button
              onClick={() => setShowWarnings(!showWarnings)}
              className="w-full flex items-center justify-between"
            >
              <CardTitle className="flex items-center gap-2">
                <span className="text-yellow-600">&#9888;</span>
                Detaljerade varningar ({warningCount} varningar, {infoCount} tips)
              </CardTitle>
              <span className="text-muted-foreground text-sm">
                {showWarnings ? "Dölj ▲" : "Visa ▼"}
              </span>
            </button>
            {showWarnings && (
              <div className="space-y-3 mt-4">
                {Object.entries(byEntity).map(([type, items]) => (
                  <div key={type}>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                      {ENTITY_LABELS[type] ?? type}
                    </h4>
                    <div className="space-y-1">
                      {items.map((w, i) => (
                        <div key={`${w.entityId}-${w.field}-${i}`} className="flex items-start gap-2 text-sm">
                          <span className={w.severity === "warning" ? "text-yellow-600" : "text-blue-500"}>
                            {w.severity === "warning" ? "⚠" : "ℹ"}
                          </span>
                          <div>
                            <Link
                              href={`/cases/${caseId}/${ENTITY_ROUTE[type] ?? `${type}s`}/${w.entityId}`}
                              className="font-medium hover:underline"
                            >
                              {w.entityTitle}
                            </Link>
                            <span className="text-muted-foreground"> — {w.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

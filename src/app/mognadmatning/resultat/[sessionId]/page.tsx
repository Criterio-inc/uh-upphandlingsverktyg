"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { FeatureGate } from "@/components/feature-gate";
import { DIGITAL_MOGNAD_CONFIG } from "@/config/assessments";

const config = DIGITAL_MOGNAD_CONFIG;

interface ResultData {
  session: {
    id: string;
    respondentName: string;
    respondentRole: string;
    completedAt: string | null;
    result: {
      overall: number;
      level: number;
      scores: Record<string, { average: number; questionCount: number; answeredCount: number }>;
      aiInsights: string;
    } | null;
  };
  project: {
    id: string;
    name: string;
    organizationName: string;
  };
}

export default function MognadmatningResultatPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);

  return (
    <FeatureGate featureKey="mognadmatning">
      <ResultatContent sessionId={sessionId} />
    </FeatureGate>
  );
}

function ResultatContent({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const fetchResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/assessments/sessions/${sessionId}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  async function generateInsights() {
    setGeneratingInsights(true);
    try {
      const res = await fetch(`/api/assessments/sessions/${sessionId}/ai-insights`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      await fetchResult();
    } catch {
      // ignore
    } finally {
      setGeneratingInsights(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Laddar resultat...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <Icon name="alert-triangle" size={28} className="text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Resultat hittades inte</h1>
        <p className="text-sm text-muted-foreground mb-4">Sessionen kanske inte är klar ännu.</p>
        <Link href="/mognadmatning/projekt" className="text-sm text-primary hover:underline">
          Tillbaka till projekt
        </Link>
      </div>
    );
  }

  const { session, project } = data;
  const result = session.result;
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <Icon name="alert-triangle" size={28} className="text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Inga resultat ännu</h1>
        <p className="text-sm text-muted-foreground mb-4">Sessionen är inte slutförd.</p>
        <Link href="/mognadmatning/projekt" className="text-sm text-primary hover:underline">
          Tillbaka till projekt
        </Link>
      </div>
    );
  }
  const maturityLevel = config.maturityLevels.find((m) => m.level === result.level);

  // Colors for different maturity levels
  const levelColors: Record<number, string> = {
    1: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    2: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    3: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    4: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    5: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  };

  const levelColor = levelColors[result.level] ?? levelColors[1];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/mognadmatning/projekt" className="hover:text-foreground transition-colors">
              Projekt
            </Link>
            <Icon name="arrow-right" size={12} />
            <Link
              href={`/mognadmatning/projekt/${project.id}`}
              className="hover:text-foreground transition-colors"
            >
              {project.name}
            </Link>
            <Icon name="arrow-right" size={12} />
            <span className="text-foreground">Resultat</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Resultat: {session.respondentName}
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            {session.respondentRole && <span>{session.respondentRole}</span>}
            {project.organizationName && <span>{project.organizationName}</span>}
            {session.completedAt && (
              <span>Klar: {new Date(session.completedAt).toLocaleDateString("sv-SE")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-4xl">
        {/* Overall maturity level */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm mb-6">
          <div className="flex items-center gap-6">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${levelColor}`}>
              <span className="text-3xl font-bold">{result.level}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                Övergripande mognadsnivå
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {maturityLevel?.name ?? `Nivå ${result.level}`}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {maturityLevel?.description}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Genomsnitt: {result.overall.toFixed(1)} av 5.0
              </p>
            </div>
          </div>
        </div>

        {/* Per-dimension scores */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Poäng per dimension</h2>
          <div className="space-y-4">
            {config.dimensions.map((dim) => {
              const dimData = result.scores[dim];
              const score = typeof dimData === "object" ? dimData.average : (dimData ?? 0);
              const percentage = (score / 5) * 100;
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {config.dimensionLabels[dim]}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{score.toFixed(1)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.dimensionDescriptions[dim]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Maturity levels reference */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Mognadsnivåer</h2>
          <div className="space-y-3">
            {config.maturityLevels.map((ml) => (
              <div
                key={ml.level}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                  ml.level === result.level
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/40 bg-card/50"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    ml.level === result.level
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {ml.level}
                </div>
                <div>
                  <p className={`text-sm font-medium ${ml.level === result.level ? "text-primary" : "text-foreground"}`}>
                    {ml.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ml.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="brain" size={16} className="text-primary" />
              AI-insikter
            </h2>
            {!result.aiInsights && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateInsights}
                disabled={generatingInsights}
                className="gap-1.5"
              >
                <Icon name="zap" size={12} />
                {generatingInsights ? "Genererar..." : "Generera AI-insikter"}
              </Button>
            )}
          </div>
          {result.aiInsights ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed">
              {result.aiInsights.split("\n").map((paragraph, i) => {
                if (!paragraph.trim()) return null;
                if (paragraph.startsWith("## ")) {
                  return (
                    <h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-2">
                      {paragraph.replace("## ", "")}
                    </h3>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h4 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1">
                      {paragraph.replace("### ", "")}
                    </h4>
                  );
                }
                if (paragraph.startsWith("- ")) {
                  return (
                    <li key={i} className="text-sm text-foreground/90 ml-4">
                      {paragraph.replace("- ", "")}
                    </li>
                  );
                }
                return (
                  <p key={i} className="text-sm text-foreground/90 mb-2">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-muted/50 p-6 text-center">
              <Icon name="brain" size={24} className="text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Klicka på &quot;Generera AI-insikter&quot; för att få en AI-driven analys av resultaten.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

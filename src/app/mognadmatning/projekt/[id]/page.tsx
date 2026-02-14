"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { use } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureGate } from "@/components/feature-gate";

interface Session {
  id: string;
  shareToken: string;
  status: string;
  respondentName: string;
  respondentEmail: string;
  respondentRole: string;
  completedAt: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  organizationName: string;
  description: string;
  createdAt: string;
  sessions: Session[];
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: "Väntande", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  in_progress: { label: "Pågående", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Klar", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export default function MognadmatningProjektDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <FeatureGate featureKey="mognadmatning.results">
      <ProjektDetailContent projectId={id} />
    </FeatureGate>
  );
}

function ProjektDetailContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/assessments/${projectId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProject(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  async function createSession() {
    setCreating(true);
    try {
      const res = await fetch(`/api/assessments/${projectId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      await fetchProject();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  function copyShareLink(token: string) {
    const url = `${window.location.origin}/mognadmatning/survey/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Laddar projekt...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <Icon name="alert-triangle" size={28} className="text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Projektet hittades inte</h1>
        <Link href="/mognadmatning/projekt" className="text-sm text-primary hover:underline mt-4">
          Tillbaka till projekt
        </Link>
      </div>
    );
  }

  const completedCount = project.sessions.filter((s) => s.status === "completed").length;

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
            <span className="text-foreground">{project.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{project.name}</h1>
              {project.organizationName && (
                <p className="mt-1 text-sm text-muted-foreground">{project.organizationName}</p>
              )}
              {project.description && (
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">{project.description}</p>
              )}
            </div>
            <Button onClick={createSession} disabled={creating} className="gap-2">
              <Icon name="plus" size={16} />
              {creating ? "Skapar..." : "Skapa ny session"}
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
                  <Icon name="users" size={15} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Sessioner</p>
                  <p className="text-lg font-semibold text-foreground leading-tight">{project.sessions.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Icon name="check-circle" size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Klara</p>
                  <p className="text-lg font-semibold text-foreground leading-tight">{completedCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
                  <Icon name="clock" size={15} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Skapad</p>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {new Date(project.createdAt).toLocaleDateString("sv-SE")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions list */}
      <div className="px-8 py-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Sessioner</h2>
        {project.sessions.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
            <Icon name="users" size={24} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Inga sessioner skapade ännu. Skapa en session och dela länken med respondenten.
            </p>
            <Button onClick={createSession} disabled={creating} className="gap-2" variant="outline">
              <Icon name="plus" size={16} />
              Skapa första sessionen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {project.sessions.map((session) => {
              const statusInfo = STATUS_MAP[session.status] ?? STATUS_MAP.pending;
              return (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                        <Icon name="user" size={16} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {session.respondentName || "Anonym respondent"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {session.respondentRole && (
                            <span className="text-xs text-muted-foreground">{session.respondentRole}</span>
                          )}
                          {session.respondentEmail && (
                            <span className="text-xs text-muted-foreground">{session.respondentEmail}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                      <button
                        onClick={() => copyShareLink(session.shareToken)}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        title="Kopiera delningslänk"
                      >
                        <Icon name={copied === session.shareToken ? "check" : "link"} size={12} />
                        {copied === session.shareToken ? "Kopierad!" : "Kopiera länk"}
                      </button>
                      {session.status === "completed" && (
                        <Link href={`/mognadmatning/resultat/${session.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Icon name="bar-chart-3" size={12} />
                            Resultat
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground/70">
                    <span>Skapad: {new Date(session.createdAt).toLocaleDateString("sv-SE")}</span>
                    {session.completedAt && (
                      <span>Klar: {new Date(session.completedAt).toLocaleDateString("sv-SE")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

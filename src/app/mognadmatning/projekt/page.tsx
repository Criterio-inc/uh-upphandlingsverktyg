"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { FeatureGate } from "@/components/feature-gate";
import { EmptyState } from "@/components/ui/empty-state";

interface Project {
  id: string;
  name: string;
  organizationName: string;
  description: string;
  createdAt: string;
  _count?: { sessions: number };
}

export default function MognadmatningProjektPage() {
  return (
    <FeatureGate featureKey="mognadmatning">
      <ProjektListContent />
    </FeatureGate>
  );
}

function ProjektListContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    fetch("/api/assessments?type=digital-mognad")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function handleDelete(projectId: string, projectName: string) {
    if (deleteConfirm !== projectId) {
      setDeleteConfirm(projectId);
      return;
    }

    try {
      const res = await fetch(`/api/assessments/${projectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setDeleteConfirm(null);
      } else {
        alert("Kunde inte radera projektet");
      }
    } catch (err) {
      alert("Ett fel uppstod");
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projekt</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {projects.length > 0
                  ? `${projects.length} projekt for Digital Mognadsmätning`
                  : "Inga projekt skapade ännu"}
              </p>
            </div>
            <Link href="/mognadmatning">
              <Button className="gap-2">
                <Icon name="plus" size={16} />
                Nytt projekt
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Laddar projekt...</p>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon="bar-chart-3"
            title="Inga projekt"
            description="Skapa ditt första projekt för att börja mäta digital mognad."
            action={
              <Link href="/mognadmatning">
                <Button className="gap-2">
                  <Icon name="plus" size={16} />
                  Skapa projekt
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <div key={p.id} className="group relative rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30">
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p.id, p.name);
                  }}
                  className={`absolute top-3 right-3 z-10 rounded-lg p-1.5 transition-all ${
                    deleteConfirm === p.id
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  }`}
                  title={deleteConfirm === p.id ? "Klicka igen för att bekräfta radering" : "Radera projekt"}
                >
                  <Icon name="trash-2" size={14} />
                </button>

                {/* Clickable area */}
                <Link href={`/mognadmatning/projekt/${p.id}`} className="block">
                  {/* Type tag */}
                  <div className="flex items-center justify-between mb-3 pr-8">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Digital Mognad
                    </span>
                    <span className="text-[11px] text-muted-foreground/70">
                      {new Date(p.createdAt).toLocaleDateString("sv-SE")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {p.name}
                  </h3>

                  {/* Organization */}
                  {p.organizationName && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Icon name="flag" size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{p.organizationName}</span>
                    </div>
                  )}

                  {/* Bottom row */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Icon name="users" size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {p._count?.sessions ?? 0} sessioner
                      </span>
                    </div>
                    <Icon name="arrow-right" size={14} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

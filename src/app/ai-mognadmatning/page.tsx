"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { FeatureGate } from "@/components/feature-gate";
import { AI_MOGNAD_CONFIG } from "@/config/assessments";

const config = AI_MOGNAD_CONFIG;

export default function AiMognadmatningPage() {
  return (
    <FeatureGate featureKey="ai-mognadmatning">
      <AiMognadmatningContent />
    </FeatureGate>
  );
}

function AiMognadmatningContent() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", organization: "", description: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentTypeSlug: "ai-mognad",
          name: form.name.trim(),
          organizationName: form.organization.trim(),
          description: form.description.trim(),
        }),
      });
      if (!res.ok) throw new Error("Kunde inte skapa projekt");
      const data = await res.json();
      router.push(`/ai-mognadmatning/projekt/${data.project.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
              <Icon name="brain" size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {config.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-3xl">
        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                <Icon name="file-text" size={15} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Frågor</p>
                <p className="text-lg font-semibold text-foreground leading-tight">{config.questionCount}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                <Icon name="target" size={15} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Dimensioner</p>
                <p className="text-lg font-semibold text-foreground leading-tight">{config.dimensionCount}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                <Icon name="clock" size={15} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Tidsåtgång</p>
                <p className="text-lg font-semibold text-foreground leading-tight">~15 min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions overview */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-4">Dimensioner som mäts</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {config.dimensions.map((dim) => (
              <div key={dim} className="flex items-start gap-3 rounded-xl border border-border/40 bg-card/50 p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 mt-0.5">
                  <Icon name="check" size={12} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{config.dimensionLabels[dim]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{config.dimensionDescriptions[dim]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create project */}
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Icon name="plus" size={16} />
            Skapa nytt projekt
          </Button>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">Nytt projekt</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Projektnamn <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="t.ex. AI-mognadsmätning Q1 2025"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Organisation
                </label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="t.ex. Kommun X"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Beskrivning
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Valfri beskrivning av projektet..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={loading || !form.name.trim()} className="gap-2">
                  {loading ? "Skapar..." : "Skapa projekt"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Avbryt
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibraryItem {
  id: string;
  title: string;
  type: string;
  description: string;
  profile: string;
  cluster: string;
  tags: string;
}

const TYPE_LABELS: Record<string, string> = {
  requirement_block: "Kravblock",
  risk_template: "Riskmall",
  workshop_template: "Workshopmall",
  criteria_block: "Kriterieblock",
  contract_clause: "Kontraktsklausul",
  phase_checklist: "Faschecklista",
};

export function ImportToCaseDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/library")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, [open]);

  async function handleImport(itemId: string) {
    setImporting(itemId);
    const res = await fetch("/api/library/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ libraryItemId: itemId, caseId }),
    });
    if (res.ok) {
      const data = await res.json();
      setImported((prev) => new Set(prev).add(itemId));
      setImporting(null);
      if (data.count > 0) {
        router.refresh();
      }
    } else {
      setImporting(null);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} title="Öppna biblioteket och importera färdiga mallar till denna upphandling">
        Importera från bibliotek
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <h2 className="font-semibold tracking-tight">Importera från bibliotek</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-96 overflow-auto p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Laddar bibliotek...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Biblioteket är tomt. Kör seed för att fylla det.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const tags = (() => { try { return JSON.parse(item.tags); } catch { return []; } })();
                const isImported = imported.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-xl border border-border/60 p-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted">
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {item.profile && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{item.profile}</span>
                        )}
                        {item.cluster && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.cluster}</span>
                        )}
                        {tags.map((tag: string) => (
                          <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isImported ? "outline" : "default"}
                      disabled={importing === item.id || isImported}
                      onClick={() => handleImport(item.id)}
                      className="ml-3 shrink-0"
                    >
                      {importing === item.id
                        ? "Importerar..."
                        : isImported
                          ? "Importerad"
                          : "Importera"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-border/40 px-5 py-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Stäng
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EntityPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  /** API URL to fetch entities, e.g. /api/cases/CASE-000001/needs */
  apiUrl: string;
  /** Display entity type name for UI */
  entityLabel?: string;
}

interface PickerEntity {
  id: string;
  title: string;
}

export function EntityPicker({
  value,
  onChange,
  label,
  apiUrl,
  entityLabel = "entitet",
}: EntityPickerProps) {
  const [entities, setEntities] = useState<PickerEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch entities on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          // API might return { items: [...] } or directly [...]
          const items = Array.isArray(data) ? data : (data.items ?? []);
          if (!cancelled) {
            setEntities(items.map((e: Record<string, unknown>) => ({
              id: String(e.id),
              title: String(e.title ?? e.name ?? e.id),
            })));
          }
        }
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [apiUrl]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function removeItem(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  const filtered = entities.filter((e) => {
    const q = search.toLowerCase();
    return e.id.toLowerCase().includes(q) || e.title.toLowerCase().includes(q);
  });

  const selectedEntities = value
    .map((id) => entities.find((e) => e.id === id))
    .filter(Boolean) as PickerEntity[];

  return (
    <div className="space-y-1" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

      {/* Selected items */}
      {selectedEntities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {selectedEntities.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs"
            >
              <span className="font-mono text-[10px] text-muted-foreground">{e.id}</span>
              <span className="truncate max-w-[160px]">{e.title}</span>
              <button
                type="button"
                onClick={() => removeItem(e.id)}
                className="text-muted-foreground hover:text-destructive ml-0.5"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full h-8 rounded-md border border-border bg-background px-2 text-sm text-left",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        )}
      >
        {loading ? (
          <span className="text-muted-foreground">Laddar...</span>
        ) : (
          <span className="text-muted-foreground">
            + Koppla {entityLabel} ({value.length} valda)
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-md border border-border bg-background shadow-lg max-h-60 overflow-auto">
          <div className="p-1.5 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Sök ${entityLabel}...`}
              className="w-full h-7 rounded border border-border bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
              autoFocus
            />
          </div>
          {filtered.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              Inga {entityLabel} hittades
            </div>
          ) : (
            <div className="py-1">
              {filtered.map((e) => {
                const selected = value.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggle(e.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-muted",
                      selected && "bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center text-[10px]",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}>
                      {selected && "✓"}
                    </span>
                    <span className="font-mono text-muted-foreground">{e.id}</span>
                    <span className="truncate">{e.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

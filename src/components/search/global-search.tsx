"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Search } from "lucide-react";
import type { SearchResult } from "@/types/api";

const ENTITY_PATHS: Record<string, string> = {
  need: "needs",
  requirement: "requirements",
  risk: "risks",
  criterion: "criteria",
  stakeholder: "stakeholders",
  decision: "decisions",
  document: "documents",
  workshop: "workshops",
  bid: "bids",
  evidence: "evidence",
};

const ENTITY_ICONS: Record<string, string> = {
  need: "lightbulb",
  requirement: "ruler",
  risk: "shield-alert",
  criterion: "scale",
  stakeholder: "users",
  decision: "gavel",
  document: "file-text",
  workshop: "presentation",
  bid: "inbox",
  evidence: "paperclip",
};

const ENTITY_LABELS: Record<string, string> = {
  need: "Behov",
  requirement: "Krav",
  risk: "Risk",
  criterion: "Kriterium",
  stakeholder: "Intressent",
  decision: "Beslut",
  document: "Dokument",
  workshop: "Workshop",
  bid: "Anbud",
  evidence: "Evidens",
};

const SMART_QUERIES = [
  { label: "Krav utan spårbarhet", query: "krav utan spårbarhet" },
  { label: "Risker utan åtgärd", query: "risker utan åtgärd" },
  { label: "SKA utan verifiering", query: "SKA utan verifiering" },
  { label: "Behov utan krav", query: "behov utan krav" },
  { label: "Höga risker", query: "höga risker" },
];

export function GlobalSearch({ caseId }: { caseId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Search debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setSelectedIdx(-1);
    const timer = setTimeout(() => {
      fetch(`/api/cases/${caseId}/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
          setOpen(true);
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [query, caseId]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navigate = useCallback((result: SearchResult) => {
    const path = ENTITY_PATHS[result.entityType];
    if (path) {
      router.push(`/cases/${result.caseId}/${path}/${result.id}`);
      setOpen(false);
      setQuery("");
      setActiveFilter(null);
    }
  }, [router]);

  // Filter results by entity type
  const filteredResults = activeFilter
    ? results.filter((r) => r.entityType === activeFilter)
    : results;

  // Get unique entity types from results for filter chips
  const entityTypes = [...new Set(results.map((r) => r.entityType))];

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIdx >= 0 && selectedIdx < filteredResults.length) {
      e.preventDefault();
      navigate(filteredResults[selectedIdx]);
    }
  }

  function handleSmartQuery(q: string) {
    setQuery(q);
    inputRef.current?.focus();
  }

  const showDropdown = open && (results.length > 0 || loading || (query.length === 0));

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Sök i upphandlingen... (⌘K)"
          className="w-72 rounded-xl border border-input bg-card pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow duration-150"
        />
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 z-50 mt-2 w-[28rem] rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Smart queries (show when empty) */}
          {query.length === 0 && !loading && (
            <div className="p-3 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">Smarta s&ouml;kningar</p>
              <div className="flex flex-wrap gap-1.5">
                {SMART_QUERIES.map((sq) => (
                  <button
                    key={sq.query}
                    onClick={() => handleSmartQuery(sq.query)}
                    className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {sq.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter chips */}
          {entityTypes.length > 1 && results.length > 0 && (
            <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border">
              <button
                onClick={() => setActiveFilter(null)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  activeFilter === null ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                }`}
              >
                Alla ({results.length})
              </button>
              {entityTypes.map((type) => {
                const count = results.filter((r) => r.entityType === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors inline-flex items-center gap-1 ${
                      activeFilter === type ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <Icon name={ENTITY_ICONS[type] ?? "file-text"} size={12} />
                    {ENTITY_LABELS[type] ?? type} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="px-3 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              S&ouml;ker...
            </div>
          )}

          {filteredResults.length > 0 && (
            <ul className="max-h-80 overflow-auto py-1">
              {filteredResults.map((r, idx) => (
                <li key={r.id}>
                  <button
                    onClick={() => navigate(r)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                      idx === selectedIdx ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      <Icon name={ENTITY_ICONS[r.entityType] ?? "file-text"} size={14} className="text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{r.title}</span>
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {ENTITY_LABELS[r.entityType] ?? r.entityType}
                        </span>
                      </div>
                      {r.matchSnippet && r.matchField !== "title" && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          <span className="text-[10px] opacity-60">{r.matchField}: </span>
                          {r.matchSnippet}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">{r.id}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              <p>Inga resultat f&ouml;r &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Prova en av de smarta s&ouml;kningarna nedan</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {SMART_QUERIES.slice(0, 3).map((sq) => (
                  <button
                    key={sq.query}
                    onClick={() => handleSmartQuery(sq.query)}
                    className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {sq.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground">
            <span>&uarr;&darr; navigera &middot; &crarr; &ouml;ppna &middot; esc st&auml;ng</span>
            <span>&amp;#8984;K snabbkommando</span>
          </div>
        </div>
      )}
    </div>
  );
}

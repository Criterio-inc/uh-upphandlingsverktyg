"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface KeyValueRepeaterProps {
  /** For object-style: Record<string, string>. For array-style: Array<Record<string, string>> */
  value: Record<string, string> | Record<string, string>[];
  onChange: (value: Record<string, string> | Record<string, string>[]) => void;
  label?: string;
  /** Column definitions for array mode, e.g. ["indicator", "baseline", "target"] */
  columns?: { key: string; label: string; placeholder?: string }[];
}

/**
 * Renders either:
 * 1. A key-value table (when no columns specified) — for anchors { "0": "Uppfyller inte", "5": "Fullt ut" }
 * 2. A multi-column row repeater — for metrics [{ indicator: "...", baseline: "...", target: "..." }]
 */
export function KeyValueRepeater({ value, label, onChange, columns }: KeyValueRepeaterProps) {
  // Detect mode
  const isArrayMode = columns && columns.length > 0;

  if (isArrayMode) {
    return (
      <ArrayRepeater
        value={Array.isArray(value) ? value : []}
        onChange={onChange as (v: Record<string, string>[]) => void}
        label={label}
        columns={columns!}
      />
    );
  }

  return (
    <ObjectRepeater
      value={Array.isArray(value) ? {} : value}
      onChange={onChange as (v: Record<string, string>) => void}
      label={label}
    />
  );
}

// --- Object mode (key-value pairs) ---

function ObjectRepeater({
  value,
  onChange,
  label,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  label?: string;
}) {
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const entries = Object.entries(value);

  function addEntry() {
    if (!newKey.trim()) return;
    onChange({ ...value, [newKey.trim()]: newVal });
    setNewKey("");
    setNewVal("");
  }

  function removeEntry(key: string) {
    const copy = { ...value };
    delete copy[key];
    onChange(copy);
  }

  function updateValue(key: string, newValue: string) {
    onChange({ ...value, [key]: newValue });
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

      {entries.length > 0 && (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-2 py-1 text-xs font-medium text-muted-foreground w-24">Nyckel</th>
                <th className="text-left px-2 py-1 text-xs font-medium text-muted-foreground">Värde</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([k, v]) => (
                <tr key={k} className="border-t border-border">
                  <td className="px-2 py-1 font-mono text-xs">{k}</td>
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={v}
                      onChange={(e) => updateValue(k, e.target.value)}
                      className="w-full h-6 bg-transparent text-xs border-none focus:outline-none"
                    />
                  </td>
                  <td className="px-1">
                    <button
                      type="button"
                      onClick={() => removeEntry(k)}
                      className="text-muted-foreground hover:text-destructive text-xs"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-1">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Nyckel"
          className={cn(
            "w-24 h-7 rounded-md border border-border bg-background px-2 text-xs",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
          )}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEntry())}
        />
        <input
          type="text"
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          placeholder="Värde"
          className={cn(
            "flex-1 h-7 rounded-md border border-border bg-background px-2 text-xs",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
          )}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEntry())}
        />
        <button
          type="button"
          onClick={addEntry}
          disabled={!newKey.trim()}
          className="h-7 px-2 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

// --- Array mode (multi-column rows) ---

function ArrayRepeater({
  value,
  onChange,
  label,
  columns,
}: {
  value: Record<string, string>[];
  onChange: (v: Record<string, string>[]) => void;
  label?: string;
  columns: { key: string; label: string; placeholder?: string }[];
}) {
  function addRow() {
    const empty: Record<string, string> = {};
    for (const col of columns) empty[col.key] = "";
    onChange([...value, empty]);
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateCell(rowIndex: number, colKey: string, cellValue: string) {
    const rows = [...value];
    rows[rowIndex] = { ...rows[rowIndex], [colKey]: cellValue };
    onChange(rows);
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

      {value.length > 0 && (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-2 py-1 text-xs font-medium text-muted-foreground">
                    {col.label}
                  </th>
                ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {value.map((row, ri) => (
                <tr key={ri} className="border-t border-border">
                  {columns.map((col) => (
                    <td key={col.key} className="px-2 py-1">
                      <input
                        type="text"
                        value={row[col.key] ?? ""}
                        onChange={(e) => updateCell(ri, col.key, e.target.value)}
                        placeholder={col.placeholder ?? col.label}
                        className="w-full h-6 bg-transparent text-xs border-none focus:outline-none placeholder:text-muted-foreground/50"
                      />
                    </td>
                  ))}
                  <td className="px-1">
                    <button
                      type="button"
                      onClick={() => removeRow(ri)}
                      className="text-muted-foreground hover:text-destructive text-xs"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        className="h-7 px-2 rounded-md border border-border text-xs hover:bg-muted"
      >
        + Lägg till rad
      </button>
    </div>
  );
}

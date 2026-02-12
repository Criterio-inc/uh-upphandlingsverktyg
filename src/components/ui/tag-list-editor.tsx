"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TagListEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  /** Show numbered list instead of chips */
  ordered?: boolean;
}

export function TagListEditor({
  value,
  onChange,
  label,
  placeholder = "Skriv och tryck Enter...",
  ordered = false,
}: TagListEditorProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    inputRef.current?.focus();
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveTag(index: number, direction: -1 | 1) {
    if (index + direction < 0 || index + direction >= value.length) return;
    const newVal = [...value];
    const [item] = newVal.splice(index, 1);
    newVal.splice(index + direction, 0, item);
    onChange(newVal);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

      {/* Existing items */}
      {value.length > 0 && (
        <div className={cn(ordered ? "space-y-1" : "flex flex-wrap gap-1")}>
          {value.map((tag, i) => (
            <div
              key={`${tag}-${i}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-sm",
                ordered && "w-full"
              )}
            >
              {ordered && (
                <span className="mr-1 text-xs text-muted-foreground font-mono w-5">{i + 1}.</span>
              )}
              <span className="flex-1 truncate">{tag}</span>
              {ordered && (
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveTag(i, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs px-0.5"
                    title="Flytta upp"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTag(i, 1)}
                    disabled={i === value.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs px-0.5"
                    title="Flytta ner"
                  >
                    ↓
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="text-muted-foreground hover:text-destructive text-xs ml-1"
                title="Ta bort"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-1">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex-1 h-8 rounded-md border border-border bg-background px-2 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          )}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className={cn(
            "h-8 px-2 rounded-md border border-border text-sm",
            "hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          +
        </button>
      </div>
    </div>
  );
}

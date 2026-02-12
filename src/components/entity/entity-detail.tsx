"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, PriorityBadge, LevelBadge } from "@/components/ui/badge";
import { VerificationDisplay } from "@/components/ui/verification-editor";
import { Tooltip } from "@/components/ui/tooltip";
import type { EntityMeta, FieldMeta } from "@/config/entity-meta";
import { formatDateTime } from "@/lib/utils";

interface EntityDetailProps {
  meta: EntityMeta;
  item: Record<string, unknown>;
  editUrl: string;
  deleteUrl: string;
  backUrl: string;
}

function parseJson(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

/** Render a tag/chip list */
function TagChips({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/** Render an ordered list */
function OrderedItems({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <ol className="list-decimal list-inside space-y-0.5 text-sm">
      {items.map((item, i) => (
        <li key={`${item}-${i}`}>{item}</li>
      ))}
    </ol>
  );
}

/** Render entity-picker values as linked IDs */
function EntityLinks({ ids }: { ids: string[] }) {
  if (ids.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {ids.map((id) => (
        <span
          key={id}
          className="inline-flex rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-mono"
        >
          {id}
        </span>
      ))}
    </div>
  );
}

/** Render key-value pairs */
function KeyValueDisplay({ data }: { data: Record<string, string> | Record<string, string>[] }) {
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-muted-foreground">—</span>;
    const keys = Object.keys(data[0] ?? {});
    return (
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              {keys.map((k) => (
                <th key={k} className="text-left px-2 py-1 font-medium text-muted-foreground capitalize">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {keys.map((k) => (
                  <td key={k} className="px-2 py-1">{row[k] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const entries = Object.entries(data);
  if (entries.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-xs">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k} className="border-t border-border first:border-t-0">
              <td className="px-2 py-1 font-mono text-muted-foreground w-24">{k}</td>
              <td className="px-2 py-1">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailValue({ field, value }: { field: FieldMeta; value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  if (field.key === "status") return <StatusBadge status={String(value)} />;
  if (field.key === "priority") return <PriorityBadge priority={String(value)} />;
  if (field.key === "level") return <LevelBadge level={String(value)} />;
  if (field.key === "qualified") return <span>{value ? "Ja" : "Nej"}</span>;

  if (field.type === "select") {
    const opt = field.options?.find((o) => o.value === value);
    return <span>{opt?.label ?? String(value)}</span>;
  }

  // ---- Structured field types ----

  if (field.type === "tag-list") {
    const parsed = parseJson(value);
    const items = Array.isArray(parsed) ? parsed.map(String) : [];
    return <TagChips items={items} />;
  }

  if (field.type === "ordered-list") {
    const parsed = parseJson(value);
    const items = Array.isArray(parsed) ? parsed.map(String) : [];
    return <OrderedItems items={items} />;
  }

  if (field.type === "entity-picker") {
    const parsed = parseJson(value);
    const ids = Array.isArray(parsed) ? parsed.map(String) : [];
    return <EntityLinks ids={ids} />;
  }

  if (field.type === "key-value-repeater") {
    const parsed = parseJson(value);
    if (Array.isArray(parsed)) {
      return <KeyValueDisplay data={parsed as Record<string, string>[]} />;
    }
    if (parsed && typeof parsed === "object") {
      return <KeyValueDisplay data={parsed as Record<string, string>} />;
    }
    return <span className="text-muted-foreground">—</span>;
  }

  if (field.type === "verification") {
    const parsed = parseJson(value);
    const obj = (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      ? parsed as { bidEvidence: string; implementationProof: string; opsFollowUp: string }
      : { bidEvidence: "", implementationProof: "", opsFollowUp: "" };
    return <VerificationDisplay value={obj} />;
  }

  // Legacy JSON fallback
  if (field.type === "json") {
    let parsed = value;
    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value);
      } catch {
        return <span className="font-mono text-xs">{String(value)}</span>;
      }
    }
    if (Array.isArray(parsed) && parsed.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }
    if (typeof parsed === "object" && parsed !== null && Object.keys(parsed as object).length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }
    return (
      <pre className="rounded bg-muted p-2 text-xs font-mono overflow-auto max-h-40">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  }

  if (field.type === "textarea") {
    return <p className="whitespace-pre-wrap text-sm">{String(value)}</p>;
  }

  return <span>{String(value)}</span>;
}

export function EntityDetail({ meta, item, editUrl, deleteUrl, backUrl }: EntityDetailProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Ta bort ${meta.singularLabel.toLowerCase()} ${item.id}?`)) return;
    setDeleting(true);

    const res = await fetch(deleteUrl, { method: "DELETE" });
    if (res.ok) {
      router.push(backUrl);
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push(editUrl)}>
          Redigera
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Tar bort..." : "Ta bort"}
        </Button>
      </div>

      <Card>
        <CardContent>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">ID</dt>
              <dd className="font-mono text-sm">{String(item.id)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Version</dt>
              <dd className="text-sm">{String(item.version ?? 1)}</dd>
            </div>
            {meta.fields.map((field) => (
              <div key={field.key}>
                <dt className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  {field.label}
                  {field.helpText && <Tooltip content={field.helpText} side="right" />}
                </dt>
                <dd className="mt-0.5">
                  <DetailValue field={field} value={item[field.key]} />
                </dd>
              </div>
            ))}
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Skapad</dt>
              <dd className="text-sm text-muted-foreground">{formatDateTime(item.createdAt as string)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Uppdaterad</dt>
              <dd className="text-sm text-muted-foreground">{formatDateTime(item.updatedAt as string)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

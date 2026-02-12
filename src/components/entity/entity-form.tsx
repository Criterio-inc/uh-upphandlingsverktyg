"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TagListEditor } from "@/components/ui/tag-list-editor";
import { EntityPicker } from "@/components/ui/entity-picker";
import { KeyValueRepeater } from "@/components/ui/key-value-repeater";
import { VerificationEditor } from "@/components/ui/verification-editor";
import { Tooltip } from "@/components/ui/tooltip";
import type { EntityMeta, FieldMeta } from "@/config/entity-meta";

interface EntityFormProps {
  meta: EntityMeta;
  apiUrl: string;
  returnUrl: string;
  initialData?: Record<string, unknown>;
  isEdit?: boolean;
  clusterOptions?: string[];
  /** caseId needed for entity-picker API URLs */
  caseId?: string;
}

/** Parse a JSON field from DB string or keep as-is if already parsed */
function parseJsonField(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function ensureStringArray(value: unknown): string[] {
  const parsed = parseJsonField(value);
  if (Array.isArray(parsed)) return parsed.map(String);
  return [];
}

function ensureRecord(value: unknown): Record<string, string> {
  const parsed = parseJsonField(value);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return parsed as Record<string, string>;
  }
  return {};
}

function ensureRecordArray(value: unknown): Record<string, string>[] {
  const parsed = parseJsonField(value);
  if (Array.isArray(parsed)) return parsed as Record<string, string>[];
  return [];
}

function ensureVerification(value: unknown): { bidEvidence: string; implementationProof: string; opsFollowUp: string } {
  const parsed = parseJsonField(value);
  const obj = (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed as Record<string, string> : {};
  return {
    bidEvidence: obj.bidEvidence ?? "",
    implementationProof: obj.implementationProof ?? "",
    opsFollowUp: obj.opsFollowUp ?? "",
  };
}

function FieldRenderer({
  field,
  defaultValue,
  clusterOptions,
  structuredValue,
  onStructuredChange,
  caseId,
}: {
  field: FieldMeta;
  defaultValue: unknown;
  clusterOptions?: string[];
  structuredValue?: unknown;
  onStructuredChange?: (value: unknown) => void;
  caseId?: string;
}) {
  const id = field.key;

  // Handle cluster field with dynamic options from profile
  if (field.key === "cluster" && clusterOptions && clusterOptions.length > 0) {
    const options = clusterOptions.map((c) => ({ value: c, label: c }));
    return (
      <Select
        id={id}
        name={id}
        label={field.label}
        options={options}
        defaultValue={String(defaultValue ?? "")}
        placeholder="Välj kluster..."
      />
    );
  }

  switch (field.type) {
    case "text":
      return (
        <Input
          id={id}
          name={id}
          label={field.label}
          required={field.required}
          defaultValue={String(defaultValue ?? "")}
          placeholder={field.placeholder}
        />
      );
    case "number":
      return (
        <Input
          id={id}
          name={id}
          label={field.label}
          type="number"
          required={field.required}
          defaultValue={defaultValue != null ? String(defaultValue) : ""}
          placeholder={field.placeholder}
        />
      );
    case "textarea":
      return (
        <Textarea
          id={id}
          name={id}
          label={field.label}
          required={field.required}
          defaultValue={String(defaultValue ?? "")}
          placeholder={field.placeholder}
        />
      );
    case "select":
      return (
        <Select
          id={id}
          name={id}
          label={field.label}
          options={field.options ?? []}
          defaultValue={String(defaultValue ?? "")}
          placeholder={field.placeholder}
        />
      );
    case "boolean":
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium">{field.label}</label>
          <input
            type="checkbox"
            id={id}
            name={id}
            defaultChecked={Boolean(defaultValue)}
            className="h-4 w-4 rounded border-border"
          />
        </div>
      );
    case "date":
      return (
        <Input
          id={id}
          name={id}
          label={field.label}
          type="date"
          defaultValue={String(defaultValue ?? "")}
        />
      );

    // ---- Structured field types (controlled state) ----

    case "tag-list":
      return (
        <TagListEditor
          label={field.label}
          value={structuredValue as string[] ?? []}
          onChange={(v) => onStructuredChange?.(v)}
          placeholder={field.placeholder}
        />
      );

    case "ordered-list":
      return (
        <TagListEditor
          label={field.label}
          value={structuredValue as string[] ?? []}
          onChange={(v) => onStructuredChange?.(v)}
          placeholder={field.placeholder}
          ordered
        />
      );

    case "entity-picker": {
      const config = field.entityPickerConfig;
      const apiUrl = caseId && config
        ? `/api/cases/${caseId}/${config.entityType}`
        : "";
      return (
        <EntityPicker
          label={field.label}
          value={structuredValue as string[] ?? []}
          onChange={(v) => onStructuredChange?.(v)}
          apiUrl={apiUrl}
          entityLabel={config?.label ?? "entitet"}
        />
      );
    }

    case "key-value-repeater":
      return (
        <KeyValueRepeater
          label={field.label}
          value={structuredValue as Record<string, string> | Record<string, string>[] ?? {}}
          onChange={(v) => onStructuredChange?.(v)}
          columns={field.repeaterColumns}
        />
      );

    case "verification":
      return (
        <VerificationEditor
          label={field.label}
          value={structuredValue as { bidEvidence: string; implementationProof: string; opsFollowUp: string } ?? { bidEvidence: "", implementationProof: "", opsFollowUp: "" }}
          onChange={(v) => onStructuredChange?.(v)}
        />
      );

    case "json":
      return (
        <Textarea
          id={id}
          name={id}
          label={field.label}
          defaultValue={
            typeof defaultValue === "string"
              ? defaultValue
              : JSON.stringify(defaultValue ?? [], null, 2)
          }
          placeholder="JSON-format"
          className="font-mono text-xs"
        />
      );
    case "file":
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium">{field.label}</label>
          <input type="file" id={id} name={id} className="text-sm" />
          {defaultValue ? <p className="text-xs text-muted-foreground">{String(defaultValue)}</p> : null}
        </div>
      );
    default:
      return (
        <Input
          id={id}
          name={id}
          label={field.label}
          defaultValue={String(defaultValue ?? "")}
        />
      );
  }
}

/** Types that are managed via controlled state instead of FormData */
const STRUCTURED_TYPES = new Set(["tag-list", "ordered-list", "entity-picker", "key-value-repeater", "verification"]);

export function EntityForm({
  meta,
  apiUrl,
  returnUrl,
  initialData,
  isEdit,
  clusterOptions,
  caseId,
}: EntityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Filter out non-editable fields
  const editableFields = meta.fields.filter(
    (f) => f.key !== "score" // auto-calculated
  );

  // Initialize controlled state for structured fields
  const initStructured = useCallback(() => {
    const state: Record<string, unknown> = {};
    for (const field of editableFields) {
      if (!STRUCTURED_TYPES.has(field.type)) continue;
      const raw = initialData?.[field.key];
      switch (field.type) {
        case "tag-list":
        case "ordered-list":
        case "entity-picker":
          state[field.key] = ensureStringArray(raw);
          break;
        case "key-value-repeater":
          state[field.key] = field.repeaterColumns
            ? ensureRecordArray(raw)
            : ensureRecord(raw);
          break;
        case "verification":
          state[field.key] = ensureVerification(raw);
          break;
      }
    }
    return state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [structured, setStructured] = useState<Record<string, unknown>>(initStructured);

  function updateStructured(key: string, value: unknown) {
    setStructured((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};

    for (const field of editableFields) {
      // Structured fields come from state, not FormData
      if (STRUCTURED_TYPES.has(field.type)) {
        body[field.key] = structured[field.key];
        continue;
      }

      const value = form.get(field.key);

      if (field.type === "boolean") {
        body[field.key] = form.has(field.key);
      } else if (field.type === "number") {
        body[field.key] = value ? Number(value) : 0;
      } else if (field.type === "json") {
        try {
          body[field.key] = value ? JSON.parse(String(value)) : [];
        } catch {
          body[field.key] = String(value ?? "");
        }
      } else if (field.type === "file") {
        // File upload handled separately
        continue;
      } else {
        body[field.key] = String(value ?? "");
      }
    }

    const res = await fetch(apiUrl, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push(returnUrl);
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editableFields.map((field) => {
            let defaultValue = initialData?.[field.key];
            // Parse JSON strings from DB for legacy json type
            if (field.type === "json" && typeof defaultValue === "string") {
              try {
                defaultValue = JSON.parse(defaultValue);
              } catch {
                // leave as string
              }
            }
            return (
              <div key={field.key} className="relative">
                {field.helpText && (
                  <div className="absolute right-0 top-0">
                    <Tooltip content={field.helpText} side="left" />
                  </div>
                )}
                <FieldRenderer
                  field={field}
                  defaultValue={defaultValue}
                  clusterOptions={field.key === "cluster" ? clusterOptions : undefined}
                  structuredValue={STRUCTURED_TYPES.has(field.type) ? structured[field.key] : undefined}
                  onStructuredChange={STRUCTURED_TYPES.has(field.type) ? (v) => updateStructured(field.key, v) : undefined}
                  caseId={caseId}
                />
              </div>
            );
          })}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Sparar..." : isEdit ? "Spara" : `Skapa ${meta.singularLabel.toLowerCase()}`}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Avbryt
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

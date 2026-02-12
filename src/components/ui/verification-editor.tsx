"use client";

import { cn } from "@/lib/utils";

interface VerificationData {
  bidEvidence: string;
  implementationProof: string;
  opsFollowUp: string;
}

interface VerificationEditorProps {
  value: VerificationData;
  onChange: (value: VerificationData) => void;
  label?: string;
}

const VERIFICATION_FIELDS: { key: keyof VerificationData; label: string; placeholder: string }[] = [
  {
    key: "bidEvidence",
    label: "Vid anbud",
    placeholder: "Vad ska leverantören visa i anbudet?",
  },
  {
    key: "implementationProof",
    label: "Vid implementering",
    placeholder: "Hur verifieras vid införande?",
  },
  {
    key: "opsFollowUp",
    label: "I drift",
    placeholder: "Hur följs kravet upp löpande?",
  },
];

export function VerificationEditor({ value, onChange, label }: VerificationEditorProps) {
  function updateField(key: keyof VerificationData, newValue: string) {
    onChange({ ...value, [key]: newValue });
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
        {VERIFICATION_FIELDS.map((f) => (
          <div key={f.key} className="flex items-start gap-2 p-2">
            <div className="w-28 shrink-0">
              <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
            </div>
            <textarea
              value={value[f.key] ?? ""}
              onChange={(e) => updateField(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={2}
              className={cn(
                "flex-1 bg-transparent text-xs resize-none border-none focus:outline-none",
                "placeholder:text-muted-foreground/50"
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Read-only display for detail view */
export function VerificationDisplay({ value, label }: { value: VerificationData; label?: string }) {
  const hasAny = value.bidEvidence || value.implementationProof || value.opsFollowUp;

  if (!hasAny) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="space-y-1">
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
        {VERIFICATION_FIELDS.map((f) => {
          const val = value[f.key];
          if (!val) return null;
          return (
            <div key={f.key} className="flex items-start gap-2 p-2">
              <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">{f.label}</span>
              <span className="text-xs">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ImportRestore({ caseId }: { caseId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("loading");
    setMessage("");

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch(`/api/cases/${caseId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setStatus("done");
        setMessage(`Importerade ${result.created} objekt.`);
        router.refresh();
      } else {
        const err = await res.json();
        setStatus("error");
        setMessage(err.error ?? "Import misslyckades");
      }
    } catch {
      setStatus("error");
      setMessage("Kunde inte läsa JSON-filen");
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFile}
        className="hidden"
        id="import-file"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={status === "loading"}
        title="Återställ upphandlingsdata från en tidigare exporterad JSON-fil"
      >
        {status === "loading" ? "Importerar..." : "Importera JSON"}
      </Button>
      {message && (
        <span className={`text-xs ${status === "error" ? "text-red-600" : "text-green-600"}`}>
          {message}
        </span>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";

export function ExportButtons({ caseId }: { caseId: string }) {
  function download(format: string) {
    window.open(`/api/cases/${caseId}/export?format=${format}`, "_blank");
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => download("xlsx")} title="Exportera hela upphandlingen som Excel-fil (XLSX)">
        XLSX
      </Button>
      <Button variant="outline" size="sm" onClick={() => download("json")} title="Exportera hela upphandlingen som JSON-fil för säkerhetskopiering eller import">
        JSON
      </Button>
      <Button variant="outline" size="sm" onClick={() => download("csv&entity=requirement")} title="Exportera kravlistan som CSV-fil för analys i kalkylprogram">
        Krav CSV
      </Button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { StatusBadge, PriorityBadge, LevelBadge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { EntityMeta, FieldMeta } from "@/config/entity-meta";
import type { EntityType } from "@/types/entities";

/** Contextual guidance shown when an entity list is empty */
const EMPTY_STATE_GUIDANCE: Partial<Record<EntityType, string>> = {
  need: "Börja med att identifiera verksamhetens behov. Genomför workshops och intervjuer med intressenter. Behov styr alla krav.",
  stakeholder: "Kartlägg alla som berörs av upphandlingen: beställare, slutanvändare, IT, ekonomi, fackliga. Inflytande × intresse styr engagemangsstrategin.",
  risk: "Identifiera risker tidigt — teknik, juridik, leverans, verksamhet. Sannolikhet × konsekvens ger risktal. Höga risker (≥12) ska åtgärdas.",
  requirement: "Formulera krav som är verifierbara och spårbara till behov. SKA = obligatoriskt (binärt). BÖR = utvärderas med poäng.",
  criterion: "Definiera utvärderingskriterier med vikter som summerar till 100%. Koppla till BÖR-krav. Beskriv poängankare för konsekvent bedömning.",
  workshop: "Workshops samlar intressenter för att kartlägga behov, validera krav eller identifiera risker. Dokumentera agenda, deltagare och resultat.",
  evidence: "Samla evidens som styrker behov och krav: intervjuprotokoll, statistik, marknadsnoteringar. Stärker proportionalitet vid överprövning.",
  bid: "Registrera mottagna anbud. Kvalificera mot SKA-krav innan utvärdering. Dokumentera alla kvalificeringsbeslut.",
  decision: "Dokumentera beslut med alternativ och motivering. Förfarandeval och tilldelning är obligatoriska gates.",
  document: "Skapa och versionshantera upphandlingsdokument: behovsrapport, kravbilaga, utvärderingsprotokoll m.fl.",
};

interface EntityListProps {
  meta: EntityMeta;
  items: Record<string, unknown>[];
  caseId: string;
  basePath: string;
}

function renderCell(field: FieldMeta, value: unknown) {
  if (value === null || value === undefined || value === "") return "—";

  if (field.key === "status") return <StatusBadge status={String(value)} />;
  if (field.key === "priority") return <PriorityBadge priority={String(value)} />;
  if (field.key === "level") return <LevelBadge level={String(value)} />;
  if (field.key === "qualified") return value ? "Ja" : "Nej";
  if (field.key === "score") return <span className="font-mono">{String(value)}</span>;

  if (field.type === "select") {
    const opt = field.options?.find((o) => o.value === value);
    return opt?.label ?? String(value);
  }

  return String(value);
}

export function EntityList({ meta, items, caseId, basePath }: EntityListProps) {
  const visibleFields = meta.fields.filter((f) => meta.listFields.includes(f.key));

  if (items.length === 0) {
    const guidance = EMPTY_STATE_GUIDANCE[meta.type];
    return (
      <EmptyState
        icon={meta.icon}
        title={`Inga ${meta.pluralLabel.toLowerCase()}`}
        description={guidance ?? `Skapa ${meta.singularLabel.toLowerCase()} för att komma igång.`}
        action={
          <Link href={`${basePath}/new`}>
            <Button>Ny {meta.singularLabel.toLowerCase()}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-28">ID</TableHead>
          {visibleFields.map((f) => (
            <TableHead key={f.key}>{f.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={String(item.id)}>
            <TableCell className="font-mono text-xs">{String(item.id)}</TableCell>
            {visibleFields.map((f, i) => (
              <TableCell key={f.key}>
                {i === 0 ? (
                  <Link
                    href={`${basePath}/${item.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {renderCell(f, item[f.key])}
                  </Link>
                ) : (
                  renderCell(f, item[f.key])
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

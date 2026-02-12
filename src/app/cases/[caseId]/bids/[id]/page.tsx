import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntityDetail } from "@/components/entity/entity-detail";
import { getEntityMeta } from "@/config/entity-meta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BidDetailPage({
  params,
}: {
  params: Promise<{ caseId: string; id: string }>;
}) {
  const { caseId, id } = await params;

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { name: true },
  });
  if (!c) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const item: any = await prisma.bid.findUnique({ where: { id } });
  if (!item) notFound();

  const meta = getEntityMeta("bid");
  const basePath = `/cases/${caseId}/bids`;

  return (
    <div>
      <Header
        title={item.title}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: "Anbud & status", href: basePath },
          { label: item.title },
        ]}
      />
      <div className="p-6 space-y-6">
        <EntityDetail
          meta={meta}
          item={item as unknown as Record<string, unknown>}
          editUrl={`${basePath}/${id}/edit`}
          deleteUrl={`/api/cases/${caseId}/bids/${id}`}
          backUrl={basePath}
        />

        {/* Qualification status card */}
        <Card className={item.qualified ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"}>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge className={item.qualified ? "bg-green-600" : "bg-yellow-600"}>
                {item.qualified ? "Kvalificerad" : "Ej kvalificerad"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {item.qualified
                  ? "Anbudet uppfyller formella krav och kvalificeringskrav."
                  : "Anbudet har inte kvalificerats. Redigera för att uppdatera status."}
              </p>
            </div>
            {item.qualificationNotes && (
              <p className="text-sm mt-2 p-2 bg-background rounded border">{item.qualificationNotes}</p>
            )}
            {item.externalRef && (
              <p className="text-xs text-muted-foreground mt-2">
                Extern referens: <span className="font-mono">{item.externalRef}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info about hybrid model */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent>
            <p className="text-sm text-blue-800">
              Detaljerad utvärdering av detta anbud sker i ert upphandlingssystem.
              Övergripande status för hela upphandlingen hanteras under{" "}
              <a href={`/cases/${caseId}/evaluation`} className="underline font-medium">
                Fas C — Genomförande & status
              </a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

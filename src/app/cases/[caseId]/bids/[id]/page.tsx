import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { EntityDetail } from "@/components/entity/entity-detail";
import { getEntityMeta } from "@/config/entity-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const item = await prisma.bid.findUnique({ where: { id } });
  if (!item) notFound();

  // Counts for responses and scores
  const [responseCount, scoreCount, requirementCount, criterionCount] = await Promise.all([
    prisma.bidResponse.count({ where: { caseId, bidId: id } }),
    prisma.score.count({ where: { caseId, bidId: id } }),
    prisma.requirement.count({ where: { caseId } }),
    prisma.criterion.count({ where: { caseId } }),
  ]);

  const meta = getEntityMeta("bid");
  const basePath = `/cases/${caseId}/bids`;

  return (
    <div>
      <Header
        title={item.title}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: meta.pluralLabel, href: basePath },
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

        {/* Evaluation actions */}
        {item.qualified && (
          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold mb-3">Utvärdering</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href={`${basePath}/${id}/responses`}>
                  <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Kravuppfyllelse</span>
                      <span className="text-xs text-muted-foreground">
                        {responseCount}/{requirementCount}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bedöm hur leverantören uppfyller varje krav.
                    </p>
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${requirementCount > 0 ? (responseCount / requirementCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href={`${basePath}/${id}/scores`}>
                  <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Poängsättning</span>
                      <span className="text-xs text-muted-foreground">
                        {scoreCount}/{criterionCount}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sätt poäng per utvärderingskriterium.
                    </p>
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${criterionCount > 0 ? (scoreCount / criterionCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!item.qualified && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent>
              <p className="text-sm text-yellow-800">
                Anbudet är inte kvalificerat. Kvalificera det genom att redigera och markera som kvalificerat.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

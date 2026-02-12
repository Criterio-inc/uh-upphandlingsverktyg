import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { BidScoresForm } from "./scores-form";

export default async function BidScoresPage({
  params,
}: {
  params: Promise<{ caseId: string; id: string }>;
}) {
  const { caseId, id: bidId } = await params;

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { name: true },
  });
  if (!c) notFound();

  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid) notFound();

  // Fetch all criteria for this case
  const criteria = await prisma.criterion.findMany({
    where: { caseId },
    orderBy: { id: "asc" },
    select: {
      id: true,
      title: true,
      weight: true,
      scale: true,
      scoringGuidance: true,
      anchors: true,
    },
  });

  // Fetch existing scores for this bid
  const existingScores = await prisma.score.findMany({
    where: { caseId, bidId },
  });

  return (
    <div>
      <Header
        title={`Poängsättning — ${bid.title}`}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: "Anbud", href: `/cases/${caseId}/bids` },
          { label: bid.title, href: `/cases/${caseId}/bids/${bidId}` },
          { label: "Poängsättning" },
        ]}
      />
      <div className="p-6">
        <BidScoresForm
          caseId={caseId}
          bidId={bidId}
          criteria={criteria}
          existingScores={existingScores as unknown as Record<string, unknown>[]}
        />
      </div>
    </div>
  );
}

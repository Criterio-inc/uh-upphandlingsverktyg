import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { BidResponsesForm } from "./responses-form";

export default async function BidResponsesPage({
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

  // Fetch all requirements for this case
  const requirements = await prisma.requirement.findMany({
    where: { caseId },
    orderBy: { id: "asc" },
    select: { id: true, title: true, level: true, reqType: true, cluster: true },
  });

  // Fetch existing responses for this bid
  const existingResponses = await prisma.bidResponse.findMany({
    where: { caseId, bidId },
  });

  return (
    <div>
      <Header
        title={`Kravuppfyllelse — ${bid.title}`}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: "Anbud", href: `/cases/${caseId}/bids` },
          { label: bid.title, href: `/cases/${caseId}/bids/${bidId}` },
          { label: "Kravuppfyllelse" },
        ]}
      />
      <div className="p-6">
        <BidResponsesForm
          caseId={caseId}
          bidId={bidId}
          requirements={requirements}
          existingResponses={existingResponses as unknown as Record<string, unknown>[]}
        />
      </div>
    </div>
  );
}

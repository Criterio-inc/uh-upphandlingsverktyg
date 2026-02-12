import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EvaluationMatrix } from "./evaluation-matrix";

export default async function EvaluationPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { name: true },
  });
  if (!c) notFound();

  // Fetch all qualified bids
  const bids = await prisma.bid.findMany({
    where: { caseId },
    orderBy: { id: "asc" },
    select: { id: true, title: true, supplierName: true, qualified: true },
  });

  // Fetch all criteria
  const criteria = await prisma.criterion.findMany({
    where: { caseId },
    orderBy: { id: "asc" },
    select: { id: true, title: true, weight: true, scale: true },
  });

  // Fetch all requirements
  const requirements = await prisma.requirement.findMany({
    where: { caseId },
    orderBy: { id: "asc" },
    select: { id: true, title: true, level: true },
  });

  // Fetch all scores
  const scores = await prisma.score.findMany({
    where: { caseId },
  });

  // Fetch all bid responses
  const bidResponses = await prisma.bidResponse.findMany({
    where: { caseId },
  });

  return (
    <div>
      <Header
        title="Utvärdering"
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: "Utvärdering" },
        ]}
      />
      <div className="p-6">
        <EvaluationMatrix
          caseId={caseId}
          bids={bids}
          criteria={criteria}
          requirements={requirements}
          scores={scores as unknown as Record<string, unknown>[]}
          bidResponses={bidResponses as unknown as Record<string, unknown>[]}
        />
      </div>
    </div>
  );
}

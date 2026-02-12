import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EvaluationStatus } from "./evaluation-status";

export const dynamic = "force-dynamic";

export default async function EvaluationPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { name: true, evaluationStatus: true },
  });
  if (!c) notFound();

  // Parse evaluationStatus JSON
  let evalStatus = {};
  try {
    evalStatus = JSON.parse(c.evaluationStatus || "{}");
  } catch {
    evalStatus = {};
  }

  // Count bids
  const [bidCount, qualifiedCount, disqualifiedCount, requirementCount, criterionCount] =
    await Promise.all([
      prisma.bid.count({ where: { caseId } }),
      prisma.bid.count({ where: { caseId, qualified: true } }),
      prisma.bid.count({ where: { caseId, qualified: false } }),
      prisma.requirement.count({ where: { caseId } }),
      prisma.criterion.count({ where: { caseId } }),
    ]);

  return (
    <div>
      <Header
        title="Fas C — Genomförande & status"
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: "Utvärdering" },
        ]}
      />
      <div className="p-6">
        <EvaluationStatus
          caseId={caseId}
          caseName={c.name}
          evaluationStatus={evalStatus}
          bidCount={bidCount}
          qualifiedCount={qualifiedCount}
          disqualifiedCount={disqualifiedCount}
          requirementCount={requirementCount}
          criterionCount={criterionCount}
        />
      </div>
    </div>
  );
}

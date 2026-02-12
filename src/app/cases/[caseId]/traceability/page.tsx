import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TraceabilityDashboard } from "./traceability-dashboard";

export default async function TraceabilityPage({
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

  return (
    <div>
      <Header
        title="Spårbarhet"
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: "Spårbarhet" },
        ]}
      />
      <div className="p-6">
        <TraceabilityDashboard caseId={caseId} />
      </div>
    </div>
  );
}

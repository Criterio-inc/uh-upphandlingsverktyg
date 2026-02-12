import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CaseSettingsForm } from "./settings-form";

export default async function CaseSettingsPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const c = await prisma.case.findUnique({ where: { id: caseId } });
  if (!c) notFound();

  return (
    <div>
      <Header
        title="Inställningar"
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: "Inställningar" },
        ]}
      />
      <div className="max-w-2xl p-6">
        <CaseSettingsForm
          caseId={caseId}
          initialData={{
            name: c.name,
            domainProfile: c.domainProfile,
            orgName: c.orgName,
            procurementType: c.procurementType,
            estimatedValueSek: c.estimatedValueSek,
            owner: c.owner,
            status: c.status,
            currentPhase: c.currentPhase,
            goals: c.goals,
            scopeIn: c.scopeIn,
            scopeOut: c.scopeOut,
            governance: c.governance,
            timeline: c.timeline,
          }}
        />
      </div>
    </div>
  );
}

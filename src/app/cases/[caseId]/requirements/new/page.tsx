import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntityForm } from "@/components/entity/entity-form";
import { getEntityMeta } from "@/config/entity-meta";
import { getClusters } from "@/config/workflow";
import type { DomainProfile } from "@/types/entities";

export default async function NewRequirementPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { name: true, domainProfile: true },
  });
  if (!c) notFound();

  const meta = getEntityMeta("requirement");
  const clusterOptions = getClusters(c.domainProfile as DomainProfile, "requirement");

  return (
    <div>
      <Header
        title={`Nytt ${meta.singularLabel.toLowerCase()}`}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: meta.pluralLabel, href: `/cases/${caseId}/requirements` },
          { label: "Nytt" },
        ]}
      />
      <div className="max-w-2xl p-6">
        <EntityForm
          meta={meta}
          apiUrl={`/api/cases/${caseId}/requirements`}
          returnUrl={`/cases/${caseId}/requirements`}
          clusterOptions={clusterOptions}
          caseId={caseId}
        />
      </div>
    </div>
  );
}

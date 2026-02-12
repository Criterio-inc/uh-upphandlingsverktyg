import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntityForm } from "@/components/entity/entity-form";
import { getEntityMeta } from "@/config/entity-meta";
import { getClusters } from "@/config/workflow";
import type { DomainProfile } from "@/types/entities";

export default async function EditNeedPage({
  params,
}: {
  params: Promise<{ caseId: string; id: string }>;
}) {
  const { caseId, id } = await params;

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { name: true, domainProfile: true },
  });
  if (!c) notFound();

  const item = await prisma.need.findUnique({ where: { id } });
  if (!item) notFound();

  const meta = getEntityMeta("need");
  const clusterOptions = getClusters(c.domainProfile as DomainProfile, "need");
  const basePath = `/cases/${caseId}/needs`;

  return (
    <div>
      <Header
        title={`Redigera ${item.title}`}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: meta.pluralLabel, href: basePath },
          { label: item.title, href: `${basePath}/${id}` },
          { label: "Redigera" },
        ]}
      />
      <div className="max-w-2xl p-6">
        <EntityForm
          meta={meta}
          apiUrl={`/api/cases/${caseId}/needs/${id}`}
          returnUrl={`${basePath}/${id}`}
          initialData={item as unknown as Record<string, unknown>}
          isEdit
          clusterOptions={clusterOptions}
          caseId={caseId}
        />
      </div>
    </div>
  );
}

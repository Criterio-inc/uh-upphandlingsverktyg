import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntityForm } from "@/components/entity/entity-form";
import { getEntityMeta } from "@/config/entity-meta";

export default async function NewEvidencePage({
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

  const meta = getEntityMeta("evidence");

  return (
    <div>
      <Header
        title={`Ny evidens`}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: meta.pluralLabel, href: `/cases/${caseId}/evidence` },
          { label: "Nytt" },
        ]}
      />
      <div className="max-w-2xl p-6">
        <EntityForm
          meta={meta}
          apiUrl={`/api/cases/${caseId}/evidence`}
          returnUrl={`/cases/${caseId}/evidence`}
          caseId={caseId}
        />
      </div>
    </div>
  );
}

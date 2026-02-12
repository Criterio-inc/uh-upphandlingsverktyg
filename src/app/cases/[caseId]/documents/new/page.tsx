import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntityForm } from "@/components/entity/entity-form";
import { getEntityMeta } from "@/config/entity-meta";

export default async function NewDocumentPage({
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

  const meta = getEntityMeta("document");

  return (
    <div>
      <Header
        title={`Ny ${meta.singularLabel.toLowerCase()}`}
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: meta.pluralLabel, href: `/cases/${caseId}/documents` },
          { label: "Ny" },
        ]}
      />
      <div className="max-w-2xl p-6">
        <EntityForm
          meta={meta}
          apiUrl={`/api/cases/${caseId}/documents`}
          returnUrl={`/cases/${caseId}/documents`}
          caseId={caseId}
        />
      </div>
    </div>
  );
}

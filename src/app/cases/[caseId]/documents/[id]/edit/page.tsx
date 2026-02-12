import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntityForm } from "@/components/entity/entity-form";
import { getEntityMeta } from "@/config/entity-meta";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ caseId: string; id: string }>;
}) {
  const { caseId, id } = await params;

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { name: true },
  });
  if (!c) notFound();

  const item = await prisma.document.findUnique({ where: { id } });
  if (!item) notFound();

  const meta = getEntityMeta("document");
  const basePath = `/cases/${caseId}/documents`;

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
          apiUrl={`/api/cases/${caseId}/documents/${id}`}
          returnUrl={`${basePath}/${id}`}
          initialData={item as unknown as Record<string, unknown>}
          isEdit
          caseId={caseId}
        />
      </div>
    </div>
  );
}

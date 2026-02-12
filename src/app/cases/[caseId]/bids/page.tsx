import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EntityList } from "@/components/entity/entity-list";
import { FilterBar } from "@/components/filters/filter-bar";
import { getEntityMeta } from "@/config/entity-meta";
import { findEntities } from "@/lib/entity-helpers";

export default async function BidsPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { caseId } = await params;
  const filters = await searchParams;

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    select: { name: true },
  });
  if (!c) notFound();

  const meta = getEntityMeta("bid");
  const basePath = `/cases/${caseId}/bids`;
  const clusterOptions: string[] = [];

  const filterObj: Record<string, string> = {};
  for (const key of meta.filterFields) {
    if (filters[key]) filterObj[key] = filters[key];
  }

  const items = await findEntities("bid", caseId, filterObj);
  const filterFields = meta.fields.filter((f) => meta.filterFields.includes(f.key));

  return (
    <div>
      <Header
        title="Anbud & status"
        breadcrumbs={[
          { label: "Upphandlingar", href: "/cases" },
          { label: c.name, href: `/cases/${caseId}` },
          { label: "Anbud & status" },
        ]}
        actions={
          <Link href={`${basePath}/new`}>
            <Button>Nytt anbud</Button>
          </Link>
        }
      />
      <div className="p-6 space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-sm text-blue-800">
          Detaljerad anbudsutvärdering sker i ert upphandlingssystem. Här registreras övergripande status för spårbarhet.{" "}
          <a href={`/cases/${caseId}/evaluation`} className="underline font-medium">
            Fas C — Genomförande & status →
          </a>
        </div>
        {filterFields.length > 0 && (
          <FilterBar filters={filterFields} clusterOptions={clusterOptions} />
        )}
        <EntityList meta={meta} items={items} caseId={caseId} basePath={basePath} />
      </div>
    </div>
  );
}

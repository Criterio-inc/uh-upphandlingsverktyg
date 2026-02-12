import Link from "next/link";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CasesPage() {
  const cases: any[] = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const profileLabels: Record<string, string> = {
    generisk_lou: "Generisk LOU",
    avfall_nyanskaffning: "Avfall",
    socialtjanst_byte: "Socialtjänst",
  };

  return (
    <div>
      <Header
        title="Upphandlingar"
        description="Alla pågående och avslutade upphandlingar"
        actions={
          <Link href="/cases/new">
            <Button>Ny upphandling</Button>
          </Link>
        }
      />
      <div className="p-6">
        {cases.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Inga upphandlingar"
            description="Skapa din första upphandling för att komma igång."
            action={
              <Link href="/cases/new">
                <Button>Ny upphandling</Button>
              </Link>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Namn</TableHead>
                <TableHead>Profil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ansvarig</TableHead>
                <TableHead>Uppdaterad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell>
                    <Link href={`/cases/${c.id}`} className="font-medium text-primary hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {profileLabels[c.domainProfile] ?? c.domainProfile}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-sm">{c.owner || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(c.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

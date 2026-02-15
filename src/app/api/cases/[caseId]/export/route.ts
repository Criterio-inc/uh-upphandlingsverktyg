import { NextRequest, NextResponse } from "next/server";
import { exportCaseJson, exportCaseXlsx, toCsv } from "@/lib/export";
import { prisma } from "@/lib/db";
import { requireAuth, requireCaseAccess, requireWriteAccess, logAudit, ApiError } from "@/lib/auth-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;

  try {
    const ctx = await requireAuth();
    await requireCaseAccess(caseId, ctx);

    const format = req.nextUrl.searchParams.get("format") ?? "json";
    const entityType = req.nextUrl.searchParams.get("entity");

    if (format === "json") {
      const data = await exportCaseJson(caseId);
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${caseId}-backup.json"`,
        },
      });
    }

    if (format === "xlsx") {
      const buffer = await exportCaseXlsx(caseId);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${caseId}-export.xlsx"`,
        },
      });
    }

    if (format === "csv" && entityType) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const model = (prisma as any)[entityType];
      if (!model) return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });

      const items = await model.findMany({ where: { caseId } });
      if (items.length === 0) {
        return new NextResponse("", {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${caseId}-${entityType}.csv"`,
          },
        });
      }

      const columns = Object.keys(items[0]);
      const csv = toCsv(items, columns);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${caseId}-${entityType}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Specify format=json, format=xlsx, or format=csv&entity=<type>" }, { status: 400 });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

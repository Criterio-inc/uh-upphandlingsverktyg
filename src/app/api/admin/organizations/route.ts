import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requirePlatformAdmin, ApiError } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/organizations — list all organizations               */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    const ctx = await requireAuth();
    requirePlatformAdmin(ctx);

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            memberships: true,
            cases: true,
            features: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      maxUsers: org.maxUsers,
      memberCount: org._count.memberships,
      caseCount: org._count.cases,
      featureOverrideCount: org._count.features,
      createdAt: org.createdAt.toISOString(),
    }));

    return NextResponse.json({ organizations: result });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    console.error("GET /api/admin/organizations error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/organizations — create a new organization           */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    requirePlatformAdmin(ctx);

    const body = await req.json();
    const { name, slug, plan, maxUsers } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Namn och slug krävs" },
        { status: 400 },
      );
    }

    // Check slug uniqueness
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Slug '${slug}' används redan` },
        { status: 409 },
      );
    }

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        plan: plan ?? "trial",
        maxUsers: maxUsers ?? 5,
      },
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    console.error("POST /api/admin/organizations error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTables } from "@/lib/ensure-tables";
import { requireAuth, requirePlatformAdmin, ApiError } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/users — list all users with memberships & features   */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    const ctx = await requireAuth();
    requirePlatformAdmin(ctx);

    await ensureTables();

    const users = await prisma.user.findMany({
      include: {
        features: true,
        memberships: {
          include: {
            org: { select: { id: true, name: true, slug: true, plan: true } },
          },
        },
      },
      orderBy: [{ isAdmin: "desc" }, { email: "asc" }],
    });

    // Transform to a cleaner shape
    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      imageUrl: u.imageUrl,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt.toISOString(),
      features: Object.fromEntries(
        u.features.map((f) => [f.featureKey, f.enabled]),
      ),
      memberships: u.memberships.map((m) => ({
        orgId: m.org.id,
        orgName: m.org.name,
        orgSlug: m.org.slug,
        orgPlan: m.org.plan,
        role: m.role,
      })),
    }));

    return NextResponse.json({ users: result });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    console.error("GET /api/admin/users error:", e);

    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("no such table")) {
      return NextResponse.json({
        users: [],
        warning: "Databastabellerna för användare har inte skapats ännu. En ny deploy bör lösa detta automatiskt.",
      });
    }

    return NextResponse.json(
      { error: msg },
      { status: 500 },
    );
  }
}

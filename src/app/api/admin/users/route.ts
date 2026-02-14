import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAccess } from "@/lib/user-features";
import { ensureTables } from "@/lib/ensure-tables";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Clerk auth helper                                                   */
/* ------------------------------------------------------------------ */

async function getClerkUserId(): Promise<string | null> {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/admin/users — list all users with features                 */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    const userId = await getClerkUserId();

    // Require admin (with bootstrap fallback for first-time setup)
    if (!userId || !(await checkAdminAccess(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await ensureTables();

    const users = await prisma.user.findMany({
      include: { features: true },
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
    }));

    return NextResponse.json({ users: result });
  } catch (e) {
    console.error("GET /api/admin/users error:", e);

    // Graceful handling if User table doesn't exist yet (migration not applied)
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

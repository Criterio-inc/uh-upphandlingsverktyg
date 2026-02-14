import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createDefaultFeatures, checkAdminAccess } from "@/lib/user-features";
import { ensureTables } from "@/lib/ensure-tables";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "par.levander@criteroconsulting.se";

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
/*  POST /api/admin/sync-users — pull all users from Clerk into DB      */
/* ------------------------------------------------------------------ */

export async function POST() {
  try {
    const callerId = await getClerkUserId();
    if (!callerId || !(await checkAdminAccess(callerId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await ensureTables();

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey || secretKey === "sk_test_REPLACE_ME") {
      return NextResponse.json(
        { error: "CLERK_SECRET_KEY inte konfigurerad" },
        { status: 500 },
      );
    }

    // Fetch all users from Clerk Backend API (paginated)
    const allClerkUsers: Array<{
      id: string;
      email_addresses: Array<{ id: string; email_address: string }>;
      primary_email_address_id: string;
      first_name: string | null;
      last_name: string | null;
      image_url: string;
    }> = [];

    let offset = 0;
    const limit = 100;

    while (true) {
      const res = await fetch(
        `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=-created_at`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Clerk API error:", res.status, text);
        return NextResponse.json(
          { error: `Clerk API svarade med ${res.status}` },
          { status: 502 },
        );
      }

      const users = await res.json();
      if (!Array.isArray(users) || users.length === 0) break;
      allClerkUsers.push(...users);
      if (users.length < limit) break;
      offset += limit;
    }

    // Upsert each user into our DB
    let created = 0;
    let updated = 0;

    for (const cu of allClerkUsers) {
      const primaryEmail =
        cu.email_addresses.find((e) => e.id === cu.primary_email_address_id)
          ?.email_address ??
        cu.email_addresses[0]?.email_address ??
        "";

      const isAdmin = primaryEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const existing = await prisma.user.findUnique({ where: { id: cu.id } });

      await prisma.user.upsert({
        where: { id: cu.id },
        update: {
          email: primaryEmail,
          firstName: cu.first_name ?? "",
          lastName: cu.last_name ?? "",
          imageUrl: cu.image_url ?? "",
          isAdmin,
        },
        create: {
          id: cu.id,
          email: primaryEmail,
          firstName: cu.first_name ?? "",
          lastName: cu.last_name ?? "",
          imageUrl: cu.image_url ?? "",
          isAdmin,
        },
      });

      // Create default features for new users
      if (!existing) {
        await createDefaultFeatures(cu.id);
        created++;
      } else {
        updated++;
      }
    }

    return NextResponse.json({
      message: `Synkade ${allClerkUsers.length} användare (${created} nya, ${updated} uppdaterade)`,
      total: allClerkUsers.length,
      created,
      updated,
    });
  } catch (e) {
    console.error("POST /api/admin/sync-users error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

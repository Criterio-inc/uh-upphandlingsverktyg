import { Webhook } from "svix";
import { prisma } from "@/lib/db";
import { createDefaultFeatures } from "@/lib/user-features";
import { ensureTables } from "@/lib/ensure-tables";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ADMIN_EMAIL = "par.levander@criteroconsulting.se";

/* ------------------------------------------------------------------ */
/*  Clerk webhook event types (subset we handle)                       */
/* ------------------------------------------------------------------ */

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserEventData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserEventData;
}

/* ------------------------------------------------------------------ */
/*  POST /api/webhooks/clerk                                           */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get raw body and headers for verification
  const body = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Verify the webhook signature
  const wh = new Webhook(secret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Ensure User/UserFeature tables exist before handling events
  await ensureTables();

  // Handle events
  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } =
          event.data;

        // Find primary email
        const primaryEmail =
          email_addresses.find((e) => e.id === primary_email_address_id)
            ?.email_address ??
          email_addresses[0]?.email_address ??
          "";

        const isAdmin = primaryEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        await prisma.user.upsert({
          where: { id },
          update: {
            email: primaryEmail,
            firstName: first_name ?? "",
            lastName: last_name ?? "",
            imageUrl: image_url ?? "",
            isAdmin,
          },
          create: {
            id,
            email: primaryEmail,
            firstName: first_name ?? "",
            lastName: last_name ?? "",
            imageUrl: image_url ?? "",
            isAdmin,
          },
        });

        // Create default feature rows for new users
        if (event.type === "user.created") {
          await createDefaultFeatures(id);
        }

        console.log(`Clerk webhook: ${event.type} → user ${id} (${primaryEmail})`);
        break;
      }

      case "user.deleted": {
        const { id } = event.data;
        await prisma.user.delete({ where: { id } }).catch(() => {
          // User might not exist in DB yet — ignore
        });
        console.log(`Clerk webhook: user.deleted → ${id}`);
        break;
      }

      default:
        console.log(`Clerk webhook: unhandled event type "${event.type}"`);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Internal error", { status: 500 });
  }
}

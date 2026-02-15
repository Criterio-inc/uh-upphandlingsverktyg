import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireOrgAdmin, ApiError, logAudit } from "@/lib/auth-guard";
import { validateBody, createInvitationSchema, revokeInvitationSchema } from "@/lib/api-validation";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    requireOrgAdmin(ctx);
    if (!ctx.orgId) return NextResponse.json({ error: "Ingen organisation" }, { status: 400 });

    const rawBody = await req.json();
    const validated = validateBody(createInvitationSchema, rawBody);
    if (!validated.success) return validated.response;
    const { email, role } = validated.data;

    const invitation = await prisma.invitation.create({
      data: {
        orgId: ctx.orgId,
        email: email.toLowerCase().trim(),
        role: role ?? "member",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    await logAudit(ctx, "create", "invitation", invitation.id);

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    requireOrgAdmin(ctx);

    const rawBody = await req.json();
    const validated = validateBody(revokeInvitationSchema, rawBody);
    if (!validated.success) return validated.response;
    const data = validated.data;

    await prisma.invitation.delete({ where: { id: data.invitationId } });

    await logAudit(ctx, "delete", "invitation", data.invitationId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireOrgAdmin, ApiError, logAudit } from "@/lib/auth-guard";
import { validateBody, removeMemberSchema } from "@/lib/api-validation";

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    requireOrgAdmin(ctx);

    const rawBody = await req.json();
    const validated = validateBody(removeMemberSchema, rawBody);
    if (!validated.success) return validated.response;
    const data = validated.data;

    if (data.userId === ctx.userId) return NextResponse.json({ error: "Du kan inte ta bort dig själv" }, { status: 400 });

    await prisma.orgMembership.deleteMany({
      where: { orgId: ctx.orgId, userId: data.userId },
    });

    await logAudit(ctx, "delete", "member", data.userId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return e.toResponse();
    throw e;
  }
}

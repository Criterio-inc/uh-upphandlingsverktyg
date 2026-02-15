import { z } from "zod";
import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  Helper: validate body and return typed result or error response     */
/* ------------------------------------------------------------------ */

export function validateBody<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return {
      success: false,
      response: NextResponse.json(
        { error: "Valideringsfel", issues },
        { status: 400 },
      ),
    };
  }
  return { success: true, data: result.data };
}

/* ------------------------------------------------------------------ */
/*  Case schemas                                                       */
/* ------------------------------------------------------------------ */

export const createCaseSchema = z.object({
  name: z.string().min(1, "Namn krävs").max(500),
  domainProfile: z.string().max(100).optional(),
  orgName: z.string().max(500).optional(),
  procurementType: z.string().max(100).optional(),
  estimatedValueSek: z.number().min(0).optional(),
  timeline: z.record(z.string(), z.unknown()).optional(),
  goals: z.array(z.unknown()).optional(),
  scopeIn: z.array(z.unknown()).optional(),
  scopeOut: z.array(z.unknown()).optional(),
  dependencies: z.array(z.unknown()).optional(),
  governance: z.record(z.string(), z.unknown()).optional(),
  owner: z.string().max(500).optional(),
});

export const updateCaseSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  domainProfile: z.string().max(100).optional(),
  orgName: z.string().max(500).optional(),
  procurementType: z.string().max(100).optional(),
  estimatedValueSek: z.number().min(0).optional(),
  status: z.string().max(50).optional(),
  currentPhase: z.string().max(100).optional(),
  timeline: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  goals: z.union([z.string(), z.array(z.unknown())]).optional(),
  scopeIn: z.union([z.string(), z.array(z.unknown())]).optional(),
  scopeOut: z.union([z.string(), z.array(z.unknown())]).optional(),
  dependencies: z.union([z.string(), z.array(z.unknown())]).optional(),
  governance: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  owner: z.string().max(500).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Minst ett fält måste anges",
});

/* ------------------------------------------------------------------ */
/*  Trace-link schemas                                                 */
/* ------------------------------------------------------------------ */

export const createTraceLinkSchema = z.object({
  fromType: z.string().min(1, "fromType krävs").max(50),
  fromId: z.string().min(1, "fromId krävs").max(50),
  toType: z.string().min(1, "toType krävs").max(50),
  toId: z.string().min(1, "toId krävs").max(50),
  relation: z.string().min(1, "relation krävs").max(100),
  note: z.string().max(2000).optional(),
});

/* ------------------------------------------------------------------ */
/*  Organization schemas                                               */
/* ------------------------------------------------------------------ */

export const createOrgSchema = z.object({
  name: z.string().min(1, "Namn krävs").max(200),
  slug: z.string().min(1, "Slug krävs").max(100).regex(
    /^[a-z0-9-]+$/,
    "Slug får bara innehålla gemener, siffror och bindestreck",
  ),
  plan: z.enum(["trial", "starter", "professional", "enterprise"]).optional(),
  maxUsers: z.number().int().min(-1).max(10000).optional(),
});

export const updateOrgSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  plan: z.enum(["trial", "starter", "professional", "enterprise"]).optional(),
  maxUsers: z.number().int().min(-1).max(10000).optional(),
  settings: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  features: z.record(z.string(), z.boolean()).optional(),
});

/* ------------------------------------------------------------------ */
/*  Feature schemas                                                    */
/* ------------------------------------------------------------------ */

export const updateFeaturesSchema = z.object({
  features: z.record(z.string(), z.boolean()),
});

/* ------------------------------------------------------------------ */
/*  Invitation schemas                                                 */
/* ------------------------------------------------------------------ */

export const createInvitationSchema = z.object({
  email: z.string().email("Ogiltig e-postadress").max(320),
  role: z.enum(["admin", "member", "viewer"]).optional(),
});

export const revokeInvitationSchema = z.object({
  invitationId: z.string().min(1, "invitationId krävs"),
});

export const removeMemberSchema = z.object({
  userId: z.string().min(1, "userId krävs"),
});

/* ------------------------------------------------------------------ */
/*  Assessment schemas                                                 */
/* ------------------------------------------------------------------ */

export const createAssessmentSchema = z.object({
  assessmentTypeSlug: z.string().min(1, "assessmentTypeSlug krävs").max(100),
  name: z.string().min(1, "Namn krävs").max(500),
  description: z.string().max(5000).optional(),
  organizationName: z.string().max(500).optional(),
});

/* ------------------------------------------------------------------ */
/*  Import schemas (lightweight — validates structure, not all fields)  */
/* ------------------------------------------------------------------ */

const importEntitySchema = z.array(z.object({
  id: z.string().optional(),
}).passthrough()).optional();

export const importCaseSchema = z.object({
  needs: importEntitySchema,
  requirements: importEntitySchema,
  risks: importEntitySchema,
  criteria: importEntitySchema,
  stakeholders: importEntitySchema,
  workshops: importEntitySchema,
  evidence: importEntitySchema,
  bids: importEntitySchema,
  decisions: importEntitySchema,
  documents: importEntitySchema,
  traceLinks: z.array(z.object({
    fromType: z.string(),
    fromId: z.string(),
    toType: z.string(),
    toId: z.string(),
    relation: z.string(),
    note: z.string().optional(),
  })).optional(),
}).passthrough();

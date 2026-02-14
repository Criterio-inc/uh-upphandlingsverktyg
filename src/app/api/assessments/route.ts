import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTables } from "@/lib/ensure-tables";
import { getAssessmentConfig } from "@/config/assessments";

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
/*  GET /api/assessments — list all projects for current user           */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const { searchParams } = new URL(request.url);
    const typeSlug = searchParams.get("type");

    // Build where clause
    const where: Record<string, unknown> = { ownerId: userId };
    if (typeSlug) {
      // Find the assessment type by slug first
      const assessmentType = await prisma.assessmentType.findUnique({
        where: { slug: typeSlug },
      });
      if (assessmentType) {
        where.assessmentTypeId = assessmentType.id;
      } else {
        // No type found — return empty
        return NextResponse.json({ projects: [], total: 0 });
      }
    }

    const projects = await prisma.assessmentProject.findMany({
      where,
      include: {
        assessmentType: true,
        sessions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      organizationName: p.organizationName,
      assessmentType: {
        id: p.assessmentType.id,
        slug: p.assessmentType.slug,
        name: p.assessmentType.name,
      },
      sessionCount: p.sessions.length,
      completedSessionCount: p.sessions.filter((s) => s.status === "completed").length,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ projects: result, total: result.length });
  } catch (e) {
    console.error("GET /api/assessments error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("no such table")) {
      return NextResponse.json({ projects: [], total: 0, warning: "Tabeller ej skapade ännu." });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/assessments — create a new assessment project             */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const body = await request.json();
    const { assessmentTypeSlug, name, description, organizationName } = body;

    if (!assessmentTypeSlug || !name) {
      return NextResponse.json(
        { error: "assessmentTypeSlug och name krävs" },
        { status: 400 },
      );
    }

    // Get config for this assessment type
    const config = getAssessmentConfig(assessmentTypeSlug);
    const typeName = config?.name ?? assessmentTypeSlug;
    const typeDescription = config?.description ?? "";

    // Upsert the AssessmentType
    let assessmentType = await prisma.assessmentType.findUnique({
      where: { slug: assessmentTypeSlug },
    });

    if (!assessmentType) {
      assessmentType = await prisma.assessmentType.create({
        data: {
          slug: assessmentTypeSlug,
          name: typeName,
          description: typeDescription,
          config: config ? JSON.stringify({
            questionCount: config.questions.length,
            dimensionCount: config.dimensions.length,
            dimensions: config.dimensions,
          }) : "{}",
        },
      });
    }

    // Create the project
    const project = await prisma.assessmentProject.create({
      data: {
        assessmentTypeId: assessmentType.id,
        ownerId: userId,
        name,
        description: description ?? "",
        organizationName: organizationName ?? "",
      },
      include: {
        assessmentType: true,
      },
    });

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        organizationName: project.organizationName,
        assessmentType: {
          id: project.assessmentType.id,
          slug: project.assessmentType.slug,
          name: project.assessmentType.name,
        },
        sessionCount: 0,
        completedSessionCount: 0,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (e) {
    console.error("POST /api/assessments error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

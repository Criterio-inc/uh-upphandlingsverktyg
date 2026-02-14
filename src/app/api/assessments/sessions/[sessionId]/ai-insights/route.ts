import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTables } from "@/lib/ensure-tables";
import { getAssessmentConfig } from "@/config/assessments";
import { generateFallbackInsights } from "@/lib/assessment-fallback-insights";

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
/*  POST /api/assessments/sessions/[sessionId]/ai-insights              */
/*  Generate AI-powered insights. Requires auth (project owner only).   */
/*  Falls back to locally generated insights if API is unavailable.     */
/* ------------------------------------------------------------------ */

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const { sessionId } = await params;

    // Fetch session with result, project, and assessment type
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        result: true,
        responses: true,
        project: {
          include: { assessmentType: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sessionen hittades inte" }, { status: 404 });
    }

    // Owner check
    if (session.project.ownerId !== userId) {
      return NextResponse.json({ error: "Ingen behörighet" }, { status: 403 });
    }

    if (!session.result) {
      return NextResponse.json(
        { error: "Sessionen måste vara slutförd innan AI-insikter kan genereras" },
        { status: 400 },
      );
    }

    // Get assessment config
    const config = getAssessmentConfig(session.project.assessmentType.slug);
    if (!config) {
      return NextResponse.json(
        { error: "Bedömningstypen saknar konfiguration" },
        { status: 500 },
      );
    }

    // Parse scores
    const scores = JSON.parse(session.result.scores) as Record<
      string,
      { average: number; questionCount: number; answeredCount: number }
    >;

    // Helper: save insights and return response
    const saveAndReturn = async (insights: string, source: "ai" | "fallback") => {
      await prisma.assessmentResult.update({
        where: { id: session.result!.id },
        data: { aiInsights: insights },
      });
      return NextResponse.json({
        aiInsights: insights,
        resultId: session.result!.id,
        source,
      });
    };

    // Check for Anthropic API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // No API key — generate fallback insights
      const fallback = generateFallbackInsights(
        config,
        scores,
        session.result.overall,
        session.result.level,
      );
      return saveAndReturn(fallback, "fallback");
    }

    // --- Build the AI prompt ---

    const maturityLevel = config.maturityLevels.find(
      (ml) => ml.level === session.result!.level,
    );

    // Build per-dimension detail for the prompt
    const dimensionDetails = config.dimensions.map((dim) => {
      const dimScore = scores[dim];
      const dimQuestions = config.questions.filter((q) => q.dimension === dim);

      // Get individual question scores
      const questionDetails = dimQuestions.map((q) => {
        const response = session.responses.find((r) => r.questionId === q.id);
        return `  - "${q.text}": ${response ? response.value : "Ej besvarad"}/5`;
      });

      return `### ${config.dimensionLabels[dim] ?? dim} (Snitt: ${dimScore?.average ?? "N/A"}/5)
${config.dimensionDescriptions[dim] ?? ""}
${questionDetails.join("\n")}`;
    });

    const prompt = `Du är en expert på ${config.name.toLowerCase()} för svenska organisationer. Analysera följande resultat och ge konkreta, handlingsbara insikter på svenska.

## Bedömningstyp
${config.name}: ${config.description}

## Organisation
${session.project.organizationName || "Ej angiven"}

## Övergripande resultat
- Totalpoäng: ${session.result.overall}/5
- Mognadsnivå: ${session.result.level} — ${maturityLevel?.name ?? "Okänd"} (${maturityLevel?.description ?? ""})
- Respondent: ${session.respondentName || "Anonym"}${session.respondentRole ? ` (${session.respondentRole})` : ""}

## Dimensionsresultat
${dimensionDetails.join("\n\n")}

## Instruktioner
Ge en analys med följande struktur (använd markdown):

1. **Sammanfattning** — 2-3 meningar om organisationens övergripande mognad
2. **Styrkor** — Vilka dimensioner/områden som är starkast (med specifika poäng)
3. **Förbättringsområden** — Vilka dimensioner/områden som behöver mest utveckling
4. **Rekommenderade åtgärder** — 3-5 konkreta steg organisationen bör ta, prioriterade
5. **Nästa mognadsnivå** — Vad krävs för att nå nästa nivå?

Var konkret, undvik generella råd. Referera till faktiska poäng och frågor.`;

    // --- Call Anthropic API ---

    try {
      const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
          max_tokens: 2000,
          temperature: 0.7,
          system: `Du är en expert på ${config.name.toLowerCase()} för svenska organisationer. Svara alltid på svenska med tydlig markdown-formatering.`,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorBody = await aiResponse.text();
        console.error("Anthropic API error:", aiResponse.status, errorBody);
        // Fall back to local insights
        const fallback = generateFallbackInsights(
          config,
          scores,
          session.result.overall,
          session.result.level,
        );
        return saveAndReturn(fallback, "fallback");
      }

      const aiData = await aiResponse.json();
      const insights = aiData.content?.[0]?.text ?? "";

      if (!insights) {
        // Empty response — fall back
        const fallback = generateFallbackInsights(
          config,
          scores,
          session.result.overall,
          session.result.level,
        );
        return saveAndReturn(fallback, "fallback");
      }

      return saveAndReturn(insights, "ai");
    } catch (aiError) {
      // Network error or other fetch failure — fall back
      console.error("Anthropic API fetch error:", aiError);
      const fallback = generateFallbackInsights(
        config,
        scores,
        session.result.overall,
        session.result.level,
      );
      return saveAndReturn(fallback, "fallback");
    }
  } catch (e) {
    console.error("POST /api/assessments/sessions/[sessionId]/ai-insights error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

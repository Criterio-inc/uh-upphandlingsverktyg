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
/*  POST /api/assessments/sessions/[sessionId]/ai-insights              */
/*  Generate AI-powered insights. Requires auth (project owner only).   */
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

    // Check for API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI-insikter ej konfigurerade" },
        { status: 503 },
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

    // Get the maturity level info
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

    // Build the prompt
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

    // Call OpenRouter API
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("OpenRouter API error:", aiResponse.status, errorBody);
      return NextResponse.json(
        { error: "AI-tjänsten svarade med fel. Försök igen senare." },
        { status: 502 },
      );
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices?.[0]?.message?.content ?? "";

    if (!insights) {
      return NextResponse.json(
        { error: "AI-tjänsten returnerade inget svar" },
        { status: 502 },
      );
    }

    // Store the insights in the result
    await prisma.assessmentResult.update({
      where: { id: session.result.id },
      data: { aiInsights: insights },
    });

    return NextResponse.json({
      aiInsights: insights,
      resultId: session.result.id,
    });
  } catch (e) {
    console.error("POST /api/assessments/sessions/[sessionId]/ai-insights error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

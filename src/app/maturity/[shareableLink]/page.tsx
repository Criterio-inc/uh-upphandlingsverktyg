import { getDimensionsByType } from "@/config/maturity-dimensions";
import { MaturitySurvey } from "@/components/maturity/maturity-survey";

interface PageProps {
  params: Promise<{ shareableLink: string }>;
}

async function getSession(shareableLink: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(
    `${baseUrl}/api/maturity/session/${shareableLink}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function MaturitySurveyPage({ params }: PageProps) {
  const { shareableLink } = await params;
  const session = await getSession(shareableLink);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Session hittades inte
          </h1>
          <p className="text-gray-600">
            Länken kan vara ogiltig eller har löpt ut.
          </p>
        </div>
      </div>
    );
  }

  const dimensions = getDimensionsByType(
    session.sessionType as "general" | "ai_maturity"
  );

  // Convert existing responses to the format expected by the survey
  const initialResponses: {
    [key: string]: { score: number; notes: string; evidence: string };
  } = {};
  session.responses.forEach(
    (response: {
      dimensionKey: string;
      score: number;
      notes: string;
      evidence: string;
    }) => {
      initialResponses[response.dimensionKey] = {
        score: response.score,
        notes: response.notes,
        evidence: response.evidence,
      };
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {session.sessionType === "ai_maturity"
              ? "AI-mognadsmätning"
              : "Mognadsmätning"}
          </h1>
          <p className="text-gray-600">
            Projekt: <strong>{session.case.name}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Vänligen bedöm organisationens mognad inom följande områden. Dina
            svar är anonyma och kommer att användas för att förbättra
            upphandlingsprocessen.
          </p>
        </div>

        <MaturitySurvey
          sessionId={session.id}
          sessionType={session.sessionType}
          dimensions={dimensions}
          initialResponses={initialResponses}
        />
      </div>
    </div>
  );
}

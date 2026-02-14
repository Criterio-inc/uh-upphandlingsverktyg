"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { AI_MOGNAD_CONFIG } from "@/config/assessments";

const config = AI_MOGNAD_CONFIG;

interface SessionData {
  id: string;
  status: string;
  respondentName: string;
  respondentEmail: string;
  respondentRole: string;
  responses: { questionId: string; value: number }[];
}

type SurveyStep = "intro" | "questions" | "complete";

const LIKERT_LABELS = [
  "Instämmer inte alls",
  "Instämmer i liten utsträckning",
  "Instämmer delvis",
  "Instämmer i stor utsträckning",
  "Instämmer helt",
];

export default function AiMognadmatningSurveyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<SurveyStep>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // Intro form state
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [respondentRole, setRespondentRole] = useState("");

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/assessments/sessions/by-token/${token}`);
      if (!res.ok) throw new Error("Kunde inte ladda enkäten");
      const json = await res.json();
      // API returns { session: {..., responses: {questionId: value}}, project, config }
      const s = json.session;
      setSession({
        id: s.id,
        status: s.status,
        respondentName: s.respondentName,
        respondentEmail: s.respondentEmail,
        respondentRole: s.respondentRole,
        responses: [], // not used after initial load — answers state is used instead
      });

      // Pre-populate answers from existing responses (API returns a map)
      if (s.responses && typeof s.responses === "object") {
        const existing: Record<string, number> = {};
        for (const [questionId, value] of Object.entries(s.responses)) {
          existing[questionId] = value as number;
        }
        setAnswers(existing);
      }

      // Pre-populate respondent info
      if (s.respondentName) setRespondentName(s.respondentName);
      if (s.respondentEmail) setRespondentEmail(s.respondentEmail);
      if (s.respondentRole) setRespondentRole(s.respondentRole);

      // If already completed, go to completion screen
      if (s.status === "completed") {
        setStep("complete");
      } else if (s.status === "in_progress" && s.respondentName) {
        setStep("questions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  async function handleStartSurvey(e: React.FormEvent) {
    e.preventDefault();
    if (!respondentName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/assessments/sessions/by-token/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondentName: respondentName.trim(),
          respondentEmail: respondentEmail.trim(),
          respondentRole: respondentRole.trim(),
          status: "in_progress",
        }),
      });
      if (!res.ok) throw new Error();
      setStep("questions");
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    // Save response to API
    try {
      await fetch(`/api/assessments/sessions/by-token/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, value }),
      });
    } catch {
      // Silently fail -- answer is saved locally
    }

    // Auto-advance after a brief delay — but NOT on the last question
    if (currentQuestion < config.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) =>
          prev < config.questions.length - 1 ? prev + 1 : prev,
        );
      }, 300);
    }
  }

  // Check how many questions are actually answered (including the current click)
  function getUnansweredQuestions(): number[] {
    return config.questions
      .map((q, i) => (answers[q.id] === undefined ? i : -1))
      .filter((i) => i !== -1);
  }

  async function handleComplete() {
    setSaving(true);
    try {
      const res = await fetch(`/api/assessments/sessions/by-token/${token}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      setStep("complete");
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  // --- Loading & Error states ---

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Laddar enkät...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
          <Icon name="alert-triangle" size={28} className="text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Enkäten kunde inte laddas</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          {error || "Kontrollera att länken är korrekt och försök igen."}
        </p>
      </div>
    );
  }

  // --- Intro step ---

  if (step === "intro") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Icon name="scale" size={24} className="text-primary" />
              <span className="text-lg font-semibold tracking-tight text-foreground">Critero</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              {config.name}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {config.questionCount} frågor inom {config.dimensionCount} dimensioner.
              Uppskattad tid: ~15 minuter.
            </p>
          </div>

          {/* Respondent form */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">Innan vi börjar</h2>
            <form onSubmit={handleStartSurvey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Ditt namn <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Förnamn Efternamn"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  E-post <span className="text-xs text-muted-foreground">(valfritt)</span>
                </label>
                <input
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="namn@organisation.se"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Roll <span className="text-xs text-muted-foreground">(valfritt)</span>
                </label>
                <input
                  type="text"
                  value={respondentRole}
                  onChange={(e) => setRespondentRole(e.target.value)}
                  placeholder="t.ex. CTO, AI-ansvarig, Verksamhetschef"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={saving || !respondentName.trim()} className="w-full gap-2">
                  {saving ? "Startar..." : "Starta enkäten"}
                  <Icon name="arrow-right" size={16} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Completion step ---

  if (step === "complete") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Icon name="scale" size={24} className="text-primary" />
            <span className="text-lg font-semibold tracking-tight text-foreground">Critero</span>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 mx-auto mb-6">
            <Icon name="check-circle" size={32} className="text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
            Tack för dina svar!
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
            Din enkät är nu inskickad. Resultaten kommer att sammanställas och analyseras.
          </p>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-xs text-muted-foreground">
              Denna sida kan stängas. Om du vill se dina resultat, kontakta den som skickade enkäten.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Questions step ---

  const question = config.questions[currentQuestion];
  const dimensionLabel = config.dimensionLabels[question.dimension];
  const progress = ((currentQuestion + 1) / config.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === config.questions.length;
  const currentAnswer = answers[question.id];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-violet-600 dark:bg-violet-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-2">
            <Icon name="scale" size={18} className="text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-tight">Critero</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Fråga {currentQuestion + 1} av {config.questions.length}
          </span>
        </div>
      </div>

      {/* Question content */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Dimension tag */}
          <div className="mb-4">
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              {dimensionLabel}
            </span>
          </div>

          {/* Question text */}
          <h2 className="text-xl font-semibold text-foreground mb-8 leading-relaxed">
            {question.text}
          </h2>

          {/* Likert scale */}
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(question.id, value)}
                className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-150 ${
                  currentAnswer === value
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm"
                    : "border-border/60 bg-card hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    currentAnswer === value
                      ? "bg-violet-600 text-white dark:bg-violet-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {value}
                </div>
                <span className={`text-sm ${currentAnswer === value ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {LIKERT_LABELS[value - 1]}
                </span>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="gap-1.5"
            >
              <Icon name="arrow-left" size={14} />
              Föregående
            </Button>

            {currentQuestion === config.questions.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={!allAnswered || saving}
                className="gap-1.5"
              >
                {saving ? "Skickar..." : "Skicka in svar"}
                <Icon name="check" size={14} />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.min(config.questions.length - 1, prev + 1))}
                className="gap-1.5"
              >
                Nästa
                <Icon name="arrow-right" size={14} />
              </Button>
            )}
          </div>

          {/* Answer count + unanswered hint */}
          <div className="mt-4 text-center space-y-1">
            <span className="text-xs text-muted-foreground">
              {answeredCount} av {config.questions.length} frågor besvarade
            </span>
            {currentQuestion === config.questions.length - 1 && !allAnswered && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    const unanswered = getUnansweredQuestions();
                    if (unanswered.length > 0) setCurrentQuestion(unanswered[0]);
                  }}
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Gå till första obesvarade frågan ({config.questions.length - answeredCount} kvar)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

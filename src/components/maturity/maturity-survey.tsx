"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  MaturityDimension,
  MATURITY_LEVELS,
} from "@/config/maturity-dimensions";

interface MaturitySurveyProps {
  sessionId: string;
  sessionType: "general" | "ai_maturity";
  dimensions: MaturityDimension[];
  initialResponses?: {
    [dimensionKey: string]: {
      score: number;
      notes: string;
      evidence: string;
    };
  };
  onComplete?: () => void;
}

export function MaturitySurvey({
  sessionId,
  sessionType,
  dimensions,
  initialResponses = {},
  onComplete,
}: MaturitySurveyProps) {
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [responses, setResponses] = useState<{
    [dimensionKey: string]: { score: number; notes: string; evidence: string };
  }>(initialResponses);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentDimension = dimensions[currentDimensionIndex];

  const updateResponse = (
    dimensionKey: string,
    field: "score" | "notes" | "evidence",
    value: number | string
  ) => {
    setResponses((prev) => ({
      ...prev,
      [dimensionKey]: {
        score: 0,
        notes: "",
        evidence: "",
        ...prev[dimensionKey],
        [field]: value,
      },
    }));
  };

  const saveResponses = async () => {
    setSaving(true);
    try {
      const responsesArray = Object.entries(responses).map(
        ([dimensionKey, data]) => ({
          dimensionKey,
          ...data,
        })
      );

      const response = await fetch(
        `/api/cases/${sessionId.split("-")[0]}/maturity/${sessionId}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: responsesArray }),
        }
      );

      if (response.ok) {
        setSubmitted(true);
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error("Error saving responses:", error);
      alert("Ett fel uppstod när svaren skulle sparas. Försök igen.");
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (currentDimensionIndex < dimensions.length - 1) {
      setCurrentDimensionIndex(currentDimensionIndex + 1);
    }
  };

  const goPrevious = () => {
    if (currentDimensionIndex > 0) {
      setCurrentDimensionIndex(currentDimensionIndex - 1);
    }
  };

  const currentResponse = responses[currentDimension.key] || {
    score: 0,
    notes: "",
    evidence: "",
  };

  const progress = ((currentDimensionIndex + 1) / dimensions.length) * 100;

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Tack för ditt svar!</h2>
        <p className="text-gray-600">
          Dina svar har sparats och kommer att inkluderas i mognadsmätningen.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Dimension {currentDimensionIndex + 1} av {dimensions.length}
          </span>
          <span>{Math.round(progress)}% komplett</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current dimension */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{currentDimension.label}</h2>
          <p className="text-gray-600">{currentDimension.description}</p>
        </div>

        {/* Score selection */}
        <div className="mb-6">
          <Label className="text-base font-semibold mb-3 block">
            Bedöm mognadsgraden (1-5)
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {MATURITY_LEVELS.map((level) => (
              <button
                key={level.score}
                onClick={() =>
                  updateResponse(currentDimension.key, "score", level.score)
                }
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  currentResponse.score === level.score
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl font-bold mb-1">{level.score}</div>
                <div className="text-xs font-semibold text-gray-700">
                  {level.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {level.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Questions guide */}
        {currentDimension.questions.length > 0 && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-sm">Frågor att överväga:</h4>
            <ul className="space-y-2">
              {currentDimension.questions.map((q) => (
                <li key={q.id} className="text-sm">
                  <div className="font-medium text-gray-700">{q.text}</div>
                  {q.guidance && (
                    <div className="text-gray-500 text-xs mt-1">
                      {q.guidance}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <Label htmlFor="notes" className="mb-2 block">
            Anteckningar (valfritt)
          </Label>
          <textarea
            id="notes"
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            placeholder="Lägg till förklaringar eller kommentarer..."
            value={currentResponse.notes}
            onChange={(e) =>
              updateResponse(currentDimension.key, "notes", e.target.value)
            }
          />
        </div>

        {/* Evidence */}
        <div className="mb-6">
          <Label htmlFor="evidence" className="mb-2 block">
            Bevis/underlag (valfritt)
          </Label>
          <textarea
            id="evidence"
            rows={2}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            placeholder="Referera till dokument, processer eller exempel..."
            value={currentResponse.evidence}
            onChange={(e) =>
              updateResponse(currentDimension.key, "evidence", e.target.value)
            }
          />
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goPrevious}
          disabled={currentDimensionIndex === 0}
        >
          Föregående
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={saveResponses} disabled={saving}>
            {saving ? "Sparar..." : "Spara utkast"}
          </Button>

          {currentDimensionIndex < dimensions.length - 1 ? (
            <Button onClick={goNext}>Nästa</Button>
          ) : (
            <Button onClick={saveResponses} disabled={saving}>
              {saving ? "Skickar..." : "Skicka in svar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

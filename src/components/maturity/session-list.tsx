"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MaturitySession {
  id: string;
  name: string;
  sessionType: string;
  shareableLink: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
  responseCount?: number;
  isComplete?: boolean;
}

interface SessionListProps {
  caseId: string;
  sessions: MaturitySession[];
  onRefresh: () => void;
}

export function SessionList({ caseId, sessions, onRefresh }: SessionListProps) {
  const [creatingGeneral, setCreatingGeneral] = useState(false);
  const [creatingAI, setCreatingAI] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const generalSessions = sessions.filter((s) => s.sessionType === "general");
  const aiSessions = sessions.filter((s) => s.sessionType === "ai_maturity");

  const completedGeneral = generalSessions.filter(
    (s) => s.status === "completed" || s.isComplete
  ).length;
  const completedAI = aiSessions.filter(
    (s) => s.status === "completed" || s.isComplete
  ).length;

  const createSession = async (type: "general" | "ai_maturity") => {
    const setLoading = type === "general" ? setCreatingGeneral : setCreatingAI;
    setLoading(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/maturity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionType: type }),
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (shareableLink: string) => {
    const url = `${window.location.origin}/maturity/${shareableLink}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(shareableLink);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("sv-SE");
  };

  return (
    <div className="space-y-6">
      {/* General Maturity Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Mognadsmätning</h3>
            <p className="text-sm text-gray-500 mt-1">
              Allmän organisatorisk mognad
            </p>
          </div>
          <Button
            onClick={() => createSession("general")}
            disabled={creatingGeneral}
          >
            {creatingGeneral ? "Skapar..." : "Ny session"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Sessioner</div>
            <div className="text-2xl font-bold">{generalSessions.length}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Klara</div>
            <div className="text-2xl font-bold">{completedGeneral}</div>
          </div>
        </div>

        {generalSessions.length > 0 ? (
          <div className="space-y-2">
            {generalSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{session.name}</span>
                    {(!session.isComplete && session.responseCount === 0) && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        VARNING!
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Skapad: {formatDate(session.createdAt)}
                    {session.responseCount !== undefined &&
                      ` • ${session.responseCount} svar`}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(session.shareableLink)}
                >
                  {copiedLink === session.shareableLink
                    ? "Kopierad!"
                    : "Kopiera länk"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            Inga sessioner ännu. Skapa en ny session för att börja.
          </div>
        )}
      </Card>

      {/* AI Maturity Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">AI-mognadsmätning</h3>
            <p className="text-sm text-gray-500 mt-1">
              AI-specifik mognad och kapacitet
            </p>
          </div>
          <Button onClick={() => createSession("ai_maturity")} disabled={creatingAI}>
            {creatingAI ? "Skapar..." : "Ny session"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Sessioner</div>
            <div className="text-2xl font-bold">{aiSessions.length}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Klara</div>
            <div className="text-2xl font-bold">{completedAI}</div>
          </div>
        </div>

        {aiSessions.length > 0 ? (
          <div className="space-y-2">
            {aiSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{session.name}</span>
                    {(!session.isComplete && session.responseCount === 0) && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        VARNING!
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Skapad: {formatDate(session.createdAt)}
                    {session.responseCount !== undefined &&
                      ` • ${session.responseCount} svar`}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(session.shareableLink)}
                >
                  {copiedLink === session.shareableLink
                    ? "Kopierad!"
                    : "Kopiera länk"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            Inga sessioner ännu. Skapa en ny session för att börja.
          </div>
        )}
      </Card>
    </div>
  );
}

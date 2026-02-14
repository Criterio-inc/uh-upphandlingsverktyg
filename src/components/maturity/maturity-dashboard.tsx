"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { MaturityRadarChart } from "./maturity-radar-chart";
import { SessionList } from "./session-list";

interface MaturityDashboardProps {
  caseId: string;
}

interface AggregateData {
  sessionCount: number;
  completedCount: number;
  overallScore: number;
  dimensions: Array<{
    key: string;
    label: string;
    description: string;
    avgScore: number;
    responseCount: number;
  }>;
  sessionType: string;
}

export function MaturityDashboard({ caseId }: MaturityDashboardProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [generalData, setGeneralData] = useState<AggregateData | null>(null);
  const [aiData, setAiData] = useState<AggregateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "ai">("general");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sessions
      const sessionsResponse = await fetch(`/api/cases/${caseId}/maturity`);
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      }

      // Fetch aggregated general maturity data
      const generalResponse = await fetch(
        `/api/cases/${caseId}/maturity/aggregate?type=general`
      );
      if (generalResponse.ok) {
        const generalAggregateData = await generalResponse.json();
        setGeneralData(generalAggregateData);
      }

      // Fetch aggregated AI maturity data
      const aiResponse = await fetch(
        `/api/cases/${caseId}/maturity/aggregate?type=ai_maturity`
      );
      if (aiResponse.ok) {
        const aiAggregateData = await aiResponse.json();
        setAiData(aiAggregateData);
      }
    } catch (error) {
      console.error("Error fetching maturity data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [caseId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Laddar mognadsmätning...</div>
      </Card>
    );
  }

  const tabs = [
    {
      id: "general",
      label: "Mognadsmätning",
    },
    {
      id: "ai",
      label: "AI-mognadsmätning",
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as "general" | "ai")}
        />

        <TabPanel active={activeTab === "general"}>
          <div className="space-y-6">
            {generalData && generalData.dimensions.length > 0 ? (
              <>
                <Card className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>Övergripande mognad</CardTitle>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {generalData.overallScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          av 5.0 möjliga
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Baserat på {generalData.sessionCount} session
                      {generalData.sessionCount !== 1 ? "er" : ""}
                    </p>
                  </div>
                  <MaturityRadarChart
                    dimensions={generalData.dimensions}
                    title=""
                    maxScore={5}
                  />
                </Card>
                <SessionList
                  caseId={caseId}
                  sessions={sessions.filter((s) => s.sessionType === "general")}
                  onRefresh={fetchData}
                />
              </>
            ) : (
              <SessionList
                caseId={caseId}
                sessions={sessions.filter((s) => s.sessionType === "general")}
                onRefresh={fetchData}
              />
            )}
          </div>
        </TabPanel>

        <TabPanel active={activeTab === "ai"}>
          <div className="space-y-6">
            {aiData && aiData.dimensions.length > 0 ? (
              <>
                <Card className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>AI-mognad</CardTitle>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {aiData.overallScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          av 5.0 möjliga
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Baserat på {aiData.sessionCount} session
                      {aiData.sessionCount !== 1 ? "er" : ""}
                    </p>
                  </div>
                  <MaturityRadarChart
                    dimensions={aiData.dimensions}
                    title=""
                    maxScore={5}
                  />
                </Card>
                <SessionList
                  caseId={caseId}
                  sessions={sessions.filter((s) => s.sessionType === "ai_maturity")}
                  onRefresh={fetchData}
                />
              </>
            ) : (
              <SessionList
                caseId={caseId}
                sessions={sessions.filter((s) => s.sessionType === "ai_maturity")}
                onRefresh={fetchData}
              />
            )}
          </div>
        </TabPanel>
      </CardContent>
    </Card>
  );
}

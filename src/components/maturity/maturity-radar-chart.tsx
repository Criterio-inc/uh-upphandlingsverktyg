"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface DimensionScore {
  key: string;
  label: string;
  avgScore: number;
  description?: string;
  responseCount?: number;
}

interface MaturityRadarChartProps {
  dimensions: DimensionScore[];
  title?: string;
  maxScore?: number;
}

export function MaturityRadarChart({
  dimensions,
  title = "Mognadsmätning",
  maxScore = 5,
}: MaturityRadarChartProps) {
  // Transform data for recharts
  const chartData = dimensions.map((dim) => ({
    dimension: dim.label,
    score: dim.avgScore,
    fullMark: maxScore,
  }));

  if (dimensions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Ingen data tillgänglig</p>
          <p className="text-gray-400 text-xs mt-1">
            Skapa en session för att börja mäta mognad
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxScore]}
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <Radar
            name="Mognad"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
            formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(1)} / ${maxScore}`, "Poäng"] : ["", ""]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a2e",
          borderRadius: "40px",
          position: "relative",
        }}
      >
        {/* Orange border */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            right: 6,
            bottom: 6,
            borderRadius: "34px",
            border: "8px solid #f97316",
            display: "flex",
          }}
        />
        {/* Trend line chart */}
        <svg
          width="120"
          height="90"
          viewBox="0 0 120 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points="10,70 40,45 65,55 110,15"
            stroke="#f97316"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="10" cy="70" r="8" fill="#f97316" />
          <circle cx="40" cy="45" r="8" fill="#f97316" />
          <circle cx="65" cy="55" r="8" fill="#f97316" />
          <circle cx="110" cy="15" r="8" fill="#f97316" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

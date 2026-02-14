import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Critero Suite — Upphandling, Verktyg & Mognadsmätning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo — trend chart in rounded square */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "#1a1a2e",
            border: "4px solid #f97316",
            marginBottom: 40,
            boxShadow: "0 20px 60px rgba(249, 115, 22, 0.3)",
          }}
        >
          <svg
            width="60"
            height="45"
            viewBox="0 0 120 90"
            fill="none"
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

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: -2,
            }}
          >
            Critero
          </span>
          <span
            style={{
              fontSize: 48,
              fontWeight: 300,
              color: "rgba(249, 115, 22, 0.8)",
              letterSpacing: -1,
            }}
          >
            Suite
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            marginTop: 16,
            fontWeight: 400,
            letterSpacing: 2,
          }}
        >
          Upphandling &middot; Verktyg &middot; Mognadsmätning
        </p>

        {/* Footer */}
        <p
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 16,
            color: "rgba(255,255,255,0.25)",
            fontWeight: 400,
          }}
        >
          criteroconsulting.se
        </p>
      </div>
    ),
    { ...size },
  );
}

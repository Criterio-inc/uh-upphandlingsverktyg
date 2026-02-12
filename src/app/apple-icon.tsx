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
          background: "#fb7232",
          borderRadius: "36px",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <line x1="5" y1="10" x2="27" y2="10" />
            <line x1="16" y1="10" x2="16" y2="24" />
            <line x1="11" y1="24" x2="21" y2="24" />
            <line x1="8" y1="10" x2="8" y2="16" />
            <line x1="24" y1="10" x2="24" y2="16" />
          </g>
          <circle cx="16" cy="8" r="2.2" fill="#fff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

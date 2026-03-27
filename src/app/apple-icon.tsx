import { ImageResponse } from "next/og";

export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 38,
          background: "#1a1a1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#f5f0e8",
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          Prologue
        </span>
      </div>
    ),
    size,
  );
}

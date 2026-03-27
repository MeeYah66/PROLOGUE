import { ImageResponse } from "next/og";

export const size        = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* PenLine — matches the AppNav brand mark */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </div>
    ),
    size,
  );
}

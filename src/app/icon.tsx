import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14181c",
          color: "#f7f1e8",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          fontFamily: "serif",
        }}
      >
        LC
      </div>
    ),
    { ...size },
  );
}

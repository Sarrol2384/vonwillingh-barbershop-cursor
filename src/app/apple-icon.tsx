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
          background: "#1a1a1a",
          color: "#c9a962",
          fontSize: 110,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 16,
          }}
        >
          <div style={{ display: "flex", width: 24, height: 16, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 24, height: 16, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 24, height: 16, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 24, height: 16, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 24, height: 16, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 24, height: 16, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 24, height: 16, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 12, height: 16, background: "#f5f0e8" }} />
        </div>
        V
      </div>
    ),
    { ...size },
  );
}

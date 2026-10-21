import { ImageResponse } from "next/og";

export const alt = "VonWillingh Barbershop — classic cuts in Eerste River";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#1a1a1a",
          color: "#f5f0e8",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 18,
          }}
        >
          <div style={{ display: "flex", width: 80, height: 18, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#c41e3a" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#f5f0e8" }} />
          <div style={{ display: "flex", width: 80, height: 18, background: "#c41e3a" }} />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 6,
            color: "#c9a962",
            textTransform: "uppercase",
          }}
        >
          Professional grooming
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            marginTop: 18,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          VonWillingh
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1,
            color: "#c9a962",
          }}
        >
          Barbershop
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            marginTop: 28,
            color: "#dfc88a",
          }}
        >
          Classic cuts. Modern style.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            marginTop: 36,
            color: "#f5f0e8",
          }}
        >
          {"177 Magdouw Street, Russel's Rest, Eerste River"}
        </div>
      </div>
    ),
    { ...size },
  );
}

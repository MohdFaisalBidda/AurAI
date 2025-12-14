import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const title = "AurAI";
  const description =
    "AurAI is an AI-powered assistant that helps you search and provide information.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #1E293B 0%, #111827 100%)",
          color: "#fff",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 28, opacity: 0.9, marginTop: 12, maxWidth: 1000 }}>
          {description}
        </div>
        <div style={{ marginTop: 32, fontSize: 20, opacity: 0.7 }}>aurai.app</div>
      </div>
    ),
    {
      ...size,
    }
  );
}

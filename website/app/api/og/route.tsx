import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";

function clean(value: string | null, limit: number): string {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clean(searchParams.get("title"), 120) || "Unidoka events";
  const subtitle = clean(searchParams.get("subtitle"), 160);
  const label = clean(searchParams.get("label"), 40) || "Events";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#a3a3a3",
          }}
        >
          <span
            style={{
              display: "block",
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#F17735",
            }}
          />
          Unidoka · {label}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          <div
            style={{
              fontSize: title.length > 70 ? 56 : 68,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.3,
                color: "#a3a3a3",
                maxWidth: "960px",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#737373",
          }}
        >
          <span>unidoka.com</span>
          <span>{label}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, immutable",
      },
    },
  );
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE_TAGLINE, SITE_NAME } from "@/lib/site";

// Shared Open Graph / Twitter card image used when a page is shared socially.
// Built with next/og (Satori) at build time — no binary assets to maintain.

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Embed the logo as a data URL so the generated image is self-contained.
const logoData = readFileSync(join(process.cwd(), "public", "logo.png"));
const LOGO_SRC = `data:image/png;base64,${logoData.toString("base64")}`;

const CHIPS = ["CPU", "GPU", "RAM", "Motherboard", "Storage", "Cooling"];

// The visual layout of the social sharing card.
export function OgImageContent({
  title = SITE_NAME,
  subtitle = SITE_TAGLINE,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0b0f17",
        color: "#e8eef8",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28, borderBottom: "1px solid rgba(140,172,215,0.15)", paddingBottom: 28 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_SRC}
          width={104}
          height={104}
          style={{ borderRadius: 24, border: "1px solid rgba(140,172,215,0.25)" }}
        />
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
          <span style={{ color: "#ffffff" }}>{title.split(" ")[0]}</span>
          <span style={{ color: "#6fa4ff" }}>
            {" "}
            {title.split(" ").slice(1).join(" ")}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", fontSize: 54, fontWeight: 700, color: "#ffffff", lineHeight: 1.1 }}>
          {subtitle}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {CHIPS.map((chip) => (
            <span
              key={chip}
              style={{
                fontSize: 26,
                color: "#cfe0ff",
                border: "1px solid rgba(140,172,215,0.22)",
                borderRadius: 999,
                padding: "8px 20px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
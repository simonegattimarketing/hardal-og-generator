/*
 * Hardal OG image template — the single source of truth for the generated image.
 * Used by both the /api/og route and the live preview.
 * Built with assistance from Claude (Anthropic). See README → "AI assistance".
 */
import React from "react";

// Hardal brand palette (from usehardal.com/brand)
export const BRAND = {
  navy: "#141020",
  purple: "#A082FF",
  green: "#E1FF82",
  white: "#FFFFFF",
  muted: "#A99FC0",
};

export const OG_SIZE = { width: 1200, height: 630 };

// Logo aspect ratio (width / height) of the bundled white logo.
export const LOGO = { ratio: 4.6774, height: 46 };

export type OgParams = {
  title?: string;
  author?: string;
  category?: string;
  date?: string;
};

function titleSize(t: string): number {
  const n = t.length;
  if (n > 95) return 46;
  if (n > 65) return 56;
  if (n > 38) return 66;
  return 78;
}

function fmtDate(d?: string): string {
  if (!d) return "";
  const t = Date.parse(d);
  if (Number.isNaN(t)) return d;
  return new Date(t).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Returns the React element passed to ImageResponse / satori.
// logoSrc: an optional data URL for the Hardal logo; falls back to a wordmark.
export function ogElement(params: OgParams, logoSrc?: string) {
  const title = (params.title || "Untitled post").trim();
  const category = (params.category || "Blog").trim();
  const author = (params.author || "").trim();
  const date = fmtDate(params.date);
  const fSize = titleSize(title);

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: BRAND.navy,
        fontFamily: "Geist",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ambient brand glows */}
      <div
        style={{
          position: "absolute",
          top: "-180px",
          right: "-160px",
          width: "520px",
          height: "520px",
          borderRadius: "9999px",
          backgroundImage:
            "radial-gradient(circle, rgba(160,130,255,0.40) 0%, rgba(160,130,255,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          left: "-140px",
          width: "460px",
          height: "460px",
          borderRadius: "9999px",
          backgroundImage:
            "radial-gradient(circle, rgba(225,255,130,0.22) 0%, rgba(225,255,130,0) 70%)",
        }}
      />

      {/* header: logo + site */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            width={Math.round(LOGO.height * LOGO.ratio)}
            height={LOGO.height}
            alt="Hardal"
            style={{ display: "flex" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "9999px",
                backgroundColor: BRAND.green,
              }}
            />
            <div
              style={{
                marginLeft: "14px",
                fontSize: "34px",
                fontWeight: 700,
                color: BRAND.white,
              }}
            >
              hardal
            </div>
          </div>
        )}
        <div style={{ display: "flex", fontSize: "22px", color: BRAND.muted }}>
          usehardal.com/blog
        </div>
      </div>

      {/* main: category badge + title */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            backgroundColor: BRAND.green,
            color: BRAND.navy,
            padding: "10px 24px",
            borderRadius: "9999px",
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "1px",
            marginBottom: "30px",
          }}
        >
          {category.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: `${fSize}px`,
            fontWeight: 700,
            color: BRAND.white,
            lineHeight: 1.08,
            letterSpacing: "-1px",
            maxWidth: "1000px",
          }}
        >
          {title}
        </div>
      </div>

      {/* footer: author + date */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "24px",
          color: BRAND.muted,
        }}
      >
        {author ? (
          <div style={{ display: "flex", color: BRAND.white }}>{author}</div>
        ) : null}
        {author && date ? (
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "9999px",
              backgroundColor: BRAND.purple,
              margin: "0 16px",
            }}
          />
        ) : null}
        {date ? <div style={{ display: "flex" }}>{date}</div> : null}
      </div>
    </div>
  );
}

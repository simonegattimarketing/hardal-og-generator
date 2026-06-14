/*
 * GET /api/og — generates a 1200x630 Hardal-branded Open Graph image.
 * This is the integration endpoint: point any <meta property="og:image"> at it.
 * Built with assistance from Claude (Anthropic). See README → "AI assistance".
 */
import { ImageResponse } from "next/og";
import { ogElement, OG_SIZE } from "@/app/lib/og-template";

export const runtime = "edge";

// Brand font (Geist) and logo — bundled in the repo so deploys are self-contained.
const fontRegular = fetch(
  new URL("../../fonts/Geist-Regular.ttf", import.meta.url)
).then((r) => r.arrayBuffer());
const fontSemiBold = fetch(
  new URL("../../fonts/Geist-SemiBold.ttf", import.meta.url)
).then((r) => r.arrayBuffer());
const fontBold = fetch(
  new URL("../../fonts/Geist-Bold.ttf", import.meta.url)
).then((r) => r.arrayBuffer());
const logoBytes = fetch(
  new URL("../../og-assets/hardal-logo.png", import.meta.url)
).then((r) => r.arrayBuffer());

// ArrayBuffer -> base64 data URL (edge-safe, no Buffer).
function toPngDataUrl(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return "data:image/png;base64," + btoa(binary);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const params = {
    title: searchParams.get("title") || undefined,
    author: searchParams.get("author") || undefined,
    category: searchParams.get("category") || undefined,
    date: searchParams.get("date") || undefined,
  };

  const [regular, semibold, bold, logo] = await Promise.all([
    fontRegular,
    fontSemiBold,
    fontBold,
    logoBytes,
  ]);

  const logoSrc = toPngDataUrl(logo);

  return new ImageResponse(ogElement(params, logoSrc), {
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    fonts: [
      { name: "Geist", data: regular, weight: 400, style: "normal" },
      { name: "Geist", data: semibold, weight: 600, style: "normal" },
      { name: "Geist", data: bold, weight: 700, style: "normal" },
    ],
    headers: {
      // cache aggressively — the same params always produce the same image
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}

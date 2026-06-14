/*
 * Hardal OG Generator — UI.
 * Form + live preview (single) and CSV upload + ZIP export (batch).
 * Built with assistance from Claude (Anthropic). See README → "AI assistance".
 */
"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import JSZip from "jszip";

type Row = { title: string; author: string; category: string; date: string };

function buildUrl(r: Partial<Row>): string {
  const q = new URLSearchParams();
  if (r.title) q.set("title", r.title);
  if (r.author) q.set("author", r.author);
  if (r.category) q.set("category", r.category);
  if (r.date) q.set("date", r.date);
  return `/api/og?${q.toString()}`;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "untitled"
  );
}

async function downloadBlob(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

export default function Home() {
  const [form, setForm] = useState<Row>({
    title: "Cookieless tracking: why server-side is the new default",
    author: "Berkay Demirbas",
    category: "Server-side",
    date: "2026-06-09",
  });

  const previewUrl = useMemo(() => buildUrl(form), [form]);

  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const set = (k: keyof Row, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleCsv(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsed: Row[] = (res.data as Record<string, string>[])
          .map((raw) => {
            const lower: Record<string, string> = {};
            for (const k of Object.keys(raw))
              lower[k.trim().toLowerCase()] = (raw[k] ?? "").trim();
            return {
              title: lower.title || "",
              author: lower.author || "",
              category: lower.category || "",
              date: lower.date || "",
            };
          })
          .filter((r) => r.title);
        setRows(parsed);
      },
    });
  }

  async function downloadZip() {
    if (!rows.length) return;
    setBusy(true);
    setProgress(0);
    const zip = new JSZip();
    const used: Record<string, number> = {};
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const res = await fetch(buildUrl(r));
      const blob = await res.blob();
      let name = slugify(r.title);
      if (used[name]) name = `${name}-${used[name]++}`;
      else used[name] = 1;
      zip.file(`${name}.png`, blob);
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    const out = await zip.generateAsync({ type: "blob" });
    const href = URL.createObjectURL(out);
    const a = document.createElement("a");
    a.href = href;
    a.download = "hardal-og-images.zip";
    a.click();
    URL.revokeObjectURL(href);
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* header */}
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 rounded-full bg-[#E1FF82]" />
          <span className="text-2xl font-bold">hardal</span>
          <span className="ml-2 text-sm text-[#A99FC0]">OG Image Generator</span>
        </div>
        <a
          href="/sample.csv"
          download
          className="text-sm text-[#A082FF] hover:underline"
        >
          Download sample CSV
        </a>
      </header>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        Generate on-brand Open Graph images
      </h1>
      <p className="mb-10 max-w-2xl text-[#A99FC0]">
        Branded 1200×630 images for every blog post — one at a time or in bulk
        from a CSV. Each image is also available as a plain API endpoint you can
        wire straight into your blog.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* single */}
        <section className="rounded-2xl bg-[#1A1528] p-6">
          <h2 className="mb-4 text-lg font-semibold">Single image</h2>
          <div className="flex flex-col gap-3">
            <Field label="Title">
              <input
                className="ipt"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Author">
                <input
                  className="ipt"
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                />
              </Field>
              <Field label="Category">
                <input
                  className="ipt"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Date">
              <input
                className="ipt"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="2026-06-09"
              />
            </Field>
          </div>

          <p className="mt-5 mb-2 text-xs uppercase tracking-wider text-[#A99FC0]">
            Live preview
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="OG preview"
            className="w-full rounded-lg border border-white/10"
          />

          <div className="mt-4 flex gap-3">
            <button
              className="btn-primary"
              onClick={() =>
                downloadBlob(previewUrl, `${slugify(form.title)}.png`)
              }
            >
              Download PNG
            </button>
            <a className="btn-ghost" href={previewUrl} target="_blank" rel="noreferrer">
              Open API URL
            </a>
          </div>
        </section>

        {/* batch */}
        <section className="rounded-2xl bg-[#1A1528] p-6">
          <h2 className="mb-4 text-lg font-semibold">Batch from CSV</h2>
          <p className="mb-4 text-sm text-[#A99FC0]">
            CSV columns: <code className="text-[#E1FF82]">title, author, category, date</code>.
          </p>
          <label className="btn-ghost inline-block cursor-pointer">
            Choose CSV file
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])}
            />
          </label>

          {rows.length > 0 && (
            <>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-[#A99FC0]">
                  {rows.length} post{rows.length > 1 ? "s" : ""} loaded
                </span>
                <button
                  className="btn-primary"
                  onClick={downloadZip}
                  disabled={busy}
                >
                  {busy ? `Building… ${progress}%` : "Download all (ZIP)"}
                </button>
              </div>
              <div className="mt-4 grid max-h-[420px] grid-cols-2 gap-3 overflow-auto pr-1">
                {rows.map((r, i) => (
                  <div key={i} className="rounded-lg border border-white/10 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildUrl(r)}
                      alt={r.title}
                      loading="lazy"
                      className="w-full rounded"
                    />
                    <p className="mt-1 truncate text-xs text-[#A99FC0]">
                      {r.title}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <footer className="mt-12 text-xs text-[#A99FC0]">
        Official Hardal logo, brand colors and Geist font from usehardal.com/brand.
      </footer>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-[#A99FC0]">
        {label}
      </span>
      {children}
    </label>
  );
}

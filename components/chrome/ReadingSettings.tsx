"use client";
// "Aa" — পড়ার সেটিং: রং (দিন/সেপিয়া/রাত), লেখার মাপ, ফন্ট। ebook app-এর মতো।
// মান localStorage-এ থাকে আর <html>-এর data-theme / data-rsize / data-rfont-এ বসে;
// পরের বার পাতা আঁকার আগেই app/layout.tsx-এর THEME_JS সেগুলো বসিয়ে দেয়।
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getMode, setMode, type ReadMode } from "@/lib/readmode";

const THEMES = [
  { id: "light", label: "দিন" },
  { id: "sepia", label: "সেপিয়া" },
  { id: "dark", label: "রাত" },
] as const;
const SIZES = 5, DEFAULT_SIZE = 2;

type Prefs = { theme: string; size: number; font: "sans" | "serif"; mode: ReadMode };

function read(): Prefs {
  const d = document.documentElement.dataset;
  return { theme: d.theme || "light", size: d.rsize ? Number(d.rsize) : DEFAULT_SIZE, font: d.rfont === "serif" ? "serif" : "sans", mode: getMode() };
}
function save(k: string, v: string | null) {
  try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* private mode */ }
}

export function ReadingSettings() {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState<Prefs>({ theme: "light", size: DEFAULT_SIZE, font: "sans", mode: "scroll" });
  const panel = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (open) setP(read()); }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { const t = e.target as Node; if (!panel.current?.contains(t) && !btn.current?.contains(t)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    const hide = () => setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    window.addEventListener("miu:toc", hide);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", key); window.removeEventListener("miu:toc", hide); };
  }, [open]);

  const d = () => document.documentElement.dataset;
  const setTheme = (t: string) => { d().theme = t; save("theme", t); setP((x) => ({ ...x, theme: t })); };
  const setSize = (n: number) => {
    const s = Math.max(0, Math.min(SIZES - 1, n));
    if (s === DEFAULT_SIZE) { delete d().rsize; save("rsize", null); } else { d().rsize = String(s); save("rsize", String(s)); }
    setP((x) => ({ ...x, size: s }));
  };
  const setFont = (f: Prefs["font"]) => {
    if (f === "serif") d().rfont = "serif"; else delete d().rfont;
    save("rfont", f === "serif" ? "serif" : null);
    setP((x) => ({ ...x, font: f }));
  };

  const pickMode = (m: ReadMode) => { setMode(m); setP((x) => ({ ...x, mode: m })); };

  return (
    <div className="rs">
      <button ref={btn} type="button" className="icon-btn rs-btn" aria-expanded={open} aria-controls="rs-panel" aria-label="পড়ার সেটিং — রং, লেখার মাপ, ফন্ট" title="পড়ার সেটিং" onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true">Aa</span>
      </button>
      {/* body-তে portal — নইলে topbar-এর stacking-এর ভেতরে আটকে মোবাইলের নিচের মেনুর নিচে চাপা পড়ে */}
      {open && createPortal(<>
        <div className="rs-scrim" aria-hidden="true" />
        <div ref={panel} id="rs-panel" className="rs-panel" role="dialog" aria-label="পড়ার সেটিং">
          <span className="rs-grab" aria-hidden="true" />
          <p className="rs-h">পড়ার ধরন</p>
          <div className="rs-modes">
            <button type="button" aria-pressed={p.mode === "scroll"} onClick={() => pickMode("scroll")}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /><path d="M21 9v6m0 0-1.5-1.5M21 15l1.5-1.5" /></svg>
              স্ক্রল করে
            </button>
            <button type="button" aria-pressed={p.mode === "book"} onClick={() => pickMode("book")}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 6.5C10 5 7 4.5 3 5v14c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5zM12 6.5V20" /></svg>
              পাতা উল্টে
            </button>
          </div>

          <p className="rs-h">রং</p>
          <div className="rs-themes">
            {THEMES.map((t) => (
              <button key={t.id} type="button" className={`rs-theme t-${t.id}`} aria-pressed={p.theme === t.id} onClick={() => setTheme(t.id)}>
                <span className="sw" aria-hidden="true">অ</span>{t.label}
              </button>
            ))}
          </div>

          <p className="rs-h">লেখার মাপ</p>
          <div className="rs-size">
            <button type="button" onClick={() => setSize(p.size - 1)} disabled={p.size === 0} aria-label="লেখা ছোট করো"><span style={{ fontSize: 14 }}>অ</span></button>
            <span className="rs-steps" role="meter" aria-label="লেখার মাপ" aria-valuemin={1} aria-valuemax={SIZES} aria-valuenow={p.size + 1}>
              {Array.from({ length: SIZES }, (_, i) => <i key={i} className={i <= p.size ? "on" : undefined} />)}
            </span>
            <button type="button" onClick={() => setSize(p.size + 1)} disabled={p.size === SIZES - 1} aria-label="লেখা বড় করো"><span style={{ fontSize: 22 }}>অ</span></button>
          </div>

          <p className="rs-h">ফন্ট</p>
          <div className="rs-fonts">
            <button type="button" className="f-sans" aria-pressed={p.font === "sans"} onClick={() => setFont("sans")}>সাধারণ</button>
            <button type="button" className="f-serif" aria-pressed={p.font === "serif"} onClick={() => setFont("serif")}>বইয়ের মতো</button>
          </div>
        </div>
      </>, document.body,
      )}
    </div>
  );
}

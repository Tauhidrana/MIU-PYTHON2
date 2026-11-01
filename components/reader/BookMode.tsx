"use client";
// Book mode — অধ্যায়টা screen-মাপের পাতায় ভাগ করে পাতা উল্টে পড়া (ebook app-এর মতো)।
//
// কীভাবে: #main.bookable-এর ভেতরের .flow-কে CSS columns দিয়ে পাতার উচ্চতায় কাটা হয় (globals.css-এর "Book mode" অংশ),
// প্রতিটা column একটা পাতা। এখানে শুধু মাপা হয় কয়টা পাতা হলো, আর .flow-কে পাশে সরিয়ে পাতা দেখানো হয়।
// বড় screen-এ দুটো column পাশাপাশি = বইয়ের খোলা দুই পাতা।
//
// পাতা নম্বর পুরো বই জুড়ে ("পাতা ২৩ / ২৮৮"): এই অধ্যায়ের পাতা সঠিক। যে অধ্যায় এই পর্দার মাপে আগে খোলা হয়েছে
// তার সঠিক পাতা-সংখ্যা মনে থাকে (localStorage "bk-pages"); বাকিগুলো build-এ মাপা লেখার পরিমাণ (weight) থেকে আন্দাজ।
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMode } from "@/lib/readmode";
import { markDone, readLast, saveLast } from "@/lib/progress";
import { bn } from "@/lib/site";

type Props = { slug: string; n: number; head: string; book: string; sids: string[]; chapters: { slug: string; weight: number }[]; prev?: string; next?: string };
type View = { col: number; per: number; total: number };

// এগুলোর উপর tap করলে পাতা উল্টাবে না (link, বাটন, ফর্ম, ভিডিও…)
const NO_TAP = "a, button, input, textarea, select, summary, label, iframe, [contenteditable]";
const START_KEY = "bk-start"; // পরের/আগের অধ্যায়ে গেলে প্রথম না শেষ পাতা থেকে শুরু
const COUNT_KEY = "bk-pages";

// পাতা-সংখ্যা নির্ভর করে পর্দার মাপ, লেখার মাপ আর ফন্টের উপর — এগুলো বদলালে মনে রাখা হিসাব বাদ
function layoutSig() {
  const d = document.documentElement.dataset;
  return `${innerWidth}|${Math.round(innerHeight / 40)}|${d.rsize || ""}|${d.rfont || ""}`;
}
function knownCounts(): Record<string, number> {
  try { const k = JSON.parse(localStorage.getItem(COUNT_KEY) || "null"); return k && k.sig === layoutSig() ? k.c : {}; } catch { return {}; }
}
function rememberCount(slug: string, total: number) {
  try { localStorage.setItem(COUNT_KEY, JSON.stringify({ sig: layoutSig(), c: { ...knownCounts(), [slug]: total } })); } catch { /* private mode */ }
}

function scrollsX(el: Element | null, stop: Element): boolean {
  for (let e = el; e && e !== stop; e = e.parentElement) {
    if (e instanceof HTMLTextAreaElement || e instanceof HTMLInputElement || e instanceof HTMLIFrameElement) return true;
    if (e.scrollWidth > e.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(e).overflowX)) return true;
  }
  return false;
}

export function BookMode({ slug, n, head, book, sids, chapters, prev, next }: Props) {
  const mode = useMode();
  const router = useRouter();
  const [v, setV] = useState<View>({ col: 0, per: 1, total: 1 });
  const api = useRef<{ go: (c: number) => void; step: (d: 1 | -1) => void } | null>(null);

  useEffect(() => {
    if (mode !== "book") return;
    const root = document.documentElement;
    const sheet = document.querySelector<HTMLElement>("#main.bookable");
    const flow = sheet?.querySelector<HTMLElement>(":scope > .flow");
    if (!sheet || !flow) return;

    const end = document.createElement("span");
    end.className = "bk-end";
    end.setAttribute("aria-hidden", "true");
    flow.appendChild(end);

    let PW = 1, per = 1, total = 1, col = 0, anchor: Element | null = null, alive = true;

    const measure = () => {
      per = Math.max(1, parseInt(getComputedStyle(flow).columnCount) || 1);
      PW = sheet.clientWidth / per;
      const x = end.getBoundingClientRect().left - flow.getBoundingClientRect().left;
      total = Math.max(1, Math.floor(x / PW + 0.02) + 1);
      total = Math.ceil(total / per) * per; // দুই পাতার view-তে শেষে ফাঁকা পাতা থাকলেও জোড়া থাকে
      rememberCount(slug, total);
    };
    const pageOf = (el: Element) => {
      const x = el.getBoundingClientRect().left - flow.getBoundingClientRect().left;
      return Math.max(0, Math.min(total - 1, Math.floor(x / PW + 0.02)));
    };
    // এই পাতার প্রথম block — লেখা নতুন করে সাজানো হলে (ফন্ট, মাপ, আনলক, ঘোরানো) এটা যে পাতায় যায় সেখানেই থাকা হয়
    const blocks = () => flow.querySelectorAll(":scope > .book > *, :scope > .book .unlocked > *, :scope > .quick, :scope > .pager");
    const findAnchor = () => {
      for (const el of blocks()) {
        if (el.classList.contains("unlocked")) continue;
        if (pageOf(el) >= col) return el;
      }
      return null;
    };
    const section = () => {
      let cur: string | null = null;
      for (const s of sids) { const el = document.getElementById(s); if (el && pageOf(el) < col + per) cur = s; }
      if (cur) window.dispatchEvent(new CustomEvent("miu:section", { detail: cur }));
    };

    const go = (c: number, animate = true) => {
      col = Math.max(0, Math.min(total - 1, c));
      col -= col % per;
      flow.style.transition = animate ? "" : "none";
      flow.style.transform = `translate3d(${-col * PW}px,0,0)`;
      if (!animate) void flow.offsetWidth;
      flow.style.transition = "";
      anchor = findAnchor();
      setV({ col, per, total });
      const frac = total > per ? col / (total - per) : 0;
      saveLast({ page: slug, frac: +frac.toFixed(4) });
      if (col + per >= total) markDone(slug);
      section();
    };
    const step = (d: 1 | -1) => {
      if (d > 0 && col + per >= total) {
        if (next) { sessionStorage.setItem(START_KEY, `${next}:first`); router.push(`/chapters/${next}`); }
        else go(col);
        return;
      }
      if (d < 0 && col === 0) {
        if (prev) { sessionStorage.setItem(START_KEY, `${prev}:last`); router.push(`/chapters/${prev}`); }
        else go(0);
        return;
      }
      go(col + d * per);
    };
    api.current = { go, step };

    const relayout = () => {
      if (!alive) return;
      measure();
      go(anchor ? pageOf(anchor) : col, false);
    };
    let raf = 0;
    const soon = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(relayout); };

    // প্রথম পাতা: পরের/আগের অধ্যায় থেকে এলে প্রথম/শেষ পাতা → #section link → আগের বার যেখানে থেমেছিল
    measure();
    let start = 0;
    const want = sessionStorage.getItem(START_KEY);
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (want?.startsWith(slug + ":")) { sessionStorage.removeItem(START_KEY); start = want.endsWith(":last") ? total - 1 : 0; }
    else if (target) start = pageOf(target);
    else { const l = readLast(); if (l?.page === slug && l.frac != null) start = Math.round(l.frac * Math.max(0, total - per)); }
    go(start, false);

    // মাপ বদলালে আবার ভাগ করা
    const ro = new ResizeObserver(soon);
    ro.observe(sheet);
    const mo = new MutationObserver((ms) => { if (ms.some((m) => m.target !== flow || m.type === "childList")) soon(); });
    mo.observe(flow, { childList: true, subtree: true, attributes: true, attributeFilter: ["open", "class", "hidden"] });
    flow.addEventListener("load", soon, true);
    document.fonts?.ready.then(soon);
    const onMode = soon; // Aa থেকে মাপ/ফন্ট বদলালে
    const ao = new MutationObserver(onMode);
    ao.observe(root, { attributes: true, attributeFilter: ["data-rsize", "data-rfont"] });

    // keyboard
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (t.closest("input, textarea, select, [contenteditable], .drawer, #rs-panel")) return;
      if (root.classList.contains("no-scroll")) return;
      const k = e.key;
      if (k === "ArrowRight" || k === "PageDown" || (k === " " && !e.shiftKey)) { e.preventDefault(); step(1); }
      else if (k === "ArrowLeft" || k === "PageUp" || (k === " " && e.shiftKey)) { e.preventDefault(); step(-1); }
      else if (k === "Home") { e.preventDefault(); go(0); }
      else if (k === "End") { e.preventDefault(); go(total - 1); }
    };
    document.addEventListener("keydown", onKey);

    // আঙুল: swipe করলে পাতা আঙুলের সাথে সরে; tap — বামে আগের, ডানে পরের, মাঝে মেনু
    let g: { id: number; x: number; y: number; t: number; drag: boolean; noSwipe: boolean; noTap: boolean; dx: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !e.isPrimary) return;
      const t = e.target as Element;
      g = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), drag: false, noSwipe: scrollsX(t, sheet), noTap: !!t.closest(NO_TAP), dx: 0 };
    };
    const onMove = (e: PointerEvent) => {
      if (!g || e.pointerId !== g.id) return;
      let dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.drag) {
        if (g.noSwipe || Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        g.drag = true;
        flow.style.transition = "none";
        try { sheet.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      }
      if ((col === 0 && dx > 0 && !prev) || (col + per >= total && dx < 0 && !next)) dx *= 0.3; // শেষ প্রান্তে টান কম
      g.dx = dx;
      flow.style.transform = `translate3d(${-col * PW + dx}px,0,0)`;
    };
    const onUp = (e: PointerEvent) => {
      if (!g || e.pointerId !== g.id) return;
      const s = g; g = null;
      if (s.drag) {
        flow.style.transition = "";
        const fast = Math.abs(s.dx) / Math.max(1, Date.now() - s.t) > 0.4;
        if (s.dx < -PW * 0.18 || (s.dx < -30 && fast)) step(1);
        else if (s.dx > PW * 0.18 || (s.dx > 30 && fast)) step(-1);
        else go(col);
        return;
      }
      const moved = Math.hypot(e.clientX - s.x, e.clientY - s.y);
      if (s.noTap || moved > 10 || Date.now() - s.t > 500 || String(getSelection() || "")) return;
      const r = sheet.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width;
      if (fx < 0.3) step(-1);
      else if (fx > 0.7) step(1);
      else if (root.dataset.chrome === "shown") delete root.dataset.chrome;
      else root.dataset.chrome = "shown";
    };
    const onCancel = () => { if (g?.drag) { flow.style.transition = ""; go(col); } g = null; };
    const onTouchMove = (e: TouchEvent) => { if (g?.drag) e.preventDefault(); };
    sheet.addEventListener("pointerdown", onDown);
    sheet.addEventListener("pointermove", onMove);
    sheet.addEventListener("pointerup", onUp);
    sheet.addEventListener("pointercancel", onCancel);
    sheet.addEventListener("touchmove", onTouchMove, { passive: false });

    // mouse wheel / trackpad — এক ঝটকায় এক পাতা
    let acc = 0, lock = false, quiet = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const t = e.target as Element;
      for (let el: Element | null = t; el && el !== sheet; el = el.parentElement) {
        if (el.scrollHeight > el.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return;
        if (el.scrollWidth > el.clientWidth + 2 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      }
      e.preventDefault();
      clearTimeout(quiet);
      quiet = window.setTimeout(() => { lock = false; acc = 0; }, 220);
      if (lock) return;
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(acc) > 40) { lock = true; step(acc > 0 ? 1 : -1); acc = 0; }
    };
    sheet.addEventListener("wheel", onWheel, { passive: false });

    // Tab দিয়ে অন্য পাতার link-এ গেলে browser নিজে sheet সরায় — সেটা ফিরিয়ে ঠিক পাতায় যাওয়া
    const onScroll = () => {
      if (!sheet.scrollLeft && !sheet.scrollTop) return;
      sheet.scrollLeft = 0; sheet.scrollTop = 0;
      const a = document.activeElement;
      if (a && flow.contains(a)) go(pageOf(a), false);
    };
    sheet.addEventListener("scroll", onScroll);
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Element;
      if (!flow.contains(t)) return;
      const p = pageOf(t);
      if (p < col || p >= col + per) go(p, false);
    };
    sheet.addEventListener("focusin", onFocusIn);

    // সূচিপত্র / #link → সেই section-এর পাতা
    const toSid = (sid: string) => { const el = document.getElementById(sid); if (el) go(pageOf(el)); };
    const onGoto = (e: Event) => toSid((e as CustomEvent<string>).detail);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a[href^='#']");
      if (!a || !flow.contains(a)) return;
      const id = decodeURIComponent(a.getAttribute("href")!.slice(1));
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      history.replaceState(history.state, "", `#${id}`);
      toSid(id);
    };
    window.addEventListener("miu:goto", onGoto);
    document.addEventListener("click", onClick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect(); mo.disconnect(); ao.disconnect();
      flow.removeEventListener("load", soon, true);
      document.removeEventListener("keydown", onKey);
      sheet.removeEventListener("pointerdown", onDown);
      sheet.removeEventListener("pointermove", onMove);
      sheet.removeEventListener("pointerup", onUp);
      sheet.removeEventListener("pointercancel", onCancel);
      sheet.removeEventListener("touchmove", onTouchMove);
      sheet.removeEventListener("wheel", onWheel);
      sheet.removeEventListener("scroll", onScroll);
      sheet.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("miu:goto", onGoto);
      document.removeEventListener("click", onClick);
      clearTimeout(quiet);
      end.remove();
      flow.style.transform = ""; flow.style.transition = "";
      delete root.dataset.chrome;
      api.current = null;
    };
  }, [mode, slug, sids, prev, next, router]);

  if (mode !== "book") return null;

  // পুরো বইয়ের পাতা নম্বর: জানা অধ্যায়ের সঠিক সংখ্যা, বাকিগুলো জানা অধ্যায়গুলোর গড় অনুপাতে
  const known = { ...knownCounts(), [slug]: v.total };
  let kp = 0, kw = 0;
  for (const c of chapters) if (known[c.slug]) { kp += known[c.slug]; kw += c.weight; }
  const ratio = kp / Math.max(1, kw);
  const count = (i: number) => known[chapters[i].slug] ?? Math.max(1, Math.round(chapters[i].weight * ratio));
  let before = 0, after = 0;
  chapters.forEach((_, i) => { if (i < n - 1) before += count(i); else if (i > n - 1) after += count(i); });
  const first = before + v.col + 1, last = Math.min(before + v.total, first + v.per - 1);
  const grand = before + v.total + after;
  const here = v.per > 1 && last > first ? `${bn(first)}–${bn(last)}` : bn(first);
  const spread = v.per > 1;
  const left = v.total - (v.col + v.per);
  const atStart = v.col === 0 && !prev, atEnd = v.col + v.per >= v.total && !next;

  return (
    <>
      {/* বইয়ের মতো: দুই পাতায় বামে বইয়ের নাম, ডানে অধ্যায়; প্রতিটা পাতার নিচে নিজের নম্বর */}
      {spread && <p className="bk-head l" aria-hidden="true">{book}</p>}
      <p className={`bk-head${spread ? " r" : ""}`} aria-hidden="true">{head}</p>
      <p className={`bk-folio${spread ? " l" : ""}`} aria-hidden="true">{bn(first)}</p>
      {spread && last > first && <p className="bk-folio r" aria-hidden="true">{bn(last)}</p>}
      <button type="button" className="bk-arrow prev" onClick={() => api.current?.step(-1)} disabled={atStart} aria-label={v.col === 0 ? "আগের অধ্যায়" : "আগের পাতা"}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
      </button>
      <button type="button" className="bk-arrow next" onClick={() => api.current?.step(1)} disabled={atEnd} aria-label={v.col + v.per >= v.total ? "পরের অধ্যায়" : "পরের পাতা"}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
      </button>
      <div className="bk-bar" role="group" aria-label="পাতা">
        <p className="bk-where" aria-live="polite">
          <strong>পাতা {here}</strong> / {bn(grand)}
          <span>{left > 0 ? ` · এই অধ্যায়ে আরও ${bn(left)} পাতা` : next ? " · অধ্যায় শেষ, পরের পাতায় পরের অধ্যায়" : " · বইয়ের শেষ"}</span>
        </p>
        <input
          type="range" className="bk-range" min={1} max={v.total} step={1} value={v.col + 1}
          aria-label="এই অধ্যায়ের কোন পাতায় যাবে" aria-valuetext={`পাতা ${bn(first)}`}
          onChange={(e) => api.current?.go(Number(e.target.value) - 1)}
          style={{ ["--p" as string]: `${v.total > 1 ? (v.col / (v.total - 1)) * 100 : 0}%` }}
        />
      </div>
    </>
  );
}

"use client";
// Scroll মোড: উপরের progress bar, শেষ পড়া জায়গা মনে রাখা ও ফিরিয়ে আনা, অধ্যায় শেষ হলে ✓,
// আর এখন কোন section পড়া হচ্ছে সেটা সূচিপত্রকে জানানো ("miu:section")।
// Immersive পড়া: নিচে scroll করলে উপরের bar আর মোবাইলের নিচের মেনু সরে যায় (html[data-chrome="hidden"]),
// একটু উপরে scroll করলে বা অধ্যায়ের শেষে পৌঁছালে ফিরে আসে।
import { useEffect, useRef } from "react";
import { markDone, readLast, saveLast } from "@/lib/progress";
import { useMode } from "@/lib/readmode";

export function ScrollProgress({ slug, sids }: { slug: string; sids: string[] }) {
  const bar = useRef<HTMLSpanElement>(null);
  const mode = useMode();
  const was = useRef(mode);

  useEffect(() => {
    // Book mode-এ পাতা উল্টানো components/reader/BookMode.tsx দেখে; এখানে কিছু না
    const fromBook = was.current === "book";
    was.current = mode;
    if (mode !== "scroll") return;
    let saveAt = 0, lastY = scrollY, hidden = false;
    const root = document.documentElement;
    const chrome = (hide: boolean) => {
      if (hide === hidden) return;
      hidden = hide;
      if (hide) root.dataset.chrome = "hidden"; else delete root.dataset.chrome;
    };
    const onScroll = () => {
      const h = root.scrollHeight - innerHeight;
      const p = h > 0 ? Math.min(1, scrollY / h) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      const dy = scrollY - lastY;
      if (scrollY < 120 || p > 0.985) { chrome(false); lastY = scrollY; }
      else if (dy > 12) { if (!root.classList.contains("no-scroll") && !document.getElementById("rs-panel")) chrome(true); lastY = scrollY; }
      else if (dy < -24) { chrome(false); lastY = scrollY; }
      const now = Date.now();
      if (now - saveAt > 800) {
        saveAt = now;
        saveLast({ page: slug, y: Math.round(scrollY), frac: +p.toFixed(4) });
        if (p > 0.9) markDone(slug);
      }
    };
    // আগের বার যেখানে থেমেছিল — একই tab-এ একবারই, আর #section link দিয়ে এলে না
    try {
      const last = readLast();
      // book mode থেকে স্ক্রলে এলে সবসময় সেই জায়গায়
      if (last?.page === slug && (fromBook || (!location.hash && sessionStorage.getItem("restored") !== slug))) {
        sessionStorage.setItem("restored", slug);
        // শেষ জায়গায় এক লাফে — smooth scroll দিয়ে পুরো অধ্যায় গড়িয়ে যাওয়া না
        const top = last.frac != null ? last.frac * (document.documentElement.scrollHeight - innerHeight) : last.y;
        if (top) scrollTo({ top, behavior: "instant" });
      }
    } catch { /* storage বন্ধ */ }
    lastY = scrollY; // শেষ জায়গায় ফেরার লাফটা "নিচে scroll" ধরা হবে না — bar দেখা যাবে
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const els = sids.map((s) => document.getElementById(s)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) window.dispatchEvent(new CustomEvent("miu:section", { detail: e.target.id })); });
    }, { rootMargin: "-80px 0px -70% 0px" });
    els.forEach((el) => io.observe(el));
    // সূচিপত্র খুললে bar ফিরে আসে
    const onFocus = () => chrome(false);
    window.addEventListener("miu:toc", onFocus);
    // book mode-এ যাওয়ার ঠিক আগে এই জায়গাটা লিখে রাখা, যাতে সেই পাতাটাই খোলে
    const saveNow = () => { saveAt = 0; onScroll(); };
    window.addEventListener("miu:mode-will", saveNow);
    return () => {
      removeEventListener("scroll", onScroll); window.removeEventListener("miu:toc", onFocus); window.removeEventListener("miu:mode-will", saveNow);
      io.disconnect(); delete root.dataset.chrome;
    };
  }, [slug, sids, mode]);

  return <div className="progress" aria-hidden="true"><span ref={bar} /></div>;
}

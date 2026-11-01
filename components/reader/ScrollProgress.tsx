"use client";
// Scroll মোড: উপরের progress bar, শেষ পড়া জায়গা মনে রাখা ও ফিরিয়ে আনা, অধ্যায় শেষ হলে ✓,
// আর এখন কোন section পড়া হচ্ছে সেটা সূচিপত্রকে জানানো ("miu:section")
import { useEffect, useRef } from "react";
import { markDone, readLast, saveLast } from "@/lib/progress";

export function ScrollProgress({ slug, sids }: { slug: string; sids: string[] }) {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let saveAt = 0;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      const p = h > 0 ? Math.min(1, scrollY / h) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
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
      if (last?.page === slug && !location.hash && sessionStorage.getItem("restored") !== slug) {
        sessionStorage.setItem("restored", slug);
        // শেষ জায়গায় এক লাফে — smooth scroll দিয়ে পুরো অধ্যায় গড়িয়ে যাওয়া না
        const top = last.frac != null ? last.frac * (document.documentElement.scrollHeight - innerHeight) : last.y;
        if (top) scrollTo({ top, behavior: "instant" });
      }
    } catch { /* storage বন্ধ */ }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const els = sids.map((s) => document.getElementById(s)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) window.dispatchEvent(new CustomEvent("miu:section", { detail: e.target.id })); });
    }, { rootMargin: "-80px 0px -70% 0px" });
    els.forEach((el) => io.observe(el));
    return () => { removeEventListener("scroll", onScroll); io.disconnect(); };
  }, [slug, sids]);

  return <div className="progress" aria-hidden="true"><span ref={bar} /></div>;
}

"use client";
// পড়ার ধরন: "scroll" (উপর-নিচ) বা "book" (পাতা উল্টে)। <html data-mode="book">-এ থাকে, localStorage "rmode"-এ মনে থাকে;
// পাতা আঁকার আগেই app/layout.tsx-এর THEME_JS বসিয়ে দেয়। বদলালে "miu:mode" event যায়।
import { useEffect, useState } from "react";

export type ReadMode = "scroll" | "book";

export const getMode = (): ReadMode => (document.documentElement.dataset.mode === "book" ? "book" : "scroll");

export function setMode(m: ReadMode) {
  window.dispatchEvent(new Event("miu:mode-will")); // বদলানোর আগে — স্ক্রল মোড ঠিক এই জায়গাটা লিখে রাখে
  const d = document.documentElement.dataset;
  if (m === "book") d.mode = "book"; else delete d.mode;
  delete d.chrome;
  try { if (m === "book") localStorage.setItem("rmode", "book"); else localStorage.removeItem("rmode"); } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent("miu:mode", { detail: m }));
}

// mount-এর আগে null — server আর প্রথম client render একই থাকে
export function useMode(): ReadMode | null {
  const [m, setM] = useState<ReadMode | null>(null);
  useEffect(() => {
    setM(getMode());
    const on = () => setM(getMode());
    window.addEventListener("miu:mode", on);
    return () => window.removeEventListener("miu:mode", on);
  }, []);
  return m;
}

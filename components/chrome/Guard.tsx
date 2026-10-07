"use client";
// কপি থেকে নিরুৎসাহিত করা (deterrence) — আসল তালা না: যে কেউ চাইলে browser-এর অন্য পথে লেখা নিতে পারে।
// লেখা select করা যায় (highlight-এর জন্য), কিন্তু clipboard-এ যায় শুধু কপিরাইট নোটিশ।
// Form-এর ঘর, কোড রানারের editor আর কোড ব্লকের "কপি" বাটন (navigator.clipboard) স্বাভাবিকভাবে কাজ করে।
// Screenshot আটকানো কোনো website-এর পক্ষে সম্ভব না, তাই সে চেষ্টা এখানে নেই।
import { useEffect, useState } from "react";

const NOTICE = "© Kazi Tauhid Rana — Application Development Using Python। সর্বস্বত্ব সংরক্ষিত। কপি করা কপিরাইট আইন, ২০২৩ অনুযায়ী দণ্ডনীয় অপরাধ।";
const isField = (t: EventTarget | null) => t instanceof Element && !!t.closest("input, textarea, select, [contenteditable=true]");

export function Guard() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const toast = (m = "কপি করা নিষেধ — © কপিরাইট সংরক্ষিত") => {
      setMsg(m); clearTimeout(timer); timer = setTimeout(() => setMsg(""), 2600);
    };
    const touch = matchMedia("(pointer: coarse)").matches;
    const onMenu = (e: MouseEvent) => {
      if (isField(e.target)) return;
      e.preventDefault();
      toast(`${touch ? "Long press" : "Right click"} বন্ধ করা আছে — © কপিরাইট সংরক্ষিত`);
    };
    const onCopy = (e: ClipboardEvent) => {
      if (isField(e.target) || isField(document.activeElement)) return;
      e.preventDefault();
      e.clipboardData?.setData("text/plain", NOTICE);
      toast();
    };
    const onDrag = (e: DragEvent) => { if (!isField(e.target)) e.preventDefault(); };
    const onKey = (e: KeyboardEvent) => {
      const k = (e.key || "").toLowerCase(), mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (k === "p") { e.preventDefault(); toast("প্রিন্ট করা নিষেধ — © কপিরাইট সংরক্ষিত"); return; }
      if (k === "s") { e.preventDefault(); toast("Save করা নিষেধ — © কপিরাইট সংরক্ষিত"); return; }
      if ((k === "c" || k === "x") && !isField(e.target)) { e.preventDefault(); toast(); }
    };
    const onPrint = () => toast("প্রিন্ট করা নিষেধ — © কপিরাইট সংরক্ষিত");
    document.addEventListener("contextmenu", onMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("beforeprint", onPrint);
    return () => {
      document.removeEventListener("contextmenu", onMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("beforeprint", onPrint);
    };
  }, []);
  return <div className={`toast${msg ? " show" : ""}`} role="status" aria-live="polite">{msg}</div>;
}
